import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/Signup/SignupPage';
import LoginPage from './pages/Login/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CommitmentBoard from './pages/CommitmentBoard/CommitmentBoard';
import InboxCapture from './pages/InboxCapture/InboxCapture';
import ProjectsDashboard from './pages/ProjectsDashboard/ProjectsDashboard';
import FocusWorkspace from './pages/FocusWorkspace/FocusWorkspace';
import TaskClarification from './pages/TaskClarification/TaskClarification';
import ReviewPage from './pages/ReviewPage/ReviewPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to Today's screen */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route
          path="/today"
          element={
            <ProtectedRoute>
              <CommitmentBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxCapture />
            </ProtectedRoute>
          }
        />
        {/* Add future routes here as we build them */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/focus"
          element={
            <ProtectedRoute>
              <FocusWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clarify-task"
          element={
            <ProtectedRoute>
              <TaskClarification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;