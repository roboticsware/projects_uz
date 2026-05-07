import { describe, it, expect } from 'vitest'
import i18nConfig from '../i18n/i18n.config'

describe('i18n Configuration', () => {
  const locales = ['uz', 'ko', 'en']
  const messages = i18nConfig.messages

  it('should have all supported locales', () => {
    expect(Object.keys(messages)).toEqual(expect.arrayContaining(locales))
  })

  it('should have consistent keys across all locales', () => {
    const uzKeys = flattenKeys(messages.uz)
    const koKeys = flattenKeys(messages.ko)
    const enKeys = flattenKeys(messages.en)

    expect(koKeys).toEqual(uzKeys)
    expect(enKeys).toEqual(uzKeys)
  })
})

// Helper function to get all nested keys in a flat array
function flattenKeys(obj: any, prefix = ''): string[] {
  return Object.keys(obj).reduce((res: string[], el) => {
    if (Array.isArray(obj[el])) {
      return [...res, prefix + el]
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...flattenKeys(obj[el], prefix + el + '.')]
    }
    return [...res, prefix + el]
  }, [])
}
