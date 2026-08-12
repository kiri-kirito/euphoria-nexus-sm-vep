const { createClient } = require('@supabase/supabase-js');

let supabaseAdmin = null;

function getAuthClient() {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabaseAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseAdmin;
}

async function verifySocketToken(token) {
  if (!token || typeof token !== 'string') return null;

  const supabase = getAuthClient();
  if (!supabase) {
    console.warn('[SocketAuth] Supabase not configured — rejecting connection');
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, name, email')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    role: profile?.role || 'buyer',
    name: profile?.name || profile?.email || user.email || 'User',
    email: user.email,
  };
}

function attachNamespaceAuth(namespace, label = 'namespace') {
  namespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const user = await verifySocketToken(token);
      if (!user) {
        console.warn(`[SocketAuth] Rejected ${label} connection: ${socket.id}`);
        return next(new Error('Unauthorized'));
      }
      socket.data.user = user;
      console.log(`[SocketAuth] ${label} authenticated: ${user.id} (${user.role})`);
      next();
    } catch (err) {
      next(err);
    }
  });
}

module.exports = { verifySocketToken, attachNamespaceAuth };
