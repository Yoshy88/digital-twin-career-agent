CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  intent VARCHAR(100) NOT NULL CHECK (intent IN ('recruiter', 'hiring_manager', 'collaborator', 'other')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES visitors(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES visitors(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS owner_profile (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  skills TEXT[] NOT NULL,
  experience TEXT NOT NULL,
  available_for TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO owner_profile (id, name, role, skills, experience, available_for, summary)
VALUES (
  1,
  'Dwight Richard Mongaya',
  'Full Stack Developer',
  ARRAY['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AI/ML', 'Vercel'],
  'Building modern full-stack and AI-powered applications',
  ARRAY['Full-time roles', 'freelance projects', 'collaborations'],
  'Dwight is a Full Stack Developer who builds modern AI-powered web applications with strong product-focused execution across frontend and backend.'
)
ON CONFLICT (id) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS visitors_email_unique_idx
  ON visitors (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors (created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_started_at_idx ON conversations (started_at DESC);
CREATE INDEX IF NOT EXISTS conversations_ended_at_idx ON conversations (ended_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_requested_at_idx ON bookings (requested_at DESC);
