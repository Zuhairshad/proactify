'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Global application error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                    <div style={{
                        maxWidth: '500px',
                        textAlign: 'center',
                        padding: '40px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                    }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#dc2626' }}>
                            Critical Error
                        </h1>
                        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
                            A critical error occurred. Please try refreshing the page.
                        </p>
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            marginBottom: '24px',
                            wordBreak: 'break-word',
                        }}>
                            <code style={{ fontSize: '14px', color: '#374151' }}>
                                {error.message}
                            </code>
                        </div>
                        <button
                            onClick={reset}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '500',
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
