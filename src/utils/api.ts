export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
} 