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
        const { analysisType = 'comprehensive', timeRange = '6months', includeProjections = true } = await req.json();

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

        // 获取用户数据
        const userProfile = await getUserProfile(userId, supabaseUrl, serviceRoleKey);
        const progressData = await getProgressData(userId, timeRange, supabaseUrl, serviceRoleKey);
        const skillAssessments = await getSkillAssessments(userId, supabaseUrl, serviceRoleKey);
        const careerGoals = await getCareerGoals(userId, supabaseUrl, serviceRoleKey);
        const achievements = await getAchievements(userId, supabaseUrl, serviceRoleKey);

        // 进行综合分析
        const analysis = await performProgressAnalysis({
            userId,
            profile: userProfile,
            progress: progressData,
            skills: skillAssessments,
            goals: careerGoals,
            achievements,
            analysisType,
            timeRange,
            includeProjections
        });

        return new Response(JSON.stringify({ 
            data: {
                analysis,
                metadata: {
                    user_id: userId,
                    analysis_type: analysisType,
                    time_range: timeRange,
                    generated_at: new Date().toISOString(),
                    data_points: progressData.length
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Progress analysis error:', error);

        const errorResponse = {
            error: {
                code: 'PROGRESS_ANALYSIS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// 获取用户画像
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

// 获取进度数据
async function getProgressData(userId: string, timeRange: string, supabaseUrl: string, serviceRoleKey: string) {
    const timeFilter = getTimeFilter(timeRange);
    
    const response = await fetch(
        `${supabaseUrl}/rest/v1/progress_records?user_id=eq.${userId}&record_date=gte.${timeFilter}&select=*&order=record_date.asc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch progress data');
    }

    return await response.json();
}

// 获取技能评估
async function getSkillAssessments(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/skill_assessments?user_id=eq.${userId}&select=*&order=assessment_date.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch skill assessments');
    }

    return await response.json();
}

// 获取职业目标
async function getCareerGoals(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/career_goals?user_id=eq.${userId}&select=*&order=created_at.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch career goals');
    }

    return await response.json();
}

// 获取成就记录
async function getAchievements(userId: string, supabaseUrl: string, serviceRoleKey: string) {
    const response = await fetch(
        `${supabaseUrl}/rest/v1/achievements?user_id=eq.${userId}&select=*&order=achievement_date.desc`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch achievements');
    }

    return await response.json();
}

// 执行进度分析
async function performProgressAnalysis(data: any) {
    const { userId, profile, progress, skills, goals, achievements, analysisType, timeRange, includeProjections } = data;
    
    const analysis = {
        overall_progress: calculateOverallProgress(progress, goals),
        dimension_analysis: analyzeDimensions(progress, skills),
        goal_achievement: analyzeGoalAchievement(goals, progress),
        skill_development: analyzeSkillDevelopment(skills, progress),
        trend_analysis: analyzeTrends(progress, timeRange),
        performance_metrics: calculatePerformanceMetrics(progress, achievements),
        recommendations: generateProgressRecommendations(progress, goals, skills),
        alerts: generateAlerts(progress, goals)
    };
    
    if (includeProjections) {
        analysis.projections = generateProjections(progress, goals, timeRange);
    }
    
    return analysis;
}

// 计算总体进度
function calculateOverallProgress(progress: any[], goals: any[]) {
    // 按维度分组进度数据
    const dimensionProgress = {};
    
    progress.forEach(record => {
        if (!dimensionProgress[record.dimension]) {
            dimensionProgress[record.dimension] = [];
        }
        dimensionProgress[record.dimension].push(record);
    });
    
    // 计算各维度平均分数
    const dimensionScores = {};
    for (const [dimension, records] of Object.entries(dimensionProgress)) {
        const scores = (records as any[]).map(r => r.score);
        dimensionScores[dimension] = {
            current_score: scores.length > 0 ? scores[scores.length - 1] : 0,
            average_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
            trend: calculateTrend(scores),
            data_points: scores.length
        };
    }
    
    // 计算综合进度分数
    const overallScore = Object.values(dimensionScores).reduce((sum: number, dim: any) => sum + dim.current_score, 0) / Object.keys(dimensionScores).length;
    
    // 目标完成率
    const goalCompletionRate = goals.length > 0 ? 
        goals.filter(g => g.status === 'completed').length / goals.length : 0;
    
    return {
        overall_score: overallScore || 0,
        goal_completion_rate: goalCompletionRate,
        dimension_scores: dimensionScores,
        performance_level: categorizePerformance(overallScore || 0),
        improvement_rate: calculateImprovementRate(progress)
    };
}

// 分析各维度
function analyzeDimensions(progress: any[], skills: any[]) {
    const dimensions = {
        'technical_skills': {
            name: '技术能力',
            weight: 0.3,
            indicators: ['programming', 'algorithms', 'system_design']
        },
        'project_management': {
            name: '项目管理',
            weight: 0.25,
            indicators: ['planning', 'execution', 'risk_management']
        },
        'leadership': {
            name: '领导力',
            weight: 0.25,
            indicators: ['team_building', 'communication', 'decision_making']
        },
        'business_acumen': {
            name: '商业敏感度',
            weight: 0.2,
            indicators: ['market_understanding', 'strategy', 'customer_focus']
        }
    };
    
    const analysis = {};
    
    for (const [dimKey, dimConfig] of Object.entries(dimensions)) {
        const dimensionRecords = progress.filter(p => p.dimension === dimKey);
        const dimensionSkills = skills.filter(s => s.dimension === dimKey);
        
        analysis[dimKey] = {
            name: dimConfig.name,
            current_level: calculateDimensionLevel(dimensionRecords, dimensionSkills),
            progress_trend: calculateDimensionTrend(dimensionRecords),
            strength_areas: identifyStrengths(dimensionRecords, dimConfig.indicators),
            improvement_areas: identifyImprovementAreas(dimensionRecords, dimConfig.indicators),
            benchmark_comparison: compareToBenchmark(dimensionRecords, dimKey)
        };
    }
    
    return analysis;
}

// 分析目标完成情况
function analyzeGoalAchievement(goals: any[], progress: any[]) {
    const analysis = {
        total_goals: goals.length,
        completed_goals: goals.filter(g => g.status === 'completed').length,
        active_goals: goals.filter(g => g.status === 'active').length,
        overdue_goals: goals.filter(g => 
            new Date(g.target_date) < new Date() && g.status !== 'completed'
        ).length,
        goal_details: []
    };
    
    // 分析每个目标的进度
    goals.forEach(goal => {
        const goalProgress = progress.filter(p => 
            p.metadata && p.metadata.goal_id === goal.id
        );
        
        const progressRate = goal.target_value > 0 ? 
            (goal.current_value / goal.target_value) * 100 : goal.progress_percentage;
        
        analysis.goal_details.push({
            id: goal.id,
            title: goal.title,
            type: goal.goal_type,
            progress_percentage: Math.min(progressRate, 100),
            status: goal.status,
            target_date: goal.target_date,
            days_remaining: calculateDaysRemaining(goal.target_date),
            is_on_track: isGoalOnTrack(goal, progressRate),
            milestones_completed: calculateMilestonesCompleted(goal.milestones),
            recent_activity: goalProgress.slice(-5)
        });
    });
    
    return analysis;
}

// 分析技能发展
function analyzeSkillDevelopment(skills: any[], progress: any[]) {
    const skillCategories = {
        'technical': '技本技能',
        'management': '管理技能',
        'communication': '沟通技能',
        'leadership': '领导技能'
    };
    
    const analysis = {
        skill_overview: {},
        top_skills: [],
        improvement_needed: [],
        learning_velocity: {},
        skill_gaps: []
    };
    
    // 按类别分组技能
    for (const [category, categoryName] of Object.entries(skillCategories)) {
        const categorySkills = skills.filter(s => s.category === category);
        
        if (categorySkills.length > 0) {
            const averageLevel = categorySkills.reduce((sum, skill) => sum + skill.current_level, 0) / categorySkills.length;
            const maxLevel = Math.max(...categorySkills.map(s => s.current_level));
            const improvementNeeded = categorySkills.filter(s => s.current_level < s.target_level);
            
            analysis.skill_overview[category] = {
                name: categoryName,
                average_level: averageLevel,
                max_level: maxLevel,
                skill_count: categorySkills.length,
                improvement_needed_count: improvementNeeded.length,
                confidence_score: categorySkills.reduce((sum, skill) => sum + (skill.confidence_score || 0.5), 0) / categorySkills.length
            };
        }
    }
    
    // 找出最强技能
    analysis.top_skills = skills
        .filter(s => s.current_level >= 8)
        .sort((a, b) => b.current_level - a.current_level)
        .slice(0, 5)
        .map(s => ({
            name: s.skill_name,
            level: s.current_level,
            confidence: s.confidence_score
        }));
    
    // 找出需要改进的技能
    analysis.improvement_needed = skills
        .filter(s => s.current_level < s.target_level)
        .sort((a, b) => (b.target_level - b.current_level) - (a.target_level - a.current_level))
        .slice(0, 5)
        .map(s => ({
            name: s.skill_name,
            current_level: s.current_level,
            target_level: s.target_level,
            gap: s.target_level - s.current_level,
            priority: calculateSkillPriority(s)
        }));
    
    return analysis;
}

// 趋势分析
function analyzeTrends(progress: any[], timeRange: string) {
    const timeSlices = createTimeSlices(progress, timeRange);
    const trends = {};
    
    // 按维度分析趋势
    const dimensions = [...new Set(progress.map(p => p.dimension))];
    
    dimensions.forEach(dimension => {
        const dimensionData = progress.filter(p => p.dimension === dimension);
        const dimensionTrend = calculateDetailedTrend(dimensionData);
        
        trends[dimension] = {
            trend_direction: dimensionTrend.direction,
            trend_strength: dimensionTrend.strength,
            growth_rate: dimensionTrend.growthRate,
            volatility: dimensionTrend.volatility,
            peak_score: Math.max(...dimensionData.map(d => d.score)),
            recent_performance: dimensionData.slice(-10).map(d => d.score)
        };
    });
    
    return {
        time_range: timeRange,
        dimension_trends: trends,
        overall_trajectory: calculateOverallTrajectory(progress),
        momentum_analysis: analyzeMomentum(progress),
        seasonal_patterns: identifySeasonalPatterns(progress)
    };
}

// 计算绩效指标
function calculatePerformanceMetrics(progress: any[], achievements: any[]) {
    const metrics = {
        productivity_index: calculateProductivityIndex(progress),
        consistency_score: calculateConsistencyScore(progress),
        achievement_rate: calculateAchievementRate(achievements, progress),
        improvement_velocity: calculateImprovementVelocity(progress),
        goal_alignment: calculateGoalAlignment(progress)
    };
    
    // 绩效等级
    const overallMetric = Object.values(metrics).reduce((sum: number, value: any) => sum + value, 0) / Object.keys(metrics).length;
    
    return {
        ...metrics,
        overall_performance: overallMetric,
        performance_grade: getPerformanceGrade(overallMetric),
        benchmark_comparison: {
            percentile: calculatePercentile(overallMetric),
            peer_comparison: 'above_average' // 简化处理
        }
    };
}

// 生成进度建议
function generateProgressRecommendations(progress: any[], goals: any[], skills: any[]) {
    const recommendations = [];
    
    // 基于进度数据的建议
    const stagnantAreas = identifyStagnantAreas(progress);
    if (stagnantAreas.length > 0) {
        recommendations.push({
            type: 'improvement',
            priority: 'high',
            title: '加强停滞领域的发展',
            description: `在${stagnantAreas.join('、')}领域的进展缓慢，建议重点关注`,
            actions: stagnantAreas.map(area => `制定${area}的具体改进计划`)
        });
    }
    
    // 基于目标完成情况的廊议
    const overdueGoals = goals.filter(g => 
        new Date(g.target_date) < new Date() && g.status !== 'completed'
    );
    
    if (overdueGoals.length > 0) {
        recommendations.push({
            type: 'goal_management',
            priority: 'high',
            title: '处理过期目标',
            description: `您有${overdueGoals.length}个目标已经过期，需要重新评估和调整`,
            actions: ['重新评估目标可行性', '调整目标时间表', '分解复杂目标']
        });
    }
    
    // 基于技能差距的建议
    const criticalSkillGaps = skills.filter(s => 
        s.target_level - s.current_level >= 3 && s.target_level >= 7
    );
    
    if (criticalSkillGaps.length > 0) {
        recommendations.push({
            type: 'skill_development',
            priority: 'medium',
            title: '重点技能提升',
            description: '识别到几个关键技能存在较大差距',
            actions: criticalSkillGaps.map(s => `制定${s.skill_name}技能提升计划`)
        });
    }
    
    return recommendations;
}

// 生成预警
function generateAlerts(progress: any[], goals: any[]) {
    const alerts = [];
    
    // 进度下降预警
    const recentProgress = progress.filter(p => {
        const recordDate = new Date(p.record_date);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return recordDate >= oneMonthAgo;
    });
    
    const dimensionDeclines = identifyProgressDeclines(recentProgress);
    dimensionDeclines.forEach(decline => {
        alerts.push({
            type: 'performance_decline',
            severity: 'medium',
            title: `${decline.dimension}领域进度下降`,
            description: `近期在${decline.dimension}领域的表现下降了${decline.percentage}%`,
            created_at: new Date().toISOString()
        });
    });
    
    // 目标进度预警
    goals.forEach(goal => {
        if (goal.status === 'active') {
            const daysRemaining = calculateDaysRemaining(goal.target_date);
            const progressRate = goal.progress_percentage;
            
            if (daysRemaining > 0 && daysRemaining <= 30 && progressRate < 70) {
                alerts.push({
                    type: 'goal_at_risk',
                    severity: 'high',
                    title: `目标“${goal.title}”进度落后`,
                    description: `目标还有${daysRemaining}天到期，但进度只有${progressRate}%`,
                    created_at: new Date().toISOString()
                });
            }
        }
    });
    
    return alerts;
}

// 生成预测
function generateProjections(progress: any[], goals: any[], timeRange: string) {
    const projections = {
        short_term: generateShortTermProjections(progress),
        medium_term: generateMediumTermProjections(progress, goals),
        long_term: generateLongTermProjections(progress, goals),
        confidence_intervals: calculateConfidenceIntervals(progress)
    };
    
    return projections;
}

// 辅助函数实现
function getTimeFilter(timeRange: string): string {
    const now = new Date();
    switch (timeRange) {
        case '1month':
            now.setMonth(now.getMonth() - 1);
            break;
        case '3months':
            now.setMonth(now.getMonth() - 3);
            break;
        case '6months':
            now.setMonth(now.getMonth() - 6);
            break;
        case '1year':
            now.setFullYear(now.getFullYear() - 1);
            break;
        default:
            now.setMonth(now.getMonth() - 6);
    }
    return now.toISOString().split('T')[0];
}

function calculateTrend(scores: number[]): string {
    if (scores.length < 2) return 'stable';
    
    const first = scores[0];
    const last = scores[scores.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
}

function categorizePerformance(score: number): string {
    if (score >= 8) return 'excellent';
    if (score >= 6) return 'good';
    if (score >= 4) return 'average';
    return 'needs_improvement';
}

function calculateImprovementRate(progress: any[]): number {
    if (progress.length < 2) return 0;
    
    const sortedProgress = progress.sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime());
    const first = sortedProgress[0].score;
    const last = sortedProgress[sortedProgress.length - 1].score;
    
    return first > 0 ? ((last - first) / first) * 100 : 0;
}

// 其他辅助函数的简化实现
function calculateDimensionLevel(records: any[], skills: any[]): number {
    const scores = records.map(r => r.score).concat(skills.map(s => s.current_level));
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
}

function calculateDimensionTrend(records: any[]): string {
    return calculateTrend(records.map(r => r.score));
}

function identifyStrengths(records: any[], indicators: string[]): string[] {
    return indicators.filter(indicator => {
        const indicatorRecords = records.filter(r => r.indicator === indicator);
        const avgScore = indicatorRecords.length > 0 ? 
            indicatorRecords.reduce((sum, r) => sum + r.score, 0) / indicatorRecords.length : 0;
        return avgScore >= 7;
    });
}

function identifyImprovementAreas(records: any[], indicators: string[]): string[] {
    return indicators.filter(indicator => {
        const indicatorRecords = records.filter(r => r.indicator === indicator);
        const avgScore = indicatorRecords.length > 0 ? 
            indicatorRecords.reduce((sum, r) => sum + r.score, 0) / indicatorRecords.length : 0;
        return avgScore < 6;
    });
}

function compareToBenchmark(records: any[], dimension: string): any {
    // 简化的基准对比
    const benchmarks = {
        'technical_skills': 7.2,
        'project_management': 6.8,
        'leadership': 6.5,
        'business_acumen': 6.0
    };
    
    const avgScore = records.length > 0 ? 
        records.reduce((sum, r) => sum + r.score, 0) / records.length : 0;
    const benchmark = benchmarks[dimension] || 6.0;
    
    return {
        user_score: avgScore,
        benchmark_score: benchmark,
        comparison: avgScore >= benchmark ? 'above' : 'below',
        gap: Math.abs(avgScore - benchmark)
    };
}

function calculateDaysRemaining(targetDate: string): number {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isGoalOnTrack(goal: any, progressRate: number): boolean {
    const daysRemaining = calculateDaysRemaining(goal.target_date);
    const daysSinceStart = goal.created_at ? 
        Math.ceil((new Date().getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const totalDays = daysSinceStart + daysRemaining;
    
    const expectedProgress = totalDays > 0 ? (daysSinceStart / totalDays) * 100 : 0;
    
    return progressRate >= expectedProgress * 0.8; // 80%的容差
}

function calculateMilestonesCompleted(milestones: any): number {
    if (!milestones || !Array.isArray(milestones)) return 0;
    return milestones.filter(m => m.completed).length;
}

// 更多辅助函数的占位实现
function createTimeSlices(progress: any[], timeRange: string): any[] {
    return [];
}

function calculateDetailedTrend(data: any[]): any {
    return { direction: 'stable', strength: 0.5, growthRate: 0, volatility: 0.3 };
}

function calculateOverallTrajectory(progress: any[]): string {
    return 'positive';
}

function analyzeMomentum(progress: any[]): any {
    return { current_momentum: 'moderate', acceleration: 0.1 };
}

function identifySeasonalPatterns(progress: any[]): any[] {
    return [];
}

function calculateProductivityIndex(progress: any[]): number {
    return 7.5;
}

function calculateConsistencyScore(progress: any[]): number {
    return 8.0;
}

function calculateAchievementRate(achievements: any[], progress: any[]): number {
    return 7.8;
}

function calculateImprovementVelocity(progress: any[]): number {
    return 6.5;
}

function calculateGoalAlignment(progress: any[]): number {
    return 7.2;
}

function getPerformanceGrade(score: number): string {
    if (score >= 8.5) return 'A+';
    if (score >= 8.0) return 'A';
    if (score >= 7.5) return 'A-';
    if (score >= 7.0) return 'B+';
    if (score >= 6.5) return 'B';
    if (score >= 6.0) return 'B-';
    return 'C';
}

function calculatePercentile(score: number): number {
    return Math.min(Math.max(score * 10, 0), 100);
}

function identifyStagnantAreas(progress: any[]): string[] {
    return [];
}

function identifyProgressDeclines(progress: any[]): any[] {
    return [];
}

function calculateSkillPriority(skill: any): string {
    const gap = skill.target_level - skill.current_level;
    if (gap >= 3) return 'high';
    if (gap >= 2) return 'medium';
    return 'low';
}

function generateShortTermProjections(progress: any[]): any {
    return { projection_weeks: 4, expected_improvement: 0.5 };
}

function generateMediumTermProjections(progress: any[], goals: any[]): any {
    return { projection_months: 6, goal_completion_probability: 0.75 };
}

function generateLongTermProjections(progress: any[], goals: any[]): any {
    return { projection_years: 2, career_advancement_probability: 0.8 };
}

function calculateConfidenceIntervals(progress: any[]): any {
    return { lower_bound: 0.1, upper_bound: 0.9 };
}