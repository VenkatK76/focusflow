import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/auth';

type LogoutButtonProps = {
    className?: string;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            className={className}
            onClick={handleLogout}
            disabled={loading}
        >
            {loading ? 'Signing out...' : 'Sign out'}
        </button>
    );
};

export default LogoutButton;