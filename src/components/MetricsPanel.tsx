import React from 'react'
import { Tooltip } from './Tooltip'
import { AnimatedCounter } from './AnimatedCounter'
import { ChainBlockData } from '../types'

interface MetricsPanelProps {
  metrics: {
    totalTps: number
    totalGasPerSecond: number
    averageUtilization: number
  } | null
  loading: boolean
  chainData: ChainBlockData[]
}

export function MetricsPanel({ metrics, loading, chainData }: MetricsPanelProps) {
  // Find C-Chain data for comparison
  const cChainData = chainData.find(chain => chain.chainName === 'C-Chain')
  
  // Calculate multipliers compared to C-Chain
  const calculateMultiplier = (totalValue: number, cChainValue: number) => {
    if (!cChainValue || cChainValue === 0) return 0
    return totalValue / cChainValue
  }
  
  let tpsMultiplier = 0
  let gasMultiplier = 0
  let utilizationMultiplier = 0
  
  if (metrics && cChainData?.blockData && !cChainData.loading && !cChainData.error) {
    const cChainTps = cChainData.blockData.transactions.length / 2 // Assuming 2 second block time
    const cChainGasUsed = parseInt(cChainData.blockData.gasUsed, 16)
    const cChainGasLimit = parseInt(cChainData.blockData.gasLimit, 16)
    const cChainUtilization = (cChainGasUsed / cChainGasLimit)
    const cChainGasPerSecond = cChainGasUsed / 2 / 1000000 // Convert to Mgas/s
    
    tpsMultiplier = calculateMultiplier(metrics.totalTps, cChainTps)
    gasMultiplier = calculateMultiplier(metrics.totalGasPerSecond / 1000000, cChainGasPerSecond)
    utilizationMultiplier = calculateMultiplier(metrics.averageUtilization, cChainUtilization * 100)
  }

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
            <Tooltip content="The average network utilization percentage across all chains">
              Avg Util ⓘ
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
            <Tooltip content="The average network utilization percentage across all chains">
              Avg Util ⓘ
            </Tooltip>
          </div>
          <div className="metric-value">0.00</div>
          <div className="metric-change">(0.00%)</div>
        </div>
      </div>
    )
  }

  // Convert gas/s to Mgas/s
  const mgasPerSecond = metrics.totalGasPerSecond / 1000000

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
        <div className="metric-change positive">
          {tpsMultiplier > 0 ? `(${tpsMultiplier.toFixed(1)}x)` : '(--x)'}
        </div>
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
        <div className="metric-change positive">
          {gasMultiplier > 0 ? `(${gasMultiplier.toFixed(1)}x)` : '(--x)'}
        </div>
      </div>
      <div className="total-metric">
        <div className="metric-label">
          <Tooltip content="The average network utilization percentage across all chains">
            Avg Util ⓘ
          </Tooltip>
        </div>
        <div className="metric-value">
          <AnimatedCounter value={metrics.averageUtilization} decimals={2} />
        </div>
        <div className="metric-change positive">
          {utilizationMultiplier > 0 ? `(${utilizationMultiplier.toFixed(1)}x)` : '(--x)'}
        </div>
      </div>
    </div>
  )
}