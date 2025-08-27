Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        const { mentorId, action } = await req.json();

        if (!mentorId || !action) {
            throw new Error('mentorId and action are required');
        }

        if (action !== 'follow' && action !== 'unfollow') {
            throw new Error('action must be "follow" or "unfollow"');
        }

        let response;
        if (action === 'follow') {
            // Follow mentor
            response = await fetch(`${supabaseUrl}/rest/v1/user_mentor_follows`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    user_id: userId,
                    mentor_id: mentorId
                })
            });
        } else {
            // Unfollow mentor
            response = await fetch(`${supabaseUrl}/rest/v1/user_mentor_follows?user_id=eq.${userId}&mentor_id=eq.${mentorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Database operation failed: ${errorText}`);
        }

        const result = action === 'follow' ? await response.json() : null;

        return new Response(JSON.stringify({
            data: {
                success: true,
                action,
                mentorId,
                follow: result
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Mentor follow error:', error);

        const errorResponse = {
            error: {
                code: 'MENTOR_FOLLOW_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});