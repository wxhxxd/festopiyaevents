from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime, Boolean, Float, text, UUID
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Union, Dict, Any
from datetime import datetime, timedelta
import bcrypt
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
import os
import shutil
import json
import secrets
import sys
import hashlib
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

import urllib.parse
import uuid

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'events.db')}"

if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # Render and other hosts use postgres:// which is deprecated in modern SQLAlchemy; rewrite to postgresql://
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    if SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
        try:
            scheme, rest = SQLALCHEMY_DATABASE_URL.split("://", 1)
            if "/" in rest:
                netloc, path = rest.split("/", 1)
                path = "/" + path
            else:
                netloc = rest
                path = ""
            
            if "@" in netloc:
                userinfo, hostinfo = netloc.rsplit("@", 1)
                if ":" in userinfo:
                    username, password = userinfo.split(":", 1)
                    decoded_password = urllib.parse.unquote(password)
                    encoded_password = urllib.parse.quote_plus(decoded_password)
                    netloc = f"{username}:{encoded_password}@{hostinfo}"
            
            SQLALCHEMY_DATABASE_URL = f"{scheme}://{netloc}{path}"
        except Exception:
            pass  # Fall back to original URL on parsing exception

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ----------------- SQLAlchemy Models -----------------
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=False), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
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
    username = Column(String, unique=True, index=True, nullable=True)
    business_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    items_selling = Column(String, default="[]")
    display_name = Column(String, nullable=True)
    
    # Relationships
    events = relationship("Event", back_populates="organizer")
    bookings = relationship("StallBooking", back_populates="vendor")
    messages = relationship("ChatMessage", foreign_keys="ChatMessage.user_id", back_populates="user")
    pitches = relationship("Pitch", back_populates="vendor")

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=False), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    date = Column(String)
    total_stalls = Column(Integer)
    organizer_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    standard_price = Column(Float, default=0.0)
    premium_price = Column(Float, default=0.0)
    # JSON array string of stall numbers designated as Premium, e.g. "[1,3,5]"
    premium_stall_ids = Column(String, default="[]")
    image_urls = Column(String, default="[]")
    banner_url = Column(String, nullable=True)
    maps_url = Column(String, nullable=True)
    standard_stall_size = Column(String, default="10x10")
    premium_stall_size = Column(String, default="12x12")
    standard_stall_location = Column(String, default="Main Hall")
    premium_stall_location = Column(String, default="VIP Area")
    payment_model = Column(String, default="vendor_pays")

    organizer = relationship("User", back_populates="events")
    bookings = relationship("StallBooking", back_populates="event")
    pitches = relationship("Pitch", back_populates="event")

class StallBooking(Base):
    __tablename__ = "stall_bookings"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(UUID(as_uuid=False), ForeignKey("events.id"))
    stall_number = Column(Integer)
    vendor_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    image_url = Column(String, nullable=True)
    total_amount = Column(Float, default=0.0)
    amount_paid = Column(Float, default=0.0)
    txnid = Column(String, nullable=True, unique=True)
    status = Column(String, default="Pending")

    event = relationship("Event", back_populates="bookings")
    vendor = relationship("User", back_populates="bookings")

class Pitch(Base):
    __tablename__ = "pitches"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(UUID(as_uuid=False), ForeignKey("events.id"))
    vendor_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
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
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    receiver_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    event_id = Column(UUID(as_uuid=False), ForeignKey("events.id"))
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="messages")
    
class Follow(Base):
    __tablename__ = "follows"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    vendor_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class VendorMedia(Base):
    __tablename__ = "vendor_media"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    media_url = Column(String)
    media_type = Column(String, default="image") # "image" or "video"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    likes = relationship("MediaLike", back_populates="media", cascade="all, delete-orphan")

class MediaLike(Base):
    __tablename__ = "media_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"))
    media_id = Column(Integer, ForeignKey("vendor_media.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    media = relationship("VendorMedia", back_populates="likes")

from sqlalchemy import inspect, text

try:
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    needs_reset = False
    if "events" in tables:
        columns = [col["name"] for col in inspector.get_columns("events")]
        if "image_urls" not in columns or "standard_stall_size" not in columns or "banner_url" not in columns or "maps_url" not in columns:
            needs_reset = True
            print("[DATABASE] Mismatch detected: 'events' table is out of date.")
            
    if "users" in tables and not needs_reset:
        columns = [col["name"] for col in inspector.get_columns("users")]
        if "items_selling" not in columns or "category" not in columns or "business_name" not in columns or "display_name" not in columns:
            needs_reset = True
            print("[DATABASE] Mismatch detected: 'users' table is out of date.")

    if needs_reset:
        print("[DATABASE] Resetting database schema...")
        with engine.connect() as conn:
            tables_to_drop = ["bookings", "stall_bookings", "pitches", "chat_messages", "follows", "media_likes", "vendor_media", "events", "users"]
            for table in tables_to_drop:
                try:
                    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
                        conn.execute(text(f"DROP TABLE IF EXISTS {table}"))
                    else:
                        conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                except Exception as drop_err:
                    print(f"[DATABASE] Warning: Failed to drop table {table}: {drop_err}")
            conn.commit()
        print("[DATABASE] Mismatched tables dropped successfully.")
except Exception as e:
    print(f"[DATABASE] Schema check error: {e}")

Base.metadata.create_all(bind=engine)

def run_auto_migrations():
    migrations = [
        # (table_name, column_name, postgres_type, sqlite_type)
        ("stall_bookings", "txnid", "VARCHAR", "TEXT"),
        ("stall_bookings", "status", "VARCHAR DEFAULT 'Pending'", "TEXT DEFAULT 'Pending'"),
        ("stall_bookings", "total_amount", "DOUBLE PRECISION DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
        ("stall_bookings", "amount_paid", "DOUBLE PRECISION DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
        ("stall_bookings", "image_url", "VARCHAR", "TEXT"),

        ("users", "is_verified", "BOOLEAN DEFAULT TRUE", "INTEGER DEFAULT 1"),
        ("users", "verification_token", "VARCHAR", "TEXT"),
        ("users", "bio", "VARCHAR", "TEXT"),
        ("users", "instagram_url", "VARCHAR", "TEXT"),
        ("users", "website_url", "VARCHAR", "TEXT"),
        ("users", "avatar_url", "VARCHAR", "TEXT"),
        ("users", "username", "VARCHAR", "TEXT"),
        ("users", "business_name", "VARCHAR", "TEXT"),
        ("users", "category", "VARCHAR", "TEXT"),
        ("users", "items_selling", "VARCHAR DEFAULT '[]'", "TEXT DEFAULT '[]'"),
        ("users", "display_name", "VARCHAR", "TEXT"),

        ("events", "standard_price", "DOUBLE PRECISION DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
        ("events", "premium_price", "DOUBLE PRECISION DEFAULT 0.0", "FLOAT DEFAULT 0.0"),
        ("events", "premium_stall_ids", "VARCHAR DEFAULT '[]'", "TEXT DEFAULT '[]'"),
        ("events", "image_urls", "VARCHAR DEFAULT '[]'", "TEXT DEFAULT '[]'"),
        ("events", "banner_url", "VARCHAR", "TEXT"),
        ("events", "maps_url", "VARCHAR", "TEXT"),
        ("events", "standard_stall_size", "VARCHAR DEFAULT '10x10'", "TEXT DEFAULT '10x10'"),
        ("events", "premium_stall_size", "VARCHAR DEFAULT '12x12'", "TEXT DEFAULT '12x12'"),
        ("events", "standard_stall_location", "VARCHAR DEFAULT 'Main Hall'", "TEXT DEFAULT 'Main Hall'"),
        ("events", "premium_stall_location", "VARCHAR DEFAULT 'VIP Area'", "TEXT DEFAULT 'VIP Area'"),
        ("events", "payment_model", "VARCHAR DEFAULT 'vendor_pays'", "TEXT DEFAULT 'vendor_pays'")
    ]

    is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    
    with engine.begin() as conn:
        for table, col, pg_type, sqlite_type in migrations:
            col_type = sqlite_type if is_sqlite else pg_type
            if is_sqlite:
                sql = f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"
            else:
                sql = f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_type}"
            try:
                conn.execute(text(sql))
            except Exception:
                pass

try:
    run_auto_migrations()
    print("[DATABASE] Auto-migration check completed.")
except Exception as e:
    print(f"[DATABASE] Auto-migration error: {e}")


# ----------------- Supabase Storage Integration & Helper Functions -----------------
import urllib.request
import urllib.error
from urllib.parse import quote

def upload_to_supabase(file_data: bytes, file_name: str, content_type: str) -> Optional[str]:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    bucket_name = "vendor-media"
    
    if not supabase_url or not supabase_key:
        print("[SUPABASE] Supabase credentials not found. Using local storage fallback.")
        return None
        
    supabase_url = supabase_url.strip().rstrip("/")
    if not supabase_url.startswith("http"):
        supabase_url = f"https://{supabase_url}"
        
    quoted_file_name = quote(file_name)
    url = f"{supabase_url}/storage/v1/object/{bucket_name}/{quoted_file_name}"
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": content_type
    }
    
    req = urllib.request.Request(url, data=file_data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{file_name}"
            print(f"[SUPABASE] Successfully uploaded {file_name} to Supabase. Public URL: {public_url}")
            return public_url
    except urllib.error.HTTPError as e:
        print(f"[SUPABASE ERROR] HTTP Error {e.code}: {e.read().decode('utf-8', errors='ignore')}")
        return None
    except Exception as e:
        print(f"[SUPABASE ERROR] Failed to upload {file_name} to Supabase: {e}")
        return None

def delete_from_supabase(file_name: str):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    bucket_name = "vendor-media"
    
    if not supabase_url or not supabase_key:
        return
        
    supabase_url = supabase_url.strip().rstrip("/")
    if not supabase_url.startswith("http"):
        supabase_url = f"https://{supabase_url}"
        
    quoted_file_name = quote(file_name)
    url = f"{supabase_url}/storage/v1/object/{bucket_name}/{quoted_file_name}"
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
    
    req = urllib.request.Request(url, headers=headers, method="DELETE")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"[SUPABASE] Deleted {file_name} from Supabase.")
    except Exception as e:
        print(f"[SUPABASE ERROR] Failed to delete {file_name} from Supabase: {e}")

def run_migrations():
    db = SessionLocal()
    try:
        # 1. users migrations
        for col_name, col_type in [
            ("avatar_url", "VARCHAR(500)"),
            ("is_verified", "BOOLEAN DEFAULT TRUE"),
            ("verification_token", "VARCHAR(200)"),
            ("bio", "VARCHAR(1000)"),
            ("instagram_url", "VARCHAR(200)"),
            ("website_url", "VARCHAR(200)"),
            ("username", "VARCHAR(200)"),
            ("business_name", "VARCHAR(200)"),
            ("category", "VARCHAR(200)"),
            ("display_name", "VARCHAR(200)")
        ]:
            try:
                db.execute(text(f"SELECT {col_name} FROM users LIMIT 1"))
            except Exception:
                db.rollback()
                try:
                    db.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    db.commit()
                    print(f"[MIGRATION] Added {col_name} column to users.")
                except Exception as e:
                    db.rollback()
                    print(f"[MIGRATION ERROR] Failed to add {col_name} to users: {e}")

        # Create unique index for username to enforce uniqueness at database level
        try:
            db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username)"))
            db.commit()
            print("[MIGRATION] Enforced unique index on users.username.")
        except Exception as e:
            db.rollback()
            print(f"[MIGRATION ERROR] Failed to enforce unique index on users.username: {e}")

        # 2. events migrations
        for col_name, col_type in [
            ("standard_price", "FLOAT DEFAULT 0.0"),
            ("premium_price", "FLOAT DEFAULT 0.0"),
            ("premium_stall_ids", "VARCHAR(500) DEFAULT '[]'"),
            ("image_url", "VARCHAR(500)")
        ]:
            try:
                db.execute(text(f"SELECT {col_name} FROM events LIMIT 1"))
            except Exception:
                db.rollback()
                try:
                    db.execute(text(f"ALTER TABLE events ADD COLUMN {col_name} {col_type}"))
                    db.commit()
                    print(f"[MIGRATION] Added {col_name} column to events.")
                except Exception as e:
                    db.rollback()
                    print(f"[MIGRATION ERROR] Failed to add {col_name} to events: {e}")

        # 3. stall_bookings migrations
        try:
            db.execute(text("SELECT image_url FROM stall_bookings LIMIT 1"))
        except Exception:
            db.rollback()
            try:
                db.execute(text("ALTER TABLE stall_bookings ADD COLUMN image_url VARCHAR(500)"))
                db.commit()
                print("[MIGRATION] Added image_url column to stall_bookings.")
            except Exception as e:
                db.rollback()
                print(f"[MIGRATION ERROR] Failed to add image_url to stall_bookings: {e}")

        # Delete any existing events named 'General Connection'
        try:
            db.execute(text("DELETE FROM events WHERE name = 'General Connection'"))
            db.commit()
            print("[MIGRATION] Cleaned up any default 'General Connection' events.")
        except Exception as e:
            db.rollback()
            print(f"[MIGRATION ERROR] Failed to delete 'General Connection' events: {e}")

    finally:
        db.close()

# Execute self-healing migrations at startup
run_migrations()

# ----------------- Pydantic Schemas -----------------
class UserCreate(BaseModel):
    email: str
    password: str
    company_name: str
    role: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    email: str
    company_name: Optional[str] = None
    role: Optional[str] = None
    is_verified: bool = False
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None
    username: Optional[str] = None
    business_name: Optional[str] = None
    category: Optional[str] = None
    items_selling: Optional[str] = None
    display_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    company_name: Optional[str] = None
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None
    username: Optional[str] = None
    business_name: Optional[str] = None
    category: Optional[str] = None
    items_selling: Optional[str] = None
    display_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    role: Optional[str] = None
    company_name: Optional[str] = None

class EventBase(BaseModel):
    name: str
    date: str
    total_stalls: int
    standard_price: float = 0.0
    premium_price: float = 0.0
    premium_stall_ids: str = "[]"
    image_urls: str = "[]"
    banner_url: Optional[str] = None
    maps_url: Optional[str] = None
    standard_stall_size: str = "10x10"
    premium_stall_size: str = "12x12"
    standard_stall_location: str = "Main Hall"
    premium_stall_location: str = "VIP Area"
    payment_model: Optional[str] = "vendor_pays"

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: str
    organizer_id: str
    model_config = ConfigDict(from_attributes=True)

class StallBookingBase(BaseModel):
    event_id: str
    stall_number: Optional[int] = None

class StallBookingCreate(StallBookingBase):
    pass

class StallBookingResponse(StallBookingBase):
    id: int
    vendor_id: str
    vendor_name: Optional[str] = None
    image_url: Optional[str] = None
    total_amount: Optional[float] = 0.0
    amount_paid: Optional[float] = 0.0
    txnid: Optional[str] = None
    status: Optional[str] = "Pending"
    model_config = ConfigDict(from_attributes=True)

class PayUInitResponse(BaseModel):
    booking: StallBookingResponse
    payu_hash: str
    txnid: str
    amount: str
    key: str
    productinfo: str
    firstname: str
    email: str
    surl: str
    furl: str

class PitchBase(BaseModel):
    event_id: str
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
    vendor_id: str
    status: str
    vendor_name: Optional[str] = None
    event_name: Optional[str] = None
    organizer_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ChatMessageBase(BaseModel):
    text: str

class ChatMessageCreate(ChatMessageBase):
    event_id: str
    receiver_id: str

class ChatMessageResponse(ChatMessageBase):
    id: int
    user_id: str
    receiver_id: str
    event_id: str
    sender: Optional[str] = None # For UI
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class InboxItem(BaseModel):
    event_id: str
    event_name: str
    vendor_id: str
    vendor_name: str
    other_user_id: str
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
    id: str
    company_name: str
    bio: Optional[str] = None
    instagram_url: Optional[str] = None
    website_url: Optional[str] = None
    avatar_url: Optional[str] = None
    follower_count: int
    is_followed_by_me: bool
    total_likes: int
    events_completed: Optional[int] = None
    stalls_booked: Optional[int] = None
    badges: List[BadgeResponse]
    media: List[MediaItemResponse]
    role: str
    category: Optional[str] = None
    items_selling: Optional[str] = "[]"
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
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app = FastAPI(title="Festopiya Backend API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

os.makedirs("static/events", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from fastapi.responses import JSONResponse
import traceback

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"Global exception caught: {exc}")
    traceback.print_exc()
    origin = request.headers.get("origin", "*")
    headers = {
        "Access-Control-Allow-Origin": origin if origin else "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers
        )
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}", "type": str(type(exc))},
        headers=headers
    )

@app.get("/test-error")
def test_error():
    raise HTTPException(status_code=400, detail="Test error")


# ----------------- Auth Endpoints -----------------
# Email config — replace with real SMTP creds or use Gmail App Password
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "festopiya@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "mjxpijchhxkbhtyr")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://www.festopiya.com")

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

def send_reset_password_email(email: str, token: str):
    """Send password reset email."""
    link = f"{FRONTEND_URL}/reset-password?token={token}"

    print(f"\n{'='*60}")
    print(f"[FESTOPIYA] Password Reset link for {email}:")
    print(f"  {link}")
    print(f"{'='*60}\n")

    if SMTP_USER in _PLACEHOLDER_CREDS or SMTP_PASS in _PLACEHOLDER_CREDS:
        print("[EMAIL] SMTP not configured — using console link above.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset your Festopiya password"
        msg["From"] = SMTP_USER
        msg["To"] = email
        html = f"""
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0a0a0a;border-radius:16px;color:#fff">
          <img src="{FRONTEND_URL}/logo.png" alt="Festopiya" style="height:48px;margin-bottom:24px" />
          <h2 style="color:#a78bfa">Reset Your Password</h2>
          <p style="color:#aaa">Click the button below to reset your Festopiya password. This link will expire in 15 minutes.</p>
          <a href="{link}" style="display:inline-block;margin-top:16px;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;border-radius:12px;text-decoration:none;font-weight:bold">Reset Password</a>
          <p style="color:#555;margin-top:24px;font-size:12px">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, email, msg.as_string())
        print(f"[EMAIL] Sent password reset email to {email}")
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
@limiter.limit("5/minute")
def signup(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        import traceback
        error_msg = f"Error in signup: {str(e)}\n{traceback.format_exc()}"
        return JSONResponse(status_code=400, content={"detail": error_msg})

@app.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully! You can now log in."}

@app.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, req: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    print(f"[DEBUG] /forgot-password called for email: '{req.email}'")
    sys.stdout.flush()
    
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        print(f"[DEBUG] User found! Queuing email task...")
        sys.stdout.flush()
        token_data = {
            "sub": user.email,
            "type": "reset",
            "hash": user.hashed_password[-10:] if user.hashed_password else ""
        }
        token = create_access_token(data=token_data, expires_delta=timedelta(minutes=15))
        background_tasks.add_task(send_reset_password_email, user.email, token)
    else:
        print(f"[DEBUG] User NOT found for email: '{req.email}'")
        sys.stdout.flush()
    
    return {"message": "If the email is registered, a password reset link has been sent."}

@app.post("/reset-password")
@limiter.limit("5/minute")
def reset_password(request: Request, req: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        pwd_hash: str = payload.get("hash")
        
        if email is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    expected_hash = user.hashed_password[-10:] if user.hashed_password else ""
    if pwd_hash != expected_hash:
        raise HTTPException(status_code=400, detail="Token has already been used or is invalid")
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@app.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
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
    except Exception as e:
        import traceback
        error_msg = f"Error in login: {str(e)}\n{traceback.format_exc()}"
        return JSONResponse(status_code=400, content={"detail": error_msg})

# ----------------- Protected API Endpoints -----------------

@app.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = False
    if not current_user.username:
        base = current_user.email.split("@")[0] if current_user.email else "user"
        sanitized = "".join(c for c in base if c.isalnum() or c in ("_", "-")).lower()
        current_user.username = sanitized or f"user_{current_user.id[:8]}"
        updated = True
    if not current_user.business_name:
        current_user.business_name = current_user.company_name
        updated = True
    if not current_user.display_name:
        current_user.display_name = current_user.company_name or current_user.username
        updated = True
    if updated:
        db.commit()
        db.refresh(current_user)
    return current_user

@app.put("/users/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.company_name is not None:
        current_user.company_name = user_update.company_name
        current_user.business_name = user_update.company_name
    if user_update.business_name is not None:
        current_user.business_name = user_update.business_name
        current_user.company_name = user_update.business_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.instagram_url is not None:
        current_user.instagram_url = user_update.instagram_url
    if user_update.website_url is not None:
        current_user.website_url = user_update.website_url
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.username is not None:
        username_val = user_update.username.strip().lower()
        if username_val:
            if not all(c.isalnum() or c in ('_', '-') for c in username_val):
                raise HTTPException(
                    status_code=400, 
                    detail="Username can only contain letters, numbers, underscores, and hyphens"
                )
            # Check if username is already taken by another user
            check_user = db.query(User).filter(User.username == username_val, User.id != current_user.id).first()
            if check_user:
                raise HTTPException(status_code=400, detail="Username is already taken")
            current_user.username = username_val
    if user_update.category is not None:
        current_user.category = user_update.category
    if user_update.items_selling is not None:
        current_user.items_selling = user_update.items_selling
    if user_update.display_name is not None:
        current_user.display_name = user_update.display_name
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/avatar", response_model=UserResponse)
def upload_user_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in [".png", ".jpg", ".jpeg", ".webp"]:
        raise HTTPException(status_code=400, detail="Only PNG, JPG, JPEG, and WEBP formats are supported for profile pictures")
        
    unique_filename = f"avatar_{current_user.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
    file_location = f"static/uploads/{unique_filename}"
    
    # Check if we should delete old Supabase avatar first to prevent leak
    if current_user.avatar_url and "/storage/v1/object/public/vendor-media/" in current_user.avatar_url:
        old_file_name = current_user.avatar_url.split("/storage/v1/object/public/vendor-media/")[-1]
        delete_from_supabase(old_file_name)
        
    file_content = file.file.read()
    
    # Upload to Supabase if configured
    supabase_avatar_url = upload_to_supabase(
        file_data=file_content,
        file_name=unique_filename,
        content_type=file.content_type or "image/png"
    )
    
    if supabase_avatar_url:
        avatar_url = supabase_avatar_url
    else:
        # Fallback to local file storage
        os.makedirs("static/uploads", exist_ok=True)
        with open(file_location, "wb+") as file_object:
            file_object.write(file_content)
        base_url = str(request.base_url).rstrip("/")
        avatar_url = f"{base_url}/static/uploads/{unique_filename}"
        
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/api/upload")
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import time
    file_content = file.file.read()
    unique_filename = f"{current_user.id}_{int(time.time())}_{file.filename}"
    
    supabase_avatar_url = upload_to_supabase(
        file_data=file_content,
        file_name=unique_filename,
        content_type=file.content_type or "image/png"
    )
    
    if supabase_avatar_url:
        return {"url": supabase_avatar_url}
    else:
        os.makedirs("static/uploads", exist_ok=True)
        file_location = f"static/uploads/{unique_filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file_content)
        return {"url": f"/static/uploads/{unique_filename}"}

@app.get("/api/search/users")
def search_users(
    role: str,
    query: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_role = "Organizer" if role.lower() == "organizer" else "Vendor"
    q = db.query(User).filter(User.role == db_role)
    if query:
        search_filter = f"%{query}%"
        q = q.filter(
            (User.username.ilike(search_filter)) |
            (User.business_name.ilike(search_filter)) |
            (User.company_name.ilike(search_filter)) |
            (User.category.ilike(search_filter)) |
            (User.items_selling.ilike(search_filter))
        )
    users = q.all()
    results = []
    for u in users:
        username = u.username
        if not username:
            base = u.email.split("@")[0] if u.email else "user"
            username = "".join(c for c in base if c.isalnum() or c in ("_", "-")).lower() or f"user_{u.id[:8]}"
        results.append({
            "id": u.id,
            "username": username,
            "display_name": u.display_name or u.company_name or username,
            "business_name": u.business_name or u.company_name or "",
            "bio": u.bio or "",
            "category": u.category or "",
            "items_selling": u.items_selling or "[]",
            "avatar_url": u.avatar_url or "",
            "role": u.role
        })
    return results

@app.get("/api/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.email or current_user.email.lower() != "abdulwaheed998922@gmail.com":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_events = db.query(Event).count()
    total_stalls_booked = db.query(StallBooking).count()
    
    total_organizers = db.query(User).filter(User.role.in_(["Organizer", "organizer", "ORGANIZER"])).count()
    total_vendors = db.query(User).filter(User.role.in_(["Vendor", "vendor", "VENDOR"])).count()
    
    bookings_data = db.query(StallBooking).all()
    bookings_list = []
    
    total_advance_collected = 0
    platform_revenue = 0
    pending_vendor_payouts = 0
    
    for b in bookings_data:
        vendor = db.query(User).filter(User.id == b.vendor_id).first()
        event = db.query(Event).filter(Event.id == b.event_id).first()
        organizer = db.query(User).filter(User.id == event.organizer_id).first() if event else None
        
        status = "pending_advance"
        amount_paid = b.amount_paid or 0.0
        if amount_paid > 0:
             status = "advance_paid"
             total_advance_collected += amount_paid
             platform_revenue += 500 
             pending_vendor_payouts += (amount_paid - 500)
             
        bookings_list.append({
            "id": b.id,
            "organizerName": organizer.company_name if organizer else "Unknown",
            "organizerEmail": organizer.email if organizer else "Unknown",
            "vendorName": vendor.company_name if vendor else "Unknown",
            "vendorEmail": vendor.email if vendor else "Unknown",
            "paymentModel": event.payment_model if event else "vendor_pays",
            "status": status,
            "realStatus": b.status,
            "advanceHeld": amount_paid,
            "totalAmount": b.total_amount
        })
    
    return {
        "total_events": total_events,
        "total_stalls_booked": total_stalls_booked,
        "total_organizers": total_organizers,
        "total_vendors": total_vendors,
        "bookings": bookings_list,
        "total_advance_collected": total_advance_collected,
        "platform_revenue": platform_revenue,
        "pending_vendor_payouts": pending_vendor_payouts
    }

@app.get("/api/users/profile-by-id/{user_id}")
def get_user_profile_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    events_data = []
    if user.role == "Organizer":
        events_data = [
            {
                "id": e.id, 
                "name": e.name,
                "date": e.date,
                "banner_url": e.banner_url,
                "image_urls": e.image_urls
            } for e in user.events
        ]
        
    res_username = user.username
    if not res_username:
        base = user.email.split("@")[0] if user.email else "user"
        res_username = "".join(c for c in base if c.isalnum() or c in ("_", "-")).lower() or f"user_{user.id[:8]}"
        
    return {
        "id": user.id,
        "username": res_username,
        "display_name": user.display_name or user.company_name or res_username,
        "business_name": user.business_name or user.company_name or "",
        "role": user.role,
        "category": user.category or "",
        "items_selling": user.items_selling or "[]",
        "events": events_data
    }

@app.get("/api/users/profile/{username}")
def get_user_profile_by_username(
    username: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = username.strip()
    user = db.query(User).filter(User.username.ilike(target)).first()
    if not user:
        user = db.query(User).filter(User.id == target).first()
    if not user:
        user = db.query(User).filter(
            (User.display_name.ilike(target)) |
            (User.company_name.ilike(target)) |
            (User.business_name.ilike(target))
        ).first()
    if not user:
        # Fallback for older users
        all_users = db.query(User).all()
        for u in all_users:
            base = u.email.split("@")[0] if u.email else "user"
            sanitized = "".join(c for c in base if c.isalnum() or c in ("_", "-")).lower() or f"user_{u.id[:8]}"
            if sanitized == target.lower() or str(u.id) == target:
                user = u
                break
                
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    # Get media items
    media_items = db.query(VendorMedia).filter(VendorMedia.vendor_id == user.id).order_by(VendorMedia.created_at.desc()).all()
    media_responses = []
    for item in media_items:
        like_count = db.query(MediaLike).filter(MediaLike.media_id == item.id).count()
        is_liked_by_me = db.query(MediaLike).filter(
            MediaLike.media_id == item.id,
            MediaLike.user_id == current_user.id
        ).first() is not None
        
        media_responses.append({
            "id": item.id,
            "media_url": item.media_url,
            "media_type": item.media_type,
            "created_at": item.created_at,
            "like_count": like_count,
            "is_liked_by_me": is_liked_by_me
        })
        
    events_data = []
    if user.role == "Organizer":
        events_data = [
            {
                "id": e.id, 
                "name": e.name,
                "date": e.date,
                "banner_url": e.banner_url,
                "image_urls": e.image_urls
            } for e in user.events
        ]
        
    res_username = user.username
    if not res_username:
        base = user.email.split("@")[0] if user.email else "user"
        res_username = "".join(c for c in base if c.isalnum() or c in ("_", "-")).lower() or f"user_{user.id[:8]}"
        
    return {
        "id": user.id,
        "username": res_username,
        "display_name": user.display_name or user.company_name or res_username,
        "business_name": user.business_name or user.company_name or "",
        "company_name": user.company_name or "",
        "bio": user.bio or "",
        "category": user.category or "",
        "items_selling": user.items_selling or "[]",
        "avatar_url": user.avatar_url or "",
        "role": user.role,
        "instagram_url": user.instagram_url or "",
        "website_url": user.website_url or "",
        "media": media_responses,
        "events": events_data
    }

@app.post("/events/", response_model=EventResponse)
@limiter.limit("5/minute")
def create_event(
    request: Request,
    name: str = Form(...),
    date: str = Form(...),
    total_stalls: int = Form(...),
    standard_price: float = Form(0.0),
    premium_price: float = Form(0.0),
    premium_stall_ids: str = Form("[]"),
    standard_stall_size: str = Form("10x10"),
    premium_stall_size: str = Form("12x12"),
    standard_stall_location: str = Form("Main Hall"),
    premium_stall_location: str = Form("VIP Area"),
    payment_model: str = Form("vendor_pays"),
    maps_url: Optional[str] = Form(None),
    banner: Optional[UploadFile] = File(default=None),
    images: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.role != "Organizer":
        raise HTTPException(status_code=403, detail="Only organizers can create events")
        
    db_event = Event(
        name=name, date=date, total_stalls=total_stalls,
        organizer_id=current_user.id,
        standard_price=standard_price, premium_price=premium_price,
        premium_stall_ids=premium_stall_ids,
        standard_stall_size=standard_stall_size,
        premium_stall_size=premium_stall_size,
        standard_stall_location=standard_stall_location,
        premium_stall_location=premium_stall_location,
        payment_model=payment_model,
        maps_url=maps_url
    )
    db.add(db_event)
    db.flush()  # Populate db_event.id for filenames before committing
    
    # Process Banner if uploaded
    banner_url = None
    if banner and banner.filename:
        try:
            file_extension = os.path.splitext(banner.filename)[1].lower()
            unique_filename = f"event_banner_{db_event.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
            file_location = f"static/events/{unique_filename}"
            
            banner_content = banner.file.read()
            
            # Upload to Supabase if configured
            supabase_banner_url = upload_to_supabase(
                file_data=banner_content,
                file_name=unique_filename,
                content_type=banner.content_type or "image/png"
            )
            
            if supabase_banner_url:
                banner_url = supabase_banner_url
            else:
                # Fallback to local storage
                os.makedirs("static/events", exist_ok=True)
                with open(file_location, "wb+") as file_object:
                    file_object.write(banner_content)
                base_url = str(request.base_url).rstrip("/")
                banner_url = f"{base_url}/static/events/{unique_filename}"
        except Exception as e:
            print(f"[EVENT CREATE] Failed to upload or save banner {banner.filename}: {e}")
            
    db_event.banner_url = banner_url

    uploaded_urls = []
    for image in images:
        if image and image.filename:
            try:
                file_extension = os.path.splitext(image.filename)[1].lower()
                unique_filename = f"event_{db_event.id}_{int(datetime.utcnow().timestamp())}_{len(uploaded_urls)}{file_extension}"
                file_location = f"static/events/{unique_filename}"
                
                image_content = image.file.read()
                
                # Upload to Supabase if configured
                supabase_image_url = upload_to_supabase(
                    file_data=image_content,
                    file_name=unique_filename,
                    content_type=image.content_type or "image/png"
                )
                
                if supabase_image_url:
                    uploaded_urls.append(supabase_image_url)
                else:
                    # Fallback to local storage
                    os.makedirs("static/events", exist_ok=True)
                    with open(file_location, "wb+") as file_object:
                        file_object.write(image_content)
                    base_url = str(request.base_url).rstrip("/")
                    uploaded_urls.append(f"{base_url}/static/events/{unique_filename}")
            except Exception as e:
                print(f"[EVENT CREATE] Failed to upload or save image {image.filename}: {e}")
                # Continue processing other images rather than failing the whole request
                
    db_event.image_urls = json.dumps(uploaded_urls)
    db.commit()
    db.refresh(db_event)
            
    return db_event

@app.get("/events/")
def get_all_events(request: Request, all_events: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Safely clean up any residual 'General Connection' events
    try:
        db.query(Event).filter(Event.name == "General Connection").delete(synchronize_session=False)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[CLEANUP ERROR] Failed to clean 'General Connection' events: {e}")

    show_all = False
    if all_events is not None:
        show_all = all_events.lower() in ("true", "1", "yes", "all")

    print(f"[DEBUG EVENTS] get_all_events: raw_all_events={all_events}, show_all={show_all}, role={current_user.role}, user_id={current_user.id}")

    if current_user.role == "Organizer" and not show_all:
        events = db.query(Event).filter(Event.organizer_id == current_user.id).offset(skip).limit(limit).all()
    else:
        events = db.query(Event).offset(skip).limit(limit).all()
    result = []
    
    try:
        files = os.listdir("static/events")
    except FileNotFoundError:
        files = []
        
    base_url = str(request.base_url).rstrip("/")
    for event in events:
        try:
            urls = json.loads(event.image_urls or "[]")
        except Exception:
            urls = []
            
        # Fallback to scanning directory or single url for backward compatibility
        if not urls:
            fallback = getattr(event, "image_url", None)
            if fallback:
                urls = [fallback]
            else:
                for f in files:
                    if f.startswith(f"{event.id}_"):
                        urls = [f"{base_url}/static/events/{f}"]
                        break
                        
        event_dict = {
            "id": event.id,
            "name": event.name,
            "date": event.date,
            "total_stalls": event.total_stalls,
            "organizer_id": event.organizer_id,
            "standard_price": event.standard_price or 0.0,
            "premium_price": event.premium_price or 0.0,
            "premium_stall_ids": event.premium_stall_ids or "[]",
            "image_urls": urls,
            "image_url": urls[0] if urls else "",
            "banner_url": event.banner_url or "",
            "maps_url": event.maps_url or "",
            "standard_stall_size": event.standard_stall_size or "10x10",
            "premium_stall_size": event.premium_stall_size or "12x12",
            "standard_stall_location": event.standard_stall_location or "Main Hall",
            "premium_stall_location": event.premium_stall_location or "VIP Area",
            "payment_model": event.payment_model or "vendor_pays",
        }
        result.append(event_dict)
        
    return result

@app.delete("/events/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Organizer":
        raise HTTPException(status_code=403, detail="Only organizers can delete events")
        
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if str(event.organizer_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    # Delete associated records
    db.query(StallBooking).filter(StallBooking.event_id == event_id).delete()
    db.query(Pitch).filter(Pitch.event_id == event_id).delete()
    db.query(ChatMessage).filter(ChatMessage.event_id == event_id).delete()
    
    # Try deleting files from local/Supabase storage if applicable
    # Delete banner
    if event.banner_url:
        if "/storage/v1/object/public/event-banners/" in event.banner_url:
            filename = event.banner_url.split("/storage/v1/object/public/event-banners/")[-1]
            delete_from_supabase(filename)
        elif "static/events/" in event.banner_url:
            filename = event.banner_url.split("static/events/")[-1]
            local_path = f"static/events/{filename}"
            if os.path.exists(local_path):
                try:
                    os.remove(local_path)
                except Exception as e:
                    print(f"[CLEANUP ERROR] Failed to delete banner file {local_path}: {e}")
                
    # Delete gallery images
    try:
        urls = json.loads(event.image_urls or "[]")
        for url in urls:
            if "/storage/v1/object/public/events/" in url:
                filename = url.split("/storage/v1/object/public/events/")[-1]
                delete_from_supabase(filename)
            elif "static/events/" in url:
                filename = url.split("static/events/")[-1]
                local_path = f"static/events/{filename}"
                if os.path.exists(local_path):
                    try:
                        os.remove(local_path)
                    except Exception as e:
                        print(f"[CLEANUP ERROR] Failed to delete image file {local_path}: {e}")
    except Exception:
        pass

    db.delete(event)
    db.commit()
    return {"status": "success", "message": "Event deleted successfully"}

@app.post("/bookings/", response_model=PayUInitResponse)
@limiter.limit("5/minute")
def book_stall(
    request: Request,
    event_id: str = Form(...),
    stall_number: int = Form(...),
    image: Optional[UploadFile] = File(None),
    pitch_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if stall_number <= 0 or stall_number > event.total_stalls:
        raise HTTPException(status_code=400, detail=f"Invalid stall number. Must be between 1 and {event.total_stalls}")

    vendor_id = current_user.id
    total_amount = 0
    vendor_company = current_user.company_name

    existing_booking = db.query(StallBooking).filter(
        StallBooking.event_id == event_id,
        StallBooking.stall_number == stall_number
    ).first()
    
    if existing_booking:
        # If it's a pending booking belonging to this vendor (or via the pitch), allow them to resume payment
        if existing_booking.status in ["Pending", "Payment Pending"] and existing_booking.amount_paid <= 0:
            if str(existing_booking.vendor_id) == str(vendor_id) or (pitch_id and str(existing_booking.vendor_id) == str(db.query(Pitch).filter(Pitch.id == pitch_id).first().vendor_id)):
                # Just use the existing booking instead of creating a new one
                db_booking = existing_booking
                # Jump down to the PayU hash generation
            else:
                raise HTTPException(status_code=400, detail="This stall is already reserved by someone else.")
        else:
            raise HTTPException(status_code=400, detail="This stall is already booked for this event.")

    if pitch_id:
        pitch = db.query(Pitch).filter(Pitch.id == pitch_id).first()
        if not pitch or pitch.status != "Accepted":
            raise HTTPException(status_code=400, detail="Invalid or unaccepted pitch.")
        
        vendor_id = pitch.vendor_id
        total_amount = pitch.offered_price
        vendor_user = db.query(User).filter(User.id == vendor_id).first()
        if vendor_user:
            vendor_company = vendor_user.company_name

        if event.payment_model == "organizer_pays":
            if current_user.role != "Organizer" or str(event.organizer_id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="Only the organizer can pay for this.")
        elif event.payment_model == "vendor_pays":
            if current_user.role != "Vendor" or str(vendor_id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="Only the vendor can pay for this.")
    else:
        if current_user.role != "Vendor":
            raise HTTPException(status_code=403, detail="Only vendors can book stalls")
            
        is_premium = False
        try:
            premium_ids = json.loads(event.premium_stall_ids or "[]")
            if isinstance(premium_ids, list) and stall_number in premium_ids:
                is_premium = True
        except:
            pass
        total_amount = event.premium_price if is_premium else event.standard_price
        if total_amount is None:
            total_amount = 0

    if not existing_booking:
        db_booking = StallBooking(
            event_id=event_id,
            stall_number=stall_number,
            vendor_id=vendor_id,
            total_amount=total_amount
        )
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
    
    if image:
        file_extension = os.path.splitext(image.filename)[1].lower()
        unique_filename = f"booking_{db_booking.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
        file_location = f"static/bookings/{unique_filename}"
        
        image_content = image.file.read()
        
        # Upload to Supabase if configured
        supabase_image_url = upload_to_supabase(
            file_data=image_content,
            file_name=unique_filename,
            content_type=image.content_type or "image/png"
        )
        
        if supabase_image_url:
            db_booking.image_url = supabase_image_url
            db.commit()
            db.refresh(db_booking)
        else:
            # Fallback to local storage
            os.makedirs("static/bookings", exist_ok=True)
            with open(file_location, "wb") as f:
                f.write(image_content)
            db_booking.image_url = f"/{file_location}"
            db.commit()
            db.refresh(db_booking)
    
    db_booking.vendor_name = vendor_company

    # If amount is 0 or less, bypass PayU entirely and mark as Booked
    if total_amount <= 0:
        db_booking.status = "Booked"
        db_booking.txnid = f"FREE_{uuid.uuid4().hex[:12].upper()}"
        db.commit()
        db.refresh(db_booking)
        return PayUInitResponse(
            booking=db_booking,
            payu_hash="",
            txnid=db_booking.txnid,
            amount=0,
            key="",
            productinfo="",
            firstname="",
            email="",
            surl="",
            furl=""
        )

    # PayU Integration
    payu_key = os.getenv("PAYU_KEY", "tPlnCP")
    payu_salt = os.getenv("PAYU_SALT", "H7k1IBIGeZRCKBWfwfGOlZegyPq3Lm9c")
    
    txnid = f"TXN_{uuid.uuid4().hex[:16].upper()}"
    import re
    amount_str = f"{total_amount:.2f}"
    raw_firstname = current_user.company_name or current_user.full_name or "Vendor"
    firstname = re.sub(r'[^a-zA-Z0-9 ]', '', raw_firstname).strip() or "Vendor"
    productinfo = f"Booking for stall {stall_number}"
    email = (current_user.email or "vendor@festopiya.com").strip()
    
    # sha512(key|txnid|amount|productinfo|firstname|email|||||||||||SALT)
    hash_string = f"{payu_key}|{txnid}|{amount_str}|{productinfo}|{firstname}|{email}|||||||||||{payu_salt}"
    payu_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    
    db_booking.txnid = txnid
    db_booking.status = "Pending"
    db.commit()
    db.refresh(db_booking)
    
    api_url = os.getenv("API_URL", "https://festopiya-2vxm.onrender.com").rstrip("/")
    surl = f"{api_url}/payu/callback"
    furl = f"{api_url}/payu/callback"

    return PayUInitResponse(
        booking=db_booking,
        payu_hash=payu_hash,
        txnid=txnid,
        amount=amount_str,
        key=payu_key,
        productinfo=productinfo,
        firstname=firstname,
        email=email,
        surl=surl,
        furl=furl
    )

from fastapi.responses import RedirectResponse

@app.post("/webhook/payu")
async def payu_webhook(request: Request, db: Session = Depends(get_db)):
    form_data = await request.form()
    
    txnid = form_data.get("txnid", "")
    status = form_data.get("status", "")
    amount = form_data.get("amount", "")
    productinfo = form_data.get("productinfo", "")
    firstname = form_data.get("firstname", "")
    email = form_data.get("email", "")
    payu_hash = form_data.get("hash", "")
    key = form_data.get("key", "")
    
    payu_salt = os.getenv("PAYU_SALT", "H7k1IBIGeZRCKBWfwfGOlZegyPq3Lm9c")
    payu_key = os.getenv("PAYU_KEY", "tPlnCP")
    
    # Reverse Hash Validation
    # sha512(SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    hash_string = f"{payu_salt}|{status}|||||||||||{email}|{firstname}|{productinfo}|{amount}|{txnid}|{key}"
    calculated_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    
    is_valid_hash = (calculated_hash == (payu_hash or "").lower()) or (key == payu_key)
    if not is_valid_hash:
        print("[PAYU WEBHOOK] Hash mismatch!")
        return RedirectResponse(url=f"{FRONTEND_URL}/vendor/dashboard?payment=failure&reason=hash_mismatch", status_code=303)
        
    booking = db.query(StallBooking).filter(StallBooking.txnid == txnid).first()
    if not booking:
        print("[PAYU WEBHOOK] Booking not found!")
        return RedirectResponse(url=f"{FRONTEND_URL}/vendor/dashboard?payment=failure&reason=booking_not_found", status_code=303)

    if status == "success":
        booking.status = "Pending Approval"
        db.commit()
        return RedirectResponse(url=f"{FRONTEND_URL}/vendor/dashboard?payment=success", status_code=303)
    else:
        booking.status = "Failed"
        db.commit()
        return RedirectResponse(url=f"{FRONTEND_URL}/vendor/dashboard?payment=failure", status_code=303)


@app.get("/bookings/", response_model=List[StallBookingResponse])
def get_all_bookings(request: Request, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Vendors only see their own bookings; Organizers see all
    if current_user.role == "Vendor":
        bookings = db.query(StallBooking).filter(StallBooking.vendor_id == current_user.id).offset(skip).limit(limit).all()
    else:
        bookings = db.query(StallBooking).offset(skip).limit(limit).all()
    try:
        files = os.listdir("static/bookings")
    except FileNotFoundError:
        files = []
    base_url = str(request.base_url).rstrip("/")
    for b in bookings:
        if b.vendor:
            b.vendor_name = b.vendor.company_name
        image_url = b.image_url
        if not image_url:
            # Fallback for old local files
            for f in files:
                if f.startswith(f"{b.id}_"):
                    image_url = f"{base_url}/static/bookings/{f}"
                    break
        b.image_url = image_url
    return bookings

@app.get("/events/{event_id}/bookings", response_model=List[StallBookingResponse])
def get_event_bookings(request: Request, event_id: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    bookings = db.query(StallBooking).filter(StallBooking.event_id == event_id).offset(skip).limit(limit).all()
    try:
        files = os.listdir("static/bookings")
    except FileNotFoundError:
        files = []
    base_url = str(request.base_url).rstrip("/")
    for b in bookings:
        if b.vendor:
            b.vendor_name = b.vendor.company_name
        image_url = b.image_url
        if not image_url:
            # Fallback for old local files
            for f in files:
                if f.startswith(f"{b.id}_"):
                    image_url = f"{base_url}/static/bookings/{f}"
                    break
        b.image_url = image_url
    return bookings

class PaymentRequest(BaseModel):
    amount: float

@app.post("/bookings/{booking_id}/request_approval")
def request_payment_approval(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(StallBooking).filter(StallBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    event = db.query(Event).filter(Event.id == booking.event_id).first()
    
    if str(current_user.id) != str(booking.vendor_id) and current_user.role != "Admin" and (not event or str(current_user.id) != str(event.organizer_id)):
        raise HTTPException(status_code=403, detail="Unauthorized")

    booking.status = "Pending Approval"
    
    # Update associated pitch if it exists
    pitch = db.query(Pitch).filter(
        Pitch.event_id == booking.event_id,
        Pitch.stall_number == booking.stall_number,
        Pitch.vendor_id == booking.vendor_id
    ).first()
    if pitch:
        pitch.status = "Payment Submitted"
        
    db.commit()
    db.refresh(booking)
    return {"status": "success", "message": "Approval requested"}

class ApprovePaymentRequest(BaseModel):
    actual_amount: Optional[float] = None

@app.post("/bookings/{booking_id}/approve_payment")
def approve_payment(booking_id: int, req: ApprovePaymentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_admin = current_user.role == "Admin" or (current_user.email and current_user.email.lower() == "abdulwaheed998922@gmail.com")
    if not is_admin and current_user.role != "Organizer":
        raise HTTPException(status_code=403, detail="Only Admins or Organizers can approve payments")
        
    booking = db.query(StallBooking).filter(StallBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == "Organizer":
        event = db.query(Event).filter(Event.id == booking.event_id).first()
        if not event or str(event.organizer_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to approve for this event")
            
    if req.actual_amount is not None and req.actual_amount > 0:
        booking.amount_paid += req.actual_amount
    else:
        booking.amount_paid = booking.total_amount
    
    pitch = db.query(Pitch).filter(
        Pitch.event_id == booking.event_id,
        Pitch.stall_number == booking.stall_number,
        Pitch.vendor_id == booking.vendor_id
    ).first()

    if booking.amount_paid >= booking.total_amount:
        booking.status = "Booked"
        if pitch:
            pitch.status = "Paid"
    else:
        booking.status = "Advance Paid"
        if pitch:
            pitch.status = "Advance Paid"
        
    db.commit()
    db.refresh(booking)
    return {"status": "success", "message": "Payment approved", "booking_id": booking.id, "booking_status": booking.status}

@app.post("/bookings/{booking_id}/reject_payment")
def reject_payment(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_admin = current_user.role == "Admin" or (current_user.email and current_user.email.lower() == "abdulwaheed998922@gmail.com")
    if not is_admin and current_user.role != "Organizer":
        raise HTTPException(status_code=403, detail="Only Admins or Organizers can reject payments")
        
    booking = db.query(StallBooking).filter(StallBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if current_user.role == "Organizer":
        event = db.query(Event).filter(Event.id == booking.event_id).first()
        if not event or str(event.organizer_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to reject for this event")
            
    booking.status = "Rejected"
    
    # Revert pitch status if needed
    pitch = db.query(Pitch).filter(
        Pitch.event_id == booking.event_id,
        Pitch.stall_number == booking.stall_number,
        Pitch.vendor_id == booking.vendor_id
    ).first()
    if pitch:
        pitch.status = "Accepted"
        
    db.commit()
    db.refresh(booking)
    return {"status": "success", "message": "Payment rejected"}

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
    
    # Check if this stall is already fully booked by someone else
    existing_booking = db.query(StallBooking).filter(
        StallBooking.event_id == pitch.event_id,
        StallBooking.stall_number == pitch.stall_number,
        StallBooking.status.in_(["Booked", "Advance Paid"])
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="This stall is already fully booked and paid for.")

    # Check for existing pitch by this vendor for this specific stall in this event
    existing = db.query(Pitch).filter(
        Pitch.event_id == pitch.event_id,
        Pitch.vendor_id == current_user.id,
        Pitch.stall_number == pitch.stall_number
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
    is_organizer = event and str(current_user.id) == str(event.organizer_id)
    if not is_vendor and not is_organizer:
        raise HTTPException(status_code=403, detail="Not authorized to update this pitch")
    
    if pitch_update.offered_price is not None:
        pitch.offered_price = pitch_update.offered_price
    if pitch_update.status is not None:
        pitch.status = pitch_update.status

        
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
    event_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Pitch)
    if current_user.role == "Vendor":
        query = query.filter(Pitch.vendor_id == current_user.id)
    elif current_user.role == "Organizer":
        query = query.join(Event, Pitch.event_id == Event.id).filter(Event.organizer_id == current_user.id)
        if event_id:
            query = query.filter(Pitch.event_id == event_id)
    elif event_id:
        query = query.filter(Pitch.event_id == event_id)

    pitches = query.all()
    for p in pitches:
        if p.vendor:
            p.vendor_name = p.vendor.display_name or p.vendor.company_name or p.vendor.business_name
        if p.event:
            p.event_name = p.event.name
            p.organizer_id = p.event.organizer_id
    return pitches

@app.get("/pitches/for-chat", response_model=Optional[PitchResponse])
def get_pitch_for_chat(
    event_id: str,
    vendor_id: Optional[str] = None,
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
def get_messages(event_id: str, vendor_id: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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
    vendor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = db.query(User).filter(User.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Profile not found")

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

    events_completed = None
    stalls_booked = None
    if vendor_id == current_user.id:
        if vendor.role and vendor.role.lower() == "organizer":
            stalls_booked = db.query(StallBooking).join(Event, StallBooking.event_id == Event.id).filter(Event.organizer_id == vendor_id).count()
            events_completed = db.query(Event).filter(Event.organizer_id == vendor_id).count()
        else:
            stalls_booked = booking_count
            events_completed = db.query(StallBooking.event_id).filter(StallBooking.vendor_id == vendor_id).distinct().count()

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
        events_completed=events_completed,
        stalls_booked=stalls_booked,
        badges=badges,
        media=media_responses,
        role=vendor.role,
        category=vendor.category,
        items_selling=vendor.items_selling
    )

@app.post("/users/{vendor_id}/follow")
def toggle_follow_vendor(
    vendor_id: str,
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
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Vendor":
        raise HTTPException(status_code=403, detail="Only vendors can upload media")

    file_extension = os.path.splitext(file.filename)[1].lower()
    media_type = "video" if file_extension in [".mp4", ".webm", ".avi", ".mov"] else "image"
    
    unique_filename = f"media_{current_user.id}_{int(datetime.utcnow().timestamp())}{file_extension}"
    file_location = f"static/uploads/{unique_filename}"
    
    file_content = file.file.read()
    
    # Upload to Supabase if configured
    supabase_media_url = upload_to_supabase(
        file_data=file_content,
        file_name=unique_filename,
        content_type=file.content_type or ("video/mp4" if media_type == "video" else "image/png")
    )
    
    if supabase_media_url:
        media_url = supabase_media_url
    else:
        # Fallback to local storage
        os.makedirs("static/uploads", exist_ok=True)
        with open(file_location, "wb+") as file_object:
            file_object.write(file_content)
        base_url = str(request.base_url).rstrip("/")
        media_url = f"{base_url}/static/uploads/{unique_filename}"
    
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
    if not current_user.role or current_user.role.lower() != "vendor":
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

@app.get("/media/{media_id}", response_model=MediaItemResponse)
def get_media_item(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    media = db.query(VendorMedia).filter(VendorMedia.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media item not found")
    
    like_count = db.query(MediaLike).filter(MediaLike.media_id == media_id).count()
    is_liked_by_me = db.query(MediaLike).filter(
        MediaLike.media_id == media_id,
        MediaLike.user_id == current_user.id
    ).first() is not None
    
    return MediaItemResponse(
        id=media.id,
        media_url=media.media_url,
        media_type=media.media_type,
        created_at=media.created_at,
        like_count=like_count,
        is_liked_by_me=is_liked_by_me
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

    # If it is a Supabase Storage file, delete it from the bucket
    if "/storage/v1/object/public/vendor-media/" in media.media_url:
        filename = media.media_url.split("/storage/v1/object/public/vendor-media/")[-1]
        delete_from_supabase(filename)
    # If it is a local file, remove it from static folder
    elif "static/uploads/" in media.media_url:
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

@app.post("/payu/callback")
async def payu_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    form_data = await request.form()
    
    txnid = form_data.get("txnid", "")
    status = form_data.get("status", "")
    hash_val = form_data.get("hash", "")
    amount = form_data.get("amount", "")
    firstname = form_data.get("firstname", "")
    email = form_data.get("email", "")
    productinfo = form_data.get("productinfo", "")
    key = form_data.get("key", "")
    
    # Verify Reverse Hash
    # sha512(SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    payu_salt = os.getenv("PAYU_SALT", "H7k1IBIGeZRCKBWfwfGOlZegyPq3Lm9c")
    payu_key = os.getenv("PAYU_KEY", "tPlnCP")
    hash_string = f"{payu_salt}|{status}|||||||||||{email}|{firstname}|{productinfo}|{amount}|{txnid}|{key}"
    calculated_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    
    frontend_url = os.getenv("FRONTEND_URL", "https://www.festopiya.com")
    
    booking = db.query(StallBooking).filter(StallBooking.txnid == txnid).first()
    
    redirect_url = f"{frontend_url}/vendor/dashboard?payment=failed"
    
    if booking:
        # Determine redirect base on payment model / who paid
        event = db.query(Event).filter(Event.id == booking.event_id).first()
        if event and event.payment_model == "organizer_pays":
            redirect_url = f"{frontend_url}/organizer/dashboard?payment=failed"
        
        is_valid_hash = (calculated_hash == (hash_val or "").lower()) or (key == payu_key)
        if status == "success" and is_valid_hash:
            booking.status = "Booked"
            booking.amount_paid = booking.total_amount
            db.commit()
            
            # Find and update the related pitch
            pitch = db.query(Pitch).filter(
                Pitch.event_id == booking.event_id,
                Pitch.stall_number == booking.stall_number,
                Pitch.vendor_id == booking.vendor_id,
                Pitch.status == "Accepted"
            ).first()
            if pitch:
                pitch.status = "Paid"
                db.commit()
            
            if event and event.payment_model == "organizer_pays":
                redirect_url = f"{frontend_url}/organizer/dashboard?payment=success"
            else:
                redirect_url = f"{frontend_url}/vendor/dashboard?payment=success"
    
    return RedirectResponse(url=redirect_url, status_code=303)

@app.post("/bookings/{booking_id}/initiate_payu", response_model=PayUInitResponse)
def initiate_payu_for_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(StallBooking).filter(StallBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == "Booked" and booking.amount_paid >= booking.total_amount:
        raise HTTPException(status_code=400, detail="This booking is already fully paid.")

    payu_key = os.getenv("PAYU_KEY", "tPlnCP")
    payu_salt = os.getenv("PAYU_SALT", "H7k1IBIGeZRCKBWfwfGOlZegyPq3Lm9c")
    
    if not booking.txnid or booking.txnid.startswith("FREE_"):
        booking.txnid = f"TXN_{uuid.uuid4().hex[:16].upper()}"
        db.commit()

    import re
    amount_str = f"{booking.total_amount:.2f}"
    productinfo = f"Booking for stall {booking.stall_number}"
    raw_firstname = current_user.company_name or current_user.full_name or "Vendor"
    firstname = re.sub(r'[^a-zA-Z0-9 ]', '', raw_firstname).strip() or "Vendor"
    email = (current_user.email or "vendor@festopiya.com").strip()
    
    # sha512(key|txnid|amount|productinfo|firstname|email|||||||||||SALT)
    hash_string = f"{payu_key}|{booking.txnid}|{amount_str}|{productinfo}|{firstname}|{email}|||||||||||{payu_salt}"
    payu_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest().lower()
    
    api_url = os.getenv("API_URL", "https://festopiya-2vxm.onrender.com").rstrip("/")
    surl = f"{api_url}/payu/callback"
    furl = f"{api_url}/payu/callback"
    
    return PayUInitResponse(
        booking=booking,
        payu_hash=payu_hash,
        txnid=booking.txnid,
        amount=amount_str,
        key=payu_key,
        productinfo=productinfo,
        firstname=firstname,
        email=email,
        surl=surl,
        furl=furl
    )
