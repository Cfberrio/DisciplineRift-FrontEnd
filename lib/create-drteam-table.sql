-- Create the drteam table for coach applications
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.drteam (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    sport VARCHAR(50) NOT NULL CHECK (sport IN ('Volleyball', 'Tennis', 'Pickleball')),
    description TEXT NOT NULL,
    resume_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_drteam_email ON public.drteam(email);

-- Create an index on sport for filtering
CREATE INDEX IF NOT EXISTS idx_drteam_sport ON public.drteam(sport);

-- Create an index on status for admin filtering
CREATE INDEX IF NOT EXISTS idx_drteam_status ON public.drteam(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.drteam ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert applications
CREATE POLICY "Anyone can submit applications" ON public.drteam
    FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to view their own applications
CREATE POLICY "Users can view own applications" ON public.drteam
    FOR SELECT USING (auth.email() = email);

-- Create policy for admin users to view all applications (optional)
-- Note: You'll need to set up admin roles in your auth system
-- CREATE POLICY "Admins can view all applications" ON public.drteam
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_drteam_updated_at 
    BEFORE UPDATE ON public.drteam 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.drteam TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE drteam_id_seq TO anon, authenticated;