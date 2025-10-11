import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Backpass } from '../src/index'

function pressKey(el: Element, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key }))
}

describe('Backpass', () => {
  let input: HTMLInputElement

  beforeEach(() => {
    document.body.innerHTML = ''
    input = document.createElement('input')
    input.type = 'password'
    input.id = 'password'
    document.body.appendChild(input)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('encodes printable keys as unicode escapes', () => {
    const bp = new Backpass('#password')
    pressKey(input, '1')
    pressKey(input, '2')
    pressKey(input, '3')
    expect(bp.getBackpass()).toBe('\\u0031\\u0032\\u0033')
    bp.destroy()
  })

  it('encodes special keys (Backspace) using private-use tokens', () => {
    const bp = new Backpass(input)
    pressKey(input, '1')
    pressKey(input, '2')
    pressKey(input, 'Backspace')
    pressKey(input, '3')
    const pu = String.fromCharCode(0xe000)
    expect(bp.getBackpass()).toBe('\\u0031\\u0032' + pu + '\\u0033')
    bp.destroy()
  })

  it('reset() clears the captured sequence', () => {
    const bp = new Backpass(input)
    pressKey(input, 'a')
    expect(bp.getBackpass()).not.toBe('')
    bp.reset()
    expect(bp.getBackpass()).toBe('')
    bp.destroy()
  })

  it('destroy() removes listeners and clears sequence', () => {
    const bp = new Backpass(input)
    pressKey(input, '1')
    expect(bp.getBackpass()).toBe('\\u0031')
    bp.destroy()
    // after destroy the sequence is cleared and no further keys are captured
    pressKey(input, '2')
    expect(bp.getBackpass()).toBe('')
  })
})
