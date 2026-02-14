<template>
  <div class="min-h-screen pb-20">
    <header class="glass-strong sticky top-0 z-50 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button @click="$router.back()" class="glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-white/10 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Назад</span>
          </button>
          
          <h1 class="text-xl font-bold">Уведомления</h1>
          
          <button @click="markAllAsRead" class="glass px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-sm">
            Прочитать все
          </button>
        </div>
      </div>
    </header>
    
    <main class="max-w-4xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      
      <div v-else-if="notifications.length === 0" class="text-center py-12 glass rounded-3xl">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <p class="text-gray-400">Нет уведомлений</p>
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="notification in notifications" :key="notification.id" 
             :class="[
               'card-glass p-5 rounded-3xl cursor-pointer transition-all',
               !notification.read ? 'border-2 border-primary/30' : ''
             ]"
             @click="handleNotificationClick(notification)">
          <div class="flex items-start space-x-4">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              notification.type === 'interview_invitation' ? 'bg-primary/20' : 'bg-secondary/20'
            ]">
              <svg v-if="notification.type === 'interview_invitation'" class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <svg v-else class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold">{{ notification.title }}</h3>
                <span v-if="!notification.read" class="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></span>
              </div>
              <p class="text-sm text-gray-300 mb-2">{{ notification.message }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(notification.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const notifications = ref([])

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadNotifications = async () => {
  loading.value = true
  
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
    
    notifications.value = data || []
  } catch (err) {
    console.error('Ошибка загрузки уведомлений:', err)
  } finally {
    loading.value = false
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification.id)
  }
  
  if (notification.type === 'interview_invitation' && notification.data?.interview_id) {
    router.push(`/interview/${notification.data.interview_id}`)
  }
}

const markAllAsRead = async () => {
  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', authStore.user.id)
      .eq('read', false)
    
    await loadNotifications()
  } catch (err) {
    console.error('Ошибка пометки уведомлений:', err)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>