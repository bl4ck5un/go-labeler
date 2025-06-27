from flask import Flask, render_template, request, jsonify
import requests
import logging
import unicodedata

app = Flask(__name__)

LABEL_QUERY_URL = "http://localhost:12000/xrpc/com.atproto.label.queryLabels"

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
)

def clean_handle(handle):
    return ''.join(c for c in handle if not unicodedata.category(c).startswith('C'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data', methods=['POST'])
def data():
    account_handle = request.form.get('account_handle')
    labeler_handle = request.form.get('labeler_handle', 'zktls-labeler.bsky.social')

    if not account_handle:
        return jsonify({"error": "Missing account handle"}), 400

    try:
        account_handle = clean_handle(account_handle.strip())
        labeler_handle = clean_handle(labeler_handle.strip())

        # Resolve both handles to DIDs
        r1 = requests.get("https://bsky.social/xrpc/com.atproto.identity.resolveHandle", params={"handle": account_handle})
        r1.raise_for_status()
        account_did = r1.json().get("did")

        logging.info(f"account did {account_did}")

        r2 = requests.get("https://bsky.social/xrpc/com.atproto.identity.resolveHandle", params={"handle": labeler_handle})
        r2.raise_for_status()
        labeler_did = r2.json().get("did")

        logging.info(f"labeler did {labeler_did}")

        # Fetch account's current labels
        label_query = requests.get(LABEL_QUERY_URL, params={"uriPatterns": account_did, "sources": labeler_did})
        label_query.raise_for_status()
        account_labels = label_query.json().get("labels") or []
        existing_labels = set(label["val"] for label in account_labels)

        # Fetch labeler definitions
        rec = requests.get("https://bsky.social/xrpc/com.atproto.repo.getRecord", params={
            "repo": labeler_did,
            "collection": "app.bsky.labeler.service",
            "rkey": "self"
        })
        rec.raise_for_status()
        defs = rec.json().get("value", {}).get("policies", {}).get("labelValueDefinitions", [])

        return jsonify({
            "account_did": account_did,
            "labeler_did": labeler_did,
            "existing_labels": list(existing_labels),
            "definitions": defs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


ADMIN_LABEL_URL = "http://127.0.0.1:12001/label"

@app.route('/addlabel', methods=['POST'])
def label():
    try:
        data = request.get_json()
        r = requests.post(ADMIN_LABEL_URL, json=data)
        r.raise_for_status()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
