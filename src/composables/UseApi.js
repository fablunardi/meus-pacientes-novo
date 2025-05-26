import useSupabase from 'src/boot/supabase'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'
import {eventBus} from "src/composables/eventBus";
import { format } from 'date-fns';

export const notification=ref([])
export const channel = ref(null)

export const channelVideo = ref(null)
export const online = ref(false)

export const onlineVideo = ref(false)
export default function useApi () {

  const { supabase } = useSupabase()

  const configurations = async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)
    if (error) throw error
    return data
  }

  const generateLinkPaymentStripe = async (price_id, url_ok, url_error, email_client, product) => {
    const {data, error} = await supabase.functions.invoke('stripe', {
      body: {
        price_id: price_id,
        url_ok:url_ok,
        url_error:url_error,
        email_client:email_client,
        product:product
      },
    })

    if (error) throw error
    return data

  }

  const verifyImage = async (imgFile) => {
    const formData = new FormData();
    formData.append('file_image', imgFile);

    const { data, error } = await supabase.functions.invoke('picpurify', {
      body: formData
    });

    if (error) throw error;
    return data;
  };


  const validPaymentStripe = async (sessionId) => {
    const {data, error} = await supabase.functions.invoke('stripe-valid-payment', {
      body: {
        sessionId: sessionId
      },
    })

    if (error) throw error
    return data

  }

  const list = async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  const listLimit = async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data
  }

  const listNext = async (table, columnFilter , filter) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .gt(columnFilter, filter)
      .limit(1)
      .order(columnFilter, { ascending: true })
    if (error) throw error
    return data
  }

  const listPrevious = async (table, columnFilter , filter) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .lt(columnFilter, filter)
      .limit(1)
      .order(columnFilter, { ascending: false })
    if (error) throw error
    return data
  }

  const listByColumn = async (table, columnFilter , filter ) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(columnFilter, filter)
    if (error) throw error
    return data
  }

  const listPublic = async (table, userId, columnFilter = '', filter = '') => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', userId)
      .eq(columnFilter, filter)
    if (error) throw error
    return data
  }

  const listTableOrderedBetween = async (table, userId,columnOrder, columnStart, startFilter, columnEnd, endFilter) => {
    const {data, error} = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .gte(columnStart,startFilter )
        .lte(columnEnd,endFilter )
        .order(columnOrder, { ascending: true })
    if (error) throw error
    return data
  }

  const listPublicOrdered = async (table, userId,columnOrder) => {
    const {data, error} = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order(columnOrder, { ascending: true })
    if (error) throw error
    return data
  }

  const listPublicAll = async (table, columnFilter = '', filter = '', tableJoin='', filterJoin = '') => {

    if (tableJoin) {
      const {data, error} = await supabase
          .from(table)
          .select(`
        *,
        ${tableJoin} : ${filterJoin} ( * )
        `)
          .eq(columnFilter, filter)
          .order('id', { ascending: true })

      return data

    } else {

      const {data, error} = await supabase
          .from(table)
          .select(`
        *
        `)
          .eq(columnFilter, filter)

      return data
    }
  }

  const fetchCount = async (table, userId) => {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
    if (error) throw error
    return {
      data,
      count
    }
  }

  const getById = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
    if (error) throw error
    return data[0]
  }

  const post = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert([
        {
          ...form
        }
      ])
      .select()
    if (error) throw error
    return data
  }

  const postSupport = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert([
        {
          ...form
        }
      ])

    if (error) throw error
    return data
  }

  const updateTable = async (table, col, col_value, form) => {
    const { data, error } = await supabase
      .from(table)
      .update({ ...form })
      .match({[col]: col_value })
      .select()
    if (error) throw error
    return data
  }

  const updateChatsReadStatus = async (user, other_user) => {
    const { data, error } = await supabase
      .from('chats')
      .update({ read_recipient: true })
      .match({ sender: other_user, recipient: user })
      .select();

    if (error) {
      console.error('Error updating chats:', error);
      throw error;
    }

    return data;
  };

  const updateByUser = async (table, form) => {
    const { data, error } = await supabase
        .from(table)
        .update({ ...form })
        .match({ user_id: form.user_id })
    if (error) throw error
    return data
  }

  const remove = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .match({ id })
    if (error) throw error
    return data
  }

  const removeFilter = async (table, filter1, value1, filter2, value2) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .match({ [filter1]: value1, [filter2]: value2 })
    if (error) throw error;
    return data;
  }

  const removeFromBucket = async (file, storage) => {
    const { data, error } = await supabase
      .storage
      .from(storage)
      .remove(file)
    if (error) throw error
    return data
  }

  const uploadImg = async (file, storage) => {
    const fileName = uuidv4()
    const { error } = supabase
      .storage
      .from(storage)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    const publicUrl = await getUrlPublic(fileName, storage)
    if (error) throw error
    return publicUrl
  }

  const getUrlPublic = async (fileName, storage) => {
    const { data, error } = supabase
    .storage
    .from(storage)
    .getPublicUrl(fileName)
    if (error) throw error
    return data.publicUrl
  }


  const sendContact = async (email, body) => {
    const { data, error } = await supabase.rpc('send_contact', { 'email_client':email, 'answer_real_match':body })

    if (error) throw error
    return data
  }

  const verifyReceiptAppleUser = async (user_id)=> {

    const { data, error } = await supabase.rpc('verify_payment_apple_user', {'var_user_id':user_id})

    if (error) throw error
    return data

  }

  const verifyGooglePaymentUser = async (packageName, subscriptionId, purchaseToken, user )=>{

      const { data, error } = await supabase.functions.invoke('validate_subscribe_google', {
        body: { packageName: packageName,  subscriptionId:subscriptionId, purchaseToken:purchaseToken, user:user},
      })

    if (error) throw error
    return data

  }

  const get_profile = async (id_user, lat, long)=>{

    let { data, error } = await supabase
      .rpc('get_profile', {
        id_user,
        lat,
        long
      })
    if (error) throw error
    return data

  }

  const nearby_profiles = async (id_user, lat, long, v_gender_filter, v_distance_from_me, v_age_filter_min, v_age_filter_max,v_physical_form,
                                 v_children, v_smoke, v_drink, v_religion, v_income, v_schooling, v_employment_situation, v_height, v_gender, offset_limit, offset_start)=>{
    let { data, error } = await supabase
      .rpc('nearby_profiles', {
        id_user,
        lat,
        long,
        v_gender_filter, v_distance_from_me, v_age_filter_min, v_age_filter_max,
        v_physical_form,
        v_children, v_smoke, v_drink, v_religion, v_income, v_schooling, v_employment_situation,v_height, v_gender, offset_limit, offset_start
      })
    if (error) throw error
    return data
  }


  async function fetchDataTwoColumns(table, col1, col2, val1, val2) {
    // //console.log(`Querying table: ${table} for ${col1} = ${val1} and ${col2} = ${val2}`);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(col1, val1)
      .eq(col2, val2);


    if (error) throw error
    return data
  }

  async function fetchDataTwoColumnsEditions(val1, val2) {
    const { data, error } = await supabase.rpc('get_editados_from_artigos', {
      nm_lei: val1,
      nm_artigo: val2
    });

    if (error) throw error;

    return data;
  }


  async function fetchDataTwoColumnsOR(table, col1, col2, val1, val2) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .or(col1, 'eq', val1)
      .or(col2, 'eq', val2);

    if (error) throw error
    return data
  }

  async function fetchDataThreeColumns(table, col1, col2, col3, val1, val2, val3) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .filter(col1, 'eq', val1)
      .filter(col2, 'eq', val2)
      .filter(col3, 'eq', val3)

    if (error) throw error
    return data
  }

  async function fetchLikesReceived(user) {
    const { data, error } = await supabase
      .from('likes')
      .select(`
      id,
      profiles!fk_profile_1 (
        status,
        id,
        name,
        url_avatar,
        gender
      )
    `)
      .filter('second_user', 'eq', user)
      .filter('second_user_accepted', 'is', null)

    const filteredData = data.filter(item => item.profiles.status === 1);

    if (error) {
      console.error('Error query:', error);
    } else {
      return filteredData;
    }
  }

  async function fetchLikesSent(user) {
    const { data, error } = await supabase
      .from('likes')
      .select(`
      id,
      relike,
      profiles!fk_profile_2 (
        status,
        id,
        name,
        url_avatar,
        gender
      )
    `)
      .filter('first_user', 'eq', user)
      .filter('second_user_accepted', 'is', null)


    const filteredData = data.filter(item => item.profiles.status === 1);


    if (error) {
      console.error('Error query:', error);
    } else {
      return filteredData
    }
  }

  async function usersBlocked(user) {
    const { data, error } = await supabase
      .from('blockers')
      .select(`
      id,
      profiles!fk_profile_2 (
        id,
        name,
        url_avatar,
        gender
      )
    `)
      .filter('first_user', 'eq', user)


    if (error) {
      console.error('Error query:', error);
    } else {
      return data;
    }
  }


  const sendPushNotification = async (recipient, message, title, subtitle)=>{
    let { data, error } = await supabase
      .rpc('push_notification', {
        recipient,
        message,
        title,
        subtitle
      })
    if (error) throw error
    return data
  }
  const listAllUsers = async (page, limit = 500) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit - 1;

    const { data, error, count } = await supabase.rpc('list_unconfirmed_users', {
      page_start: startIndex,
      page_end: endIndex
    });

    if (error) throw error;
    return { data, count };
  };

  const listLikesUsers = async (page, limit = 500) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit - 1;

    const { data, error, count } = await supabase.rpc('list_likes_with_avatars', {
      page_start: startIndex,
      page_end: endIndex
    });

    if (error) throw error;
    return { data, count };
  };






  const getTotalUsersCount = async () => {
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('admin', false)
      .not('email', 'eq', null)

    if (error) throw error;
    return count;
  };

  const getTotalGrouped = async () => {
    const { data: genderData, error: genderError } = await supabase
      .rpc('get_total_grouped', { column_name: 'gender' });

    const { data: countryData, error: countryError } = await supabase
      .rpc('get_total_grouped', { column_name: 'country' });

    if (genderError || countryError) {
      throw new Error('Error fetching grouped totals');
    }

    return {
      gender: genderData,
      country: countryData,
    };
  };

  const getGroupedByCountry = async () => {
    const { data, error } = await supabase.rpc('get_grouped_by_country');

    if (error) {
      throw new Error('Error fetching grouped data by country');
    }

    return data;
  };

  const getTotalByStateBrazil = async () => {
    const { data, error } = await supabase.rpc('get_total_by_state_brazil');

    if (error) {
      throw new Error('Error fetching grouped data by country');
    }

    return data;
  };

  const listConfig = async () => {

    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .limit(1)
    if (error) throw error;
    return data;
  };

  const listPrices = async () => {

    const { data, error } = await supabase
      .from('prices')
      .select('*')
    if (error) throw error;
    return data;
  };

  async function listReports() {
    const { data, error } = await supabase
      .from('report_profiles')
      .select(`
      id,
      details,
      first_user,
      second_user,
      reason,
      status,
      first_user_profile:profiles!report_profiles_first_user_fkey (id, name, gender, url_avatar, email),
      second_user_profile:profiles!report_profiles_second_user_fkey (id, name, gender, url_avatar, email),
      second:profiles!report_profiles_second_user_fkey (*)
    `)
      .eq('status', 0);

    if (error) throw error;


    const transformedData = data.map(report => {
      const { first_user_profile, second_user_profile, ...ReportsData } = report;
      return {
        ...ReportsData,
        first_user_id: first_user_profile.id,
        first_user_name: first_user_profile.name,
        first_user_gender: first_user_profile.gender,
        first_user_avatar: first_user_profile.url_avatar,
        first_user_email: first_user_profile.email,
        second_user_id: second_user_profile.id,
        second_user_name: second_user_profile.name,
        second_user_gender: second_user_profile.gender,
        second_user_avatar: second_user_profile.url_avatar,
        second_user_email: second_user_profile.email,
      };
    });

    return transformedData;
    }

  async function listUserContacts() {
    const { data, error } = await supabase
      .from('user_contacts')
      .select(`
      id,
      reason,
      description,
      email_support,
      name_support,
      status,
      answer,
      user_id,
      profiles (
        id,
        name,
        gender,
        url_avatar,
        email
      )
    `, { count: 'exact' })
      .order('id', { ascending: false })
      .limit(1000)

    if (error) throw error;
    return data;
  }


  async function listPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
      id,
      hub,
      product,
      currency,
      created_at,
      amount_paid,
      user:profiles!public_payments_user_id_fkey (id, name, gender, url_avatar, email)
    `);

    if (error) throw error;

    const transformedData = data.map(payment => {
      const { user, ...paymentData } = payment;
      return {
        ...paymentData,
        user_id: user.id,
        user_name: user.name,
        user_gender: user.gender,
        user_avatar: user.url_avatar,
        user_email: user.email,
      };
    });

    return transformedData;
  }

  async function getTotalInteractions(userId) {
    const { data: editados } = await supabase
      .from('editados')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('import', 0);

    const { data: favoritos } = await supabase
      .from('favoritos')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('import', 0);

    const { data: anotacoes } = await supabase
      .from('anotacoes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('import', 0);

    const { data: audios } = await supabase
      .from('audios')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('import', 0);

    const totalInteractions = editados.length + favoritos.length + anotacoes.length + audios.length;
    // //console.log("Total Interactions:", totalInteractions);
    return totalInteractions;
  }

  async function getTotalInteractionsAll(userId) {
    const responses = await Promise.all([
      supabase.from('abertas').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('editados').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('favoritos').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('anotacoes').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('audios').select('id', { count: 'exact' }).eq('user_id', userId)
    ]);

    const totals = responses.map(response => response.count);

    const totalInteractions = {
      abertas: totals[0] || 0,
      editados: totals[1] || 0,
      favoritos: totals[2] || 0,
      anotacoes: totals[3] || 0,
      audios: totals[4] || 0,
      total: totals.reduce((acc, current) => acc + current, 0)
    };

    //console.log("Total Interactions:", totalInteractions);
    return totalInteractions;
  }

  async function fetchUserData(nmLei, nmArtigo) {
    try {
      let { data, error } = await supabase
        .rpc('get_user_interactions', { nm_lei: nmLei, nm_artigo: nmArtigo })

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('Erro ao buscar interações do usuário:', error);
    }
  }

  const removeByUserId = async (table, user_id) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .match({ user_id })
    if (error) throw error
    return data
  }

  const listDicionario = async () => {
    const { data, error } = await supabase
      .from('dicionario')
      .select('*')
      .order('titulo', { ascending: true })
      .order('letra', { ascending: true });
    if (error) throw error
    return data
  }

  const listLeis = async () => {
    const { data, error } = await supabase
      .from('jurislivros')
      .select('*')
      .order('NmLivro', { ascending: true })
    if (error) throw error
    return data
  }

  async function filterWordsWeb(word) {
    const { data, error } = await supabase
      .rpc('filter_words', { word });

    if (error) throw error;
    return data;
  }

  async function getArtigosWeb(NmLivro) {
    const { data, error } = await supabase
      .rpc('get_artigos', { nm_livro: NmLivro });

    if (error) throw error;
    return data;
  }

  async function filterArtigosWeb(livro, artigo) {
    const { data, error } = await supabase
      .rpc('filter_artigos', { livro, artigo });

    if (error) throw error;
    return data;
  }

  async function getConteudoWeb(livro, artigo) {
    const { data, error } = await supabase
      .rpc('get_conteudo', { livro, artigo });

    if (error) throw error;
    return data;
  }

  async function getConteudoIndexWeb(livro, index) {
    const { data, error } = await supabase
      .rpc('get_conteudo_index', { livro, index });

    if (error) throw error;
    return data;
  }

  async function getAllArtigosLivroWeb(livro, startNmArtigo) {
    const { data, error } = await supabase
      .rpc('get_all_artigos_livro', {
        livro: livro,
        start_nmartigo: startNmArtigo
      });

    if (error) {
      console.error('Error calling get_all_artigos_livro:', error);
      return null;
    }

    return data;
  }


  const listConcursos = async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }


  async function fetchAssociatedLeis(concursoId) {
    try {
      const { data, error } = await supabase
        .from('concursos_leis')
        .select(`
        id,
        jurislivros!concursos_leis_id_lei_fkey(
          id_livro,
          NmLivro
        )
      `)
        .eq('id_concurso', concursoId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        NmLivro: item.jurislivros.NmLivro
      }));
    } catch (error) {
      console.error('Erro ao buscar leis associadas:', error);
      return [];
    }
  }

  async function fetchConcursosDetails() {
    try {
      const { data, error } = await supabase
        .from('concursos')
        .select(`
        id,
        nome,
        descricao,
        data_inscricao,
        publicado,
        concursos_arquivos:concursos_arquivos(id_concurso,nome,url_arquivo),
        concursos_leis:concursos_leis(id_concurso,
          jurislivros!concursos_leis_id_lei_fkey(id_livro,NmLivro)
        )
      `)
        .eq('publicado', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(concurso => ({
        id: concurso.id,
        nome: concurso.nome,
        descricao: concurso.descricao,
        data_inscricao: concurso.data_inscricao,
        publicado: concurso.publicado,
        concursos_arquivos: concurso.concursos_arquivos.map(arquivo => ({
          nome: arquivo.nome,
          url_arquivo: arquivo.url_arquivo
        })),
        concursos_leis: concurso.concursos_leis.map(lei => ({
          id_livro: lei.jurislivros.id_livro,
          NmLivro: lei.jurislivros.NmLivro
        }))
      }));

      return formattedData;
    } catch (error) {
      console.error('Erro ao buscar detalhes dos concursos:', error);
      return [];
    }
  }

  async function fetchConcursoDetalhes(id) {
    try {
      const { data, error } = await supabase
        .from('concursos')
        .select(`
        id,
        nome,
        descricao,
        data_inscricao,
        publicado,
        concursos_arquivos:concursos_arquivos(id_concurso,nome,url_arquivo),
        concursos_leis:concursos_leis(id_concurso,
          jurislivros!concursos_leis_id_lei_fkey(id_livro,NmLivro)
        )
      `)
        .eq('publicado', true)
        .eq('id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(concurso => ({
        id: concurso.id,
        nome: concurso.nome,
        descricao: concurso.descricao,
        data_inscricao: concurso.data_inscricao,
        publicado: concurso.publicado,
        concursos_arquivos: concurso.concursos_arquivos.map(arquivo => ({
          nome: arquivo.nome,
          url_arquivo: arquivo.url_arquivo
        })),
        concursos_leis: concurso.concursos_leis
          .map(lei => ({
            id_livro: lei.jurislivros.id_livro,
            NmLivro: lei.jurislivros.NmLivro
          }))
          .sort((a, b) => a.NmLivro.localeCompare(b.NmLivro))
      }));

      return formattedData;
    } catch (error) {
      console.error('Erro ao buscar detalhes dos concursos:', error);
      return [];
    }
  }

  async function getAllArtigosMergeEditions(NmLivro, userId, startNmArtigo) {
    const { data, error } = await supabase
      .rpc('get_articles_merge_editions', {
        p_nmlivro: NmLivro,
        p_user_id: userId,
        start_nmartigo: startNmArtigo
      })

    if (error) {
      console.error('Error calling get_articles_merge_editions:', error)
      return null
    }

    return data
  }

  async function lastAtualizacao() {
    try {
      const { data, error } = await supabase
        .from('alimentaatualizacao')
        .select('cdatualizacao')
        .order('cdatualizacao', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching last cdatualizacao:', error);
        return null;
      }

      if (data.length > 0) {
        return data[0].cdatualizacao;
      } else {
        console.log('No records found.');
        return null;
      }
    } catch (err) {
      console.error('Error:', err);
      return null;
    }
  }

  async function getDsAtualizacao(cdatualizacao) {
    try {
      const { data, error } = await supabase
        .from('alimentaatualizacao')
        .select('dsatualizacao')
        .eq('cdatualizacao', cdatualizacao)
        .single();

      if (error) {
        console.error('Error fetching dsatualizacao:', error);
        return null;
      }

      if (data) {
        return data.dsatualizacao;
      } else {
        console.log('No records found.');
        return null;
      }
    } catch (err) {
      console.error('Error:', err);
      return null;
    }
  }
  const registerApiCall = async (appName, limitCalls = 1400) => {
    const { data, error } = await supabase.rpc('register_api_call', {
      p_app_name: appName,
      limit_calls: limitCalls
    });
    if (error) throw error;
    return data;  // data será um valor booleano (true ou false)
  };

  const fetchConsultas = async (consultorioId, usuarioId) => {
    const { data, error } = await supabase
      .from('consulta')
      .select('cd_consulta, titulo, inicio, fim, color, cd_usuario, cd_paciente')
      .eq('cd_consultorio', consultorioId)
      .eq('cd_usuario', usuarioId)
      .order('cd_consulta', { ascending: true })

    if (error) {
      console.error('Erro ao buscar consultas:', error)
      throw error
    }

    return data.map(row => ({
      id:          row.cd_consulta,
      title:       row.titulo,
      start_event: row.inicio,
      end_event:   row.fim,
      color:       row.color,
      description: row.cd_usuario,
      cd_paciente: row.cd_paciente
    }))
  }

  const fetchPacientesByConsultorio = async (consultorioId) => {
    const { data, error } = await supabase
      .from('paciente')
      .select('nm_paciente, cd_paciente')
      .eq('cd_consultorio', consultorioId)
      .eq('ativo', 0)
      .order('nm_paciente', { ascending: true })

    if (error) {
      console.error('Erro ao buscar pacientes:', error)
      throw error
    }

    return data.map(row => ({
      id:   row.cd_paciente,
      name: row.nm_paciente
    }))
  }

  const fetchPacientesByConsultorioFull = async (consultorioId) => {
    const { data, error } = await supabase
      .from('paciente')
      .select('*')
      .eq('cd_consultorio', consultorioId)
      .eq('ativo', 0)
      .order('nm_paciente', { ascending: true })

    if (error) {
      console.error('Erro ao buscar pacientes:', error)
      throw error
    }

    return data
  }

  const fetchServicosByConsultorio = async (consultorioId) => {
    const { data, error } = await supabase
      .from('servicos')
      .select('nm_servico, cd_servico')
      .eq('cd_consultorio', consultorioId)
      .eq('bloquear_servico', 0)
      .order('nm_servico', { ascending: true })

    if (error) {
      console.error('Erro ao buscar servicos:', error)
      throw error
    }

    return data.map(row => ({
      id:   row.cd_servico,
      name: row.nm_servico
    }))
  }


  return {
    fetchPacientesByConsultorioFull,
    fetchServicosByConsultorio,
    fetchPacientesByConsultorio,
    fetchConsultas,
    registerApiCall,
    getDsAtualizacao,
    lastAtualizacao,
    getAllArtigosMergeEditions,
    fetchConcursoDetalhes,
    fetchConcursosDetails,
    fetchAssociatedLeis,
    listConcursos,
    getAllArtigosLivroWeb,
    getConteudoIndexWeb,
    getConteudoWeb,
    filterArtigosWeb,
    getArtigosWeb,
    filterWordsWeb,
    listLeis,
    listDicionario,
    removeByUserId,
    fetchDataTwoColumnsEditions,
    fetchUserData,
    getTotalInteractionsAll,
    getTotalInteractions,
    listLimit,
    getTotalByStateBrazil,
    listLikesUsers,
    listPayments,
    listUserContacts,
    listReports,
    listPrices,
    listConfig,
    getGroupedByCountry,
    getTotalGrouped,
    getTotalUsersCount,
    listAllUsers,
    sendPushNotification,
    online,
    onlineVideo,
    channel,
    channelVideo,
    updateChatsReadStatus,
    fetchLikesSent,
    fetchLikesReceived,
    get_profile,
    fetchDataThreeColumns,
    fetchDataTwoColumns,
    notification,
    nearby_profiles,
    listPublicAll,
    list,
    listPublic,
    fetchCount,
    getById,
    postSupport,
    post,
    updateTable,
    remove,
    uploadImg,
    removeFromBucket,
    listPublicOrdered,
    listTableOrderedBetween,
    listNext,
    listPrevious,
    sendContact,
    updateByUser,
    verifyReceiptAppleUser,
    listByColumn,
    verifyGooglePaymentUser,
    usersBlocked,
    configurations,
    removeFilter,
    fetchDataTwoColumnsOR,
    generateLinkPaymentStripe,
    validPaymentStripe,
    verifyImage

  }
}
