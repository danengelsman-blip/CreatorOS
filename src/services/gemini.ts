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

export const generateContentIdeas = async (brandData: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate 5-10 content ideas for a creator based on this brand identity:
    Name: ${brandData.name}
    Tagline: ${brandData.tagline}
    Archetype: ${brandData.archetype}
    Visual Style: ${brandData.visual_style}
    
    Each idea should include a hook and a brief description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ideas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short, catchy title for the idea" },
                hook: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "hook", "description"]
            }
          }
        },
        required: ["ideas"]
      }
    }
  });

  return JSON.parse(response.text).ideas;
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
  const response = await fetch('/api/gemini/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio })
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json(); // { operationName: string }
};

export const getOperationStatus = async (operation: any) => {
  const response = await fetch('/api/gemini/video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName: operation.operationName || operation.name })
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
};

export const fetchVideoDownloadResponse = async (uri: string) => {
  const response = await fetch('/api/gemini/video-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uri })
  });
  if (!response.ok) throw new Error('Video download failed');
  return response.blob();
};
