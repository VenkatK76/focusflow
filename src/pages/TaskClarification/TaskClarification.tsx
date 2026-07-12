import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { X, Battery, BatteryMedium, BatteryFull, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    addTaskToToday,
    clarifyTask,
    getTaskById,
    type ClarifyTaskInput,
    type TaskDetail,
} from '../../lib/tasks';
import {
    getProjectsByStatus,
    type ProjectWithStats,
} from '../../lib/projects';
import './TaskClarification.css';

type DurationOption = '15m' | '30m' | '1h' | '2h+';
type EnergyOption = 'Low' | 'Medium' | 'High';
type ContextOption = 'Deep Work' | 'Admin' | 'Errand' | 'Communication' | 'Learning';

function durationToMinutes(duration: DurationOption) {
    if (duration === '15m') return 15;
    if (duration === '30m') return 30;
    if (duration === '1h') return 60;
    return 120;
}

function minutesToDuration(minutes: number | null): DurationOption {
    if (!minutes) return '30m';
    if (minutes <= 15) return '15m';
    if (minutes <= 30) return '30m';
    if (minutes <= 60) return '1h';
    return '2h+';
}

function energyToDbValue(energy: EnergyOption): ClarifyTaskInput['energy_required'] {
    if (energy === 'Low') return 'low';
    if (energy === 'High') return 'high';
    return 'medium';
}

function dbEnergyToUiValue(energy: TaskDetail['energy_required']): EnergyOption {
    if (energy === 'low') return 'Low';
    if (energy === 'high') return 'High';
    return 'Medium';
}

function contextToDbValue(context: ContextOption): ClarifyTaskInput['context'] {
    if (context === 'Deep Work') return 'deep_work';
    if (context === 'Admin') return 'admin';
    if (context === 'Errand') return 'errand';
    if (context === 'Communication') return 'communication';
    return 'learning';
}

function dbContextToUiValue(context: TaskDetail['context']): ContextOption {
    if (context === 'admin') return 'Admin';
    if (context === 'errand') return 'Errand';
    if (context === 'communication') return 'Communication';
    if (context === 'learning') return 'Learning';
    return 'Deep Work';
}

function blockerToFrictionType(blocker: string): ClarifyTaskInput['friction_type'] {
    const normalized = blocker.trim().toLowerCase();

    if (!normalized || normalized === 'none' || normalized === 'no' || normalized === 'nothing') {
        return null;
    }

    return 'blocked';
}

const TaskClarification: React.FC = () => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId: string }>();

    const [task, setTask] = useState<TaskDetail | null>(null);

    const [nextAction, setNextAction] = useState('');
    const [whyItMatters, setWhyItMatters] = useState('');
    const [duration, setDuration] = useState<DurationOption>('30m');
    const [energy, setEnergy] = useState<EnergyOption>('Medium');
    const [context, setContext] = useState<ContextOption>('Deep Work');
    const [possibleBlocker, setPossibleBlocker] = useState('None');

    const [projects, setProjects] = useState<ProjectWithStats[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function loadTask() {
            if (!taskId) {
                setErrorMessage('Task ID is missing.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage('');

            try {
                const [taskData, activeProjects] = await Promise.all([
                    getTaskById(taskId),
                    getProjectsByStatus('active'),
                ]);

                setTask(taskData);
                setProjects(activeProjects);
                setSelectedProjectId(taskData.project_id);
                setNextAction(taskData.next_action ?? '');
                setWhyItMatters(taskData.why_it_matters ?? '');
                setDuration(minutesToDuration(taskData.estimated_minutes));
                setEnergy(dbEnergyToUiValue(taskData.energy_required));
                setContext(dbContextToUiValue(taskData.context));
                setPossibleBlocker(taskData.friction_type === 'blocked' ? 'Blocked' : 'None');
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Could not load this task.';

                setErrorMessage(message);
            } finally {
                setLoading(false);
            }
        }

        loadTask();
    }, [taskId]);

    async function saveClarification() {
        if (!taskId) {
            setErrorMessage('Task ID is missing.');
            return null;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            const updatedTask = await clarifyTask(taskId, {
                next_action: nextAction,
                why_it_matters: whyItMatters,
                project_id: selectedProjectId,
                estimated_minutes: durationToMinutes(duration),
                energy_required: energyToDbValue(energy),
                context: contextToDbValue(context),
                friction_type: blockerToFrictionType(possibleBlocker),
            });

            setTask(updatedTask);
            return updatedTask;
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not save clarification.';

            setErrorMessage(message);
            return null;
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveClarifiedTask() {
        const updatedTask = await saveClarification();

        if (updatedTask) {
            navigate('/inbox');
        }
    }

    async function handleAddToToday() {
        const updatedTask = await saveClarification();

        if (!updatedTask || !taskId) {
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await addTaskToToday(taskId);
            navigate('/today');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not add task to today.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

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
                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            <X size={20} />
                        </button>
                    </header>

                    {loading && (
                        <div className="form-scroll-area">
                            <p className="task-form-message">Loading task...</p>
                        </div>
                    )}

                    {!loading && errorMessage && !task && (
                        <div className="form-scroll-area">
                            <p className="task-form-error">{errorMessage}</p>
                        </div>
                    )}

                    {!loading && task && (
                        <>
                            <div className="form-scroll-area">

                                {/* Section 1: Core Info */}
                                <div className="form-section">
                                    <div className="input-group">
                                        <label>Original Task</label>
                                        <div className="input-read-only">{task.title}</div>
                                        <span className="help-text">This is what you originally wrote down.</span>
                                    </div>

                                    <div className="input-group">
                                        <label>Next Action</label>
                                        <span className="help-text-top">What is the very first physical action you need to take? Make it small.</span>
                                        <input
                                            type="text"
                                            value={nextAction}
                                            onChange={(event) => setNextAction(event.target.value)}
                                            className="form-input"
                                            disabled={saving}
                                            placeholder="Draft the first 3 slides"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label>Why This Matters</label>
                                        <span className="help-text-top">Connect this to your larger goals or motivations.</span>
                                        <input
                                            type="text"
                                            value={whyItMatters}
                                            onChange={(event) => setWhyItMatters(event.target.value)}
                                            className="form-input"
                                            disabled={saving}
                                            placeholder="Sets the foundation for the client meeting"
                                        />
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
                                                {(['15m', '30m', '1h', '2h+'] as DurationOption[]).map((val) => (
                                                    <button
                                                        type="button"
                                                        key={val}
                                                        className={`pill-btn ${duration === val ? 'active-outline' : ''}`}
                                                        onClick={() => setDuration(val)}
                                                        disabled={saving}
                                                    >
                                                        {val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="param-group">
                                            <label className="sub-label">Energy Required</label>
                                            <div className="pill-group">
                                                <button
                                                    type="button"
                                                    className={`pill-btn ${energy === 'Low' ? 'active-outline' : ''}`}
                                                    onClick={() => setEnergy('Low')}
                                                    disabled={saving}
                                                >
                                                    <Battery size={14} /> Low
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`pill-btn ${energy === 'Medium' ? 'active-outline' : ''}`}
                                                    onClick={() => setEnergy('Medium')}
                                                    disabled={saving}
                                                >
                                                    <BatteryMedium size={14} /> Medium
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`pill-btn ${energy === 'High' ? 'active-outline' : ''}`}
                                                    onClick={() => setEnergy('High')}
                                                    disabled={saving}
                                                >
                                                    <BatteryFull size={14} /> High
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="param-group">
                                        <label className="sub-label">Project</label>

                                        <div className="pill-group">
                                            <button
                                                type="button"
                                                className={`pill-btn ${selectedProjectId === null ? 'active-outline' : ''}`}
                                                onClick={() => setSelectedProjectId(null)}
                                                disabled={saving}
                                            >
                                                No Project
                                            </button>

                                            {projects.map((project) => (
                                                <button
                                                    type="button"
                                                    key={project.id}
                                                    className={`pill-btn ${selectedProjectId === project.id ? 'active-outline' : ''}`}
                                                    onClick={() => setSelectedProjectId(project.id)}
                                                    disabled={saving}
                                                >
                                                    {project.name}
                                                </button>
                                            ))}
                                        </div>

                                        {projects.length === 0 && (
                                            <span className="help-text">
                                                Create projects from the Projects page to organize this task.
                                            </span>
                                        )}
                                    </div>

                                    <div className="param-group">
                                        <label className="sub-label">Context</label>
                                        <div className="pill-group">
                                            {(['Deep Work', 'Admin', 'Errand', 'Communication', 'Learning'] as ContextOption[]).map((val) => (
                                                <button
                                                    type="button"
                                                    key={val}
                                                    className={`pill-btn ${context === val ? 'active-solid' : ''}`}
                                                    onClick={() => setContext(val)}
                                                    disabled={saving}
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
                                        <input
                                            type="text"
                                            value={possibleBlocker}
                                            onChange={(event) => setPossibleBlocker(event.target.value)}
                                            className="form-input"
                                            disabled={saving}
                                            placeholder="None"
                                        />
                                    </div>
                                </div>

                                {errorMessage && (
                                    <p className="task-form-error">{errorMessage}</p>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <footer className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => navigate(-1)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <div className="action-right">
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={handleSaveClarifiedTask}
                                        disabled={saving || !nextAction.trim()}
                                    >
                                        {saving ? 'Saving...' : 'Save clarified task'}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-primary-solid"
                                        onClick={handleAddToToday}
                                        disabled={saving || !nextAction.trim()}
                                    >
                                        {saving ? 'Adding...' : 'Add to today'} <CheckCircle size={16} />
                                    </button>
                                </div>
                            </footer>
                        </>
                    )}

                </div>
            </div>
        </AppLayout>
    );
};

export default TaskClarification;