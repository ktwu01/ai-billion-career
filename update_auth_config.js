const fetch = require('node-fetch');

// 从环境变量获取凭证
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectId = process.env.SUPABASE_PROJECT_ID;

async function updateAuthConfig() {
  if (!accessToken || !projectId) {
    console.error('缺少必要的环境变量: SUPABASE_ACCESS_TOKEN 或 SUPABASE_PROJECT_ID');
    return;
  }

  try {
    console.log('获取当前认证配置...');
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

    // 准备新配置
    const siteUrl = "https://qa404f3fetid.space.minimax.io";
    const allowList = [
      siteUrl,
      `${siteUrl}/**`,
      "http://localhost:3000",
      "http://localhost:5173"
    ];
    
    // 合并现有的重定向URL，并添加新的URL
    let redirectUrls = currentConfig.redirect_urls || [];
    const newRedirectUrls = [
      `${siteUrl}`,
      `${siteUrl}/login`,
      `${siteUrl}/callback`,
      `${siteUrl}/auth/callback`
    ];
    
    // 确保不重复添加URL
    for (const url of newRedirectUrls) {
      if (!redirectUrls.includes(url)) {
        redirectUrls.push(url);
      }
    }

    // 新的认证配置
    const newConfig = {
      site_url: siteUrl,
      uri_allow_list: allowList,
      redirect_urls: redirectUrls
    };

    console.log('更新认证配置...');
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
    console.log('认证配置已成功更新:', JSON.stringify(updatedConfig, null, 2));

  } catch (error) {
    console.error("更新认证配置时出错:", error);
  }
}

updateAuthConfig();
