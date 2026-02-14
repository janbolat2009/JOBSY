<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md animate-slide-up">
      <div class="mb-8">
        <button @click="$router.push('/')" class="glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-white/10 transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Назад</span>
        </button>
      </div>
      <div class="card-glass">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gradient mb-2">Вход</h2>
          <p class="text-gray-400">Добро пожаловать обратно</p>
        </div>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="your@email.com"
              class="input-glass"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="input-glass"
            />
          </div>
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" v-model="form.remember" class="w-4 h-4 rounded border-gray-600 bg-transparent">
              <span class="text-gray-400">Запомнить меня</span>
            </label>
            <a href="#" class="text-primary hover:text-primary-light transition-colors">Забыли пароль?</a>
          </div>
          <button type="submit" class="w-full btn-primary" :disabled="loading">
            <span v-if="!loading">Войти</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Вход...
            </span>
          </button>
          <div v-if="error" class="glass-strong border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
            {{ error }}
          </div>
        </form>
        <div class="mt-6 text-center text-sm text-gray-400">
          Нет аккаунта?
          <router-link to="/register" class="text-primary hover:text-primary-light transition-colors font-semibold">
            Зарегистрируйтесь
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const result = await authStore.login(form.value)
  
  if (result.success) {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const userRole = authStore.user?.role
    
    if (userRole === 'employer') {
      router.push('/employer')
    } else if (userRole === 'candidate') {
      router.push('/candidate')
    } else {
      router.push('/')
    }
  } else {
    error.value = result.error || 'Ошибка входа'
  }
  
  loading.value = false
}
</script>