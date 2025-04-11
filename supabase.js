import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wukzuhcyiqzlzowcqsad.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1a3p1aGN5aXF6bHpvd2Nxc2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDI3MDgsImV4cCI6MjA1OTg3ODcwOH0.apeSjGuIUdHVOGJDl_30dtrDOucoyz6fS2ejJfV-2BQ'
);

export default supabase;
