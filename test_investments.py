
import urllib.request
import json
from datetime import date

SERVER_URL = "http://127.0.0.1:8000"

def get_token():
    data = json.dumps({"username": "test@example.com", "password": "password"}).encode('utf-8')
    req = urllib.request.Request(f"{SERVER_URL}/api/v1/auth/token", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())['access_token']

def test_investments_flow():
    try:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # 1. Create Investment
        inv_data = {
            "title": "Test FD",
            "type": "FD",
            "principal_amount": 10000.0,
            "current_value": 10000.0,
            "interest_rate": 6.5,
            "interest_amount": 325.0,
            "start_date": "2024-01-01",
            "tenure_months": 12,
            "auto_renew": True,
            "tax_rate": 10.0,
            "tax_amount": 65.0
        }
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/investments/", data=json.dumps(inv_data).encode(), headers=headers)
        with urllib.request.urlopen(req) as res:
            inv = json.loads(res.read().decode())
            print(f"Created Investment: {inv['id']}")
            assert inv['title'] == "Test FD"
            assert inv['tax_amount'] == 65.0

        invId = inv['id']

        # 2. List Investments
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/investments/", headers=headers)
        with urllib.request.urlopen(req) as res:
            invs = json.loads(res.read().decode())
            print(f"Listed Investments: {len(invs)}")
            assert any(i['id'] == invId for i in invs)

        # 3. Update Investment
        update_data = {"current_value": 10500.0}
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/investments/{invId}", data=json.dumps(update_data).encode(), headers=headers, method='PUT')
        with urllib.request.urlopen(req) as res:
            updated = json.loads(res.read().decode())
            print(f"Updated Value: {updated['current_value']}")
            assert updated['current_value'] == 10500.0

        # 4. Delete Investment
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/investments/{invId}", headers=headers, method='DELETE')
        with urllib.request.urlopen(req) as res:
            print("Deleted Investment")
            assert res.status == 200

        print("Investments Verification Passed!")

    except Exception as e:
        print(f"Test Failed: {e}")

if __name__ == "__main__":
    test_investments_flow()
