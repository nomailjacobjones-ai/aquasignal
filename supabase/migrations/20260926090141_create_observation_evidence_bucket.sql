-- Create observation-evidence storage bucket
-- Bucket: observation-evidence (public, image files only)
-- INSERT: anon + authenticated, image MIME types only
-- SELECT: anon + authenticated (dashboard display)
-- DELETE: authenticated only (operators manage evidence)

INSERT INTO storage.buckets (id, name, public)
VALUES ('observation-evidence', 'observation-evidence', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_observation_evidence" ON storage.objects;
CREATE POLICY "anon_upload_observation_evidence" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'observation-evidence'
    AND (metadata->>'mimetype') LIKE 'image/%'
  );

DROP POLICY IF EXISTS "anon_read_observation_evidence" ON storage.objects;
CREATE POLICY "anon_read_observation_evidence" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'observation-evidence');

DROP POLICY IF EXISTS "anon_delete_observation_evidence" ON storage.objects;
CREATE POLICY "anon_delete_observation_evidence" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'observation-evidence');
