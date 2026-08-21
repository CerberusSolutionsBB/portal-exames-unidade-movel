<template>
  <v-container fluid class="stage">
    <v-card class="cerberus-card">
      <div class="panel">
        <div class="unit-tag">
          <span class="unit-name">Unidade Móvel 121</span>
          <span class="unit-cnes">CNES: 8496234</span>
        </div>
        <h2>Resultado do exame</h2>

        <div class="status-note">
          <p>{{ message }}</p>
        </div>

        <v-btn class="logout-btn" variant="outlined" color="primary" @click="onLogout">
          Sair
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/AuthService'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const message = ref('Resultado de exame ainda não disponível.')

onMounted(async () => {
  try {
    const data = await AuthService.status()
    message.value = data.message
  } catch {
    await auth.reset()
    router.push({ name: 'login' })
  }
})

async function onLogout(): Promise<void> {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.stage {
  max-width: 480px;
  padding: clamp(16px, 4vw, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.cerberus-card {
  width: 100%;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 30px 60px -30px rgba(28, 43, 107, 0.18);
  border: 1px solid rgb(var(--v-theme-line));
}

.panel {
  padding: clamp(28px, 6vw, 48px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.unit-tag {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.unit-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
}

.unit-cnes {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
  color: rgb(var(--v-theme-muted));
}

h2 {
  font-size: clamp(24px, 2.6vw, 30px);
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  margin: 0;
}

.status-note {
  width: 100%;
  background: rgb(var(--v-theme-accent-soft));
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 8px;
  padding: 14px 16px;
}

.status-note p {
  margin: 0;
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  font-size: 15.5px;
  line-height: 1.4;
}

.logout-btn {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 700;
}
</style>
