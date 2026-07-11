import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Rocket, BookOpen, Building2, MoreVertical, Plus } from 'lucide-react';
import './ProjectsDashboard.css';

// Mock data structured for future API integration
const PROJECTS_DATA = [
    {
        id: 1,
        title: 'Product Launch',
        description: 'Q3 Major feature release including new dashboard and...',
        tasksCount: 12,
        progress: 65,
        icon: Rocket,
        theme: 'green',
    },
    {
        id: 2,
        title: 'Personal Growth',
        description: 'Reading lists, language learning, and skill development tracking.',
        tasksCount: 8,
        progress: 30,
        icon: BookOpen,
        theme: 'purple',
    },
    {
        id: 3,
        title: 'Client: Helios',
        description: 'Website redesign and branding refresh deliverables.',
        tasksCount: 24,
        progress: 85,
        icon: Building2,
        theme: 'blue',
    },
];

const ProjectsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

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
                            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Active
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'archived' ? 'active' : ''}`}
                            onClick={() => setActiveTab('archived')}
                        >
                            Archived
                        </button>
                    </div>
                </header>

                {/* Projects Grid */}
                <div className="projects-grid">

                    {/* Map through existing projects */}
                    {PROJECTS_DATA.map((project) => {
                        const Icon = project.icon;
                        return (
                            <div key={project.id} className="project-card">
                                <div className="project-card-header">
                                    <div className={`project-icon bg-${project.theme}`}>
                                        <Icon size={18} className={`text-${project.theme}`} />
                                    </div>
                                    <button className="icon-btn">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className="project-card-body">
                                    <h3>{project.title}</h3>
                                    <p>{project.description}</p>
                                </div>

                                <div className="project-card-footer">
                                    <div className="progress-stats">
                                        <span className="task-count">{project.tasksCount} tasks</span>
                                        <span className={`progress-percent text-${project.theme}`}>
                                            {project.progress}%
                                        </span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className={`progress-bar-fill fill-${project.theme}`}
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* New Project Action Card */}
                    <button className="project-card new-project-card">
                        <div className="new-project-icon">
                            <Plus size={24} color="#64748b" />
                        </div>
                        <h3>New Project</h3>
                        <p>Create a new focus area</p>
                    </button>

                </div>
            </div>
        </AppLayout>
    );
};

export default ProjectsDashboard;