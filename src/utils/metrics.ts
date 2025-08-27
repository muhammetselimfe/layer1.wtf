import { BlockData, ChainMetrics } from '../types'

export function calculateMetrics(blockData: BlockData): ChainMetrics {
  const blockNumber = parseInt(blockData.number, 16)
  const gasUsed = parseInt(blockData.gasUsed, 16)
  const gasLimit = parseInt(blockData.gasLimit, 16)
  const blockSize = parseInt(blockData.size, 16)
  const timestamp = parseInt(blockData.timestamp, 16)
  const transactionCount = blockData.transactions.length
  
  // Assuming 2 second block time for Avalanche
  const blockTime = 2
  const tps = transactionCount / blockTime
  const gasUtilization = gasUsed / gasLimit

  return {
    blockNumber,
    tps,
    gasUsed,
    gasLimit,
    gasUtilization,
    blockSize,
    transactionCount,
    timestamp
  }
}