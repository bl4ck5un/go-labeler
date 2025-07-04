import {
    configureOAuth,
    resolveFromIdentity,
    createAuthorizationUrl,
    finalizeAuthorization,
} from '@atcute/oauth-browser-client';
import { useEffect, useState } from 'react';

const APP_URL = "https://zklabeler.netlify.app";

const sleep = ms => new Promise(res => setTimeout(res, ms));

configureOAuth({
    metadata: {
        client_id: `${APP_URL}/client-metadata.json`,
        redirect_uri: `${APP_URL}`,
    },
});

export default function LoginWithBluesky({ onLogin }) {
    const [handle, setHandle] = useState('');

    useEffect(() => {
        const hash = new URLSearchParams(window.location.hash.slice(1));
        if (hash.get("code")) {
            console.log("inside");
            (async () => {
                try {
                    console.log("OAuth state:", localStorage.getItem('atcute-oauth:state'));
                    const session = await finalizeAuthorization(hash);
                    console.log(session);
                    onLogin(session.info.sub, session.token); // pass DID + token
                    // window.history.replaceState(null, '', window.location.pathname);
                } catch (err) {
                    console.error("Bluesky login failed:", err);
                }
            })();
        }
    }, [onLogin]);

    const startLogin = async () => {
        if (!handle) return;
        try {
            const { identity, metadata } = await resolveFromIdentity(handle);
            const authUrl = await createAuthorizationUrl({
                metadata,
                identity,
                scope: 'atproto transition:generic',
            });
            await sleep(200);
            window.location.assign(authUrl);
        } catch (err) {
            console.error("Failed to resolve handle:", err);
        }
    };

    return (
        <div className="mb-3">
            <label htmlFor="handle" className="form-label">Bluesky Handle:</label>
            <input
                type="text"
                id="handle"
                className="form-control"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. yourname.bsky.social"
            />
            <button
                className="btn btn-primary mt-2"
                onClick={startLogin}
                disabled={!handle}
            >
                Log in with Bluesky
            </button>
        </div>
    );
}