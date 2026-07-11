import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { X, Battery, BatteryMedium, BatteryFull, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './TaskClarification.css';

const TaskClarification: React.FC = () => {
    const navigate = useNavigate();

    // State for selections
    const [duration, setDuration] = useState('1h');
    const [energy, setEnergy] = useState('Medium');
    const [project, setProject] = useState('Work');
    const [context, setContext] = useState('Deep Work');

    return (
        <AppLayout>
            <div className="task-clarification-container">
                <div className="task-form-card">

                    {/* Header */}
                    <header className="form-header">
                        <div>
                            <h2>Task Clarification</h2>
                            <p>Let's break this down into actionable steps.</p>
                        </div>
                        <button className="close-btn" onClick={() => navigate(-1)}>
                            <X size={20} />
                        </button>
                    </header>

                    <div className="form-scroll-area">

                        {/* Section 1: Core Info */}
                        <div className="form-section">
                            <div className="input-group">
                                <label>Original Task</label>
                                <div className="input-read-only">Prepare presentation</div>
                                <span className="help-text">This is what you originally wrote down.</span>
                            </div>

                            <div className="input-group">
                                <label>Next Action</label>
                                <span className="help-text-top">What is the very first physical action you need to take? Make it small.</span>
                                <input type="text" defaultValue="Draft the first 3 slides" className="form-input" />
                            </div>

                            <div className="input-group">
                                <label>Why This Matters</label>
                                <span className="help-text-top">Connect this to your larger goals or motivations.</span>
                                <input type="text" defaultValue="Sets the foundation for the client meeting" className="form-input" />
                            </div>
                        </div>

                        <hr className="divider" />

                        {/* Section 2: Parameters */}
                        <div className="form-section">
                            <h3 className="section-title">Define parameters</h3>

                            <div className="parameters-row">
                                <div className="param-group">
                                    <label className="sub-label">Estimated Duration</label>
                                    <div className="pill-group">
                                        {['15m', '30m', '1h', '2h+'].map(val => (
                                            <button
                                                key={val}
                                                className={`pill-btn ${duration === val ? 'active-outline' : ''}`}
                                                onClick={() => setDuration(val)}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="param-group">
                                    <label className="sub-label">Energy Required</label>
                                    <div className="pill-group">
                                        <button className={`pill-btn ${energy === 'Low' ? 'active-outline' : ''}`} onClick={() => setEnergy('Low')}>
                                            <Battery size={14} /> Low
                                        </button>
                                        <button className={`pill-btn ${energy === 'Medium' ? 'active-outline' : ''}`} onClick={() => setEnergy('Medium')}>
                                            <BatteryMedium size={14} /> Medium
                                        </button>
                                        <button className={`pill-btn ${energy === 'High' ? 'active-outline' : ''}`} onClick={() => setEnergy('High')}>
                                            <BatteryFull size={14} /> High
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="param-group">
                                <label className="sub-label">Project</label>
                                <div className="pill-group">
                                    {['Work', 'Personal', 'Side Project'].map(val => (
                                        <button
                                            key={val}
                                            className={`pill-btn ${project === val ? 'active-outline' : ''}`}
                                            onClick={() => setProject(val)}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="param-group">
                                <label className="sub-label">Context</label>
                                <div className="pill-group">
                                    {['Deep Work', 'Admin', 'Errand', 'Communication', 'Learning'].map(val => (
                                        <button
                                            key={val}
                                            className={`pill-btn ${context === val ? 'active-solid' : ''}`}
                                            onClick={() => setContext(val)}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Obstacles */}
                        <div className="form-section">
                            <h3 className="section-title">Anticipate obstacles</h3>
                            <div className="input-group">
                                <label className="sub-label text-bold">Possible Blocker</label>
                                <span className="help-text-top">What might stop you from starting or finishing this?</span>
                                <input type="text" defaultValue="None" className="form-input" />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <footer className="form-actions">
                        <button className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                        <div className="action-right">
                            <button className="btn-secondary">Save clarified task</button>
                            <button className="btn-primary-solid">
                                Add to today <CheckCircle size={16} />
                            </button>
                        </div>
                    </footer>

                </div>
            </div>
        </AppLayout>
    );
};

export default TaskClarification;