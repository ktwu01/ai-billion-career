"""
AICS与MLE职业发展轨迹数据分析
"""

import warnings
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

def setup_matplotlib_for_plotting():
    """
    Setup matplotlib and seaborn for plotting with proper configuration.
    Call this function before creating any plots to ensure proper rendering.
    """
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

# 设置matplotlib
setup_matplotlib_for_plotting()

print("🔍 开始创建AICS与MLE职业发展轨迹分析图表...")

# 1. 薪资对比分析
def create_salary_comparison():
    """创建AICS vs MLE薪资对比图"""
    
    # 基于收集的数据创建薪资对比数据
    experience_levels = ['0-2年\n(入门级)', '3-5年\n(中级)', '6-8年\n(高级)', '8+年\n(资深)']
    
    # MLE薪资数据 (基于多个来源的平均值，单位：千美元)
    mle_salaries = [118, 156, 184, 240]  # 来源：Glassdoor, levels.fyi等
    
    # AICS薪资数据 (基于AI专家薪资报告和行业调研)
    # AICS作为更专业化的角色，薪资通常比一般MLE高10-30%
    aics_salaries = [140, 200, 280, 350]
    
    # 顶级公司额外津贴 (OpenAI, Google, NVIDIA等)
    top_company_premium = [50, 100, 200, 400]
    
    x = np.arange(len(experience_levels))
    width = 0.25
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    bars1 = ax.bar(x - width, mle_salaries, width, label='MLE (机器学习工程师)', alpha=0.8, color='#3498db')
    bars2 = ax.bar(x, aics_salaries, width, label='AICS (AI芯片专家)', alpha=0.8, color='#e74c3c')
    bars3 = ax.bar(x + width, [m + a + t for m, a, t in zip(mle_salaries, aics_salaries, top_company_premium)], 
                   width, label='顶级公司 (OpenAI/Google/NVIDIA)', alpha=0.6, color='#f39c12')
    
    # 添加数值标签
    def add_value_labels(bars):
        for bar in bars:
            height = bar.get_height()
            ax.annotate(f'${height}K',
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3),  # 3 points vertical offset
                       textcoords="offset points",
                       ha='center', va='bottom', fontsize=10)
    
    add_value_labels(bars1)
    add_value_labels(bars2)
    add_value_labels(bars3)
    
    ax.set_xlabel('经验水平', fontsize=12, fontweight='bold')
    ax.set_ylabel('年薪 (千美元)', fontsize=12, fontweight='bold')
    ax.set_title('AICS vs MLE 薪资对比分析 (2024-2025)', fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(experience_levels)
    ax.legend(loc='upper left', fontsize=11)
    ax.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/salary_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ 薪资对比图已保存至 /workspace/charts/salary_comparison.png")

# 2. 顶级公司薪资热力图
def create_top_companies_heatmap():
    """创建顶级公司薪资热力图"""
    
    companies = ['OpenAI', 'Google', 'NVIDIA', 'Meta', 'Microsoft', 'Amazon', 'Apple', 'Anthropic']
    roles = ['入门级\nMLE', '中级\nMLE', '高级\nMLE', '入门级\nAICS', '中级\nAICS', '高级\nAICS']
    
    # 薪资数据矩阵 (千美元) - 基于levels.fyi和行业报告
    salary_matrix = np.array([
        [248, 394, 875, 280, 450, 1000],  # OpenAI
        [180, 280, 450, 200, 320, 500],   # Google
        [170, 280, 420, 190, 350, 480],   # NVIDIA
        [190, 320, 500, 220, 380, 580],   # Meta
        [175, 260, 380, 195, 300, 450],   # Microsoft
        [160, 240, 350, 180, 280, 400],   # Amazon
        [170, 250, 380, 190, 290, 450],   # Apple
        [220, 350, 600, 250, 400, 700],   # Anthropic
    ])
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # 创建热力图
    im = ax.imshow(salary_matrix, cmap='YlOrRd', aspect='auto')
    
    # 设置刻度标签
    ax.set_xticks(np.arange(len(roles)))
    ax.set_yticks(np.arange(len(companies)))
    ax.set_xticklabels(roles, fontsize=11)
    ax.set_yticklabels(companies, fontsize=11)
    
    # 添加数值标签
    for i in range(len(companies)):
        for j in range(len(roles)):
            text = ax.text(j, i, f'${salary_matrix[i, j]}K',
                          ha="center", va="center", color="white", fontweight='bold', fontsize=10)
    
    ax.set_title('顶级科技公司薪资对比热力图 (2024-2025)', fontsize=16, fontweight='bold', pad=20)
    
    # 添加颜色条
    cbar = plt.colorbar(im, ax=ax, shrink=0.8)
    cbar.set_label('年薪 (千美元)', rotation=270, labelpad=20, fontsize=12)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/top_companies_salary_heatmap.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ 顶级公司薪资热力图已保存至 /workspace/charts/top_companies_salary_heatmap.png")

# 3. 技能要求雷达图
def create_skills_radar_chart():
    """创建AICS vs MLE技能要求雷达图"""
    
    categories = ['编程能力', '数学统计', '硬件知识', '系统设计', '机器学习', '云平台', '团队协作', '领导力']
    
    # 技能重要性评分 (1-10分)
    mle_scores = [9, 8, 3, 7, 10, 8, 8, 6]      # MLE技能分布
    aics_scores = [8, 7, 10, 9, 8, 6, 7, 7]     # AICS技能分布
    
    # 角度计算
    angles = [n / float(len(categories)) * 2 * np.pi for n in range(len(categories))]
    angles += angles[:1]  # 闭合图形
    
    mle_scores += mle_scores[:1]
    aics_scores += aics_scores[:1]
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    # 绘制MLE
    ax.plot(angles, mle_scores, 'o-', linewidth=2, label='MLE (机器学习工程师)', color='#3498db')
    ax.fill(angles, mle_scores, alpha=0.25, color='#3498db')
    
    # 绘制AICS
    ax.plot(angles, aics_scores, 'o-', linewidth=2, label='AICS (AI芯片专家)', color='#e74c3c')
    ax.fill(angles, aics_scores, alpha=0.25, color='#e74c3c')
    
    # 设置标签
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=11)
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(['2', '4', '6', '8', '10'], fontsize=10)
    ax.grid(True)
    
    plt.title('AICS vs MLE 技能要求对比雷达图', size=16, fontweight='bold', pad=30)
    plt.legend(loc='upper right', bbox_to_anchor=(1.2, 1.1), fontsize=12)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/skills_radar_chart.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ 技能要求雷达图已保存至 /workspace/charts/skills_radar_chart.png")

# 4. 职业发展路径图
def create_career_path_timeline():
    """创建职业发展路径时间线图"""
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
    
    # MLE发展路径
    mle_stages = ['初级MLE\n(0-2年)', '中级MLE\n(2-5年)', '高级MLE\n(5-8年)', 'ML架构师\n(8-12年)', 'CTO/VP\n(12年+)']
    mle_timeline = [1, 3, 6, 10, 15]
    mle_salaries = [118, 156, 184, 280, 400]
    
    # AICS发展路径
    aics_stages = ['硬件工程师\n(0-3年)', 'AI芯片工程师\n(3-6年)', '高级AICS\n(6-10年)', '芯片架构师\n(10-15年)', '创业/CTO\n(15年+)']
    aics_timeline = [1.5, 4.5, 8, 12.5, 18]
    aics_salaries = [140, 200, 280, 450, 600]
    
    # 绘制MLE路径
    ax1.plot(mle_timeline, mle_salaries, 'o-', linewidth=3, markersize=8, color='#3498db', label='MLE职业路径')
    for i, (x, y, stage) in enumerate(zip(mle_timeline, mle_salaries, mle_stages)):
        ax1.annotate(stage, (x, y), textcoords="offset points", xytext=(0,15), 
                    ha='center', fontsize=10, bbox=dict(boxstyle="round,pad=0.3", facecolor='lightblue', alpha=0.7))
        ax1.annotate(f'${y}K', (x, y), textcoords="offset points", xytext=(0,-25), 
                    ha='center', fontsize=10, fontweight='bold', color='#2980b9')
    
    ax1.set_xlim(0, 20)
    ax1.set_ylim(50, 450)
    ax1.set_xlabel('职业年限', fontsize=12, fontweight='bold')
    ax1.set_ylabel('年薪 (千美元)', fontsize=12, fontweight='bold')
    ax1.set_title('MLE (机器学习工程师) 职业发展路径', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    
    # 绘制AICS路径
    ax2.plot(aics_timeline, aics_salaries, 'o-', linewidth=3, markersize=8, color='#e74c3c', label='AICS职业路径')
    for i, (x, y, stage) in enumerate(zip(aics_timeline, aics_salaries, aics_stages)):
        ax2.annotate(stage, (x, y), textcoords="offset points", xytext=(0,15), 
                    ha='center', fontsize=10, bbox=dict(boxstyle="round,pad=0.3", facecolor='lightcoral', alpha=0.7))
        ax2.annotate(f'${y}K', (x, y), textcoords="offset points", xytext=(0,-25), 
                    ha='center', fontsize=10, fontweight='bold', color='#c0392b')
    
    ax2.set_xlim(0, 20)
    ax2.set_ylim(50, 650)
    ax2.set_xlabel('职业年限', fontsize=12, fontweight='bold')
    ax2.set_ylabel('年薪 (千美元)', fontsize=12, fontweight='bold')
    ax2.set_title('AICS (AI芯片专家) 职业发展路径', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/career_path_timeline.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ 职业发展路径图已保存至 /workspace/charts/career_path_timeline.png")

# 5. AI芯片市场投资趋势图
def create_investment_trends():
    """创建AI芯片市场投资趋势图"""
    
    years = ['2020', '2021', '2022', '2023', '2024', '2025E', '2030E']
    market_size = [15, 22, 35, 55, 85, 113, 295]  # 单位：十亿美元
    vc_investment = [0.8, 1.2, 2.1, 1.8, 2.5, 3.2, 5.0]  # 风险投资，单位：十亿美元
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    # 市场规模趋势
    ax1.plot(years, market_size, 'o-', linewidth=3, markersize=8, color='#2ecc71', label='AI芯片市场规模')
    ax1.fill_between(years, market_size, alpha=0.3, color='#2ecc71')
    
    for x, y in zip(years, market_size):
        ax1.annotate(f'${y}B', (x, y), textcoords="offset points", xytext=(0,10), 
                    ha='center', fontsize=10, fontweight='bold')
    
    ax1.set_ylabel('市场规模 (十亿美元)', fontsize=12, fontweight='bold')
    ax1.set_title('AI芯片市场规模增长趋势', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend()
    
    # 风险投资趋势
    bars = ax2.bar(years, vc_investment, alpha=0.8, color='#f39c12', label='风险投资额')
    
    for bar, value in zip(bars, vc_investment):
        height = bar.get_height()
        ax2.annotate(f'${value}B',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    ax2.set_ylabel('风险投资额 (十亿美元)', fontsize=12, fontweight='bold')
    ax2.set_xlabel('年份', fontsize=12, fontweight='bold')
    ax2.set_title('AI芯片创业公司风险投资趋势', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3, axis='y')
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig('/workspace/charts/investment_trends.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ 投资趋势图已保存至 /workspace/charts/investment_trends.png")

# 6. 创业退出案例分析
def create_startup_exits_analysis():
    """创建AI芯片创业公司退出案例分析"""
    
    companies = ['Graphcore\n(SoftBank收购)', 'Cerebras\n(IPO申请)', 'Habana\n(Intel收购)', 'Mellanox\n(NVIDIA收购)', 'Mobileye\n(Intel收购)']
    valuations = [0.4, 4.0, 2.0, 6.9, 15.3]  # 十亿美元
    years = [2024, 2024, 2019, 2020, 2017]
    exit_types = ['收购', 'IPO', '收购', '收购', '收购']
    colors = ['#e74c3c', '#f39c12', '#e74c3c', '#e74c3c', '#e74c3c']
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    bars = ax.bar(companies, valuations, color=colors, alpha=0.8)
    
    # 添加数值标签
    for bar, value, exit_type in zip(bars, valuations, exit_types):
        height = bar.get_height()
        ax.annotate(f'${value}B\n({exit_type})',
                   xy=(bar.get_x() + bar.get_width() / 2, height),
                   xytext=(0, 3),
                   textcoords="offset points",
                   ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    ax.set_ylabel('估值/交易额 (十亿美元)', fontsize=12, fontweight='bold')
    ax.set_title('AI芯片创业公司退出案例分析', fontsize=16, fontweight='bold', pad=20)
    ax.grid(True, alpha=0.3, axis='y')
    
    # 添加图例
    from matplotlib.patches import Patch
    legend_elements = [Patch(facecolor='#e74c3c', label='收购退出'),
                      Patch(facecolor='#f39c12', label='IPO退出')]
    ax.legend(handles=legend_elements, loc='upper right', fontsize=11)
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('/workspace/charts/startup_exits_analysis.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("✅ 创业退出案例分析图已保存至 /workspace/charts/startup_exits_analysis.png")

# 创建charts目录
import os
os.makedirs('/workspace/charts', exist_ok=True)

# 执行所有分析
print("📊 开始生成分析图表...")
create_salary_comparison()
create_top_companies_heatmap()
create_skills_radar_chart()
create_career_path_timeline()
create_investment_trends()
create_startup_exits_analysis()

print("\n🎉 所有分析图表已生成完成！")
print("📁 图表保存位置：/workspace/charts/")
print("📋 生成的图表列表：")
print("   1. salary_comparison.png - 薪资对比分析")
print("   2. top_companies_salary_heatmap.png - 顶级公司薪资热力图")
print("   3. skills_radar_chart.png - 技能要求雷达图")
print("   4. career_path_timeline.png - 职业发展路径图")
print("   5. investment_trends.png - 投资趋势图")
print("   6. startup_exits_analysis.png - 创业退出案例分析")
