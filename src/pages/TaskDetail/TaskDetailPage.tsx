import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Edit3,
    Flame,
    Folder,
    Play,
    RefreshCw,
    Target,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    addTaskToToday,
    completeTask,
    getTaskFullDetails,
    type TaskFullDetails,
} from '../../lib/tasks';
import './TaskDetailPage.css';

function formatStatus(status: string) {
    const labels: Record<string, string> = {
        inbox: 'Inbox',
        clarified: 'Ready to Plan',
        planned: 'Planned',
        active: 'Active',
        done: 'Done',
        needs_recovery: 'Needs Recovery',
        archived: 'Archived',
    };

    return labels[status] ?? status;
}

function formatContext(context: string | null) {
    if (!context) return 'Not set';

    const labels: Record<string, string> = {
        deep_work: 'Deep Work',
        admin: 'Admin',
        errand: 'Errand',
        communication: 'Communication',
        learning: 'Learning',
    };

    return labels[context] ?? context;
}

function formatEnergy(energy: string | null) {
    if (!energy) return 'Not set';

    return energy.charAt(0).toUpperCase() + energy.slice(1);
}

function formatFriction(friction: string | null) {
    if (!friction) return 'None';

    const labels: Record<string, string> = {
        vague: 'Vague',
        too_big: 'Too big',
        blocked: 'Blocked',
        boring: 'Boring',
        uncertain: 'Uncertain',
        emotional: 'Emotional',
        low_energy: 'Low energy',
        interrupted: 'Interrupted',
        not_important: 'Not important',
    };

    return labels[friction] ?? friction;
}

function formatMinutes(minutes: number | null) {
    if (minutes === null) return 'Not set';

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

function formatDate(dateString: string | null) {
    if (!dateString) return 'Not set';

    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function formatDateOnly(dateString: string | null) {
    if (!dateString) return 'Not set';

    return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
        dateStyle: 'medium',
    });
}

const TaskDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId: string }>();

    const [details, setDetails] = useState<TaskFullDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadTaskDetails() {
        if (!taskId) {
            setErrorMessage('Task ID is missing.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const taskDetails = await getTaskFullDetails(taskId);
            setDetails(taskDetails);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not load task details.';

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTaskDetails();
    }, [taskId]);

    async function handleAddToToday() {
        if (!taskId) return;

        setWorking(true);
        setErrorMessage('');

        try {
            await addTaskToToday(taskId);
            await loadTaskDetails();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not add task to today.';

            setErrorMessage(message);
        } finally {
            setWorking(false);
        }
    }

    async function handleCompleteTask() {
        if (!taskId) return;

        setWorking(true);
        setErrorMessage('');

        try {
            await completeTask(taskId);
            await loadTaskDetails();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Could not complete task.';

            setErrorMessage(message);
        } finally {
            setWorking(false);
        }
    }

    const task = details?.task;
    const project = details?.project;

    const canAddToToday =
        task?.status === 'clarified' || task?.status === 'needs_recovery';

    const canFocus = task?.status === 'planned' || task?.status === 'active';

    const canComplete =
        task &&
        task.status !== 'done' &&
        task.status !== 'archived' &&
        task.status !== 'inbox';

    return (
        <AppLayout>
            <div className="task-detail-container">
                <button
                    type="button"
                    className="task-detail-back"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {loading && (
                    <p className="task-detail-message">Loading task details...</p>
                )}

                {errorMessage && (
                    <p className="task-detail-error">{errorMessage}</p>
                )}

                {!loading && task && details && (
                    <>
                        <header className="task-detail-header">
                            <div>
                                <span className={`task-status-pill status-${task.status}`}>
                                    {formatStatus(task.status)}
                                </span>

                                <h2>{task.next_action || task.title}</h2>

                                {task.next_action && (
                                    <p className="task-original-title">
                                        Original task: {task.title}
                                    </p>
                                )}
                            </div>

                            <div className="task-detail-actions">
                                {task.status === 'inbox' && (
                                    <button
                                        type="button"
                                        className="task-detail-primary-button"
                                        onClick={() => navigate(`/clarify-task/${task.id}`)}
                                    >
                                        <Edit3 size={16} />
                                        Clarify Task
                                    </button>
                                )}

                                {task.status !== 'inbox' && task.status !== 'done' && (
                                    <button
                                        type="button"
                                        className="task-detail-secondary-button"
                                        onClick={() => navigate(`/clarify-task/${task.id}`)}
                                    >
                                        <Edit3 size={16} />
                                        Edit Details
                                    </button>
                                )}

                                {canAddToToday && (
                                    <button
                                        type="button"
                                        className="task-detail-primary-button"
                                        onClick={handleAddToToday}
                                        disabled={working}
                                    >
                                        <Calendar size={16} />
                                        {working ? 'Adding...' : 'Add to Today'}
                                    </button>
                                )}

                                {canFocus && (
                                    <button
                                        type="button"
                                        className="task-detail-primary-button"
                                        onClick={() => navigate(`/focus/${task.id}`)}
                                    >
                                        <Play size={16} />
                                        {task.status === 'active' ? 'Resume Focus' : 'Start Focus'}
                                    </button>
                                )}

                                {canComplete && (
                                    <button
                                        type="button"
                                        className="task-detail-success-button"
                                        onClick={handleCompleteTask}
                                        disabled={working}
                                    >
                                        <CheckCircle size={16} />
                                        {working ? 'Completing...' : 'Mark Done'}
                                    </button>
                                )}
                            </div>
                        </header>

                        <div className="task-detail-grid">
                            <section className="task-detail-card task-detail-main-card">
                                <div className="task-detail-section-header">
                                    <Target size={18} />
                                    <h3>Task</h3>
                                </div>

                                <div className="task-detail-field">
                                    <span>Original Capture</span>
                                    <p>{task.title}</p>
                                </div>

                                <div className="task-detail-field">
                                    <span>Next Action</span>
                                    <p>{task.next_action || 'Not clarified yet.'}</p>
                                </div>

                                <div className="task-detail-field">
                                    <span>Why This Matters</span>
                                    <p>{task.why_it_matters || 'Not set.'}</p>
                                </div>

                                <div className="task-detail-field">
                                    <span>Description</span>
                                    <p>{task.description || 'No description.'}</p>
                                </div>
                            </section>

                            <section className="task-detail-card">
                                <div className="task-detail-section-header">
                                    <Folder size={18} />
                                    <h3>Project</h3>
                                </div>

                                {project ? (
                                    <>
                                        <div className="task-detail-field">
                                            <span>Name</span>
                                            <p>{project.name}</p>
                                        </div>

                                        <div className="task-detail-field">
                                            <span>Outcome</span>
                                            <p>{project.outcome || 'Not set.'}</p>
                                        </div>

                                        <div className="task-detail-field">
                                            <span>Status</span>
                                            <p>{formatStatus(project.status)}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="task-detail-muted">No project assigned.</p>
                                )}
                            </section>

                            <section className="task-detail-card">
                                <div className="task-detail-section-header">
                                    <Clock size={18} />
                                    <h3>Planning Details</h3>
                                </div>

                                <div className="task-detail-meta-grid">
                                    <div>
                                        <span>Status</span>
                                        <strong>{formatStatus(task.status)}</strong>
                                    </div>

                                    <div>
                                        <span>Scheduled For</span>
                                        <strong>{formatDateOnly(task.scheduled_for)}</strong>
                                    </div>

                                    <div>
                                        <span>Due At</span>
                                        <strong>{formatDate(task.due_at)}</strong>
                                    </div>

                                    <div>
                                        <span>Estimate</span>
                                        <strong>{formatMinutes(task.estimated_minutes)}</strong>
                                    </div>

                                    <div>
                                        <span>Actual</span>
                                        <strong>{formatMinutes(task.actual_minutes)}</strong>
                                    </div>

                                    <div>
                                        <span>Energy</span>
                                        <strong>{formatEnergy(task.energy_required)}</strong>
                                    </div>

                                    <div>
                                        <span>Context</span>
                                        <strong>{formatContext(task.context)}</strong>
                                    </div>

                                    <div>
                                        <span>Friction</span>
                                        <strong>{formatFriction(task.friction_type)}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="task-detail-card">
                                <div className="task-detail-section-header">
                                    <Calendar size={18} />
                                    <h3>Dates</h3>
                                </div>

                                <div className="task-detail-field">
                                    <span>Created</span>
                                    <p>{formatDate(task.created_at)}</p>
                                </div>

                                <div className="task-detail-field">
                                    <span>Updated</span>
                                    <p>{formatDate(task.updated_at)}</p>
                                </div>

                                <div className="task-detail-field">
                                    <span>Completed</span>
                                    <p>{formatDate(task.completed_at)}</p>
                                </div>
                            </section>

                            <section className="task-detail-card">
                                <div className="task-detail-section-header">
                                    <Flame size={18} />
                                    <h3>Focus History</h3>
                                </div>

                                {details.focusSessions.length === 0 && (
                                    <p className="task-detail-muted">No focus sessions yet.</p>
                                )}

                                {details.focusSessions.map((session) => (
                                    <div key={session.id} className="task-detail-list-row">
                                        <div>
                                            <strong>
                                                {session.completed ? 'Completed session' : 'Focus session'}
                                            </strong>
                                            <span>{formatDate(session.started_at)}</span>
                                        </div>

                                        <p>
                                            Duration: {formatMinutes(session.duration_minutes)}
                                            {session.ended_at ? ` · Ended ${formatDate(session.ended_at)}` : ' · Still open'}
                                        </p>

                                        {session.notes && <p>Notes: {session.notes}</p>}
                                    </div>
                                ))}
                            </section>

                            <section className="task-detail-card">
                                <div className="task-detail-section-header">
                                    <RefreshCw size={18} />
                                    <h3>Plan History</h3>
                                </div>

                                {details.planHistory.length === 0 && (
                                    <p className="task-detail-muted">This task has not been added to a daily plan yet.</p>
                                )}

                                {details.planHistory.map((plan) => (
                                    <div key={plan.id} className="task-detail-list-row">
                                        <div>
                                            <strong>{formatDateOnly(plan.plan_date)}</strong>
                                            <span>{formatStatus(plan.plan_status)}</span>
                                        </div>

                                        <p>
                                            Commitment: {plan.commitment_level}
                                            {plan.main_outcome ? ` · Main outcome: ${plan.main_outcome}` : ''}
                                        </p>
                                    </div>
                                ))}
                            </section>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default TaskDetailPage;