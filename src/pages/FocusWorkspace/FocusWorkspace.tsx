import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Settings, X, Target, Pause, Check, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    finishFocusSession,
    getTaskById,
    getTodayPlan,
    startFocusSession,
    type FocusSession,
    type TodayPlanTask,
} from '../../lib/tasks';
import './FocusWorkspace.css';

type FocusTask = {
    id: string;
    title: string;
    next_action: string | null;
    estimated_minutes: number | null;
    context: string | null;
};

function formatContext(context: string | null) {
    if (!context) {
        return 'Focus Session';
    }

    const labels: Record<string, string> = {
        deep_work: 'Deep Work Session',
        admin: 'Admin Session',
        errand: 'Errand Session',
        communication: 'Communication Session',
        learning: 'Learning Session',
    };

    return labels[context] ?? 'Focus Session';
}

function plannedTaskToFocusTask(task: TodayPlanTask): FocusTask {
    return {
        id: task.task_id,
        title: task.title,
        next_action: task.next_action,
        estimated_minutes: task.estimated_minutes,
        context: task.context,
    };
}

function getSessionSeconds(task: FocusTask | null) {
    const minutes = task?.estimated_minutes ?? 25;

    return Math.max(minutes * 60, 60);
}

function formatTimer(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const FocusWorkspace: React.FC = () => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId: string }>();

    const [focusTask, setFocusTask] = useState<FocusTask | null>(null);
    const [focusSession, setFocusSession] = useState<FocusSession | null>(null);

    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [totalSessionTime, setTotalSessionTime] = useState(25 * 60);
    const [paused, setPaused] = useState(false);
    const [quickCapture, setQuickCapture] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function loadFocusTask() {
            setLoading(true);
            setErrorMessage('');

            try {
                let selectedTask: FocusTask | null = null;

                if (taskId) {
                    const task = await getTaskById(taskId);

                    selectedTask = {
                        id: task.id,
                        title: task.title,
                        next_action: task.next_action,
                        estimated_minutes: task.estimated_minutes,
                        context: task.context,
                    };
                } else {
                    const todayPlan = await getTodayPlan();

                    const items = todayPlan?.items ?? [];

                    const activeTask = items.find((item) => item.status === 'active');
                    const plannedTask = items.find((item) => item.status === 'planned');
                    const fallbackTask = items[0];

                    const taskToFocus = activeTask ?? plannedTask ?? fallbackTask ?? null;

                    selectedTask = taskToFocus ? plannedTaskToFocusTask(taskToFocus) : null;
                }

                if (!selectedTask) {
                    setFocusTask(null);
                    return;
                }

                const session = await startFocusSession(selectedTask.id);
                const sessionSeconds = getSessionSeconds(selectedTask);

                setFocusTask(selectedTask);
                setFocusSession(session);
                setTotalSessionTime(sessionSeconds);
                setTimeLeft(sessionSeconds);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Could not start focus session.';

                setErrorMessage(message);
            } finally {
                setLoading(false);
            }
        }

        loadFocusTask();
    }, [taskId]);

    useEffect(() => {
        if (loading || paused || saving || timeLeft <= 0) {
            return;
        }

        const timerId = window.setInterval(() => {
            setTimeLeft((currentTime) => Math.max(currentTime - 1, 0));
        }, 1000);

        return () => {
            window.clearInterval(timerId);
        };
    }, [loading, paused, saving, timeLeft]);

    async function handleComplete() {
        if (!focusSession) {
            setErrorMessage('No active focus session found.');
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await finishFocusSession({
                focusSessionId: focusSession.id,
                completedTask: true,
                notes: quickCapture.trim() || null,
            });

            navigate('/today');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not complete focus session.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

    async function handleExit() {
        if (!focusSession) {
            navigate('/today');
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await finishFocusSession({
                focusSessionId: focusSession.id,
                completedTask: false,
                notes: quickCapture.trim() || null,
            });

            navigate('/today');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not exit focus session.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference - (timeLeft / totalSessionTime) * circumference;

    const displayTime = formatTimer(timeLeft);

    return (
        <AppLayout>
            <div className="focus-container">

                {/* Top Right Window Controls */}
                <div className="focus-top-actions">
                    <button type="button" className="icon-btn round-bg">
                        <Settings size={18} />
                    </button>
                    <button
                        type="button"
                        className="icon-btn round-bg"
                        onClick={handleExit}
                        disabled={saving}
                    >
                        <X size={18} />
                    </button>
                </div>

                {loading && (
                    <p className="focus-message">
                        Starting focus session...
                    </p>
                )}

                {!loading && errorMessage && (
                    <p className="focus-error-message">
                        {errorMessage}
                    </p>
                )}

                {!loading && !focusTask && !errorMessage && (
                    <div className="focus-empty-state">
                        <h2>No task ready for focus</h2>
                        <p>Add a clarified task to today first.</p>
                        <button
                            type="button"
                            className="btn-complete"
                            onClick={() => navigate('/today')}
                        >
                            Back to Today
                        </button>
                    </div>
                )}

                {!loading && focusTask && (
                    <>
                        {/* Main Focus Content */}
                        <div className="focus-content">

                            <div className="focus-header">
                                <span className="focus-badge">
                                    <Target size={14} className="badge-icon" /> {formatContext(focusTask.context)}
                                </span>
                                <h2 className="focus-title">{focusTask.title}</h2>
                                <p className="focus-subtitle">
                                    Next Action: {focusTask.next_action || focusTask.title}
                                </p>
                            </div>

                            {/* Dynamic SVG Timer */}
                            <div className="timer-wrapper">
                                <svg viewBox="0 0 300 300" className="timer-svg">
                                    {/* Grey Track */}
                                    <circle
                                        className="timer-ring-bg"
                                        cx="150"
                                        cy="150"
                                        r={radius}
                                    />
                                    {/* Green Progress */}
                                    <circle
                                        className="timer-ring-fill"
                                        cx="150"
                                        cy="150"
                                        r={radius}
                                        style={{
                                            strokeDasharray: circumference,
                                            strokeDashoffset,
                                        }}
                                    />
                                </svg>
                                <div className="timer-display">
                                    <h1 className="timer-digits">{displayTime}</h1>
                                    <span className="timer-label">remaining</span>
                                </div>
                            </div>

                            {/* Quick Capture Input */}
                            <div className="quick-capture">
                                <input
                                    type="text"
                                    placeholder="Capture a thought..."
                                    value={quickCapture}
                                    onChange={(event) => setQuickCapture(event.target.value)}
                                    disabled={saving}
                                />
                                <FileText size={18} className="capture-icon" />
                            </div>

                            {/* Controls */}
                            <div className="focus-controls">
                                <button
                                    type="button"
                                    className="btn-pause"
                                    onClick={() => setPaused((current) => !current)}
                                    disabled={saving}
                                >
                                    <Pause size={14} fill="currentColor" />
                                    {paused ? 'Resume' : 'Pause'}
                                </button>

                                <button
                                    type="button"
                                    className="btn-complete"
                                    onClick={handleComplete}
                                    disabled={saving}
                                >
                                    <Check size={16} strokeWidth={3} />
                                    {saving ? 'Completing...' : 'Complete'}
                                </button>

                                <button
                                    type="button"
                                    className="text-link"
                                    disabled={saving}
                                >
                                    Need help?
                                </button>

                                <button
                                    type="button"
                                    className="text-link"
                                    onClick={handleExit}
                                    disabled={saving}
                                >
                                    Reschedule
                                </button>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="focus-footer">
                            <p>Progress is a quiet series of small wins.</p>
                        </div>
                    </>
                )}

            </div>
        </AppLayout>
    );
};

export default FocusWorkspace;