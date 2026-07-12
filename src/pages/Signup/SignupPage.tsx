import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signUpWithEmail } from '../../lib/auth';
import './SignupPage.css';

const SignupPage: React.FC = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const data = await signUpWithEmail({
                email,
                password,
                fullName,
            });

            if (data.session) {
                navigate('/today');
                return;
            }

            setSuccessMessage(
                'Account created. Please check your email to confirm your account, then log in.'
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not create your account. Please try again.';

            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-layout">
            <div className="signup-card">

                {/* Header */}
                <div className="signup-header">
                    <div className="brand-icon-circle">
                        <Leaf size={24} color="#006c49" />
                    </div>
                    <h1>Start your journey with FocusFlow</h1>
                    <p>Create an account to reclaim your focus and intentionality</p>
                </div>

                {/* Form */}
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            placeholder="Alex Doe"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="alex@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            disabled={loading}
                            required
                            minLength={6}
                        />
                    </div>

                    {errorMessage && (
                        <p className="auth-message auth-message-error">
                            {errorMessage}
                        </p>
                    )}

                    {successMessage && (
                        <p className="auth-message auth-message-success">
                            {successMessage}
                        </p>
                    )}

                    <button type="submit" className="btn-signup" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default SignupPage;