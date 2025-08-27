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
        const { profileData, assessmentData, action = 'analyze' } = await req.json();

        // 获取环境变量
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // 验证用户身份
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
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

        let result = {};

        if (action === 'analyze') {
            // 分析用户画像
            result = await analyzeUserProfile(profileData, assessmentData, userId, supabaseUrl, serviceRoleKey);
        } else if (action === 'update') {
            // 更新用户画像
            result = await updateUserProfile(profileData, userId, supabaseUrl, serviceRoleKey);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('User profile analysis error:', error);

        const errorResponse = {
            error: {
                code: 'PROFILE_ANALYSIS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// 分析用户画像
async function analyzeUserProfile(profileData: any, assessmentData: any, userId: string, supabaseUrl: string, serviceRoleKey: string) {
    // MBTI性格分析
    const mbtiAnalysis = analyzeMBTI(assessmentData.mbti || {});
    
    // 技能水平分析
    const skillAnalysis = analyzeSkills(assessmentData.skills || {});
    
    // 学习偏好分析
    const learningAnalysis = analyzeLearningPreferences(assessmentData.learning || {});
    
    // 风险偏好分析
    const riskAnalysis = analyzeRiskTolerance(assessmentData.risk || {});
    
    // 职业匹配度分析
    const careerMatch = calculateCareerMatch(mbtiAnalysis, skillAnalysis, profileData);
    
    // 发展建议生成
    const recommendations = generateDevelopmentRecommendations({
        mbti: mbtiAnalysis,
        skills: skillAnalysis,
        learning: learningAnalysis,
        risk: riskAnalysis,
        career: careerMatch,
        profile: profileData
    });

    // 更新用户画像数据
    const updateData = {
        mbti_type: mbtiAnalysis.type,
        personality_traits: mbtiAnalysis.traits,
        social_preferences: {
            ...learningAnalysis.socialPreferences,
            communication_style: mbtiAnalysis.communicationStyle
        },
        learning_preferences: learningAnalysis,
        risk_tolerance: riskAnalysis,
        updated_at: new Date().toISOString()
    };

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...updateData,
            user_id: userId
        })
    });

    if (!updateResponse.ok) {
        console.error('Failed to update user profile');
    }

    return {
        userId,
        analysis: {
            mbti: mbtiAnalysis,
            skills: skillAnalysis,
            learning: learningAnalysis,
            risk: riskAnalysis,
            careerMatch: careerMatch
        },
        recommendations,
        profileUpdated: updateResponse.ok
    };
}

// MBTI分析算法
function analyzeMBTI(mbtiData: any) {
    const { responses = {} } = mbtiData;
    
    // 计算四个维度的倾向
    const dimensions = {
        EI: calculateDimension(responses, 'EI', ['extraversion', 'introversion']),
        SN: calculateDimension(responses, 'SN', ['sensing', 'intuition']),
        TF: calculateDimension(responses, 'TF', ['thinking', 'feeling']),
        JP: calculateDimension(responses, 'JP', ['judging', 'perceiving'])
    };
    
    // 确定MBTI类型
    const type = (
        (dimensions.EI.preference === 'extraversion' ? 'E' : 'I') +
        (dimensions.SN.preference === 'sensing' ? 'S' : 'N') +
        (dimensions.TF.preference === 'thinking' ? 'T' : 'F') +
        (dimensions.JP.preference === 'judging' ? 'J' : 'P')
    );
    
    // 获取性格特征描述
    const traits = getMBTITraits(type);
    
    // 推荐的沟通风格
    const communicationStyle = getCommunicationStyle(type);
    
    return {
        type,
        dimensions,
        traits,
        communicationStyle,
        confidence: calculateMBTIConfidence(dimensions)
    };
}

// 技能分析算法
function analyzeSkills(skillsData: any) {
    const categories = {
        technical: skillsData.technical || {},
        projectManagement: skillsData.projectManagement || {},
        leadership: skillsData.leadership || {},
        business: skillsData.business || {}
    };
    
    const analysis = {};
    
    for (const [category, skills] of Object.entries(categories)) {
        const scores = Object.values(skills as any).filter(score => typeof score === 'number');
        analysis[category] = {
            averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
            maxScore: Math.max(...scores, 0),
            skillCount: scores.length,
            strengthLevel: categorizeSkillLevel(scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0)
        };
    }
    
    // 识别优势和待提升领域
    const strengths = Object.entries(analysis)
        .filter(([_, data]: [string, any]) => data.averageScore >= 7)
        .map(([category, _]) => category);
        
    const improvementAreas = Object.entries(analysis)
        .filter(([_, data]: [string, any]) => data.averageScore < 6)
        .map(([category, _]) => category);
    
    return {
        categories: analysis,
        strengths,
        improvementAreas,
        overallScore: Object.values(analysis).reduce((sum: number, cat: any) => sum + cat.averageScore, 0) / Object.keys(analysis).length
    };
}

// 学习偏好分析
function analyzeLearningPreferences(learningData: any) {
    const preferences = {
        learningStyle: determineLearningStyle(learningData),
        socialPreferences: {
            teamwork: learningData.teamwork || 5,
            independence: learningData.independence || 5,
            mentorship: learningData.mentorship || 5
        },
        contentPreferences: {
            theoretical: learningData.theoretical || 5,
            practical: learningData.practical || 5,
            visual: learningData.visual || 5,
            interactive: learningData.interactive || 5
        }
    };
    
    return preferences;
}

// 风险偏好分析
function analyzeRiskTolerance(riskData: any) {
    const riskScore = calculateRiskScore(riskData);
    
    return {
        overall_score: riskScore,
        level: categorizeRiskLevel(riskScore),
        career_risk: riskData.career || 5,
        financial_risk: riskData.financial || 5,
        learning_risk: riskData.learning || 5,
        innovation_risk: riskData.innovation || 5
    };
}

// 计算职业匹配度
function calculateCareerMatch(mbti: any, skills: any, profile: any) {
    const careerPaths = {
        'senior_engineer': { mbti_match: 0.8, skills_weight: { technical: 0.6, projectManagement: 0.3, leadership: 0.1 } },
        'tech_lead': { mbti_match: 0.7, skills_weight: { technical: 0.4, projectManagement: 0.3, leadership: 0.3 } },
        'product_manager': { mbti_match: 0.6, skills_weight: { business: 0.4, projectManagement: 0.3, leadership: 0.3 } },
        'engineering_manager': { mbti_match: 0.7, skills_weight: { technical: 0.3, projectManagement: 0.3, leadership: 0.4 } },
        'entrepreneur': { mbti_match: 0.9, skills_weight: { business: 0.4, leadership: 0.4, technical: 0.2 } }
    };
    
    const matches = {};
    
    for (const [career, config] of Object.entries(careerPaths)) {
        let skillsMatch = 0;
        for (const [skill, weight] of Object.entries(config.skills_weight)) {
            skillsMatch += (skills.categories[skill]?.averageScore || 0) * weight;
        }
        
        matches[career] = {
            overall_score: (skillsMatch * 0.7 + config.mbti_match * 10 * 0.3) / 10,
            skills_match: skillsMatch / 10,
            personality_match: config.mbti_match
        };
    }
    
    return matches;
}

// 生成发展建议
function generateDevelopmentRecommendations(analysis: any) {
    const recommendations = [];
    
    // 基于技能分析的建议
    if (analysis.skills.improvementAreas.length > 0) {
        recommendations.push({
            type: 'skill_development',
            priority: 'high',
            title: '技能提升建议',
            description: `建议重点提升${analysis.skills.improvementAreas.join('、')}等领域的技能`,
            actions: analysis.skills.improvementAreas.map(area => `参加${area}相关的培训课程`)
        });
    }
    
    // 基于MBTI的建议
    const mbtiAdvice = getMBTIDevelopmentAdvice(analysis.mbti.type);
    if (mbtiAdvice) {
        recommendations.push({
            type: 'personality_development',
            priority: 'medium',
            title: '性格优势发挥',
            description: mbtiAdvice.description,
            actions: mbtiAdvice.actions
        });
    }
    
    // 基于职业匹配的建议
    const topCareer = Object.entries(analysis.careerMatch)
        .sort(([,a], [,b]) => (b as any).overall_score - (a as any).overall_score)[0];
    
    if (topCareer) {
        recommendations.push({
            type: 'career_direction',
            priority: 'high',
            title: '职业发展方向',
            description: `基于您的综合评估，${topCareer[0]}是最适合您的发展方向`,
            actions: [`制定${topCareer[0]}的具体发展计划`, '寻找相关的项目机会']
        });
    }
    
    return recommendations;
}

// 辅助函数
function calculateDimension(responses: any, dimension: string, preferences: string[]) {
    const scores = preferences.map(pref => responses[pref] || 0);
    const total = scores.reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        return { preference: preferences[0], strength: 0.5 };
    }
    
    const maxIndex = scores.indexOf(Math.max(...scores));
    return {
        preference: preferences[maxIndex],
        strength: Math.max(...scores) / total
    };
}

function getMBTITraits(type: string) {
    const traits = {
        'INTJ': { strengths: ['战略思维', '独立工作', '创新能力'], weaknesses: ['团队协作', '情感表达'] },
        'ENTJ': { strengths: ['领导能力', '目标导向', '决策果断'], weaknesses: ['耐心倾听', '细节关注'] },
        'INFP': { strengths: ['创意思维', '价值驱动', '适应性强'], weaknesses: ['时间管理', '冲突处理'] },
        'ENFP': { strengths: ['创新思维', '人际交往', '适应变化'], weaknesses: ['细节执行', '长期规划'] }
        // 添加更多MBTI类型...
    };
    
    return traits[type] || { strengths: [], weaknesses: [] };
}

function getCommunicationStyle(type: string) {
    const styles = {
        'INTJ': 'direct_analytical',
        'ENTJ': 'assertive_goal_oriented',
        'INFP': 'empathetic_values_based',
        'ENFP': 'enthusiastic_collaborative'
        // 添加更多类型...
    };
    
    return styles[type] || 'balanced';
}

function calculateMBTIConfidence(dimensions: any) {
    const strengths = Object.values(dimensions).map((dim: any) => dim.strength);
    return strengths.reduce((a: number, b: number) => a + b, 0) / strengths.length;
}

function categorizeSkillLevel(score: number) {
    if (score >= 8) return 'expert';
    if (score >= 6) return 'proficient';
    if (score >= 4) return 'intermediate';
    return 'beginner';
}

function determineLearningStyle(learningData: any) {
    const styles = {
        visual: learningData.visual || 0,
        auditory: learningData.auditory || 0,
        kinesthetic: learningData.kinesthetic || 0,
        reading: learningData.reading || 0
    };
    
    const maxStyle = Object.entries(styles).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxStyle[0];
}

function calculateRiskScore(riskData: any) {
    const factors = ['career', 'financial', 'learning', 'innovation'];
    const scores = factors.map(factor => riskData[factor] || 5);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function categorizeRiskLevel(score: number) {
    if (score >= 8) return 'high';
    if (score >= 6) return 'medium_high';
    if (score >= 4) return 'medium';
    return 'low';
}

function getMBTIDevelopmentAdvice(type: string) {
    const advice = {
        'INTJ': {
            description: '发挥您的战略思维优势，同时加强团队协作能力',
            actions: ['参与跨部门合作项目', '练习公开演讲', '建立专业人脉网络']
        },
        'ENTJ': {
            description: '利用您的领导天赋，注意倾听团队成员意见',
            actions: ['学习情商管理技巧', '定期收集下属反馈', '培养耐心指导他人的能力']
        }
        // 添加更多类型的建议...
    };
    
    return advice[type];
}

// 更新用户画像
async function updateUserProfile(profileData: any, userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...profileData,
            user_id: userId,
            updated_at: new Date().toISOString()
        })
    });

    if (!updateResponse.ok) {
        throw new Error('Failed to update user profile');
    }

    return {
        success: true,
        message: 'Profile updated successfully'
    };
}