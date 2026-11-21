const COMMA = 44;
const QUOTE = 34;
const LF = 10;
const CR = 13;
const LITTLE_ENDIAN = new Uint8Array(Uint16Array.of(1).buffer)[0] === 1;

export function run(input) {
  const text = String(input.text);
  const hasHeader = input.header === true;
  const end = text.length;
  // Scan code units directly, then slice the original string for field values.
  const utf16 = Buffer.from(text, 'utf16le');
  if (!LITTLE_ENDIAN) utf16.swap16();
  const codes = new Uint16Array(utf16.buffer, utf16.byteOffset, end);
  const escapes = /""|\r\n?|\n/g;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = 0;
  let position = codes[0] === 0xfeff ? 1 : 0;
  let line = 1;

  while (position < end) {
    const first = codes[position];
    if (first === LF || (first === CR && codes[position + 1] === LF)) {
      position += first === LF ? 1 : 2;
      line++;
      continue;
    }

    const recordLine = line;
    const row = hasHeader && columns === null ? null : rows.length;
    const fields = [];
    let delimiter;
    do {
      let start = position;
      let value = '';
      let closed = false;

      if (codes[start] === QUOTE) {
        let quote = text.indexOf('"', start + 1);
        while (quote !== -1 && codes[quote + 1] === QUOTE) {
          quote = text.indexOf('"', quote + 2);
        }
        if (quote === -1) {
          errors.push({ code: 'unterminated_quote', line: recordLine, row });
        } else {
          value = text.slice(start + 1, quote).replace(escapes, match => {
            if (match === '""') return '"';
            line++;
            return '\n';
          });
          start = quote + 1;
          closed = true;
        }
      }

      let keepsSuffix = false;
      let boundary;
      while (true) {
        boundary = start;
        for (; boundary < end; boundary++) {
          const code = codes[boundary];
          if (code === COMMA || code === CR || code === LF) break;
        }
        if (boundary > start) {
          value += text.slice(start, boundary);
          keepsSuffix = true;
        }
        delimiter = codes[boundary];
        if (delimiter !== CR || codes[boundary + 1] === LF) break;
        errors.push({ code: 'stray_cr', line: recordLine, row });
        start = boundary + 1;
      }
      if (closed && keepsSuffix) errors.push({ code: 'quote_junk', line: recordLine, row });
      fields.push(value);

      position = boundary + 1;
      if (delimiter === LF || delimiter === CR) {
        if (delimiter === CR) position++;
        line++;
      }
    } while (delimiter === COMMA);

    if (fields.length === 1 && fields[0] === '' && first !== QUOTE) continue;
    if (width === 0) width = fields.length;
    if (row === null) {
      columns = fields;
      continue;
    }

    const count = fields.length;
    if (count < width) {
      errors.push({ code: 'short_row', line: recordLine, row, fields: count });
      fields.length = width;
      fields.fill('', count);
    } else if (count > width) {
      errors.push({ code: 'long_row', line: recordLine, row, extra: fields.splice(width) });
    }
    rows.push(fields);
  }

  return { columns: hasHeader ? (columns ?? []) : null, rows, errors };
}
