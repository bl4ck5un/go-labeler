from fastapi import FastAPI, Request
from reclaim_python_sdk import ReclaimProofRequest, verify_proof, Proof
import json
from urllib.parse import unquote
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from dotenv import load_dotenv
load_dotenv()

import os

APP_ID = "0xf3Ee7154144CE3230e6cbc6edab4DE015C6391C9"
PROVIDER_ID = "e6fe962d-8b4e-4ce5-abcc-3d21c88bd64a"
APP_SECRET = os.getenv("APP_SECRET")

print(APP_ID)
print(PROVIDER_ID)
print(APP_SECRET)

BASE_URL = "https://a0ac-32-221-215-63.ngrok-free.app"  # if using ngrok, provide the ngrok base url

from fastapi import Query

# Route to generate SDK configuration
@app.get("/generate-config")
async def generate_config(did: str = Query(...)):
    try:
        reclaim_proof_request = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID,
                                                               {"useBrowserExtension": False}
                                                               )
        reclaim_proof_request.set_params({"did": did})
        reclaim_proof_request.set_app_callback_url(BASE_URL + "/receive-proofs")
        reclaim_proof_request_config = reclaim_proof_request.to_json_string()

        return {"reclaimProofRequestConfig": reclaim_proof_request_config}
    except Exception as error:
        print(f"Error generating request config: {error}")
        return {"error": "Failed to generate request config"}, 500


# Route to receive proofs
@app.post("/receive-proofs")
async def receive_proofs(request: Request):
    # Get the raw body content
    body = await request.body()
    # Decode the bytes to string
    body_str = body.decode()
    # unquote the body string to remove the url encoding
    body_str = unquote(body_str)
    # parse the body string to a dictionary

    parsed_data = json.loads(body_str)

    print(parsed_data)

    identifier = parsed_data.get("identifier", "default_id")
    filename = f"proof_{identifier}.json"

    with open(filename, "w") as f:
        json.dump(parsed_data, f, indent=2)

    proof = Proof.from_json(parsed_data)
    result = await verify_proof(proof)
    if not result:
        return {"status": "failed", "message": "Proof verification failed"}, 400

    context_str = parsed_data["claimData"]["context"]
    context = json.loads(context_str)

    follower_count = context["extractedParameters"].get("followers_count")
    display_name = context["extractedParameters"].get("screen_name")
    # You backend logic here after verifying the proof
    # Process the proofs here
    print("follower_count", follower_count)
    print("display_name", display_name)

    return {"status": "success"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)