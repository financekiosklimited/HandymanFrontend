import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Platform } from 'react-native'
import { queryClient } from 'app/provider'
import type { Role, NextAction } from '../types/auth'

// Cross-platform storage adapter
const createStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (name: string): Promise<string | null> => {
        try {
          return localStorage.getItem(name)
        } catch {
          return null
        }
      },
      setItem: async (name: string, value: string): Promise<void> => {
        localStorage.setItem(name, value)
      },
      removeItem: async (name: string): Promise<void> => {
        localStorage.removeItem(name)
      },
    }
  } else {
    // For React Native, we'll use a simple in-memory storage for now
    // In production, you should use @react-native-async-storage/async-storage
    const memoryStorage: Record<string, string> = {}
    return {
      getItem: async (name: string): Promise<string | null> => {
        return memoryStorage[name] || null
      },
      setItem: async (name: string, value: string): Promise<void> => {
        memoryStorage[name] = value
      },
      removeItem: async (name: string): Promise<void> => {
        delete memoryStorage[name]
      },
    }
  }
}

interface AuthUser {
  id: string
  email: string
  phoneNumber: string | null
  roles: Role[]
}

interface AuthState {
  // Token state
  accessToken: string | null
  refreshToken: string | null
  
  // User state
  user: AuthUser | null
  activeRole: Role | null
  nextAction: NextAction
  emailVerified: boolean
  isPhoneVerified: boolean
  phoneNumber: string | null
  email: string | null
  
  // Computed
  isAuthenticated: boolean
  
  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser | null) => void
  setActiveRole: (role: Role | null) => void
  setNextAction: (action: NextAction) => void
  setEmailVerified: (verified: boolean) => void
  setIsPhoneVerified: (verified: boolean) => void
  setPhoneNumber: (phone: string | null) => void
  setEmail: (email: string | null) => void
  logout: () => void
}

export const getAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      accessToken: null,
      refreshToken: null,
      user: null,
      activeRole: null,
      nextAction: 'none',
      emailVerified: false,
      isPhoneVerified: false,
      phoneNumber: null,
      email: null,
      isAuthenticated: false,

      // Actions
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setActiveRole: (activeRole) => set({ activeRole }),

      setNextAction: (nextAction) => set({ nextAction }),

      setEmailVerified: (emailVerified) => set({ emailVerified }),

      setIsPhoneVerified: (isPhoneVerified) => set({ isPhoneVerified }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      setEmail: (email) => set({ email }),

      logout: () => {
        // Clear all React Query cached data to prevent stale user data
        queryClient.clear()
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          activeRole: null,
          nextAction: 'none',
          emailVerified: false,
          isPhoneVerified: false,
          phoneNumber: null,
          email: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => createStorage()),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        activeRole: state.activeRole,
        nextAction: state.nextAction,
        emailVerified: state.emailVerified,
        isPhoneVerified: state.isPhoneVerified,
        phoneNumber: state.phoneNumber,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Selector hooks for convenience
export const useAuthStore = getAuthStore
export const useIsAuthenticated = () => getAuthStore((state) => state.isAuthenticated)
export const useActiveRole = () => getAuthStore((state) => state.activeRole)
export const useAccessToken = () => getAuthStore((state) => state.accessToken)
