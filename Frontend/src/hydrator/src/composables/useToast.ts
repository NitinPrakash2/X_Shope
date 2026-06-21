import { ref } from 'vue'

interface Toast {
  show: boolean
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const toast = ref<Toast>({
  show: false,
  type: 'info',
  message: ''
})

export const useToast = () => {
  const showToast = (type: Toast['type'], message: string) => {
    toast.value = { show: true, type, message }
  }

  const hideToast = () => {
    toast.value.show = false
  }

  return {
    toast,
    showToast,
    hideToast
  }
}
