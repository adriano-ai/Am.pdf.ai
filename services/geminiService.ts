import { GoogleGenAI } from "@google/genai";
import { AIActionType, GeminiResponse } from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize only if key exists to avoid immediate crash, handle error gracefully later
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const processTextWithGemini = async (text: string, action: AIActionType): Promise<GeminiResponse> => {
  if (!ai) {
    return { text: '', error: 'Chave de API não configurada.' };
  }

  if (!text.trim()) {
    return { text: '', error: 'Por favor, insira algum texto primeiro.' };
  }

  try {
    let prompt = '';
    
    switch (action) {
      case AIActionType.FIX_GRAMMAR:
        prompt = `Atue como um revisor profissional de português brasileiro. Corrija a gramática, ortografia e pontuação do seguinte texto, mantendo o estilo original. Retorne apenas o texto corrigido:\n\n${text}`;
        break;
      case AIActionType.SUMMARIZE:
        prompt = `Resuma o seguinte texto em português brasileiro, capturando os pontos principais de forma concisa. Retorne apenas o resumo:\n\n${text}`;
        break;
      case AIActionType.IMPROVE:
      default:
        prompt = `Melhore a clareza, fluidez e vocabulário do seguinte texto em português brasileiro, tornando-o mais profissional e elegante. Retorne apenas o texto melhorado:\n\n${text}`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const resultText = response.text;
    
    if (!resultText) {
      return { text: '', error: 'Não foi possível gerar uma resposta.' };
    }

    return { text: resultText.trim() };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: '', error: 'Erro ao processar o texto com IA. Tente novamente.' };
  }
};