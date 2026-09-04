const fs = require('fs')

/**
 * Map hardcoded palette classes onto the semantic tokens.
 *
 * The mapping is by meaning, not by hue: green reads as success, orange/amber
 * as warning, red/rose as destructive, and the blue/indigo/purple family as the
 * brand primary. Slate is the neutral ramp and splits by usage — dim text,
 * body text, muted surfaces, borders.
 */
const RULES = [
  // Neutral text
  [/\btext-slate-(300|400|500)\b/g, 'text-muted-foreground'],
  [/\btext-gray-(300|400|500)\b/g, 'text-muted-foreground'],
  [/\btext-slate-(600|700|800|900)\b/g, 'text-foreground'],
  [/\btext-gray-(600|700|800|900)\b/g, 'text-foreground'],

  // Neutral surfaces and borders
  [/\bbg-slate-(50|100)(\/\d+)?\b/g, 'bg-muted'],
  [/\bbg-gray-(50|100)(\/\d+)?\b/g, 'bg-muted'],
  [/\bbg-slate-(200|300)(\/\d+)?\b/g, 'bg-muted'],
  [/\bborder-slate-(100|200|300)(\/\d+)?\b/g, 'border-border'],
  [/\bborder-gray-(100|200|300)(\/\d+)?\b/g, 'border-border'],
  [/\bhover:bg-slate-(50|100)(\/\d+)?\b/g, 'hover:bg-accent'],
  [/\bhover:text-slate-(600|700|800|900)\b/g, 'hover:text-foreground'],

  // Success
  [/\btext-(green|emerald)-(500|600|700|800)\b/g, 'text-success'],
  [/\bbg-(green|emerald)-(50|100)(\/\d+)?\b/g, 'bg-success-muted'],
  [/\bborder-(green|emerald)-(100|200|300)(\/\d+)?\b/g, 'border-success/30'],
  [/\bbg-(green|emerald)-(400|500|600)\b/g, 'bg-success'],

  // Warning
  [/\btext-(orange|amber|yellow)-(500|600|700|800)\b/g, 'text-warning'],
  [/\bbg-(orange|amber|yellow)-(50|100)(\/\d+)?\b/g, 'bg-warning-muted'],
  [/\bborder-(orange|amber|yellow)-(100|200|300)(\/\d+)?\b/g, 'border-warning/30'],
  [/\bbg-(orange|amber|yellow)-(400|500|600)\b/g, 'bg-warning'],

  // Destructive
  [/\btext-(red|rose)-(500|600|700|800)\b/g, 'text-destructive'],
  [/\bbg-(red|rose)-(50|100)(\/\d+)?\b/g, 'bg-destructive-muted'],
  [/\bborder-(red|rose)-(100|200|300)(\/\d+)?\b/g, 'border-destructive/30'],
  [/\bbg-(red|rose)-(400|500|600)\b/g, 'bg-destructive'],
  [/\bhover:bg-red-(50|100)(\/\d+)?\b/g, 'hover:bg-destructive-muted'],
  [/\bhover:text-red-(600|700)\b/g, 'hover:text-destructive'],

  // Brand
  [/\btext-(blue|indigo|purple|violet|cyan|teal|sky|pink)-(500|600|700|800|900)\b/g, 'text-primary'],
  [/\bbg-(blue|indigo|purple|violet|cyan|teal|sky|pink)-(50|100)(\/\d+)?\b/g, 'bg-primary/10'],
  [/\bborder-(blue|indigo|purple|violet|cyan|teal|sky|pink)-(100|200|300)(\/\d+)?\b/g, 'border-primary/30'],
  [/\bbg-(blue|indigo|purple|violet|cyan|teal|sky|pink)-(400|500|600)\b/g, 'bg-primary'],
  [/\bhover:bg-blue-(50|100)(\/\d+)?\b/g, 'hover:bg-accent'],
  [/\bhover:text-blue-(600|700)\b/g, 'hover:text-primary'],

  // Surfaces that assumed a white page
  [/\bbg-white(\/\d+)?\b/g, 'bg-card'],
  [/\bborder-white(\/\d+)?\b/g, 'border-border'],

  // Effects the design no longer uses
  [/\s*backdrop-blur-[a-z]+/g, ''],
  [/\s*shadow-3xl/g, ''],
  [/\s*hover:scale-\[?[\d.]+\]?/g, ''],
]

const files = process.argv.slice(2)
let totalChanges = 0

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const before = source
  let changes = 0

  for (const [pattern, replacement] of RULES) {
    source = source.replace(pattern, (match) => {
      changes++
      return replacement
    })
  }

  // Tidy whitespace left inside class strings.
  source = source.replace(/className=(["'`])([^"'`]*?)\1/g, (m, q, body) =>
    `className=${q}${body.replace(/\s{2,}/g, ' ').trim()}${q}`)

  if (source !== before) {
    fs.writeFileSync(file, source)
    totalChanges += changes
    console.log(`${file}: ${changes}`)
  }
}
console.log(`total: ${totalChanges}`)
