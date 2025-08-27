// supabase/functions/update-site-url/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

interface SupabaseAuthConfig {
  site_url: string;
  uri_allow_list?: string[];
  redirect_urls?: string[];
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // 获取必要的环境变量
    const accessToken = Deno.env.get("SUPABASE_ACCESS_TOKEN");
    const projectId = Deno.env.get("SUPABASE_PROJECT_ID");
    
    if (!accessToken || !projectId) {
      throw new Error("缺少必要的环境变量: SUPABASE_ACCESS_TOKEN 或 SUPABASE_PROJECT_ID");
    }

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
      throw new Error(`获取当前配置失败: ${currentConfigResponse.status} ${errorText}`);
    }

    const currentConfig = await currentConfigResponse.json();
    console.log("当前配置:", JSON.stringify(currentConfig, null, 2));

    // 设置固定的验证成功页面URL
    const siteUrl = "https://ktwu01.github.io/VerificationSuccess/";
    const allowList = [
      siteUrl,
      `${siteUrl}**`,
      "http://localhost:3000",
      "http://localhost:5173"
    ];
    
    // 合并现有的重定向URL，并添加新的URL
    let redirectUrls = currentConfig.redirect_urls || [];
    const newRedirectUrls = [
      siteUrl,
      `${siteUrl}**`
    ];
    
    // 确保不重复添加URL
    for (const url of newRedirectUrls) {
      if (!redirectUrls.includes(url)) {
        redirectUrls.push(url);
      }
    }

    // 新的认证配置
    const newConfig: SupabaseAuthConfig = {
      site_url: siteUrl,
      uri_allow_list: allowList,
      redirect_urls: redirectUrls
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
      throw new Error(`更新配置失败: ${updateResponse.status} ${errorText}`);
    }

    const updatedConfig = await updateResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "认证配置已成功更新到固定的验证页面",
        siteUrl: siteUrl,
        previous: currentConfig,
        updated: updatedConfig
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("更新认证配置时出错:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
