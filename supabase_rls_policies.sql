-- ==========================================
-- 1. USERS TABLE POLICIES
-- ==========================================
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/authenticated) to read user profiles
CREATE POLICY "Allow public read of user profiles" 
ON users FOR SELECT 
USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = id) 
WITH CHECK (auth.uid()::text = id);


-- ==========================================
-- 2. EVENTS TABLE POLICIES
-- ==========================================
-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read of events (for the browse feed)
CREATE POLICY "Allow public read of events" 
ON events FOR SELECT 
USING (true);

-- Allow authenticated organizers to create events
CREATE POLICY "Allow authenticated organizers to insert events" 
ON events FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = organizer_id);

-- Allow only the creator of the event to update it
CREATE POLICY "Allow creator to update events" 
ON events FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = organizer_id) 
WITH CHECK (auth.uid()::text = organizer_id);

-- Allow only the creator of the event to delete it
CREATE POLICY "Allow creator to delete events" 
ON events FOR DELETE 
TO authenticated 
USING (auth.uid()::text = organizer_id);


-- ==========================================
-- 3. STALL BOOKINGS TABLE POLICIES
-- ==========================================
-- Enable Row Level Security
ALTER TABLE stall_bookings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated vendors to create bookings
CREATE POLICY "Allow authenticated vendors to insert bookings" 
ON stall_bookings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = vendor_id);

-- Allow SELECT only for the vendor who booked OR the organizer of the event
CREATE POLICY "Allow vendor and organizer to select bookings" 
ON stall_bookings FOR SELECT 
TO authenticated 
USING (
  auth.uid()::text = vendor_id 
  OR auth.uid()::text = (SELECT organizer_id FROM events WHERE events.id = event_id)
);

-- Allow UPDATE only for the vendor who booked OR the organizer of the event
CREATE POLICY "Allow vendor and organizer to update bookings" 
ON stall_bookings FOR UPDATE 
TO authenticated 
USING (
  auth.uid()::text = vendor_id 
  OR auth.uid()::text = (SELECT organizer_id FROM events WHERE events.id = event_id)
)
WITH CHECK (
  auth.uid()::text = vendor_id 
  OR auth.uid()::text = (SELECT organizer_id FROM events WHERE events.id = event_id)
);

-- Allow DELETE only for the vendor who booked OR the organizer of the event
CREATE POLICY "Allow vendor and organizer to delete bookings" 
ON stall_bookings FOR DELETE 
TO authenticated 
USING (
  auth.uid()::text = vendor_id 
  OR auth.uid()::text = (SELECT organizer_id FROM events WHERE events.id = event_id)
);
