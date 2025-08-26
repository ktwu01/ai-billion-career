"""
职业发展进度追踪系统 - 可视化组件示例
生成各种Dashboard图表，展示指标体系的可视化实现
"""

import warnings
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from matplotlib.patches import Circle
import matplotlib.patches as mpatches

def setup_matplotlib_for_plotting():
    """
    Setup matplotlib and seaborn for plotting with proper configuration.
    Call this function before creating any plots to ensure proper rendering.
    """
    # Ensure warnings are printed
    warnings.filterwarnings('default')  # Show all warnings

    # Configure matplotlib for non-interactive mode
    plt.switch_backend("Agg")

    # Set chart style
    plt.style.use("seaborn-v0_8")
    sns.set_palette("husl")

    # Configure platform-appropriate fonts for cross-platform compatibility
    # Must be set after style.use, otherwise will be overridden by style configuration
    plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "WenQuanYi Zen Hei", "PingFang SC", "Arial Unicode MS", "Hiragino Sans GB"]
    plt.rcParams["axes.unicode_minus"] = False

# 初始化matplotlib设置
setup_matplotlib_for_plotting()

# 定义颜色主题
COLORS = {
    'primary': '#1f4e79',
    'success': '#28a745', 
    'warning': '#ffc107',
    'danger': '#dc3545',
    'info': '#17a2b8',
    'secondary': '#6c757d'
}

def create_overall_progress_chart():
    """创建总体进度环形图"""
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # 示例数据
    dimensions = ['技能提升', '职业里程碑', '学习成长', '网络建设', '创新成果']
    scores = [7.5, 6.8, 8.2, 5.9, 6.3]
    weights = [30, 30, 15, 15, 10]  # 中级阶段权重
    
    # 计算加权总分
    total_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
    
    # 创建环形图
    angles = np.linspace(0, 2*np.pi, len(dimensions), endpoint=False).tolist()
    angles += angles[:1]  # 闭合图形
    scores_plot = scores + scores[:1]
    
    # 绘制雷达图背景
    ax = plt.subplot(111, projection='polar')
    ax.plot(angles, [10]*len(angles), 'grey', linewidth=0.5, alpha=0.3)
    ax.plot(angles, [8]*len(angles), 'grey', linewidth=0.5, alpha=0.3)
    ax.plot(angles, [6]*len(angles), 'grey', linewidth=0.5, alpha=0.3)
    ax.plot(angles, [4]*len(angles), 'grey', linewidth=0.5, alpha=0.3)
    ax.plot(angles, [2]*len(angles), 'grey', linewidth=0.5, alpha=0.3)
    
    # 绘制实际数据
    ax.plot(angles, scores_plot, COLORS['primary'], linewidth=2, label='当前水平')
    ax.fill(angles, scores_plot, COLORS['primary'], alpha=0.25)
    
    # 设置标签
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(dimensions, fontsize=12)
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(['2', '4', '6', '8', '10'], fontsize=10)
    ax.grid(True)
    
    # 添加总分显示
    plt.figtext(0.5, 0.02, f'综合评分: {total_score:.1f}/10.0', 
                ha='center', fontsize=16, weight='bold', color=COLORS['primary'])
    
    plt.title('职业发展五维度评估雷达图', size=16, weight='bold', pad=20)
    plt.tight_layout()
    plt.savefig('/workspace/charts/overall_progress_radar.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_skill_progress_chart():
    """创建技能进度详细分析图"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # 技术深度评分
    skills = ['编程能力', '机器学习', '深度学习', '工程化', '专业领域']
    current_scores = [8.2, 7.5, 7.8, 6.9, 8.0]
    target_scores = [9.0, 8.5, 9.0, 8.0, 9.5]
    
    x = np.arange(len(skills))
    width = 0.35
    
    ax1.bar(x - width/2, current_scores, width, label='当前水平', color=COLORS['primary'], alpha=0.8)
    ax1.bar(x + width/2, target_scores, width, label='目标水平', color=COLORS['success'], alpha=0.8)
    
    ax1.set_xlabel('技能类别')
    ax1.set_ylabel('评分 (1-10)')
    ax1.set_title('技术深度技能对比分析')
    ax1.set_xticks(x)
    ax1.set_xticklabels(skills, rotation=45)
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # 技能发展趋势
    months = ['1月', '2月', '3月', '4月', '5月', '6月']
    programming_trend = [7.2, 7.4, 7.7, 7.9, 8.0, 8.2]
    ml_trend = [6.8, 7.0, 7.1, 7.3, 7.4, 7.5]
    dl_trend = [6.5, 6.9, 7.2, 7.4, 7.6, 7.8]
    
    ax2.plot(months, programming_trend, marker='o', label='编程能力', linewidth=2)
    ax2.plot(months, ml_trend, marker='s', label='机器学习', linewidth=2)  
    ax2.plot(months, dl_trend, marker='^', label='深度学习', linewidth=2)
    
    ax2.set_xlabel('时间')
    ax2.set_ylabel('评分 (1-10)')
    ax2.set_title('技能发展趋势分析')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim(6, 9)
    
    # 项目实战成果
    project_categories = ['项目数量', '技术难度', '业务价值', '创新程度', '团队影响']
    scores = [7.8, 7.2, 6.9, 7.5, 8.1]
    
    colors = [COLORS['success'] if s >= 7.5 else COLORS['warning'] if s >= 6.5 else COLORS['danger'] for s in scores]
    bars = ax3.barh(project_categories, scores, color=colors, alpha=0.8)
    
    ax3.set_xlabel('评分 (1-10)')
    ax3.set_title('项目实战能力评估')
    ax3.set_xlim(0, 10)
    ax3.grid(True, alpha=0.3)
    
    # 在柱状图上添加数值标签
    for bar, score in zip(bars, scores):
        ax3.text(score + 0.1, bar.get_y() + bar.get_height()/2, 
                f'{score:.1f}', va='center', fontweight='bold')
    
    # 开源贡献统计
    contribution_data = {
        'GitHub Stars': 1250,
        'Repository数': 18,
        '代码提交': 892,
        'PR贡献': 156,
        '技术文章': 24
    }
    
    labels = list(contribution_data.keys())
    sizes = list(contribution_data.values())
    
    # 归一化数据用于饼图展示
    max_val = max(sizes)
    normalized_sizes = [s/max_val * 100 for s in sizes]
    
    colors_pie = [COLORS['primary'], COLORS['success'], COLORS['info'], COLORS['warning'], COLORS['secondary']]
    ax4.pie(normalized_sizes, labels=labels, colors=colors_pie, autopct='%1.1f%%', startangle=90)
    ax4.set_title('开源贡献分布')
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/skill_progress_analysis.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_career_milestone_chart():
    """创建职业里程碑进度图"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # 薪资增长趋势
    years = ['2020', '2021', '2022', '2023', '2024', '2025(预期)']
    salary_data = [35, 52, 68, 89, 125, 158]  # 单位：万元
    
    ax1.plot(years, salary_data, marker='o', linewidth=3, color=COLORS['success'], markersize=8)
    ax1.fill_between(years, salary_data, alpha=0.3, color=COLORS['success'])
    
    # 添加增长率标注
    for i in range(1, len(salary_data)):
        growth_rate = (salary_data[i] - salary_data[i-1]) / salary_data[i-1] * 100
        ax1.annotate(f'+{growth_rate:.0f}%', 
                    xy=(i, salary_data[i]), 
                    xytext=(5, 10), 
                    textcoords='offset points',
                    fontsize=9, color=COLORS['primary'])
    
    ax1.set_xlabel('年份')
    ax1.set_ylabel('年薪 (万元)')
    ax1.set_title('薪资增长轨迹')
    ax1.grid(True, alpha=0.3)
    
    # 职位晋升路径
    positions = ['初级工程师', '高级工程师', '资深工程师', '技术专家', '技术总监']
    position_years = [2020, 2021.5, 2023, 2024, 2025.5]
    position_levels = [3, 5, 6, 8, 9]
    
    ax2.step(position_years, position_levels, where='post', linewidth=3, color=COLORS['primary'])
    ax2.scatter(position_years, position_levels, s=100, color=COLORS['danger'], zorder=5)
    
    # 添加职位标签
    for year, level, pos in zip(position_years, position_levels, positions):
        ax2.annotate(pos, xy=(year, level), xytext=(0, 15), 
                    textcoords='offset points', ha='center', 
                    fontsize=9, rotation=45)
    
    ax2.set_xlabel('年份')
    ax2.set_ylabel('职位等级')
    ax2.set_title('职位晋升路径')
    ax2.set_ylim(0, 10)
    ax2.grid(True, alpha=0.3)
    
    # 项目成就统计
    project_types = ['技术创新', '产品优化', '系统架构', '团队建设', '业务增长']
    project_counts = [8, 12, 5, 6, 4]
    impact_scores = [8.5, 7.2, 9.1, 7.8, 8.9]
    
    # 创建气泡图
    ax3.scatter(project_counts, impact_scores, 
               s=[count*50 for count in project_counts], 
               c=range(len(project_types)), 
               cmap='viridis', alpha=0.7)
    
    # 添加项目类型标签
    for i, (count, impact, proj_type) in enumerate(zip(project_counts, impact_scores, project_types)):
        ax3.annotate(proj_type, (count, impact), 
                    xytext=(5, 5), textcoords='offset points', fontsize=9)
    
    ax3.set_xlabel('项目数量')
    ax3.set_ylabel('影响力评分')
    ax3.set_title('项目成就分布 (气泡大小表示项目数量)')
    ax3.grid(True, alpha=0.3)
    
    # 获奖认可情况
    award_categories = ['内部认可', '行业奖项', '技术专利', '学术论文', '开源贡献']
    award_counts = [5, 2, 3, 4, 8]
    
    bars = ax4.bar(award_categories, award_counts, 
                   color=[COLORS['success'], COLORS['primary'], COLORS['warning'], 
                         COLORS['info'], COLORS['secondary']], alpha=0.8)
    
    ax4.set_xlabel('认可类型')
    ax4.set_ylabel('数量')
    ax4.set_title('获奖认可统计')
    ax4.grid(True, alpha=0.3)
    
    # 添加数值标签
    for bar, count in zip(bars, award_counts):
        ax4.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                str(count), ha='center', va='bottom', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/career_milestone_progress.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_learning_growth_chart():
    """创建学习成长进度图"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # 学习完成情况热力图
    months = ['1月', '2月', '3月', '4月', '5月', '6月']
    learning_types = ['在线课程', '技术认证', '技术书籍', '项目实践', '技术分享']
    
    # 学习时间数据 (小时)
    learning_data = np.array([
        [20, 25, 30, 28, 32, 35],  # 在线课程
        [8, 0, 15, 0, 12, 0],      # 技术认证
        [15, 18, 12, 20, 16, 22],  # 技术书籍
        [40, 45, 50, 38, 42, 48],  # 项目实践
        [5, 8, 6, 10, 12, 15]      # 技术分享
    ])
    
    im = ax1.imshow(learning_data, cmap='YlOrRd', aspect='auto')
    ax1.set_xticks(range(len(months)))
    ax1.set_yticks(range(len(learning_types)))
    ax1.set_xticklabels(months)
    ax1.set_yticklabels(learning_types)
    ax1.set_title('学习活动热力图 (小时/月)')
    
    # 添加数值标签
    for i in range(len(learning_types)):
        for j in range(len(months)):
            ax1.text(j, i, learning_data[i, j], ha='center', va='center', 
                    color='white' if learning_data[i, j] > 25 else 'black')
    
    plt.colorbar(im, ax=ax1)
    
    # 认证获得进度
    cert_categories = ['云平台认证', '技术框架', '项目管理', '行业认证']
    obtained = [3, 2, 1, 2]
    total = [5, 4, 3, 4]
    
    x = np.arange(len(cert_categories))
    width = 0.35
    
    ax2.bar(x - width/2, obtained, width, label='已获得', color=COLORS['success'], alpha=0.8)
    ax2.bar(x + width/2, total, width, label='计划总数', color=COLORS['primary'], alpha=0.8)
    
    ax2.set_xlabel('认证类别')
    ax2.set_ylabel('数量')
    ax2.set_title('认证获得进度')
    ax2.set_xticks(x)
    ax2.set_xticklabels(cert_categories, rotation=45)
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 知识管理效果评估
    knowledge_aspects = ['知识结构化', '更新频率', '检索效率', '应用转化', '分享传播']
    current_scores = [7.8, 8.2, 7.5, 6.9, 7.6]
    
    # 创建雷达图
    angles = np.linspace(0, 2*np.pi, len(knowledge_aspects), endpoint=False).tolist()
    angles += angles[:1]
    scores_plot = current_scores + current_scores[:1]
    
    ax3 = plt.subplot(2, 2, 3, projection='polar')
    ax3.plot(angles, scores_plot, COLORS['info'], linewidth=2)
    ax3.fill(angles, scores_plot, COLORS['info'], alpha=0.25)
    ax3.set_xticks(angles[:-1])
    ax3.set_xticklabels(knowledge_aspects)
    ax3.set_ylim(0, 10)
    ax3.set_title('知识管理能力评估')
    ax3.grid(True)
    
    # 学习ROI分析
    learning_investments = ['课程费用', '书籍购买', '会议参加', '工具订阅', '时间投入']
    costs = [5000, 1200, 8000, 2400, 15000]  # 转换为金额等价
    benefits = [12000, 3000, 20000, 6000, 45000]  # 估算收益
    
    x = np.arange(len(learning_investments))
    width = 0.35
    
    ax4.bar(x - width/2, costs, width, label='投入成本', color=COLORS['danger'], alpha=0.8)
    ax4.bar(x + width/2, benefits, width, label='估算收益', color=COLORS['success'], alpha=0.8)
    
    ax4.set_xlabel('学习投资类型')
    ax4.set_ylabel('金额 (元)')
    ax4.set_title('学习投资回报分析')
    ax4.set_xticks(x)
    ax4.set_xticklabels(learning_investments, rotation=45)
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/learning_growth_analysis.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_network_innovation_chart():
    """创建网络建设和创新成果图"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # 人脉网络分布
    network_types = ['同行专家', '行业领导', '跨领域人士', '创业投资圈', '学术研究者']
    contact_counts = [25, 8, 15, 6, 12]
    interaction_scores = [7.8, 6.5, 7.2, 8.9, 7.6]
    
    # 创建气泡图
    colors = [COLORS['primary'], COLORS['success'], COLORS['info'], COLORS['warning'], COLORS['secondary']]
    
    for i, (count, score, color, net_type) in enumerate(zip(contact_counts, interaction_scores, colors, network_types)):
        ax1.scatter(count, score, s=count*20, c=color, alpha=0.7, label=net_type)
    
    ax1.set_xlabel('联系人数量')
    ax1.set_ylabel('互动质量评分')
    ax1.set_title('人脉网络分布图')
    ax1.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    ax1.grid(True, alpha=0.3)
    
    # 影响力增长趋势
    months = ['1月', '2月', '3月', '4月', '5月', '6月']
    blog_followers = [120, 145, 180, 210, 250, 290]
    github_stars = [80, 95, 130, 180, 220, 280]
    speaking_invites = [0, 1, 1, 2, 3, 4]
    
    ax2_twin = ax2.twinx()
    
    line1 = ax2.plot(months, blog_followers, marker='o', label='博客关注者', color=COLORS['primary'])
    line2 = ax2.plot(months, github_stars, marker='s', label='GitHub Stars', color=COLORS['success'])
    line3 = ax2_twin.plot(months, speaking_invites, marker='^', label='演讲邀请', color=COLORS['danger'])
    
    ax2.set_xlabel('时间')
    ax2.set_ylabel('关注者/Stars数量')
    ax2_twin.set_ylabel('演讲邀请次数')
    ax2.set_title('个人影响力增长趋势')
    
    # 合并图例
    lines = line1 + line2 + line3
    labels = [l.get_label() for l in lines]
    ax2.legend(lines, labels, loc='upper left')
    ax2.grid(True, alpha=0.3)
    
    # 创新成果分布
    innovation_types = ['技术专利', '学术论文', '开源项目', '技术标准', '产品创新']
    counts = [3, 5, 12, 1, 8]
    impact_levels = [8.5, 7.8, 6.9, 9.2, 7.5]
    
    bars = ax3.bar(innovation_types, counts, color=colors, alpha=0.8)
    
    # 添加影响力评分标签
    for bar, count, impact in zip(bars, counts, impact_levels):
        ax3.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                f'{count}\n(影响力:{impact})', ha='center', va='bottom', fontsize=9)
    
    ax3.set_xlabel('创新成果类型')
    ax3.set_ylabel('数量')
    ax3.set_title('创新成果分布')
    ax3.grid(True, alpha=0.3)
    
    # 技术影响力评估
    influence_metrics = ['代码下载量', '论文引用数', '技术咨询', '标准采用', '人才培养']
    current_values = [1500, 25, 8, 2, 15]
    target_values = [3000, 50, 15, 5, 30]
    
    x = np.arange(len(influence_metrics))
    width = 0.35
    
    ax4.bar(x - width/2, current_values, width, label='当前水平', color=COLORS['primary'], alpha=0.8)
    ax4.bar(x + width/2, target_values, width, label='目标水平', color=COLORS['success'], alpha=0.8)
    
    ax4.set_xlabel('影响力指标')
    ax4.set_ylabel('数量/次数')
    ax4.set_title('技术影响力对比')
    ax4.set_xticks(x)
    ax4.set_xticklabels(influence_metrics, rotation=45)
    ax4.legend()
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/network_innovation_analysis.png', dpi=300, bbox_inches='tight')
    plt.close()

def create_comprehensive_dashboard():
    """创建综合Dashboard概览"""
    fig = plt.figure(figsize=(20, 16))
    gs = fig.add_gridspec(4, 4, hspace=0.3, wspace=0.3)
    
    # 总体进度环形图
    ax1 = fig.add_subplot(gs[0:2, 0:2])
    
    # 示例数据
    total_score = 7.3
    target_score = 8.5
    
    # 创建环形图
    sizes = [total_score, 10 - total_score]
    colors = [COLORS['success'], '#f0f0f0']
    
    wedges, texts = ax1.pie(sizes, colors=colors, startangle=90, counterclock=False,
                           wedgeprops=dict(width=0.5))
    
    # 添加中心文字
    ax1.text(0, 0, f'{total_score:.1f}/10', ha='center', va='center', 
             fontsize=24, fontweight='bold', color=COLORS['primary'])
    ax1.text(0, -0.3, '综合评分', ha='center', va='center', 
             fontsize=14, color=COLORS['secondary'])
    
    ax1.set_title('职业发展总体进度', fontsize=16, fontweight='bold', pad=20)
    
    # 五维度雷达图
    ax2 = fig.add_subplot(gs[0:2, 2:4], projection='polar')
    
    dimensions = ['技能提升', '职业里程碑', '学习成长', '网络建设', '创新成果']
    scores = [7.5, 6.8, 8.2, 5.9, 6.3]
    
    angles = np.linspace(0, 2*np.pi, len(dimensions), endpoint=False).tolist()
    angles += angles[:1]
    scores_plot = scores + scores[:1]
    
    ax2.plot(angles, scores_plot, COLORS['primary'], linewidth=3)
    ax2.fill(angles, scores_plot, COLORS['primary'], alpha=0.25)
    ax2.set_xticks(angles[:-1])
    ax2.set_xticklabels(dimensions, fontsize=11)
    ax2.set_ylim(0, 10)
    ax2.set_title('五维度能力评估', fontsize=14, fontweight='bold', pad=20)
    ax2.grid(True)
    
    # 关键指标趋势
    ax3 = fig.add_subplot(gs[2, :2])
    
    months = ['1月', '2月', '3月', '4月', '5月', '6月']
    skill_trend = [6.8, 7.0, 7.2, 7.3, 7.4, 7.5]
    career_trend = [6.2, 6.3, 6.4, 6.6, 6.7, 6.8]
    network_trend = [5.1, 5.3, 5.5, 5.6, 5.8, 5.9]
    
    ax3.plot(months, skill_trend, marker='o', label='技能提升', linewidth=2)
    ax3.plot(months, career_trend, marker='s', label='职业里程碑', linewidth=2)
    ax3.plot(months, network_trend, marker='^', label='网络建设', linewidth=2)
    
    ax3.set_xlabel('时间')
    ax3.set_ylabel('评分')
    ax3.set_title('关键指标发展趋势')
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # 目标达成情况
    ax4 = fig.add_subplot(gs[2, 2:])
    
    goals = ['薪资目标', '技能目标', '项目目标', '学习目标', '网络目标']
    completion = [85, 75, 90, 88, 65]
    
    colors_bar = [COLORS['success'] if c >= 80 else COLORS['warning'] if c >= 60 else COLORS['danger'] for c in completion]
    bars = ax4.barh(goals, completion, color=colors_bar, alpha=0.8)
    
    ax4.set_xlabel('完成度 (%)')
    ax4.set_title('年度目标达成情况')
    ax4.set_xlim(0, 100)
    ax4.grid(True, alpha=0.3)
    
    # 添加完成度标签
    for bar, comp in zip(bars, completion):
        ax4.text(comp + 1, bar.get_y() + bar.get_height()/2,
                f'{comp}%', va='center', fontweight='bold')
    
    # 预警提醒面板
    ax5 = fig.add_subplot(gs[3, :])
    ax5.axis('off')
    
    # 创建预警信息
    warnings_text = """
    ⚠️ 预警提醒：
    • 网络建设进度落后，建议加强行业交流活动参与
    • 创新成果产出偏低，建议启动专利申请或论文写作计划
    • 距离年度薪资目标还有15%差距，建议准备晋升材料
    
    📈 改进建议：
    • 参加下月AI技术大会，拓展人脉网络
    • 启动深度学习框架优化项目，争取技术突破
    • 准备技术分享，提升个人影响力
    """
    
    ax5.text(0.02, 0.5, warnings_text, transform=ax5.transAxes, fontsize=12,
             verticalalignment='center', bbox=dict(boxstyle="round,pad=0.5", 
             facecolor=COLORS['warning'], alpha=0.1))
    
    plt.suptitle('职业发展进度追踪Dashboard', fontsize=20, fontweight='bold')
    plt.savefig('/workspace/charts/comprehensive_dashboard.png', dpi=300, bbox_inches='tight')
    plt.close()

def main():
    """生成所有可视化图表"""
    print("正在生成职业发展进度追踪系统的可视化图表...")
    
    # 创建图表保存目录
    import os
    os.makedirs('/workspace/charts', exist_ok=True)
    
    # 生成各类图表
    create_overall_progress_chart()
    print("✅ 总体进度雷达图已生成")
    
    create_skill_progress_chart()
    print("✅ 技能进度分析图已生成")
    
    create_career_milestone_chart()
    print("✅ 职业里程碑图已生成")
    
    create_learning_growth_chart()
    print("✅ 学习成长分析图已生成")
    
    create_network_innovation_chart()
    print("✅ 网络建设和创新成果图已生成")
    
    create_comprehensive_dashboard()
    print("✅ 综合Dashboard已生成")
    
    print("\n所有可视化图表生成完成！")
    print("图表保存位置：/workspace/charts/")

if __name__ == "__main__":
    main()
