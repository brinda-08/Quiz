import axios from "axios";
import { data } from "./data.js";


const formattedQuestions = data.map((q) => ({
  text: q.question,
  options: q.options,
  correct: q.correct
}));

axios
  .post("http://localhost:5000/api/quizzes", {
    title: "General Knowledge (Static)",
    questions: formattedQuestions
  })
  .then(() => console.log("✅ Static quiz uploaded"))
  .catch((err) => {
    console.error("❌ Upload failed:");
    console.error(err.response?.data || err.message || err);
  });
