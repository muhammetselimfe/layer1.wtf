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
export const getActiveChains = () => chains.filter(chain => chain.debugEnabled && chain.evmChainId)