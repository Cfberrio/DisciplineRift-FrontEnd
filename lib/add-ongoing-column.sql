-- Add isongoing column to team table
-- This column indicates if a team is currently ongoing/active for registration
-- Teams must have both isactive=true AND isongoing=true to be shown in the frontend

-- Add the isongoing column to the team table
ALTER TABLE team 
ADD COLUMN IF NOT EXISTS isongoing BOOLEAN DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN team.isongoing IS 'Indicates if the team is currently ongoing and available for registration. Teams must have both isactive=true AND isongoing=true to be shown in the frontend.';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_team_active_ongoing ON team(isactive, isongoing) WHERE isactive = true AND isongoing = true;

-- Update existing teams to have isongoing=true by default
UPDATE team SET isongoing = true WHERE isongoing IS NULL;

-- Add a constraint to ensure isongoing is never null
ALTER TABLE team ALTER COLUMN isongoing SET NOT NULL;
