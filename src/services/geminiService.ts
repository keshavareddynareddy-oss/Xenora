import { EducationalComponent } from '../types/discipline';
import { QuizQuestion } from '../types/learning';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export async function fetchStructureExplanation(
  structure: EducationalComponent,
  question?: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structureName: structure.name,
        system: structure.system,
        functionDesc: structure.functionDesc,
        location: structure.location,
        discipline: structure.discipline || 'engineering',
        topic: structure.topic || 'general',
        specifications: structure.specifications,
        question: question || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate explanation');
    }
    return data.text || 'No explanation returned.';
  } catch (err: any) {
    console.error('Explanation fetch error:', err);
    throw err;
  }
}

export async function fetchChatResponse(
  message: string,
  selectedStructure: EducationalComponent | null,
  activeTopic?: string,
  activeDiscipline?: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        selectedStructure: selectedStructure
          ? {
              name: selectedStructure.name,
              category: selectedStructure.category,
              system: selectedStructure.system,
              discipline: selectedStructure.discipline,
              topic: selectedStructure.topic,
            }
          : null,
        activeTopic: activeTopic || 'General',
        activeDiscipline: activeDiscipline || 'Engineering & Science',
        history: history.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          text: m.text,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send chat inquiry');
    }
    return data.text || 'No response returned.';
  } catch (err: any) {
    console.error('Chat inquiry error:', err);
    throw err;
  }
}

export async function fetchAiQuiz(
  category?: string,
  difficulty?: string,
  discipline?: string,
  topic?: string
): Promise<QuizQuestion[]> {
  try {
    const res = await fetch('/api/gemini/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, difficulty, discipline, topic }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate quiz');
    }
    return data.questions || [];
  } catch (err: any) {
    console.error('Quiz fetch error:', err);
    throw err;
  }
}
