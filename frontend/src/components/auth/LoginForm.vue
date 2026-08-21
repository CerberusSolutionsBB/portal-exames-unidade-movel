<template>
  <v-form class="login-form" @submit.prevent="onSubmit">
    <div class="field-row">
      <div class="field">
        <label for="acesso-cpf" class="field-label">Login</label>
        <v-text-field
          id="acesso-cpf"
          v-model="cpfModel"
          :error="!!cpfError"
          :error-messages="cpfError ? [cpfError] : []"
          placeholder="000.000.000-00"
          maxlength="14"
          inputmode="numeric"
          autocomplete="off"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          aria-live="polite"
        />
      </div>

      <div class="field">
        <label for="acesso-nascimento" class="field-label">Senha</label>
        <v-text-field
          id="acesso-nascimento"
          v-model="dateModel"
          :error="!!dateError"
          :error-messages="dateError ? [dateError] : []"
          placeholder="DD/MM/AAAA"
          maxlength="10"
          inputmode="numeric"
          autocomplete="off"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          aria-live="polite"
        />
      </div>
    </div>

    <v-btn
      type="submit"
      :loading="isLoading"
      class="submit-btn"
      variant="outlined"
      color="primary"
      block
    >
      Acessar exame
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAccess, isValidCpf, isValidDate } from '@/composables/useAccess'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ success: [message: string] }>()

const auth = useAuthStore()
const { cpfModel, dateModel } = useAccess()

const cpfError = ref('')
const dateError = ref('')

const isLoading = computed(() => auth.isLoading)

function onSubmit(): void {
  cpfError.value = ''
  dateError.value = ''

  if (!isValidCpf(cpfModel.value)) {
    cpfError.value = 'Informe um CPF válido.'
  }

  if (!isValidDate(dateModel.value)) {
    dateError.value = 'Informe uma data de nascimento válida.'
  }

  if (cpfError.value || dateError.value) {
    focusFirstInvalid()
    return
  }

  void submit()
}

async function submit(): Promise<void> {
  const ok = await auth.login({
    cpf: cpfModel.value,
    nascimento: dateModel.value,
  })

  if (ok) {
    emit('success', auth.message ?? '')
  } else {
    cpfError.value = auth.fieldErrors.cpf ?? ''
    dateError.value = auth.fieldErrors.nascimento ?? ''
    focusFirstInvalid()
  }
}

function focusFirstInvalid(): void {
  const id = cpfError.value ? 'acesso-cpf' : 'acesso-nascimento'
  document.getElementById(id)?.focus()
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-ink-soft));
  margin-bottom: 6px;
}

.submit-btn {
  margin-top: 6px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: normal;
  border-width: 2px;
}

:deep(.v-field) {
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface-2));
  box-shadow: none;
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 1;
  color: rgb(var(--v-theme-line));
}

:deep(.v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-primary));
}

:deep(.v-field--error .v-field__outline) {
  color: rgb(var(--v-theme-error));
}

:deep(.v-field--error) {
  background-color: rgb(var(--v-theme-error-soft));
}

@media (max-width: 520px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
