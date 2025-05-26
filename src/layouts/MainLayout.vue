<template>
  <q-layout view="lHh Lpr lFf" class="bg-gray-100 text-gray-800">
    <!-- Navbar -->
    <header class="bg-white shadow w-full fixed top-0 z-50">
      <div class="w-full px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link
            to="/"
            class="flex items-center space-x-2 text-lg font-bold text-gray-900"
          >
            <img src="/logo.png" alt="Logo" style="width: 50px; height: 50px" />
            <span class="q-pa-sm text-primary">Meus Pacientes</span>
            <span class="q-pa-sm text-primary text-xs">Bem vindo {{ userStore.userLogged?.nm_usuario || '...' }}</span>
          </router-link>

          <!-- Menu desktop -->
          <nav v-if="isDesktop" class="flex items-center space-x-6">
            <router-link
              v-for="item in menuItems"
              :key="item.label"
              :to="item.route"
              class="flex items-center space-x-2 hover:text-primary font-medium"
            >
              <component
                :is="item.icon"
                class="w-5 h-5 shrink-0 text-primary"
                style="width: 30px !important; height: 30px !important;"
              />
              <span>{{ item.label }}</span>
            </router-link>
            <button
              @click="handleLogout"
              class="flex items-center space-x-2 hover:text-red-600 font-medium"
            >
              <q-icon name="logout" class="text-red-600" />
              <span>Sair</span>
            </button>
          </nav>

          <!-- Botão mobile -->
          <button v-show="!isDesktop" @click="mobileMenu = !mobileMenu">
            <q-icon :name="mobileMenu ? 'close' : 'menu'" size="md" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="!isDesktop && mobileMenu" class="md:hidden px-4 pb-4 bg-white shadow">
        <router-link
          v-for="item in menuItems"
          :key="item.label"
          :to="item.route"
          class="flex items-center space-x-2 hover:text-primary font-medium"
          @click="mobileMenu = false"
        >
          <component
            :is="item.icon"
            class="w-6 h-6 shrink-0 text-primary mr-4"
            style="width: 30px !important; height: 30px !important"
          />
          <span class="q-pa-md">{{ item.label }}</span>
        </router-link>
        <button
          @click="() => { mobileMenu = false; handleLogout() }"
          class="flex items-center  hover:text-red-600 font-medium"
        >
          <q-icon size="30px" name="logout" class="text-red-600"/>
          <span class="q-pa-md">Sair</span>
        </button>
      </div>
    </header>

    <!-- Conteúdo da página -->
    <q-page-container class="pt-20 px-4">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import useAuthUser from 'src/composables/auth/UseAuthUser'

import {
  UserIcon,
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

import { useUserStore } from 'src/stores/userStore'
import { useConsultorioUserStore } from 'src/stores/consultorioUserStore'

const $q = useQuasar()
const mobileMenu = ref(false)
const isDesktop = computed(() => $q.screen.gt.sm)
const router = useRouter()
const { logout,  user } = useAuthUser()
const userStore = useUserStore()

watch(isDesktop, (newVal) => {
  if (newVal) {
    mobileMenu.value = false
  }
})

const handleLogout = async () => {
  try {
    await logout()
    await router.push('/login')
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Erro ao sair: ' + err.message })
  }
}

onMounted(async () => {



})

const menuItems = [
  { label: 'Agendamentos', route: '/consults', icon: CalendarDaysIcon },
  { label: 'Pacientes', route: '/patients', icon: UserIcon },
  { label: 'Medicamentos', route: '/drugs', icon: ClipboardDocumentIcon },
  { label: 'Mensagens', route: '/chats', icon: ChatBubbleLeftRightIcon },
  { label: 'Relatórios', route: '/reports', icon: ChartBarIcon },
  { label: 'Configurações', route: '/settings', icon: Cog6ToothIcon }
]
</script>
