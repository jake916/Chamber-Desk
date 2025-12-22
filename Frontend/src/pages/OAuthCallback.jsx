import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Copy, AlertCircle } from 'lucide-react';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const codeParam = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (codeParam) {
            setCode(codeParam);
        } else if (errorParam) {
            setError(errorParam);
        } else {
            setError('No authorization code found in URL.');
        }
    }, [searchParams]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
                {error ? (
                    <div className="text-red-600">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Authorization Failed</h2>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={() => navigate('/admin/meetings')}
                            className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Return to Meetings
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-gray-900">Authorization Successful!</h2>
                        <p className="text-gray-600 mb-6">
                            Here is your Authorization Code. Copy it to generate your Refresh Token.
                        </p>

                        <div className="bg-gray-100 p-4 rounded-lg mb-6 flex items-center justify-between border border-gray-200">
                            <code className="text-sm font-mono text-gray-800 break-all text-left mr-2">
                                {code}
                            </code>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                                title="Copy Code"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>Next step: Use this code to generate your Refresh Token.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;
