import { createClient} from "@supabase/supabase-js";
import useAuthUser from "src/composables/auth/UseAuthUser";

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

supabase.auth.onAuthStateChange(async(event, session) => {

  const { user } = useAuthUser()
  user.value = session?.user || null
})

export default function useSupabase (){

  return { supabase }

}

