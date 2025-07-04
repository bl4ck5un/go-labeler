import { useState } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

export default function ReclaimVerifier({ did }) {
    const [verificationResult, setverificationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleVerification = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const BASE_URL = "https://6aa6-135-148-33-204.ngrok-free.app";
            const response = await fetch(`${BASE_URL}/generate-config?did=${encodeURIComponent(did)}`, {
                headers: {
                    'ngrok-skip-browser-warning': '69420',
                },
            });

            const { reclaimProofRequestConfig } = await response.json();
            const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);

            await reclaimProofRequest.triggerReclaimFlow();
            await reclaimProofRequest.startSession({
                onSuccess: (result) => {
                    setverificationResult(result);
                    setIsLoading(false);
                },
                onError: (error) => {
                    setError(`Verification failed: ${error.message || error}`);
                    setIsLoading(false);
                },
            });
        } catch (err) {
            setError(`Error initializing Reclaim: ${err.message || err}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <button className="btn btn-primary" onClick={handleVerification} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Start Verification'}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {verificationResult && (
                <div className="mt-4">
                    <div className="text alert alert-success border-success rounded">
                        <h5 className="mb-3">✅ zkLabeling successful!</h5>
                        <p>The label will show up in your BlueSky profile after a short delay.</p>
                        {typeof verificationResult === 'string' ? (
                            <p>{verificationResult}</p>
                        ) : (
                            <ul className="list-group list-group-flush">
                                {Object.entries(verificationResult).map(([key, value]) => (
                                    <li className="list-group-item" key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}