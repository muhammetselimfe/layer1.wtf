import React from 'react'
import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { ChainBlockData } from './types'
import { getActiveChains } from './data/chains'

function App() {
  const [chainData, setChainData] = useState<ChainBlockData[]>([])
  const [loading, setLoading] = useState(true)
  const [allDataFetched, setAllDataFetched] = useState(false)

  const fetchChainData = async (rpcUrl: string, chainName: string, evmChainId: string) => {
    try {
      // First try the proxy route to avoid CORS issues
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
        // If proxy fails with 500 and chain config not found, try direct RPC
        if (response.status === 500) {
          try {
            const errorText = await response.text()
            if (errorText.includes('Chain config not found')) {
              console.log(`Proxy API doesn't support chain ${chainName} (${evmChainId}), trying direct RPC...`)
              return await fetchChainDataDirect(rpcUrl, chainName, evmChainId)
            }
          } catch (textError) {
            console.warn(`Could not read error response for ${chainName}:`, textError)
          }
        }
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

  const fetchChainDataDirect = async (rpcUrl: string, chainName: string, evmChainId: string) => {
    try {
      console.log(`Attempting direct RPC call for ${chainName} to ${rpcUrl}`)
      
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(rpcUrl, {
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
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch data for chain ${chainName} via direct RPC`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(`RPC Error for ${chainName}: ${data.error.message || 'Unknown RPC error'}`)
      }
      
      console.log(`Successfully fetched data for ${chainName} via direct RPC`)
      return data.result
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.error(`Timeout fetching data for chain ${chainName} via direct RPC`)
        throw new Error(`Timeout: Failed to fetch data for chain ${chainName} via direct RPC`)
      }
      console.error(`Error fetching data for chain ${chainName} via direct RPC:`, err)
      throw err
    }
  }

  const fetchAllChainData = async () => {
    const activeChains = getActiveChains()
    
    // Initialize chain data with loading state
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

    // Now fetch data for each chain
    const chainResults: ChainBlockData[] = [...initialChainData]

    // Create a temporary array to collect all results
    const tempChainData = [...chainData]

    // Fetch data for each chain
    const promises = activeChains.filter(chain => chain.evmChainId && chain.rpcUrl).map(async (chain, index) => {
      try {
        const blockData = await fetchChainData(chain.rpcUrl!, chain.chainName, chain.evmChainId!)
        // Update the temporary array
        const chainIndex = tempChainData.findIndex(item => item.blockchainId === chain.evmChainId)
        if (chainIndex !== -1) {
          tempChainData[chainIndex] = {
            ...tempChainData[chainIndex],
            blockData,
            loading: false,
            error: null,
            lastUpdated: Date.now()
          }
        }
      } catch (err) {
        // Update the temporary array with error
        const chainIndex = tempChainData.findIndex(item => item.blockchainId === chain.evmChainId)
        if (chainIndex !== -1) {
          tempChainData[chainIndex] = {
            ...tempChainData[chainIndex],
            loading: false,
            error: err instanceof Error ? err.message : `Unknown error for ${chain.chainName}`,
            lastUpdated: Date.now()
          }
        }
      }
    })

    // Wait for all promises to complete
    await Promise.allSettled(promises)

    // Now sort the complete data by block number (highest to lowest)
    const sortedChainData = tempChainData.sort((a, b) => {
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
      
      // For chains without data, sort alphabetically
      return a.chainName.localeCompare(b.chainName)
    })

    // Update state with sorted data
    setChainData(sortedChainData)
    setAllDataFetched(true)
  }

  // Separate function for subsequent updates that maintains order
  const updateChainData = async () => {
    if (!allDataFetched) return
    
    const activeChains = getActiveChains()
    const tempChainData = [...chainData]

    const promises = activeChains.filter(chain => chain.evmChainId && chain.rpcUrl).map(async (chain, index) => {
      try {
        const blockData = await fetchChainData(chain.rpcUrl!, chain.chainName, chain.evmChainId!)
        
        // Find and update the corresponding chain
        const chainIndex = tempChainData.findIndex(item => item.blockchainId === chain.evmChainId)
        if (chainIndex !== -1) {
          tempChainData[chainIndex] = {
            ...tempChainData[chainIndex],
            blockData,
            loading: false,
            error: null,
            lastUpdated: Date.now()
          }
        }
      } catch (err) {
        // Find and update the corresponding chain with error
        const chainIndex = tempChainData.findIndex(item => item.blockchainId === chain.evmChainId)
        if (chainIndex !== -1) {
          tempChainData[chainIndex] = {
            ...tempChainData[chainIndex],
            loading: false,
            error: err instanceof Error ? err.message : `Unknown error for ${chain.chainName}`,
            lastUpdated: Date.now()
          }
        }
      }
    })

    await Promise.allSettled(promises)
    
    // Re-sort after updates to maintain proper order
    const sortedChainData = tempChainData.sort((a, b) => {
      const aHasData = a.blockData && !a.loading && !a.error
      const bHasData = b.blockData && !b.loading && !b.error
      
      if (aHasData && !bHasData) return -1
      if (!aHasData && bHasData) return 1
      
      if (aHasData && bHasData) {
        const blockNumberA = parseInt(a.blockData!.number, 16)
        const blockNumberB = parseInt(b.blockData!.number, 16)
        return blockNumberB - blockNumberA
      }
      
      return a.chainName.localeCompare(b.chainName)
    })

    setChainData(sortedChainData)
  }

  useEffect(() => {
    fetchAllChainData()
    
    // After initial fetch, use update function for subsequent calls
    const interval = setInterval(() => {
      if (allDataFetched) {
        updateChainData()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [allDataFetched])

  return (
    <div className="app">
      <Dashboard 
        chainData={chainData}
        loading={loading} 
        onRefresh={() => {
          if (allDataFetched) {
            updateChainData()
          } else {
            fetchAllChainData()
          }
        }}
      />
    </div>
  )
}

export default App