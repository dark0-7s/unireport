import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // In-memory sliding window rate limiter for API endpoints (60 requests/minute per client IP)
  const rateLimitWindowMs = 60 * 1000;
  const maxRequestsPerWindow = 60;
  const requestLog = new Map<string, number[]>();

  const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "127.0.0.1";
    const now = Date.now();
    const timestamps = requestLog.get(ip) || [];
    const validTimestamps = timestamps.filter((t) => now - t < rateLimitWindowMs);

    if (validTimestamps.length >= maxRequestsPerWindow) {
      res.setHeader("Retry-After", "60");
      res.status(429).json({
        success: false,
        error: "Too many requests. Please wait a moment before trying again.",
      });
      return;
    }

    validTimestamps.push(now);
    requestLog.set(ip, validTimestamps);
    res.setHeader("X-RateLimit-Limit", maxRequestsPerWindow.toString());
    res.setHeader("X-RateLimit-Remaining", (maxRequestsPerWindow - validTimestamps.length).toString());
    next();
  };

  app.use("/api", rateLimiter);

  // Basic health check for Cloud Run and container liveness probes
  app.get(["/healthz", "/api/health"], (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // REGAN Automated Agent Generation Endpoint
  app.post("/api/regan/generate", async (req, res) => {
    try {
      const { details, eventType, tone = "Executive", instruction, currentReport } = req.body;

      if (!details || typeof details !== "string" || !details.trim()) {
        res.status(400).json({ error: "Missing required event details input" });
        return;
      }

      const systemInstruction = `You are REGAN, an autonomous institutional event proceedings documentation architect and report synthesizer.
Your mission is to take rough, unstructured, raw event details, agenda notes, transcripts, or briefings, and transform them into a complete, pristine, publication-grade academic or corporate Event Report JSON.

Follow these strict rules:
1. Infer or respect the EventType (Conference, Workshop, Seminar, Hackathon, Social, Exhibition, Meeting).
2. Synthesize an eloquent, high-impact Executive Summary reflecting the requested tone (${tone}).
3. Extract or realistically estimate structured Attendance metrics (total, student, faculty, external, satisfaction rating).
4. Parse/synthesize Guest Speakers/Keynotes with dignified institutional bios.
5. Populate specialized event domain modules:
   - For Hackathons: problem statements, tracks, awards (prize winners), sponsors.
   - For Conferences/Seminars: accreditation data (ABET/NAAC CO-PO outcomes, Bloom's level, feedback).
   - For Workshops: software tools used, hands-on exercises, pre/post competency gain metrics.
   - For Meetings: presiding officer, agenda items, resolutions passed, action items.
   - For Exhibitions: booths count, highlights, footfall.
6. Provide an array of "agentLogs" (3 to 6 concise step descriptions) detailing your autonomous analytical and synthesis workflow.`;

      const prompt = `User Shared Details & Briefing:
${details}

${instruction ? `Special User Instruction: ${instruction}` : ""}
${eventType ? `Desired Event Type: ${eventType}` : ""}
${currentReport ? `Existing Report Context to Iterate/Refine: ${JSON.stringify(currentReport)}` : ""}

Generate the complete structured report. Output valid JSON.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn("JSON parse fallback for REGAN output:", parseErr);
        parsedData = { rawOutput: responseText };
      }

      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error("REGAN generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to execute REGAN automated agent synthesis",
      });
    }
  });

  // REGAN Section-Specific 'Sync & Refresh' Endpoint
  app.post("/api/regan/regenerate-section", async (req, res) => {
    try {
      const { sectionKey, currentReport, instruction, orgType = "University / Higher Ed" } = req.body;

      if (!sectionKey || !currentReport) {
        res.status(400).json({ error: "Missing sectionKey or currentReport" });
        return;
      }

      const systemInstruction = `You are REGAN, an autonomous institutional proceedings architect.
You are performing a targeted 'Sync & Refresh' on the SPECIFIC section: '${sectionKey}' for an organization of type '${orgType}'.
Do not regenerate the entire document — only regenerate and return the updated data for '${sectionKey}' while respecting the existing document context.

Return a JSON object containing:
1. '${sectionKey}': the refreshed data object/content.
2. 'agentLogs': array of 2-3 step descriptions of what you refreshed and enhanced.`;

      const prompt = `Document Context:
Title: ${currentReport.title}
Event Type: ${currentReport.content?.eventDetails?.eventType || "Conference"}
Organization Type: ${orgType}
Current Section Data: ${JSON.stringify(currentReport.content?.[sectionKey] || currentReport[sectionKey] || {})}
Target Section to Refresh: ${sectionKey}
User Specific Refresh Instruction: ${instruction || "Enhance clarity, institutional tone, and completeness."}

Generate the refreshed ${sectionKey} data as valid JSON.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        parsedData = { [sectionKey]: responseText };
      }

      res.status(200).json({
        success: true,
        data: parsedData,
      });
    } catch (error: any) {
      console.error("REGAN section refresh error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to refresh report section",
      });
    }
  });

  // Multi-turn Gemini Institutional Event Assistant Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, currentReport, persona = "documentarian" } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Missing messages array" });
        return;
      }

      const personaInstructions: Record<string, string> = {
        documentarian: "You are the Lead Institutional Event Documentarian. Synthesize official, publication-ready proceedings, executive summaries, and formal resolutions.",
        accreditation: "You are an Academic Accreditation & Outcome-Based Education (OBE) Specialist. Focus on NAAC/ABET Program Outcomes (PO1-PO12), Course Outcomes (COs), and Bloom's Cognitive Taxonomy.",
        analyst: "You are an Institutional Data & Attendance Analyst. Calculate attendance ratios, satisfaction ratings, skill attainment growth, and metric benchmarks.",
        speaker_specialist: "You are a Distinguished Keynote & Speaker Citation Specialist. Draft dignified institutional bios, speaker introductions, and award citations.",
      };

      const baseInstruction = personaInstructions[persona] || personaInstructions.documentarian;
      const eventContext = currentReport
        ? `\nCurrent Active Report Context:\nTitle: ${currentReport.title || "Untitled"}\nEvent Type: ${currentReport.content?.eventDetails?.eventType || "Conference"}\nOrganization: ${currentReport.content?.eventDetails?.organization || "Academic Institution"}\nAttendance: ${JSON.stringify(currentReport.content?.attendance || {})}\nSummary: ${currentReport.content?.summary?.finalizedText || currentReport.content?.summary?.polishedText || "No summary yet"}\nGuests: ${JSON.stringify(currentReport.content?.guests || [])}`
        : "";

      const systemInstruction = `${baseInstruction}\n${eventContext}\n\nProvide helpful, professional, and well-structured Markdown responses. When proposing text that can be used directly in reports, make it clean and ready to copy or apply.`;

      // Convert conversation history to Gemini prompt
      const conversationHistory = messages.map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: conversationHistory,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      const reply = response.text || "I am ready to help you synthesize and polish your institutional event proceedings.";

      res.status(200).json({
        success: true,
        reply,
      });
    } catch (error: any) {
      console.error("Gemini chat error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate Gemini response",
      });
    }
  });

  // Auto-tagging System Endpoint
  app.post("/api/gemini/suggest-tags", async (req, res) => {
    try {
      const { title, eventType, organization, department, location, rawNotes } = req.body;

      const systemInstruction = `You are an Institutional Event Tagging & Categorization Specialist.
Analyze the provided event details and suggest 3 to 6 high-precision category tags (e.g., 'Academic', 'Corporate', 'Social', 'Hackathon', 'Research', 'Internal', 'External', 'Symposium', 'Community', 'Accredited', 'Workshop', 'Featured', 'Technical', 'Youth', 'Executive').
Return valid JSON with an array of string tags called "tags" and an optional "rationale" string.`;

      const prompt = `Event Details to Analyze:
Title: ${title || "Untitled Event"}
Event Type: ${eventType || "Conference"}
Organization: ${organization || "Academic & Professional Directorate"}
Department: ${department || ""}
Location: ${location || ""}
Notes / Briefing: ${rawNotes || ""}

Suggest the most accurate, professional tags for this report.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      let parsed = JSON.parse(responseText);
      const tags = Array.isArray(parsed.tags) ? parsed.tags : ["Academic", eventType || "Conference", "Featured"];

      res.status(200).json({
        success: true,
        tags,
        rationale: parsed.rationale || "Categorized based on event metadata and institutional context.",
      });
    } catch (error: any) {
      console.error("Auto-tagging error:", error);
      // Fallback heuristics if offline or error
      const { eventType = "Conference", organization = "" } = req.body;
      const fallbackTags = ["Academic", eventType];
      if (organization.toLowerCase().includes("corp")) fallbackTags.push("Corporate");
      if (eventType === "Social") fallbackTags.push("Social");
      if (eventType === "Hackathon") fallbackTags.push("Innovation");

      res.status(200).json({
        success: true,
        tags: fallbackTags,
        rationale: "Rule-based fallback categorization.",
      });
    }
  });

  // Dev server with vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Robust resolution of dist folder
    const distPath = fs.existsSync(path.resolve(__dirname, "dist"))
      ? path.resolve(__dirname, "dist")
      : fs.existsSync(path.resolve(process.cwd(), "dist"))
      ? path.resolve(process.cwd(), "dist")
      : __dirname;

    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application index.html not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
