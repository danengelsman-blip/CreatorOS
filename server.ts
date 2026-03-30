import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db.ts";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fs from "fs";
import { google } from 'googleapis';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  
  // User Management (Simple mock for now, using a default user ID)
  const DEFAULT_USER_ID = 'user_123';
  
  // Ensure default user exists
  const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(DEFAULT_USER_ID);
  if (!userExists) {
    db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(DEFAULT_USER_ID, 'creator@example.com');
  }

  app.get("/api/user", (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(DEFAULT_USER_ID);
    res.json(user);
  });

  app.get("/api/brand", (req, res) => {
    const brand = db.prepare('SELECT * FROM brands WHERE user_id = ?').get(DEFAULT_USER_ID);
    res.json(brand || null);
  });

  app.post("/api/brand", (req, res) => {
    const { name, tagline, archetype, personality, colors, typography, visual_style, thumbnail_style, content_hooks, catchphrases } = req.body;
    
    const existing = db.prepare('SELECT user_id FROM brands WHERE user_id = ?').get(DEFAULT_USER_ID);
    
    if (existing) {
      db.prepare(`
        UPDATE brands SET 
          name = ?, tagline = ?, archetype = ?, personality = ?, 
          colors = ?, typography = ?, visual_style = ?, 
          thumbnail_style = ?, content_hooks = ?, catchphrases = ?
        WHERE user_id = ?
      `).run(name, tagline, archetype, personality, JSON.stringify(colors), JSON.stringify(typography), visual_style, thumbnail_style, JSON.stringify(content_hooks), JSON.stringify(catchphrases), DEFAULT_USER_ID);
    } else {
      db.prepare(`
        INSERT INTO brands (user_id, name, tagline, archetype, personality, colors, typography, visual_style, thumbnail_style, content_hooks, catchphrases)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(DEFAULT_USER_ID, name, tagline, archetype, personality, JSON.stringify(colors), JSON.stringify(typography), visual_style, thumbnail_style, JSON.stringify(content_hooks), JSON.stringify(catchphrases));
    }
    
    res.json({ success: true });
  });

  app.get("/api/content", (req, res) => {
    const content = db.prepare('SELECT * FROM content WHERE user_id = ? ORDER BY created_at DESC').all(DEFAULT_USER_ID);
    res.json(content);
  });

  app.post("/api/content", (req, res) => {
    const { title, body, type, platform, score, score_feedback } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO content (id, user_id, title, body, type, platform, status, score, score_feedback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, DEFAULT_USER_ID, title, body, type, platform, 'draft', score, score_feedback);
    
    res.json({ id });
  });

  app.get("/api/analytics", (req, res) => {
    const analytics = db.prepare('SELECT * FROM analytics WHERE user_id = ? ORDER BY date ASC').all(DEFAULT_USER_ID);
    res.json(analytics);
  });

  app.get("/api/habits", (req, res) => {
    const streak = db.prepare('SELECT * FROM streaks WHERE user_id = ?').get(DEFAULT_USER_ID);
    const challenge = db.prepare('SELECT * FROM challenges WHERE user_id = ?').get(DEFAULT_USER_ID);
    res.json({ streak, challenge });
  });

  // --- OAuth & Social Integration ---

  app.get("/api/auth/google/url", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Save to DB
      const existing = db.prepare('SELECT user_id FROM user_accounts WHERE user_id = ? AND platform = ?')
        .get(DEFAULT_USER_ID, 'youtube');

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
          DEFAULT_USER_ID, 
          'youtube'
        );
      } else {
        db.prepare(`
          INSERT INTO user_accounts (user_id, platform, access_token, refresh_token, expiry_date, profile_data)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          DEFAULT_USER_ID, 
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
            <div style="text-align: center; padding: 40px; background: white; border-radius: 24px; shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);">
              <h1 style="color: #141414;">Authentication Successful</h1>
              <p style="color: #666;">You can close this window now.</p>
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

  app.get("/api/accounts", (req, res) => {
    const accounts = db.prepare('SELECT platform, profile_data FROM user_accounts WHERE user_id = ?').all(DEFAULT_USER_ID);
    res.json(accounts.map(a => ({
      platform: a.platform,
      profile: JSON.parse(a.profile_data)
    })));
  });

  app.post("/api/publish/youtube", async (req, res) => {
    const { title, description, videoUrl } = req.body;
    
    const account = db.prepare('SELECT * FROM user_accounts WHERE user_id = ? AND platform = ?').get(DEFAULT_USER_ID, 'youtube');
    if (!account) return res.status(401).json({ error: 'YouTube account not connected' });

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
      
      // In a real app, we'd download the video from videoUrl first.
      // For this demo, we'll simulate a successful upload if videoUrl is present.
      if (!videoUrl) return res.status(400).json({ error: 'No video URL provided' });

      // Mocking the upload for now as we don't have a real video file buffer easily available
      // but the structure is correct.
      /*
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: { title, description },
          status: { privacyStatus: 'private' }
        },
        media: { body: fs.createReadStream(videoPath) }
      });
      */

      res.json({ success: true, message: 'Video queued for upload to YouTube' });
    } catch (error) {
      console.error('YouTube Upload Error:', error);
      res.status(500).json({ error: 'Failed to upload to YouTube' });
    }
  });

  app.get("/api/analytics/youtube", async (req, res) => {
    const account = db.prepare('SELECT * FROM user_accounts WHERE user_id = ? AND platform = ?').get(DEFAULT_USER_ID, 'youtube');
    if (!account) return res.json({ views: 0, subscribers: 0 });

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
      res.json({ views: 0, subscribers: 0 });
    }
  });

  app.get("/robots.txt", (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /");
  });

  // Legal Pages (Server-side rendered for Google Crawler)
  app.get("/privacy", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="google-site-verification" content="ZMH-pcv71VbShROkNGynDJHXieEDPxQwx2tUiSTuFuA">
          <title>Privacy Policy | CreatorOS</title>
          <style>
              body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
              h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
              h2 { margin-top: 30px; }
          </style>
      </head>
      <body>
          <h1>Privacy Policy</h1>
          <p>Effective Date: March 28, 2026</p>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, such as your name and email address. When you use our AI services, we may also collect the prompts and content you generate.</p>
          <h2>2. Google OAuth and YouTube Data</h2>
          <p>CreatorOS uses Google OAuth to allow you to connect your YouTube channel. We only request the minimum permissions necessary to upload videos and retrieve channel analytics. We do not store your Google password. Your YouTube data is used solely to provide the features of the app and is not shared with third parties.</p>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, including AI-driven branding and content generation features.</p>
          <p><a href="/">Back to Home</a></p>
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
          <meta name="google-site-verification" content="ZMH-pcv71VbShROkNGynDJHXieEDPxQwx2tUiSTuFuA">
          <title>Terms of Service | CreatorOS</title>
          <style>
              body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
              h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
              h2 { margin-top: 30px; }
          </style>
      </head>
      <body>
          <h1>Terms of Service</h1>
          <p>Last Updated: March 28, 2026</p>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using CreatorOS, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
          <h2>2. AI-Generated Content</h2>
          <p>While you own the content you generate, you acknowledge that AI-generated content may not be unique and that other users may generate similar content.</p>
          <p><a href="/">Back to Home</a></p>
      </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build only
    let distPath = path.join(__dirname, 'dist');
    
    if (!fs.existsSync(path.join(distPath, 'index.html')) || !fs.existsSync(path.join(distPath, 'assets'))) {
      // If dist/index.html or dist/assets doesn't exist, we might already be in the dist directory
      if (fs.existsSync(path.join(__dirname, 'index.html')) && fs.existsSync(path.join(__dirname, 'assets'))) {
        distPath = __dirname;
      } else if (fs.existsSync(path.join(process.cwd(), 'dist', 'index.html')) && fs.existsSync(path.join(process.cwd(), 'dist', 'assets'))) {
        distPath = path.join(process.cwd(), 'dist');
      } else if (fs.existsSync(path.join(process.cwd(), 'index.html')) && fs.existsSync(path.join(process.cwd(), 'assets'))) {
        distPath = process.cwd();
      }
    }
    
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
