import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Image as ImageIcon, Link, Mic, Send, Circle, Clock } from 'lucide-react';
import './InboxCapture.css';

// Mock data for the inbox items based on the design
const INBOX_ITEMS = [
    {
        id: 1,
        title: 'Review the Q3 marketing budget proposal and send feedback to Sarah before Friday.',
        time: '2h ago',
    },
    {
        id: 2,
        title: 'Call plumber about the leaking sink in the kitchen.',
        time: '5h ago',
    },
    {
        id: 3,
        title: "Draft outline for the upcoming 'Design Systems at Scale' presentation.",
        time: 'Yesterday',
        tag: 'Work',
    },
];

const InboxCapture: React.FC = () => {
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
                    ></textarea>

                    <div className="capture-actions">
                        <div className="action-icons">
                            <button className="icon-btn" aria-label="Add image">
                                <ImageIcon size={18} />
                            </button>
                            <button className="icon-btn" aria-label="Add link">
                                <Link size={18} />
                            </button>
                            <button className="icon-btn" aria-label="Record audio">
                                <Mic size={18} />
                            </button>
                        </div>
                        <button className="btn-primary">
                            Save <Send size={14} className="send-icon" />
                        </button>
                    </div>
                </div>

                {/* Inbox Task List */}
                <div className="inbox-list">
                    {INBOX_ITEMS.map((item) => (
                        <div key={item.id} className="inbox-item-card">
                            <div className="inbox-item-checkbox">
                                <Circle size={20} className="radio-icon" />
                            </div>
                            <div className="inbox-item-content">
                                <p className="inbox-item-title">{item.title}</p>
                                <div className="inbox-item-meta">
                                    <div className="meta-time">
                                        <Clock size={12} />
                                        <span>{item.time}</span>
                                    </div>
                                    {item.tag && (
                                        <span className="tag tag-blue">{item.tag}</span>
                                    )}
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