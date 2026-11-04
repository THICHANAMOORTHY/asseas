-- CampusHire University Placement System
-- Supabase PostgreSQL Database Schema
-- Project ID: avvaxbrkqjahuwjcvbkm

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('ECE', 'EEE', 'CSE', 'IT', 'MECH', 'CIVIL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Students Table (Matching Data Contract)
CREATE TABLE IF NOT EXISTS public.students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department department_type NOT NULL,
    gender gender_type NOT NULL,
    batch VARCHAR(20) DEFAULT '2025',
    cgpa NUMERIC(4, 2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10.0),
    tenth_percentage NUMERIC(5, 2) NOT NULL CHECK (tenth_percentage >= 0 AND tenth_percentage <= 100),
    twelfth_percentage NUMERIC(5, 2) NOT NULL CHECK (twelfth_percentage >= 0 AND twelfth_percentage <= 100),
    aptitude_score NUMERIC(5, 2) NOT NULL CHECK (aptitude_score >= 0 AND aptitude_score <= 100),
    technical_score NUMERIC(5, 2) NOT NULL CHECK (technical_score >= 0 AND technical_score <= 100),
    communication_score NUMERIC(5, 2) NOT NULL CHECK (communication_score >= 0 AND communication_score <= 100),
    programming_score NUMERIC(5, 2) NOT NULL CHECK (programming_score >= 0 AND programming_score <= 100),
    internships INTEGER NOT NULL DEFAULT 0 CHECK (internships >= 0),
    projects INTEGER NOT NULL DEFAULT 0 CHECK (projects >= 0),
    certifications INTEGER NOT NULL DEFAULT 0 CHECK (certifications >= 0),
    hackathon_participation INTEGER NOT NULL DEFAULT 0 CHECK (hackathon_participation >= 0),
    backlogs INTEGER NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
    attendance_percentage NUMERIC(5, 2) NOT NULL CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
    interview_score NUMERIC(5, 2) NOT NULL CHECK (interview_score >= 0 AND interview_score <= 100),
    extracurricular_activities INTEGER NOT NULL DEFAULT 0,
    placed INTEGER NOT NULL CHECK (placed IN (0, 1)),
    predicted_probability NUMERIC(4, 3),
    predicted_label VARCHAR(50),
    mentor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mentoring Notes Table
CREATE TABLE IF NOT EXISTS public.mentoring_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50) REFERENCES public.students(student_id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    author VARCHAR(255) NOT NULL,
    author_role VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    note TEXT NOT NULL,
    action_item TEXT,
    status VARCHAR(50) DEFAULT 'In Progress',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Prediction History / Simulation Logs
CREATE TABLE IF NOT EXISTS public.prediction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(50),
    input_features JSONB NOT NULL,
    probability NUMERIC(4, 3) NOT NULL,
    confidence_band VARCHAR(20),
    placement_tier VARCHAR(100),
    top_factors JSONB,
    suggestions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;

-- 6. Read / Write Policies for Anon / Authenticated
CREATE POLICY "Allow public read access to students" 
ON public.students FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert/update to students" 
ON public.students FOR ALL USING (true);

CREATE POLICY "Allow public read to mentoring notes" 
ON public.mentoring_notes FOR SELECT USING (true);

CREATE POLICY "Allow public insert to mentoring notes" 
ON public.mentoring_notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow logging predictions" 
ON public.prediction_logs FOR ALL USING (true);

