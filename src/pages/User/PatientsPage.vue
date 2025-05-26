<template>
  <q-page class="p-6 bg-gray-100 min-h-screen">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Pacientes</h1>
      </div>

      <q-input
        v-model="search"
        filled
        dense
        placeholder="Buscar por Nome, Email..."
        class="py-3"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-table
        :rows="filteredUsers"
        :columns="columns"
        row-key="id"
        flat
        bordered
        class="bg-white rounded-xl shadow"
        :rows-per-page-options="[200]"
        :pagination="{ rowsPerPage: 200 }"
      >
        <template #body-cell-foto="props">
          <q-td>
            <q-avatar size="36px" color="green" text-color="white">
              <template v-if="props.row.foto_paciente">
                <img :src="props.row.foto_paciente" alt="Foto do Paciente" />
              </template>
              <template v-else>
                {{ getInitials(props.row.nm_paciente) }}
              </template>
            </q-avatar>
          </q-td>
        </template>


        <template #body-cell-acoes="props">
          <q-td class="w-full sm:w-auto">
            <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <q-btn
                dense
                class="bg-green-600 text-white rounded-md px-1 py-1 ml-1 hover:bg-green-700 transition disabled:opacity-50 normal-case"
                icon="edit"
                @click="editarPaciente(props.row.cd_paciente)"
              />
              <q-btn
                dense
                icon="delete"
                class="bg-red-600 text-white rounded-md px-1 py-1 ml-1 hover:bg-red-700 transition disabled:opacity-50 normal-case"
                @click="desativarPaciente(props.row.cd_paciente)"
              />
              <q-btn
                label="Prontuário"
                dense
                icon="medical_information"
                class="bg-green-600 text-white rounded-md px-4 py-1 ml-1 hover:bg-green-700 transition disabled:opacity-50 normal-case"
                :to="{ name: 'patient-records', params: { pacienteId: props.row.cd_paciente } }"
              />
            </div>
          </q-td>
        </template>

      </q-table>
    </div>

    <q-dialog v-model="showEditDialog" persistent>
      <q-card class="w-full max-w-2xl p-4 rounded-xl shadow bg-white">
        <q-card-section class="text-lg font-semibold border-b pb-2">Editar Paciente</q-card-section>
        <q-form @submit.prevent="salvarEdicao" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div class="col-span-full">
            <label class="block mb-2 text-sm font-medium text-gray-700">Foto do Paciente</label>

            <div class="flex items-center gap-4">
              <!-- Avatar com imagem ou iniciais -->
              <q-avatar size="64px" class="bg-green-600 text-white">
                <template v-if="form.foto_paciente">
                  <img :src="form.foto_paciente" alt="Foto do Paciente" class="rounded-full object-cover" />
                </template>
                <template v-else>
                  {{ getInitials(form.nm_paciente) }}
                </template>
              </q-avatar>

              <!-- Botões -->
              <div class="flex flex-col gap-2">
                <q-btn
                  label="Incluir foto"
                  size="sm"
                  class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition disabled:opacity-50 normal-case"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="uploadFoto"
                  />
                </q-btn>

                <q-btn
                  v-if="form.foto_paciente"
                  label="Remover"
                  size="sm"
                  class="bg-red-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-red-700 transition disabled:opacity-50 normal-case"
                  icon="close"
                  @click="removerFoto"
                />
              </div>
            </div>
          </div>

          <label class="text-base font-semibold text-gray-700 col-span-full">Dados Pessoais</label>
          <q-input v-model="form.nm_paciente" label="Nome" dense outlined required />
          <q-select v-model="sexoLabel" :options="['Masculino', 'Feminino', 'Outro']" label="Sexo" dense outlined />
          <q-input v-model="form.dt_nascimento_paciente" type="date" label="Nascimento" dense outlined />
          <q-input v-model="form.cpf_paciente" label="CPF" mask="###.###.###-##" outlined dense :rules="[v => !v || validateCPF(v) || 'CPF inválido']" />

          <label class="text-base font-semibold text-gray-700 col-span-full mt-2">Dados de Contato</label>
          <q-input v-model="form.nr_celular_paciente" mask="## - #########" label="Celular" dense outlined />
          <q-input v-model="form.nr_telefone_paciente" mask="## - #########" label="Telefone" dense outlined />
          <q-input v-model="form.email_paciente" label="E-mail" dense outlined type="email" />

          <label class="text-base font-semibold text-gray-700 col-span-full mt-2">Endereço</label>
          <label class="text-base text-gray-700 col-span-full">Informe o CEP para buscarmos o endereço</label>
          <q-input v-model="form.cep_paciente" mask="#####-###" label="CEP" dense outlined @change="preencherEnderecoPorCep"/>
          <q-input disable v-model="form.endereco_paciente" label="Endereço" dense outlined />
          <q-input v-model="form.nr_endereco_paciente" label="Nº" dense outlined />
          <q-input v-model="form.complemento_paciente" label="Complemento" dense outlined />
          <q-input disable v-model="form.bairro_paciente" label="Bairro" dense outlined />
          <q-input disable v-model="form.cidade_paciente" label="Cidade" dense outlined />
          <q-input disable v-model="form.estado_paciente" label="Estado" dense outlined />

          <label class="text-base font-semibold text-gray-700 col-span-full mt-2">Convênio</label>
          <q-input v-model="form.convenio_paciente" label="Convênio" dense outlined />
          <q-input v-model="form.plano_paciente" label="Plano" dense outlined />
          <q-input v-model="form.nr_carteira_paciente" label="Nº da Carteira" dense outlined />
          <q-input v-model="form.dt_validade_carteira_paciente" type="date" label="Validade da Carteira" dense outlined />

          <label class="text-base font-semibold text-gray-700 col-span-full mt-2">Observações</label>
          <q-input v-model="form.observacoes_paciente" label="Observações" dense outlined type="textarea" class="col-span-full" />


          <q-card-actions align="right" class="col-span-full mt-4">
            <q-btn
              label="Cancelar"
              flat
              @click="fecharDialog"
              class="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 transition normal-case"
            />
            <q-btn label="Salvar" type="submit" class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition disabled:opacity-50 normal-case" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue'
import { useUserStore } from 'src/stores/userStore'
import { useQuasar } from 'quasar'
import useApi from "src/composables/UseApi.js";
const $q = useQuasar()
const userStore = useUserStore()
const pacientes = ref([])
const selectedPaciente = ref(null)
const showEditDialog = ref(false)
const {fetchPacientesByConsultorioFull,
  listByColumn,
  updateTable,
  removeFromBucket,
  uploadImg} = useApi()

async function fecharDialog() {
  await loadPacientes()
  showEditDialog.value = false
}
function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function validateCPF(cpf) {
  cpf = (cpf || '').replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let sum = 0; let rest

  for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf[9])) return false

  sum = 0
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  return rest === parseInt(cpf[10])
}

async function uploadFoto(event) {
  const file = event.target.files[0]
  if (!file) return

  $q.loading.show()

  try {

    const antigaFotoUrl = form.value.foto_paciente
    const nomeAntigo = antigaFotoUrl?.split('/').pop() || null

    // Upload da nova imagem

    const url = await uploadImg(file, 'pacientes')

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Atualiza no form e no banco
    form.value.foto_paciente = url

    if (sexoLabel.value === 'Masculino') form.value.sexo_paciente = 0
    else if (sexoLabel.value === 'Feminino') form.value.sexo_paciente = 1
    else if (sexoLabel.value === 'Outro') form.value.sexo_paciente = 3
    if (!form.value.dt_nascimento_paciente) {
      delete form.value.dt_nascimento_paciente
    }

    await updateTable('paciente', 'cd_paciente', selectedPaciente.value, form.value)

    // Remove a antiga se existir
    if (nomeAntigo) {
      await removeFromBucket(nomeAntigo, 'pacientes')
    }
  } catch (err) {
    console.error('Erro ao fazer upload:', err)
    $q.notify({ type: 'negative', message: 'Falha ao fazer upload da imagem.' })
  } finally {
    $q.loading.hide()
  }
}

async function removerFoto() {
  const antigaFotoUrl = form.value.foto_paciente
  const nomeAntigo = antigaFotoUrl?.split('/').pop() || null
  form.value.foto_paciente = null
  if (sexoLabel.value === 'Masculino') form.value.sexo_paciente = 0
  else if (sexoLabel.value === 'Feminino') form.value.sexo_paciente = 1
  else if (sexoLabel.value === 'Outro') form.value.sexo_paciente = 3
  if (!form.value.dt_nascimento_paciente) {
    delete form.value.dt_nascimento_paciente
  }
  await updateTable('paciente', 'cd_paciente', selectedPaciente.value, form.value)
  await loadPacientes()
  if (nomeAntigo) {
    await removeFromBucket(nomeAntigo, 'pacientes')
  }
}

const search = ref('')

const filteredUsers = computed(() => {
  if (!search.value) return pacientes.value;

  return pacientes.value.filter(user =>
    (user.nm_paciente ? user.nm_paciente.toLowerCase() : "").includes(search.value.toLowerCase()) ||
    (user.email_paciente ? user.email_paciente.toLowerCase() : "").includes(search.value.toLowerCase())
  );
});

const form = ref({
  nm_paciente: '',
  sexo_paciente: null,
  dt_nascimento_paciente: '',
  cpf_paciente: '',
  nr_celular_paciente: '',
  nr_telefone_paciente: '',
  email_paciente: '',
  endereco_paciente: '',
  nr_endereco_paciente: '',
  complemento_paciente: '',
  bairro_paciente: '',
  cep_paciente: '',
  cidade_paciente: '',
  estado_paciente: '',
  convenio_paciente: '',
  plano_paciente: '',
  nr_carteira_paciente: '',
  dt_validade_carteira_paciente: '',
  observacoes_paciente: '',
  foto_paciente: ''
})

async function preencherEnderecoPorCep() {
  const cep = form.value.cep_paciente?.replace(/\D/g, '')
  if (!cep || cep.length !== 8) return

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()

    if (data.erro) {
      $q.notify({ type: 'warning', message: 'CEP não encontrado' })
      return
    }

    form.value.endereco_paciente = data.logradouro
    form.value.bairro_paciente = data.bairro
    form.value.cidade_paciente = data.localidade
    form.value.estado_paciente = data.uf
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Erro ao buscar CEP' })
  }
}

const columns = [
  {
    name: 'foto',
    label: 'Foto',
    align: 'left',
    field: 'foto_paciente',
    sortable: false
  },
  {
    name: 'nm_paciente',
    label: 'Nome',
    align: 'left',
    field: 'nm_paciente',
    sortable: true
  },
  {
    name: 'acoes',
    label: 'Ações',
    align: 'left',
    field: 'cd_paciente',
    sortable: false
  }
]

async function loadPacientes() {
  const cid = userStore.userLogged.cd_consultorio
  pacientes.value = await fetchPacientesByConsultorioFull(cid)
}

async function editarPaciente(id) {
  const [paciente] = await listByColumn('paciente', 'cd_paciente', id)
  if (paciente) {
    selectedPaciente.value = id
    Object.keys(form.value).forEach(key => {
      form.value[key] = paciente[key] || ''
    })
    showEditDialog.value = true
  }
}

async function desativarPaciente(id) {
  $q.dialog({
    title: 'Confirmação',
    message: 'Deseja realmente desativar este paciente? Caso seja necessário restaurar o paciente será necessário entrar em contato com o suporte.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    if (sexoLabel.value === 'Masculino') form.value.sexo_paciente = 0
    else if (sexoLabel.value === 'Feminino') form.value.sexo_paciente = 1
    else if (sexoLabel.value === 'Outro') form.value.sexo_paciente = 3
    if (!form.value.dt_nascimento_paciente) {
      delete form.value.dt_nascimento_paciente
    }
    await updateTable('paciente', 'cd_paciente', id, { ativo: 1 })
    await loadPacientes()
    $q.notify({ type: 'positive', message: 'Paciente desativado com sucesso.' })
  })
}

async function salvarEdicao() {
  if (!selectedPaciente.value) return
  $q.loading.show()
  if (sexoLabel.value === 'Masculino') form.value.sexo_paciente = 0
  else if (sexoLabel.value === 'Feminino') form.value.sexo_paciente = 1
  else if (sexoLabel.value === 'Outro') form.value.sexo_paciente = 3
  if (!form.value.dt_nascimento_paciente) {
    delete form.value.dt_nascimento_paciente
  }
  await updateTable('paciente', 'cd_paciente', selectedPaciente.value, form.value)
  $q.loading.hide()
  showEditDialog.value = false
  await loadPacientes()
  $q.notify({ type: 'positive', message: 'Dados do paciente atualizados!' })
}

async function onFotoSelecionada(e) {
  const file = e.target.files[0]
  if (!file) return
  $q.loading.show()
  try {
    const url = await uploadImg(file, 'pacientes')
    form.value.foto_paciente = url
    $q.notify({ type: 'positive', message: 'Foto enviada com sucesso!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Erro ao enviar imagem' })
  }
  $q.loading.hide()
}

const sexoLabel = computed({
  get() {
    const val = Number(form.value.sexo_paciente)
    if (val === 0) return 'Masculino'
    if (val === 1) return 'Feminino'
    if (val === 3) return 'Outro'
    return ''
  },
  set(value) {
    if (value === 'Masculino') form.value.sexo_paciente = 0
    else if (value === 'Feminino') form.value.sexo_paciente = 1
    else if (value === 'Outro') form.value.sexo_paciente = 3
    else form.value.sexo_paciente = null
  }
})



onMounted(loadPacientes)
</script>

