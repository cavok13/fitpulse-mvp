# FitPulse Database Schema (PostgreSQL)

## Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'email',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  goals TEXT[] DEFAULT '{}',
  fitness_level VARCHAR(20) DEFAULT 'beginner',
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exercises
CREATE TABLE exercises (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  muscle_group VARCHAR(30) NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  difficulty VARCHAR(20) NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  category VARCHAR(20) NOT NULL,
  description TEXT,
  instructions TEXT[] DEFAULT '{}',
  tips TEXT[] DEFAULT '{}',
  calories_per_minute DECIMAL(4,2)
);

-- Workout Plans
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  goal VARCHAR(30),
  difficulty VARCHAR(20),
  duration_weeks INTEGER,
  sessions_per_week INTEGER,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Workout Sessions
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES workout_plans(id),
  name VARCHAR(100) NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active'
);

-- Workout Session Sets
CREATE TABLE workout_session_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id VARCHAR(10) REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  reps INTEGER,
  weight DECIMAL(6,2),
  rest_seconds INTEGER,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social Posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  content TEXT,
  workout_session_id UUID REFERENCES workout_sessions(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social Reactions
CREATE TABLE social_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

-- Friendships
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  addressee_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(30) NOT NULL,
  target INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Meal Logs
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  calories INTEGER,
  protein DECIMAL(6,2),
  carbs DECIMAL(6,2),
  fat DECIMAL(6,2),
  logged_at TIMESTAMP DEFAULT NOW()
);

-- Nutrition Targets
CREATE TABLE nutrition_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  calories INTEGER DEFAULT 2000,
  protein DECIMAL(6,2) DEFAULT 150,
  carbs DECIMAL(6,2) DEFAULT 250,
  fat DECIMAL(6,2) DEFAULT 70,
  water_glasses INTEGER DEFAULT 8,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievement Events
CREATE TABLE achievement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(30) NOT NULL,
  title VARCHAR(200),
  body TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Key Indexes
```sql
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id, started_at DESC);
CREATE INDEX idx_social_posts_feed ON social_posts(created_at DESC);
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, logged_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_friendships_user ON friendships(requester_id, status);
```
