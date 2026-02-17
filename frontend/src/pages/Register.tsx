import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { token, user } = await authService.register({ name, email, password });
            login(token, user);
            toast.success('Account created! Welcome to Learnix! ✨');
            navigate('/');
        } catch (err) {
            // A more type-safe way to handle potential API errors
            const apiError = err as { response?: { data?: { message?: string } }, message?: string };
            const errorMessage = apiError.response?.data?.message || apiError.message || 'Registration failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] opacity-30"></div>
            <div className="relative w-full max-w-md px-6 bg-white">
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-blue-100 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
                            <BrainCircuit className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
                            Join the squad
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Create your account to start learning
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focused === 'name' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <User className="h-5 w-5" strokeWidth={2} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onFocus={() => setFocused('name')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder="Jane Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                Email
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focused === 'email' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <Mail className="h-5 w-5" strokeWidth={2} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    className="w-full h-12 pl-12 pr-4 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                Password
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 ${focused === 'password' ? 'text-emerald-500' : 'text-gray-400'}`}>
                                    <Lock className="h-5 w-5" strokeWidth={2} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    className="relative z-10 w-full h-12 pl-12 pr-4 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                                <p className="text-xs text-red-600 font-medium text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <p className="text-center text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
