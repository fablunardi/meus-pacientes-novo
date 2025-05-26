// src/stores/consultorioUserStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import useApi from 'src/composables/UseApi.js';
const { listByColumn} = useApi()
export const useConsultorioUserStore =
  defineStore('consultorioUsers', () => {

  const users = ref([])

  async function fetchUsersByConsultorio(consultorioId) {

    const all = await listByColumn('usuario', 'cd_consultorio', consultorioId)
    users.value = all
      .filter(u => u.tipo_usuario === 0)
      .sort((a, b) => b.cd_usuario - a.cd_usuario)
      .map(({ nm_usuario, cd_usuario }) => ({ nm_usuario, cd_usuario }))
  }

  return {
    users,
    fetchUsersByConsultorio
  }
},
    {
      persist: true
    }
)
