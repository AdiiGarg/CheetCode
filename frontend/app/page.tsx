'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [level, setLevel] = useState('beginner');

  async function analyze() {
    const res = await axios.post('http://localhost:3001/analyze', {
      problem,
      code,
      level,
    });
    setResult(res.data.result);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>CheetCode 🐆</h1>

      <select onChange={e => setLevel(e.target.value)}>
        <option>beginner</option>
        <option>intermediate</option>
        <option>advanced</option>
      </select>

      <textarea placeholder="Problem" onChange={e => setProblem(e.target.value)} />
      <textarea placeholder="Your Code" onChange={e => setCode(e.target.value)} />

      <button onClick={analyze}>Analyze</button>

      <pre>{result}</pre>
    </main>
  );
}
