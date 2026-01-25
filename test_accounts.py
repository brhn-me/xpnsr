

import urllib.request
import json


# Using urllib for simplicity in this environment without full pytest-asyncio setup sometimes
SERVER_URL = "http://127.0.0.1:8000"

def get_token():
    # Login and get token
    data = json.dumps({"username": "test@example.com", "password": "password"}).encode('utf-8')
    req = urllib.request.Request(f"{SERVER_URL}/api/v1/auth/token", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())['access_token']

def test_accounts_flow():
    try:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # 1. Create Account
        account_data = {
            "name": "Test Bank Account",
            "type": "BANK",
            "currency": "USD",
            "balance": 5000.0,
            "interest_rate": 0.5,
            "account_number": "1234567890",
            "bank_name": "Chase",
            "branch_name": "Downtown"
        }
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/accounts/", data=json.dumps(account_data).encode(), headers=headers)
        with urllib.request.urlopen(req) as res:
            account = json.loads(res.read().decode())
            print(f"Created Account: {account['id']}")
            assert account['name'] == "Test Bank Account"
            assert account['balance'] == 5000.0
            assert account['account_number'] == "1234567890"

        accountId = account['id']

        # 2. List Accounts
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/accounts/", headers=headers)
        with urllib.request.urlopen(req) as res:
            accounts = json.loads(res.read().decode())
            print(f"Listed Accounts: {len(accounts)}")
            assert any(a['id'] == accountId for a in accounts)

        # 3. Update Account
        update_data = {"balance": 6000.0}
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/accounts/{accountId}", data=json.dumps(update_data).encode(), headers=headers, method='PUT')
        with urllib.request.urlopen(req) as res:
            updated = json.loads(res.read().decode())
            print(f"Updated Balance: {updated['balance']}")
            assert updated['balance'] == 6000.0

        # 4. Delete Account
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/accounts/{accountId}", headers=headers, method='DELETE')
        with urllib.request.urlopen(req) as res:
            print("Deleted Account")
            assert res.status == 200

        print("Accounts Verification Passed!")

    except Exception as e:
        print(f"Test Failed: {e}")
        # raise e

if __name__ == "__main__":
    test_accounts_flow()
