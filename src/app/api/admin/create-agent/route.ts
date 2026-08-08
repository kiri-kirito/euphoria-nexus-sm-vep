import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server-admin';

export async function POST(req: Request) {
  try {
    const { name, email, role, password } = await req.json();
    const adminSupabase = createAdminClient();
    
    const dbRole = role === 'delivery' ? 'agent' : 'support';
    
    // Create auth user
    const { data, error } = await adminSupabase.auth.admin.createUser({
      email, 
      password,
      email_confirm: true,
      user_metadata: { name, role: dbRole }
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (data?.user) {
      // Insert into public.users
      const { error: dbError } = await adminSupabase.from('users').insert({ 
        id: data.user.id, 
        name, 
        email, 
        password_hash: 'supabase_auth', 
        role: dbRole 
      });
      
      if (dbError) {
        return NextResponse.json({ error: dbError.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ success: true, user: data.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
