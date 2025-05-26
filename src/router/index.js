import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import useSupabase from 'src/boot/supabase'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const { supabase } = useSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (to.meta.requiresAuth && !user) {
      next({ name: 'login' })
    } else if (to.name === 'login' && user) {
      next({ name: 'consults' })
    } else {
      next()
    }
  })

  return Router
})
