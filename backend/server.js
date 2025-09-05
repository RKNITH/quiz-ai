import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.MODEL_NAME || "gemini-2.5"; // Quiz-specific model
const MAX_OUTPUT_TOKENS = parseInt(process.env.MAX_OUTPUT_TOKENS || "1024", 10);

if (!GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY in .env file");
    process.exit(1);
}

// ----------------- Helpers -----------------

function buildPayload(prompt) {
    return {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
    };
}

// Safely extract JSON array from Gemini output
function extractJson(text) {
    if (!text) return null;

    let cleaned = text.trim();
    cleaned = cleaned.replace(/```json/i, "").replace(/```/g, "").trim();

    if (!cleaned.startsWith("[")) {
        const first = cleaned.indexOf("[");
        const last = cleaned.lastIndexOf("]");
        if (first !== -1 && last !== -1 && last > first) {
            cleaned = cleaned.substring(first, last + 1);
        }
    }

    try {
        return JSON.parse(cleaned);
    } catch (err) {
        console.error("❌ JSON parse error:", err.message);
        return null;
    }
}

// ----------------- Routes -----------------

app.post("/api/quiz/generate", async (req, res, next) => {
    try {
        const { topic, numQuestions = 15, language = "English" } = req.body;

        if (!topic || typeof topic !== "string") {
            return res.status(400).json({ error: "Missing or invalid topic" });
        }

        const prompt = `
You are a strict quiz generator. Produce exactly ${numQuestions} multiple-choice questions about the topic: "${topic}".

Rules:
- Output MUST be a valid JSON array only. No explanations, no comments.
- Each item must be:
{
  "question": "...",
  "options": ["option1","option2","option3","option4"],
  "answer": "option1"
}
- Do not include newlines inside values unless properly escaped.
- Language: ${language}
- Questions: concise (1 sentence max).
- Answers: 1 sentence max.
- Absolutely NO extra text before or after JSON.
`;

        const payload = buildPayload(prompt);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            timeout: 30000,
        });

        const candidateText =
            response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
            return res.status(502).json({
                error: "No content returned from Gemini",
                raw: response.data,
            });
        }

        const quizData = extractJson(candidateText);

        if (!quizData || !Array.isArray(quizData)) {
            return res.status(500).json({
                error: "Gemini returned invalid JSON",
                raw: candidateText,
            });
        }

        return res.json({ quizData });
    } catch (err) {
        console.error("🔥 Server error:", err.response?.data || err.message);
        res.status(500).json({
            error: "Internal server error",
            detail: err.response?.data || err.message || "Unknown error",
        });
    }
});

// ----------------- Start Server -----------------

app.listen(PORT, () => {
    console.log(`✅ Server listening at http://localhost:${PORT}`);
});
