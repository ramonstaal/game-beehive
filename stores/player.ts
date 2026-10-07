import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase/client'
import type { Database } from '~/lib/supabase/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export const usePlayerStore = defineStore('player', () => {
  const user = ref<any>(null)
  const profile = ref<Profile | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => !!user.value)

  // Auth state listener
  async function initAuth() {
    isLoading.value = true

    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchProfile(session.user.id)
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        profile.value = null
      }
    })

    isLoading.value = false
  }

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return
    }

    profile.value = data
  }

  async function signUp(email: string, password: string, username: string) {
    isLoading.value = true
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })
    isLoading.value = false
    return { data, error }
  }

  async function signIn(email: string, password: string) {
    isLoading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    isLoading.value = false
    return { data, error }
  }

  async function signInWithMagicLink(email: string) {
    isLoading.value = true
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    isLoading.value = false
    return { data, error }
  }

  async function signOut() {
    isLoading.value = true
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    isLoading.value = false
  }

  // Demo mode fallback
  function initDemoPlayer() {
    profile.value = {
      id: 'demo-player',
      username: 'Beekeeper',
      avatar_seed: 'bee-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  return {
    user: readonly(user),
    profile: readonly(profile),
    isLoading: readonly(isLoading),
    isAuthenticated,
    initAuth,
    fetchProfile,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    initDemoPlayer,
  }
})
