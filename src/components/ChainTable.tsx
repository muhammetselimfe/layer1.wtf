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
  const [staticRows, setStaticRows] = useState<StaticChainRow[]>([])
  const [chainDataMap, setChainDataMap] = useState<Map<string, ChainBlockData>>(new Map())

  // Initialize static rows once when we first get data
  useEffect(() => {
    if (staticRows.length === 0 && chainData.length > 0) {
      // Create initial static rows sorted by block number (highest first)
      const initialRows = chainData
        .filter(chain => chain.blockData && !chain.loading && !chain.error)
        .map(chain => ({
          chainName: chain.chainName,
          blockchainId: chain.blockchainId,
          initialBlockNumber: parseInt(chain.blockData!.number, 16)
        }))
        .sort((a, b) => b.initialBlockNumber - a.initialBlockNumber)

      // Add chains without data at the end, sorted alphabetically
      const chainsWithoutData = chainData
        .filter(chain => !chain.blockData || chain.loading || chain.error)
        .map(chain => ({
          chainName: chain.chainName,
          blockchainId: chain.blockchainId,
          initialBlockNumber: 0
        }))
        .sort((a, b) => a.chainName.localeCompare(b.chainName))

      setStaticRows([...initialRows, ...chainsWithoutData])
    }
  }, [chainData, staticRows.length])

  // Update the data map whenever chainData changes
  useEffect(() => {
    const newMap = new Map<string, ChainBlockData>()
    chainData.forEach(chain => {
      newMap.set(chain.blockchainId, chain)
    })
    setChainDataMap(newMap)
  }, [chainData])

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

  if (loading && staticRows.length === 0) {
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
        <div className="loading-row">Loading chain data...</div>
      </div>
    )
  }

  if (staticRows.length === 0) {
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
      
      {staticRows.map((row) => {
        const chain = chainDataMap.get(row.blockchainId)
        
        if (!chain) {
          return (
            <div key={row.blockchainId} className="table-row">
              <div className="cell network-cell">
                <span className="network-name">{row.chainName}</span>
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

        if (chain.loading) {
          return (
            <div key={row.blockchainId} className="table-row">
              <div className="cell network-cell">
                <span className="network-name">{row.chainName}</span>
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
            <div key={row.blockchainId} className="table-row error-row">
              <div className="cell network-cell">
                <span className="network-name">{row.chainName}</span>
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
            <div key={row.blockchainId} className="table-row">
              <div className="cell network-cell">
                <span className="network-name">{row.chainName}</span>
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
          <div key={row.blockchainId} className={`table-row ${row.blockchainId === highestUtilizationId ? 'highlighted' : ''}`}>
            <div className="cell network-cell">
              <span className="network-name">{row.chainName}</span>
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
})