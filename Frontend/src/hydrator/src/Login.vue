<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="logo-section">
        <div class="logo-icon">
          <ShoppingBag :size="40" />
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
          <Zap :size="24" />
        </div>
        <h3 class="feature-title">Instant Setup</h3>
        <p class="feature-desc">Connect and start selling in minutes</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon blue">
          <TrendingUp :size="24" />
        </div>
        <h3 class="feature-title">Reach Millions</h3>
        <p class="feature-desc">Access X's massive user base</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon green">
          <RefreshCw :size="24" />
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
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f9fafb;
  gap: 40px;
}

.auth-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: #4f46e5;
  color: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.logo-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: #111827;
}

.tagline {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.connect-section {
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #111827;
}

.section-description {
  color: #6b7280;
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
  border: none;
  background: #000;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s;
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.connect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-top: 16px;
  color: #6b7280;
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
  background: white;
  border: 1px solid #e5e7eb;
  padding: 24px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.feature-icon.purple {
  background: #4f46e5;
}

.feature-icon.blue {
  background: #3b82f6;
}

.feature-icon.green {
  background: #10b981;
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #111827;
}

.feature-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}
</style>
