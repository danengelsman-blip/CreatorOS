export const generateBrandKit = async (userInput: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      contents: `Generate a complete brand kit for a creator based on this description: ${userInput}.
      Select a specific creator archetype (e.g., 'The Educator', 'The Entertainer', 'The Analyst', 'The Storyteller', 'The Guide', 'The Visionary').
      Provide granular options for visual styles, cohesive color palettes (with hex codes), and specific Google Fonts for typography. Ensure these elements are cohesive and generate a distinct brand identity. Also include default settings for an AI Avatar including gender, clothing style, sound/voice description, and default background.`,
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
            },
            avatar: {
              type: "OBJECT",
              properties: {
                gender: { type: "STRING" },
                clothing: { type: "STRING" },
                sound: { type: "STRING" },
                background: { type: "STRING" }
              }
            }
          },
          required: ["name", "tagline", "archetype", "personality", "colors", "typography", "visual_style", "thumbnail_style", "content_hooks", "catchphrases", "avatar"]
        }
      }
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
  const data = await response.json();
  return JSON.parse(data.text);
};

export const generateContentIdeas = async (brandData: any) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
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
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
  const data = await response.json();
  return JSON.parse(data.text).ideas;
};

export const scoreContent = async (content: string, brandVoice: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
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
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
  const data = await response.json();
  return JSON.parse(data.text);
};

export const quickPolish = async (content: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      contents: `Briefly polish this content for better flow and impact. Keep it concise.
      Content: ${content}`
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
  const data = await response.json();
  return data.text;
};

export const repurposeContent = async (content: string) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      contents: `Analyze this content and generate ideas and drafts for repurposed content on TikTok, Twitter, and LinkedIn.
      Adapt tone and format appropriately for each platform.
      Content: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            tiktok: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  hook: { type: "STRING" },
                  script: { type: "STRING" }
                }
              }
            },
            twitter: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  tweet: { type: "STRING" }
                }
              }
            },
            linkedin: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  post: { type: "STRING" }
                }
              }
            }
          },
          required: ["tiktok", "twitter", "linkedin"]
        }
      }
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
  const data = await response.json();
  return JSON.parse(data.text);
};

export const generateSpeech = async (text: string, voice: string = 'Kore') => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
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
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
  const data = await response.json();
  const base64Audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = "audio/wav") => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          { text: "Transcribe this audio exactly." },
        ],
      }
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(errJson.error || 'API Error');
    } catch (e) {
      throw new Error(errText);
    }
  }
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
