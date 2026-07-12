import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Rocket, BookOpen, Building2, MoreVertical, Plus } from 'lucide-react';
import {
    archiveProject,
    createProject,
    getProjectsByStatus,
    type ProjectWithStats,
} from '../../lib/projects';
import './ProjectsDashboard.css';

const PROJECT_THEMES = ['green', 'purple', 'blue'] as const;
const PROJECT_ICONS = [Rocket, BookOpen, Building2];

function getProjectTheme(index: number) {
    return PROJECT_THEMES[index % PROJECT_THEMES.length];
}

function getProjectIcon(index: number) {
    return PROJECT_ICONS[index % PROJECT_ICONS.length];
}

const ProjectsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [projects, setProjects] = useState<ProjectWithStats[]>([]);

    const [isCreating, setIsCreating] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [projectOutcome, setProjectOutcome] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function loadProjects(tab = activeTab) {
        setLoading(true);
        setErrorMessage('');

        try {
            const projectData = await getProjectsByStatus(tab);
            setProjects(projectData);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not load projects.';

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProjects(activeTab);
    }, [activeTab]);

    async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setErrorMessage('');

        try {
            await createProject({
                name: projectName,
                description: projectDescription,
                outcome: projectOutcome,
            });

            setProjectName('');
            setProjectDescription('');
            setProjectOutcome('');
            setIsCreating(false);

            await loadProjects('active');
            setActiveTab('active');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not create project.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

    async function handleArchiveProject(projectId: string) {
        setSaving(true);
        setErrorMessage('');

        try {
            await archiveProject(projectId);
            await loadProjects(activeTab);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not archive project.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AppLayout>
            <div className="projects-container">

                {/* Page Header */}
                <header className="page-header">
                    <div>
                        <h2>Projects</h2>
                        <p>Organize your focus by area.</p>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <button
                            type="button"
                            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active
                        </button>
                        <button
                            type="button"
                            className={`tab-button ${activeTab === 'archived' ? 'active' : ''}`}
                            onClick={() => setActiveTab('archived')}
                        >
                            Archived
                        </button>
                    </div>
                </header>

                {errorMessage && (
                    <p className="projects-error-message">
                        {errorMessage}
                    </p>
                )}

                {loading && (
                    <p className="projects-empty-message">
                        Loading projects...
                    </p>
                )}

                {!loading && (
                    <>
                        {/* Projects Grid */}
                        <div className="projects-grid">

                            {/* New Project Form Card */}
                            {isCreating && activeTab === 'active' && (
                                <form className="project-card new-project-form" onSubmit={handleCreateProject}>
                                    <h3>Create Project</h3>

                                    <div className="project-form-group">
                                        <label htmlFor="projectName">Project name</label>
                                        <input
                                            id="projectName"
                                            type="text"
                                            placeholder="Product Launch"
                                            value={projectName}
                                            onChange={(event) => setProjectName(event.target.value)}
                                            disabled={saving}
                                            required
                                        />
                                    </div>

                                    <div className="project-form-group">
                                        <label htmlFor="projectOutcome">Outcome</label>
                                        <input
                                            id="projectOutcome"
                                            type="text"
                                            placeholder="What should this project make possible?"
                                            value={projectOutcome}
                                            onChange={(event) => setProjectOutcome(event.target.value)}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="project-form-group">
                                        <label htmlFor="projectDescription">Description</label>
                                        <textarea
                                            id="projectDescription"
                                            placeholder="Add a short description..."
                                            value={projectDescription}
                                            onChange={(event) => setProjectDescription(event.target.value)}
                                            disabled={saving}
                                        />
                                    </div>

                                    <div className="project-form-actions">
                                        <button
                                            type="button"
                                            className="btn-action"
                                            onClick={() => setIsCreating(false)}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn-action primary"
                                            disabled={saving || !projectName.trim()}
                                        >
                                            {saving ? 'Creating...' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Existing Projects */}
                            {projects.map((project, index) => {
                                const Icon = getProjectIcon(index);
                                const theme = getProjectTheme(index);

                                return (
                                    <div key={project.id} className="project-card">
                                        <div className="project-card-header">
                                            <div className={`project-icon bg-${theme}`}>
                                                <Icon size={18} className={`text-${theme}`} />
                                            </div>

                                            {activeTab === 'active' && (
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    title="Archive project"
                                                    onClick={() => handleArchiveProject(project.id)}
                                                    disabled={saving}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="project-card-body">
                                            <h3>{project.name}</h3>
                                            <p>
                                                {project.description ||
                                                    project.outcome ||
                                                    'No description yet.'}
                                            </p>
                                        </div>

                                        <div className="project-card-footer">
                                            <div className="progress-stats">
                                                <span className="task-count">
                                                    {project.total_tasks} {project.total_tasks === 1 ? 'task' : 'tasks'}
                                                </span>
                                                <span className={`progress-percent text-${theme}`}>
                                                    {project.progress_percent}%
                                                </span>
                                            </div>

                                            <div className="progress-bar-container">
                                                <div
                                                    className={`progress-bar-fill fill-${theme}`}
                                                    style={{ width: `${project.progress_percent}%` }}
                                                ></div>
                                            </div>

                                            {project.needs_recovery_tasks > 0 && (
                                                <p className="project-recovery-note">
                                                    {project.needs_recovery_tasks} need recovery
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty State */}
                            {projects.length === 0 && !isCreating && (
                                <div className="project-card projects-empty-card">
                                    <h3>
                                        {activeTab === 'active'
                                            ? 'No active projects yet'
                                            : 'No archived projects yet'}
                                    </h3>
                                    <p>
                                        {activeTab === 'active'
                                            ? 'Create your first project to organize your work.'
                                            : 'Archived projects will appear here.'}
                                    </p>
                                </div>
                            )}

                            {/* New Project Action Card */}
                            {activeTab === 'active' && !isCreating && (
                                <button
                                    type="button"
                                    className="project-card new-project-card"
                                    onClick={() => setIsCreating(true)}
                                >
                                    <div className="new-project-icon">
                                        <Plus size={24} color="#64748b" />
                                    </div>
                                    <h3>New Project</h3>
                                    <p>Create a new focus area</p>
                                </button>
                            )}

                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default ProjectsDashboard;