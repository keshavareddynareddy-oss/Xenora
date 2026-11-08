import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Retry with exponential backoff for resilience against transient spikes
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries) throw err;
      const delay = Math.pow(2, attempt) * 500;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Server-side Gemini API Route: Multi-Disciplinary Engineering & Science Explanation
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const {
      structureName,
      system,
      functionDesc,
      location,
      question,
      discipline = 'engineering',
      topic = 'general',
      specifications,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the Secrets panel.',
      });
    }

    const prompt = question
      ? `As a senior university professor and principal engineer in ${discipline} (${topic}), answer this student's question regarding "${structureName}" (${system}):
Question: "${question}"

Provide a structured, rigorous, and highly educational response:
1. Direct, clear explanation answering the question
2. Working physical principles, governing equations, or biological/mechanical laws
3. Real-world engineering applications, operating trade-offs, or failure modes
4. One memorable engineering rule-of-thumb or high-yield concept.`
      : `Provide a comprehensive technical and scientific breakdown of the component: "${structureName}".
Discipline/Field: ${discipline}
Topic/Subsystem: ${topic} - ${system}
Primary Function: ${functionDesc || 'N/A'}
Location / Placement: ${location || 'N/A'}
Key Specifications: ${specifications ? JSON.stringify(specifications) : 'N/A'}

Format your explanation in clear, structured sections:
- **Architecture & Morphology**: Exact physical geometry, materials, and mechanical or biological boundaries.
- **Governing Physics & Operating Principle**: Mathematical, thermodynamic, electromagnetic, or physiological laws that govern its operation.
- **Interconnected Systems & Interfaces**: How this component couples with adjacent components or flows.
- **Engineering / Practical Insight**: High-yield design considerations, failure modes, diagnostics, or clinical pearls.`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are GestureLab AI, a world-class engineering, science, and medical 3D learning platform assistant. You deliver mathematically sound, physically accurate, and engaging explanations across mechanical, electrical, electronics, civil, computer science, and biomedical disciplines.',
        },
      })
    );

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini explanation error:', error);
    let msg = error?.message || 'Failed to generate explanation.';
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) msg = parsed.error.message;
    } catch {
      // Keep original msg
    }
    return res.status(500).json({ error: msg });
  }
});

// Server-side Gemini API Route: Interactive Chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, selectedStructure, activeTopic, activeDiscipline, history } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the Secrets panel.',
      });
    }

    const contextPrefix = `[Current 3D Virtual Laboratory State]
- Discipline: ${activeDiscipline || 'Engineering & Science'}
- Topic: ${activeTopic || 'General'}
- Currently Selected Component: ${selectedStructure ? `${selectedStructure.name} (${selectedStructure.category || selectedStructure.system})` : 'None (Viewing overall model)'}

Student Inquiry: ${message}`;

    const conversationContents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role && item.text) {
          conversationContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }
    conversationContents.push({
      role: 'user',
      parts: [{ text: contextPrefix }],
    });

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: conversationContents,
        config: {
          systemInstruction:
            'You are GestureLab AI, an interactive 3D engineering and science tutor. Provide concise, clear, and technically accurate explanations. Address the student directly and reference their active 3D model component when appropriate. Keep responses under 250 words unless deep derivation is requested.',
        },
      })
    );

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    let msg = error?.message || 'Failed to complete chat inquiry.';
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) msg = parsed.error.message;
    } catch {
      // Keep original msg
    }
    return res.status(500).json({ error: msg });
  }
});

// Server-side Gemini API Route: Multi-Disciplinary Quiz Generation
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  try {
    const { category, difficulty = 'Intermediate', discipline, topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const prompt = `Generate 3 interactive multiple-choice quiz questions for a student studying "${discipline || category || 'Engineering & Science'}" (${topic || 'Core Principles'}) at "${difficulty}" difficulty.
Return a valid JSON array containing objects with:
- id: string
- question: clear, rigorous technical or scientific question
- targetStructureId: identifier of relevant component or structure
- options: array of 4 distinct choices
- correctAnswer: exact matching choice string
- explanation: educational explanation explaining why the answer is correct with physical/mathematical principles.`;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      })
    );

    let questions = [];
    try {
      questions = JSON.parse(response.text || '[]');
    } catch {
      questions = [];
    }

    return res.json({ questions });
  } catch (error: any) {
    console.error('Gemini quiz error:', error);
    let msg = error?.message || 'Failed to generate quiz.';
    try {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) msg = parsed.error.message;
    } catch {
      // Keep original msg
    }
    return res.status(500).json({ error: msg });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[GestureLab 3D] Multi-Disciplinary Virtual Laboratory running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
