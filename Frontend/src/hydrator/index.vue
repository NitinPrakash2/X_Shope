<template>
  <div id="xshop-container">
    <!-- OAuth Callback Handler -->
    <OAuthCallback v-if="currentRoute === 'oauth-callback'" />
    
    <!-- Show Login if not authenticated -->
    <Login v-else-if="!isAuthenticated && currentRoute === 'login'" />
    
    <!-- Show authenticated routes with sidebar -->
    <template v-else-if="isAuthenticated">
      <div class="app-shell">
        <Sidebar :currentRoute="currentRoute" />
        <main class="main-content">
          <Dashboard v-if="currentRoute === 'dashboard'" />
          <ProductsList v-else-if="currentRoute === 'products'" />
          <OrdersList v-else-if="currentRoute === 'orders'" />
          <ProductSync v-else-if="currentRoute === 'sync'" />
          <XAccountConnection v-else-if="currentRoute === 'x-account'" />
          <StoreSettings v-else-if="currentRoute === 'settings'" />
          <div v-else class="not-found">
            <h2>Page Not Found</h2>
            <button @click="navigate('/xshop')">Go to Dashboard</button>
          </div>
        </main>
      </div>
    </template>
    
    <!-- Redirect to login if not authenticated -->
    <template v-else>
      <div class="checking-auth">
        <div class="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import type { _p_TYP, _pp_TYP } from "../shared/types";
import Login from './src/Login.vue';
import OAuthCallback from './src/OAuthCallback.vue';
import Dashboard from './src/components/Dashboard.vue';
import ProductsList from './src/components/ProductsList.vue';
import OrdersList from './src/components/OrdersList.vue';
import ProductSync from './src/components/ProductSync.vue';
import XAccountConnection from './src/components/XAccountConnection.vue';
import StoreSettings from './src/components/StoreSettings.vue';
import Sidebar from './src/components/Sidebar.vue';

const {_p, _pp} = defineProps<{
    _p: _p_TYP,
    _pp: _pp_TYP,
}>();

const isAuthenticated = ref(false);
const currentRoute = ref('login');

// Check authentication
const checkAuth = () => {
  const token = localStorage.getItem('access_token');
  isAuthenticated.value = !!token;
  if (!isAuthenticated.value && currentRoute.value !== 'login' && currentRoute.value !== 'oauth-callback') {
    currentRoute.value = 'login';
    window.history.replaceState({}, '', '/xshop/login');
  }
  console.log('Auth check:', { token: !!token, isAuth: isAuthenticated.value, route: currentRoute.value });
};

// Navigation function
const navigate = (path: string) => {
  console.log('Navigate to:', path);
  window.history.pushState({}, '', path);
  updateRoute();
};

// Logout function
const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  isAuthenticated.value = false;
  navigate('/xshop/login');
};

// Update route based on URL
const updateRoute = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  console.log('=== UPDATE ROUTE ===');
  console.log('Path:', path);
  
  // Check for OAuth callback first
  if (path.includes('/callback') || searchParams.has('code')) {
    currentRoute.value = 'oauth-callback';
    console.log('✅ Route: oauth-callback');
    return;
  }
  
  // Route mapping based on path
  if (path.includes('/login')) {
    currentRoute.value = 'login';
    console.log('✅ Route: login');
  } else if (path === '/xshop' || path === '/xshop/' || path.includes('/dashboard')) {
    currentRoute.value = 'dashboard';
    console.log('✅ Route: dashboard');
  } else if (path.includes('/products')) {
    currentRoute.value = 'products';
    console.log('✅ Route: products');
  } else if (path.includes('/orders')) {
    currentRoute.value = 'orders';
    console.log('✅ Route: orders');
  } else if (path.includes('/sync')) {
    currentRoute.value = 'sync';
    console.log('✅ Route: sync');
  } else if (path.includes('/x-account')) {
    currentRoute.value = 'x-account';
    console.log('✅ Route: x-account');
  } else if (path.includes('/settings')) {
    currentRoute.value = 'settings';
    console.log('✅ Route: settings');
  } else if (path === '/' || !path.includes('/xshop')) {
    // Root - go to login
    currentRoute.value = 'login';
    window.history.replaceState({}, '', '/xshop/login');
    console.log('✅ Root redirect to: login');
    return;
  } else {
    currentRoute.value = 'not-found';
    console.log('❌ Route: not-found');
  }
  
  checkAuth();
  console.log('Final route:', currentRoute.value, '| Auth:', isAuthenticated.value);
};

// Handle browser back/forward
window.addEventListener('popstate', () => {
  console.log('Popstate event');
  updateRoute();
});

// Expose navigate globally for child components
(window as any).xshopNavigate = navigate;
(window as any).xshopLogout = logout;

onMounted(() => {
  console.log('X Shop App Mounted - Initial URL:', window.location.pathname);
  updateRoute();
});

// Watch for route changes
watch(currentRoute, (newRoute) => {
  console.log('Current route changed to:', newRoute);
});
</script>

<style>
#xshop-container {
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}

.not-found {
  text-align: center;
  padding: 48px;
  background: white;
}

.not-found h2 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.not-found button {
  margin-top: 16px;
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.not-found button:hover {
  background: #4338ca;
}

.checking-auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  background: #ffffff;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.checking-auth p {
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
}
</style>
