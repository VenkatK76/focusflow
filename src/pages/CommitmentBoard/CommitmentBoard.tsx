import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Leaf, RefreshCw, Circle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  completeTask,
  getNeedsRecoveryTasks,
  getTodayPlan,
  reopenTaskForToday,
  updateDailyPlanItemCommitmentLevel,
  type CommitmentLevel,
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

function getCommitmentLabel(commitmentLevel: TodayPlanTask['commitment_level']) {
  const labels = {
    must: 'Must',
    should: 'Should',
    could: 'Could',
  };

  return labels[commitmentLevel];
}

function sortTasksForToday(items: TodayPlanTask[]) {
  return [...items].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') {
      return 1;
    }

    if (a.status !== 'done' && b.status === 'done') {
      return -1;
    }

    return a.order_index - b.order_index;
  });
}

function getCommitmentGroups(items: TodayPlanTask[]) {
  return {
    must: sortTasksForToday(
      items.filter((item) => item.commitment_level === 'must')
    ),
    should: sortTasksForToday(
      items.filter((item) => item.commitment_level === 'should')
    ),
    could: sortTasksForToday(
      items.filter((item) => item.commitment_level === 'could')
    ),
  };
}

const CommitmentBoard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null);
  const [recoveryTasks, setRecoveryTasks] = useState<RecoveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const firstName = getFirstName(user?.user_metadata?.full_name);

  const allTodayItems = todayPlan?.items ?? [];

  const todayItems = allTodayItems.filter((item) => {
    return (
      item.status === 'planned' ||
      item.status === 'active' ||
      item.status === 'done'
    );
  });

  const remainingTodayItems = todayItems.filter((item) => item.status !== 'done');

  const mainOutcomeTask = getMainOutcomeTask(
    remainingTodayItems.length > 0 ? remainingTodayItems : todayItems
  );

  const commitmentGroups = getCommitmentGroups(todayItems);

  const totalPlannedMinutes = useMemo(() => {
    return todayItems.reduce((total, item) => {
      return total + (item.estimated_minutes ?? 0);
    }, 0);
  }, [todayItems]);

  const completedCount = todayItems.filter((item) => item.status === 'done').length;

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

  async function handleCommitmentChange(
    planItemId: string,
    commitmentLevel: CommitmentLevel
  ) {
    setErrorMessage('');

    try {
      await updateDailyPlanItemCommitmentLevel(planItemId, commitmentLevel);

      setTodayPlan((currentPlan) => {
        if (!currentPlan) {
          return currentPlan;
        }

        return {
          ...currentPlan,
          items: currentPlan.items.map((item) => {
            if (item.plan_item_id !== planItemId) {
              return item;
            }

            return {
              ...item,
              commitment_level: commitmentLevel,
            };
          }),
        };
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not update commitment level.';

      setErrorMessage(message);
    }
  }

  async function handleToggleTaskCompletion(item: TodayPlanTask) {
    setErrorMessage('');

    try {
      if (item.status === 'done') {
        await reopenTaskForToday(item.task_id);
      } else {
        await completeTask(item.task_id);
      }

      await loadTodayDashboard();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not update task completion.';

      setErrorMessage(message);
    }
  }

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
            disabled={remainingTodayItems.length === 0}
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
                  {completedCount}/{todayItems.length} completed
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
                        mainOutcomeTask?.title ||
                        'All planned tasks are complete'}
                    </h4>
                    <p>
                      {mainOutcomeTask?.why_it_matters ||
                        'This is the most important task currently planned for today.'}
                    </p>
                  </div>

                  {/* Supporting Tasks */}
                  <div className="supporting-tasks">
                    <span className="section-label">COMMITMENT LEVELS</span>

                    {(['must', 'should', 'could'] as const).map((level) => {
                      const tasks = commitmentGroups[level];

                      if (tasks.length === 0) {
                        return null;
                      }

                      return (
                        <div key={level} className="commitment-group">
                          <div className="commitment-group-header">
                            <h4>{getCommitmentLabel(level)}</h4>
                            <span>
                              {tasks.filter((task) => task.status === 'done').length}/
                              {tasks.length} completed
                            </span>
                          </div>

                          {tasks.map((item) => (
                            <div
                              key={item.plan_item_id}
                              className={`task-item task-item-clickable ${item.status === 'done' ? 'task-item-completed' : ''
                                }`}
                              role="button"
                              tabIndex={0}
                              onClick={() => navigate(`/tasks/${item.task_id}`)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  navigate(`/tasks/${item.task_id}`);
                                }
                              }}
                            >
                              <button
                                type="button"
                                className={`task-checkbox ${item.status === 'done' ? 'completed' : ''
                                  }`}
                                aria-label={
                                  item.status === 'done'
                                    ? 'Mark task incomplete'
                                    : 'Mark task complete'
                                }
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleToggleTaskCompletion(item);
                                }}
                              >
                                {item.status === 'done' && (
                                  <Check size={14} strokeWidth={3} />
                                )}
                              </button>

                              <div className="task-details">
                                <span
                                  className={`task-title ${item.status === 'done' ? 'completed' : ''
                                    }`}
                                >
                                  {item.next_action || item.title}
                                </span>

                                <span className="task-time">
                                  {formatMinutes(item.estimated_minutes)} · {formatContext(item.context)}
                                  {item.project_name ? ` · ${item.project_name}` : ''}
                                </span>
                              </div>

                              {item.status !== 'done' && (
                                <>
                                  <div
                                    className="today-commitment-picker"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    {(['must', 'should', 'could'] as CommitmentLevel[]).map((levelOption) => (
                                      <button
                                        type="button"
                                        key={levelOption}
                                        className={`today-commitment-pill ${item.commitment_level === levelOption ? 'active' : ''
                                          }`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleCommitmentChange(item.plan_item_id, levelOption);
                                        }}
                                      >
                                        {levelOption}
                                      </button>
                                    ))}
                                  </div>

                                  <button
                                    type="button"
                                    className="task-focus-button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate(`/focus/${item.task_id}`);
                                    }}
                                  >
                                    Focus
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
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
                  <div
                    key={task.id}
                    className="recovery-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        navigate(`/tasks/${task.id}`);
                      }
                    }}
                  >
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