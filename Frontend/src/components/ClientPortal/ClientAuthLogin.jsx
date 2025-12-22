import React, { useState } from 'react';
import { Lock, Shield } from 'lucide-react';

const ClientAuthLogin = ({ onLoginSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^\d{4}$/.test(pin)) {
            setError('PIN must be 4 digits');
            return;
        }

        setIsLoading(true);
        const success = await onLoginSuccess(pin);
        setIsLoading(false);

        if (!success) {
            setError('Incorrect PIN. Please try again.');
            setPin('');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-purple-100 rounded-full">
                        <Shield className="w-12 h-12 text-purple-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Welcome Back
                </h2>
                <p className="text-gray-600 text-center mb-8">
                    Enter your 4-digit PIN to access your case
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                            Enter PIN
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-1/2 -translate-x-1/2 -top-8 text-gray-400" size={24} />
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="••••"
                                maxLength="4"
                                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black text-center text-3xl tracking-widest font-bold"
                                required
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || pin.length !== 4}
                        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Access Case'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ClientAuthLogin;
