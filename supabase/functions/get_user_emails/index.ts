
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the request body
    const { user_ids } = await req.json();
    
    // Create a Supabase client with the service role (to access auth.users)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );
    
    // For security, validate the input
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: user_ids must be a non-empty array' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get user emails - using the auth schema directly with admin access
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    // Filter the users based on the requested IDs
    const filteredUsers = data?.users.filter(user => user_ids.includes(user.id)) || [];
    
    // Extract just the id and email
    const result = filteredUsers.map(user => ({
      id: user.id,
      email: user.email
    }));
    
    // Return the emails
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred fetching user emails' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
