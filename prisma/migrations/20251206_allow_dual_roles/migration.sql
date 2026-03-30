-- Drop the old UserRole reference from User table
-- Note: user.role was removed, users can now have both candidate and recruiter profiles

-- Remove unique constraint on RecruiterProfile.userId to allow multiple profiles
ALTER TABLE "RecruiterProfile" DROP CONSTRAINT IF EXISTS "RecruiterProfile_userId_key";

-- Add index for efficient lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS "RecruiterProfile_userId_idx" ON "RecruiterProfile"("userId");
