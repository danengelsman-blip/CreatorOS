import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db";
import { v4 as uuidv4 } from 'uuid';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
