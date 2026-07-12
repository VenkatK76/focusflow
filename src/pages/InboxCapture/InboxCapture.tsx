import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { Image as ImageIcon, Link, Mic, Send, Circle, Clock } from 'lucide-react';
import { createInboxTask, getInboxTasks, type InboxTask } from '../../lib/tasks';
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

const InboxCapture: React.FC = () => {
    const navigate = useNavigate();

    const [captureText, setCaptureText] = useState('');
    const [inboxItems, setInboxItems] = useState<InboxTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadInboxTasks() {
        setLoading(true);
        setErrorMessage('');

        try {
            const tasks = await getInboxTasks();
            setInboxItems(tasks);
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

    function openClarification(taskId: string) {
        navigate(`/clarify-task/${taskId}`);
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

                {/* Inbox Task List */}
                <div className="inbox-list">
                    {loading && (
                        <p className="inbox-empty-message">
                            Loading inbox...
                        </p>
                    )}

                    {!loading && inboxItems.length === 0 && (
                        <p className="inbox-empty-message">
                            Your inbox is clear. Capture anything that needs your attention.
                        </p>
                    )}

                    {!loading && inboxItems.map((item) => (
                        <div
                            key={item.id}
                            className="inbox-item-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => openClarification(item.id)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    openClarification(item.id);
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

            </div>
        </AppLayout>
    );
};

export default InboxCapture;