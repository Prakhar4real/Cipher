import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubjectChats from "./pages/dashboard/SubjectChats";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/dashboard/ChatPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/subjects/:subjectId/chats" element={<SubjectChats />} />
          <Route
            path="/subjects/:subjectId/chats/:chatId"
            element={<ChatPage />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
