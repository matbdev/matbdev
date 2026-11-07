function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Tokenize source once; generated markup never becomes input to another pass. */
export function highlightCode(code: string): string {
  const tokens =
    /(^[\t ]*(?:#|\/\/|--)[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|@\w+|\b(?:from|import|as|def|class|return|with|SELECT|FROM|WHERE|OVER|PARTITION|BY|ORDER|DESC|ASC|ROW_NUMBER|AND|OR|NOT|CREATE|TABLE|CATALOG|GRANT|TO|ON|SCHEMA|IF|EXISTS|OPTIMIZE|ZORDER|VACUUM|RETAIN|HOURS|model|type|export|const|let|function|interface)\b|\b\d+\b)/gim
  let result = ''
  let cursor = 0

  for (const match of code.matchAll(tokens)) {
    const token = match[0]
    const kind = /^[\t ]*(#|\/\/|--)/.test(token)
      ? 'comment'
      : /^["']/.test(token)
        ? 'str'
        : token.startsWith('@')
          ? 'decorator'
          : /^\d+$/.test(token)
            ? 'num'
            : 'kw'
    result += escapeHtml(code.slice(cursor, match.index))
    result += `<span class="tok-${kind}">${escapeHtml(token)}</span>`
    cursor = match.index + token.length
  }

  return result + escapeHtml(code.slice(cursor))
}
