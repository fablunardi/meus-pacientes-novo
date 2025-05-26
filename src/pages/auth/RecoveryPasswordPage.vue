<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="mx-auto mb-4 w-24 h-24" />
        <q-icon name="email" size="48px" color="primary" />
        <h1 class="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
      </div>

      <q-form @submit="submit" class="space-y-4">
        <q-input
          filled
          v-model="email"
          label="Seu e-mail"
          type="email"
          class="w-full"
          :disable="loading"
          :rules="[val => !!val || 'Informe o e-mail']"
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
          <span v-if="!loading">Enviar link de redefinição</span>
          <q-spinner v-else size="sm" color="white" />
          </div>
        </button>
      </q-form>

      <p class="text-sm text-center mt-4 text-gray-600">
        Você receberá um e-mail com o link para criar uma nova senha.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import useAuthUser from 'src/composables/auth/UseAuthUser.js'

const $q = useQuasar()
const email = ref('')
const loading = ref(false)
const error = ref(null)

const { sendPasswordResetEmail } = useAuthUser()

async function submit() {
  loading.value = true
  error.value = null

  try {
    await sendPasswordResetEmail(email.value)
    $q.notify({
      type: 'positive',
      message: 'E-mail de redefinição enviado com sucesso!',
    })
  } catch (err) {
    error.value = err.message || 'Erro ao enviar e-mail'
  } finally {
    loading.value = false
  }
}
</script>
