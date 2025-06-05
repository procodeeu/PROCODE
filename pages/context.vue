<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Floating Navigation Menu -->
    <div class="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
      <div class="bg-white rounded-lg shadow-lg p-4 w-64">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">📋 Nawigacja</h3>
        <nav class="space-y-2">
          <a href="#personal" @click="scrollToSection('personal')" class="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">📖 Kim jesteś?</a>
          <a href="#goals" @click="scrollToSection('goals')" class="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">🎯 Twoje Cele</a>
          <a href="#work" @click="scrollToSection('work')" class="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">💼 Kontekst Zawodowy</a>
          <a href="#personal-life" @click="scrollToSection('personal-life')" class="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">🏠 Kontekst Osobisty</a>
          <a href="#challenges" @click="scrollToSection('challenges')" class="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">⚡ Obecne Wyzwania</a>
          <a href="#ai-prefs" @click="scrollToSection('ai-prefs')" class="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">🤖 Preferencje AI</a>
        </nav>
      </div>
    </div>

    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 lg:ml-72">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">🧠 Twój Kontekst Życiowy</h1>
            <p class="text-gray-600">Pomóż AI lepiej Cię zrozumieć i otrzymywać bardziej trafne powiadomienia</p>
          </div>
          <button @click="$router.back()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            ← Powrót
          </button>
        </div>
      </div>

      <!-- Progress indicator -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Postęp wypełniania</h2>
          <span class="text-sm text-gray-500">{{ completionPercentage }}% ukończone</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="`width: ${completionPercentage}%`"></div>
        </div>
      </div>

      <form @submit.prevent="saveContext" class="space-y-6">
        
        <!-- Personal Bio Section -->
        <div id="personal" class="bg-white shadow-lg rounded-lg p-8 border-l-4 border-blue-500">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 -m-8 p-8 mb-6 rounded-t-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">📖 Kim jesteś?</h3>
            <p class="text-gray-600">Opowiedz swoją historię i obecną sytuację życiową</p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Opowiedz o sobie - Twoja historia, background, obecna sytuacja życiowa
              </label>
              <textarea
                v-model="context.personalBio"
                rows="18"
                class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
                placeholder="Przykład: Jestem 28-letnim programistą z Warszawy. Pracuję w startupi jako full-stack developer. Mam żonę i 2-letnie dziecko. Interesuję się sztuczną inteligencją i technologiami blockchain. Obecnie przeprowadzam się do większego mieszkania i planuję założenie własnej firmy..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Twoja obecna sytuacja życiowa
              </label>
              <textarea
                v-model="context.currentSituation"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
                placeholder="Opisz co aktualnie dzieje się w Twoim życiu - zmiany, wyzwania, nowe projekty..."
              />
            </div>
          </div>
        </div>

        <!-- Goals Section -->
        <div id="goals" class="bg-white shadow-lg rounded-lg p-8 border-l-4 border-green-500">
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 -m-8 p-8 mb-6 rounded-t-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">🎯 Twoje Cele</h3>
            <p class="text-gray-600">Określ swoje długo i krótkoterminowe cele życiowe</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Long term goals -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cele długoterminowe (1-5 lat)
              </label>
              <textarea
                v-model="longTermGoalsText"
                rows="15"
                class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
                placeholder="- Założyć własną firmę technologiczną&#10;- Osiągnąć niezależność finansową&#10;- Nauczyć się płynnie hiszpańskiego&#10;- Kupić dom nad morzem"
              />
            </div>
            
            <!-- Short term goals -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cele krótkoterminowe (3-6 miesięcy)
              </label>
              <textarea
                v-model="shortTermGoalsText"
                rows="15"
                class="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed"
                placeholder="- Dokończyć kurs React Native&#10;- Zrzucić 5kg wagi&#10;- Rozpocząć side project&#10;- Przeczytać 3 książki o biznesie"
              />
            </div>
          </div>
        </div>

        <!-- Professional Context -->
        <div id="work" class="bg-white shadow-lg rounded-lg p-8 border-l-4 border-purple-500">
          <div class="bg-gradient-to-r from-purple-50 to-violet-50 -m-8 p-8 mb-6 rounded-t-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">💼 Kontekst Zawodowy</h3>
            <p class="text-gray-600">Opisz swoją pracę, branżę i umiejętności które chcesz rozwijać</p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Praca, branża, odpowiedzialności
              </label>
              <textarea
                v-model="workContextText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opisz swoją pracę, branżę, zespół, główne obowiązki..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Co chcesz się nauczyć? (umiejętności)
              </label>
              <textarea
                v-model="skillsToLearnText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="- Python i machine learning&#10;- Zarządzanie zespołem&#10;- Digital marketing"
              />
            </div>
          </div>
        </div>

        <!-- Personal Context -->
        <div id="personal-life" class="bg-white shadow-lg rounded-lg p-8 border-l-4 border-yellow-500">
          <div class="bg-gradient-to-r from-yellow-50 to-amber-50 -m-8 p-8 mb-6 rounded-t-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">🏠 Kontekst Osobisty</h3>
            <p class="text-gray-600">Twoja rutyna, zainteresowania, relacje i cele zdrowotne</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Codzienna rutyna i nawyki
              </label>
              <textarea
                v-model="dailyRoutineText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6:00 - pobudka i ćwiczenia&#10;7:30 - śniadanie z rodziną&#10;9:00-17:00 - praca&#10;18:00 - czas z dzieckiem"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Zainteresowania i pasje
              </label>
              <textarea
                v-model="interestsText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="- Programowanie i nowe technologie&#10;- Podróże i fotografia&#10;- Książki o biznesie&#10;- Gry planszowe"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Relacje (rodzina, znajomi, sieć kontaktów)
              </label>
              <textarea
                v-model="relationshipsText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Żona Anna (marketingowiec), córka Zosia (2 lata), rodzice w Krakowie, grupa znajomych programistów..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cele zdrowotne i samopoczucie
              </label>
              <textarea
                v-model="healthGoalsText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="- Regularny sport 3x w tygodniu&#10;- Lepsza dieta i więcej warzyw&#10;- Medytacja codziennie&#10;- Więcej snu (min. 7h)"
              />
            </div>
          </div>
        </div>

        <!-- Current Challenges -->
        <div id="challenges" class="bg-white shadow-lg rounded-lg p-8 border-l-4 border-red-500">
          <div class="bg-gradient-to-r from-red-50 to-pink-50 -m-8 p-8 mb-6 rounded-t-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">⚡ Obecne Wyzwania</h3>
            <p class="text-gray-600">Problemy i blokady które obecnie napotykasz</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Z jakimi problemami się zmagasz? Co Cię blokuje?
            </label>
            <textarea
              v-model="challengesText"
              rows="12"
              class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="- Brak czasu na side projekty&#10;- Trudność z work-life balance&#10;- Prokrastynacja przy nauce&#10;- Stres związany z kredytem hipotecznym"
            />
          </div>
        </div>

        <!-- AI Interaction Preferences -->
        <div id="ai-prefs" class="bg-white shadow-lg rounded-lg p-8 border-l-4 border-indigo-500">
          <div class="bg-gradient-to-r from-indigo-50 to-blue-50 -m-8 p-8 mb-6 rounded-t-lg">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">🤖 Preferencje AI</h3>
            <p class="text-gray-600">Jak preferujesz komunikację z AI i o czym powinno być proaktywne</p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Jak preferujesz komunikację z AI?
              </label>
              <textarea
                v-model="communicationStyleText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bezpośredni styl, konkretne pytania, motywujące wiadomości rano, przypomnienia o celach..."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                O czym AI powinno być proaktywne?
              </label>
              <textarea
                v-model="proactiveTopicsText"
                rows="12"
                class="w-full p-4 border border-gray-300 rounded-lg text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="- Przypomnienia o nauce i rozwoju&#10;- Motywacja do ćwiczeń&#10;- Pytania o postępy w side projektach&#10;- Inspirujące artykuły technologiczne"
              />
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-2 text-gray-600">Zapisywanie kontekstu...</p>
        </div>

        <!-- Error state -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600">{{ error }}</p>
        </div>

        <!-- Success state -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <p class="text-green-600">{{ successMessage }}</p>
        </div>

        <!-- Submit button -->
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="$router.back()"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Zapisywanie...' : 'Zapisz Kontekst' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UserContext {
  personalBio?: string
  currentSituation?: string
  longTermGoals?: string[]
  shortTermGoals?: string[]
  challenges?: string[]
  workContext?: any
  skillsToLearn?: string[]
  dailyRoutine?: any
  interests?: string[]
  relationships?: any
  healthGoals?: string[]
  communicationStyle?: any
  proactiveTopics?: string[]
}

const context = ref<UserContext>({})
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

// Text representations for easier editing
const longTermGoalsText = ref('')
const shortTermGoalsText = ref('')
const challengesText = ref('')
const workContextText = ref('')
const skillsToLearnText = ref('')
const dailyRoutineText = ref('')
const interestsText = ref('')
const relationshipsText = ref('')
const healthGoalsText = ref('')
const communicationStyleText = ref('')
const proactiveTopicsText = ref('')

const completionPercentage = computed(() => {
  const fields = [
    context.value.personalBio,
    context.value.currentSituation,
    longTermGoalsText.value,
    shortTermGoalsText.value,
    challengesText.value,
    workContextText.value,
    skillsToLearnText.value,
    dailyRoutineText.value,
    interestsText.value,
    relationshipsText.value,
    healthGoalsText.value,
    communicationStyleText.value,
    proactiveTopicsText.value
  ]
  
  const filledFields = fields.filter(field => field && field.trim().length > 0).length
  return Math.round((filledFields / fields.length) * 100)
})

const parseListFromText = (text: string): string[] => {
  return text.split('\n')
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(line => line.length > 0)
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })
  }
}

const saveContext = async () => {
  isLoading.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    // Parse text fields into structured data
    const contextData = {
      personalBio: context.value.personalBio?.trim() || null,
      currentSituation: context.value.currentSituation?.trim() || null,
      longTermGoals: longTermGoalsText.value ? parseListFromText(longTermGoalsText.value) : null,
      shortTermGoals: shortTermGoalsText.value ? parseListFromText(shortTermGoalsText.value) : null,
      challenges: challengesText.value ? parseListFromText(challengesText.value) : null,
      workContext: workContextText.value?.trim() ? { description: workContextText.value.trim() } : null,
      skillsToLearn: skillsToLearnText.value ? parseListFromText(skillsToLearnText.value) : null,
      dailyRoutine: dailyRoutineText.value?.trim() ? { description: dailyRoutineText.value.trim() } : null,
      interests: interestsText.value ? parseListFromText(interestsText.value) : null,
      relationships: relationshipsText.value?.trim() ? { description: relationshipsText.value.trim() } : null,
      healthGoals: healthGoalsText.value ? parseListFromText(healthGoalsText.value) : null,
      communicationStyle: communicationStyleText.value?.trim() ? { description: communicationStyleText.value.trim() } : null,
      proactiveTopics: proactiveTopicsText.value ? parseListFromText(proactiveTopicsText.value) : null
    }

    await $fetch('/api/user/context', {
      method: 'POST',
      body: contextData
    })
    
    successMessage.value = 'Kontekst został zapisany! AI będzie teraz lepiej rozumieć Twoje potrzeby.'
    
    // Redirect to dashboard after success
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 2000)
    
  } catch (err: any) {
    error.value = `Błąd podczas zapisywania: ${err.message || 'Nieznany błąd'}`
  } finally {
    isLoading.value = false
  }
}

const loadExistingContext = async () => {
  try {
    const response = await $fetch<{context: UserContext}>('/api/user/context')
    console.log('Loaded context:', response.context)
    if (response.context) {
      context.value = response.context
      
      // Convert structured data back to text for editing
      if (response.context.longTermGoals) {
        longTermGoalsText.value = response.context.longTermGoals.map(goal => `- ${goal}`).join('\n')
      }
      if (response.context.shortTermGoals) {
        shortTermGoalsText.value = response.context.shortTermGoals.map(goal => `- ${goal}`).join('\n')
      }
      if (response.context.challenges) {
        challengesText.value = response.context.challenges.map(challenge => `- ${challenge}`).join('\n')
      }
      console.log('workContext data:', response.context.workContext)
      if (response.context.workContext?.description) {
        workContextText.value = response.context.workContext.description
        console.log('Set workContextText to:', workContextText.value)
      } else {
        workContextText.value = '' // Ensure field is clear if no data
        console.log('workContext is empty, clearing field')
      }
      if (response.context.skillsToLearn) {
        skillsToLearnText.value = response.context.skillsToLearn.map(skill => `- ${skill}`).join('\n')
      }
      if (response.context.dailyRoutine?.description) {
        dailyRoutineText.value = response.context.dailyRoutine.description
      }
      if (response.context.interests) {
        interestsText.value = response.context.interests.map(interest => `- ${interest}`).join('\n')
      }
      if (response.context.relationships?.description) {
        relationshipsText.value = response.context.relationships.description
      }
      if (response.context.healthGoals) {
        healthGoalsText.value = response.context.healthGoals.map(goal => `- ${goal}`).join('\n')
      }
      if (response.context.communicationStyle?.description) {
        communicationStyleText.value = response.context.communicationStyle.description
      }
      if (response.context.proactiveTopics) {
        proactiveTopicsText.value = response.context.proactiveTopics.map(topic => `- ${topic}`).join('\n')
      }
    }
  } catch (err) {
    console.log('No existing context found, starting fresh')
  }
}

onMounted(() => {
  loadExistingContext()
})

useSeoMeta({
  title: 'Kontekst Życiowy - PROCODE',
  description: 'Skonfiguruj swój kontekst życiowy dla lepszej personalizacji AI'
})
</script>