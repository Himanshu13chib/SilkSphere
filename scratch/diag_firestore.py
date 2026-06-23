import urllib.request
import json
import urllib.error

api_key = "AIzaSyDkJ4j-EaSBgvE1e5VT5VABrdqXgh8c3GQ"
project_id = "silksphere-34f61"
url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/device_commands/status?key={api_key}"

try:
    with urllib.request.urlopen(url) as res:
        print("GET succeeded!")
        print(res.read().decode())
except urllib.error.HTTPError as e:
    print(f"GET failed: {e.code} {e.reason}")
    print(e.read().decode())
except Exception as e:
    print(f"GET error: {e}")
