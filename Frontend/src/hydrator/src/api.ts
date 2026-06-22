import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 – clear stale tokens and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // Only redirect if not already on login/callback page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/callback')) {
        window.location.href = '/xshop/login'
      }
    }
    return Promise.reject(error)
  }
)

export const xshop = {
  // Auth
  register: (email: string, password: string, full_name: string) =>
    api.post('/client-public/api/i/ona/xshop', { action: 'register', email, password, full_name }),
  
  login: (email: string, password: string) =>
    api.post('/client-public/api/i/ona/xshop', { action: 'login', email, password }),
  
  logout: () =>
    api.post('/client/api/i/ona/xshop', { action: 'logout' }),
  
  me: () =>
    api.post('/client/api/i/ona/xshop', { action: 'me' }),

  // Dashboard
  getDashboard: () =>
    api.post('/client/api/i/ona/xshop', { action: 'get_dashboard' }),
  
  getAnalytics: () =>
    api.post('/client/api/i/ona/xshop', { action: 'get_analytics' }),

  // X Account
  xOAuthInit: () =>
    api.post('/client-public/api/i/ona/xshop', { action: 'x_oauth_init' }),
  
  xOAuthCallback: (code: string, state: string) =>
    api.post('/client-public/api/i/ona/xshop', { action: 'x_oauth_callback', code, state }),
  
  xAccountStatus: () =>
    api.post('/client/api/i/ona/xshop', { action: 'x_account_status' }),
  
  xAccountDisconnect: () =>
    api.post('/client/api/i/ona/xshop', { action: 'x_account_disconnect' }),

  xAccountSync: () =>
    api.post('/client/api/i/ona/xshop', { action: 'x_account_sync' }),

  // Products
  getProducts: (page = 1, limit = 20, search = '', status = '') =>
    api.post('/client/api/i/ona/xshop', { action: 'get_products', page, limit, search, status }),
  
  getProduct: (product_id: string) =>
    api.post('/client/api/i/ona/xshop', { action: 'get_product', product_id }),
  
  syncProducts: () =>
    api.post('/client/api/i/ona/xshop', { action: 'sync_products' }),
  
  getSyncLogs: (page = 1, limit = 10) =>
    api.post('/client/api/i/ona/xshop', { action: 'get_sync_logs', page, limit }),

  // Publish
  publishProduct: (product_id: string, text?: string) =>
    api.post('/client/api/i/ona/xshop', { action: 'publish_product', product_id, text: text || '' }),

  publishBulk: (product_ids: string[]) =>
    api.post('/client/api/i/ona/xshop', { action: 'publish_bulk', product_ids }),

  getPublishJobs: (page = 1, limit = 20, status = '') =>
    api.post('/client/api/i/ona/xshop', { action: 'get_publish_jobs', page, limit, status }),

  getPublishedPosts: (page = 1, limit = 20) =>
    api.post('/client/api/i/ona/xshop', { action: 'get_published_posts', page, limit }),

  retryFailedJobs: () =>
    api.post('/client/api/i/ona/xshop', { action: 'retry_failed_jobs' }),

  // Orders
  getOrders: (page = 1, limit = 20) =>
    api.post('/client/api/i/ona/xshop', { action: 'get_orders', page, limit }),

  // Store
  getStore: () =>
    api.post('/client/api/i/ona/xshop', { action: 'get_store' }),
  
  createStore: (data: any) =>
    api.post('/client/api/i/ona/xshop', { action: 'create_store', ...data }),
  
  updateStore: (data: any) =>
    api.post('/client/api/i/ona/xshop', { action: 'update_store', ...data })
}
