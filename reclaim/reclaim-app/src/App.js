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
        <h1 class="mb-2 text-center display-4 font-weight-bold">
          <span class="text-primary">zkLabeler</span>
        </h1>

        <p class="lead text-center text-muted mb-4">
          Creating <strong>Bluesky labels</strong> using <code class="bg-light px-1 rounded">zkTLS</code>
        </p>

        <div className="text-center">
          <img
            src="/logo.png"
            alt="zktls-labeler on Bluesky"
            className="img-fluid rounded border m-2"
            style={{ maxWidth: '200px' }}
          />
        </div>

        <div className="text-center m-5">
          <h2 className="d-inline-block mb-2">What?</h2>
          <div
            style={{
              height: '4px',
              width: '100px',
              backgroundColor: '#444',
              margin: '0 auto',
            }}
          ></div>
        </div>

        <div className="mt-2">
          <ul className="list-unstyled">
            <li className="mb-2">
              <strong>❓ What is Bluesky?</strong> A decentralized and open social network built on the AT Protocol. The default app is{' '}
              <a
                href="https://bsky.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                bsky.app
              </a>.
            </li>

            <li className="mb-2">
              <strong>🏷️ What are labels?</strong> Labels are structured annotations that describe user accounts or posts, e.g., “researcher,” developer,” or “under 10K followers.” Labeling is decentralized, and services (like this one) can attach labels based on custom policies.
            </li>

            <li className="mb-2">
              <strong>🔐 What is zkTLS?</strong> Started with academic research such as Town Crier (CCS'16) and DECO (CCS'21), zkTLS generally refers to protocols that lets a client prove facts about data retrieved from TLS servers.
            </li>

            <li className="mb-2">
              <strong>🤖 What does zkLabeler do?</strong> In this case, zkTLS prover built by <a href="https://reclaimprotocol.org" target="_blank" rel="noopener noreferrer">Reclaim</a> is used to verify your Twitter follower count. Based on that, zkLabeler issues a label (e.g., >100, >1k, >10k, etc) and attaches it to your Bluesky DID.
            </li>

            <li className="mb-2">
              <strong>🕵️ Privacy implications?</strong> This service (zkLabeler) sees your Bluesky DID (public by design) and Twitter follower count claim from the Reclaim proof. It does see or need your Twitter credential to access and verify your follower count.
            </li>

            <li className="mb-2">
              <strong>❓ Isn't the follower count public data anyway, why the complication?</strong> True, I wanted to use a low stake example, but it can be any private data that zkTLS can prove (e.g., how about a label based on your Google map travel history?)
            </li>
          </ul>
        </div>

        <div className="text-center m-5">
          <h2 className="d-inline-block mb-2">How?</h2>
          <div
            style={{
              height: '4px',
              width: '100px',
              backgroundColor: '#444',
              margin: '0 auto',
            }}
          ></div>
        </div>

        <div className=''>
          <ol>
            <li>You need a BlueSky account.</li>
            <li>Subscribe to <a
              href="https://bsky.app/profile/zktls-labeler.bsky.social"
              className="badge rounded-pill bg-primary text-light text-decoration-none"
              target="_blank"
              rel="noopener noreferrer"
            >@zktls-labeler</a> on Bluesky. You only see labelers from labelers you follow.
            </li>
            <li>Finish the following two steps.</li>
          </ol>
        </div>

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
          <strong>Disclaimer:</strong> This is a prototype service provided for demonstration purposes only.
          Security has not been audited, and we take no responsibility for any loss of
          data or privacy. Reclaim Protocol's terms apply as well.
          <p>
            <small>
              © {new Date().getFullYear()} zkLabeler. Contact: mail@fanzhang.me
            </small>
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;