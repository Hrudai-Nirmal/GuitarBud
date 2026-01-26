import React, { useState } from 'react'
import styles from './SongEditor.module.css'
import { transposeChordPro } from '../utils/chords'

export default function SongEditor({ initial = '', onSave }) {
  const [text, setText] = useState(initial)
  const [semitones, setSemitones] = useState(0)

  function save() {
    if (onSave) onSave({ content: text })
  }

  return (
    <div className={styles.editor}>
      <div>
        <label>Transpose</label>
        <input type="number" value={semitones} onChange={(e) => setSemitones(Number(e.target.value))} />
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} />
      <div>
        <button onClick={save}>Save</button>
      </div>
      <h4>Preview</h4>
      <pre className={styles.preview}>{transposeChordPro(text, semitones)}</pre>
    </div>
  )
}
