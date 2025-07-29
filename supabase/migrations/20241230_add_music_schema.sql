-- Music Maker Studio Database Schema
-- This migration adds tables to support the music composition feature

-- Table for storing music compositions
CREATE TABLE IF NOT EXISTS music_compositions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(100) NOT NULL DEFAULT 'Untitled Song',
    bpm INTEGER NOT NULL DEFAULT 120 CHECK (bpm >= 60 AND bpm <= 200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    duration_seconds DECIMAL(10,2) DEFAULT 0,
    note_count INTEGER DEFAULT 0
);

-- Table for storing individual tracks within compositions
CREATE TABLE IF NOT EXISTS music_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    composition_id UUID REFERENCES music_compositions(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL DEFAULT 'Track',
    instrument VARCHAR(20) NOT NULL DEFAULT 'piano',
    volume DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (volume >= 0 AND volume <= 1),
    is_muted BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    track_order INTEGER NOT NULL DEFAULT 0
);

-- Table for storing individual notes within tracks
CREATE TABLE IF NOT EXISTS music_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE NOT NULL,
    pitch VARCHAR(3) NOT NULL, -- e.g., 'C', 'C#', 'D', etc.
    octave INTEGER NOT NULL CHECK (octave >= 1 AND octave <= 8),
    start_time DECIMAL(10,3) NOT NULL CHECK (start_time >= 0),
    duration DECIMAL(10,3) NOT NULL CHECK (duration > 0),
    velocity DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (velocity >= 0 AND velocity <= 1)
);

-- Table for tracking user music progress and achievements
CREATE TABLE IF NOT EXISTS music_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    unlocked_instruments TEXT[] DEFAULT '{"piano", "drums"}',
    compositions_created INTEGER DEFAULT 0,
    notes_placed INTEGER DEFAULT 0,
    ai_suggestions_used INTEGER DEFAULT 0,
    level VARCHAR(20) DEFAULT 'Beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS music_compositions_user_id_idx ON music_compositions(user_id);
CREATE INDEX IF NOT EXISTS music_compositions_created_at_idx ON music_compositions(created_at DESC);
CREATE INDEX IF NOT EXISTS music_tracks_composition_id_idx ON music_tracks(composition_id);
CREATE INDEX IF NOT EXISTS music_notes_track_id_idx ON music_notes(track_id);
CREATE INDEX IF NOT EXISTS music_notes_start_time_idx ON music_notes(start_time);

-- Row Level Security (RLS) policies
ALTER TABLE music_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_compositions
CREATE POLICY "Users can view their own compositions" ON music_compositions
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own compositions" ON music_compositions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own compositions" ON music_compositions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own compositions" ON music_compositions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for music_tracks
CREATE POLICY "Users can manage tracks in their compositions" ON music_tracks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM music_compositions 
            WHERE id = music_tracks.composition_id 
            AND (user_id = auth.uid() OR is_public = true)
        )
    );

-- RLS Policies for music_notes
CREATE POLICY "Users can manage notes in their tracks" ON music_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM music_tracks 
            JOIN music_compositions ON music_tracks.composition_id = music_compositions.id
            WHERE music_tracks.id = music_notes.track_id 
            AND (music_compositions.user_id = auth.uid() OR music_compositions.is_public = true)
        )
    );

-- RLS Policies for music_progress
CREATE POLICY "Users can view and update their own progress" ON music_progress
    FOR ALL USING (auth.uid() = user_id);

-- Function to update composition metadata when tracks/notes change
CREATE OR REPLACE FUNCTION update_composition_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update note count and duration for the composition
    UPDATE music_compositions 
    SET 
        note_count = (
            SELECT COUNT(*)
            FROM music_notes mn
            JOIN music_tracks mt ON mn.track_id = mt.id
            WHERE mt.composition_id = (
                CASE 
                    WHEN TG_TABLE_NAME = 'music_notes' THEN (
                        SELECT composition_id FROM music_tracks WHERE id = COALESCE(NEW.track_id, OLD.track_id)
                    )
                    WHEN TG_TABLE_NAME = 'music_tracks' THEN COALESCE(NEW.composition_id, OLD.composition_id)
                END
            )
        ),
        duration_seconds = (
            SELECT COALESCE(MAX(mn.start_time + mn.duration), 0)
            FROM music_notes mn
            JOIN music_tracks mt ON mn.track_id = mt.id
            WHERE mt.composition_id = (
                CASE 
                    WHEN TG_TABLE_NAME = 'music_notes' THEN (
                        SELECT composition_id FROM music_tracks WHERE id = COALESCE(NEW.track_id, OLD.track_id)
                    )
                    WHEN TG_TABLE_NAME = 'music_tracks' THEN COALESCE(NEW.composition_id, OLD.composition_id)
                END
            )
        ),
        updated_at = NOW()
    WHERE id = (
        CASE 
            WHEN TG_TABLE_NAME = 'music_notes' THEN (
                SELECT composition_id FROM music_tracks WHERE id = COALESCE(NEW.track_id, OLD.track_id)
            )
            WHEN TG_TABLE_NAME = 'music_tracks' THEN COALESCE(NEW.composition_id, OLD.composition_id)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to update composition metadata
CREATE TRIGGER update_composition_on_note_change
    AFTER INSERT OR UPDATE OR DELETE ON music_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_composition_metadata();

CREATE TRIGGER update_composition_on_track_change
    AFTER INSERT OR UPDATE OR DELETE ON music_tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_composition_metadata();

-- Function to update user music progress
CREATE OR REPLACE FUNCTION update_music_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure user has a progress record
    INSERT INTO music_progress (user_id) 
    VALUES (NEW.user_id) 
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update progress stats
    UPDATE music_progress 
    SET 
        compositions_created = (
            SELECT COUNT(*) FROM music_compositions WHERE user_id = NEW.user_id
        ),
        notes_placed = (
            SELECT COUNT(*)
            FROM music_notes mn
            JOIN music_tracks mt ON mn.track_id = mt.id
            JOIN music_compositions mc ON mt.composition_id = mc.id
            WHERE mc.user_id = NEW.user_id
        ),
        level = CASE 
            WHEN (SELECT COUNT(*) FROM music_compositions WHERE user_id = NEW.user_id) >= 10 THEN 'Maestro'
            WHEN (SELECT COUNT(*) FROM music_compositions WHERE user_id = NEW.user_id) >= 5 THEN 'Advanced'
            WHEN (SELECT COUNT(*) FROM music_compositions WHERE user_id = NEW.user_id) >= 2 THEN 'Intermediate'
            ELSE 'Beginner'
        END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when compositions are created
CREATE TRIGGER update_user_music_progress
    AFTER INSERT ON music_compositions
    FOR EACH ROW
    EXECUTE FUNCTION update_music_progress(); 