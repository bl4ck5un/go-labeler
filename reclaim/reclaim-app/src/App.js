import { useState } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';

function StartReclaimVerification() {
  const [proofs, setProofs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [did, setDid] = useState('');

  const handleVerification = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const BASE_URL = "https://a0ac-32-221-215-63.ngrok-free.app";
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
    <>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="did">DID:</label>
        <input
          type="text"
          id="did"
          value={did}
          onChange={(e) => setDid(e.target.value)}
          style={{ marginLeft: '0.5rem', width: '400px' }}
          placeholder="Enter your DID (e.g., did:plc:abc123)"
        />
      </div>

      <button onClick={handleVerification} disabled={isLoading || !did}>
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