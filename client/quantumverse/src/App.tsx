import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import StudentHome from "./pages/student/Home";
import ChapterTopics from "./pages/student/ChapterTopic";
import Navbar from "./components/Navbar";
import TopicRenderer from "./components/TopicRenderer";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";
import { fetchTopic } from "./services/cms";

export default function App() {
  const [topicData, setTopicData] = useState<any | null>(null);

  const handleTopicSelect = async (documentId: string) => {
    try {
      const data = await fetchTopic(documentId);
      setTopicData(data);
    } catch (err) {
      console.error("Failed to load topic:", err);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <div className="w-full min-h-screen bg-black text-white">
          <Navbar />

          <Routes>

            {/* Auth Pages */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Student Home → CHAPTER LIST */}
            <Route
              path="/student"
              element={
                <ProtectedRoute roles={["student", "admin"]}>
                  <StudentHome />
                </ProtectedRoute>
              }
            />

            {/* NEW: Chapter → Topic List */}
            <Route
  path="/chapter/:id"
  element={
    <ProtectedRoute roles={["student", "admin"]}>
      <ChapterTopics onSelectTopic={handleTopicSelect} />
    </ProtectedRoute>
  }
/>


            {/* Topic Renderer */}
            <Route
              path="/topic/:slug"
              element={
                topicData ? (
                  <TopicRenderer components={topicData} />
                ) : (
                  <div className="p-10 text-center text-slate-400">
                    No topic loaded. Please go back and choose one.
                  </div>
                )
              }
            />

            {/* Default Routes */}
            <Route path="/" element={<SignIn />} />
            <Route path="*" element={<SignIn />} />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
