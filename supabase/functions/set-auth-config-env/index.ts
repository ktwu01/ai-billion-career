// Edge function to set environment variables for auth config update

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const accessToken = Deno.env.get("SUPABASE_ACCESS_TOKEN");
    const projectId = Deno.env.get("SUPABASE_PROJECT_ID");
    
    // 准备设置环境变量的元数据
    const metadata = {
      "name": "update-auth-config",
      "env_vars": [
        {
          "name": "SUPABASE_ACCESS_TOKEN",
          "value": accessToken
        },
        {
          "name": "SUPABASE_PROJECT_ID",
          "value": projectId
        }
      ]
    };

    // 使用 Supabase Management API 设置环境变量
    const updateResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/functions/${metadata.name}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(metadata)
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`设置环境变量失败: ${updateResponse.status} ${errorText}`);
    }

    const result = await updateResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "环境变量已成功设置",
        function_name: metadata.name
      }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("设置环境变量时出错:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
