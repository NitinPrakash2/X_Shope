<template>
  <div class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <Twitter :size="22" />
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
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Spacer -->
    <div style="flex:1" />

    <!-- User / Logout -->
    <div class="sidebar-footer">
      <div v-if="xUsername" class="x-profile-mini">
        <img v-if="xAvatar" :src="xAvatar" alt="avatar" class="x-avatar" />
        <Twitter v-else :size="18" class="x-icon-mini" />
        <div class="x-profile-info">
          <span class="x-display">{{ xDisplayName || xUsername }}</span>
          <span class="x-handle">@{{ xUsername }}</span>
        </div>
      </div>

      <button @click="handleLogout" class="logout-btn">
        <LogOut :size="18" />
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  LayoutDashboard, Package, ShoppingCart, RefreshCw,
  Twitter, Settings, LogOut, Link2
} from 'lucide-vue-next'
import { xshop } from '../api'

const props = defineProps<{ currentRoute: string }>()

const xUsername    = ref('')
const xDisplayName = ref('')
const xAvatar      = ref('')

const navItems = [
  { route: 'dashboard',  path: '/xshop',           label: 'Dashboard',    icon: LayoutDashboard },
  { route: 'products',   path: '/xshop/products',   label: 'Products',     icon: Package },
  { route: 'orders',     path: '/xshop/orders',     label: 'Orders',       icon: ShoppingCart },
  { route: 'sync',       path: '/xshop/sync',       label: 'Product Sync', icon: RefreshCw },
  { route: 'x-account',  path: '/xshop/x-account',  label: 'X Account',    icon: Link2 },
  { route: 'settings',   path: '/xshop/settings',   label: 'Settings',     icon: Settings },
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
.sidebar {
  width: 220px;
  min-width: 220px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 4px;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 8px;
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #1d9bf0, #7856ff);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(29,155,240,0.18), rgba(120,86,255,0.18));
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(29,155,240,0.25);
}

.nav-item.active svg {
  color: #1d9bf0;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.x-profile-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(29,155,240,0.1);
  border-radius: 8px;
  border: 1px solid rgba(29,155,240,0.2);
}

.x-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.x-icon-mini {
  color: #1d9bf0;
  flex-shrink: 0;
}

.x-profile-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.x-display {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.x-handle {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  text-align: left;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>
