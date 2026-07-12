import React from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { CheckCircle, ArrowRight, Sun } from 'lucide-react';
import './ReviewPage.css';

const ReviewPage: React.FC = () => {
    return (
        <AppLayout>
            <div className="review-container">
                {/* Header */}
                <div className="review-header">
                    <span className="badge-daily"><Sun size={14} /> Daily Reflection</span>
                    <h1>Close the Day</h1>
                    <p>Take a moment to acknowledge what you've done, release what's left, and clear your mind for tomorrow.</p>
                </div>

                {/* Finished Section */}
                <section className="review-section">
                    <div className="section-head">
                        <h3><CheckCircle size={18} /> What you finished</h3>
                        <span className="count-badge">3 Completed</span>
                    </div>
                    <ul className="finished-list">
                        <li>Draft Q3-Strategy Document <span className="sub">Focus Session - 90m</span></li>
                        <li>Review design wireframes with team</li>
                        <li>Update sprint-board</li>
                    </ul>
                </section>

                {/* Unfinished Section */}
                <section className="review-section">
                    <h3>Unfinished tasks</h3>
                    <p className="hint">Be gentle with yourself.</p>

                    <div className="unfinished-item">
                        <input type="checkbox" />
                        <div className="task-info">
                            <span className="task-title">Finalize budget estimates</span>
                            <div className="task-actions">
                                <select className="reason-select"><option>What got in the way?</option></select>
                                <div className="action-btns">
                                    <button className="btn-action primary">Reschedule</button>
                                    <button className="btn-action">Shrink task</button>
                                    <button className="btn-action">Archive</button>
                                    <button className="btn-action">Move to inbox</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reflection */}
                <section className="reflection-section">
                    <h3>Reflection</h3>
                    <p>Let's clear the mental cache.</p>
                    <label>One thing I learned today...</label>
                    <textarea placeholder="Jot down a quick thought..." />
                    <button className="btn-close-day">Close the day <ArrowRight size={16} /></button>
                </section>
            </div>
        </AppLayout>
    );
};

export default ReviewPage;