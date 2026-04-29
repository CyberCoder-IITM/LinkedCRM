import Papa from 'papaparse';

export const GROQ_MODELS = 'llama-3.3-70b-versatile';

export const PHASES = {
  not_started: { label: 'Not Started', color: '#555570' },
  warmup: { label: 'Warm-up', color: '#f7a94f' },
  active: { label: 'Active', color: '#4f6ef7' },
  referral_asked: { label: 'Referral Asked', color: '#a855f7' },
  success: { label: 'Success', color: '#22c55e' },
  paused: { label: 'Paused', color: '#ef4444' },
};

export const ROLES = ['Engineer', 'Recruiter', 'Hiring Manager', 'Manager', 'Founder', 'Other'];

export function scoreConnection(c) {
  const warmth = (c.warmth || 1) * 20;
  const relevance = (c.relevance || 1) * 20;
  const daysSince = c.lastContact
    ? Math.max(0, (Date.now() - new Date(c.lastContact).getTime()) / 86400000)
    : 365;
  const recency = Math.max(0, 100 - daysSince * 0.5);
  const roleBonus = c.roleType === 'Recruiter' || c.roleType === 'Hiring Manager' ? 15 : 0;
  const total = Math.round((warmth * 0.3 + relevance * 0.4 + recency * 0.2 + roleBonus) / 1.05);
  return Math.min(100, total);
}

export function parseLinkedInCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const connections = results.data
          .filter(row => row['First Name'] || row['first name'] || row['FirstName'])
          .map((row, i) => {
            const firstName = row['First Name'] || row['first name'] || row['FirstName'] || '';
            const lastName = row['Last Name'] || row['last name'] || row['LastName'] || '';
            const company = row['Company'] || row['company'] || row['Current Company'] || '';
            const position = row['Position'] || row['position'] || row['Job Title'] || row['Title'] || '';
            const email = row['Email Address'] || row['email'] || row['Email'] || '';
            const connectedOn = row['Connected On'] || row['connected_on'] || row['Connection Date'] || '';
            return {
              id: `li_${i}_${Date.now()}`,
              name: `${firstName} ${lastName}`.trim(),
              company,
              position,
              email,
              connectedOn,
              roleType: guessRoleType(position),
              warmth: 2,
              relevance: 2,
              lastContact: null,
              phase: 'not_started',
              notes: '',
              messages: [],
              targetCompany: false,
            };
          });
        resolve(connections);
      },
      error: reject,
    });
  });
}

function guessRoleType(position = '') {
  const p = position.toLowerCase();
  if (p.includes('recruit') || p.includes('talent') || p.includes('hr ') || p.includes('people')) return 'Recruiter';
  if (p.includes('hiring manager') || p.includes('engineering manager') || p.includes(' manager')) return 'Manager';
  if (p.includes('founder') || p.includes('ceo') || p.includes('cto') || p.includes('vp ')) return 'Founder';
  if (p.includes('engineer') || p.includes('developer') || p.includes('dev ') || p.includes('swe')) return 'Engineer';
  return 'Other';
}

export function saveToStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
}

export function loadFromStorage(key, fallback) {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}

export async function callGroq(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODELS,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

export function getSentiment(text = '') {
  const t = text.toLowerCase();
  const pos = ['happy', 'great', 'sure', 'love', 'yes', 'absolutely', 'definitely', 'thanks', 'appreciate', 'connect', 'chat', 'call', 'coffee', 'interesting', 'glad', 'excited', 'open', 'would love'];
  const neg = ['busy', 'not interested', 'no thanks', 'not looking', 'not right now', 'sorry', 'can\'t', 'cannot', 'unfortunately', 'decline', 'not available'];
  const posScore = pos.filter(w => t.includes(w)).length;
  const negScore = neg.filter(w => t.includes(w)).length;
  if (posScore > negScore) return 'positive';
  if (negScore > posScore) return 'negative';
  return 'neutral';
}
