import { createClient } from '@supabase/supabase-js';

// 这里感叹号的意思是告诉 TypeScript：“我保证这俩变量一定存在，别报错”
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);