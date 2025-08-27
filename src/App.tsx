import React from 'react'
import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { ChainBlockData } from './types'
import { getActiveChains } from './data/chains'

function App() {
  const [chainData, setChainData] = useState<ChainBlockData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChainData = async (rpcUrl: string, chainName: string, evmChainId: string) => {
    try {
      // Use the proxy route to avoid CORS issues
      const apiUrl = `/api/rpc/${evmChainId}/rpc`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_getBlockByNumber',
          params: ['latest', true],
          id: 1,
          jsonrpc: '2.0'
        })
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch data for chain ${chainName}`)
      }
      const data = await response.json()
      
      if (data.error) {
        throw new Error(`RPC Error for ${chainName}: ${data.error.message || 'Unknown RPC error'}`)
      }
      
      return data.result
    } catch (err) {
      console.error(`Error fetching data for chain ${chainName}:`, err)
      throw err
    }
  }

  const fetchAllChainData = async () => {
    const activeChains = getActiveChains()
    
    // Only initialize if we don't have data yet
    if (chainData.length === 0) {
      const initialChainData: ChainBlockData[] = activeChains.map(chain => ({
        chainName: chain.chainName,
        blockchainId: chain.evmChainId || chain.blockchainId,
        blockData: null,
        loading: true,
        error: null,
        lastUpdated: Date.now()
      }))
      
      setChainData(initialChainData)
      setLoading(false)
    }

    // Fetch data for each chain
    const promises = activeChains.filter(chain => chain.evmChainId && chain.rpcUrl).map(async (chain, index) => {
      try {
        const blockData = await fetchChainData(chain.rpcUrl!, chain.chainName, chain.evmChainId!)
        setChainData(prev => prev.map((item, i) => 
          item.blockchainId === chain.evmChainId
            ? { ...item, blockData, loading: false, error: null, lastUpdated: Date.now() }
            : item
        ))
      } catch (err) {
        setChainData(prev => prev.map((item, i) => 
          item.blockchainId === chain.evmChainId
            ? { ...item, loading: false, error: err instanceof Error ? err.message : `Unknown error for ${chain.chainName}`, lastUpdated: Date.now() }
            : item
        ))
      }
    })

    await Promise.allSettled(promises)
  }

  useEffect(() => {
    fetchAllChainData()
    const interval = setInterval(fetchAllChainData, 5000) // Update every 5 seconds for faster updates
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <Dashboard 
        chainData={chainData}
        loading={loading} 
        onRefresh={fetchAllChainData}
      />
    </div>
  )
}

export default App