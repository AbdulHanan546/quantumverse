import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import StudentHome from "./pages/student/Home";
import ChapterTopics from "./pages/student/ChapterTopic";
import Navbar from "./components/Navbar";
import TopicRenderer from "./components/TopicRenderer";
import GeneratedSlidesPage from './pages/GeneratedSlidesPage';
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import { fetchTopic } from "./services/cms";
import LandingPage from "./pages/landing-page/LandingPage";
import { getMyProgress, getMyStats } from "./api/progress";
import { Profile } from "./components/Profile";
import { comptonEffectTopic } from "./data/compton";
import { Simulations } from "./components/Simulations";
import { TopicFlow } from "./components/TopicFlow";
import Leaderboard from "./components/Leaderboards";
import { TestTopic } from "./components/TestTopic";

function AppWrapper() {
  const [topicData, setTopicData] = useState<any | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function f() {
      const data = await getMyStats();
      console.log("My data", data);
    }; f();
  })

  const handleTopicSelect = async (documentId: string) => {
    try {
      const data = await fetchTopic(documentId);
      setTopicData(data);
    } catch (err) {
      console.error("Failed to load topic:", err);
    }
  };
// function TopicRendererWrapper() {
//   const location = useLocation();
//   const state = location.state as { components?: any[] };

//   if (state?.components?.length) {
//     return <TopicRenderer components={state.components} />;
//   }
//   return (
//     <div className="p-10 text-center text-slate-400">
//       No topic loaded. Please go back and choose one.
//     </div>
//   );
// }
  // Hide Navbar for any topic route
  // const hideNavbar = location.pathname.startsWith("/topic/") || location.pathname === '/';

  return (
    <div className="w-full min-h-screen bg-black text-white">

      <Routes>
        {/* Student Home → CHAPTER LIST */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["student", "admin"]}>
              <StudentHome />
            </ProtectedRoute>
          }
        />

        {/* Chapter → Topic List */}
        <Route
          path="/chapter/:id"
          element={
            <ProtectedRoute roles={["student", "admin"]}>
              <ChapterTopics />
            </ProtectedRoute>
          }
        />

        {/* Topic Renderer */}
        <Route
          path="/topic/:topicId"
          element={
            <TopicFlow />
          }
        />

        {/* Generated slides (from AI) */}
        <Route
          path="/topic/generated-slides"
          element={<GeneratedSlidesPage />}
        />

        <Route
          path="/profile"
          element={
            <Profile />
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/test/:mode/:number" element={<TestTopic />} />
        {/* <Route path="/slides" element={<TopicRenderer components={comptonEffectTopic} />} /> */}
        <Route path="/simulations" element={<Simulations />} />
        <Route path="/leaderboards" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ProgressProvider>
          <AppWrapper />
        </ProgressProvider>
      </AuthProvider>
    </Router>
  );
}
