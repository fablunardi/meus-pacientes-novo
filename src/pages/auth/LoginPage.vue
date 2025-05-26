<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
    <!-- Botão Registre-se no canto superior direito -->
    <button
      @click="router.push('/register')"
      type="submit"
      class="absolute top-4 right-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 transition duration-200 disabled:opacity-50"
      :disabled="loading"
    >
      <div class="flex justify-center items-center">
      <span v-if="!loading">Registre-se</span>
      <q-spinner v-else size="sm" color="white" />
      </div>
    </button>
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="mx-auto mb-4 w-24 h-24" />
        <q-icon name="lock" size="48px" color="primary" />
        <h1 class="text-2xl font-bold text-gray-800">Acesso Meus Pacientes</h1>
      </div>

      <q-form @submit="handleLogin" class="space-y-4 space-y">
        <q-input
          v-model="email"
          type="email"
          label="E-mail"
          filled
          class="w-full"
          :disable="loading"
          :rules="[val => !!val || 'Informe o e-mail']"
        />
        <q-input
          v-model="password"
          type="password"
          label="Senha"
          filled
          class="w-full"
          :disable="loading"
          :rules="[val => !!val || 'Informe a senha']"
        />

        <div v-if="error" class="text-red-600 text-sm mt-2">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 transition duration-200 disabled:opacity-50"
          :disabled="loading"
        >
          <div class="flex justify-center items-center">
          <span v-if="!loading">Entrar</span>
          <q-spinner v-else size="sm" color="white" />
          </div>
        </button>

        <!-- Link "Esqueci minha senha" -->
        <div class="text-center mt-4">
          <button
            @click="router.push('/recovery-password')"
            class="w-full rounded-xl text-primary font-semibold py-2 px-4 transition duration-200 disabled:opacity-50"
            :disabled="loading"
          >
            <div class="flex justify-center items-center">
            <span v-if="!loading">Recuperar senha</span>
            <q-spinner v-else size="sm" color="white" />
            </div>
          </button>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useAuthUser from 'src/composables/auth/UseAuthUser.js'
import {useUserStore} from "stores/userStore.js";
import {useConsultorioUserStore} from "stores/consultorioUserStore.js";

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const router = useRouter()
const { login } = useAuthUser()

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    const user = await login(email.value, password.value)
    if (!user) return

    const userStore = useUserStore()
    const consultorioStore = useConsultorioUserStore()

    await userStore.fetchUser(user.id)

    const consultorioId = userStore.userLogged.cd_consultorio
    if (consultorioId) {
      await consultorioStore.fetchUsersByConsultorio(consultorioId)
    }

    await router.push('/')
  } catch (err) {
    error.value = err.message || 'Falha no login'
  } finally {
    loading.value = false
  }
}

</script>
