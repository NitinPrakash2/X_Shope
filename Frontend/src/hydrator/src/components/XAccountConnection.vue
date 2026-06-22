<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">X Account</h1>
          <p class="page-subtitle">Manage your X (Twitter) account connection</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <LoadingState v-if="loading" message="Loading account status..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadStatus" />

      <div v-else class="account-content">
        <!-- Connect Card -->
        <div v-if="!accountStatus.is_connected" class="connect-card">
          <div class="connect-card-inner">
            <div class="connect-icon-wrap">
              <div class="connect-icon-glow"></div>
              <div class="connect-icon">
                <Twitter :size="36" />
              </div>
            </div>
            <h2 class="connect-title">Connect Your X Account</h2>
            <p class="connect-desc">Link your X (Twitter) account to start publishing products and reaching millions of customers directly from your dashboard.</p>
            <button @click="connectAccount" :disabled="connecting" class="btn-primary">
              <Loader2 v-if="connecting" :size="18" class="animate-spin" />
              <Twitter v-else :size="18" />
              <span>{{ connecting ? 'Connecting...' : 'Continue with X' }}</span>
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else class="connected-container">
          <!-- Premium Profile Hero -->
          <div class="profile-hero">
            <div class="hero-bg">
              <div class="hero-gradient"></div>
              <div class="hero-pattern"></div>
            </div>
            <div class="hero-content">
              <div class="hero-avatar-wrap">
                <div class="hero-avatar-ring"></div>
                <div class="hero-avatar">
                  <img v-if="accountStatus.profile_image_url" :src="accountStatus.profile_image_url" alt="" />
                  <Twitter v-else :size="36" />
                </div>
              </div>
              <div class="hero-info">
                <h2 class="hero-name">{{ accountStatus.display_name || 'Unknown User' }}</h2>
                <p class="hero-handle">@{{ accountStatus.username || 'unknown' }}</p>
              </div>
              <div class="hero-badge">
                <div class="badge-dot"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="stats-row">
            <div class="stat-box">
              <p class="stat-num">{{ formatNumber(accountStatus.followers_count || 0) }}</p>
              <p class="stat-lbl">Followers</p>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <p class="stat-num">{{ formatNumber(accountStatus.following_count || 0) }}</p>
              <p class="stat-lbl">Following</p>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <p class="stat-num">{{ accountStatus.tweet_count || '—' }}</p>
              <p class="stat-lbl">Posts</p>
            </div>
          </div>

          <!-- Bio (if available) -->
          <div v-if="accountStatus.bio" class="bio-card">
            <p class="bio-icon">“</p>
            <p class="bio-text">{{ accountStatus.bio }}</p>
          </div>

          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-item">
              <p class="info-label">User ID</p>
              <p class="info-value mono">{{ accountStatus.x_user_id || '—' }}</p>
            </div>
            <div class="info-item">
              <p class="info-label">Last Synced</p>
              <p class="info-value">{{ formatDate(accountStatus.last_synced_at) }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions-row">
            <button @click="syncProfile" :disabled="syncing" class="btn-secondary">
              <RefreshCw :size="16" :class="{ 'animate-spin': syncing }" />
              <span>{{ syncing ? 'Syncing...' : 'Sync Profile' }}</span>
            </button>
            <button @click="showDisconnectModal = true" class="btn-danger">
              <XCircle :size="16" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :isOpen="showDisconnectModal"
      title="Disconnect X Account?"
      message="This will remove the connection to your X account. You'll need to reconnect to publish products."
      confirmText="Disconnect"
      cancelText="Cancel"
      confirmClass="danger"
      @confirm="disconnectAccount"
      @cancel="showDisconnectModal = false"
    />

    <ToastNotification :show="toast.show" :type="toast.type" :message="toast.message" @close="toast.show = false" :duration="3000" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Twitter, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'

const loading = ref(false)
const connecting = ref(false)
const syncing = ref(false)
const error = ref('')
const accountStatus = ref<any>({})
const showDisconnectModal = ref(false)
const toast = ref({ show: false, type: 'info' as any, message: '' })

const loadStatus = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await xshop.xAccountStatus()
    if (res.data?.status === 'success') {
      accountStatus.value = res.data.output
    }
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Failed to load account status'
  } finally {
    loading.value = false
  }
}

const connectAccount = async () => {
  connecting.value = true
  try {
    const res = await xshop.xOAuthInit()
    if (res.data?.status === 'success' && res.data.output.oauth_url) {
      window.location.href = res.data.output.oauth_url
    }
  } catch (e: any) {
    toast.value = { show: true, type: 'error', message: e.response?.data?.detail || 'Failed to initiate OAuth' }
    connecting.value = false
  }
}

const syncProfile = async () => {
  syncing.value = true
  try {
    const res = await xshop.xAccountSync()
    if (res.data?.status === 'success') {
      toast.value = { show: true, type: 'success', message: 'Profile synced successfully' }
      await loadStatus()
    }
  } catch (e: any) {
    toast.value = { show: true, type: 'error', message: e.response?.data?.detail || 'Failed to sync profile' }
  } finally {
    syncing.value = false
  }
}

const disconnectAccount = async () => {
  showDisconnectModal.value = false
  try {
    const res = await xshop.xAccountDisconnect()
    if (res.data?.status === 'success') {
      toast.value = { show: true, type: 'success', message: 'X account disconnected successfully' }
      loadStatus()
    }
  } catch (e: any) {
    toast.value = { show: true, type: 'error', message: e.response?.data?.detail || 'Failed to disconnect account' }
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

onMounted(() => loadStatus())
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.page-container {
  min-height: 100vh;
  background: #f8f9fc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0b1a33;
}

.header {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid #edf0f5;
  padding: 22px 36px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-content {
  max-width: 820px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0b1a33;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 13px;
  color: #6b7a99;
  margin: 0;
  font-weight: 400;
}

.content-wrapper {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 32px 64px;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ========= CONNECT CARD ========= */
.connect-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 56px 40px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,.03), 0 8px 32px -8px rgba(0,0,0,.06);
  border: 1px solid #edf0f5;
}

.connect-card-inner {
  max-width: 420px;
  margin: 0 auto;
}

.connect-icon-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.connect-icon-glow {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  opacity: .12;
  filter: blur(12px);
  transform: scale(1.25);
}

.connect-icon {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(79,70,229,.25);
}

.connect-title {
  font-size: 22px;
  font-weight: 700;
  color: #0b1a33;
  margin: 0 0 10px;
  letter-spacing: -.02em;
}

.connect-desc {
  font-size: 14px;
  color: #6b7a99;
  line-height: 1.65;
  margin: 0 0 32px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 13px 32px;
  background: #0b1a33;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all .2s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 2px 6px rgba(11,26,51,.1);
}

.btn-primary:hover:not(:disabled) {
  background: #1a2d4a;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(11,26,51,.14);
}

.btn-primary:disabled {
  opacity: .55;
  cursor: not-allowed;
  transform: none;
}

/* ========= CONNECTED — HERO ========= */
.connected-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-hero {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.03), 0 8px 32px -8px rgba(0,0,0,.07);
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a0a3e 0%, #4f46e5 40%, #7c3aed 70%, #a855f7 100%);
}

.hero-pattern {
  position: absolute;
  inset: 0;
  opacity: .12;
  background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,.2) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,.15) 0%, transparent 40%),
                    radial-gradient(circle at 50% 80%, rgba(255,255,255,.1) 0%, transparent 45%);
}

.hero-content {
  position: relative;
  padding: 40px 36px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero-avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,.35);
}

.hero-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,.15);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-avatar svg {
  color: rgba(255,255,255,.8);
  width: 36px;
  height: 36px;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: -.01em;
}

.hero-handle {
  font-size: 14px;
  color: rgba(255,255,255,.7);
  margin: 0;
}

.hero-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: rgba(255,255,255,.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 100px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74,222,128,.5);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .7; transform: scale(.85); }
}

/* ========= STATS ROW ========= */
.stats-row {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 20px;
  padding: 24px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
}

.stat-box {
  flex: 1;
  text-align: center;
}

.stat-num {
  font-size: 26px;
  font-weight: 800;
  color: #0b1a33;
  margin: 0 0 4px;
  letter-spacing: -.02em;
  line-height: 1.1;
}

.stat-lbl {
  font-size: 13px;
  color: #6b7a99;
  margin: 0;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: #edf0f5;
  flex-shrink: 0;
}

/* ========= BIO ========= */
.bio-card {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 20px;
  padding: 24px 28px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
}

.bio-icon {
  font-size: 40px;
  line-height: 1;
  color: #4f46e5;
  opacity: .25;
  margin: 0 0 -12px;
  font-family: Georgia, serif;
}

.bio-text {
  font-size: 14px;
  color: #3b4a6b;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}

/* ========= INFO GRID ========= */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7a99;
  text-transform: uppercase;
  letter-spacing: .04em;
  margin: 0 0 8px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #0b1a33;
  margin: 0;
  word-break: break-all;
}

.info-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  font-weight: 500;
  color: #4b5a7a;
}

/* ========= ACTIONS ========= */
.actions-row {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  color: #0b1a33;
  border: 1px solid #e2e6ef;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all .2s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 2px rgba(0,0,0,.02);
}

.btn-secondary:hover {
  background: #f8f9fc;
  border-color: #cdd3df;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,.04);
}

.btn-danger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all .2s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 2px rgba(0,0,0,.02);
}

.btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,.04);
}

@media (max-width: 640px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    padding: 32px 24px;
  }
  .stats-row {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  .stat-divider {
    width: 100%;
    height: 1px;
  }
  .actions-row {
    flex-direction: column;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
