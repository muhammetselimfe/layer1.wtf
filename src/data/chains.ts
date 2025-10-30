export interface Chain {
  chainName: string
  blockchainId: string
  subnetId: string
  rpcUrl: string | null
  evmChainId: string | null
  blocksCount: string | null
  estimatedTxCount: string | null
  glacierChainId?: string
  comment: string | null
  debugEnabled: boolean
}

import chainsData from './chains.json'

export const chains: Chain[] = chainsData

// Get chains that have debug enabled and have an EVM chain ID (can use the new RPC API)
export const getActiveChains = () => chains.filter(chain => 
  chain.evmChainId && chain.rpcUrl && (
    chain.debugEnabled || 
    chain.chainName === 'C-Chain' ||
    chain.chainName === 'DFK Chain' ||
    chain.chainName === 'dexalotevm' ||
    chain.chainName === 'shrapnelnetwork' ||
    chain.chainName === 'beam' ||
    chain.chainName === 'PLAYA3ULL' ||
    chain.chainName === 'Pulsar' ||
    chain.chainName === 'Lamina1'
  )
)