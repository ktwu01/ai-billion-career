// Manual configuration update using alternative API endpoints

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const accessToken = "sbp_oauth_c4b6d055797fab3f15ae6d7b266f86840d0fbd86";
    const projectId = "emywvwsqzixqsgfzadww";
    const fixedUrl = "https://ktwu01.github.io/VerificationSuccess/";

    // 尝试使用不同的API端点
    const endpoints = [
      `https://api.supabase.com/v1/projects/${projectId}/auth-config`,
      `https://api.supabase.com/v1/projects/${projectId}/config/auth`,
      `https://api.supabase.com/v1/projects/${projectId}/settings`
    ];

    const updates = [];
    
    for (const endpoint of endpoints) {
      try {
        // 先检查端点是否可用
        const checkResponse = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
        
        if (checkResponse.ok) {
          const config = await checkResponse.json();
          updates.push({
            endpoint,
            method: "GET",
            status: checkResponse.status,
            success: true,
            current_site_url: config.site_url || config.SITE_URL || "not found"
          });
          
          // 尝试更新
          const updateConfig = {
            ...config,
            site_url: fixedUrl,
            SITE_URL: fixedUrl,
            uri_allow_list: `${fixedUrl}**,http://localhost:3000,http://localhost:5173`
          };
          
          const updateResponse = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(updateConfig)
          });
          
          if (updateResponse.ok) {
            const updated = await updateResponse.json();
            updates.push({
              endpoint,
              method: "PUT",
              status: updateResponse.status,
              success: true,
              message: "更新成功",
              updated_config: updated
            });
          } else {
            const errorText = await updateResponse.text();
            updates.push({
              endpoint,
              method: "PUT",
              status: updateResponse.status,
              success: false,
              error: errorText
            });
          }
          
        } else {
          updates.push({
            endpoint,
            method: "GET",
            status: checkResponse.status,
            success: false,
            error: await checkResponse.text()
          });
        }
      } catch (error) {
        updates.push({
          endpoint,
          error: error.message,
          success: false
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "尝试了多个API端点来更新配置",
        target_url: fixedUrl,
        results: updates,
        manual_steps: {
          instructions: "如果自动更新失败，请手动操作",
          steps: [
            "1. 登录 Supabase Dashboard: https://supabase.com/dashboard/projects",
            "2. 选择项目: emywvwsqzixqsgfzadww",
            "3. 进入 Authentication > Settings",
            "4. 在 URL Configuration 中，将 Site URL 设置为: https://ktwu01.github.io/VerificationSuccess/",
            "5. 在 Redirect URLs 中添加: https://ktwu01.github.io/VerificationSuccess/**",
            "6. 点击 Save 保存更改"
          ]
        }
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        manual_steps: {
          instructions: "自动更新失败，请手动操作",
          steps: [
            "1. 登录 Supabase Dashboard: https://supabase.com/dashboard/projects",
            "2. 选择项目: emywvwsqzixqsgfzadww",
            "3. 进入 Authentication > Settings",
            "4. 在 URL Configuration 中，将 Site URL 设置为: https://ktwu01.github.io/VerificationSuccess/",
            "5. 在 Redirect URLs 中添加: https://ktwu01.github.io/VerificationSuccess/**",
            "6. 点击 Save 保存更改"
          ]
        }
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
