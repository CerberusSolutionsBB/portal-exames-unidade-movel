import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const cerberusLight = {
  dark: false,
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    'surface-2': '#eef1fa',
    ink: '#1a1d2b',
    'ink-soft': '#454a63',
    muted: '#6b7191',
    line: '#e2e5f0',
    primary: '#1c2b6b',
    'on-primary': '#ffffff',
    'accent-soft': '#dbe1f7',
    success: '#2f7a5c',
    error: '#a3392b',
    'error-soft': '#f6dfd8',
    secondary: '#454a63',
    info: '#1c2b6b',
    warning: '#a3392b',
  },
  variables: {
    'border-color': '#e2e5f0',
    'high-emphasis-opacity': 1,
  },
}

const cerberusDark = {
  dark: true,
  colors: {
    background: '#0a0d18',
    surface: '#10142a',
    'surface-2': '#161b36',
    ink: '#e9ebf6',
    'ink-soft': '#c3c7e2',
    muted: '#8b91ba',
    line: '#262c4c',
    primary: '#5470e0',
    'on-primary': '#0a0d18',
    'accent-soft': '#202a5e',
    success: '#4fae8a',
    error: '#e2897c',
    'error-soft': '#3a211c',
    secondary: '#c3c7e2',
    info: '#5470e0',
    warning: '#e2897c',
  },
  variables: {
    'border-color': '#262c4c',
    'high-emphasis-opacity': 1,
  },
}

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'cerberusLight',
    themes: {
      cerberusLight,
      cerberusDark,
    },
  },
})
