export interface Transaction {
  blockHash: string
  blockNumber: string
  from: string
  gas: string
  gasPrice: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  hash: string
  input: string
  nonce: string
  to: string
  transactionIndex: string
  value: string
  type: string
  chainId?: string
  v: string
  r: string
  s: string
  yParity?: string
}

export interface BlockData {
  baseFeePerGas: string
  blobGasUsed: string
  blockGasCost: string
  difficulty: string
  excessBlobGas: string
  extraData: string
  gasLimit: string
  gasUsed: string
  hash: string
  logsBloom: string
  miner: string
  mixHash: string
  nonce: string
  number: string
  parentBeaconBlockRoot: string
  parentHash: string
  receiptsRoot: string
  sha3Uncles: string
  size: string
  stateRoot: string
  timestamp: string
  totalDifficulty: string
  transactions: Transaction[]
  transactionsRoot: string
  uncles: any[]
}

export interface ChainMetrics {
  blockNumber: number
  tps: number
  gasUsed: number
  gasLimit: number
  gasUtilization: number
  blockSize: number
  transactionCount: number
  timestamp: number
}

export interface ChainBlockData {
  chainName: string
  blockchainId: string
  blockData: BlockData | null
  loading: boolean
  error: string | null
  lastUpdated: number
}