import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Save, LogOut, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile, updateCurrentProfile, type Profile } from '../../lib/profile';
import { signOut } from '../../lib/auth';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [fullName, setFullName] = useState('');
    const [timezone, setTimezone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setErrorMessage('');

            try {
                const profileData = await getCurrentProfile();

                setProfile(profileData);
                setFullName(profileData.full_name ?? '');
                setTimezone(profileData.timezone);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Could not load profile.';

                setErrorMessage(message);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const updatedProfile = await updateCurrentProfile({
                fullName,
                timezone,
            });

            setProfile(updatedProfile);
            setSuccessMessage('Settings saved.');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not save settings.';

            setErrorMessage(message);
        } finally {
            setSaving(false);
        }
    }

    async function handleSignOut() {
        setSigningOut(true);
        setErrorMessage('');

        try {
            await signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Could not sign out.';

            setErrorMessage(message);
        } finally {
            setSigningOut(false);
        }
    }

    return (
        <AppLayout>
            <div className="settings-container">
                <header className="page-header">
                    <div>
                        <h2>Settings</h2>
                        <p>Manage your FocusFlow profile and preferences.</p>
                    </div>
                </header>

                {loading && (
                    <p className="settings-message">
                        Loading settings...
                    </p>
                )}

                {errorMessage && (
                    <p className="settings-error-message">
                        {errorMessage}
                    </p>
                )}

                {successMessage && (
                    <p className="settings-success-message">
                        {successMessage}
                    </p>
                )}

                {!loading && profile && (
                    <div className="settings-grid">
                        <section className="settings-card">
                            <div className="settings-card-header">
                                <div className="settings-icon-circle">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3>Profile</h3>
                                    <p>Update how FocusFlow identifies you.</p>
                                </div>
                            </div>

                            <form className="settings-form" onSubmit={handleSave}>
                                <div className="settings-input-group">
                                    <label htmlFor="fullName">Full name</label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Alex Doe"
                                        value={fullName}
                                        onChange={(event) => setFullName(event.target.value)}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="settings-input-group">
                                    <label htmlFor="timezone">Timezone</label>
                                    <div className="settings-input-with-icon">
                                        <Clock size={16} />
                                        <input
                                            id="timezone"
                                            type="text"
                                            placeholder="Asia/Kolkata"
                                            value={timezone}
                                            onChange={(event) => setTimezone(event.target.value)}
                                            disabled={saving}
                                        />
                                    </div>
                                    <span className="settings-help-text">
                                        Used for planning today, reviews, and local dates.
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    className="settings-primary-button"
                                    disabled={saving}
                                >
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save settings'}
                                </button>
                            </form>
                        </section>

                        <section className="settings-card">
                            <div className="settings-card-header">
                                <div className="settings-icon-circle danger">
                                    <LogOut size={18} />
                                </div>
                                <div>
                                    <h3>Account</h3>
                                    <p>Manage your current session.</p>
                                </div>
                            </div>

                            <div className="settings-account-info">
                                <span>User ID</span>
                                <code>{profile.id}</code>
                            </div>

                            <button
                                type="button"
                                className="settings-danger-button"
                                onClick={handleSignOut}
                                disabled={signingOut}
                            >
                                <LogOut size={16} />
                                {signingOut ? 'Signing out...' : 'Sign out'}
                            </button>
                        </section>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default SettingsPage;