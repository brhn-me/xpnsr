import asyncio
import uuid
import json
import urllib.request
import urllib.parse
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def request(method, url, data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data:
        data_bytes = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    else:
        data_bytes = None
        
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            if response.status >= 200 and response.status < 300:
                body = response.read().decode('utf-8')
                return json.loads(body) if body else {}
            else:
                raise Exception(f"Request failed: {response.status} {response.read().decode('utf-8')}")
    except urllib.error.HTTPError as e:
         raise Exception(f"HTTP Error: {e.code} {e.read().decode('utf-8')}")

def test_recurring_flow():
    print("Starting Verification...")
    
    # 1. Login
    print("1. Logging in...")
    # Form data for login
    login_data = urllib.parse.urlencode({"username": "test@example.com", "password": "password"}).encode()
    req = urllib.request.Request(f"{BASE_URL}/auth/token", data=login_data, method="POST")
    with urllib.request.urlopen(req) as resp:
        token_resp = json.loads(resp.read().decode())
        token = token_resp["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get a Category
    print("2. Fetching Categories...")
    categories = request("GET", f"{BASE_URL}/categories", headers=headers)
    cat = next((c for c in categories if "util" in c["title"].lower() or "house" in c["title"].lower()), categories[0])
    cat_id = cat["id"]
    print(f"   Using category: {cat['title']} ({cat_id})")
    
    # 3. Create a Recurring Bill
    print("3. Creating Recurring Bill...")
    bill_data = {
        "title": "Test Rent",
        "amount": 1000.0,
        "category_id": cat_id,
        "frequency": "monthly",
        "day_of_month": 1 
    }
    bill = request("POST", f"{BASE_URL}/recurring/", data=bill_data, headers=headers)
    bill_id = bill["id"]
    print(f"   Created Bill: {bill['title']} ({bill_id})")
    
    # 4. Check Status (Expect UNPAID)
    print("4. Checking initial status...")
    month = datetime.now().month
    year = datetime.now().year
    statuses = request("GET", f"{BASE_URL}/recurring/?month={month}&year={year}", headers=headers)
    my_status = next(s for s in statuses if s["bill"]["id"] == bill_id)
    print(f"   Status: {my_status['status']} (Paid: {my_status['amount_paid']})")
    if my_status["status"] != "UNPAID":
        raise Exception("Expected UNPAID status")
    
    # 5. Create a transaction that matches
    print("5. Paying bill via Transaction...")
    tx_data = {
        "title": "Paying Rent",
        "amount": 1000.0,
        "type": "expense",
        "category_id": cat_id,
        "date": datetime.now().isoformat()
    }
    tx = request("POST", f"{BASE_URL}/transactions", data=tx_data, headers=headers)
    print(f"   Created Transaction: {tx['title']}")
    
    # 6. Check Status Again (Expect PAID)
    print("6. Checking status after payment...")
    statuses = request("GET", f"{BASE_URL}/recurring/?month={month}&year={year}", headers=headers)
    my_status = next(s for s in statuses if s["bill"]["id"] == bill_id)
    print(f"   Status: {my_status['status']} (Paid: {my_status['amount_paid']})")
    if my_status["status"] != "PAID":
        raise Exception("Expected PAID status")
    
    # 7. Cleanup
    print("7. Cleaning up...")
    request("DELETE", f"{BASE_URL}/recurring/{bill_id}", headers=headers)
    request("DELETE", f"{BASE_URL}/transactions/{tx['id']}", headers=headers)
    print("Verification Successful!")

if __name__ == "__main__":
    test_recurring_flow()
