// Direct auth configuration update for fixed verification page

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
    const fixedVerificationUrl = "https://ktwu01.github.io/VerificationSuccess/";

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
          error: `获取当前配置失败: ${currentConfigResponse.status} ${errorText}`,
          details: {
            status: currentConfigResponse.status,
            error_text: errorText
          }
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const currentConfig = await currentConfigResponse.json();
    
    // 新的配置
    const newConfig = {
      ...currentConfig,
      site_url: fixedVerificationUrl,
      uri_allow_list: [
        fixedVerificationUrl,
        `${fixedVerificationUrl}**`,
        "http://localhost:3000",
        "http://localhost:5173"
      ],
      redirect_urls: [
        fixedVerificationUrl,
        `${fixedVerificationUrl}**`,
        "http://localhost:3000",
        "http://localhost:5173"
      ]
    };

    // 更新配置
    const updateResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/config/auth`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newConfig)
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: `更新配置失败: ${updateResponse.status} ${errorText}`,
          details: {
            status: updateResponse.status,
            error_text: errorText,
            request_body: newConfig
          }
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const updatedConfig = await updateResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "邮件验证重定向已成功更新为固定页面",
        fixed_verification_url: fixedVerificationUrl,
        changes: {
          previous_site_url: currentConfig.site_url,
          new_site_url: fixedVerificationUrl,
          previous_redirect_urls: currentConfig.redirect_urls,
          new_redirect_urls: newConfig.redirect_urls
        },
        updated_config: updatedConfig
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
