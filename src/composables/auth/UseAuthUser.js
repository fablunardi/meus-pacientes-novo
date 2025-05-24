import { ref } from 'vue'
import useSupabase from "boot/supabase";

const user = ref (null)


export default function useAuthUser(){


  const { supabase } = useSupabase()
  const login = async ({email, password})=>{

    const { user, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    return user;

  }

  const userWithBlockedAccess = async (id, t)=>{

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', id)
      .single();

    if (profileError) throw profileError;

    return profile
  }

  const loginWithSocialProvider = async (provider)=>{

    const {user, error} = await supabase.auth.signInWithOAuth({provider})
    if (error) throw error
    return user

  }

  const logout = async () => {

    const { error } = await supabase.auth.signOut()
    if (error) throw error

  }

  const isLoggedIn = () => {
    return !! user.value
  }

  const register = async ({email, password, ...meta})=>{


    const { data, error} = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: meta,
        }
      }
      )

    if (error) {
      return error.message
    } else if (data.user?.identities?.length === 0) {

      throw new Error('repeated');

    } else {
      return data
    }
  }

  const resendConfirmationEmail = async (email) => {

    const {data, error} = await supabase.functions.invoke('resendEmail', {
      body: {
        email: email
      },
    })

    if (error) throw error
    return data

  };


  const update = async (data) =>{

    const {user, error} = await supabase.auth.updateUser(data)
      if (error) throw error
      return user
    }

  const sendPasswordResetEmail = async (email) =>{

    const {user, error} = await supabase.auth.resetPasswordForEmail(email, {redirectTo: `${window.location.origin}/auth/reset-password`,})
      if (error) throw error
      return user

  }


  const resetPassword = async (token, type, email, newPassword)=>{

    await supabase.auth.verifyOtp({
      email: email,
      token:token,
      type:type
    })

    const {user, error} = await  supabase.auth.updateUser(
      {
        password: newPassword
      }
      )

    if (error) throw error
    return user
  }

  async function checkAndRefreshToken() {
    const getSession = await supabase.auth.getSession()

    const session = getSession.data.session
    if (session) {
      const currentTime = Math.floor(Date.now() / 1000);
      const expTime = session.access_token.split('.')[1];
      const { exp } = JSON.parse(atob(expTime));

      if (exp - currentTime < 60 * 5) {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Erro ao renovar o token de acesso:', error);
        }
      }
    }
  }


  return {
    resendConfirmationEmail,
    checkAndRefreshToken,
    user,
    userWithBlockedAccess,
    login,
    loginWithSocialProvider,
    logout,
    isLoggedIn,
    register,
    update,
    sendPasswordResetEmail,
    resetPassword
  }
}
