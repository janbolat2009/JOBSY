import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)
  
  const isAuthenticated = computed(() => !!session.value && !!user.value)
  
  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (!error && data) {
      user.value = data
      return data
    }
    return null
  }
  
  const initAuth = async () => {
    loading.value = true
    
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    
    if (currentSession) {
      session.value = currentSession
      await fetchUserData(currentSession.user.id)
    }
    
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      session.value = newSession
      
      if (newSession) {
        await fetchUserData(newSession.user.id)
      } else {
        user.value = null
      }
    })
    
    loading.value = false
  }
  
  const login = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      session.value = data.session
      await fetchUserData(data.user.id)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const register = async (userData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      })
      
      if (authError) {
        return { success: false, error: authError.message }
      }
      
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        }])
      
      if (userError) {
        return { success: false, error: userError.message }
      }
      
      if (userData.role === 'candidate') {
        await supabase
          .from('candidate_profiles')
          .insert([{
            user_id: authData.user.id,
            position: 'Frontend Developer',
            location: 'Remote',
            about: ''
          }])
      }
      
      session.value = authData.session
      await fetchUserData(authData.user.id)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
  }
  
  return {
    user,
    session,
    loading,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    fetchUserData
  }
})