import type { PaginatedArrayResponse, ApiResponse } from './common'

// Guest endpoints types
export interface GuestJob {
  public_id: string
  title: string
  description: string
  address: string
  postal_code: string
  latitude: string
  longitude: string
  estimated_budget: number
  status: string
  status_at: string
  created_at: string
  updated_at: string
  category: {
    public_id: string
    name: string
  } | null
  city: {
    public_id: string
    name: string
  } | null
  hourly_rate_min?: number
  hourly_rate_max?: number
  homeowner?: {
    public_id: string
    display_name: string
    avatar_url: string | null
  } | null
  distance_km: number | null
  images?: Array<{
    public_id: string
    image: string
  }>
  tasks?: Array<{
    public_id: string
    title: string
    description: string
    status: string
  }>
}

export interface GuestHandyman {
  public_id: string
  display_name: string
  avatar_url: string | null
  rating: number
  total_reviews: number
  bio: string | null
  distance_km: number | null
  hourly_rate?: number | null
  categories: Array<{
    public_id: string
    name: string
  }>
}

// Re-export common types for convenience
export type { PaginatedArrayResponse, ApiResponse }
