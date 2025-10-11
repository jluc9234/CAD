import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jjwtwjvjmaqngczhzaik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impqd3R3anZqbWFxbmdjemh6YWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTczNzUsImV4cCI6MjA3NTI5MzM3NX0.X1j2wHcBY36uvs6Yiq1tFQbAL0NB2ljDuHNuo1Rud9o';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);