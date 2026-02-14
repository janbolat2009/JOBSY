<template>
    <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      <div class="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      <div class="w-full max-w-md space-y-8 animate-fade-in">
        <div class="text-center space-y-4">
          <div class="flex justify-center mb-8">
            <div class="relative">
              <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
              <div class="relative glass-strong rounded-3xl p-8">
                <svg class="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h1 class="text-5xl font-bold">
            <span class="text-gradient">JOBSY</span>
          </h1>
          
          <p class="text-gray-400 text-lg">
            {{ $t('landing.subtitle') }}
          </p>
        </div>
        
        <div class="card-glass space-y-4">
          <div class="flex items-center space-x-3 p-4 glass rounded-2xl">
            <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-white">{{ $t('landing.auto_screening') }}</h3>
              <p class="text-sm text-gray-400">{{ $t('landing.auto_screening_desc') }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-4 glass rounded-2xl">
            <div class="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-white">{{ $t('landing.ai_interview') }}</h3>
              <p class="text-sm text-gray-400">{{ $t('landing.ai_interview_desc') }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 p-4 glass rounded-2xl">
            <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-white">{{ $t('landing.analytics') }}</h3>
              <p class="text-sm text-gray-400">{{ $t('landing.analytics_desc') }}</p>
            </div>
          </div>
        </div>
        
        <div class="space-y-3">
          <button @click="$router.push('/login')" class="w-full btn-primary">
            {{ $t('landing.login') }}
          </button>
          
          <button @click="$router.push('/register')" class="w-full btn-secondary">
            {{ $t('landing.register') }}
          </button>
        </div>
        
        <p class="text-center text-sm text-gray-500">
          {{ $t('landing.join_msg') }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
  </script>