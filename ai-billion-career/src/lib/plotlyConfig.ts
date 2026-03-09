import { Config, Layout } from 'plotly.js'

// 深色主题配置，匹配GitHub风格
export const darkThemeLayout: Partial<Layout> = {
  paper_bgcolor: 'rgba(0,0,0,0)', // 透明背景
  plot_bgcolor: 'rgba(0,0,0,0)', // 透明绘图区背景
  font: {
    color: '#e5e7eb', // 文字颜色 (gray-200)
    family: 'Inter, system-ui, sans-serif',
    size: 12
  },
  xaxis: {
    gridcolor: '#374151', // 网格线颜色 (gray-700)
    linecolor: '#6b7280', // 轴线颜色 (gray-500)
    tickcolor: '#6b7280',
    color: '#d1d5db' // 刻度文字颜色 (gray-300)
  },
  yaxis: {
    gridcolor: '#374151',
    linecolor: '#6b7280',
    tickcolor: '#6b7280',
    color: '#d1d5db'
  },
  legend: {
    bgcolor: 'rgba(0,0,0,0)',
    bordercolor: '#374151',
    font: {
      color: '#d1d5db'
    }
  },
  margin: {
    l: 60,
    r: 60,
    t: 60,
    b: 60
  },
  // 响应式设计配置
  autosize: true
}

// Plotly配置选项 - 启用交互功能
export const plotlyConfig: Partial<Config> = {
  displayModeBar: true,
  displaylogo: false,
  // 保留缩放和平移功能，移除不必要的按钮
  modeBarButtonsToRemove: [
    'lasso2d',
    'select2d',
    'hoverClosestCartesian',
    'hoverCompareCartesian',
    'toggleSpikelines'
  ],
  responsive: true,
  // 启用滚轮缩放
  scrollZoom: true,
  // 启用双击重置
  doubleClick: 'reset+autosize',
  toImageButtonOptions: {
    format: 'png',
    filename: 'chart',
    height: 500,
    width: 700,
    scale: 1
  }
}

// 技能类别颜色映射
export const skillColors = {
  '技术技能': '#3b82f6', // blue-500
  '项目管理': '#10b981', // emerald-500
  '领导力': '#8b5cf6', // violet-500
  '商业敏感度': '#f59e0b', // amber-500
  '沟通能力': '#ef4444', // red-500
  '创新思维': '#06b6d4', // cyan-500
  '数据分析': '#84cc16', // lime-500
  '战略思维': '#ec4899' // pink-500
}

// 进度状态颜色
export const progressColors = {
  excellent: '#10b981', // emerald-500
  good: '#3b82f6', // blue-500
  average: '#f59e0b', // amber-500
  needsImprovement: '#ef4444' // red-500
}

// 获取技能等级颜色
export const getSkillLevelColor = (level: number): string => {
  if (level >= 85) return progressColors.excellent
  if (level >= 70) return progressColors.good
  if (level >= 50) return progressColors.average
  return progressColors.needsImprovement
}

// 通用的悬停模板
export const hoverTemplate = {
  basic: '<b>%{fullData.name}</b><br>' +
         '%{y}: %{x}<br>' +
         '<extra></extra>',
  percentage: '<b>%{fullData.name}</b><br>' +
              '%{theta}: %{r}%<br>' +
              '<extra></extra>',
  radar: '<b>%{fullData.name}</b><br>' +
         '%{theta}: %{r}%<br>' +
         '<extra></extra>'
}