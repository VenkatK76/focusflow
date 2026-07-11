import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<CommitmentBoard />} />
        <Route path="/inbox" element={<InboxCapture />} />
        {/* Add future routes here as we build them */}
        <Route path="/projects" element={<ProjectsDashboard />} />
        <Route path="/focus" element={<FocusWorkspace />} />
        <Route path="/clarify-task" element={<TaskClarification />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
};

export default App;