<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <div>
          <h1 class="page-title">X Account Connection</h1>
          <p class="page-subtitle">Connect your X (Twitter) account to start publishing</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <LoadingState v-if="loading" message="Loading account status..." />
      <ErrorState v-else-if="error" :message="error" :showRetry="true" @retry="loadStatus" />

      <div v-else class="account-content">
        <div v-if="!accountStatus.is_connected" class="connect-card">
          <div class="connect-icon">
            <Twitter :size="48" />
          </div>
          <h2 class="connect-title">Connect Your X Account</h2>
          <p class="connect-description">Link your X (Twitter) account to start publishing products and reaching millions of customers.</p>
          <button @click="connectAccount" :disabled="connecting" class="primary-btn">
            <Loader2 v-if="connecting" :size="20" class="animate-spin" />
            <Twitter v-else :size="20" />
            {{ connecting ? 'Connecting...' : 'Connect X Account' }}
          </button>
        </div>

        <div v-else class="connected-container">
          <div class="profile-card">
            <div class="profile-header">
              <div class="profile-avatar">
                <img v-if="accountStatus.profile_image_url" :src="accountStatus.profile_image_url" alt="Profile" />
                <Twitter v-else :size="32" />
              </div>
              <div class="profile-info">
                <h3 class="profile-name">{{ accountStatus.display_name || 'Unknown User' }}</h3>
                <p class="profile-username">@{{ accountStatus.username || 'unknown' }}</p>
              </div>
              <div class="profile-badge">
                <CheckCircle2 :size="20" />
                <span>Connected</span>
              </div>
            </div>

            <div class="profile-stats">
              <div class="stat-item">
                <Users :size="20" />
                <div>
                  <p class="stat-value">{{ formatNumber(accountStatus.followers_count || 0) }}</p>
                  <p class="stat-label">Followers</p>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <UserPlus :size="20" />
                <div>
                  <p class="stat-value">{{ formatNumber(accountStatus.following_count || 0) }}</p>
                  <p class="stat-label">Following</p>
                </div>
              </div>
            </div>
          </div>

          <div class="details-card">
            <h3 class="details-title">Account Details</h3>
            <div class="details-list">
              <div class="detail-item">
                <span class="detail-label">User ID</span>
                <span class="detail-value">{{ accountStatus.x_user_id || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Synced</span>
                <span class="detail-value">{{ formatDate(accountStatus.last_synced_at) }}</span>
              </div>
            </div>
          </div>

          <button @click="showDisconnectModal = true" class="danger-btn">
            <XCircle :size="18" />
            Disconnect X Account
          </button>
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
import { Twitter, CheckCircle2, XCircle, Loader2, Users, UserPlus } from 'lucide-vue-next'
import { xshop } from '../api'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'

const loading = ref(false)
const connecting = ref(false)
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-container {
  min-height: 100vh;
  background: #fcfcfd;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #111827;
}

.header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #f3f4f6;
  padding: 24px 32px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 32px;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.connect-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.01);
}

.connect-icon {
  width: 80px;
  height: 80px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.connect-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

.connect-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  background: #111827;
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 500;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.primary-btn:hover:not(:disabled) {
  background: #1f2937;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.connected-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.profile-header {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 32px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar svg {
  color: rgba(255, 255, 255, 0.8);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
}

.profile-username {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.profile-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.profile-stats {
  display: flex;
  align-items: center;
  padding: 24px 28px;
  gap: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.stat-item svg {
  color: #64748b;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #f1f5f9;
  flex-shrink: 0;
}

.details-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.details-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px 0;
  letter-spacing: -0.01em;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.danger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 24px;
  background: #ffffff;
  color: #e11d48;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.danger-btn:hover {
  background: #fff1f2;
  border-color: #fecaca;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  .profile-stats {
    flex-direction: column;
    gap: 16px;
  }
  .stat-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
