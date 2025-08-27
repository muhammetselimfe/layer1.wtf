import React from 'react'
import { useMemo } from 'react'
import { ChainBlockData } from '../types'
import { formatNumber, formatHash, formatTimestamp } from '../utils/formatters'
import { AnimatedCounter } from './AnimatedCounter'

interface ChainTableProps {
  chainData: ChainBlockData[]
  loading: boolean
  onRefresh: () => void
}

export const ChainTable = React.memo(function ChainTable({ chainData, loading, onRefresh }: ChainTableProps) {
  // Sort chains by block number (highest first)
  const sortedChainData = useMemo(() => {
    return [...chainData].sort((a, b) => {
      // First, separate chains with and without block data
      const aHasData = a.blockData && !a.loading && !a.error
      const bHasData = b.blockData && !b.loading && !b.error
      
      // Chains with data come first
      if (aHasData && !bHasData) return -1
      if (!aHasData && bHasData) return 1
      
      // If both have data, sort by block number (highest first)
      if (aHasData && bHasData) {
        const blockNumberA = parseInt(a.blockData!.number, 16)
        const blockNumberB = parseInt(b.blockData!.number, 16)
        return blockNumberB - blockNumberA
      }
      
      // If neither has data, sort by chain name alphabetically
      return a.chainName.localeCompare(b.chainName)
    })
  }, [chainData])

  // Find the chain with the highest utilization - also memoized
  const highestUtilizationIndex = useMemo(() => {
    let maxUtilization = -1
    let maxIndex = -1
    
    sortedChainData.forEach((chain, index) => {
      if (chain.blockData && !chain.loading && !chain.error) {
        const gasUsed = parseInt(chain.blockData.gasUsed, 16)
        const gasLimit = parseInt(chain.blockData.gasLimit, 16)
        const utilization = (gasUsed / gasLimit) * 100
        
        if (utilization > maxUtilization) {
          maxUtilization = utilization
          maxIndex = index
        }
      }
    })
    
    return maxIndex
  }, [sortedChainData])

  if (loading) {
    return (
      <div className="chain-table">
        <div className="table-header">
          <div className="header-cell">Network</div>
          <div className="header-cell sortable">Block ⇅</div>
          <div className="header-cell sortable">TPS ⇅</div>
          <div className="header-cell sortable">Gas Used ⇅</div>
          <div className="header-cell sortable">Gas Limit ⇅</div>
          <div className="header-cell sortable">Utilization ⇅</div>
          <div className="header-cell sortable">Size ⇅</div>
          <div className="header-cell sortable">Transactions ⇅</div>
        </div>
        <div className="loading-row">Loading chain data...</div>
      </div>
    )
  }

  if (chainData.length === 0) {
    return (
      <div className="chain-table">
        <div className="table-header">
          <div className="header-cell">Network</div>
          <div className="header-cell sortable">Block ⇅</div>
          <div className="header-cell sortable">TPS ⇅</div>
          <div className="header-cell sortable">Gas Used ⇅</div>
          <div className="header-cell sortable">Gas Limit ⇅</div>
          <div className="header-cell sortable">Utilization ⇅</div>
          <div className="header-cell sortable">Size ⇅</div>
          <div className="header-cell sortable">Transactions ⇅</div>
        </div>
        <div className="no-data">No data available</div>
      </div>
    )
  }

  return (
    <div className="chain-table">
      <div className="table-header">
        <div className="header-cell">Network</div>
        <div className="header-cell sortable">Block ⇅</div>
        <div className="header-cell sortable">TPS ⇅</div>
        <div className="header-cell sortable">Gas Used ⇅</div>
        <div className="header-cell sortable">Gas Limit ⇅</div>
        <div className="header-cell sortable">Utilization ⇅</div>
        <div className="header-cell sortable">Size ⇅</div>
        <div className="header-cell sortable">Transactions ⇅</div>
        <div className="header-cell">Last Updated</div>
      </div>
      
      {sortedChainData.map((chain, index) => {
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
              <div className="cell error-cell" colSpan={8}>
                Error: {chain.error}
              </div>
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
        const gasUsed = parseInt(chain.blockData.gasUsed, 16)
        const gasLimit = parseInt(chain.blockData.gasLimit, 16)
        const blockSize = parseInt(chain.blockData.size, 16)
        const utilization = (gasUsed / gasLimit) * 100
        const tps = chain.blockData.transactions.length / 2 // Assuming 2 second block time
        const timestamp = parseInt(chain.blockData.timestamp, 16)

        return (
          <div key={chain.blockchainId} className={`table-row ${index === highestUtilizationIndex ? 'highlighted' : ''}`}>
            <div className="cell network-cell">
              <span className="network-name">{chain.chainName}</span>
            </div>
            <div className="cell block-number">
              #<AnimatedCounter value={blockNumber} decimals={0} />
            </div>
            <div className="cell">
              <AnimatedCounter value={tps} decimals={1} />
            </div>
            <div className="cell">
              <AnimatedCounter value={gasUsed} decimals={0} />
            </div>
            <div className="cell">
              <AnimatedCounter value={gasLimit} decimals={0} />
            </div>
            <div className="cell">
              <AnimatedCounter value={utilization} decimals={1} suffix="%" />
            </div>
            <div className="cell">
              <AnimatedCounter value={blockSize} decimals={0} suffix=" B" />
            </div>
            <div className="cell">
              <AnimatedCounter value={chain.blockData.transactions.length} decimals={0} />
            </div>
            <div className="cell timestamp-cell">{formatTimestamp(timestamp)}</div>
          </div>
        )
      })}
    </div>
  )
}
    // First, separate chains with and without block data
    const aHasData = a.blockData && !a.loading && !a.error
    const bHasData = b.blockData && !b.loading && !b.error
    
    // Chains with data come first
    if (aHasData && !bHasData) return -1
    if (!aHasData && bHasData) return 1
    
    // If both have data, sort by block number (highest first)
    if (aHasData && bHasData) {
      const blockNumberA = parseInt(a.blockData!.number, 16)
      const blockNumberB = parseInt(b.blockData!.number, 16)
      return blockNumberB - blockNumberA
    }
    
    // If neither has data, sort by chain name alphabetically
    return a.chainName.localeCompare(b.chainName)
  })

  // Find the chain with the highest utilization
  const getHighestUtilizationIndex = () => {
    let maxUtilization = -1
    let maxIndex = -1
    
    sortedChainData.forEach((chain, index) => {
      if (chain.blockData && !chain.loading && !chain.error) {
        const gasUsed = parseInt(chain.blockData.gasUsed, 16)
        const gasLimit = parseInt(chain.blockData.gasLimit, 16)
        const utilization = (gasUsed / gasLimit) * 100
        
        if (utilization > maxUtilization) {
          maxUtilization = utilization
          maxIndex = index
        }
      }
    })
    
    return maxIndex
  }

  const highestUtilizationIndex = getHighestUtilizationIndex()

  if (loading) {
    return (
      <div className="chain-table">
        <div className="table-header">
          <div className="header-cell">Network</div>
          <div className="header-cell sortable">Block ⇅</div>
          <div className="header-cell sortable">TPS ⇅</div>
          <div className="header-cell sortable">Gas Used ⇅</div>
          <div className="header-cell sortable">Gas Limit ⇅</div>
          <div className="header-cell sortable">Utilization ⇅</div>
          <div className="header-cell sortable">Size ⇅</div>
          <div className="header-cell sortable">Transactions ⇅</div>
        </div>
        <div className="loading-row">Loading chain data...</div>
      </div>
    )
  }

  if (chainData.length === 0) {
    return (
      <div className="chain-table">
        <div className="table-header">
          <div className="header-cell">Network</div>
          <div className="header-cell sortable">Block ⇅</div>
          <div className="header-cell sortable">TPS ⇅</div>
          <div className="header-cell sortable">Gas Used ⇅</div>
          <div className="header-cell sortable">Gas Limit ⇅</div>
          <div className="header-cell sortable">Utilization ⇅</div>
          <div className="header-cell sortable">Size ⇅</div>
          <div className="header-cell sortable">Transactions ⇅</div>
        </div>
        <div className="no-data">No data available</div>
      </div>
    )
  }

  return (
    <div className="chain-table">
      <div className="table-header">
        <div className="header-cell">Network</div>
        <div className="header-cell sortable">Block ⇅</div>
        <div className="header-cell sortable">TPS ⇅</div>
        <div className="header-cell sortable">Gas Used ⇅</div>
        <div className="header-cell sortable">Gas Limit ⇅</div>
        <div className="header-cell sortable">Utilization ⇅</div>
        <div className="header-cell sortable">Size ⇅</div>
        <div className="header-cell sortable">Transactions ⇅</div>
        <div className="header-cell">Last Updated</div>
      </div>
      
      {sortedChainData.map((chain, index) => {
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
              <div className="cell error-cell" colSpan={8}>
                Error: {chain.error}
              </div>
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
        const gasUsed = parseInt(chain.blockData.gasUsed, 16)
        const gasLimit = parseInt(chain.blockData.gasLimit, 16)
        const blockSize = parseInt(chain.blockData.size, 16)
        const utilization = (gasUsed / gasLimit) * 100
        const tps = chain.blockData.transactions.length / 2 // Assuming 2 second block time
        const timestamp = parseInt(chain.blockData.timestamp, 16)

        return (
          <div key={chain.blockchainId} className={`table-row ${index === highestUtilizationIndex ? 'highlighted' : ''}`}>
            <div className="cell network-cell">
              <span className="network-name">{chain.chainName}</span>
            </div>
            <div className="cell block-number">
              #<AnimatedCounter value={blockNumber} decimals={0} />
            </div>
            <div className="cell">
              <AnimatedCounter value={tps} decimals={1} />
            </div>
            <div className="cell">
              <AnimatedCounter value={gasUsed} decimals={0} />
            </div>
            <div className="cell">
              <AnimatedCounter value={gasLimit} decimals={0} />
            </div>
            <div className="cell">
              <AnimatedCounter value={utilization} decimals={1} suffix="%" />
            </div>
            <div className="cell">
              <AnimatedCounter value={blockSize} decimals={0} suffix=" B" />
            </div>
            <div className="cell">
              <AnimatedCounter value={chain.blockData.transactions.length} decimals={0} />
            </div>
            <div className="cell timestamp-cell">{formatTimestamp(timestamp)}</div>
          </div>
        )
      })}
    </div>
  )
}