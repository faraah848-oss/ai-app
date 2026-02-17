import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Check, X, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

type EditMode = 'none' | 'username' | 'email' | 'password';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState<EditMode>('none');
    const [submitting, setSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState<any>({});

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile');
            setProfile(response.data.user);
            setFormData(prev => ({
                ...prev,
                name: response.data.user.name,
                email: response.data.user.email
            }));
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!formData.name.trim()) {
            toast.error('Username cannot be empty');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.patch('/auth/profile/username', { name: formData.name });
            setProfile(response.data.user);
            setEditMode('none');
            toast.success('Username updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update username');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!formData.email.trim()) {
            toast.error('Email cannot be empty');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.patch('/auth/profile/email', { email: formData.email });
            setProfile(response.data.user);
            setEditMode('none');
            toast.success('Email updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update email');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error('All fields are required');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSubmitting(true);
        try {
            await api.patch('/auth/profile/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setEditMode('none');
            toast.success('Password updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setSubmitting(false);
        }
    };

    const togglePasswordVisibility = (field: string) => {
        setShowPasswords((prev: any) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] opacity-30"></div>
                <div className="relative flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="relative max-w-2xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">Profile Settings</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-semibold group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                </div>

                {/* Current Profile Overview */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-lg shadow-slate-200/20">
                    <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-6">Current Information</h2>

                    <div className="space-y-6">
                        {/* Username Display */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Username</p>
                                    <p className="text-lg font-semibold text-slate-900">{profile?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Display */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                                    <p className="text-lg font-semibold text-slate-900">{profile?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Password Display */}
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 font-medium">Password Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lg font-semibold text-slate-900">Active & Secure</span>
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">PROTECTED</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-3 text-xs text-blue-800">
                            <p className="font-medium mb-1">🔒 Security Note:</p>
                            <p>Your password is encrypted and cannot be displayed for security reasons. You can only change it by verifying your current password.</p>
                        </div>

                        <p className="text-xs text-slate-500 mt-4">
                            Member since {new Date(profile?.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Edit Forms */}
                <div className="space-y-6">
                    {/* Update Username */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-lg shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Update Username</h3>
                            {editMode !== 'username' && (
                                <button
                                    onClick={() => setEditMode('username')}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold text-xs rounded-lg transition-all"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editMode === 'username' ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter new username"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleUpdateUsername}
                                        disabled={submitting}
                                        className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode('none');
                                            setFormData(prev => ({ ...prev, name: profile?.name }));
                                        }}
                                        disabled={submitting}
                                        className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-600 text-sm">Current username: <span className="font-semibold">{profile?.name}</span></p>
                        )}
                    </div>

                    {/* Update Email */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-lg shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Update Email Address</h3>
                            {editMode !== 'email' && (
                                <button
                                    onClick={() => setEditMode('email')}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold text-xs rounded-lg transition-all"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editMode === 'email' ? (
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter new email"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleUpdateEmail}
                                        disabled={submitting}
                                        className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode('none');
                                            setFormData(prev => ({ ...prev, email: profile?.email }));
                                        }}
                                        disabled={submitting}
                                        className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-600 text-sm">Current email: <span className="font-semibold">{profile?.email}</span></p>
                        )}
                    </div>

                    {/* Update Password */}
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-lg shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Update Password</h3>
                            {editMode !== 'password' && (
                                <button
                                    onClick={() => setEditMode('password')}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold text-xs rounded-lg transition-all"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {editMode === 'password' ? (
                            <div className="space-y-4">
                                {/* Current Password */}
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        placeholder="Current password"
                                        className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* New Password */}
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        placeholder="New password"
                                        className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('new')}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder="Confirm new password"
                                        className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <p className="text-xs text-slate-500 mt-2">Password must be at least 6 characters long</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={submitting}
                                        className="flex-1 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditMode('none');
                                            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                                        }}
                                        disabled={submitting}
                                        className="flex-1 h-10 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-600 text-sm">Manage your account password security</p>
                        )}
                    </div>
                </div>

                {/* Security Note */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                    <p className="text-xs text-amber-800 font-medium">
                        🔒 Keep your password secure and never share it with anyone. Always use a strong password with mixed characters.
                    </p>
                </div>
            </div>
        </div>
    );
}
