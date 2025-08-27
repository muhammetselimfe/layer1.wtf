import React from 'react'
import { Tooltip } from './Tooltip'
import { AnimatedCounter } from './AnimatedCounter'

interface MetricsPanelProps {
  metrics: {
    totalTps: number
    totalGasPerSecond: number
    averageUtilization: number
  } | null
  loading: boolean
}

export function MetricsPanel({ metrics, loading }: MetricsPanelProps) {
  if (loading) {
    return (
      <div className="metrics-panel">
        <div className="metrics-header">Totals</div>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">
              <Tooltip content="The total transactions per second across all chains">
                TPS ⓘ
              </Tooltip>
            </div>
            <div className="metric-value">Loading...</div>
            <div className="metric-change">--</div>
          </div>
          <div className="metric">
            <div className="metric-label">
              <Tooltip content="The total gas consumed per second across all chains">
                Gas/s ⓘ
              </Tooltip>
            </div>
            <div className="metric-value">Loading...</div>
            <div className="metric-change">--</div>
          </div>
          <div className="metric">
            <div className="metric-label">
              <Tooltip content="The average percentage of gas limit used across all chains">
                Utilization ⓘ
              </Tooltip>
            </div>
            <div className="metric-value">Loading...</div>
            <div className="metric-change">--</div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="metrics-panel">
        <div className="metrics-header">Totals</div>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">
              <Tooltip content="The total transactions per second across all chains">
                TPS ⓘ
              </Tooltip>
            </div>
            <div className="metric-value">0.00</div>
            <div className="metric-change">(0.00%)</div>
          </div>
          <div className="metric">
            <div className="metric-label">
              <Tooltip content="The total gas consumed per second across all chains">
                Gas/s ⓘ
              </Tooltip>
            </div>
            <div className="metric-value">0.00</div>
            <div className="metric-change">(0.00%)</div>
          </div>
          <div className="metric">
            <div className="metric-label">
              <Tooltip content="The average percentage of gas limit used across all chains">
                Utilization ⓘ
              </Tooltip>
            </div>
            <div className="metric-value">0.00%</div>
            <div className="metric-change">(0.00%)</div>
          </div>
        </div>
      </div>
    )
  }

  const utilizationPercent = (metrics.averageUtilization * 100).toFixed(1)

  return (
    <div className="metrics-panel">
      <div className="metrics-header">Totals</div>
      <div className="metrics-grid">
        <div className="metric">
          <div className="metric-label">
            <Tooltip content="The total transactions per second across all chains">
              TPS ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">
            <AnimatedCounter value={metrics.totalTps} decimals={2} />
          </div>
          <div className="metric-change positive">(+12.5%)</div>
        </div>
        <div className="metric">
          <div className="metric-label">
            <Tooltip content="The total gas consumed per second across all chains">
              Gas/s ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">
            <AnimatedCounter value={metrics.totalGasPerSecond} decimals={2} />
          </div>
          <div className="metric-change positive">(+8.3%)</div>
        </div>
        <div className="metric">
          <div className="metric-label">
            <Tooltip content="The average percentage of gas limit used across all chains">
              Utilization ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">
            <AnimatedCounter 
              value={metrics.averageUtilization * 100} 
              decimals={1} 
              suffix="%" 
            />
          </div>
          <div className="metric-change positive">(+15.2%)</div>
        </div>
      </div>
    </div>
  )
}