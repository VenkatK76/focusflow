import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import './NotFoundPage.css';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <AppLayout>
            <div className="not-found-container">
                <h1>Page not found</h1>
                <p>This page does not exist, or it may have moved.</p>

                <button
                    type="button"
                    className="not-found-button"
                    onClick={() => navigate('/today')}
                >
                    Back to Today
                </button>
            </div>
        </AppLayout>
    );
};

export default NotFoundPage;