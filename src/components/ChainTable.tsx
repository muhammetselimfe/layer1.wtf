import React from 'react'
import { useMemo, useEffect, useState } from 'react'
import { ChainBlockData } from '../types'
import { formatTimestamp } from '../utils/formatters'
import { AnimatedCounter } from './AnimatedCounter'

interface ChainTableProps {
  chainData: ChainBlockData[]
  loading: boolean
  onRefresh: () => void
}

interface StaticChainRow {
  chainName: string
  blockchainId: string
  initialBlockNumber: number
}

export const ChainTable = React.memo(function ChainTable({ chainData, loading, onRefresh }: ChainTableProps) {

  // Find the chain with the highest utilization
  const highestUtilizationId = useMemo(() => {
    let maxUtilization = -1
    let maxId = ''
    
    chainData.forEach((chain) => {
      if (chain.blockData && !chain.loading && !chain.error) {
        const gasUsed = parseInt(chain.blockData.gasUsed, 16)
        const gasLimit = parseInt(chain.blockData.gasLimit, 16)
        const utilization = (gasUsed / gasLimit) * 100
        
        if (utilization > maxUtilization) {
          maxUtilization = utilization
          maxId = chain.blockchainId
        }
      }
    })
    
    return maxId
  }, [chainData])

  if (loading && chainData.length === 0) {
    return (
      <div className="chain-table">
        <div className="table-header">
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Network
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Block
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> TPS
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Mgas/s
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> KB/s
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Stack
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Gas Limit
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Utilization
          </div>
          <div className="header-cell">Last Updated</div>
        </div>
        <div className="loading-row">Loading chain data...</div>
      </div>
    )
  }

  if (chainData.length === 0) {
    return (
      <div className="chain-table">
        <div className="table-header">
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Network
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Block
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> TPS
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Mgas/s
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> KB/s
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Stack
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Gas Limit
          </div>
          <div className="header-cell">
            <span className="sort-icon">⌄</span> Utilization
          </div>
          <div className="header-cell">Last Updated</div>
        </div>
        <div className="no-data">No data available</div>
      </div>
    )
  }

  return (
    <div className="chain-table">
      <div className="table-header">
        <div className="header-cell">
          <span className="sort-icon">⌄</span> Network
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> Block
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> TPS
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> Mgas/s
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> KB/s
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> Stack
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> Gas Limit
        </div>
        <div className="header-cell">
          <span className="sort-icon">⌄</span> Utilization
        </div>
        <div className="header-cell">Last Updated</div>
      </div>
      
      {chainData.map((chain) => {
        if (chain.loading) {
          return (
            <div key={chain.blockchainId} className="table-row">
              <div className="cell network-cell">
                <span className="network-name">{chain.chainName}</span>
              </div>
              <div className="cell">Loading...</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
            </div>
          )
        }

        if (chain.error) {
          return (
            <div key={chain.blockchainId} className="table-row error-row">
              <div className="cell network-cell">
                <span className="network-name">{chain.chainName}</span>
              </div>
              <div className="cell error-cell">
                Error: {chain.error}
              </div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
            </div>
          )
        }

        if (!chain.blockData) {
          return (
            <div key={chain.blockchainId} className="table-row">
              <div className="cell network-cell">
                <span className="network-name">{chain.chainName}</span>
              </div>
              <div className="cell">No data</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
              <div className="cell">--</div>
            </div>
          )
        }

        const blockNumber = parseInt(chain.blockData.number, 16)
        const gasUsed = parseInt(chain.blockData.gasUsed, 16) / 1000000 // Convert to Mgas
        const tps = chain.blockData.transactions.length / 2 // Assuming 2 second block time
        const kbPerSecond = gasUsed * 0.021 // Rough approximation
        const timestamp = parseInt(chain.blockData.timestamp, 16)
        const gasLimit = parseInt(chain.blockData.gasLimit, 16) / 1000000 // Convert to Mgas
        
        // Calculate block utilization percentage
        const gasUsedRaw = parseInt(chain.blockData.gasUsed, 16)
        const gasLimitRaw = parseInt(chain.blockData.gasLimit, 16)
        const utilization = (gasUsedRaw / gasLimitRaw) * 100

        return (
          <div key={chain.blockchainId} className={`table-row ${chain.blockchainId === highestUtilizationId ? 'highlighted' : ''}`}>
            <div className="cell network-cell">
              <span className="network-name">{chain.chainName}</span>
            </div>
            <div className="cell numeric-cell">
              #<AnimatedCounter value={blockNumber} decimals={0} />
            </div>
            <div className="cell numeric-cell">
              <AnimatedCounter value={tps} decimals={1} />
            </div>
            <div className="cell numeric-cell">
              <AnimatedCounter value={gasUsed} decimals={2} />
            </div>
            <div className="cell numeric-cell">
              <AnimatedCounter value={kbPerSecond} decimals={2} />
            </div>
            <div className="cell">
              Avalanche L1
            </div>
            <div className="cell numeric-cell">
              <AnimatedCounter value={gasLimit} decimals={1} />M
            </div>
            <div className="cell numeric-cell">
              <AnimatedCounter value={utilization} decimals={1} />%
            </div>
            <div className="cell timestamp-cell">{formatTimestamp(timestamp)}</div>
          </div>
        )
      })}
    </div>
  )
})