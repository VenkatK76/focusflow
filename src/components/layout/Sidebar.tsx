import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Calendar, Folder, Inbox, Target, BarChart2, Settings, Leaf, Plus } from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
    { name: 'Today', icon: Calendar, path: '/today' },
    { name: 'Projects', icon: Folder, path: '/projects' },
    { name: 'Inbox', icon: Inbox, path: '/inbox' },
    { name: 'Focus', icon: Target, path: '/focus' },
    { name: 'Review', icon: BarChart2, path: '/review' },
    { name: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <div className="brand">
                    <div className="brand-icon">
                        <Leaf size={20} color="#ffffff" />
                    </div>
                    <div className="brand-text">
                        <h1>FocusFlow</h1>
                    </div>
                </div>

                <nav className="nav-menu">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                to={item.path}
                                key={item.name}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="sidebar-footer">
                <Link to="/new-task" className="new-task-btn">
                    <Plus size={18} />
                    <span>New Task</span>
                </Link>
            </div>
        </aside>
    );
};