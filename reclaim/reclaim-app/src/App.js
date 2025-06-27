import { useState } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

function StartReclaimVerification() {
  const [proofs, setProofs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);  // NEW: Track errors

  const handleVerification = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors

      const BASE_URL = "https://a0ac-32-221-215-63.ngrok-free.app"; // Replace with your backend base URL
      const response = await fetch(BASE_URL + '/generate-config', {
          headers: {
            'ngrok-skip-browser-warning': '69420',
          }
        });

      const { reclaimProofRequestConfig } = await response.json();

      console.log(reclaimProofRequestConfig)

      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);
      reclaimProofRequest.setParams("did": )
      await reclaimProofRequest.triggerReclaimFlow();
      await reclaimProofRequest.startSession({
        onSuccess: (proofs) => {
          console.log('Successfully created proof', proofs);
          setProofs(proofs);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Verification failed', error);
          setError(`Verification failed: ${error.message || error}`);
          setIsLoading(false);
        },
      });

    } catch (err) {
      console.error('Error initializing Reclaim:', err);
      setError(`Error initializing Reclaim: ${err.message || err}`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={handleVerification} disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Start Verification'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {proofs && (
        <div>
          <h2>Verification Successful!</h2>
          <pre>{JSON.stringify(proofs, null, 2)}</pre>
        </div>
      )}
    </>
  );
}

export default StartReclaimVerification;