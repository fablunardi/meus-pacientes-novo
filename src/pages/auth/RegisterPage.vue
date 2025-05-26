<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
    <div class="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="mx-auto mb-4 w-24 h-24" />
        <q-icon name="person_add" size="48px" color="primary" />
        <h1 class="text-2xl font-bold text-gray-800">Criar Conta</h1>
      </div>

      <q-form @submit="handleSubmit" class="space-y-4">
        <template v-if="!awaitingOtp">
          <q-input
            v-model="name"
            label="Nome completo"
            filled
            class="w-full"
            :rules="[val => !!val || 'Informe o nome']"
          />
          <q-input
            v-model="email"
            type="email"
            label="E-mail"
            filled
            class="w-full"
            :rules="[val => !!val || 'Informe o e-mail']"
          />
          <q-input
            v-model="confirmEmail"
            type="email"
            label="Repita o e-mail"
            filled
            class="w-full"
            :rules="[val => val === email || 'E-mails não coincidem']"
          />
          <q-input
            v-model="password"
            type="password"
            label="Senha"
            filled
            class="w-full"
            :rules="[
    val => !!val || 'Informe a senha',
    val => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres'
  ]"
          />

        </template>

        <template v-else>
          <p class="text-center text-gray-600 text-sm">
            Um código foi enviado para seu e-mail. Digite-o abaixo:
          </p>
          <q-input
            v-model="otp"
            label="Código de verificação"
            filled
            class="w-full"
            :rules="[val => !!val || 'Informe o código']"
          />
        </template>

        <div v-if="error" class="text-red-600 text-sm mt-2 text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 transition duration-200 disabled:opacity-50 flex justify-center items-center"
          :disabled="isFormIncomplete && !awaitingOtp || loading"
        >
          <span v-if="!loading">{{ awaitingOtp ? 'Verificar código' : 'Registrar-se' }}</span>
          <q-spinner v-else size="sm" color="white" />
        </button>

      </q-form>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import useAuthUser from 'src/composables/auth/UseAuthUser.js'

const router = useRouter()
const $q = useQuasar()
const { register, verifyOtp } = useAuthUser()

const name = ref('')
const email = ref('')
const confirmEmail = ref('')
const password = ref('')
const otp = ref('')
const error = ref(null)
const loading = ref(false)
const awaitingOtp = ref(false)

const isFormIncomplete = computed(() => {
  return !email.value || !name.value || !password.value || password.value.length < 6
})

const handleSubmit = async () => {
  if (awaitingOtp.value) {
    await handleVerifyOtp()
  } else {
    await handleRegister()
  }
}


const handleRegister = async () => {
  loading.value = true
  error.value = null
  try {
    if (email.value !== confirmEmail.value) {
      error.value = 'Os e-mails não coincidem'
      return
    }


    const result = await register({
      email: email.value,
      password: password.value,
      name: name.value,
      senha_usuario:password.value
    })


    if (typeof result === 'string') {
      // mensagem de erro já retornada pela função
      error.value = result
      return
    }

    awaitingOtp.value = true
    $q.notify({ type: 'info', message: 'Verifique seu e-mail e digite o código OTP' })
  } catch (err) {
    error.value = err.message || 'Erro ao registrar'
  } finally {
    loading.value = false
  }
}

const handleVerifyOtp = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await verifyOtp(email.value, otp.value)
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Conta verificada com sucesso!' })
      await router.push('/')
    }
  } catch (err) {
    error.value = err.message || 'Código inválido'
  } finally {
    loading.value = false
  }
}
</script>
