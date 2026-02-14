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
            
            <h1 class="text-xl font-bold">Сообщения</h1>
            
            <div class="w-24"></div>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 card-glass">
            <h3 class="font-semibold mb-4">Чаты</h3>
            
            <div v-if="loadingChats" class="text-center py-8">
              <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            
            <div v-else-if="chats.length === 0" class="text-center py-8">
              <p class="text-gray-400 text-sm">Нет сообщений</p>
            </div>
            
            <div v-else class="space-y-2">
              <div 
                v-for="chat in chats" 
                :key="chat.application_id"
                @click="selectChat(chat)"
                :class="[
                  'p-3 rounded-xl cursor-pointer transition-all',
                  selectedChat?.application_id === chat.application_id ? 'bg-primary/20' : 'glass hover:bg-white/10'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-semibold text-sm">{{ chat.job_title }}</h4>
                  <span v-if="chat.unread_count > 0" class="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-dark">
                    {{ chat.unread_count }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 truncate">{{ chat.last_message }}</p>
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-2 card-glass flex flex-col h-[600px]">
            <div v-if="!selectedChat" class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p class="text-gray-400">Выберите чат</p>
              </div>
            </div>
            
            <div v-else class="flex flex-col h-full">
              <div class="pb-4 border-b border-white/10 mb-4">
                <h3 class="font-semibold">{{ selectedChat.job_title }}</h3>
                <p class="text-sm text-gray-400">{{ selectedChat.company_name }}</p>
              </div>
              
              <div class="flex-1 overflow-y-auto mb-4 space-y-3">
                <div 
                  v-for="message in messages" 
                  :key="message.id"
                  :class="[
                    'flex',
                    message.sender_id === user.id ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div :class="[
                    'max-w-[70%] p-3 rounded-2xl',
                    message.sender_id === user.id ? 'bg-primary text-dark' : 'glass'
                  ]">
                    <p class="text-sm">{{ message.content }}</p>
                    <p class="text-xs opacity-70 mt-1">{{ new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <input 
                  v-model="newMessage"
                  @keypress.enter="sendMessage"
                  type="text" 
                  placeholder="Написать сообщение..."
                  class="input-glass flex-1"
                />
                <button @click="sendMessage" class="btn-primary">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { supabase } from '@/lib/supabase'
  
  const authStore = useAuthStore()
  const user = computed(() => authStore.user)
  
  const loadingChats = ref(true)
  const chats = ref([])
  const selectedChat = ref(null)
  const messages = ref([])
  const newMessage = ref('')
  
  const loadChats = async () => {
    loadingChats.value = true
    
    const { data: profile } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (profile) {
      const { data: apps } = await supabase
        .from('applications')
        .select(`
          id,
          jobs (
            title,
            companies (name)
          )
        `)
        .eq('candidate_id', profile.id)
      
      if (apps) {
        const chatsData = []
        
        for (const app of apps) {
          const { data: msgs, count } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('application_id', app.id)
            .order('created_at', { ascending: false })
            .limit(1)
          
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('application_id', app.id)
            .eq('is_read', false)
            .neq('sender_id', user.value.id)
          
          if (msgs && msgs.length > 0) {
            chatsData.push({
              application_id: app.id,
              job_title: app.jobs.title,
              company_name: app.jobs.companies?.name || 'Company',
              last_message: msgs[0].content,
              unread_count: unreadCount || 0
            })
          }
        }
        
        chats.value = chatsData
      }
    }
    
    loadingChats.value = false
  }
  
  const selectChat = async (chat) => {
    selectedChat.value = chat
    await loadMessages(chat.application_id)
    await markAsRead(chat.application_id)
  }
  
  const loadMessages = async (applicationId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })
    
    messages.value = data || []
  }
  
  const sendMessage = async () => {
    if (!newMessage.value.trim() || !selectedChat.value) return
    
    const { error } = await supabase
      .from('messages')
      .insert([{
        application_id: selectedChat.value.application_id,
        sender_id: user.value.id,
        content: newMessage.value,
        is_read: false
      }])
    
    if (!error) {
      newMessage.value = ''
      await loadMessages(selectedChat.value.application_id)
    }
  }
  
  const markAsRead = async (applicationId) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('application_id', applicationId)
      .neq('sender_id', user.value.id)
    
    await loadChats()
  }
  
  onMounted(() => {
    loadChats()
    
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        if (selectedChat.value) {
          loadMessages(selectedChat.value.application_id)
        }
        loadChats()
      })
      .subscribe()
  })
  </script>