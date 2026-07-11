import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Leaf, RefreshCw, Circle } from 'lucide-react';
import './CommitmentBoard.css';

const CommitmentBoard: React.FC = () => {
  return (
    <AppLayout>
      {/* Header */}
      <header className="page-header">
        <div>
          <h2>Good morning, Alex.</h2>
          <p>Let's commit to a realistic day.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <span className="btn-icon-plus"></span> Add Task
          </button>
          <button className="btn-primary">
            <span className="btn-icon-play"></span> Start Focus
          </button>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">

        {/* Left Column: Commitment List */}
        <div className="col-left">
          <section className="card commitment-card">
            <div className="card-header">
              <h3>Today's Commitment</h3>
              <span className="badge">3 items</span>
            </div>

            {/* Main Outcome */}
            <div className="main-outcome">
              <span className="section-label">MAIN OUTCOME</span>
              <h4>Finalize Q3 Strategy Deck</h4>
              <p>
                Review analytics, synthesize key findings, and structure the
                presentation flow for tomorrow's team sync.
              </p>
            </div>

            {/* Supporting Tasks */}
            <div className="supporting-tasks">
              <span className="section-label">SUPPORTING TASKS</span>

              <div className="task-item">
                <div className="task-checkbox"></div>
                <div className="task-details">
                  <span className="task-title">Draft executive summary</span>
                  <span className="task-time">Est. 45m</span>
                </div>
              </div>

              <div className="task-item">
                <div className="task-checkbox"></div>
                <div className="task-details">
                  <span className="task-title">Review competitor data</span>
                  <span className="task-time">Est. 30m</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Widgets */}
        <div className="col-right">

          {/* Capacity Widget */}
          <section className="card capacity-card">
            <span className="section-label">DAILY CAPACITY</span>

            <div className="progress-circle-container">
              <svg viewBox="0 0 100 100" className="progress-ring">
                <circle className="progress-ring-bg" cx="50" cy="50" r="40"></circle>
                <circle className="progress-ring-fill" cx="50" cy="50" r="40"></circle>
              </svg>
              <div className="progress-text">
                <span>85%</span>
              </div>
            </div>

            <div className="status-badge">
              <Leaf size={14} /> A realistic day
            </div>
            <p className="capacity-desc">
              You have a healthy balance of deep work and admin tasks scheduled.
            </p>
          </section>

          {/* Needs Recovery Widget */}
          <section className="card recovery-card">
            <div className="recovery-header">
              <RefreshCw size={18} className="recovery-icon" />
              <h3>Needs Recovery</h3>
            </div>
            <p className="recovery-sub">Items carried over from yesterday</p>

            <div className="recovery-list">
              <div className="recovery-item">
                <Circle size={18} className="radio-icon" />
                <div className="recovery-details">
                  <span className="recovery-title">Email marketing draft</span>
                  <span className="tag tag-purple">Admin</span>
                </div>
              </div>

              <div className="recovery-item">
                <Circle size={18} className="radio-icon" />
                <div className="recovery-details">
                  <span className="recovery-title">Approve design...</span>
                  <span className="tag tag-blue">Quick</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default CommitmentBoard;