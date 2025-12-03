import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'

// Chart.js registration for PrimeVue Chart component
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// PrimeIcons
import 'primeicons/primeicons.css'

// PrimeFlex
import 'primeflex/primeflex.css'

// Vue Flow styles - MUST be imported globally
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

// Global styles
import './styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
      cssLayer: false
    }
  },
  ripple: true
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)
app.directive('ripple', Ripple)

app.mount('#app')
