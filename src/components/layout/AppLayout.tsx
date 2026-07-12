import React, { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import './AppLayout.css';

interface AppLayoutProps {
    children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};