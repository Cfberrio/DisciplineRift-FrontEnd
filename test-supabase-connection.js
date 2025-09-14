// Test básico de conexión a Supabase
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Supabase connection...');
console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL starts with:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30));
}

try {
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ Supabase module loaded');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log('✅ Supabase client created');
  
  // Test simple query
  supabase
    .from('parent')
    .select('email, phone')
    .eq('email', 'cfberrio@uninorte.edu.co')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Query error:', error);
      } else {
        console.log('✅ Query result:', data);
      }
    });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}


