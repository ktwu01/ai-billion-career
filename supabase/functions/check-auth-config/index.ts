// Check current Supabase auth configuration

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const accessToken = "sbp_oauth_c4b6d055797fab3f15ae6d7b266f86840d0fbd86";
    const projectId = "emywvwsqzixqsgfzadww";
    const expectedUrl = "https://ktwu01.github.io/VerificationSuccess/";

    // 获取当前配置
    const currentConfigResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/config/auth`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!currentConfigResponse.ok) {
      const errorText = await currentConfigResponse.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: `获取当前配置失败: ${currentConfigResponse.status} ${errorText}`
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const currentConfig = await currentConfigResponse.json();
    
    const isCorrectlyConfigured = currentConfig.site_url === expectedUrl;
    const hasCorrectRedirectUrls = currentConfig.redirect_urls && 
      currentConfig.redirect_urls.includes(expectedUrl);

    return new Response(
      JSON.stringify({
        success: true,
        is_correctly_configured: isCorrectlyConfigured,
        has_correct_redirect_urls: hasCorrectRedirectUrls,
        current_config: {
          site_url: currentConfig.site_url,
          redirect_urls: currentConfig.redirect_urls,
          uri_allow_list: currentConfig.uri_allow_list
        },
        expected_config: {
          site_url: expectedUrl,
          redirect_urls: [expectedUrl, `${expectedUrl}**`]
        },
        message: isCorrectlyConfigured ? 
          "邮件验证配置已正确设置为固定页面" : 
          "需要手动更新邮件验证配置"
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
