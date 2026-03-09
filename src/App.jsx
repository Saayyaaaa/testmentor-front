import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GeneratorPage from "./pages/GeneratorPage";
import ReviewPage from "./pages/ReviewPage";
import LearningPage from "./pages/LearningPage";
import StatisticsPage from "./pages/StatisticsPage";
import ProfilePage from "./pages/ProfilePage";
import QuizTakePage from "./pages/QuizTakePage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generator" element={<GeneratorPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/quiz/:id" element={<QuizTakePage />} />
        <Route path="/statistics/:id" element={<StatisticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}