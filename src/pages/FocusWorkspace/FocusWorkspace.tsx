import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Settings, X, Target, Pause, Check, FileText } from 'lucide-react';
import './FocusWorkspace.css';

const FocusWorkspace: React.FC = () => {
    // Mocking state for the timer to demonstrate proper implementation
    // 42 mins 15 seconds = 2535 seconds total
    const [timeLeft] = useState(2535);
    const totalSessionTime = 3600; // Assuming a 60-minute focus block for the ring math

    // Calculate dynamic ring drain
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    // Offset increases as time drops, hiding the green stroke
    const strokeDashoffset = circumference - (timeLeft / totalSessionTime) * circumference;

    // Format time for display
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const displayTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
        <AppLayout>
            <div className="focus-container">

                {/* Top Right Window Controls */}
                <div className="focus-top-actions">
                    <button className="icon-btn round-bg">
                        <Settings size={18} />
                    </button>
                    <button className="icon-btn round-bg">
                        <X size={18} />
                    </button>
                </div>

                {/* Main Focus Content */}
                <div className="focus-content">

                    <div className="focus-header">
                        <span className="focus-badge">
                            <Target size={14} className="badge-icon" /> Deep Work Session
                        </span>
                        <h2 className="focus-title">Finalize Q3 Strategic Planning Document</h2>
                        <p className="focus-subtitle">Next Action: Write executive summary</p>
                    </div>

                    {/* Dynamic SVG Timer */}
                    <div className="timer-wrapper">
                        <svg viewBox="0 0 300 300" className="timer-svg">
                            {/* Grey Track */}
                            <circle
                                className="timer-ring-bg"
                                cx="150" cy="150" r={radius}
                            />
                            {/* Green Progress */}
                            <circle
                                className="timer-ring-fill"
                                cx="150" cy="150" r={radius}
                                style={{
                                    strokeDasharray: circumference,
                                    strokeDashoffset: strokeDashoffset
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
                        <input type="text" placeholder="Capture a thought..." />
                        <FileText size={18} className="capture-icon" />
                    </div>

                    {/* Controls */}
                    <div className="focus-controls">
                        <button className="btn-pause">
                            <Pause size={14} fill="currentColor" /> Pause
                        </button>
                        <button className="btn-complete">
                            <Check size={16} strokeWidth={3} /> Complete
                        </button>
                        <button className="text-link">Need help?</button>
                        <button className="text-link">Reschedule</button>
                    </div>

                </div>

                {/* Footer */}
                <div className="focus-footer">
                    <p>Progress is a quiet series of small wins.</p>
                </div>

            </div>
        </AppLayout>
    );
};

export default FocusWorkspace;