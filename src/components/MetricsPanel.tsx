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
      <div className="totals-grid">
        <div className="total-metric">
          <div className="metric-label">
            <Tooltip content="The total transactions per second across all chains">
              TPS ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">Loading...</div>
          <div className="metric-change">--</div>
        </div>
        <div className="total-metric">
          <div className="metric-label">
            <Tooltip content="The total gas consumed per second across all chains">
              Mgas/s ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">Loading...</div>
          <div className="metric-change">--</div>
        </div>
        <div className="total-metric">
          <div className="metric-label">
            <Tooltip content="The average percentage of gas limit used across all chains">
              KB/s ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">Loading...</div>
          <div className="metric-change">--</div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="totals-grid">
        <div className="total-metric">
          <div className="metric-label">
            <Tooltip content="The total transactions per second across all chains">
              TPS ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">0.00</div>
          <div className="metric-change">(0.00%)</div>
        </div>
        <div className="total-metric">
          <div className="metric-label">
            <Tooltip content="The total gas consumed per second across all chains">
              Mgas/s ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">0.00</div>
          <div className="metric-change">(0.00%)</div>
        </div>
        <div className="total-metric">
          <div className="metric-label">
            <Tooltip content="The average percentage of gas limit used across all chains">
              KB/s ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">0.00</div>
          <div className="metric-change">(0.00%)</div>
        </div>
      </div>
    )
  }

  // Convert gas/s to Mgas/s and calculate KB/s (approximate)
  const mgasPerSecond = metrics.totalGasPerSecond / 1000000
  const kbPerSecond = mgasPerSecond * 0.021 // Rough approximation

  return (
    <div className="totals-grid">
      <div className="total-metric">
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
      <div className="total-metric">
        <div className="metric-label">
          <Tooltip content="The total gas consumed per second across all chains">
            Mgas/s ⓘ
          </Tooltip>
        </div>
        <div className="metric-value">
          <AnimatedCounter value={mgasPerSecond} decimals={2} />
        </div>
        <div className="metric-change positive">(+8.3%)</div>
      </div>
      <div className="total-metric">
        <div className="metric-label">
          <Tooltip content="Approximate data throughput in kilobytes per second">
            KB/s ⓘ
          </Tooltip>
        </div>
        <div className="metric-value">
          <AnimatedCounter value={kbPerSecond} decimals={2} />
        </div>
        <div className="metric-change positive">(+15.2%)</div>
      </div>
    </div>
  )
}