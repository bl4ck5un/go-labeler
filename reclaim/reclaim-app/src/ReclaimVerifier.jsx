import { useState } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

export default function ReclaimVerifier({ did }) {
    const [proofs, setProofs] = useState(null);
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
                onSuccess: (proofs) => {
                    setProofs(proofs);
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
            {proofs && (
                <div className="mt-4">
                    <h2>Verification Successful!</h2>
                    <pre className="bg-light p-3 rounded border">
                        {JSON.stringify(proofs, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}