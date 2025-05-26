// src/stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import useApi from 'src/composables/UseApi.js'

const { listByColumn } = useApi()

export const useUserStore = defineStore(
  'user',
  () => {
    const userLogged = ref(null)

    async function fetchUser(userId) {
      const [firstUser] = await listByColumn('usuario', 'user_id', userId)
      userLogged.value = firstUser ?? null
    }

    return {
      userLogged,
      fetchUser
    }
  },
  {
    persist: true
  }
)
