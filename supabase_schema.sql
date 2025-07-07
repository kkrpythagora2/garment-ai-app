-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  avatar_url TEXT,
  website TEXT,
  PRIMARY KEY (id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create a table for garment designs
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_garment_image_url TEXT NOT NULL,
  design_prompt TEXT NOT NULL,
  style_swatch_image_url TEXT,
  concept_image_url TEXT,
  status TEXT DEFAULT 'pending_concept_generation',
  mask_image_url TEXT,
  pattern_dxf_url TEXT,
  fit_simulation_gif_url TEXT,
  bom_details JSONB,
  tech_pack_url TEXT
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Designs are viewable by their owner." ON designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own designs." ON designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own designs." ON designs FOR UPDATE USING (auth.uid() = user_id);

-- Create a table for body measurements
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  measurements JSONB NOT NULL -- e.g., { "height": 170, "bust": 90, "waist": 70, "hip": 95 }
);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Body measurements are viewable by their owner." ON body_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own body measurements." ON body_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own body measurements." ON body_measurements FOR UPDATE USING (auth.uid() = user_id);

-- Set up storage for images and files
INSERT INTO storage.buckets (id, name, public) VALUES
('garment_images', 'garment_images', TRUE),
('design_concepts', 'design_concepts', TRUE),
('masks', 'masks', TRUE),
('patterns', 'patterns', TRUE),
('fit_simulations', 'fit_simulations', TRUE),
('tech_packs', 'tech_packs', TRUE);

-- Add policies for storage buckets
CREATE POLICY "Allow public read access to garment_images" ON storage.objects FOR SELECT USING (bucket_id = 'garment_images');
CREATE POLICY "Allow authenticated inserts to garment_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'garment_images' AND auth.role() = 'authenticated');
CREATE POLICY "Allow public read access to design_concepts" ON storage.objects FOR SELECT USING (bucket_id = 'design_concepts');
CREATE POLICY "Allow authenticated inserts to design_concepts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'design_concepts' AND auth.role() = 'authenticated');
CREATE POLICY "Allow public read access to masks" ON storage.objects FOR SELECT USING (bucket_id = 'masks');
CREATE POLICY "Allow authenticated inserts to masks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'masks' AND auth.role() = 'authenticated');
CREATE POLICY "Allow public read access to patterns" ON storage.objects FOR SELECT USING (bucket_id = 'patterns');
CREATE POLICY "Allow authenticated inserts to patterns" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'patterns' AND auth.role() = 'authenticated');
CREATE POLICY "Allow public read access to fit_simulations" ON storage.objects FOR SELECT USING (bucket_id = 'fit_simulations');
CREATE POLICY "Allow authenticated inserts to fit_simulations" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fit_simulations' AND auth.role() = 'authenticated');
CREATE POLICY "Allow public read access to tech_packs" ON storage.objects FOR SELECT USING (bucket_id = 'tech_packs');
CREATE POLICY "Allow authenticated inserts to tech_packs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tech_packs' AND auth.role() = 'authenticated');


