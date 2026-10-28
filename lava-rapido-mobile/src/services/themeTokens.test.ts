import assert from 'node:assert/strict'
import test from 'node:test'
import { darkTheme, lightTheme } from '../theme/themeTokens.ts'

function relativeLuminance(hex: string) {
  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset + 1, offset + 3), 16) / 255)
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

test('dark theme uses the required surfaces and semantic aliases', () => {
  assert.equal(darkTheme.background, '#0F172A')
  assert.equal(darkTheme.card, '#151F32')
  assert.equal(darkTheme.surfaceElevated, '#1D3048')
  assert.equal(darkTheme.inputBackground, '#111827')
  assert.equal(darkTheme.primary, '#1565C0')
  assert.equal(darkTheme.textPrimary, '#F8FAFC')
  assert.equal(darkTheme.placeholder, '#9AA8BD')
  assert.equal(darkTheme.tabBarBackground, '#151F32')
  assert.equal(darkTheme.modalBackground, '#151F32')
  assert.notEqual(darkTheme.background, darkTheme.card)
  assert.notEqual(darkTheme.card, darkTheme.surfaceElevated)
})

test('dark theme text, fields, actions and status colors meet WCAG AA', () => {
  const checks: Array<[string, string, string]> = [
    ['primary text', darkTheme.textPrimary, darkTheme.background],
    ['secondary text', darkTheme.textSecondary, darkTheme.background],
    ['placeholder', darkTheme.placeholder, darkTheme.inputBackground],
    ['input text', darkTheme.text, darkTheme.inputBackground],
    ['primary action text', darkTheme.primaryText, darkTheme.primary],
    ['icon', darkTheme.iconPrimary, darkTheme.background],
    ['secondary icon', darkTheme.iconSecondary, darkTheme.background],
    ['error', darkTheme.errorText, darkTheme.errorBackground],
    ['success', darkTheme.successText, darkTheme.successBackground],
    ['warning', darkTheme.warningText, darkTheme.warningBackground],
  ]

  for (const [name, foreground, background] of checks) {
    assert.ok(contrastRatio(foreground, background) >= 4.5, `${name} contrast is below WCAG AA`)
  }
})

test('light theme keeps the existing primary appearance', () => {
  assert.equal(lightTheme.background, '#F4F7FB')
  assert.equal(lightTheme.card, '#FFFFFF')
  assert.equal(lightTheme.primary, '#1565C0')
  assert.equal(lightTheme.text, '#0D1B3E')
  assert.equal(lightTheme.textSecondary, '#4A5568')
  assert.equal(lightTheme.border, '#DDE4EF')
  assert.equal(lightTheme.mapAttributionBackground, 'rgba(255,255,255,.94)')
  assert.equal(lightTheme.mapShadow, 'rgba(13,27,62,.25)')
})
