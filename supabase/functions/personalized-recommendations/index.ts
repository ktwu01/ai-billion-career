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
        const { recommendationType = 'all', userPreferences = {}, context = {} } = await req.json();

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

        // 获取用户画像数据
        const userProfile = await getUserProfile(userId, supabaseUrl, serviceRoleKey);
        const skillAssessments = await getSkillAssessments(userId, supabaseUrl, serviceRoleKey);
        const progressRecords = await getProgressRecords(userId, supabaseUrl, serviceRoleKey);
        const careerGoals = await getCareerGoals(userId, supabaseUrl, serviceRoleKey);

        // 生成个性化推荐
        const recommendations = await generatePersonalizedRecommendations({
            userId,
            profile: userProfile,
            skills: skillAssessments,
            progress: progressRecords,
            goals: careerGoals,
            preferences: userPreferences,
            context,
            type: recommendationType
        });

        // 保存推荐结果
        await saveRecommendations(recommendations, userId, supabaseUrl, serviceRoleKey);

        return new Response(JSON.stringify({ 
            data: {
                recommendations,
                user_id: userId,
                generated_at: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Recommendation generation error:', error);

        const errorResponse = {
            error: {
                code: 'RECOMMENDATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// 获取用户画像数据
async function getUserProfile(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${userId}&select=*`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data[0] || null;
}

// 获取技能评估数据
async function getSkillAssessments(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(`${supabaseUrl}/rest/v1/skill_assessments?user_id=eq.${userId}&select=*&order=assessment_date.desc`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch skill assessments');
    }

    return await response.json();
}

// 获取进度记录
async function getProgressRecords(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(`${supabaseUrl}/rest/v1/progress_records?user_id=eq.${userId}&select=*&order=record_date.desc&limit=50`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch progress records');
    }

    return await response.json();
}

// 获取职业目标
async function getCareerGoals(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(`${supabaseUrl}/rest/v1/career_goals?user_id=eq.${userId}&status=eq.active&select=*&order=created_at.desc`, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch career goals');
    }

    return await response.json();
}

// 生成个性化推荐
async function generatePersonalizedRecommendations(data: any) {
    const { userId, profile, skills, progress, goals, preferences, context, type } = data;
    
    const recommendations = [];
    
    // 1. 技能发展推荐
    if (type === 'all' || type === 'skills') {
        const skillRecommendations = generateSkillRecommendations(skills, profile, goals);
        recommendations.push(...skillRecommendations);
    }
    
    // 2. 学习路径推荐
    if (type === 'all' || type === 'learning') {
        const learningRecommendations = generateLearningPathRecommendations(profile, skills, preferences);
        recommendations.push(...learningRecommendations);
    }
    
    // 3. 职业机会推荐
    if (type === 'all' || type === 'career') {
        const careerRecommendations = generateCareerOpportunityRecommendations(profile, skills, context);
        recommendations.push(...careerRecommendations);
    }
    
    // 4. 网络建设推荐
    if (type === 'all' || type === 'networking') {
        const networkingRecommendations = generateNetworkingRecommendations(profile, skills);
        recommendations.push(...networkingRecommendations);
    }
    
    // 5. 目标设定推荐
    if (type === 'all' || type === 'goals') {
        const goalRecommendations = generateGoalRecommendations(profile, skills, progress, goals);
        recommendations.push(...goalRecommendations);
    }
    
    // 按优先级排序
    return recommendations.sort((a, b) => b.priority_score - a.priority_score).slice(0, 20);
}

// 技能发展推荐
function generateSkillRecommendations(skills: any[], profile: any, goals: any[]) {
    const recommendations = [];
    
    // 分析技能差距
    const skillGaps = analyzeSkillGaps(skills, profile?.target_position || '高级工程师');
    
    skillGaps.forEach(gap => {
        if (gap.importance > 0.7) {
            recommendations.push({
                type: 'skill_development',
                priority_score: gap.importance * 10,
                title: `提升${gap.skill_name}技能`,
                description: `基于您的目标职位${profile?.target_position || '高级工程师'}，${gap.skill_name}技能需要从${gap.current_level}分提升到${gap.target_level}分`,
                content: {
                    skill_name: gap.skill_name,
                    current_level: gap.current_level,
                    target_level: gap.target_level,
                    improvement_plan: generateSkillImprovementPlan(gap),
                    estimated_timeline: gap.estimated_weeks,
                    resources: getSkillLearningResources(gap.skill_name)
                }
            });
        }
    });
    
    return recommendations;
}

// 学习路径推荐
function generateLearningPathRecommendations(profile: any, skills: any[], preferences: any) {
    const recommendations = [];
    
    const learningStyle = profile?.learning_preferences?.learningStyle || 'mixed';
    const currentLevel = calculateOverallSkillLevel(skills);
    
    // 基于MBTI的学习路径
    const mbtiLearningPath = getMBTILearningPath(profile?.mbti_type || 'INTJ', currentLevel);
    
    if (mbtiLearningPath) {
        recommendations.push({
            type: 'learning_path',
            priority_score: 8.5,
            title: `个性化学习路径（${profile.mbti_type}风格）`,
            description: `基于您的${profile.mbti_type}性格类型，为您推荐最适合的学习路径`,
            content: {
                learning_style: learningStyle,
                phases: mbtiLearningPath.phases,
                timeline: mbtiLearningPath.timeline,
                resources: mbtiLearningPath.resources,
                milestones: mbtiLearningPath.milestones
            }
        });
    }
    
    // 技能树学习路径
    const skillTreePath = generateSkillTreePath(skills, profile?.target_position || '高级工程师');
    if (skillTreePath.length > 0) {
        recommendations.push({
            type: 'learning_path',
            priority_score: 8.0,
            title: '技能树学习路径',
            description: '按照依赖关系有序学习，逐步建立完整的技能体系',
            content: {
                skill_path: skillTreePath,
                total_duration: calculatePathDuration(skillTreePath),
                checkpoints: generateCheckpoints(skillTreePath)
            }
        });
    }
    
    return recommendations;
}

// 职业机会推荐
function generateCareerOpportunityRecommendations(profile: any, skills: any[], context: any) {
    const recommendations = [];
    
    // 分析当前市场机会
    const marketOpportunities = analyzeMarketOpportunities(skills, profile, context);
    
    marketOpportunities.forEach(opportunity => {
        if (opportunity.match_score > 0.75) {
            recommendations.push({
                type: 'career_opportunity',
                priority_score: opportunity.match_score * 10,
                title: `${opportunity.role_title}职位机会`,
                description: `您的技能与${opportunity.role_title}职位匹配度达到${Math.round(opportunity.match_score * 100)}%`,
                content: {
                    role_title: opportunity.role_title,
                    match_score: opportunity.match_score,
                    salary_range: opportunity.salary_range,
                    growth_potential: opportunity.growth_potential,
                    required_skills: opportunity.required_skills,
                    missing_skills: opportunity.missing_skills,
                    preparation_plan: opportunity.preparation_plan,
                    market_demand: opportunity.market_demand
                }
            });
        }
    });
    
    return recommendations;
}

// 网络建设推荐
function generateNetworkingRecommendations(profile: any, skills: any[]) {
    const recommendations = [];
    
    // 基于技能和目标的网络建设建议
    const networkingStrategy = developNetworkingStrategy(profile, skills);
    
    recommendations.push({
        type: 'networking',
        priority_score: 7.5,
        title: '专业网络建设计划',
        description: '基于您的职业目标，建立有价值的专业人脉网络',
        content: {
            target_connections: networkingStrategy.target_connections,
            networking_events: networkingStrategy.events,
            online_communities: networkingStrategy.communities,
            mentorship_opportunities: networkingStrategy.mentorship,
            action_plan: networkingStrategy.action_plan
        }
    });
    
    return recommendations;
}

// 目标设定推荐
function generateGoalRecommendations(profile: any, skills: any[], progress: any[], goals: any[]) {
    const recommendations = [];
    
    // 分析现有目标的完成情况
    const goalAnalysis = analyzeCurrentGoals(goals, progress);
    
    // 推荐新目标
    const suggestedGoals = generateSuggestedGoals(profile, skills, goalAnalysis);
    
    if (suggestedGoals.length > 0) {
        recommendations.push({
            type: 'goal_setting',
            priority_score: 8.0,
            title: 'SMART目标设定建议',
            description: '基于您的当前进展，推荐新的可执行目标',
            content: {
                current_goal_analysis: goalAnalysis,
                suggested_goals: suggestedGoals,
                goal_prioritization: prioritizeGoals(suggestedGoals),
                timeline_recommendations: generateGoalTimeline(suggestedGoals)
            }
        });
    }
    
    return recommendations;
}

// 保存推荐结果
async function saveRecommendations(recommendations: any[], userId: string, supabaseUrl: string, serviceRoleKey: string) {
    for (const rec of recommendations) {
        const saveData = {
            user_id: userId,
            recommendation_type: rec.type,
            content: rec,
            priority_score: rec.priority_score,
            status: 'pending',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30天后过期
        };
        
        await fetch(`${supabaseUrl}/rest/v1/recommendations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        });
    }
}

// 辅助函数实现
function analyzeSkillGaps(skills: any[], targetPosition: string) {
    // 职位技能要求映射
    const positionRequirements = {
        '高级工程师': {
            'python': 8, 'machine_learning': 7, 'system_design': 7, 'leadership': 5
        },
        '技术经理': {
            'python': 6, 'machine_learning': 6, 'leadership': 8, 'project_management': 8
        },
        '产品经理': {
            'business_analysis': 8, 'user_research': 7, 'project_management': 7, 'communication': 8
        }
    };
    
    const requirements = positionRequirements[targetPosition] || positionRequirements['高级工程师'];
    const currentSkills = {};
    
    // 整理当前技能水平
    skills.forEach(skill => {
        currentSkills[skill.skill_name] = skill.current_level;
    });
    
    const gaps = [];
    for (const [skillName, requiredLevel] of Object.entries(requirements)) {
        const currentLevel = currentSkills[skillName] || 0;
        if (currentLevel < requiredLevel) {
            gaps.push({
                skill_name: skillName,
                current_level: currentLevel,
                target_level: requiredLevel,
                gap: requiredLevel - currentLevel,
                importance: requiredLevel / 10,
                estimated_weeks: Math.ceil((requiredLevel - currentLevel) * 4)
            });
        }
    }
    
    return gaps.sort((a, b) => b.importance - a.importance);
}

function generateSkillImprovementPlan(gap: any) {
    const baseWeeks = gap.estimated_weeks;
    
    return {
        phase1: {
            duration_weeks: Math.ceil(baseWeeks * 0.3),
            focus: '基础建设',
            activities: ['理论学习', '在线课程', '文档阅读']
        },
        phase2: {
            duration_weeks: Math.ceil(baseWeeks * 0.5),
            focus: '实践应用',
            activities: ['项目实践', '代码练习', '案例研究']
        },
        phase3: {
            duration_weeks: Math.ceil(baseWeeks * 0.2),
            focus: '高级提升',
            activities: ['最佳实践', '性能优化', '经验分享']
        }
    };
}

function getSkillLearningResources(skillName: string) {
    const resources = {
        'python': [
            { type: 'course', name: 'Python高级编程', provider: 'Coursera', duration: '8周' },
            { type: 'book', name: 'Fluent Python', author: 'Luciano Ramalho' },
            { type: 'practice', name: 'LeetCode Python练习', difficulty: '中级' }
        ],
        'machine_learning': [
            { type: 'course', name: '机器学习实战', provider: '极客时间', duration: '12周' },
            { type: 'project', name: 'Kaggle竞赛参与', difficulty: '初级到中级' },
            { type: 'certification', name: 'TensorFlow Developer', provider: 'Google' }
        ]
    };
    
    return resources[skillName] || [
        { type: 'search', name: `搜索${skillName}相关学习资源`, provider: '多平台' }
    ];
}

function calculateOverallSkillLevel(skills: any[]) {
    if (skills.length === 0) return 0;
    const totalScore = skills.reduce((sum, skill) => sum + skill.current_level, 0);
    return totalScore / skills.length;
}

function getMBTILearningPath(mbtiType: string, currentLevel: number) {
    const paths = {
        'INTJ': {
            phases: [
                { name: '理论深入', duration: '4周', focus: '系统性学习核心概念' },
                { name: '策略应用', duration: '6周', focus: '实际项目中应用所学知识' },
                { name: '创新突破', duration: '4周', focus: '探索新方法和创新解决方案' }
            ],
            timeline: '14周',
            resources: ['深度理论课程', '研究论文阅读', '个人项目实践'],
            milestones: ['理论考试通过', '项目原型完成', '创新方案发布']
        },
        'ENFP': {
            phases: [
                { name: '多元探索', duration: '3周', focus: '广泛接触不同领域' },
                { name: '协作学习', duration: '8周', focus: '团队项目和同伴学习' },
                { name: '创意应用', duration: '3周', focus: '将学习成果创意应用' }
            ],
            timeline: '14周',
            resources: ['在线社区课程', '团队项目', '创意工坐坊'],
            milestones: ['多领域基础掌握', '团队项目交付', '创意作品展示']
        }
    };
    
    return paths[mbtiType] || null;
}

function generateSkillTreePath(skills: any[], targetPosition: string) {
    // 简化的技能树路径生成
    const skillDependencies = {
        'python': [],
        'machine_learning': ['python', 'statistics'],
        'deep_learning': ['machine_learning', 'linear_algebra'],
        'system_design': ['python', 'databases']
    };
    
    // 基于目标职位和当前技能生成学习路径
    return [
        { skill: 'python', estimated_weeks: 6, prerequisites: [] },
        { skill: 'machine_learning', estimated_weeks: 8, prerequisites: ['python'] },
        { skill: 'deep_learning', estimated_weeks: 10, prerequisites: ['machine_learning'] }
    ];
}

function calculatePathDuration(skillPath: any[]) {
    return skillPath.reduce((total, skill) => total + skill.estimated_weeks, 0);
}

function generateCheckpoints(skillPath: any[]) {
    return skillPath.map((skill, index) => ({
        week: skillPath.slice(0, index + 1).reduce((sum, s) => sum + s.estimated_weeks, 0),
        milestone: `完成${skill.skill}技能学习`,
        assessment: `${skill.skill}技能评估测试`
    }));
}

function analyzeMarketOpportunities(skills: any[], profile: any, context: any) {
    // 模拟市场机会分析
    const opportunities = [
        {
            role_title: '高级AI工程师',
            match_score: 0.85,
            salary_range: '50-80万',
            growth_potential: 'high',
            required_skills: ['python', 'machine_learning', 'deep_learning'],
            missing_skills: ['system_design'],
            preparation_plan: '加强系统设计能力',
            market_demand: 'very_high'
        },
        {
            role_title: 'AI产品经理',
            match_score: 0.78,
            salary_range: '40-70万',
            growth_potential: 'high',
            required_skills: ['product_management', 'ai_understanding', 'user_research'],
            missing_skills: ['product_management', 'user_research'],
            preparation_plan: '学习产品管理和用户研究',
            market_demand: 'high'
        }
    ];
    
    return opportunities;
}

function developNetworkingStrategy(profile: any, skills: any[]) {
    return {
        target_connections: [
            { type: '同行专家', count: 20, priority: 'high' },
            { type: '行业领导者', count: 5, priority: 'high' },
            { type: '潜在合作伙伴', count: 15, priority: 'medium' }
        ],
        events: [
            '人工智能大会',
            '技术分享会',
            '行业峰会'
        ],
        communities: [
            'GitHub开源社区',
            'LinkedIn专业群组',
            '知乎技术圈子'
        ],
        mentorship: {
            find_mentor: '寻找在AI领域有经验的导师',
            become_mentor: '指导初级开发者，建立个人影响力'
        },
        action_plan: [
            '每月参加至少1个行业活动',
            '每周在社区分享1篇技术文章',
            '每季度与5位新人建立联系'
        ]
    };
}

function analyzeCurrentGoals(goals: any[], progress: any[]) {
    return {
        total_goals: goals.length,
        active_goals: goals.filter(g => g.status === 'active').length,
        completion_rate: goals.length > 0 ? goals.filter(g => g.status === 'completed').length / goals.length : 0,
        average_progress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length : 0,
        overdue_goals: goals.filter(g => new Date(g.target_date) < new Date() && g.status !== 'completed').length
    };
}

function generateSuggestedGoals(profile: any, skills: any[], goalAnalysis: any) {
    const suggestions = [
        {
            type: 'skill_improvement',
            title: '提升核心技能到高级水平',
            description: '在接下来6个月内，将核心技能评分从当前水平提升到8分以上',
            target_value: 8,
            timeline_months: 6,
            priority: 'high'
        },
        {
            type: 'career_advancement',
            title: '获得目标职位面试机会',
            description: '在12个月内获得至少三家目标公司的面试机会',
            target_value: 3,
            timeline_months: 12,
            priority: 'high'
        },
        {
            type: 'networking',
            title: '扩大专业网络',
            description: '在接下来3个月内，建立50个新的专业联系',
            target_value: 50,
            timeline_months: 3,
            priority: 'medium'
        }
    ];
    
    return suggestions;
}

function prioritizeGoals(goals: any[]) {
    return goals.sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
    });
}

function generateGoalTimeline(goals: any[]) {
    return goals.map(goal => ({
        goal: goal.title,
        start_month: 1,
        duration_months: goal.timeline_months,
        milestones: Array.from({ length: goal.timeline_months }, (_, i) => 
            `第${i + 1}个月目标检查点`
        )
    }));
}