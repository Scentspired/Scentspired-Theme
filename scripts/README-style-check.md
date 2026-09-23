# Proving typography did not change

Typography work has one hard rule: **the rendered font must not move.** If a
heading is Arial today it must be Arial afterwards. Introducing a token is
allowed; changing what an element computes to is not.

An HTML diff cannot prove this, because a token swap changes CSS rather than
markup. Two instruments cover it between them.

## 1. Declaration inventory — scriptable, run it every time

```bash
npm run fonts:check
```

Records every `font-family`, `font-size`, `font-weight`, `line-height` and
`letter-spacing` in the theme with its selector and its **resolved** value,
following `var()` one level. Adding `--font-display: 'PP Mori'` and pointing a
rule at it resolves to the same string, so it is invisible here — which is the
point. Changing `'PP Mori'` to something else is not, and fails the check.

```bash
npm run fonts:report     # what fonts exist and where
npm run fonts:baseline   # re-record, only after a change you intend
```

Verified: injecting `Arial, sans-serif` over `'PPEditorial New Ultrabold', serif`
in `footer.liquid` was caught, naming the selector and both values.

## 2. Computed-style fingerprint — browser, run at milestones

The inventory sees declarations, not the cascade. To catch a change in which
rule *wins*, capture what the browser actually computes.

With the dev server running, open `http://127.0.0.1:9292/?country=GB` and run:

```js
(() => {
  const sig = new Map();
  for (const el of document.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (['script','style','template','noscript'].includes(tag)) continue;
    const cls = (el.className && typeof el.className === 'string')
      ? el.className.trim().split(/\s+/).sort().join('.') : '';
    const key = tag + (cls ? '.' + cls : '');
    const cs = getComputedStyle(el);
    const val = [cs.fontFamily, cs.fontSize, cs.fontWeight].join('|');
    if (!sig.has(key)) sig.set(key, new Set());
    sig.get(key).add(val);
  }
  const rows = [...sig.entries()].map(([k,v]) => k + ' => ' + [...v].sort().join(' ;; ')).sort();
  let h = 0; const joined = rows.join('\n');
  for (let i = 0; i < joined.length; i++) h = (h * 31 + joined.charCodeAt(i)) | 0;
  return { signatures: rows.length, hash: h };
})()
```

Compare against `tests/parity/computed-fonts.json`. If `hash` differs, capture
the full `rows` array before and after and diff them to find which signature
moved.

## Why both

The inventory is cheap, scriptable and catches value edits. The fingerprint is
manual but catches specificity and cascade changes the inventory cannot see.
Typography work should keep the first green continuously and confirm the second
at each milestone.
