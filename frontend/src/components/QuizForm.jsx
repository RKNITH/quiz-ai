import React, { useState } from "react";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function QuizForm({ setQuizData }) {
    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);

    // Axios instance directly inside component
    const axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) return;

        setLoading(true);
        try {
            const res = await axiosInstance.post("/quiz/generate", {
                topic,
                numQuestions: 15,
            });

            if (!res.data.quizData || !Array.isArray(res.data.quizData)) {
                alert("No valid quiz returned. Try another topic.");
                setQuizData([]);
            } else {
                setQuizData(res.data.quizData);
            }
        } catch (err) {
            console.error("Quiz generation error:", err.response || err.message);
            alert(
                err.response?.data?.error ||
                "Failed to generate quiz. Check console for details."
            );
            setQuizData([]);
        }
        setLoading(false);
    };

    return (
        <form
            className="bg-gradient-to-tr from-white/40 via-blue-70 to-white/40 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md mx-auto mt-12 border border-gray-200"
            onSubmit={handleSubmit}
        >
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Interactive Quiz Generator
            </h2>
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter topic (e.g., Physics, History)"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent mb-6 shadow-sm transition-all"
            />
            <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:scale-105 hover:shadow-lg transition-all duration-300"
                disabled={loading}
            >
                {loading && <AiOutlineLoading3Quarters className="animate-spin" />}
                {loading ? "Generating..." : "Generate Quiz"}
            </button>
        </form>
    );
}
