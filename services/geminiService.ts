import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o "Coach Evolua+", um assistente pessoal de alta performance focado em psicologia comportamental, produtividade e gamificação.
Seu tom deve ser:
1. Motivador mas realista (filosofia estoica leve).
2. Curto e direto (respostas de no máximo 3 parágrafos curtos).
3. Use emojis moderadamente para manter o tom leve.
4. Focado em "Ação" e "Micro-hábitos".

O usuário está tentando melhorar sua vida. Se ele relatar falha, seja compreensivo mas sugira uma correção imediata. Se relatar sucesso, celebre.
`;

export const generatePlan = async (profile: UserProfile): Promise<string> => {
  try {
    const prompt = `
    Crie um plano diário de 3 micro-tarefas simples para uma pessoa com o seguinte perfil:
    Nome: ${profile.name}
    Foco Principal: ${profile.focusArea}
    Nível de Disciplina (1-10): ${profile.disciplineLevel}
    Tempo Disponível: ${profile.availableTime} minutos.

    Retorne APENAS um JSON array de strings, sem markdown, ex: ["Beber água", "Ler 5 min"].
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return response.text || '[]';
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    return '["Meditar 5 min", "Organizar mesa", "Beber 500ml de água"]';
  }
};

export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string,
  userProfile: UserProfile
): Promise<string> => {
  try {
    // Format history for the API strictly as generic content parts if managing manually, 
    // but here we use single generateContent with system instruction context for stateless simplicity in this demo,
    // or we construct the chat context manually.
    
    // Constructing a "chat" context manually for the prompt to save complexity of ChatSession management in stateless UI
    const contextPrompt = `
    ${SYSTEM_INSTRUCTION}
    
    Perfil do Usuário:
    Nome: ${userProfile.name}
    Objetivo: ${userProfile.focusArea}
    
    Histórico recente:
    ${history.slice(-5).map(h => `${h.role === 'user' ? 'Usuário' : 'Coach'}: ${h.text}`).join('\n')}
    
    Usuário: ${newMessage}
    Coach:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contextPrompt,
    });

    return response.text || "Desculpe, estou reorganizando meus circuitos. Tente novamente.";
  } catch (error) {
    console.error("Erro no chat:", error);
    return "Estou com dificuldade de conexão no momento. Mas continue focado!";
  }
};