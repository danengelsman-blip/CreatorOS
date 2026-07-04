export const generateBrandKit = async (userInput: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-3.1-flash-lite",
      contents: `Generate a complete brand kit for a creator based on this description: ${userInput}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            tagline: { type: "STRING" },
            archetype: { type: "STRING" },
            personality: { type: "STRING" },
            colors: {
              type: "OBJECT",
              properties: {
                primary: { type: "STRING" },
                secondary: { type: "STRING" },
                accent: { type: "STRING" },
                background: { type: "STRING" }
              }
            },
            typography: {
              type: "OBJECT",
              properties: {
                heading: { type: "STRING" },
                body: { type: "STRING" }
              }
            },
            visual_style: { type: "STRING" },
            thumbnail_style: { type: "STRING" },
            content_hooks: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            catchphrases: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["name", "tagline", "archetype", "personality", "colors", "typography", "visual_style", "thumbnail_style", "content_hooks", "catchphrases"]
        }
      }
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return JSON.parse(data.text);
};

export const generateContentIdeas = async (brandData: any) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-3.1-flash-lite",
      contents: `Generate 5-10 content ideas for a creator based on this brand identity:
      Name: ${brandData.name}
      Tagline: ${brandData.tagline}
      Archetype: ${brandData.archetype}
      Visual Style: ${brandData.visual_style}
      
      Each idea should include a hook and a brief description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            ideas: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "Short, catchy title for the idea" },
                  hook: { type: "STRING" },
                  description: { type: "STRING" }
                },
                required: ["title", "hook", "description"]
              }
            }
          },
          required: ["ideas"]
        }
      }
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return JSON.parse(data.text).ideas;
};

export const scoreContent = async (content: string, brandVoice: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-3.1-flash-lite",
      contents: `Score this content (0-100) based on hook strength, clarity, engagement potential, and storytelling. 
      Brand Voice: ${brandVoice}
      Content: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            feedback: { type: "STRING" },
            suggestions: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["score", "feedback", "suggestions"]
        }
      }
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return JSON.parse(data.text);
};

export const quickPolish = async (content: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-3.1-flash-lite",
      contents: `Briefly polish this content for better flow and impact. Keep it concise.
      Content: ${content}`
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.text;
};

export const generateSpeech = async (text: string, voice: string = 'Kore') => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      }
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

export const transcribeAudio = async (base64Audio: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-3.1-flash-lite",
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
      }
    })
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.text;
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
