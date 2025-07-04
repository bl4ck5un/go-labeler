import { useEffect, useState } from 'react';
import LoginWithBluesky from './LoginWithBluesky';
import ReclaimVerifier from './ReclaimVerifier';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [did, setDid] = useState('');

  useEffect(() => {
    document.title = "Twitter zkTLS Labeler";
  }, []);

  const handleLogin = async (did, token) => {
    console.log("Calling handleLogin with DID:", did);
    // XXX: this is insecure
    setDid(did);
  };

  return (
    <>
      <div className="container mt-5">
        <h1 className="mb-4">zkLabeler: zkTLS Labeler</h1>

        <p>Adding a label based on your Twitter follower count using zkTLS.</p>

        {/* <img
        src="/demo.png"
        alt="zktls-labeler on Bluesky"
        className="img-fluid rounded border"
        style={{ maxWidth: '400px' }}
      /> */}

        <div className="mt-2">
          <ul>
            <li><strong>❓ What is Bluesky?</strong> A decentralized social network.</li>
            <li><strong>🏷️ What are labels?</strong> Tags that describe user attributes on Bluesky.</li>
            <li><strong>🔐 What is zkTLS?</strong> A protocol to prove facts about HTTPS data without revealing it. In this case, you prove your Twitter follower count is XYZ to the labeler, without revealing anything else (not even your Twitter handle).</li>
            <li><strong>🤖 What does zkTLS-labeler do?</strong> Issues a label based on your Twitter follower count, obtained through Reclaim (a zkTLS system).</li>
            <li><strong>🕵️ Privacy implications?</strong> The labeler learns your DID and your Twitter follower count. Per privacy guarantee of Reclaim (or zkTLS in general), nothing else is revealed to the labeler.</li>
          </ul>
        </div>

        <h4 className="mt-2 mb-4">How to Use?</h4>
        <ol>
          <li>Subscribe to <a
            href="https://bsky.app/profile/zktls-labeler.bsky.social"
            className="badge rounded-pill bg-primary text-light text-decoration-none"
            target="_blank"
            rel="noopener noreferrer"
          >@zktls-labeler</a> on Bluesky.
          </li>
          <li>Finish the following two steps.</li>
        </ol>

        <ul className="list-group mt-5">
          <li className="list-group-item">
            <div>
              <strong>Step 1: Log in to Bluesky</strong>
              <p className="mb-2 text-muted">We'll verify your Bluesky identity.</p>
              <LoginWithBluesky onLogin={handleLogin} />
              {did && <div className="text-success">✅ Logged in as <code>{did}</code></div>}
            </div>
          </li>

          <li className="list-group-item">
            <div>
              <strong>Step 2: Prove Your Twitter Follower Count</strong>
              <div className="mb-2 text-muted"><p className="mt-3">
                Powered by{' '}
                <img
                  src="https://framerusercontent.com/images/XZvnqtygDfqq3I1UOZAwYeuJWWM.svg?scale-down-to=512"
                  alt="logo"
                  style={{ height: '1em', verticalAlign: 'textBottom' }}
                />
              </p></div>


              {did ? (
                <ReclaimVerifier did={did} />
              ) : (
                <div className="alert alert-warning mt-3" role="alert">
                  ⚠️ Please log in first.
                </div>
              )}
            </div>
          </li>
        </ul>
      </div>
      <footer className="bg-dark text-light py-3 mt-5">
        <div className="container text-center">
          <small>
            © {new Date().getFullYear()} zkLabeler
          </small>
        </div>
      </footer>
    </>
  );
}

export default App;