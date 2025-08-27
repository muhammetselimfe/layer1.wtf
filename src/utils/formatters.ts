export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

export function formatHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export function formatTimestamp(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  
  if (diff < 60) {
    return `${diff}s ago`
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`
  } else {
    return `${Math.floor(diff / 86400)}d ago`
  }
}