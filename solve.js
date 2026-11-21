const COMMA = 44;
const QUOTE = 34;
const LF = 10;
const CR = 13;

export function run(input) {
  const text = String(input.text);
  const hasHeader = input.header === true;
  const end = text.length;
  const delimiters = /[,\r\n]/g;
  const escapes = /""|\r\n?|\n/g;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = 0;
  let position = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;

  while (position < end) {
    const first = text.charCodeAt(position);
    if (first === LF || (first === CR && text.charCodeAt(position + 1) === LF)) {
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

      if (text.charCodeAt(start) === QUOTE) {
        let quote = text.indexOf('"', start + 1);
        while (quote !== -1 && text.charCodeAt(quote + 1) === QUOTE) {
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
        delimiters.lastIndex = start;
        boundary = delimiters.test(text) ? delimiters.lastIndex - 1 : end;
        if (boundary > start) {
          value += text.slice(start, boundary);
          keepsSuffix = true;
        }
        delimiter = text.charCodeAt(boundary);
        if (delimiter !== CR || text.charCodeAt(boundary + 1) === LF) break;
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
