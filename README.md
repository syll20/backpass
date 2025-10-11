# Backpass

Backpass is a tiny, zero-dependency library that captures typed keystrokes on password (or other) inputs and encodes them into a stable Unicode token stream. Special keys (Backspace, Delete, Arrow keys, etc.) are encoded as private-use Unicode tokens so the exact behavior (including backspaces) is preserved.

This library intentionally preserves the encoded sequence as Unicode tokens (not reconstructing the final plaintext) so downstream systems can keep the raw behavioral sequence for verification, analytics or alternate authentication flows.

Table of contents
- Features
- Install
- Quick usage
- API reference
- Why?
- Examples (Vanilla / ESM / UMD / React / Vue)
- Server-side handling and recommendations
- Publishing to npm & GitHub
- Contributing / Tests / CI
- License

Features
- Tiny, zero-dependency implementation written in TypeScript
- ESM, CJS and UMD bundles provided (dist/)
- Small, stable API: Backpass class with getBackpass/reset/destroy
- Designed to be framework-agnostic; small wrappers/plugins are trivial to add

Install

npm:

```bash
npm install backpass
```

Or use the built UMD bundle from a CDN (unpkg/jsdelivr) by including `dist/backpass.umd.js`.

Quick usage

ESM (bundler / modern apps):

```js
import { Backpass } from 'backpass'

const bp = new Backpass('#password')

// on submit
const encoded = bp.getBackpass()
// include `encoded` as `backpass` form field

// reset sequence after capture
bp.reset()

// destroy when not needed anymore
bp.destroy()
```

UMD (script tag / CDN):

```html
<script src="https://unpkg.com/backpass/dist/backpass.umd.js"></script>
<script>
  const bp = new window.Backpass('#password')
  // ... same as ESM usage
  const encoded = bp.getBackpass()
  bp.reset()
  bp.destroy()
</script>
```

API reference

class Backpass
- constructor(selectorOrElement: string | Element, options?: { debug?: boolean })
  - selectorOrElement: CSS selector string (e.g. '#password') or direct Element
  - options.debug: turn on verbose console logs for debugging

- getBackpass(): string — returns the encoded Unicode token stream (e.g. "\\u0031\\u0032...\\uE000\\u0036")
- reset(): void — clears internal sequence so subsequent captures start fresh
- destroy(): void — removes event listeners and internal references

Encoding notes
- Printable characters are encoded as `\uXXXX` hex Unicode escapes of the code point (for portability).
- Special keys are mapped to private-use code points in the U+E000.. range. Example mapping used by the library:
  - Backspace => `\uE000`
  - Delete => `\uE001`
  - ArrowLeft => `\uE002`
  - ArrowRight => `\uE003`
  - ArrowUp => `\uE004`
  - ArrowDown => `\uE005`


Why?

Why not?


Examples

Vanilla HTML (ESM example referencing built dist):

```html
<!doctype html>
<html>
  <body>
    <form id="form">
      <input id="password" type="password" />
      <input type="hidden" name="backpass" id="backpass_field" />
      <button type="submit">Submit</button>
    </form>
    <script type="module">
      import { Backpass } from './dist/index.mjs'
      const bp = new Backpass('#password')
      document.getElementById('form').addEventListener('submit', (e) => {
        document.getElementById('backpass_field').value = bp.getBackpass()
      })
    </script>
  </body>
</html>
```

React (small example using the class directly, no wrapper required):

```tsx
import { useEffect, useRef } from 'react'
import { Backpass } from 'backpass'

function Login() {
  const bpRef = useRef(null)
  useEffect(() => {
    bpRef.current = new Backpass('#password')
    return () => bpRef.current?.destroy()
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const encoded = bpRef.current?.getBackpass()
    // send encoded to server as `backpass`
    bpRef.current?.reset()
  }
}
```

Vue 3 (directive idea):

```js
import { Backpass } from 'backpass'

app.directive('backpass', {
  mounted(el, binding) {
    el._bp = new Backpass(el)
  },
  unmounted(el) { el._bp?.destroy() }
})
```

Server-side handling (important)

- Do not attempt to "reconstruct" or normalise the sequence into plaintext if you want to preserve special-key information like Backspace/Delete — keep the token stream as-is.
- Common pattern: send the `backpass` token stream as an additional form field. Your server can store it (preferably hashed) or use it for anomaly detection.
- If you must display or operate on the human-readable version, provide a separate utility that interprets the tokens while preserving semantics. However, note that reconstruction may lose information about cursor position and selection unless the library captures caret movements.

Privacy & storage guidance

- Treat `backpass` as behavioral data. Consider hashing the value before storing it and keep retention policies short.
- Add explicit user consent in UX if required by your policy/regulation.

