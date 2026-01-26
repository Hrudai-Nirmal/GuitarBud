// Minimal chord utilities: parse tokens like [C], [G7], transpose by semitones

const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_EQUIV = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };

function normalizeRoot(root) {
  if (!root) return null;
  // e.g. C, C#, Db
  if (FLAT_EQUIV[root]) return FLAT_EQUIV[root];
  return root;
}

function rootToIndex(root) {
  const n = normalizeRoot(root);
  return NOTE_ORDER.indexOf(n);
}

function transposeNote(root, semitones) {
  const idx = rootToIndex(root);
  if (idx === -1) return root; // unknown
  const newIdx = (idx + semitones + 12) % 12;
  return NOTE_ORDER[newIdx];
}

function transposeChordToken(token, semitones) {
  // token may be like C#m7/G
  // match root at start: letters + optional b or #
  const m = token.match(/^([A-G][b#]?)(.*)$/);
  if (!m) return token;
  const root = m[1];
  const rest = m[2] || '';
  const transRoot = transposeNote(root, semitones);
  return transRoot + rest;
}

function parseChordLine(line) {
  // return {text, chords: [{token, index}]}
  const regex = /\[([^\]]+)\]/g;
  let match;
  const chords = [];
  while ((match = regex.exec(line)) !== null) {
    chords.push({ token: match[1], index: match.index });
  }
  return { text: line.replace(/\[[^\]]+\]/g, ''), chords };
}

function transposeChordPro(chordproText, semitones) {
  // transpose content inside [ ... ]
  return chordproText.replace(/\[([^\]]+)\]/g, (m, p1) => '[' + transposeChordToken(p1, semitones) + ']');
}

export { parseChordLine, transposeChordPro, transposeChordToken };
