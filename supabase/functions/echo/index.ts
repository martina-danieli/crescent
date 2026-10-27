// WARNING: logging the text below is for TESTING ONLY.
// Remove the console.log of the text before any real user data is sent,
// because this app will handle health data.
//
// "echo" edge function: returns the text it receives plus the caller's user id.
// Keep "Verify JWT" ON so only signed-in users can call it.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async req => {
  // Browser CORS preflight.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Read { text } from the JSON body.
  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return json({ error: 'Body must be JSON like { "text": "..." }' }, 400);
  }
  if (typeof text !== 'string') {
    return json({ error: '"text" is missing or is not a string' }, 400);
  }

  // Find out who is calling from the Authorization header.
  const token = (req.headers.get('Authorization') ?? '').replace(
    /^Bearer\s+/i,
    '',
  );
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return json({ error: 'Could not identify the signed-in user' }, 401);
  }
  const userId = data.user.id;

  // TESTING ONLY: remove before real user data (health data) is sent.
  console.log(
    `echo userId=${userId} length=${text.length} text=${JSON.stringify(text)}`,
  );

  return json({
    received: text,
    length: text.length,
    userId,
    at: new Date().toISOString(),
  });
});
