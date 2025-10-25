import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Topics from "../pages/Topics";
import About from "../pages/About";
import Navbar from "../components/Navbar";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
