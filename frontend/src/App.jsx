import React, { useState } from "react";
import QuizForm from "./components/QuizForm.jsx";
import QuizQuestion from "./components/QuizQuestion.jsx";
import Result from "./components/Result.jsx";

export default function App() {
  const [quizData, setQuizData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Interactive Quiz Generator</h1>

      {!quizData.length && (
        <QuizForm setQuizData={setQuizData} />
      )}

      {quizData.length > 0 && !showResult && (
        <QuizQuestion
          data={quizData[currentIndex]}
          onNext={(correct) => {
            if (correct) setScore(score + 1);
            if (currentIndex + 1 < quizData.length) {
              setCurrentIndex(currentIndex + 1);
            } else {
              setShowResult(true);
            }
          }}
        />
      )}

      {showResult && (
        <Result score={score} total={quizData.length} onRestart={() => {
          setQuizData([]);
          setCurrentIndex(0);
          setScore(0);
          setShowResult(false);
        }} />
      )}
    </div>
  );
}
