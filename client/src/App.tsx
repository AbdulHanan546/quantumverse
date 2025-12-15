import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import StudentHome from "./pages/student/Home";
import ChapterTopics from "./pages/student/ChapterTopic";
import Navbar from "./components/Navbar";
import TopicRenderer from "./components/TopicRenderer";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function AppWrapper() {
  const location = useLocation();

  function TopicRendererWrapper() {
  const location = useLocation();
  const state = location.state as { components?: any[] };

  console.log("TopicRendererWrapper - location.state:", location.state);
  console.log("TopicRendererWrapper - components:", state?.components);

  if (state?.components?.length) {
    return <TopicRenderer components={state.components} />;
  }
  return (
    <div className="p-10 text-center text-slate-400">
      No topic loaded. Please go back and choose one.
    </div>
  );
}
  // Hide Navbar for any topic route
  const hideNavbar = location.pathname.startsWith("/topic/");

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {!hideNavbar && <Navbar />}

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
          path="/topic/:slug"
          element={
            <TopicRendererWrapper />
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="*" element={<SignIn />} />
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