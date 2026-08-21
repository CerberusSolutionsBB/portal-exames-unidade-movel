<template>
  <v-container fluid class="stage">
    <v-card class="cerberus-card">
      <div class="panel">
        <div class="panel-head">
          <div class="unit-tag">
            <span class="unit-name">Unidade Móvel 121</span>
            <span class="unit-cnes">CNES: 8496234</span>
          </div>
          <h2>Acesse o resultado dos seus exames</h2>
          <div class="access-note">
            <p>Para acessar seu exame, complete os campos abaixo:</p>
            <dl class="access-list">
              <div><dt>Login:</dt><dd>CPF</dd></div>
              <div><dt>Senha:</dt><dd>Data de nascimento (00/00/0000)</dd></div>
            </dl>
          </div>
        </div>

        <LoginForm v-if="!successMessage" @success="onSuccess" />

        <div v-else class="success">
          <div class="success-icon">
            <v-icon icon="mdi-check" />
          </div>
          <div>
            <h3>Dados validados</h3>
            <p>CPF e data de nascimento confirmados com sucesso.</p>
          </div>
          <div class="status-note">
            <p>{{ successMessage }}</p>
          </div>
          <v-btn
            variant="text"
            color="primary"
            class="result-link"
            @click="$router.push({ name: 'resultado' })"
          >
            Consultar status do exame
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'

const successMessage = ref<string | null>(null)

function onSuccess(message: string): void {
  successMessage.value = message
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
  justify-content: center;
}

.unit-tag {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 18px;
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

.panel-head h2 {
  font-size: clamp(24px, 2.6vw, 30px);
  font-weight: 700;
  line-height: 1.15;
  color: rgb(var(--v-theme-primary));
}

.access-note {
  margin: 12px 0 28px;
  color: rgb(var(--v-theme-muted));
  font-size: 13.5px;
  line-height: 1.6;
  max-width: 42ch;
}

.access-note p {
  margin: 0 0 10px;
}

.access-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.access-list > div {
  display: flex;
  gap: 6px;
}

.access-list dt {
  margin: 0;
  font-weight: 700;
  color: rgb(var(--v-theme-ink-soft));
}

.access-list dd {
  margin: 0;
}

.success {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 12px 2px;
}

.success-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  color: rgb(var(--v-theme-on-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success h3 {
  font-size: 20px;
  color: rgb(var(--v-theme-primary));
  margin: 0;
}

.success p {
  margin: 0;
  color: rgb(var(--v-theme-muted));
  font-size: 14.5px;
  line-height: 1.55;
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

.result-link {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 600;
}
</style>
