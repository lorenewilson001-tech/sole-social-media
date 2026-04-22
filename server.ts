import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Resend with safety check
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  app.use(cors());
  app.use(express.json());

  // API Route for sending emails
  app.post("/api/send-email", async (req, res) => {
    try {
      if (!resend) {
        return res.status(500).json({ error: "Resend API key is not configured. Please add RESEND_API_KEY to your secrets." });
      }

      const { to, subject, html, text, bcc } = req.body;

      if (!to || !subject || (!html && !text)) {
        return res.status(400).json({ error: "Missing required fields (to, subject, and either html or text)" });
      }

      const { data, error } = await resend.emails.send({
        from: "Sole Social <onboarding@resend.dev>", // Note: Free tier restricted to this sender until domain verified
        to: Array.isArray(to) ? to : [to],
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        subject,
        html: html || text,
        text: text || html,
      });

      if (error) {
        console.error("Resend Error:", error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (err: any) {
      console.error("Server Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
