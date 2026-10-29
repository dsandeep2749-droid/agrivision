-- AgriVision AI Supabase Database Schema & RLS Setup
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'te')),
  default_location TEXT,
  default_lat NUMERIC(9, 6),
  default_lng NUMERIC(9, 6),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Crop Assessments Table
CREATE TABLE IF NOT EXISTS public.crop_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  crop_variety TEXT,
  growth_stage TEXT,
  farm_location TEXT,
  image_path TEXT,
  observed_symptoms TEXT,
  assessment_summary TEXT NOT NULL,
  possible_condition TEXT,
  condition_category TEXT,
  uncertainty_notes TEXT,
  visible_symptoms JSONB DEFAULT '[]'::jsonb,
  alternative_explanations JSONB DEFAULT '[]'::jsonb,
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  suggested_next_steps JSONB DEFAULT '[]'::jsonb,
  preventive_practices JSONB DEFAULT '[]'::jsonb,
  expert_review_triggers JSONB DEFAULT '[]'::jsonb,
  model_identifier TEXT,
  needs_followup BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Crop Observations Table
CREATE TABLE IF NOT EXISTS public.crop_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.crop_assessments(id) ON DELETE SET NULL,
  observation_text TEXT NOT NULL,
  observed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.crop_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.crop_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_crop_name ON public.crop_assessments(crop_name);
CREATE INDEX IF NOT EXISTS idx_observations_user_id ON public.crop_observations(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_assessment_id ON public.crop_observations(assessment_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_observations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for Crop Assessments
CREATE POLICY "Users can view their own assessments"
  ON public.crop_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments"
  ON public.crop_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.crop_assessments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON public.crop_assessments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Crop Observations
CREATE POLICY "Users can view their own observations"
  ON public.crop_observations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own observations"
  ON public.crop_observations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own observations"
  ON public.crop_observations FOR DELETE
  USING (auth.uid() = user_id);

-- Automatic Profile Creation Trigger on Sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_language, default_location)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(new.raw_user_meta_data->>'default_location', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Supabase Storage Bucket Setup for crop images
-- Note: Create a bucket named 'crop-images' in Supabase Dashboard -> Storage
-- Set to Private, or add the following policies:
-- INSERT policy:
-- (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1])
-- SELECT policy:
-- (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1])
