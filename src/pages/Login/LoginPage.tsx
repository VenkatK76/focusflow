import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmail } from '../../lib/auth';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setLoading(true);
        setErrorMessage('');

        try {
            await signInWithEmail({
                email,
                password,
            });

            navigate('/today');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not sign in. Please try again.';

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-layout">
            <div className="login-card">

                {/* Header */}
                <div className="login-header">
                    <h1>FocusFlow</h1>
                    <p>Welcome back to your flow.</p>
                </div>

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label htmlFor="password">Password</label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                            disabled={loading}
                        />
                        <label htmlFor="remember">Remember me</label>
                    </div>

                    {errorMessage && (
                        <p className="auth-message auth-message-error">
                            {errorMessage}
                        </p>
                    )}

                    <button type="submit" className="btn-signin" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <hr className="login-divider" />
            </div>
        </div>
    );
};

export default LoginPage;