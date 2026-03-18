import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateBrandKit = async (userInput: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a complete brand kit for a creator based on this description: ${userInput}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tagline: { type: Type.STRING },
          archetype: { type: Type.STRING },
          personality: { type: Type.STRING },
          colors: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING },
              secondary: { type: Type.STRING },
              accent: { type: Type.STRING },
              background: { type: Type.STRING }
            }
          },
          typography: {
            type: Type.OBJECT,
            properties: {
              heading: { type: Type.STRING },
              body: { type: Type.STRING }
            }
          },
          visual_style: { type: Type.STRING },
          thumbnail_style: { type: Type.STRING },
          content_hooks: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          catchphrases: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["name", "tagline", "archetype", "personality", "colors", "typography", "visual_style", "thumbnail_style", "content_hooks", "catchphrases"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const scoreContent = async (content: string, brandVoice: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Score this content (0-100) based on hook strength, clarity, engagement potential, and storytelling. 
    Brand Voice: ${brandVoice}
    Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "feedback", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const quickPolish = async (content: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: `Briefly polish this content for better flow and impact. Keep it concise.
    Content: ${content}`,
  });
  return response.text;
};

export const generateSpeech = async (text: string, voice: string = 'Kore') => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice as any },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

export const transcribeAudio = async (base64Audio: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "audio/wav",
            data: base64Audio,
          },
        },
        { text: "Transcribe this audio exactly." },
      ],
    },
  });
  return response.text;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  // Note: This requires the user to have selected an API key. 
  // The actual implementation will use the injected API_KEY.
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
  
  let operation = await veoAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  return operation;
};

export const getOperationStatus = async (operation: any) => {
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });
  return await veoAi.operations.getVideosOperation({ operation });
};
