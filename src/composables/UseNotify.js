import { useQuasar } from 'quasar'
export default function useNotify () {
  const $q = useQuasar()

  const notifySuccess = (message) => {
    $q.notify({
      color:'primary',
      type: 'positive',
      message: message || 'All right !',
      position: "top-right",
    })
  }

  const notifyWarning = (message) => {
    $q.notify({
      type: 'warning',
      message: message || 'Warning!',
      position: "top-right",
    })
  }

  const notifyEndUsers = (message) => {
    $q.notify({
      html: true,
      type: 'warning',
      message: message || 'Warning!',
      position: "top-right",
    })
  }

  const notifyLike = (message) => {

    $q.notify({
      position:'top-right',
      color:'primary',
      icon: 'favorite',
      message: message || ('success')
    })
  }

  const notifyError = (message) => {
    $q.notify({
      type: 'negative',
      message: message || 'Failed !',
      position: "top-right",
    })
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyLike,
    notifyEndUsers
  }
}
