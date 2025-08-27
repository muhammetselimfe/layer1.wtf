import React from 'react'
import { ChainBlockData } from '../types'
import { Header } from './Header'
import { MetricsPanel } from './MetricsPanel'
import { ChainTable } from './ChainTable'
import { ErrorDialog } from './ErrorDialog'
import { useState } from 'react'

interface DashboardProps {
  chainData: ChainBlockData[]
  loading: boolean
  onRefresh: () => void
}

export function Dashboard({ chainData, loading, onRefresh }: DashboardProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const handleIcmClick = () => {
    setShowErrorDialog(true)
  }

  // Sort chains by block number for metrics calculation
  const sortedChainData = [...chainData].sort((a, b) => {
    // Prioritize chains with successful block data
    if (a.blockData && !b.blockData) return -1
    if (!a.blockData && b.blockData) return 1
    
    // If both have block data, sort by block number (highest first)
    if (a.blockData && b.blockData) {
      const blockNumberA = parseInt(a.blockData.number, 16)
      const blockNumberB = parseInt(b.blockData.number, 16)
      return blockNumberB - blockNumberA
    }
    
    // For chains without block data, sort by last updated time
    return b.lastUpdated - a.lastUpdated
  })

  // Calculate aggregate metrics from all chains
  const metrics = sortedChainData.length > 0 ? {
    totalTps: sortedChainData.reduce((sum, chain) => {
      // Only include data from chains with recent blocks (within last hour)
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600 // Convert to seconds
      if (chain.blockData && !chain.loading && !chain.error) {
        const blockTimestamp = parseInt(chain.blockData.timestamp, 16)
        if (blockTimestamp > oneHourAgo) {
          const tps = chain.blockData.transactions.length / 2 // Assuming 2 second block time
          return sum + tps
        }
      }
      return sum
    }, 0),
    totalGasPerSecond: sortedChainData.reduce((sum, chain) => {
      // Only include data from chains with recent blocks (within last hour)
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600 // Convert to seconds
      if (chain.blockData && !chain.loading && !chain.error) {
        const blockTimestamp = parseInt(chain.blockData.timestamp, 16)
        if (blockTimestamp > oneHourAgo) {
          const gasUsed = parseInt(chain.blockData.gasUsed, 16)
          return sum + (gasUsed / 2) // Assuming 2 second block time
        }
      }
      return sum
    }, 0),
    averageUtilization: (() => {
      // Only include data from chains with recent blocks (within last hour)
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600 // Convert to seconds
      const recentChains = sortedChainData.filter(chain => 
        chain.blockData && !chain.loading && !chain.error &&
        parseInt(chain.blockData.timestamp, 16) > oneHourAgo
      )
      
      if (recentChains.length === 0) return 0
      
      return recentChains.reduce((sum, chain) => {
        const gasUsed = parseInt(chain.blockData!.gasUsed, 16)
        const gasLimit = parseInt(chain.blockData!.gasLimit, 16)
        return sum + (gasUsed / gasLimit)
      }, 0) / recentChains.length
    })()
  } : null

  // Debug: Log which chains are being included in metrics
  if (metrics) {
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600
    const recentChains = sortedChainData.filter(chain => 
      chain.blockData && !chain.loading && !chain.error &&
      parseInt(chain.blockData.timestamp, 16) > oneHourAgo
    )
    console.log('Chains included in metrics:', recentChains.map(chain => ({
      name: chain.chainName,
      blockTimestamp: parseInt(chain.blockData!.timestamp, 16),
      tps: chain.blockData!.transactions.length / 2,
      age: Math.floor(Date.now() / 1000) - parseInt(chain.blockData!.timestamp, 16)
    })))
  }

  return (
    <div className="dashboard">
      <Header />
      
      <div className="main-content">
        <div className="tabs">
          <div className="tab active">L1s</div>
          <div className="tab inactive" onClick={handleIcmClick}>
            ICM
          </div>
        </div>

        <MetricsPanel metrics={metrics} loading={loading} />

        <div className="filters-section">
          <div className="filters-header">Filters</div>
          <div className="expand-button">Expand</div>
        </div>

        <ChainTable 
          chainData={sortedChainData}
          loading={loading} 
          onRefresh={onRefresh}
        />

        <ErrorDialog
          isVisible={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          title="Layer1.wtf"
          message="ICM metrics are coming soon. Meanwhile be part of the adoption at"
          linkUrl="https://l1beat.io"
          linkText="l1beat.io"
        />
      </div>
    </div>
  )
}