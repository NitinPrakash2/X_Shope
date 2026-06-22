<template>
  <div class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <Twitter :size="20" stroke-width="2" />
      </div>
      <span class="brand-name">X Shop</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.route"
        @click="navigateTo(item.path)"
        :class="['nav-item', { active: currentRoute === item.route }]"
      >
        <component :is="item.icon" :size="18" stroke-width="2" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Spacer -->
    <div style="flex:1" />

    <!-- User / Logout -->
    <div class="sidebar-footer">
      <div v-if="xUsername" class="x-profile-mini">
        <img v-if="xAvatar" :src="xAvatar" alt="avatar" class="x-avatar" />
        <div v-else class="x-avatar-placeholder">
          <Twitter :size="14" />
        </div>
        <div class="x-profile-info">
          <span class="x-display">{{ xDisplayName || xUsername }}</span>
          <span class="x-handle">@{{ xUsername }}</span>
        </div>
      </div>

      <button @click="handleLogout" class="logout-btn">
        <LogOut :size="18" stroke-width="2" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  LayoutDashboard, Package, ShoppingCart, RefreshCw,
  Twitter, Settings, LogOut, Link2, ExternalLink
} from 'lucide-vue-next'
import { xshop } from '../api'

const props = defineProps<{ currentRoute: string }>()

const xUsername    = ref('')
const xDisplayName = ref('')
const xAvatar      = ref('')

const navItems = [
  { route: 'dashboard',  path: '/xshop',             label: 'Dashboard',     icon: LayoutDashboard },
  { route: 'products',   path: '/xshop/products',    label: 'Products',      icon: Package },
  { route: 'orders',     path: '/xshop/orders',      label: 'Orders',        icon: ShoppingCart },
  { route: 'sync',       path: '/xshop/sync',        label: 'Product Sync',  icon: RefreshCw },
  { route: 'published',  path: '/xshop/published',   label: 'Published',     icon: ExternalLink },
  { route: 'x-account',  path: '/xshop/x-account',   label: 'X Account',     icon: Link2 },
  { route: 'settings',   path: '/xshop/settings',    label: 'Settings',      icon: Settings },
]

const navigateTo = (path: string) => {
  const nav = (window as any).xshopNavigate
  if (nav) nav(path)
}

const handleLogout = () => {
  const logout = (window as any).xshopLogout
  if (logout) logout()
}

onMounted(async () => {
  try {
    const res = await xshop.xAccountStatus()
    if (res.data?.status === 'success' && res.data.output?.is_connected) {
      xUsername.value    = res.data.output.username    || ''
      xDisplayName.value = res.data.output.display_name || ''
      xAvatar.value      = res.data.output.profile_image_url || ''
    }
  } catch {
    // silently ignore – user may not have X connected
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: #ffffff;
  border-right: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  gap: 8px;
  overflow-y: auto;
  z-index: 100;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Brand Section */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 24px 8px;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: #0f172a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

/* Navigation Items */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: #f8fafc;
  color: #0f172a;
}

/* Modern Active State */
.nav-item.active {
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 600;
}

.nav-item.active svg {
  color: #0f172a;
}

/* Footer Section */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

/* Minimalist Profile Patch */
.x-profile-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}

.x-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.x-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.x-profile-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.x-display {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.x-handle {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Clean Logout */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.logout-btn:hover {
  background: #fff1f2;
  color: #e11d48;
}
</style>