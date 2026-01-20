import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Scale, Lock, Mail, AlertCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showTestCredentials, setShowTestCredentials] = useState(false);
    const [copiedField, setCopiedField] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            const role = data.user.role.toLowerCase();
            let redirectPath = '/';

            if (role === 'superadmin') redirectPath = '/superadmin';
            else if (role === 'manager') redirectPath = '/manager';
            else if (role === 'hoc') redirectPath = '/hoc';
            else if (role === 'lawyer') redirectPath = '/lawyer';
            else if (role === 'admin') redirectPath = '/admin';
            else if (role === 'paralegal') redirectPath = '/paralegal';

            navigate(redirectPath);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const testCredentials = [
        { role: 'Super Admin', email: 'super@chamberdesk.com', password: 'password123' },
        { role: 'Manager', email: 'manager@chamberdesk.com', password: 'password123' },
        { role: 'Head of Chambers', email: 'hoc@chamberdesk.com', password: 'password123' },
        { role: 'Lawyer', email: 'lawyer@chamberdesk.com', password: 'password123' },
        { role: 'Admin', email: 'admin@chamberdesk.com', password: 'password123' },
        { role: 'Paralegal', email: 'para@chamberdesk.com', password: 'password123' },
    ];

    const handleCopyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const handleQuickLogin = (credential) => {
        setEmail(credential.email);
        setPassword(credential.password);
        setShowTestCredentials(false);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-slate-900/90"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                    <h2 className="text-[30px] font-black text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-600">Sign in to Chamber Desk</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Test Credentials Dropdown */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setShowTestCredentials(!showTestCredentials)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg hover:border-amber-300 transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-amber-900">
                                Test Login Credentials
                            </span>
                        </div>
                        {showTestCredentials ? (
                            <ChevronUp className="w-5 h-5 text-amber-700 group-hover:text-amber-900 transition-colors" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-amber-700 group-hover:text-amber-900 transition-colors" />
                        )}
                    </button>

                    {showTestCredentials && (
                        <div className="mt-3 p-4 bg-white border-2 border-amber-100 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                            <p className="text-xs text-gray-600 mb-4 italic">
                                Click on any credential to auto-fill the login form
                            </p>
                            <div className="space-y-3">
                                {testCredentials.map((credential, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => handleQuickLogin(credential)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {credential.role}
                                            </h4>
                                            <span className="text-xs text-gray-500 group-hover:text-blue-500">
                                                Click to use
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                                    <p className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                                                        {credential.email}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyToClipboard(credential.email, `email-${index}`);
                                                    }}
                                                    className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                                    title="Copy email"
                                                >
                                                    {copiedField === `email-${index}` ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500 mb-1">Password</p>
                                                    <p className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                                                        {credential.password}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopyToClipboard(credential.password, `password-${index}`);
                                                    }}
                                                    className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                                    title="Copy password"
                                                >
                                                    {copiedField === `password-${index}` ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
                                placeholder="your.email@chamberdesk.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block text-black w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                    </div>


                    <button
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Need help? <a href="#" className="font-medium text-blue-600 hover:text-blue-700">Contact Support</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;