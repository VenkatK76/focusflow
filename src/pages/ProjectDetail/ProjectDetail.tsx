import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ArrowLeft, Circle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import {
    getProjectById,
    getProjectTasks,
    type Project,
    type ProjectTask,
} from '../../lib/projects';
import './ProjectDetail.css';

function formatStatus(status: string) {
    const labels: Record<string, string> = {
        inbox: 'Inbox',
        clarified: 'Clarified',
        planned: 'Planned',
        active: 'Active',
        done: 'Done',
        needs_recovery: 'Needs Recovery',
        archived: 'Archived',
    };

    return labels[status] ?? status;
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

function getStatusIcon(status: string) {
    if (status === 'done') {
        return <CheckCircle size={18} className="project-task-icon done" />;
    }

    if (status === 'needs_recovery') {
        return <RefreshCw size={18} className="project-task-icon recovery" />;
    }

    if (status === 'planned' || status === 'active') {
        return <Clock size={18} className="project-task-icon planned" />;
    }

    return <Circle size={18} className="project-task-icon" />;
}

const ProjectDetail: React.FC = () => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function loadProject() {
            if (!projectId) {
                setErrorMessage('Project ID is missing.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage('');

            try {
                const [projectData, taskData] = await Promise.all([
                    getProjectById(projectId),
                    getProjectTasks(projectId),
                ]);

                setProject(projectData);
                setTasks(taskData);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Could not load project.';

                setErrorMessage(message);
            } finally {
                setLoading(false);
            }
        }

        loadProject();
    }, [projectId]);

    const stats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((task) => task.status === 'done').length;
        const needsRecovery = tasks.filter((task) => task.status === 'needs_recovery').length;
        const open = tasks.filter((task) => {
            return task.status !== 'done' && task.status !== 'archived';
        }).length;

        const progress = total === 0 ? 0 : Math.round((done / total) * 100);

        return {
            total,
            done,
            open,
            needsRecovery,
            progress,
        };
    }, [tasks]);

    function openTask(task: ProjectTask) {
        if (task.status === 'planned' || task.status === 'active') {
            navigate(`/focus/${task.id}`);
            return;
        }

        if (task.status === 'done') {
            return;
        }

        navigate(`/clarify-task/${task.id}`);
    }

    return (
        <AppLayout>
            <div className="project-detail-container">
                <button
                    type="button"
                    className="project-back-button"
                    onClick={() => navigate('/projects')}
                >
                    <ArrowLeft size={16} />
                    Back to Projects
                </button>

                {loading && (
                    <p className="project-detail-message">
                        Loading project...
                    </p>
                )}

                {errorMessage && (
                    <p className="project-detail-error">
                        {errorMessage}
                    </p>
                )}

                {!loading && project && (
                    <>
                        <header className="project-detail-header">
                            <div>
                                <span className="project-status-pill">
                                    {formatStatus(project.status)}
                                </span>
                                <h2>{project.name}</h2>
                                <p>
                                    {project.description ||
                                        project.outcome ||
                                        'No description yet.'}
                                </p>
                            </div>
                        </header>

                        <section className="project-stats-grid">
                            <div className="project-stat-card">
                                <span>Total Tasks</span>
                                <strong>{stats.total}</strong>
                            </div>

                            <div className="project-stat-card">
                                <span>Open</span>
                                <strong>{stats.open}</strong>
                            </div>

                            <div className="project-stat-card">
                                <span>Done</span>
                                <strong>{stats.done}</strong>
                            </div>

                            <div className="project-stat-card">
                                <span>Progress</span>
                                <strong>{stats.progress}%</strong>
                            </div>
                        </section>

                        <section className="project-tasks-section">
                            <div className="project-section-header">
                                <h3>Project Tasks</h3>
                                {stats.needsRecovery > 0 && (
                                    <span className="project-recovery-pill">
                                        {stats.needsRecovery} need recovery
                                    </span>
                                )}
                            </div>

                            {tasks.length === 0 && (
                                <div className="project-empty-state">
                                    <h4>No tasks linked yet</h4>
                                    <p>
                                        Assign tasks to this project from the Task Clarification screen.
                                    </p>
                                </div>
                            )}

                            {tasks.map((task) => (
                                <button
                                    type="button"
                                    key={task.id}
                                    className="project-task-row"
                                    onClick={() => openTask(task)}
                                    disabled={task.status === 'done'}
                                >
                                    {getStatusIcon(task.status)}

                                    <div className="project-task-content">
                                        <span className="project-task-title">
                                            {task.next_action || task.title}
                                        </span>

                                        <span className="project-task-meta">
                                            {formatStatus(task.status)} · {formatMinutes(task.estimated_minutes)}
                                        </span>

                                        {task.why_it_matters && (
                                            <span className="project-task-why">
                                                {task.why_it_matters}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </section>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default ProjectDetail;