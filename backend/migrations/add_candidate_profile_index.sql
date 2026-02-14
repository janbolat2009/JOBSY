-- Add index for fast user_id lookups
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id 
ON candidate_profiles(user_id);

-- Check if index was created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'candidate_profiles';
