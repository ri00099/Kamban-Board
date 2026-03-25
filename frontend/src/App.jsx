import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import BoardsPage from "./pages/BoardsPage";
import BoardDetailPage from "./pages/BoardsDetailPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import WorkspaceDetailPage from "./pages/WorkSpaceDetailPage";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Existing */}
            <Route path="/boards" element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />
            <Route path="/boards/:id" element={<ProtectedRoute><BoardDetailPage /></ProtectedRoute>} />

            {/* New */}
            <Route path="/workspaces" element={<ProtectedRoute><WorkspacesPage /></ProtectedRoute>} />
            <Route path="/workspaces/:id" element={<ProtectedRoute><WorkspaceDetailPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}