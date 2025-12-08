-- Add status column to team table
-- This column replaces the isactive and isongoing logic for registration
-- Teams with status='open' or status='ongoing' will be shown in the registration section

-- Add the status column to the team table
ALTER TABLE team 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open';

-- Add comment to explain the column
COMMENT ON COLUMN team.status IS 'Status of the team for registration purposes. Teams with status="open" or status="ongoing" are shown in the registration section. Other values: "closed", "full", "cancelled", "pending", etc.';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_team_status ON team(status) WHERE status IN ('open', 'ongoing');

-- Update existing teams based on isactive and isongoing values
-- If both isactive=true AND isongoing=true, set status='open'
-- Otherwise, set status='closed'
UPDATE team 
SET status = CASE 
  WHEN isactive = true AND isongoing = true THEN 'open'
  ELSE 'closed'
END
WHERE status IS NULL;

-- Add a constraint to ensure status is never null
ALTER TABLE team ALTER COLUMN status SET NOT NULL;

