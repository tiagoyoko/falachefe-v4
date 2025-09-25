'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  name: string
  email: string
  emailVerified: boolean | null
  image: string | null
  role: 'user' | 'admin' | 'super_admin'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // Fetch user profile from database
          const { data: profileData, error } = await supabase
            .from('user')
            .select('*')
            .eq('id', currentUser.id)
            .single()

          if (error) {
            console.error('Error fetching user profile:', error)
            setProfile(null)
          } else {
            setProfile(profileData as UserProfile)
          }
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Fetch user profile from database
        const { data: profileData, error } = await supabase
          .from('user')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          setProfile(null)
        } else {
          setProfile(profileData as UserProfile)
        }
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
