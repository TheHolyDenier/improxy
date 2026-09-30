import { afterEach } from 'vitest'
import { config } from '@vue/test-utils'
import { i18n } from '@/i18n'

config.global.plugins = [i18n]

afterEach(() => {
  document.body.innerHTML = ''
})
