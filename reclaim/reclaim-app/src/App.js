import { useEffect, useState } from 'react';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import 'bootstrap/dist/css/bootstrap.min.css';

function StartReclaimVerification() {
  const [proofs, setProofs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [did, setDid] = useState('');

  useEffect(() => {
    document.title = "Twitter zkTLS Labeler";
  }, []);

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
    <div className="container mt-5">
      <h1 className="mb-3">Twitter Follower Badged powered by zkTLS</h1>

      <p>This is a zkTLS powered BlueSky labeler that generates a label based on the number of your Twitter followers.</p>

      <p className="text-muted">
        Enter your Bluesky DID handle (e.g., <code>did:plc:abc123</code> or <code>yourname.bsky.social</code>) and click “Start Verification”.
        You’ll be guided through the zkTLS verification process built by Reclaim: you logs in to your Twitter account, and produce a proof for your follower count (and nothing else!).
        Upon success, the system will issue a label—such as <code>twitter-1k</code>—to your DID via the labeler service <code>zktls-labeler.bsky.social</code>.
      </p>

      <div className="mb-3">
        <label htmlFor="did" className="form-label">DID:</label>
        <input
          type="text"
          id="did"
          className="form-control"
          value={did}
          onChange={(e) => setDid(e.target.value)}
          placeholder="Enter your DID (e.g., did:plc:abc123)"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleVerification}
        disabled={isLoading || !did}
      >
        {isLoading ? 'Verifying...' : 'Start Verification'}
      </button>

      <p className="mt-3">
        Powered by{' '}
        <img
          src="https://framerusercontent.com/images/XZvnqtygDfqq3I1UOZAwYeuJWWM.svg?scale-down-to=512"
          alt="logo"
          style={{ height: '1em', verticalAlign: 'textBottom' }}
        />
      </p>

      {error && (
        <div className="alert alert-danger mt-3">
          <strong>Error:</strong> {error}
        </div>
      )}

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

export default StartReclaimVerification;