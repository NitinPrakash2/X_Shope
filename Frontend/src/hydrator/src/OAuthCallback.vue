<template>
  <div class="callback-container">
    <div class="callback-card">
      <div class="status-icon">
        <Loader2 v-if="processing" :size="60" class="spinner" />
        <CheckCircle2 v-else-if="success" :size="60" class="success-icon" />
        <XCircle v-else-if="error" :size="60" class="error-icon" />
      </div>

      <div class="status-content">
        <h2 v-if="processing">Completing Authentication...</h2>
        <h2 v-else-if="success">Successfully Connected!</h2>
        <h2 v-else-if="error">Authentication Failed</h2>

        <p v-if="processing">Please wait while we connect your X account</p>
        <p v-else-if="success">Redirecting to dashboard...</p>
        <p v-else-if="error">{{ errorMessage }}</p>

        <button v-if="error" @click="retry" class="btn-retry">
          <RefreshCw :size="18" />
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-vue-next';

const navigate = (window as any).xshopNavigate;

const processing = ref(true);
const success = ref(false);
const error = ref(false);
const errorMessage = ref('');

const handleCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const errorParam = urlParams.get('error');

  console.log('OAuth Callback:', { code, state, error: errorParam });

  if (errorParam) {
    processing.value = false;
    error.value = true;
    errorMessage.value = 'Authentication cancelled or denied.';
    return;
  }

  if (!code || !state) {
    processing.value = false;
    error.value = true;
    errorMessage.value = 'Invalid callback parameters.';
    return;
  }

  try {
    console.log('Calling backend callback...');
    const response = await fetch('http://localhost:8000/client-public/api/i/ona/xshop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'x_oauth_callback', code, state })
    });

    const data = await response.json();
    console.log('Backend response:', data);

    if (data.status === 'success' && data.output.access_token) {
      console.log('Token received, saving...');
      localStorage.setItem('access_token', data.output.access_token);
      if (data.output.refresh_token) {
        localStorage.setItem('refresh_token', data.output.refresh_token);
      }
      console.log('Tokens saved:', { 
        access: !!localStorage.getItem('access_token'),
        refresh: !!localStorage.getItem('refresh_token')
      });

      processing.value = false;
      success.value = true;

      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        window.location.href = '/xshop';
      }, 1000);
    } else {
      throw new Error(data.detail || data.message || 'Authentication failed');
    }
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    processing.value = false;
    error.value = true;
    errorMessage.value = err.message || 'Failed to complete authentication.';
  }
};

const retry = () => {
  navigate('/xshop/login');
};

onMounted(() => {
  handleCallback();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fcfcfd;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.callback-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.status-icon {
  margin-bottom: 24px;
}

.spinner {
  color: #4f46e5;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-icon {
  color: #059669;
}

.error-icon {
  color: #e11d48;
}

.status-content h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.status-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #111827;
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-retry:hover {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
</style>
