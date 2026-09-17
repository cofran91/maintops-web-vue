<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowLeft, mdiHomeOutline, mdiLockAlertOutline, mdiLogoutVariant, mdiWrenchCogOutline } from '@mdi/js'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mobileDrawer = ref(false)
const userName = computed(() => authStore.user?.name || 'Usuario MaintOps')
const userInitials = computed(() => userName.value.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase())
const requestedResource = computed(() => typeof route.query.resource === 'string' ? route.query.resource : 'esta sección')
const signOut = async () => {
  await authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="forbidden-shell">
    <AppSidebar :mobile-open="mobileDrawer" @close="mobileDrawer = false" @sign-out="signOut" />
    <AppTopbar :user-initials="userInitials" :user-name="userName" context="Control de acceso" @open-menu="mobileDrawer = true" />
    <v-main class="forbidden-main">
      <section class="forbidden-card">
        <span class="forbidden-card__icon"><v-icon :icon="mdiLockAlertOutline" size="34" /></span>
        <span class="forbidden-card__eyebrow">Control de acceso</span>
        <h1>Acceso restringido</h1>
        <p>Tu rol actual no tiene permisos para consultar {{ requestedResource.toLowerCase() }}.</p>
        <div class="forbidden-card__actions">
          <v-btn color="primary" @click="router.push({ name: 'dashboard' })"><v-icon :icon="mdiHomeOutline" class="mr-2" size="17" />Ir al dashboard</v-btn>
          <v-btn variant="outlined" @click="router.go(-1)"><v-icon :icon="mdiArrowLeft" class="mr-2" size="17" />Volver</v-btn>
        </div>
        <small><v-icon :icon="mdiWrenchCogOutline" size="14" /> MaintOps protege la información según el rol asignado.</small>
      </section>
    </v-main>
  </div>
</template>

<style scoped lang="scss">
.forbidden-main {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: calc(100vh - 76px);
  padding: 36px;
}

.forbidden-card {
  align-items: center;
  background: #fff;
  border: 1px solid #e6ebf3;
  border-radius: 22px;
  box-shadow: 0 18px 50px rgba(45, 69, 109, .08);
  display: flex;
  flex-direction: column;
  max-width: 540px;
  padding: 44px 36px;
  text-align: center;
  width: 100%;
}

.forbidden-card__icon {
  align-items: center;
  background: #fff0f1;
  border-radius: 18px;
  color: #d45d6b;
  display: inline-flex;
  height: 68px;
  justify-content: center;
  margin-bottom: 20px;
  width: 68px;
}

.forbidden-card__eyebrow {
  color: #d45d6b;
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.forbidden-card h1 {
  color: #1c2a45;
  font-size: 2rem;
  letter-spacing: -.04em;
  margin: 8px 0;
}

.forbidden-card p {
  color: #7b899f;
  line-height: 1.6;
  margin: 0;
}

.forbidden-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 26px;
}

.forbidden-card small {
  color: #9aa5b6;
  margin-top: 28px;
}

@media (max-width: 600px) {
  .forbidden-main { padding: 20px; }
  .forbidden-card { padding: 32px 22px; }
  .forbidden-card__actions { flex-direction: column; width: 100%; }
}
</style>
