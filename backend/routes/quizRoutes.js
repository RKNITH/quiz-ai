import express from "express";
import axios from "axios";
const router = express.Router();

router.post("/generate", async (req, res) => {
    const { topic, numQuestions } = req.body;

    // 1️⃣ Validate request body
    if (!topic || !numQuestions) {
        return res.status(400).json({ error: "Topic and numQuestions are required." });
    }

    const prompt = `
Generate ${numQuestions} multiple-choice questions on the topic "${topic}".
Each question should have 4 options and indicate the correct answer.
Return JSON array like:
[
  { "question": "?", "options": ["a","b","c","d"], "answer": "a" }
]
`;

    try {
        // 2️⃣ Call Gemini AI API
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gemini-1",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );

        // 3️⃣ Validate response structure
        if (!response.data?.choices?.[0]?.message?.content) {
            return res.status(500).json({ error: "Invalid response from Gemini AI." });
        }

        // 4️⃣ Parse JSON safely
        let quizData;
        try {
            quizData = JSON.parse(response.data.choices[0].message.content);
            if (!Array.isArray(quizData)) {
                throw new Error("Parsed data is not an array");
            }
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError.message);
            return res.status(500).json({
                error: "Failed to parse Gemini AI response.",
                rawResponse: response.data.choices[0].message.content,
            });
        }

        res.json(quizData);

    } catch (err) {
        console.error("Server Error:", err.message);
        if (err.response) {
            // Axios error from Gemini API
            return res.status(err.response.status).json({
                error: "Gemini AI API error",
                details: err.response.data,
            });
        }
        res.status(500).json({ error: "Server error. Please try again later." });
    }
});

export default router;
