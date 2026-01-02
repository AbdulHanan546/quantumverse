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
import AdminSignUp from "./pages/admin/AdminSignUp";
import AdminSignIn from "./pages/admin/AdminSignIn";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserDetail from "./pages/admin/AdminUserDetail";

function AppWrapper() {
  const [topicData, setTopicData] = useState<any | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function f() {
      const data = await getMyStats();
      console.log("My data", data);
    }; f();
  })

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

        {/* Admin Routes */}
        <Route path="/admin/signup" element={<AdminSignUp />} />
        <Route path="/admin/signin" element={<AdminSignIn />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUserDetail />
            </ProtectedRoute>
          }
        />

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
