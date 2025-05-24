<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="mx-auto mb-4 w-24 h-24" />
        <q-icon name="lock_reset" size="48px" color="primary" />
        <h1 class="text-2xl font-bold text-gray-800">Nova Senha</h1>
      </div>

      <q-form @submit="handleReset" class="space-y-4">
        <q-input
          v-model="password"
          type="password"
          label="Nova Senha"
          filled
          class="w-full"
          :disable="loading"
          :rules="[val => !!val || 'Informe a nova senha']"
        />

        <div v-if="error" class="text-red-600 text-sm mt-2">
          {{ error }}
        </div>

        <q-btn
          rounded
          type="submit"
          label="Alterar Senha"
          color="primary"
          class="w-full"
          :loading="loading"
        />
      </q-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useAuthUser from 'src/composables/auth/UseAuthUser'

const { resetPassword } = useAuthUser()
const password = ref('')
const error = ref(null)
const loading = ref(false)
const router = useRouter()


onMounted(() => {

})

const handleReset = async () => {
  loading.value = true
  error.value = null

  try {
    await resetPassword(password.value)
    await router.push('/')
  } catch (err) {
    error.value = err.message || 'Erro ao redefinir senha'
  } finally {
    loading.value = false
  }
}
</script>
