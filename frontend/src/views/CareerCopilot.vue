<template>
  <div class="min-h-screen bg-black text-white relative overflow-hidden pb-20 font-inter">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full animate-pulse-slow delay-1000"></div>
    </div>

    <header class="glass-strong sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <h1 class="font-bold text-xl tracking-tight">{{ $t('career_copilot.title') }} <span class="align-top text-[10px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">{{ $t('career_copilot.beta') }}</span></h1>
            <p class="text-xs text-gray-400">{{ $t('career_copilot.subtitle') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <LanguageSwitcher />
          <button @click="$router.push('/candidate')" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10 relative z-10">
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-40">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-400 animate-pulse">Analyzing your resume & portfolio...</p>
      </div>

      <div v-else class="animate-fade-in">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div class="lg:col-span-1 glass-strong rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
            <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 class="text-lg font-semibold text-gray-300 mb-6 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {{ $t('career_copilot.health_score') }}
            </h2>
            
            <div class="relative w-48 h-48 mx-auto mb-6">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="12" fill="transparent" class="text-gray-800" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" stroke-width="12" fill="transparent" 
                  :stroke-dasharray="circumference" 
                  :stroke-dashoffset="circumference - (careerScore / 100) * circumference"
                  class="text-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">{{ careerScore }}</span>
                <span class="text-xs text-primary font-bold uppercase tracking-widest mt-1">Excellent</span>
              </div>
            </div>
            
            <div class="space-y-3">
               <div class="flex justify-between text-sm">
                 <span class="text-gray-500">{{ $t('career_copilot.market_relevance') }}</span>
                 <span class="text-white font-medium">92%</span>
               </div>
               <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                 <div class="bg-gradient-to-r from-primary to-secondary h-full w-[92%] rounded-full"></div>
               </div>
               <div class="flex justify-between text-sm">
                 <span class="text-gray-500">{{ $t('career_copilot.salary_potential') }}</span>
                 <span class="text-white font-medium">High</span>
               </div>
            </div>
          </div>

          <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="glass p-6 rounded-3xl flex flex-col justify-between group hover:bg-white/5 transition-all">
               <div>
                 <h3 class="text-gray-400 font-medium mb-1">{{ $t('career_copilot.est_market_value') }}</h3>
                 <div class="flex items-baseline gap-2 mb-4">
                   <span class="text-4xl font-bold text-white">{{ salaryPrediction.toLocaleString() }}</span>
                   <span class="text-lg text-gray-500">₸ / {{ $t('career_copilot.month') }}</span>
                 </div>
                 <div class="flex items-center gap-2 text-green-400 bg-green-400/10 w-fit px-3 py-1 rounded-full text-xs font-bold mb-6">
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                   +15% {{ $t('career_copilot.vs_last_month') }}
                 </div>
               </div>
               <div class="h-24 w-full relative">
                  <div class="absolute bottom-0 left-0 right-0 flex items-end justify-between h-full gap-1">
                    <div v-for="h in [20, 35, 30, 50, 45, 60, 55, 75, 60, 90]" :key="h" 
                         :style="{ height: h + '%' }" 
                         class="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors"></div>
                  </div>
               </div>
             </div>

             <div class="glass p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-32 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                <h3 class="text-purple-300 font-medium mb-4 relative z-10">{{ $t('career_copilot.next_milestone') }}</h3>
                <div class="relative z-10">
                  <h2 class="text-3xl font-bold text-white mb-2 leading-tight">{{ targetRole }}</h2>
                  <div class="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ $t('career_copilot.est_time', { time: '3-6 months' }) }}
                  </div>
                  <button @click="showRoadmapModal = true" class="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group">
                    {{ $t('career_copilot.view_roadmap') }}
                    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </button>
                </div>
             </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          <div class="glass p-8 rounded-3xl flex flex-col items-center justify-center min-h-[400px] relative">
             <h3 class="absolute top-6 left-6 font-bold text-gray-300">{{ $t('career_copilot.skill_matrix') }}</h3>
             <div class="w-full h-full flex items-center justify-center">
               <div class="relative w-80 h-80">
                  <div class="absolute inset-0 border border-white/10 rounded-full animate-ping-slow"></div>
                  <div class="absolute inset-10 border border-white/20 rounded-full"></div>
                  <div class="absolute inset-20 border border-white/5 rounded-full"></div>
                  
                  <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                    <polygon points="50,10 90,35 80,80 20,80 10,35" fill="rgba(var(--primary), 0.2)" stroke="rgba(var(--primary), 1)" stroke-width="1.5" />
                    <polygon points="50,25 80,45 70,70 30,70 20,45" fill="rgba(var(--secondary), 0.2)" stroke="rgba(var(--secondary), 0.8)" stroke-width="1.5" stroke-dasharray="4" />
                  </svg>
                  
                  <!-- Dynamic Labels -->
                  <div v-for="(skill, i) in topSkills" :key="skill" 
                       class="absolute text-xs font-bold text-white px-2 py-1 rounded bg-black/40 backdrop-blur-sm"
                       :style="getLabelStyle(i)">
                    {{ skill }}
                  </div>
               </div>
             </div>
             <div class="flex items-center gap-6 text-xs mt-4">
               <div class="flex items-center gap-2"><span class="w-3 h-3 bg-primary/50 border border-primary rounded-sm"></span> {{ $t('career_copilot.your_skills') }}</div>
               <div class="flex items-center gap-2"><span class="w-3 h-3 bg-secondary/50 border border-secondary rounded-sm border-dashed"></span> {{ $t('career_copilot.market_demand') }}</div>
             </div>
          </div>

          <div class="glass p-8 rounded-3xl">
            <h3 class="font-bold text-gray-300 mb-6">{{ $t('career_copilot.critical_gaps') }}</h3>
            <div class="space-y-4">
              <div v-for="skill in skillGaps" :key="skill.name || skill.skill" class="group">
                <div class="flex justify-between text-sm mb-2">
                  <span class="font-medium text-white group-hover:text-primary transition-colors">{{ skill.name || skill.skill }}</span>
                  <span class="text-red-400 font-bold">-{{ skill.gap || skill.gap_percentage }}%</span>
                </div>
                <div class="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div class="bg-gray-700 h-full w-full relative">
                    <div class="absolute top-0 right-0 h-full bg-red-500/50 animate-pulse" :style="{ width: (skill.gap || skill.gap_percentage) + '%' }"></div>
                    <div class="absolute top-0 left-0 h-full bg-primary" :style="{ width: (100 - (skill.gap || skill.gap_percentage)) + '%' }"></div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ $t('career_copilot.recommended') }}: <span class="text-gray-400 underline cursor-pointer hover:text-white">Learn {{ skill.name || skill.skill }}</span></p>
              </div>
            </div>
            
            <div class="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 flex gap-4 items-start">
              <div class="p-2 bg-primary/20 rounded-lg text-primary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                 <h4 class="text-sm font-bold text-white">{{ $t('career_copilot.ai_recommendation') }}</h4>
                 <p class="text-xs text-gray-400 mt-1">{{ $t('career_copilot.ai_rec_text') }}</p>
              </div>
            </div>
          </div>

        </div>

        <div class="mb-20">
          <h3 class="text-2xl font-bold mb-8">{{ $t('career_copilot.roadmap') }}</h3>
          <div class="relative border-l-2 border-white/10 ml-4 md:ml-10 space-y-12 pb-10">
            
            <div v-for="(milestone, i) in roadmap" :key="i" class="relative pl-8 md:pl-12 group">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-black transition-all duration-300"
                   :class="milestone.completed ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : (i === currentMilestoneIndex ? 'bg-primary ring-4 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.8)]' : 'bg-gray-700')">
              </div>

              <div class="glass p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all transform group-hover:translate-x-2 duration-300"
                   :class="i === currentMilestoneIndex ? 'bg-gradient-to-r from-primary/10 to-transparent' : ''">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <h4 class="text-lg font-bold" :class="milestone.completed ? 'text-green-400 line-through opacity-50' : 'text-white'">{{ milestone.title || milestone.milestone_title }}</h4>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-mono py-1 px-2 rounded bg-white/5 text-gray-400 border border-white/5">{{ milestone.deadline || 'Flexible' }}</span>
                    <button v-if="!milestone.completed && i === currentMilestoneIndex" class="btn-primary py-1 px-3 text-xs">{{ $t('career_copilot.mark_complete') }}</button>
                  </div>
                </div>
                <p class="text-sm text-gray-400 max-w-2xl leading-relaxed">{{ milestone.description }}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </main>

    <!-- Roadmap Modal -->
    <div v-if="showRoadmapModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showRoadmapModal = false"></div>
       <div class="relative bg-dark-lighter border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto glass p-8 animate-slide-up">
          <div class="flex justify-between items-center mb-8">
             <h2 class="text-2xl font-bold text-white">{{ $t('career_copilot.roadmap') }}</h2>
             <button @click="showRoadmapModal = false" class="text-gray-400 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>
          
          <div class="relative border-l-2 border-white/10 ml-4 space-y-12 pb-10">
            <div v-for="(milestone, i) in roadmap" :key="i" class="relative pl-8 group">
              <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-black transition-all duration-300"
                   :class="milestone.completed ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]'">
              </div>
              <div class="glass p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <h4 class="text-lg font-bold" :class="milestone.completed ? 'text-green-400 line-through opacity-50' : 'text-white'">{{ milestone.title || milestone.milestone_title }}</h4>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-mono py-1 px-2 rounded bg-white/5 text-gray-400 border border-white/5">{{ milestone.deadline || 'Flexible' }}</span>
                  </div>
                </div>
                <p class="text-sm text-gray-400 max-w-2xl leading-relaxed">{{ milestone.description }}</p>
                <div class="mt-4 flex gap-2" v-if="milestone.resources">
                   <a v-for="res in milestone.resources" :key="res" href="#" class="text-xs py-1 px-2 rounded-lg bg-black/40 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20">
                     📄 {{ res }}
                   </a>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-8 flex justify-end">
             <button @click="showRoadmapModal = false" class="btn-primary py-2 px-6">{{ $t('career_copilot.close') || 'Close' }}</button>
          </div>
       </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const showRoadmapModal = ref(false)
const loading = ref(true)
const careerScore = ref(0)
const circumference = 2 * Math.PI * 88
const currentMilestoneIndex = ref(0)
const salaryPrediction = ref(0)
const targetRole = ref('Loading...')

const skillGaps = ref([])
const roadmap = ref([])
const topSkills = ref(['Coding', 'Design', 'Arch', 'Team', 'Lead'])

const getLabelStyle = (i) => {
  const positions = [
    { top: '0%', left: '50%', transform: 'translate(-50%, -100%)' },
    { top: '35%', right: '0%', transform: 'translate(100%, -50%)' },
    { bottom: '20%', right: '10%', transform: 'translate(50%, 50%)' },
    { bottom: '20%', left: '10%', transform: 'translate(-50%, 50%)' },
    { top: '35%', left: '0%', transform: 'translate(-100%, -50%)' }
  ]
  return positions[i] || {}
}

const analyzeProfile = async () => {
  if (!user.value?.id) return
  
  // 1. Fetch user profile + resume text (if available)
  const { data: profile } = await supabase.from('candidate_profiles').select('*').eq('user_id', user.value.id).single()
  
  if (profile) {
    // 2. Call backend to analyze (Mock for now, will connect to Python ML later)
    // const res = await fetch('http://localhost:3000/api/career/analyze', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ user_profile: profile })
    // })
    // const data = await res.json()
    
    // MOCK DATA based on profile
    setTimeout(() => {
      careerScore.value = 78
      salaryPrediction.value = 1800000
      targetRole.value = profile.position || 'Senior Developer'
      
      skillGaps.value = [
         { skill: 'System Design', gap_percentage: 45 },
         { skill: 'Kubernetes', gap_percentage: 30 },
         { skill: 'Cloud AWS', gap_percentage: 20 }
      ]
      
      roadmap.value = [
        { milestone_title: 'Deepen Core Tech', description: `Master advanced concepts in ${profile.position || 'your field'}.`, completed: true },
        { milestone_title: 'System Design', description: 'Learn to design scalable, high-availability systems.', completed: false, deadline: 'Month 1' },
        { milestone_title: 'Leadership Skills', description: 'Mentor juniors and lead small technical initiatives.', completed: false, deadline: 'Month 3' }
      ]
      
      if (profile.skills && profile.skills.length >= 5) {
        topSkills.value = profile.skills.slice(0, 5)
      }
      
      loading.value = false
    }, 1500)
  } else {
    loading.value = false
  }
}

onMounted(() => {
  analyzeProfile()
})
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
.animate-pulse-slow {
  animation: pulse-slow 8s infinite ease-in-out;
}
.animate-ping-slow {
    animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
