import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db.ts";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import axios from 'axios';

dotenv.config();

// Initialize Firebase Admin
admin.initializeApp({
  projectId: "gen-lang-client-0282443702"
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

// TikTok Configuration
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = `${process.env.APP_URL}/api/auth/tiktok/callback`;

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Firebase Auth Middleware
  const authenticateUser = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      
      // Ensure user exists in our local DB
      const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(decodedToken.uid);
      if (!userExists) {
        db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(decodedToken.uid, decodedToken.email);
      }
      
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // API Routes
  
  app.get("/api/user", authenticateUser, (req: any, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.uid);
    res.json(user);
  });

  app.get("/api/brand", authenticateUser, (req: any, res) => {
    const brand = db.prepare('SELECT * FROM brands WHERE user_id = ?').get(req.user.uid);
    res.json(brand || null);
  });

  app.post("/api/brand", authenticateUser, (req: any, res) => {
    const { name, tagline, archetype, personality, colors, typography, visual_style, thumbnail_style, content_hooks, catchphrases } = req.body;
    
    const existing = db.prepare('SELECT user_id FROM brands WHERE user_id = ?').get(req.user.uid);
    
    if (existing) {
      db.prepare(`
        UPDATE brands SET 
          name = ?, tagline = ?, archetype = ?, personality = ?, 
          colors = ?, typography = ?, visual_style = ?, 
          thumbnail_style = ?, content_hooks = ?, catchphrases = ?
        WHERE user_id = ?
      `).run(name, tagline, archetype, personality, JSON.stringify(colors), JSON.stringify(typography), visual_style, thumbnail_style, JSON.stringify(content_hooks), JSON.stringify(catchphrases), req.user.uid);
    } else {
      db.prepare(`
        INSERT INTO brands (user_id, name, tagline, archetype, personality, colors, typography, visual_style, thumbnail_style, content_hooks, catchphrases)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.uid, name, tagline, archetype, personality, JSON.stringify(colors), JSON.stringify(typography), visual_style, thumbnail_style, JSON.stringify(content_hooks), JSON.stringify(catchphrases));
    }
    
    res.json({ success: true });
  });

  app.get("/api/content", authenticateUser, (req: any, res) => {
    const content = db.prepare('SELECT * FROM content WHERE user_id = ? ORDER BY created_at DESC').all(req.user.uid);
    res.json(content);
  });

  app.post("/api/content", authenticateUser, (req: any, res) => {
    const { title, body, type, platform, score, score_feedback } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO content (id, user_id, title, body, type, platform, status, score, score_feedback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.uid, title, body, type, platform, 'draft', score, score_feedback);
    
    res.json({ id });
  });

  app.get("/api/analytics", authenticateUser, (req: any, res) => {
    const analytics = db.prepare('SELECT * FROM analytics WHERE user_id = ? ORDER BY date ASC').all(req.user.uid);
    res.json(analytics);
  });

  app.get("/api/habits", authenticateUser, (req: any, res) => {
    const streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(req.user.uid);
    const challenge = db.prepare('SELECT * FROM challenges WHERE user_id = ?').get(req.user.uid);
    res.json({ streak, challenge });
  });

  // --- Gemini Video API ---
  let _ai = null;
  const getAI = async () => {
    if (!_ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
      }
      const { GoogleGenAI } = await import('@google/genai');
      _ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
         
      });
    }
    return _ai;
  };


  app.post("/api/gemini/generate", async (req: any, res) => {
    try {
      const { model, contents, config } = req.body;
      const response = await (await getAI()).models.generateContent({
        model: model || "gemini-2.5-flash",
        contents,
        config
      });
      res.json({ text: response.text, candidates: response.candidates });
    } catch (error: any) {
      console.error('Gemini Generate Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Onboarding Interview and Channel Style API ---
  app.post("/api/onboarding/chat", authenticateUser, async (req: any, res) => {
    try {
      const { messages } = req.body;
      
      const systemInstruction = `You are a friendly, expert brand architect conducting a highly encouraging and conversational 3-question interview for a new creator starting their content creation journey.
      
      CRITICAL: You MUST speak in simple, clear, beginner-friendly language with absolutely NO professional jargon. For example:
      - Use "Channel Style" instead of "Brand Identity" or "Brand Kit"
      - Use "Dream Viewers" instead of "Target Audience"
      - Use "Mood" or "Feel" instead of "Brand Archetype"
      
      Keep your responses extremely short (max 2-3 sentences per response). Focus on building confidence.
      
      Your goal is to guide the user to discover:
      1. What topic/niche they want to make videos about.
      2. Who their dream viewer is.
      3. What the mood or feel of their content should be (e.g. funny, calm, friendly, bold).
      
      Based on the previous conversation history:
      - If this is the start of the interview (messages is empty), warmly ask: "Welcome! Let's build your perfect Creator Profile together. To start, what topic or niche excites you the most for your channel?"
      - If they have answered the first topic, acknowledge it warmly and ask: "Amazing choice! Now, who is your dream viewer? Who are we creating these videos for?"
      - If they have answered the second topic, acknowledge it and ask: "Got it! Finally, what should the style and mood of your content feel like? (e.g., friendly and easy to follow, calm and aesthetic, or energetic and bold?)"
      - If they have answered all three topics, summarize their choices in a neat, exciting paragraph, and say: "Fantastic! I have all the details I need to build your custom Creator Profile. Click 'Build My Brand Kit' below to unlock your custom colors, voice, templates, and video ideas!"
      
      Determine if all 3 questions have been answered. If so, return a JSON object with isComplete: true and a brief summary. Otherwise, return a JSON object with isComplete: false.`;

      const contents = (messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }]
      }));

      const response = await (await getAI()).models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          ...contents
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              message: { type: "STRING" as any, description: "Your next chat response or final encouraging summary" },
              isComplete: { type: "BOOLEAN" as any, description: "True if all 3 questions (niche, audience, vibe) have been answered and summarized" },
              summary: {
                type: "OBJECT" as any,
                properties: {
                  niche: { type: "STRING" as any },
                  audience: { type: "STRING" as any },
                  vibe: { type: "STRING" as any }
                }
              }
            },
            required: ["message", "isComplete"]
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error('Onboarding Chat Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/onboarding/generate-brand", authenticateUser, async (req: any, res) => {
    try {
      const { niche, audience, vibe } = req.body;
      const userInput = `Niche/Topic: ${niche}. Dream Viewers/Audience: ${audience}. Channel Vibe/Style: ${vibe}.`;
      
      const response = await (await getAI()).models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a complete, beautiful Channel Style profile for a content creator based on this description: ${userInput}. 
Select a specific creator archetype (e.g., 'The Educator', 'The Entertainer', 'The Analyst', 'The Storyteller', 'The Guide', 'The Visionary').
Provide granular options for visual styles, cohesive color palettes (with hex codes), and specific Google Fonts for typography (e.g., Space Grotesk, Outfit, Inter, Playfair Display, Fira Code, JetBrains Mono). 
Ensure these elements are cohesive and generate a distinct brand identity. Keep terminology extremely beginner-friendly and simple.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT" as any,
            properties: {
              name: { type: "STRING" as any, description: "A catchy, humble, and clear name for the channel (do not use complex brand jargon)" },
              tagline: { type: "STRING" as any, description: "A simple and motivating tagline for the channel" },
              archetype: { type: "STRING" as any, description: "A friendly label for their creator archetype (e.g. The Enthusiastic Guide, The Aesthetic Chef, The Simple Teacher)" },
              personality: { type: "STRING" as any, description: "3-4 simple personality descriptors (e.g. friendly, calm, informative)" },
              colors: {
                type: "OBJECT" as any,
                properties: {
                  primary: { type: "STRING" as any, description: "HEX color code" },
                  secondary: { type: "STRING" as any, description: "HEX color code" },
                  accent: { type: "STRING" as any, description: "HEX color code" },
                  background: { type: "STRING" as any, description: "HEX color code" }
                },
                required: ["primary", "secondary", "accent", "background"]
              },
              typography: {
                type: "OBJECT" as any,
                properties: {
                  heading: { type: "STRING" as any, description: "Clean Google Font name for titles" },
                  body: { type: "STRING" as any, description: "Clean Google Font name for text" }
                },
                required: ["heading", "body"]
              },
              visual_style: { type: "STRING" as any, description: "Simple description of the channel's video style (e.g., clean, high-contrast text, minimal background clutter)" },
              thumbnail_style: { type: "STRING" as any, description: "Simple and clear thumbnail style description (e.g., bright natural lighting, bold easy-to-read text, close-up face)" },
              content_hooks: {
                type: "ARRAY" as any,
                items: { type: "STRING" as any },
                description: "3 simple, engaging script opening templates tailored for their niche"
              },
              catchphrases: {
                type: "ARRAY" as any,
                items: { type: "STRING" as any },
                description: "2-3 short, catchy sayings or sign-offs to build community connection"
              }
            },
            required: ["name", "tagline", "archetype", "personality", "colors", "typography", "visual_style", "thumbnail_style", "content_hooks", "catchphrases"]
          }
        }
      });
      
      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error('Generate Brand kit Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/generate-video", async (req: any, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      const operation = await (await getAI()).models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio || '16:9'
        }
      });
      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error('Video Generation Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/video-status", async (req: any, res) => {
    try {
      const { operationName } = req.body;
      const { GenerateVideosOperation } = await import('@google/genai');
      const op = new GenerateVideosOperation();
      op.name = operationName;
      
      const updated = await (await getAI()).operations.getVideosOperation({ operation: op });
      res.json({ 
        done: updated.done, 
        progressPercentage: (updated as any)?.response?.progressPercentage,
        uri: updated.done ? updated.response?.generatedVideos?.[0]?.video?.uri : null
      });
    } catch (error: any) {
      console.error('Video Status Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/video-download", async (req: any, res) => {
    try {
      const { uri } = req.body;
      if (!uri) return res.status(400).send('No URI');
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY! },
      });
      res.setHeader('Content-Type', 'video/mp4');
      videoRes.body!.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      );
    } catch (error: any) {
      console.error('Video Download Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- OAuth & Social Integration ---

  app.get("/api/auth/google/url", authenticateUser, (req: any, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      state: req.user.uid, // Pass UID through state
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code, state } = req.query;
    const userId = state as string;

    if (!userId) return res.status(400).send('Missing user state');

    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Save to DB
      const existing = db.prepare('SELECT user_id FROM user_accounts WHERE user_id = ? AND platform = ?')
        .get(userId, 'youtube');

      if (existing) {
        db.prepare(`
          UPDATE user_accounts SET 
            access_token = ?, refresh_token = ?, expiry_date = ?, profile_data = ?
          WHERE user_id = ? AND platform = ?
        `).run(
          tokens.access_token, 
          tokens.refresh_token || null, 
          tokens.expiry_date, 
          JSON.stringify(userInfo.data), 
          userId, 
          'youtube'
        );
      } else {
        db.prepare(`
          INSERT INTO user_accounts (user_id, platform, access_token, refresh_token, expiry_date, profile_data)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          userId, 
          'youtube', 
          tokens.access_token, 
          tokens.refresh_token, 
          tokens.expiry_date, 
          JSON.stringify(userInfo.data)
        );
      }

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F9F9F8;">
            <div style="text-align: center; padding: 40px; background: white; border-radius: 24px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);">
              <h1 style="color: #141414;">YouTube Connected</h1>
              <p style="color: #666;">Success! You can close this window.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: 'youtube' }, '*');
                  window.close();
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // TikTok OAuth
  app.get("/api/auth/tiktok/url", authenticateUser, (req: any, res) => {
    const csrfState = Math.random().toString(36).substring(7);
    const scope = 'user.info.basic,video.list';
    
    // Construct TikTok auth URL
    // Documentation: https://developers.tiktok.com/doc/login-kit-web
    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}&state=${req.user.uid}`;
    
    res.json({ url });
  });

  app.get("/api/auth/tiktok/callback", async (req, res) => {
    const { code, state } = req.query;
    const userId = state as string;

    if (!userId) return res.status(400).send('Missing user state');

    try {
      // Exchange code for token
      const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', 
        new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY!,
          client_secret: TIKTOK_CLIENT_SECRET!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: TIKTOK_REDIRECT_URI,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, refresh_token, expires_in, open_id } = response.data;

      // Save to DB
      const existing = db.prepare('SELECT user_id FROM user_accounts WHERE user_id = ? AND platform = ?')
        .get(userId, 'tiktok');

      if (existing) {
        db.prepare(`
          UPDATE user_accounts SET 
            access_token = ?, refresh_token = ?, expiry_date = ?, profile_data = ?
          WHERE user_id = ? AND platform = ?
        `).run(access_token, refresh_token, Date.now() + expires_in * 1000, JSON.stringify({ open_id }), userId, 'tiktok');
      } else {
        db.prepare(`
          INSERT INTO user_accounts (user_id, platform, access_token, refresh_token, expiry_date, profile_data)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, 'tiktok', access_token, refresh_token, Date.now() + expires_in * 1000, JSON.stringify({ open_id }));
      }

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F9F9F8;">
            <div style="text-align: center; padding: 40px; background: white; border-radius: 24px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);">
              <h1 style="color: #141414;">TikTok Connected</h1>
              <p style="color: #666;">Success! You can close this window.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', platform: 'tiktok' }, '*');
                  window.close();
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('TikTok OAuth Error:', error);
      res.status(500).send('TikTok Authentication failed');
    }
  });

  app.get("/api/accounts", authenticateUser, (req: any, res) => {
    const accounts = db.prepare('SELECT platform, profile_data FROM user_accounts WHERE user_id = ?').all(req.user.uid);
    res.json(accounts.map(a => ({
      platform: a.platform,
      profile: JSON.parse(a.profile_data)
    })));
  });

  app.get("/api/analytics/youtube", authenticateUser, async (req: any, res) => {
    const account = db.prepare('SELECT * FROM user_accounts WHERE user_id = ? AND platform = ?').get(req.user.uid, 'youtube');
    if (!account) return res.json({ views: 0, subscribers: 0, videos: 0 });

    try {
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.expiry_date
      });

      const youtube = google.youtube({ version: 'v3', auth });
      const response = await youtube.channels.list({
        part: ['statistics'],
        mine: true
      });

      const stats = response.data.items?.[0]?.statistics;
      res.json({
        views: parseInt(stats?.viewCount || '0'),
        subscribers: parseInt(stats?.subscriberCount || '0'),
        videos: parseInt(stats?.videoCount || '0')
      });
    } catch (error) {
      console.error('YouTube Analytics Error:', error);
      res.json({ views: 0, subscribers: 0, videos: 0 });
    }
  });

  app.get("/api/analytics/tiktok", authenticateUser, async (req: any, res) => {
    // Mocking TikTok analytics for now as their API access is heavily gated
    // but demonstrating where the integration would live.
    const account = db.prepare('SELECT * FROM user_accounts WHERE user_id = ? AND platform = ?').get(req.user.uid, 'tiktok');
    if (!account) return res.json({ followers: 0, views: 0, likes: 0 });
    
    res.json({
      followers: 1240,
      views: 45000,
      likes: 8900
    });
  });

  app.get("/robots.txt", (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /");
  });

  // Legal Pages
  app.get("/privacy", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Privacy Policy | CreatorOS</title>
      </head>
      <body>
          <h1>Privacy Policy</h1>
          <p>We use your connected social media data (YouTube, TikTok) solely to display analytics in your CreatorOS dashboard. We do not sell or share your data.</p>
      </body>
      </html>
    `);
  });

  app.get("/terms", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Terms of Service | CreatorOS</title>
      </head>
      <body>
          <h1>Terms of Service</h1>
          <p>By connecting your YouTube or TikTok account, you grant CreatorOS permission to access your public profile and analytics data.</p>
      </body>
      </html>
    `);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
