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
          <h2 class="text-3xl font-bold text-gradient mb-2">Регистрация</h2>
          <p class="text-gray-400">Создайте свой аккаунт</p>
        </div>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Я ищу</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="form.role = 'candidate'"
                :class="[
                  'p-4 rounded-2xl transition-all duration-300',
                  form.role === 'candidate'
                    ? 'bg-primary text-dark shadow-glow-primary'
                    : 'glass hover:bg-white/10'
                ]"
              >
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="font-semibold">Работу</span>
              </button>
              <button
                type="button"
                @click="form.role = 'employer'"
                :class="[
                  'p-4 rounded-2xl transition-all duration-300',
                  form.role === 'employer'
                    ? 'bg-secondary text-white shadow-glow-secondary'
                    : 'glass hover:bg-white/10'
                ]"
              >
                <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span class="font-semibold">Сотрудников</span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Имя</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Ваше имя"
              class="input-glass"
            />
          </div>
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
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Подтвердите пароль</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              class="input-glass"
            />
          </div>
          <label class="flex items-start space-x-2 cursor-pointer">
            <input type="checkbox" v-model="form.agree" required class="w-4 h-4 mt-1 rounded border-gray-600 bg-transparent">
            <span class="text-sm text-gray-400">
              Я согласен с <a href="#" class="text-primary hover:text-primary-light">условиями использования</a> и <a href="#" class="text-primary hover:text-primary-light">политикой конфиденциальности</a>
            </span>
          </label>
          <button type="submit" class="w-full btn-primary" :disabled="loading || !form.role">
            <span v-if="!loading">Создать аккаунт</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Регистрация...
            </span>
          </button>
          <div v-if="error" class="glass-strong border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
            {{ error }}
          </div>
        </form>
        <div class="mt-6 text-center text-sm text-gray-400">
          Уже есть аккаунт?
          <router-link to="/login" class="text-primary hover:text-primary-light transition-colors font-semibold">
            Войдите
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'candidate',
  agree: false
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.register(form.value)
    if (result.success) {
      const role = authStore.user.role
      if (role === 'employer') {
        router.replace('/employer')
      } else if (role === 'candidate') {
        router.replace('/candidate')
      } else {
        router.replace('/')
      }
    } else {
      error.value = result.error || 'Ошибка регистрации'
    }
  } catch (err) {
    error.value = err.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>