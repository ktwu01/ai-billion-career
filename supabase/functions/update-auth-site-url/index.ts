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
    const accessToken = Deno.env.get('SUPABASE_ACCESS_TOKEN');
    const projectId = Deno.env.get('SUPABASE_PROJECT_ID');
    
    if (!accessToken || !projectId) {
      throw new Error('Missing Supabase configuration');
    }

    const siteUrl = 'https://wf0c0rx7srsn.space.minimax.io';
    
    // Update auth configuration
    const authConfigUrl = `https://api.supabase.com/v1/projects/${projectId}/config/auth`;
    
    const authConfig = {
      SITE_URL: siteUrl,
      ADDITIONAL_REDIRECT_URLS: `${siteUrl}, ${siteUrl}/auth-redirect.html`,
      JWT_EXPIRY: 3600,
      REFRESH_TOKEN_ROTATION_ENABLED: true,
      SECURITY_REFRESH_TOKEN_REUSE_INTERVAL: 10
    };

    const response = await fetch(authConfigUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(authConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auth config update failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Auth configuration updated successfully',
      siteUrl: siteUrl,
      config: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Auth config update error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'AUTH_CONFIG_UPDATE_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
