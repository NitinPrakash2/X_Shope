<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-section">
        <div class="logo-icon">
          <ShoppingBag :size="36" />
        </div>
        <h1 class="logo-title">X Shop</h1>
        <p class="tagline">Sell products on X (Twitter)</p>
      </div>

      <div class="connect-section">
        <h2 class="section-title">Get Started</h2>
        <p class="section-description">Connect your X account to start selling</p>

        <button @click="connectWithX" class="connect-btn" :disabled="connecting">
          <Loader2 v-if="connecting" :size="20" class="animate-spin" />
          <Twitter v-else :size="20" />
          <span>{{ connecting ? 'Connecting...' : 'Continue with X' }}</span>
        </button>

        <div v-if="error" class="error-message">
          <AlertCircle :size="16" />
          {{ error }}
        </div>

        <div class="security-note">
          <Shield :size="16" />
          <span>Secure OAuth 2.0 authentication</span>
        </div>
      </div>
    </div>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon purple">
          <Zap :size="22" />
        </div>
        <h3 class="feature-title">Instant Setup</h3>
        <p class="feature-desc">Connect and start selling in minutes</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon blue">
          <TrendingUp :size="22" />
        </div>
        <h3 class="feature-title">Reach Millions</h3>
        <p class="feature-desc">Access X's massive user base</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon green">
          <RefreshCw :size="22" />
        </div>
        <h3 class="feature-title">Auto Sync</h3>
        <p class="feature-desc">Products sync automatically</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ShoppingBag, Loader2, Twitter, AlertCircle, Shield, Zap, TrendingUp, RefreshCw } from 'lucide-vue-next';

const connecting = ref(false);
const error = ref('');

const connectWithX = async () => {
  connecting.value = true;
  error.value = '';

  try {
    const response = await fetch('http://localhost:8000/client-public/api/i/ona/xshop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'x_oauth_init' })
    });
    
    const data = await response.json();
    
    if (data.status === 'success' && data.output.oauth_url) {
      window.location.href = data.output.oauth_url;
    } else {
      error.value = 'Failed to connect. Try again.';
      connecting.value = false;
    }
  } catch (err) {
    error.value = 'Connection failed. Check backend.';
    connecting.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #fcfcfd;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  gap: 40px;
}

.auth-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 48px 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.04);
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: #111827;
  color: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.logo-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.tagline {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.connect-section {
  text-align: center;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #0f172a;
}

.section-description {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 24px 0;
}

.connect-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  border: 1px solid transparent;
  background: #111827;
  color: #ffffff;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.connect-btn:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #e11d48;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  margin-top: 16px;
  color: #64748b;
  font-size: 12px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
  width: 100%;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}

.feature-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  padding: 28px 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #e2e8f0;
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #ffffff;
}

.feature-icon.purple { background: #4f46e5; }
.feature-icon.blue { background: #3b82f6; }
.feature-icon.green { background: #10b981; }

.feature-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #0f172a;
}

.feature-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
</style>
