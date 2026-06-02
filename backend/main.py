from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timedelta
import bcrypt
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
import os
import shutil
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ----------------- Auth Setup -----------------
SECRET_KEY = "your-secret-key-for-jwt" # In production, use env variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ----------------- Database Setup -----------------
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'events.db')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------- SQLAlchemy Models -----------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    company_name = Column(String)
    role = Column(String) # "Organizer" or "Vendor"
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    # Relationships
    events = relationship("Event", back_populates="organizer")
    bookings = relationship("StallBooking", back_populates="vendor")
    messages = relationship("ChatMessage", foreign_keys="ChatMessage.user_id", back_populates="user")
    pitches = relationship("Pitch", back_populates="vendor")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    date = Column(String)
    total_stalls = Column(Integer)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    standard_price = Column(Float, default=0.0)
    premium_price = Column(Float, default=0.0)
    # JSON array string of stall numbers designated as Premium, e.g. "[1,3,5]"
    premium_stall_ids = Column(String, default="[]")

    organizer = relationship("User", back_populates="events")
    bookings = relationship("StallBooking", back_populates="event")
    pitches = relationship("Pitch", back_populates="event")

class StallBooking(Base):
    __tablename__ = "stall_bookings"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    stall_number = Column(Integer)
    vendor_id = Column(Integer, ForeignKey("users.id"))

    event = relationship("Event", back_populates="bookings")
    vendor = relationship("User", back_populates="bookings")

class Pitch(Base):
    __tablename__ = "pitches"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    vendor_id = Column(Integer, ForeignKey("users.id"))
    stall_type = Column(String, default="Standard")
    stall_number = Column(Integer, nullable=True)
    offered_price = Column(Float)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="pitches")
    vendor = relationship("User", back_populates="pitches")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="messages")
    
class Follow(Base):
    __tablename__ = "follows"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    vendor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class VendorMedia(Base):
    __tablename__ = "vendor_media"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"))
    media_url = Column(String)
    media_type = Column(String, default="image") # "image" or "video"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    likes = relationship("MediaLike", back_populates="media", cascade="all, delete-orphan")

class MediaLike(Base):
    __tablename__ = "media_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    media_id = Column(Integer, ForeignKey("vendor_media.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    media = relationship("VendorMedia", back_populates="likes")

Base.metadata.create_all(bind=engine)

# ----------------- Pydantic Schemas -----------------
class UserCreate(BaseModel):
    email: str
    password: str
    company_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    company_name: str
    role: str
    is_verified: bool = False
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    company_name: Optional[str] = None
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    company_name: str

class EventBase(BaseModel):
    name: str
    date: str
    total_stalls: int
    standard_price: float = 0.0
    premium_price: float = 0.0
    premium_stall_ids: str = "[]"

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    organizer_id: int
    model_config = ConfigDict(from_attributes=True)

class StallBookingBase(BaseModel):
    event_id: int
    stall_number: Optional[int] = None

class StallBookingCreate(StallBookingBase):
    pass

class StallBookingResponse(StallBookingBase):
    id: int
    vendor_id: int
    vendor_name: Optional[str] = None
    image_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PitchBase(BaseModel):
    event_id: int
    stall_type: str
    stall_number: Optional[int] = None
    offered_price: float

class PitchCreate(PitchBase):
    pass

class PitchUpdate(BaseModel):
    offered_price: Optional[float] = None
    status: Optional[str] = None

class PitchResponse(PitchBase):
    id: int
    vendor_id: int
    status: str
    vendor_name: Optional[str] = None
    event_name: Optional[str] = None
    organizer_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class ChatMessageBase(BaseModel):
    text: str

class ChatMessageCreate(ChatMessageBase):
    event_id: int
    receiver_id: int

class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: int
    receiver_id: int
    event_id: int
    sender: Optional[str] = None # For UI
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class InboxItem(BaseModel):
    event_id: int
    event_name: str
    vendor_id: int
    vendor_name: str
    other_user_id: int
    other_user_name: str

class MediaItemResponse(BaseModel):
    id: int
    media_url: str
    media_type: str
    created_at: datetime
    like_count: int
    is_liked_by_me: bool
    model_config = ConfigDict(from_attributes=True)

class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    is_unlocked: bool

class VendorProfileResponse(BaseModel):
    id: int
    company_name: str
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None
    follower_count: int
    is_followed_by_me: bool
    total_likes: int
    badges: List[BadgeResponse]
    media: List[MediaItemResponse]
    role: str
    model_config = ConfigDict(from_attributes=True)

class MediaLinkCreate(BaseModel):
    media_url: str
    media_type: str

# ----------------- Auth Utilities -----------------
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode('utf-8')
    try:
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        print(f"[AUTH ERROR] Verification failed: {e}")
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# ----------------- FastAPI App Setup -----------------
app = FastAPI(title="Festopiya Backend API")

os.makedirs("static/events", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://festopiya.vercel.app",
        "https://festopiya-8mcxewwb0-wxhxxds-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Auth Endpoints -----------------
# Email config — replace with real SMTP creds or use Gmail App Password
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Detect placeholder values so we don't attempt a doomed SMTP connection
_PLACEHOLDER_CREDS = {"yourapp@gmail.com", "your-gmail-app-password", ""}

def send_verification_email(email: str, token: str):
    """Send verification email. ALWAYS prints the link to the uvicorn console."""
    link = f"{FRONTEND_URL}/verify-email?token={token}"

    # Always print so devs can copy-paste the link regardless of SMTP config
    print(f"\n{'='*60}")
    print(f"[FESTOPIYA] Verification link for {email}:")
    print(f"  {link}")
    print(f"{'='*60}\n")

    # Only attempt real email if non-placeholder creds are set
    if SMTP_USER in _PLACEHOLDER_CREDS or SMTP_PASS in _PLACEHOLDER_CREDS:
        print("[EMAIL] SMTP not configured — using console link above.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Verify your Festopiya account"
        msg["From"] = SMTP_USER
        msg["To"] = email
        html = f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;border-radius:16px;color:#fff">
          <img src="{FRONTEND_URL}/logo.png" alt="Festopiya" style="height:48px;margin-bottom:24px" />
          <h2 style="color:#a78bfa">Confirm your email address</h2>
          <p style="color:#aaa">Click the button below to activate your Festopiya account.</p>
          <a href="{link}" style="display:inline-block;margin-top:16px;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;border-radius:12px;text-decoration:none;font-weight:bold">Verify Email</a>
          <p style="color:#555;margin-top:24px;font-size:12px">If you didn't sign up, you can ignore this email.</p>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, email, msg.as_string())
        print(f"[EMAIL] Sent verification email to {email}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

@app.get("/dev/verify-token")
def dev_get_token(email: str, db: Session = Depends(get_db)):
    """DEV ONLY: returns the raw verification token for a given email so you can test without SMTP."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.verification_token:
        return {"message": "User is already verified or has no pending token."}
    link = f"{FRONTEND_URL}/verify-email?token={user.verification_token}"
    return {"email": email, "verification_link": link}

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        company_name=user.company_name,
        role=user.role,
        is_verified=True,
        verification_token=None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully! You can now log in."}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "company_name": user.company_name}

# ----------------- Protected API Endpoints -----------------

@app.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.company_name is not None:
        current_user.company_name = user_update.company_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.instagram_url is not None:
        current_user.instagram_url = user_update.instagram_url
    if user_update.website_url is not None:
        current_user.website_url = user_update.website_url
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar", response_model=UserResponse)
def upload_user_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    os.makedirs("static/uploads", exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Only PNG, JPG, JPEG, and WEBP formats are supported for profile pictures")
        
    unique_filename = f"avatar_{current_user.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
    file_location = f"static/uploads/{unique_filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    avatar_url = f"http://127.0.0.1:8000/static/uploads/{unique_filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/events/", response_model=EventResponse)
def create_event(
    name: str = Form(...),
    date: str = Form(...),
    total_stalls: int = Form(...),
    standard_price: float = Form(0.0),
    premium_price: float = Form(0.0),
    premium_stall_ids: str = Form("[]"),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "Organizer":
        raise HTTPException(status_code=403, detail="Only organizers can create events")
        
    db_event = Event(
        name=name, date=date, total_stalls=total_stalls,
        organizer_id=current_user.id,
        standard_price=standard_price, premium_price=premium_price,
        premium_stall_ids=premium_stall_ids
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    if image:
        os.makedirs("static/events", exist_ok=True)
        file_location = f"static/events/{db_event.id}_{image.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(image.file, file_object)
            
    return db_event

@app.get("/events/")
def get_all_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = db.query(Event).offset(skip).limit(limit).all()
    result = []
    
    try:
        files = os.listdir("static/events")
    except FileNotFoundError:
        files = []
        
    for event in events:
        event_dict = {
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "total_stalls": event.total_stalls,
            "organizer_id": event.organizer_id,
            "standard_price": event.standard_price or 0.0,
            "premium_price": event.premium_price or 0.0,
            "premium_stall_ids": event.premium_stall_ids or "[]",
            "image_url": None
        }
        for f in files:
            if f.startswith(f"{event.id}_"):
                event_dict["image_url"] = f"http://127.0.0.1:8000/static/events/{f}"
                break
        result.append(event_dict)
        
    return result

@app.post("/bookings/", response_model=StallBookingResponse)
def book_stall(
    event_id: int = Form(...),
    stall_number: int = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "Vendor":
        raise HTTPException(status_code=403, detail="Only vendors can book stalls")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if stall_number <= 0 or stall_number > event.total_stalls:
        raise HTTPException(status_code=400, detail=f"Invalid stall number. Must be between 1 and {event.total_stalls}")

    existing_booking = db.query(StallBooking).filter(
        StallBooking.event_id == event_id,
        StallBooking.stall_number == stall_number
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="This stall is already booked for this event.")
        
    db_booking = StallBooking(
        event_id=event_id,
        stall_number=stall_number,
        vendor_id=current_user.id
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    if image:
        os.makedirs("static/bookings", exist_ok=True)
        file_location = f"static/bookings/{db_booking.id}_{image.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(image.file, file_object)
        db_booking.image_url = f"http://127.0.0.1:8000/static/bookings/{db_booking.id}_{image.filename}"
    
    db_booking.vendor_name = current_user.company_name
    return db_booking

@app.get("/bookings/", response_model=List[StallBookingResponse])
def get_all_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Vendors only see their own bookings; Organizers see all
    if current_user.role == "Vendor":
        bookings = db.query(StallBooking).filter(StallBooking.vendor_id == current_user.id).offset(skip).limit(limit).all()
    else:
        bookings = db.query(StallBooking).offset(skip).limit(limit).all()
    try:
        files = os.listdir("static/bookings")
    except FileNotFoundError:
        files = []
    for b in bookings:
        if b.vendor:
            b.vendor_name = b.vendor.company_name
        for f in files:
            if f.startswith(f"{b.id}_"):
                b.image_url = f"http://127.0.0.1:8000/static/bookings/{f}"
                break
    return bookings

@app.get("/events/{event_id}/bookings", response_model=List[StallBookingResponse])
def get_event_bookings(event_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    bookings = db.query(StallBooking).filter(StallBooking.event_id == event_id).offset(skip).limit(limit).all()
    try:
        files = os.listdir("static/bookings")
    except FileNotFoundError:
        files = []
    for b in bookings:
        if b.vendor:
            b.vendor_name = b.vendor.company_name
        for f in files:
            if f.startswith(f"{b.id}_"):
                b.image_url = f"http://127.0.0.1:8000/static/bookings/{f}"
                break
    return bookings

# ----------------- Pitch Endpoints -----------------
@app.post("/pitches/", response_model=PitchResponse)
def create_pitch(
    pitch: PitchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Vendor":
        raise HTTPException(status_code=403, detail="Only vendors can create pitches")
    event = db.query(Event).filter(Event.id == pitch.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check for existing pitch by this vendor for this event
    existing = db.query(Pitch).filter(
        Pitch.event_id == pitch.event_id,
        Pitch.vendor_id == current_user.id
    ).first()
    if existing:
        existing.stall_type = pitch.stall_type
        existing.offered_price = pitch.offered_price
        existing.status = "Pending"
        db.commit()
        db.refresh(existing)
        existing.vendor_name = current_user.company_name
        existing.event_name = event.name
        return existing

    db_pitch = Pitch(
        event_id=pitch.event_id,
        vendor_id=current_user.id,
        stall_type=pitch.stall_type,
        stall_number=pitch.stall_number,
        offered_price=pitch.offered_price,
        status="Pending"
    )
    db.add(db_pitch)
    db.commit()
    db.refresh(db_pitch)
    db_pitch.vendor_name = current_user.company_name
    db_pitch.event_name = event.name
    return db_pitch

@app.put("/pitches/{pitch_id}", response_model=PitchResponse)
def update_pitch(
    pitch_id: int,
    pitch_update: PitchUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pitch = db.query(Pitch).filter(Pitch.id == pitch_id).first()
    if not pitch:
        raise HTTPException(status_code=404, detail="Pitch not found")
    
    event = db.query(Event).filter(Event.id == pitch.event_id).first()
    is_vendor = current_user.id == pitch.vendor_id
    is_organizer = event and current_user.id == event.organizer_id
    if not is_vendor and not is_organizer:
        raise HTTPException(status_code=403, detail="Not authorized to update this pitch")
    
    if pitch_update.offered_price is not None:
        pitch.offered_price = pitch_update.offered_price
    if pitch_update.status is not None:
        pitch.status = pitch_update.status
        if pitch.status == "Accepted":
            # Automatically create a booking when pitch is accepted
            existing_booking = db.query(StallBooking).filter(
                StallBooking.event_id == pitch.event_id,
                StallBooking.stall_number == pitch.stall_number
            ).first()
            if not existing_booking:
                db_booking = StallBooking(
                    event_id=pitch.event_id,
                    vendor_id=pitch.vendor_id,
                    stall_number=pitch.stall_number
                )
                db.add(db_booking)
        
    db.commit()
    db.refresh(pitch)
    if pitch.vendor:
        pitch.vendor_name = pitch.vendor.company_name
    if pitch.event:
        pitch.event_name = pitch.event.name
        pitch.organizer_id = pitch.event.organizer_id
    return pitch

@app.get("/pitches/", response_model=List[PitchResponse])
def get_pitches(
    event_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Pitch)
    if current_user.role == "Vendor":
        query = query.filter(Pitch.vendor_id == current_user.id)
    elif event_id:
        query = query.filter(Pitch.event_id == event_id)
    pitches = query.all()
    for p in pitches:
        if p.vendor:
            p.vendor_name = p.vendor.company_name
        if p.event:
            p.event_name = p.event.name
            p.organizer_id = p.event.organizer_id
        # The stall_number is already in the object, but pydantic will handle it
    return pitches

@app.get("/pitches/for-chat", response_model=Optional[PitchResponse])
def get_pitch_for_chat(
    event_id: int,
    vendor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    v_id = vendor_id if vendor_id else current_user.id
    pitch = db.query(Pitch).filter(
        Pitch.event_id == event_id,
        Pitch.vendor_id == v_id
    ).first()
    if not pitch:
        return None
    if pitch.vendor:
        pitch.vendor_name = pitch.vendor.company_name
    if pitch.event:
        pitch.event_name = pitch.event.name
    return pitch

@app.get("/messages/inbox", response_model=List[InboxItem])
def get_inbox(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = db.query(ChatMessage).filter(
        (ChatMessage.user_id == current_user.id) | (ChatMessage.receiver_id == current_user.id)
    ).all()
    
    inbox = []
    seen = set()
    for m in messages:
        if current_user.role == "Vendor":
            vendor_id = current_user.id
            other_id = m.receiver_id if m.user_id == current_user.id else m.user_id
        else:
            vendor_id = m.user_id if m.user_id != current_user.id else m.receiver_id
            other_id = vendor_id

        key = (m.event_id, vendor_id)
        if key not in seen:
            seen.add(key)
            vendor = db.query(User).filter(User.id == vendor_id).first()
            other_user = db.query(User).filter(User.id == other_id).first()
            event = db.query(Event).filter(Event.id == m.event_id).first()
            if vendor and event and other_user:
                inbox.append({
                    "event_id": event.id,
                    "event_name": event.name,
                    "vendor_id": vendor.id,
                    "vendor_name": vendor.company_name,
                    "other_user_id": other_user.id,
                    "other_user_name": other_user.company_name
                })
    return inbox

@app.post("/messages", response_model=ChatMessageResponse)
def create_message(message: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_message = ChatMessage(
        text=message.text,
        user_id=current_user.id,
        receiver_id=message.receiver_id,
        event_id=message.event_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    db_message.sender = f"{current_user.company_name} ({current_user.role})"
    return db_message

@app.get("/messages", response_model=List[ChatMessageResponse])
def get_messages(event_id: int, vendor_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "Vendor":
        vendor_id = current_user.id
    if not vendor_id:
        raise HTTPException(status_code=400, detail="vendor_id required for Organizers")
        
    messages = db.query(ChatMessage).filter(
        ChatMessage.event_id == event_id,
        ((ChatMessage.user_id == vendor_id) | (ChatMessage.receiver_id == vendor_id))
    ).all()
    for m in messages:
        if m.user:
            m.sender = f"{m.user.company_name} ({m.user.role})"
    return messages

# ----------------- Creator Profile API Endpoints -----------------

@app.get("/users/{vendor_id}/profile", response_model=VendorProfileResponse)
def get_vendor_profile(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = db.query(User).filter(User.id == vendor_id).first()
    if not vendor or vendor.role != "Vendor":
        raise HTTPException(status_code=404, detail="Vendor profile not found")

    # Follower count & followed status
    follower_count = db.query(Follow).filter(Follow.vendor_id == vendor_id).count()
    is_followed_by_me = db.query(Follow).filter(
        Follow.vendor_id == vendor_id,
        Follow.follower_id == current_user.id
    ).first() is not None

    # Media items with like details
    media_items = db.query(VendorMedia).filter(VendorMedia.vendor_id == vendor_id).order_by(VendorMedia.created_at.desc()).all()
    
    media_responses = []
    total_likes = 0
    for item in media_items:
        like_count = db.query(MediaLike).filter(MediaLike.media_id == item.id).count()
        is_liked_by_me = db.query(MediaLike).filter(
            MediaLike.media_id == item.id,
            MediaLike.user_id == current_user.id
        ).first() is not None
        
        total_likes += like_count
        media_responses.append(
            MediaItemResponse(
                id=item.id,
                media_url=item.media_url,
                media_type=item.media_type,
                created_at=item.created_at,
                like_count=like_count,
                is_liked_by_me=is_liked_by_me
            )
        )

    # Dynamic badge calculations based on database statistics
    booking_count = db.query(StallBooking).filter(StallBooking.vendor_id == vendor_id).count()
    
    badges = [
        BadgeResponse(
            id="beginner",
            name="Beginner",
            description="Assigned by default to new accounts.",
            is_unlocked=True
        ),
        BadgeResponse(
            id="most_lovable",
            name="Most Lovable",
            description="Unlocked automatically when you hit 5 followers or 5 total post likes.",
            is_unlocked=(follower_count >= 5 or total_likes >= 5)
        ),
        BadgeResponse(
            id="event_legend",
            name="Event Legend",
            description="Unlocked after successfully participating in 2 or more events.",
            is_unlocked=(booking_count >= 2)
        )
    ]

    return VendorProfileResponse(
        id=vendor.id,
        company_name=vendor.company_name,
        bio=vendor.bio,
        instagram_url=vendor.instagram_url,
        website_url=vendor.website_url,
        avatar_url=vendor.avatar_url,
        follower_count=follower_count,
        is_followed_by_me=is_followed_by_me,
        total_likes=total_likes,
        badges=badges,
        media=media_responses,
        role=vendor.role
    )

@app.post("/users/{vendor_id}/follow")
def toggle_follow_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = db.query(User).filter(User.id == vendor_id).first()
    if not vendor or vendor.role != "Vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")

    existing_follow = db.query(Follow).filter(
        Follow.vendor_id == vendor_id,
        Follow.follower_id == current_user.id
    ).first()

    if existing_follow:
        db.delete(existing_follow)
        db.commit()
        followed = False
    else:
        new_follow = Follow(vendor_id=vendor_id, follower_id=current_user.id)
        db.add(new_follow)
        db.commit()
        followed = True

    follower_count = db.query(Follow).filter(Follow.vendor_id == vendor_id).count()
    return {"followed": followed, "follower_count": follower_count}

@app.post("/users/me/media", response_model=MediaItemResponse)
def upload_vendor_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Vendor":
        raise HTTPException(status_code=403, detail="Only vendors can upload media")

    os.makedirs("static/uploads", exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1].lower()
    media_type = "video" if file_extension in [".mp4", ".webm", ".avi", ".mov"] else "image"
    
    unique_filename = f"{current_user.id}_{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_location = f"static/uploads/{unique_filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    media_url = f"http://127.0.0.1:8000/static/uploads/{unique_filename}"
    
    db_media = VendorMedia(
        vendor_id=current_user.id,
        media_url=media_url,
        media_type=media_type
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)

    return MediaItemResponse(
        id=db_media.id,
        media_url=db_media.media_url,
        media_type=db_media.media_type,
        created_at=db_media.created_at,
        like_count=0,
        is_liked_by_me=False
    )

@app.post("/users/me/media/link", response_model=MediaItemResponse)
def link_supabase_media(
    media_link: MediaLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Vendor":
        raise HTTPException(status_code=403, detail="Only vendors can register media")

    db_media = VendorMedia(
        vendor_id=current_user.id,
        media_url=media_link.media_url,
        media_type=media_link.media_type
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)

    return MediaItemResponse(
        id=db_media.id,
        media_url=db_media.media_url,
        media_type=db_media.media_type,
        created_at=db_media.created_at,
        like_count=0,
        is_liked_by_me=False
    )

@app.post("/media/{media_id}/like")
def toggle_like_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    media = db.query(VendorMedia).filter(VendorMedia.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")

    existing_like = db.query(MediaLike).filter(
        MediaLike.media_id == media_id,
        MediaLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        liked = False
    else:
        new_like = MediaLike(media_id=media_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        liked = True

    like_count = db.query(MediaLike).filter(MediaLike.media_id == media_id).count()
    return {"liked": liked, "like_count": like_count}

@app.delete("/media/{media_id}")
def delete_vendor_media(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    media = db.query(VendorMedia).filter(VendorMedia.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")

    if media.vendor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this media item")

    # If it is a local file, remove it from static folder
    if "static/uploads/" in media.media_url:
        filename = media.media_url.split("static/uploads/")[-1]
        local_path = f"static/uploads/{filename}"
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception as e:
                print(f"[CLEANUP ERROR] Failed to delete file {local_path}: {e}")

    db.delete(media)
    db.commit()
    return {"status": "success", "message": "Media deleted successfully"}
