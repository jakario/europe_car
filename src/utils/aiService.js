/**
 * NVIDIA NIM AI Service
 * Dev: Vite proxy /api/chat → NVIDIA API
 * Production (Vercel): /api/chat → Vercel serverless function → NVIDIA API
 * API Key lives only on the server side — never exposed to the browser.
 */

import db from '../data/db.json';

// Always call our own backend endpoint (works both locally and on Vercel)
const API_URL = '/api/chat';

const MODEL = import.meta.env.VITE_NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct';

// Key is handled server-side; this is only used to show UI status
const ENV_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || '';

/** Returns true if key is configured (for UI indicator only) */
export function getEnvApiKey() {
  return ENV_API_KEY;
}

function buildSystemPrompt() {
  const symptomList = db.symptoms.map(s =>
    `- [${s.category}] ${s.code}: ${s.symptom} → แก้ไข: ${s.solution} (พบใน: ${s.brands?.join(', ') || 'ทั่วไป'})`
  ).join('\n');

  const partsList = db.parts.map(p =>
    `- ${p.name}: ตำแหน่ง ${p.location} (หมายเหตุ: ${p.notes})`
  ).join('\n');

  const maintenanceList = db.maintenance.map(m =>
    `- ${m.interval}: ${m.items} (${m.notes})`
  ).join('\n');

  const brandList = db.brands.map(b =>
    `- ${b.name}: รุ่น ${b.models.join(', ')} (มี ${b.manuals.length} คู่มือ)`
  ).join('\n');

  return `คุณคือ "EuroDiag AI" ผู้เชี่ยวชาญด้านการซ่อมบำรุงและวินิจฉัยอาการรถยนต์ยุโรป
คุณมีความรู้จากคู่มือซ่อมรถยนต์ยุโรปหลายยี่ห้อ และพร้อมช่วยเหลือเจ้าของรถทุกคน

## กฎสำคัญ:
1. ตอบเป็นภาษาไทยเสมอ ยกเว้นคำศัพท์เทคนิคภาษาอังกฤษ
2. ให้คำแนะนำที่ปลอดภัย เน้นความปลอดภัยของผู้ขับขี่เป็นอันดับแรก
3. หากอาการรุนแรงหรือเป็นอันตราย ให้แนะนำให้หยุดรถทันทีและติดต่อศูนย์บริการ
4. ถ้าไม่แน่ใจ ให้แนะนำให้ไปพบช่างผู้เชี่ยวชาญ อย่าเดาเอา
5. ตอบกระชับ ชัดเจน ใช้หัวข้อย่อยและ bullet points
6. เมื่อเหมาะสม ให้ระบุว่าข้อมูลมาจากคู่มือรถยุโรปยี่ห้อใด

## ข้อมูลจากคู่มือซ่อมรถยนต์ยุโรป:

### ยี่ห้อรถที่มีข้อมูล:
${brandList}

### อาการเสียและการวินิจฉัย:
${symptomList}

### ตำแหน่งอะไหล่สำคัญ:
${partsList}

### ตารางเช็กระยะ:
${maintenanceList}

## หมายเหตุ:
- หากผู้ใช้ถามเรื่องที่ไม่ได้อยู่ในข้อมูลคู่มือ คุณยังสามารถให้คำแนะนำทั่วไปเกี่ยวกับรถยุโรปได้
- แต่ต้องแจ้งว่าเป็นคำแนะนำทั่วไป ไม่ได้มาจากคู่มือโดยตรง`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

/**
 * Send message to /api/chat (server-side proxy)
 * API key is injected server-side — never sent from browser
 */
export async function sendMessageStream(apiKey, messages, onChunk) {
  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: fullMessages,
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 401) {
      throw new Error('API Key ไม่ถูกต้อง กรุณาตรวจสอบ Key ของคุณ');
    }
    if (response.status === 429) {
      throw new Error('คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
    }
    throw new Error(`เกิดข้อผิดพลาด (${response.status}): ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          onChunk(fullText);
        }
      } catch (e) {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullText;
}
