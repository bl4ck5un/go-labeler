import { useEffect, useState } from 'react';
import LoginWithBluesky from './LoginWithBluesky';
import ReclaimVerifier from './ReclaimVerifier';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [did, setDid] = useState('');
  const [token, setToken] = useState('');
  const [startVerification, setStartVerification] = useState(false);

  useEffect(() => {
    document.title = "Twitter zkTLS Labeler";
  }, []);

  const handleLogin = async (did, token) => {
    console.log("Calling handleLogin with DID:", did);
    setDid(did);
    setToken(token);

    await fetch('/api/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">zkLabeler: zkTLS Labeler</h1>

      <p>Adding a label based on your Twitter follower count, without leading your Twitter handle to the labeler.</p>

      <img
        src="/demo.png"
        alt="zktls-labeler on Bluesky"
        className="img-fluid rounded border"
        style={{ maxWidth: '400px' }}
      />

      <h3 class="mt-5 mb-4">How to Use?</h3>
      <ol>
        <li>Subscribe to <a
          href="https://bsky.app/profile/zktls-labeler.bsky.social"
          className="btn btn-primary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >@zktls-labeler</a> on Bluesky
        </li>
        <li>Finish the following two steps</li>
      </ol>

      <ul className="list-group mb-4">
        <li className="list-group-item">
          <strong>Step 1: Log in to Bluesky</strong>
          <p className="mb-2 text-muted">We'll verify your Bluesky identity.</p>
          <LoginWithBluesky onLogin={handleLogin} />
          {did && <div className="text-success">✅ Logged in as <code>{did}</code></div>}
        </li>

        <li className="list-group-item">
          <strong>Step 2: Prove Your Twitter Follower Count</strong>
          <p className="mb-2 text-muted">      <p className="mt-3">
            Powered by{' '}
            <img
              src="https://framerusercontent.com/images/XZvnqtygDfqq3I1UOZAwYeuJWWM.svg?scale-down-to=512"
              alt="logo"
              style={{ height: '1em', verticalAlign: 'textBottom' }}
            />
          </p></p>


          {did ? (
            <ReclaimVerifier did={did} />
          ) : (
            <div className="alert alert-warning mt-3" role="alert">
              ⚠️ Please log in first.
            </div>
          )}
        </li>
      </ul>

      <div className="mt-5">
        <h5>FAQ</h5>
        <ul>
          <li><strong>❓ What is Bluesky?</strong> A decentralized social network.</li>
          <li><strong>🏷️ What are labels?</strong> Tags that describe user attributes on Bluesky.</li>
          <li><strong>🔐 What is zkTLS?</strong> A protocol to prove facts about HTTPS data without revealing it. In this case, you prove your Twitter follower count is XYZ to the labeler, without revealing anything else (not even your Twitter handle).</li>
          <li><strong>🤖 What does zkTLS-labeler do?</strong> Issues a label based on your Twitter follower count, obtained through Reclaim (a zkTLS system).</li>
          <li><strong>🕵️ Privacy implications?</strong> The labeler learns your DID and your Twitter follower count. Per privacy guarantee of Reclaim (or zkTLS in general), nothing else is revealed to the labeler.</li>
        </ul>
      </div>
    </div>
  );
}

export default App;