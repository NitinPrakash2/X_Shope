import { createApp } from 'vue'
import HydratorApp from './hydrator/index.vue'

const app = createApp(HydratorApp, {
  _p: {},
  _pp: {}
})

app.mount('#app')
