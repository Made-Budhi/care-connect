// File: supabase/functions/set-user-role/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Or 'http://localhost:5173' for more security
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Must include OPTIONS
}

console.log("Edge Function 'set-user-role' started.");

// Create the admin client once, outside the request handler for performance.
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // --- Security and Validation ---
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing authorization header');
        const jwt = authHeader.replace('Bearer ', '');

        const { userId, newRole } = await req.json();
        if (!userId || !newRole) {
            return new Response(JSON.stringify({ error: 'userId and newRole are required.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Create a temporary, user-specific client to check the caller's role.
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: `Bearer ${jwt}` } } }
        );

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;

        // SECURITY CHECK: Only allow admins to proceed.
        if (user.user_metadata?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Not authorized: only admins can change roles.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            });
        }

        // Get the target user's current data first
        const { data: { user: targetUser }, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (getUserError) throw getUserError;

        // Merge existing metadata with the new role
        const newMetadata = { ...targetUser.user_metadata, role: newRole };

        // --- Database Operations ---

        // Step 1: Update the user's role in the auth metadata.
        const { data: updatedAuthUser, error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: newMetadata }
        );

        if (authUpdateError) {
            throw new Error(`Auth update failed: ${authUpdateError.message}`);
        }

        // Step 2: Update the role in the public.profiles table to keep it in sync.
        const { error: profileUpdateError } = await supabaseAdmin
            .from('profiles') // Your public profiles table
            .update({ role: newRole }) // The data to update
            .eq('id', userId); // The condition to match the user

        if (profileUpdateError) {
            // Note: In a real-world scenario, you might want to handle the case where the auth
            // update succeeded but the profile update failed (e.g., by trying to revert the auth change).
            // For now, we'll just report the error.
            throw new Error(`Profile update failed: ${profileUpdateError.message}`);
        }

        // --- Success ---
        return new Response(JSON.stringify(updatedAuthUser.user), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
