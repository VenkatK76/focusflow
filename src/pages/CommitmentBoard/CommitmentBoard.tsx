import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Leaf, RefreshCw, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getNeedsRecoveryTasks,
  getTodayPlan,
  type RecoveryTask,
  type TodayPlan,
  type TodayPlanTask,
} from '../../lib/tasks';
import './CommitmentBoard.css';

function formatMinutes(minutes: number | null) {
  if (!minutes) {
    return 'Est. not set';
  }

  if (minutes < 60) {
    return `Est. ${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `Est. ${hours}h`;
  }

  return `Est. ${hours}h ${remainingMinutes}m`;
}

function formatContext(context: string | null) {
  if (!context) {
    return 'Task';
  }

  const labels: Record<string, string> = {
    deep_work: 'Deep Work',
    admin: 'Admin',
    errand: 'Errand',
    communication: 'Communication',
    learning: 'Learning',
  };

  return labels[context] ?? context;
}

function getFirstName(fullName: unknown) {
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return 'there';
  }

  return fullName.trim().split(' ')[0];
}

function getMainOutcomeTask(items: TodayPlanTask[]) {
  const mustTask = items.find((item) => item.commitment_level === 'must');

  if (mustTask) {
    return mustTask;
  }

  return items[0] ?? null;
}

const CommitmentBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [recoveryTasks, setRecoveryTasks] = useState<RecoveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const firstName = getFirstName(user?.user_metadata?.full_name);

  async function loadTodayDashboard() {
    setLoading(true);
    setErrorMessage('');

    try {
      const [plan, recovery] = await Promise.all([
        getTodayPlan(),
        getNeedsRecoveryTasks(),
      ]);

      setTodayPlan(plan);
      setRecoveryTasks(recovery);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not load today dashboard.';

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodayDashboard();
  }, []);

  const todayItems = todayPlan?.items ?? [];
  const mainOutcomeTask = getMainOutcomeTask(todayItems);

  const totalPlannedMinutes = useMemo(() => {
    return todayItems.reduce((total, item) => {
      return total + (item.estimated_minutes ?? 0);
    }, 0);
  }, [todayItems]);

  const capacityPercent = Math.min(
    Math.round((totalPlannedMinutes / 360) * 100),
    100
  );

  const progressCircumference = 251;
  const progressDashOffset =
    progressCircumference - (capacityPercent / 100) * progressCircumference;

  const capacityLabel =
    totalPlannedMinutes === 0
      ? 'No plan yet'
      : totalPlannedMinutes <= 240
        ? 'A light day'
        : totalPlannedMinutes <= 360
          ? 'A realistic day'
          : 'A full day';

  const capacityDescription =
    totalPlannedMinutes === 0
      ? 'Add tasks to today from your Inbox after clarifying them.'
      : totalPlannedMinutes <= 360
        ? 'Your planned work looks manageable for today.'
        : 'This day may be over capacity. Consider moving something to another day.';

  return (
    <AppLayout>
      {/* Header */}
      <header className="page-header">
        <div>
          <h2>Good morning, {firstName}.</h2>
          <p>Let's commit to a realistic day.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/inbox')}
          >
            <span className="btn-icon-plus"></span> Add Task
          </button>

          <button
            type="button"
            className="btn-primary"
            disabled={todayItems.length === 0}
            onClick={() => navigate('/focus')}
          >
            <span className="btn-icon-play"></span> Start Focus
          </button>
        </div>
      </header>

      {errorMessage && (
        <p className="today-error-message">
          {errorMessage}
        </p>
      )}

      {loading && (
        <p className="today-empty-message">
          Loading today...
        </p>
      )}

      {!loading && (
        <div className="dashboard-grid">

          {/* Left Column: Commitment List */}
          <div className="col-left">
            <section className="card commitment-card">
              <div className="card-header">
                <h3>Today's Commitment</h3>
                <span className="badge">
                  {todayItems.length} {todayItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {todayItems.length === 0 && (
                <div className="today-empty-state">
                  <h4>No tasks planned yet</h4>
                  <p>
                    Capture tasks in Inbox, clarify them, then use Add to today.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/inbox')}
                  >
                    Go to Inbox
                  </button>
                </div>
              )}

              {todayItems.length > 0 && (
                <>
                  {/* Main Outcome */}
                  <div className="main-outcome">
                    <span className="section-label">MAIN OUTCOME</span>
                    <h4>
                      {todayPlan?.main_outcome ||
                        mainOutcomeTask?.next_action ||
                        mainOutcomeTask?.title}
                    </h4>
                    <p>
                      {mainOutcomeTask?.why_it_matters ||
                        'This is the most important task currently planned for today.'}
                    </p>
                  </div>

                  {/* Supporting Tasks */}
                  <div className="supporting-tasks">
                    <span className="section-label">SUPPORTING TASKS</span>

                    {todayItems.map((item) => (
                      <div key={item.plan_item_id} className="task-item">
                        <div className="task-checkbox"></div>
                        <div className="task-details">
                          <span className="task-title">
                            {item.next_action || item.title}
                          </span>
                          <span className="task-time">
                            {formatMinutes(item.estimated_minutes)} · {formatContext(item.context)}
                            {item.project_name ? ` · ${item.project_name}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
                  <circle
                    className="progress-ring-fill"
                    cx="50"
                    cy="50"
                    r="40"
                    style={{
                      strokeDasharray: progressCircumference,
                      strokeDashoffset: progressDashOffset,
                    }}
                  ></circle>
                </svg>
                <div className="progress-text">
                  <span>{capacityPercent}%</span>
                </div>
              </div>

              <div className="status-badge">
                <Leaf size={14} /> {capacityLabel}
              </div>
              <p className="capacity-desc">
                {capacityDescription}
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
                {recoveryTasks.length === 0 && (
                  <p className="today-empty-message">
                    Nothing needs recovery right now.
                  </p>
                )}

                {recoveryTasks.map((task) => (
                  <div key={task.id} className="recovery-item">
                    <Circle size={18} className="radio-icon" />
                    <div className="recovery-details">
                      <span className="recovery-title">
                        {task.next_action || task.title}
                      </span>
                      <span className="tag tag-purple">
                        {formatContext(task.context)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default CommitmentBoard;