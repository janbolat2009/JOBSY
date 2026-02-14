-- Career Profiles
CREATE TABLE IF NOT EXISTS career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  career_score INT DEFAULT 0,
  target_role VARCHAR(255),
  target_salary INT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Career Roadmaps
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_title VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career Skill Gaps
CREATE TABLE IF NOT EXISTS career_skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill VARCHAR(255) NOT NULL,
  gap_percentage INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_skill_gaps ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as needed for your specific access rules)
CREATE POLICY "Users can view own career profile" ON career_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own career profile" ON career_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own career profile" ON career_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own roadmap" ON career_roadmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmap" ON career_roadmaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmap" ON career_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own skill gaps" ON career_skill_gaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own skill gaps" ON career_skill_gaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skill gaps" ON career_skill_gaps FOR INSERT WITH CHECK (auth.uid() = user_id);
