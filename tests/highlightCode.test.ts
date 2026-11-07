import assert from 'node:assert/strict'
import { test } from 'node:test'
import { highlightCode } from '../src/components/skills/highlightCode.ts'

test('escapes HTML and ampersands before rendering snippet content', () => {
  assert.equal(
    highlightCode('<img src=x onerror=alert(1)> &'),
    '&lt;img src=x onerror=alert(<span class="tok-num">1</span>)&gt; &amp;',
  )
})

test('keeps keywords, decorators and numbers inside strings in a single token', () => {
  assert.equal(
    highlightCode('const x = "class @model 42"'),
    '<span class="tok-kw">const</span> x = <span class="tok-str">"class @model 42"</span>',
  )
})

test('escapes comments without highlighting their contents again', () => {
  assert.equal(
    highlightCode('  // SELECT "value" <script> & 10'),
    '<span class="tok-comment">  // SELECT "value" &lt;script&gt; &amp; 10</span>',
  )
})

test('preserves newlines and highlights SQL, decorators and numeric tokens', () => {
  assert.equal(
    highlightCode('@task\nSELECT 42'),
    '<span class="tok-decorator">@task</span>\n<span class="tok-kw">SELECT</span> <span class="tok-num">42</span>',
  )
})

test('handles escaped quotes as part of a string and preserves plain text', () => {
  assert.equal(
    highlightCode('"say \\"class\\""\nplain & text'),
    '<span class="tok-str">"say \\"class\\""</span>\nplain &amp; text',
  )
  assert.equal(highlightCode(''), '')
})
