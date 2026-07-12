import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { CheckCircle, ArrowRight, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    closeTodayWithReview,
    getTodayReviewData,
    markTaskNeedsRecovery,
    type TodayPlanTask,
} from '../../lib/tasks';
import './ReviewPage.css';

function formatMinutes(minutes: number | null) {
    if (!minutes) {
        return 'No estimate';
    }

    if (minutes < 60) {
        return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
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

const ReviewPage: React.FC = () => {
    const navigate = useNavigate();

    const [completedTasks, setCompletedTasks] = useState<TodayPlanTask[]>([]);
    const [unfinishedTasks, setUnfinishedTasks] = useState<TodayPlanTask[]>([]);

    const [mainBlocker, setMainBlocker] = useState('');
    const [reflection, setReflection] = useState('');

    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    async function loadReviewData() {
        setLoading(true);
        setErrorMessage('');

        try {
            const data = await getTodayReviewData();

            setCompletedTasks(data.completedTasks);
            setUnfinishedTasks(data.unfinishedTasks);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not load today’s review.';

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReviewData();
    }, []);

    async function handleCloseDay() {
        setClosing(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await closeTodayWithReview({
                mainBlocker,
                reflection,
            });

            await Promise.all(
                unfinishedTasks.map((task) => markTaskNeedsRecovery(task.task_id))
            );

            setSuccessMessage('Day closed. Unfinished tasks now need recovery.');
            navigate('/today');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not close the day.';

            setErrorMessage(message);
        } finally {
            setClosing(false);
        }
    }

    return (
        <AppLayout>
            <div className="review-container">
                {/* Header */}
                <div className="review-header">
                    <span className="badge-daily">
                        <Sun size={14} /> Daily Reflection
                    </span>
                    <h1>Close the Day</h1>
                    <p>
                        Take a moment to acknowledge what you've done, release what's left,
                        and clear your mind for tomorrow.
                    </p>
                </div>

                {errorMessage && (
                    <p className="review-error-message">
                        {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p className="review-success-message">
                        {successMessage}
                    </p>
                )}

                {loading && (
                    <p className="review-empty-message">
                        Loading review...
                    </p>
                )}

                {!loading && (
                    <>
                        {/* Finished Section */}
                        <section className="review-section">
                            <div className="section-head">
                                <h3>
                                    <CheckCircle size={18} /> What you finished
                                </h3>
                                <span className="count-badge">
                                    {completedTasks.length} Completed
                                </span>
                            </div>

                            {completedTasks.length === 0 && (
                                <p className="review-empty-message">
                                    No completed tasks yet today.
                                </p>
                            )}

                            {completedTasks.length > 0 && (
                                <ul className="finished-list">
                                    {completedTasks.map((task) => (
                                        <li key={task.task_id}>
                                            {task.next_action || task.title}
                                            <span className="sub">
                                                {formatContext(task.context)} · {formatMinutes(task.estimated_minutes)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {/* Unfinished Section */}
                        <section className="review-section">
                            <h3>Unfinished tasks</h3>
                            <p className="hint">Be gentle with yourself.</p>

                            {unfinishedTasks.length === 0 && (
                                <p className="review-empty-message">
                                    Nothing unfinished. Nice work.
                                </p>
                            )}

                            {unfinishedTasks.map((task) => (
                                <div key={task.task_id} className="unfinished-item">
                                    <input type="checkbox" disabled />
                                    <div className="task-info">
                                        <span className="task-title">
                                            {task.next_action || task.title}
                                        </span>

                                        <div className="task-actions">
                                            <select
                                                className="reason-select"
                                                value={mainBlocker}
                                                onChange={(event) => setMainBlocker(event.target.value)}
                                                disabled={closing}
                                            >
                                                <option value="">What got in the way?</option>
                                                <option value="Too much planned">Too much planned</option>
                                                <option value="Low energy">Low energy</option>
                                                <option value="Blocked">Blocked</option>
                                                <option value="Interrupted">Interrupted</option>
                                                <option value="Task was unclear">Task was unclear</option>
                                            </select>

                                            <div className="action-btns">
                                                <button
                                                    type="button"
                                                    className="btn-action primary"
                                                    disabled={closing}
                                                >
                                                    Needs recovery
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action"
                                                    disabled
                                                >
                                                    Shrink task
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action"
                                                    disabled
                                                >
                                                    Archive
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-action"
                                                    disabled
                                                >
                                                    Move to inbox
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Reflection */}
                        <section className="reflection-section">
                            <h3>Reflection</h3>
                            <p>Let's clear the mental cache.</p>

                            <label htmlFor="daily-reflection">
                                One thing I learned today...
                            </label>

                            <textarea
                                id="daily-reflection"
                                placeholder="Jot down a quick thought..."
                                value={reflection}
                                onChange={(event) => setReflection(event.target.value)}
                                disabled={closing}
                            />

                            <button
                                type="button"
                                className="btn-close-day"
                                onClick={handleCloseDay}
                                disabled={closing}
                            >
                                {closing ? 'Closing the day...' : 'Close the day'}
                                <ArrowRight size={16} />
                            </button>
                        </section>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default ReviewPage;