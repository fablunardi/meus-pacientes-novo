<template>
  <q-page class="q-pa-md bg-gray-50 min-h-screen">
    <q-card class="p-6 rounded-xl shadow-md bg-white max-w-8xl mx-auto">
      <q-tabs
        v-model="tab"
        class="text-primary justify-center"
        dense
        narrow-indicator
      >

      <q-tab name="dados" label="Dados do Paciente" class="normal-case"/>
        <q-tab name="prontuarios" label="Prontuários"  class="normal-case" />
        <q-tab name="financeiro" label="Financeiro"  class="normal-case" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="q-mt-md">
        <q-tab-panel name="dados">
          <div class="text-gray-600">Dados do paciente (em breve)</div>
        </q-tab-panel>

        <q-tab-panel name="prontuarios">
          <div class="flex justify-between items-center mb-4">
            <div class="text-xl font-bold text-gray-700">Prontuários</div>
            <q-btn label="Adicionar Registro Prontuário"  @click="adicionarRegistro" class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition disabled:opacity-50 normal-case"/>
          </div>

          <q-table
            :columns="columns"
            :rows="prontuarios"
            row-key="id"
            flat
            bordered
            class="shadow-sm text-sm"
          >
            <template v-slot:body-cell-acoes="props">
              <q-td align="center">
                <q-btn
                  flat
                  dense
                  class="bg-green-600 text-white rounded-md px-1 py-1 ml-1 hover:bg-green-700 transition disabled:opacity-50 normal-case"
                  icon="edit"
                  @click="abrirRegistro(props.row.cd_prontuario)"
                  round
                />
                <q-btn
                  flat
                  dense
                  icon="visibility"
                  class="bg-orange-600 text-white rounded-md px-1 py-1 ml-1 hover:bg-orange-700 transition disabled:opacity-50 normal-case"
                  @click="visualizarRegistro(props.row.cd_prontuario)"
                  round
                />
                <q-btn
                  flat
                  dense
                  class="bg-gray-600 text-white rounded-md px-1 py-1 ml-1 hover:bg-gray-700 transition disabled:opacity-50 normal-case"
                  icon="print"
                  @click="imprimirRegistro(props.row.cd_prontuario)"
                  round
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="financeiro">
          <div class="text-gray-600">Dados financeiros (em breve)</div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import useApi from 'src/composables/UseApi.js'


const route = useRoute()
const pacienteId = route.params.pacienteId
const tab = ref('prontuarios')
const prontuarios = ref([])

const { listByColumn } = useApi()

const columns = [
  {
    name: 'data',
    label: 'Data',
    field: row => formatarData(row.dt_prontuario),
    sortable: true,
    align: 'left',
    style: 'width: 120px'
  },
  {
    name: 'queixa',
    label: 'Queixa Principal',
    field: 'queixa_principal_duracao',
    sortable: false,
    align: 'left',
    style: 'max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis'
  },
  {
    name: 'acoes',
    label: 'Ações',
    field: 'id',
    sortable: false,
    align: 'center',
    style: 'width: 80px'
  }
]


const formatarData = data => {
  if (!data) return ''
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR')
}

const carregarProntuarios = async () => {
  prontuarios.value = await listByColumn('prontuario', 'cd_paciente', pacienteId)
}

const adicionarRegistro = () => {
  console.log('Abrir formulário para novo registro') // depois criamos a página
}

const abrirRegistro = id => {
  console.log('Abrir visualização do registro', id) // depois redireciona pra página de detalhes
}

const visualizarRegistro = id => {
  console.log('Visualizar registro', id) // depois redireciona pra página de detalhes
}

const imprimirRegistro = id => {
  console.log('Imprimir registro', id) // depois redireciona pra página de detalhes
}


onMounted(() => {
  carregarProntuarios()
})
</script>
