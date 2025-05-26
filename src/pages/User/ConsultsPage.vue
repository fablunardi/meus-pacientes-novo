<template>
  <q-page class="bg-gray-100 min-h-screen">

    <div class="w-full max-w-md mx-auto mb-6 py-4">
      <q-btn
        label="Criar novo agendamento"
        @click="showDialog = true; form=[]"
        class="w-full bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition disabled:opacity-50 normal-case"
      />
    </div>

    <!-- Seletor de médico -->
    <div class="w-full max-w-md mx-auto py-6">
      <label class="block mb-2 text-lg font-medium text-gray-700">
        Escolha o médico para ver o calendário
      </label>
      <q-select
        v-model="selectedUserId"
        :options="consultorioStore.users"
        option-label="nm_usuario"
        option-value="cd_usuario"
        emit-value
        map-options
        outlined
        dense
        class="bg-white"
      />
    </div>

    <!-- Navegação e cabeçalho -->
    <div class="w-full max-w-4xl mx-auto">
      <div class="flex justify-end space-x-2 mb-2">
        <q-btn flat round icon="chevron_left" @click="onPrev" />
        <q-btn flat label="Hoje" @click="onToday" class="normal-case" />
        <q-btn flat round icon="chevron_right" @click="onNext" />
      </div>

      <!-- Exibição de mês e ano abaixo dos botões -->
      <div class="text-center text-lg font-medium mb-4">
        {{ monthYear }}
      </div>

      <!-- Calendário Mensal com slot para eventos -->
      <q-calendar-month
        locale="pt-BR"
        ref="calendar"
        v-model="calendarDate"
        animated
        bordered
        focusable
        hoverable
        no-active-date
        :day-min-height="60"
        :day-height="0"
        :events-map="eventsMap"
        @change="onChange"
        @moved="onMoved"
        @click-date="onClickDate"
        @click-day="onClickDay"
        @click-workweek="onClickWorkweek"
        @click-head-workweek="onClickHeadWorkweek"
        @click-head-day="onClickHeadDay"
      >
        <template #day="{ scope: { timestamp } }">
          <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
            <div
              @click.stop="onEventClick(event)"
              :style="{ backgroundColor: event.bgcolor, color: '#ffffff' }"
              class="row items-center no-wrap my-event"
            >
              <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs" />
              <div class="title q-calendar__ellipsis">
                {{ event.title }}<span v-if="event.time"> - {{ event.time }}</span>
                <q-tooltip>{{ event.title }}</q-tooltip>
              </div>
            </div>
          </template>
        </template>
      </q-calendar-month>
    </div>
  </q-page>

  <!-- Dialog de Novo Agendamento  -->
  <q-dialog v-model="showDialog" persistent >
    <q-card class="w-full max-w-lg bg-white shadow-2xl border border-gray-200" >
    <q-card-section class="border-b px-6 py-4">
        <div class="text-xl font-semibold text-gray-800">Novo Agendamento</div>
      </q-card-section>

      <div class="px-6 py-4 space-y-4">
      <q-btn
        label="Adicionar novo paciente"
        icon="person_add"
        class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition disabled:opacity-50 normal-case"
        @click="showDialogNovoPaciente = true; novoPaciente=[]"
      />
      </div>

      <q-form class="px-6 py-4 space-y-4" @submit.prevent="onAgendar">
        <!-- Seleção de Paciente -->
        <q-select
          v-model="form.paciente"
          :options="pacientes"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          label="Buscar um paciente"
          hide-selected
          dense
          use-chips
          clearable
          use-input
          fill-input
          input-debounce="200"
          @filter="onFilterPaciente"
          :rules="[v => !!v || 'Selecione um paciente']"
        />


        <!-- Seleção de Médico -->
        <q-select
          v-model="form.medico"
          :options="consultorioStore.users"
          option-label="nm_usuario"
          option-value="cd_usuario"
          emit-value
          map-options
          label="Vincular um profissional"
          dense
          clearable
          :rules="[v => !!v || 'Selecione um médico']"
        />

        <!-- Data e Hora Inicial -->
        <q-input
          v-model="form.inicio"
          type="datetime-local"
          label="Data e Hora Inicial"
          outlined
          dense
          @update:model-value="setFimAutomatico"
          :rules="[v => !!v || 'Informe data/hora inicial']"
        />

        <!-- Data e Hora Final -->
        <q-input
          v-model="form.fim"
          type="datetime-local"
          label="Data e Hora Final"
          outlined
          dense
          :rules="[
          v => !!v || 'Informe data/hora final',
          v => new Date(v) > new Date(form.inicio) || 'Final deve ser depois do início'
        ]"
        />

        <!-- Seleção de Serviço -->
        <q-select
          v-model="form.servico"
          :options="servicos"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          label="Serviço"
          dense
          clearable
        />

        <q-card-actions align="right" class="pt-4 px-6">
          <q-btn
            label="Cancelar"
            flat
            class="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 transition normal-case"
            v-close-popup
          />
          <q-btn
            type="submit"
            label="Agendar"
            class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition disabled:opacity-50 normal-case"
            :disable="!isFormValid"
          />
        </q-card-actions>

      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDialogNovoPaciente" persistent>
    <q-card class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200" >
      <q-card-section class="border-b px-6 py-4">
        <div class="text-xl font-semibold text-gray-800">Adicionar Paciente</div>
      </q-card-section>

      <q-form class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4" @submit.prevent="onSalvarNovoPaciente">
        <q-input v-model="novoPaciente.nome" label="Nome*" outlined dense :rules="[v => !!v || 'Informe o nome']" />

        <q-select
          v-model="novoPaciente.sexo"
          :options="['Masculino', 'Feminino', 'Outro']"
          label="Sexo*"
          outlined
          dense
          emit-value
          map-options
          :rules="[v => !!v || 'Informe o sexo']"
        />

        <q-input
          v-model="novoPaciente.nascimento"
          type="date"
          label="Data de Nascimento*"
          outlined
          dense
          :rules="[v => !!v || 'Informe a data de nascimento']"
        />

        <q-input
          v-model="novoPaciente.cpf"
          label="CPF"
          outlined
          dense
          mask="###.###.###-##"
          :rules="[v => !v || validateCPF(v) || 'CPF inválido']"
        />


        <q-input
          v-model="novoPaciente.telefone"
          label="Telefone"
          outlined
          dense
          mask="## - #########"
        />

        <q-input
          v-model="novoPaciente.celular"
          label="Celular"
          outlined
          dense
          mask="## - #########"
        />

        <q-input
          v-model="novoPaciente.email"
          label="E-mail*"
          type="email"
          outlined
          dense
          :rules="[v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'E-mail inválido']"
        />

        <div class="text-base font-semibold text-gray-700 col-span-full">Endereço</div>
        <p class="text-base text-gray-700 col-span-full">Informe o CEP para buscarmos o endereço</p>
        <q-input v-model="novoPaciente.cep_paciente" mask="#####-###" label="CEP" dense outlined @change="preencherEnderecoPorCep"/>
        <q-input disable v-model="novoPaciente.endereco_paciente" label="Endereço" dense outlined />
        <q-input v-model="novoPaciente.nr_endereco_paciente" label="Nº" dense outlined />
        <q-input v-model="novoPaciente.complemento_paciente" label="Complemento" dense outlined />
        <q-input disable v-model="novoPaciente.bairro_paciente" label="Bairro" dense outlined />
        <q-input disable v-model="novoPaciente.cidade_paciente" label="Cidade" dense outlined />
        <q-input disable v-model="novoPaciente.estado_paciente" label="Estado" dense outlined />

        <q-card-actions align="right" class="pt-4 px-0">
          <q-btn
            flat
            label="Cancelar"
            class="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 transition normal-case"
            v-close-popup
          />
          <q-btn
            type="submit"
            label="Salvar"
            class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition normal-case"
            :disable="!isFormValidPaciente"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showEditDialog" persistent>
    <q-card class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200">
      <q-card-section class="border-b px-6 py-4">
        <div class="text-xl font-semibold text-gray-800">Editar Agendamento</div>
      </q-card-section>

      <div class="px-6 py-4 space-y-4">

        <q-btn
          label="Prontuário"
          dense
          icon="medical_information"
          class="bg-green-600 text-white rounded-md px-4 py-1 ml-1 hover:bg-green-700 transition disabled:opacity-50 normal-case"
          :to="{ name: 'patient-records', params: { pacienteId: patientSelected } }"

        />
      </div>

      <q-form class="px-6 py-4 space-y-4" @submit.prevent="onSalvarEdicao">
        <!-- Paciente (apenas visualização) -->
        <q-input
          v-model="formEdit.paciente"
          label="Paciente"
          outlined
          dense
          readonly
        />

        <!-- Médico -->
        <q-select
          v-model="formEdit.medico"
          :options="consultorioStore.users"
          option-label="nm_usuario"
          option-value="cd_usuario"
          emit-value
          map-options
          label="Médico"
          dense
          :rules="[v => !!v || 'Selecione um médico']"
        />

        <!-- Início -->
        <q-input
          v-model="formEdit.inicio"
          type="datetime-local"
          label="Início"
          outlined
          dense
          :rules="[v => !!v || 'Informe data de início']"
        />

        <!-- Fim -->
        <q-input
          v-model="formEdit.fim"
          type="datetime-local"
          label="Fim"
          outlined
          dense
          :rules="[v => !!v || 'Informe data de fim']"
        />

        <!-- Status -->
        <q-select
          v-model="formEdit.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Status"
          dense
          :rules="[v => !!v || 'Selecione o status']"
        />

        <q-select
          v-model="formEdit.servico"
          :options="servicos"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          label="Serviço"
          dense
        />

        <q-card-actions align="right" class="pt-4 px-6">
          <q-btn
            label="Cancelar"
            flat
            class="bg-gray-200 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-300 transition normal-case"
            v-close-popup
          />
          <q-btn
            type="submit"
            label="Salvar"
            class="bg-green-600 text-white rounded-md px-4 py-2 ml-3 hover:bg-green-700 transition normal-case"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>





</template>

<script setup>
import {ref, watch, onMounted, computed} from 'vue'
import {date, useQuasar} from 'quasar'
import {parseDate, today} from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/dist/index.css'
import {useUserStore} from 'src/stores/userStore'
import {useConsultorioUserStore} from 'src/stores/consultorioUserStore'
import useApi from 'src/composables/UseApi.js'

// Stores e API
const userStore = useUserStore()
const consultorioStore = useConsultorioUserStore()
const {
  fetchConsultas,
  fetchPacientesByConsultorio,
  fetchServicosByConsultorio,
  post,
  listByColumn,
  updateTable
} = useApi()
const showDialog = ref(false)
// Reativos
const selectedUserId = ref(null)
const patientSelected = ref(null)
const calendarDate = ref(today())
const events = ref([])
const calendar = ref(null)
const showDialogNovoPaciente = ref(false)
const $q = useQuasar();

function getColorByStatus(status) {
  switch (status) {
    case 'agendada':
      return '#FFA500'
    case 'realizada':
      return '#00FF7F'
    case 'cancelada':
      return '#FF0000'
    default:
      return '#FFA500'
  }
}

const novoPaciente = ref({
    nome: '',
    sexo: '',
    nascimento: '',
    cpf: '',
    telefone: '',
    celular: '',
    email: '',
    cep_paciente: '',
    endereco_paciente: '',
    bairro_paciente: '',
    cidade_paciente: '',
    estado_paciente: '',
    nr_endereco_paciente:'',
    complemento_paciente:''
  })


async function preencherEnderecoPorCep() {
  const cep = novoPaciente.value.cep_paciente?.replace(/\D/g, '')
  if (!cep || cep.length !== 8) return

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()

    if (data.erro) {
      $q.notify({type: 'warning', message: 'CEP não encontrado'})
      return
    }

    novoPaciente.value.endereco_paciente = data.logradouro
    novoPaciente.value.bairro_paciente = data.bairro
    novoPaciente.value.cidade_paciente = data.localidade
    novoPaciente.value.estado_paciente = data.uf
  } catch (err) {
    console.error(err)
    $q.notify({type: 'negative', message: 'Erro ao buscar CEP'})
  }
}

const isFormValidPaciente = computed(() => {
  const f = novoPaciente.value
  return (
    !!f.nome &&
    !!f.sexo &&
    !!f.nascimento &&
    !!f.email &&
    !!f.cep_paciente &&
    !!f.endereco_paciente &&
    !!f.bairro_paciente &&
    !!f.cidade_paciente &&
    !!f.estado_paciente
  )
})

function validateCPF(cpf) {
  cpf = (cpf || '').replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let sum = 0;
  let rest

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

async function onSalvarNovoPaciente() {
  const sexoMap = {
    'Masculino': 0,
    'Feminino': 1,
    'Outro': 3
  }

  const payload = {
    nm_paciente: novoPaciente.value.nome,
    sexo_paciente: sexoMap[novoPaciente.value.sexo] ?? null,
    dt_nascimento_paciente: novoPaciente.value.nascimento,
    cpf_paciente: novoPaciente.value.cpf || null,
    nr_telefone_paciente: novoPaciente.value.telefone || null,
    nr_celular_paciente: novoPaciente.value.celular || null,
    email_paciente: novoPaciente.value.email || null,
    cd_consultorio: userStore.userLogged.cd_consultorio,
    cep_paciente: novoPaciente.value.cep_paciente || null,
    endereco_paciente: novoPaciente.value.endereco_paciente || null,
    bairro_paciente: novoPaciente.value.bairro_paciente || null,
    estado_paciente: novoPaciente.value.estado_paciente || null,
    cidade_paciente: novoPaciente.value.cidade_paciente || null,
    complemento_paciente: novoPaciente.value.complemento_paciente || null,
    nr_endereco_paciente: novoPaciente.value.nr_endereco_paciente || null,
  }

  $q.loading.show()

  const [savedPaciente] = await post('paciente', payload)

  const cid = userStore.userLogged.cd_consultorio
  pacientesOriginais.value = await fetchPacientesByConsultorio(cid)
  pacientes.value = pacientesOriginais.value
  const novoId = savedPaciente.cd_paciente
  const encontrado = pacientesOriginais.value.find(p => p.id === novoId)
  if (encontrado) {
    form.value.paciente = encontrado.id
  }

  $q.loading.hide()
  showDialogNovoPaciente.value = false
}


const form = ref({
  paciente: null,
  medico: null,
  inicio: date.formatDate(today().timestamp, 'YYYY-MM-DD HH:mm'),
  fim: '',
  servico: null
})

// Opções
const pacientesOriginais = ref([]) // todos
const pacientes = ref([])          // filtrados

async function onFilterPaciente(val, update, abort) {
  if (val === '') {
    update(() => {
      pacientes.value = [...pacientesOriginais.value]
    })
    return
  }

  update(() => {
    const termo = val.toLowerCase()
    pacientes.value = pacientesOriginais.value.filter(p =>
      p.name.toLowerCase().includes(termo)
    )
  })
}

const servicos = ref([])

watch(showDialog, async val => {
  if (val) {
    $q.loading.show()
    const cid = userStore.userLogged.cd_consultorio
    pacientesOriginais.value = await fetchPacientesByConsultorio(cid)
    servicos.value = await fetchServicosByConsultorio(cid)
    $q.loading.hide()
  }
})

const isFormValid = computed(() => {
  const f = form.value
  return (
    !!f.paciente &&
    !!f.medico &&
    !!f.inicio &&
    !!f.fim &&
    new Date(f.fim) > new Date(f.inicio)
  )
})

function setFimAutomatico(val) {
  form.value.inicio = val;
  if (!val) {
    form.value.fim = '';
    return;
  }

  // Gera Date a partir da string do input (local)
  const dt = new Date(val);

  // Soma 1 hora
  dt.setMinutes(dt.getMinutes() + 30);

  // Formata YYYY-MM-DDThh:mm em horário local
  const pad = n => String(n).padStart(2, '0');
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());

  form.value.fim = `${y}-${m}-${d}T${hh}:${mm}`;
}


// Submete novo agendamento (placeholder)
async function onAgendar() {
  const cd_consultorio = userStore.userLogged.cd_consultorio
  const cd_usuario = form.value.medico
  const cd_paciente = form.value.paciente
  const cd_servico = form.value.servico || null

  const inicio = date.formatDate(form.value.inicio, 'YYYY-MM-DD HH:mm:ss')
  const fim = date.formatDate(form.value.fim, 'YYYY-MM-DD HH:mm:ss')

  const titulo = pacientes.value.find(p => p.id === cd_paciente)?.name || 'Paciente'

  $q.loading.show()

  // 1. Inserir a consulta
  const [consulta] = await post('consulta', {
    cd_consultorio,
    cd_paciente,
    cd_usuario,
    titulo,
    inicio,
    fim,
    status: 'agendada',
    color: '#FFA500'
  })

  // 2. Se houver serviço selecionado, buscar detalhes do serviço
  if (cd_servico && consulta?.cd_consulta) {
    const [servico] = await listByColumn('servicos', 'cd_servico', cd_servico)

    if (servico) {
      const {
        nm_servico,
        valor_servico,
        particular
      } = servico

      const financeiroPayload = {
        cd_servico,
        cd_consulta: consulta.cd_consulta,
        cd_usuario,
        cd_paciente,
        data_financeiro: inicio,
        servico_financeiro: nm_servico,
        valor_financeiro: particular === 0 ? valor_servico : 0,
        valor_plano_financeiro: particular === 1 ? valor_servico : 0,
        nm_plano_financeiro: particular === 0 ? 'Particular' : 'Convênio',
        pago: 0
      }

      await post('financeiro', financeiroPayload)
    }
  }

  $q.notify({ type: 'positive', message: 'Consulta agendada com sucesso', position:'top-right' })

  const [pacienteData] = await listByColumn('paciente', 'cd_paciente', cd_paciente)
  const [consultorioData] = await listByColumn('consultorio', 'cd_consultorio', cd_consultorio)


  const medico = consultorioStore.users.find(u => u.cd_usuario === cd_usuario)
  const telefone = pacienteData.nr_celular_paciente?.replace(/\D/g, '')
  const nomePaciente = pacienteData?.nm_paciente || 'Paciente'
  const nomeMedico = medico?.nm_usuario || 'Médico'
  const dataHora = date.formatDate(form.value.inicio, 'DD/MM') + ' às ' + date.formatDate(form.value.inicio, 'HH:mm')


  if (telefone?.length >= 10) {
    const smsBody = {
      to: '55' + telefone,
      nomePaciente: nomePaciente,
      nomeMedico:nomeMedico,
      dataHora:dataHora,
      telefoneConsultorio:consultorioData?.fone_consultorio || 'Telefone não cadastrado',
      emailConsultorio:consultorioData?.email_consultorio || 'E-mail não cadastrado',

    }

    try {
      const res = await fetch('https://send-mail-amazon.fesystemapps.com/send-whatsapp-scheduled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(smsBody)
      })

      const result = await res.json()
    } catch (err) {
      console.error('Erro ao enviar SMS:', err)
      $q.notify({ type: 'negative', message: 'Erro ao enviar SMS.' })
    }
  }

  await loadEventsFor(cd_usuario)

  $q.loading.hide()
  showDialog.value = false
}

const showEditDialog = ref(false)

const formEdit = ref({
  id: null,
  paciente: '',
  medico: null,
  inicio: '',
  fim: '',
  status: '',
  color: ''
})

watch(() => formEdit.value.status, (newStatus) => {
  formEdit.value.color = getColorByStatus(newStatus)
})

const statusOptions = [
  {label: 'Agendada', value: 'agendada'},
  {label: 'Realizada', value: 'realizada'},
  {label: 'Cancelada', value: 'cancelada'}
]

// Função chamada ao clicar em um evento
async function onEventClick(evt) {
  const [consultaData] = await listByColumn('consulta', 'cd_consulta', evt.id)

  const cid = userStore.userLogged.cd_consultorio
  pacientesOriginais.value = await fetchPacientesByConsultorio(cid)
  servicos.value = await fetchServicosByConsultorio(cid)
  patientSelected.value = consultaData.cd_paciente
  // Resolve nome do paciente
  const pacienteEncontrado = pacientesOriginais.value.find(p => p.id === consultaData.cd_paciente)
  const nomePaciente = pacienteEncontrado?.name || 'Paciente não encontrado'

  // Resolve médico
  const medicoEncontrado = consultorioStore.users.find(
    u => String(u.cd_usuario) === String(consultaData.cd_usuario)
  )

  // Busca o serviço vinculado na tabela financeiro
  const [financeiroData] = await listByColumn('financeiro', 'cd_consulta', evt.id)
  const servicoVinculado = financeiroData?.cd_servico || null

  formEdit.value = {
    id: consultaData.cd_consulta,
    paciente: nomePaciente,
    medico: medicoEncontrado?.cd_usuario || null,
    inicio: consultaData.inicio.slice(0, 16),
    fim: consultaData.fim.slice(0, 16),
    status: consultaData.status,
    color: consultaData.color || '#FFA500',
    servico: servicoVinculado // novo campo
  }

  showEditDialog.value = true
}


// Salvando alterações
async function onSalvarEdicao() {
  $q.loading.show()

  const payloadConsulta = {
    cd_usuario: formEdit.value.medico,
    inicio: formEdit.value.inicio + ':00',
    fim: formEdit.value.fim + ':00',
    status: formEdit.value.status,
    color: formEdit.value.color
  }

  await updateTable('consulta', 'cd_consulta', formEdit.value.id, payloadConsulta)

  // Verifica se foi selecionado um serviço
  if (formEdit.value.servico) {
    const [servico] = await listByColumn('servicos', 'cd_servico', formEdit.value.servico)

    if (servico) {
      const payloadFinanceiro = {
        cd_servico: servico.cd_servico,
        cd_consulta: formEdit.value.id,
        cd_usuario: formEdit.value.medico,
        cd_paciente: pacientesOriginais.value.find(p => p.name === formEdit.value.paciente)?.id,
        servico_financeiro: servico.nm_servico,
        valor_financeiro: servico.particular === 0 ? servico.valor_servico : 0,
        valor_plano_financeiro: servico.particular === 1 ? servico.valor_servico : 0,
        nm_plano_financeiro: servico.particular === 0 ? 'Particular' : 'Convênio',
        pago: 0,
        data_financeiro: formEdit.value.inicio + ':00'
      }

      // Verifica se já existe vínculo financeiro para esta consulta
      const [existeFinanceiro] = await listByColumn('financeiro', 'cd_consulta', formEdit.value.id)

      if (existeFinanceiro) {
        await updateTable('financeiro', 'cd_consulta', formEdit.value.id, payloadFinanceiro)
      } else {
        await post('financeiro', payloadFinanceiro)
      }
    }
  }

  showEditDialog.value = false
  await loadEventsFor(selectedUserId.value)
  $q.loading.hide()
}


// Computed para exibir mês e ano
const monthYear = computed(() => {
  const ts = calendarDate.value
  const dateObj = ts?.timestamp
    ? new Date(ts.timestamp)
    : new Date(ts)
  // formata mês por extenso e ano em português
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(dateObj)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})


// Computed para gerar eventsMap: { 'YYYY-MM-DD': [events] }
const eventsMap = computed(() => {
  const map = {}
  events.value.forEach(evt => {
    if (!map[evt.date]) {
      map[evt.date] = []
    }
    map[evt.date].push(evt)
  })
  return map
})

// Carrega e formata os eventos para QCalendarMonth
async function loadEventsFor(userId) {
  $q.loading.show()
  if (!userId) {
    $q.loading.hide()
    events.value = []
    return
  }
  const consultorioId = userStore.userLogged.cd_consultorio
  const rows = await fetchConsultas(consultorioId, userId)
  $q.loading.hide()
  events.value = rows.map(evt => {
    const startDt = new Date(evt.start_event)
    const endDt = new Date(evt.end_event)
    const start = date.formatDate(startDt, 'YYYY-MM-DD')
    return {
      id: Number(evt.id),
      title: evt.title.replace(/^\"|\"$/g, ''),
      details: evt.description || '',
      date: start,
      time: date.formatDate(startDt, 'HH:mm'),
      duration: Math.ceil((endDt - startDt) / 60000),
      bgcolor: evt.color,
      icon: evt.icon || '',
      cd_paciente: evt.cd_paciente
    }
  })

  // Ajusta a data exibida para o primeiro evento
  if (events.value.length) {
    const ts = parseDate(events.value[0].date)
    if (ts) {
      calendarDate.value = ts
    }
  }
}

// Navegação do calendário
function onToday() {
  calendar.value?.moveToToday()
}

function onPrev() {
  calendar.value?.prev()
}

function onNext() {
  calendar.value?.next()
}

function onMoved(data) {
  console.info('onMoved', data)
}

function onChange(data) {
  console.info('onChange', data)
}

function onClickDate(data) {
  console.info('onClickDate', data)
}

function onClickDay(data) {
  console.info('onClickDay', data)
}

function onClickWorkweek(data) {
  console.info('onClickWorkweek', data)
}

function onClickHeadDay(data) {
  console.info('onClickHeadDay', data)
}

function onClickHeadWorkweek(data) {
  console.info('onClickHeadWorkweek', data)
}

// Inicializa e observa seleção de médico
onMounted(() => {
  selectedUserId.value = userStore.userLogged.cd_usuario
})
watch(selectedUserId, id => loadEventsFor(id), {immediate: true})
</script>
