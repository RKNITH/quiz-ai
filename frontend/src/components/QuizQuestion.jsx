import React, { useState } from "react";

export default function QuizQuestion({ data, onNext }) {
    const [selected, setSelected] = useState(null);

    if (!data) return null;

    const handleOptionClick = (option) => {
        if (selected !== null) return; // prevent changing answer

        setSelected(option);

        const isCorrect = option === data.answer;

        // Call parent with whether it was correct
        setTimeout(() => {
            onNext(isCorrect);
            setSelected(null); // reset selection for next question
        }, 700); // small delay to show color feedback
    };

    return (
        <div className="bg-gradient-to-tr from-white/90 via-blue-50 to-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl w-full max-w-md mb-8 border border-gray-200">
            <p className="text-xl font-semibold mb-6 text-gray-800">{data.question}</p>
            <div className="grid grid-cols-2 gap-4">
                {data.options.map((option, idx) => {
                    let bgClass = "bg-gray-200 hover:bg-gray-300 text-gray-800";
                    if (selected !== null) {
                        if (option === data.answer) bgClass = "bg-green-500 text-white";
                        else if (option === selected) bgClass = "bg-red-500 text-white";
                    }

                    return (
                        <button
                            key={idx}
                            className={`p-3 rounded-lg ${bgClass} transition-all duration-300 shadow-sm hover:scale-105`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
