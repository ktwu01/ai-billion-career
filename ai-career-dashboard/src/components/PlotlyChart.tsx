import React from 'react'
import Plot from 'react-plotly.js'
import { Loader2, AlertCircle } from 'lucide-react'
import { plotlyConfig } from '../lib/plotlyConfig'
import type { Data, Layout, Config } from 'plotly.js'

interface PlotlyChartProps {
  data: Partial<Data>[]
  layout?: Partial<Layout>
  config?: Partial<Config>
  isLoading?: boolean
  error?: string | null
  width?: number
  height?: number
  className?: string
  loadingText?: string
  errorRetry?: () => void
}

export function PlotlyChart({
  data,
  layout = {},
  config = {},
  isLoading = false,
  error = null,
  width,
  height,
  className = '',
  loadingText = '正在加载图表...',
  errorRetry
}: PlotlyChartProps) {
  // 合并默认配置
  const mergedConfig = {
    ...plotlyConfig,
    ...config
  }

  // 处理加载状态
  if (isLoading) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-900/50 rounded-lg border border-gray-700 ${className}`}
        style={{ width, height: height || 300 }}
      >
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-gray-400 text-sm font-medium">{loadingText}</p>
        <p className="text-gray-500 text-xs mt-1">请稍候片刻</p>
      </div>
    )
  }

  // 处理错误状态
  if (error) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-red-900/20 rounded-lg border border-red-700/50 ${className}`}
        style={{ width, height: height || 300 }}
      >
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-red-400 text-sm font-medium mb-2">图表加载失败</p>
        <p className="text-gray-400 text-xs text-center px-4 mb-3">
          {error}
        </p>
        {errorRetry && (
          <button 
            onClick={errorRetry}
            className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            重新加载
          </button>
        )}
      </div>
    )
  }

  // 处理空数据状态
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-900/30 rounded-lg border border-gray-700/50 ${className}`}
        style={{ width, height: height || 300 }}
      >
        <div className="w-8 h-8 bg-gray-700 rounded mb-3 flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
        </div>
        <p className="text-gray-400 text-sm font-medium">暂无数据</p>
        <p className="text-gray-500 text-xs mt-1">等待数据加载</p>
      </div>
    )
  }

  // 渲染正常的图表
  return (
    <div className={className}>
      <Plot
        data={data}
        layout={{
          autosize: true,
          ...layout
        }}
        config={mergedConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
        className="plotly-chart"
      />
    </div>
  )
}

// 导出默认的响应式配置
export const defaultResponsiveLayout = {
  autosize: true,
  margin: { l: 40, r: 40, t: 50, b: 40 },
  // 移动设备适配
  'xaxis.title.standoff': 20,
  'yaxis.title.standoff': 20
}

// 移动设备检测hook
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  return isMobile
}