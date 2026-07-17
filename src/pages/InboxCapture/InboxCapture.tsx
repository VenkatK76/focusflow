import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Image as ImageIcon, Link, Mic, Send, Circle, Clock } from 'lucide-react';
import {
    addTaskToToday,
    createInboxTask,
    getInboxTasks,
    getReadyToPlanTasks,
    type InboxTask,
    type ReadyToPlanTask,
} from '../../lib/tasks';
import './InboxCapture.css';

function formatRelativeTime(dateString: string) {
    const createdAt = new Date(dateString).getTime();
    const now = Date.now();
    const diffMs = now - createdAt;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return 'Just now';
    }

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    if (diffDays === 1) {
        return 'Yesterday';
    }

    return `${diffDays}d ago`;
}

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

const InboxCapture: React.FC = () => {
    const navigate = useNavigate();

    const [captureText, setCaptureText] = useState('');
    const [inboxItems, setInboxItems] = useState<InboxTask[]>([]);
    const [readyToPlanItems, setReadyToPlanItems] = useState<ReadyToPlanTask[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [planningTaskId, setPlanningTaskId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadInboxTasks() {
        setLoading(true);
        setErrorMessage('');

        try {
            const [tasks, readyTasks] = await Promise.all([
                getInboxTasks(),
                getReadyToPlanTasks(),
            ]);

            setInboxItems(tasks);
            setReadyToPlanItems(readyTasks);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not load inbox tasks.';

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInboxTasks();
    }, []);

    async function handleSave() {
        setSaving(true);
        setErrorMessage('');

        try {
            const newTask = await createInboxTask(captureText);

            setInboxItems((currentItems) => [newTask, ...currentItems]);
            setCaptureText('');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not save task. Please try again.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

    async function handleAddReadyTaskToToday(taskId: string) {
        setPlanningTaskId(taskId);
        setErrorMessage('');

        try {
            await addTaskToToday(taskId);

            setReadyToPlanItems((currentItems) =>
                currentItems.filter((item) => item.id !== taskId)
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not add task to today.';

            setErrorMessage(message);
        } finally {
            setPlanningTaskId(null);
        }
    }

    function openTaskDetail(taskId: string) {
        navigate(`/tasks/${taskId}`);
    }

    return (
        <AppLayout>
            <div className="inbox-container">

                {/* Page Header */}
                <header className="page-header">
                    <div>
                        <h2>Inbox</h2>
                        <p>Capture everything on your mind.</p>
                    </div>
                </header>

                {/* Capture Input Area */}
                <div className="capture-card">
                    <textarea
                        className="capture-input"
                        placeholder="Capture anything..."
                        rows={4}
                        value={captureText}
                        onChange={(event) => setCaptureText(event.target.value)}
                        disabled={saving}
                    ></textarea>

                    <div className="capture-actions">
                        <div className="action-icons">
                            <button type="button" className="icon-btn" aria-label="Add image">
                                <ImageIcon size={18} />
                            </button>
                            <button type="button" className="icon-btn" aria-label="Add link">
                                <Link size={18} />
                            </button>
                            <button type="button" className="icon-btn" aria-label="Record audio">
                                <Mic size={18} />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSave}
                            disabled={saving || !captureText.trim()}
                        >
                            {saving ? 'Saving...' : 'Save'} <Send size={14} className="send-icon" />
                        </button>
                    </div>

                    {errorMessage && (
                        <p className="inbox-error-message">
                            {errorMessage}
                        </p>
                    )}
                </div>

                {/* Capture Inbox */}
                <div className="inbox-list">
                    <div className="inbox-section-header">
                        <h3>Capture Inbox</h3>
                        <span>
                            {inboxItems.length} {inboxItems.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>

                    {loading && (
                        <p className="inbox-empty-message">
                            Loading inbox...
                        </p>
                    )}

                    {!loading && inboxItems.length === 0 && (
                        <p className="inbox-empty-message">
                            Your capture inbox is clear. Capture anything that needs your attention.
                        </p>
                    )}

                    {!loading && inboxItems.map((item) => (
                        <div
                            key={item.id}
                            className="inbox-item-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => openTaskDetail(item.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    openTaskDetail(item.id);
                                }
                            }}
                        >
                            <div className="inbox-item-checkbox">
                                <Circle size={20} className="radio-icon" />
                            </div>
                            <div className="inbox-item-content">
                                <p className="inbox-item-title">{item.title}</p>
                                <div className="inbox-item-meta">
                                    <div className="meta-time">
                                        <Clock size={12} />
                                        <span>{formatRelativeTime(item.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ready to Plan */}
                <div className="inbox-list ready-to-plan-list">
                    <div className="inbox-section-header">
                        <h3>Ready to Plan</h3>
                        <span>
                            {readyToPlanItems.length} {readyToPlanItems.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>

                    {!loading && readyToPlanItems.length === 0 && (
                        <p className="inbox-empty-message">
                            Clarified tasks will appear here before you add them to today.
                        </p>
                    )}

                    {!loading && readyToPlanItems.map((item) => (
                        <div
                            key={item.id}
                            className="inbox-item-card ready-to-plan-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => openTaskDetail(item.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    openTaskDetail(item.id);
                                }
                            }}
                        >
                            <div className="inbox-item-checkbox">
                                <Circle size={20} className="radio-icon" />
                            </div>

                            <div className="inbox-item-content">
                                <p className="inbox-item-title">
                                    {item.next_action || item.title}
                                </p>

                                <div className="inbox-item-meta">
                                    <div className="meta-time">
                                        <Clock size={12} />
                                        <span>{formatRelativeTime(item.updated_at)}</span>
                                    </div>

                                    <span className="ready-meta">
                                        {formatMinutes(item.estimated_minutes)} · {formatContext(item.context)}
                                    </span>
                                </div>

                                {item.why_it_matters && (
                                    <p className="ready-why">
                                        {item.why_it_matters}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                className="ready-plan-button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleAddReadyTaskToToday(item.id);
                                }}
                                disabled={planningTaskId === item.id}
                            >
                                {planningTaskId === item.id ? 'Adding...' : 'Add to Today'}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </AppLayout>
    );
};

export default InboxCapture;