
// #i moved this file to src folder to fix the build error with module resolution
import { createClient } from '@supabase/supabase-js';

// #i used the direct project values instead of env variables to make it simple for beginners
const supabaseUrl = 'https://srbuhryhmgjxvhzjjuet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYnVocnlobWdqeHZoempqdWV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5NDU2MDYsImV4cCI6MjA2MzUyMTYwNn0.i14WbICy-ksJaMyzvgdMC2-ou-eTPpb-ZAQ74Qh53Nk';

export const supabase = createClient(supabaseUrl, supabaseKey);
