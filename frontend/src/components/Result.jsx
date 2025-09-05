import React from "react";

export default function Result({ score, total, onRestart }) {
    const percentage = ((score / total) * 100).toFixed(0);

    let message = "";
    if (percentage === 100) message = "🎉 Perfect Score!";
    else if (percentage >= 80) message = "👍 Great Job!";
    else if (percentage >= 50) message = "🙂 Good Effort!";
    else message = "😅 Keep Practicing!";

    return (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-center mt-6">
            <h2 className="text-2xl font-semibold mb-4">Quiz Completed!</h2>
            <p className="text-xl mb-2">
                Your Score: <span className="font-bold">{score} / {total}</span>
            </p>
            <p className="text-lg mb-4">{message}</p>
            <div className="w-full bg-gray-200 h-4 rounded mb-6">
                <div
                    className="bg-blue-600 h-4 rounded transition-all"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <button
                onClick={onRestart}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
                Restart Quiz
            </button>
        </div>
    );
}
