
import urllib.request
import json
from datetime import date

SERVER_URL = "http://127.0.0.1:8000"

def get_token():
    data = json.dumps({"username": "test@example.com", "password": "password"}).encode('utf-8')
    req = urllib.request.Request(f"{SERVER_URL}/api/v1/auth/token", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())['access_token']

def test_budgets_flow():
    try:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # 0. Get a Category ID
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/categories/", headers=headers)
        with urllib.request.urlopen(req) as res:
            categories = json.loads(res.read().decode())
            if not categories:
                print("No categories found. Cannot test budgets.")
                return
            categoryId = categories[0]['id']
            print(f"Using Category: {categories[0]['name']} ({categoryId})")

        # 1. Set Budget
        month = 10
        year = 2024
        budget_data = {
            "category_id": categoryId,
            "amount": 500.0,
            "month": month,
            "year": year
        }
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/budgets/", data=json.dumps(budget_data).encode(), headers=headers)
        with urllib.request.urlopen(req) as res:
            budget = json.loads(res.read().decode())
            print(f"Set Budget: ${budget['amount']}")
            assert budget['amount'] == 500.0
            id = budget['id']

        # 2. Add Expense to impact Budget
        expense_data = {
            "amount": 200.0,
            "date": f"{year}-{month}-15T10:00:00",
            "type": "EXPENSE",
            "category_id": categoryId,
            "description": "Budget Test Expense"
        }
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/transactions/", data=json.dumps(expense_data).encode(), headers=headers)
        with urllib.request.urlopen(req) as res:
            print("Added Expense: $200")

        # 3. Check Budget Status
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/budgets/?month={month}&year={year}", headers=headers)
        with urllib.request.urlopen(req) as res:
            budgets = json.loads(res.read().decode())
            target = next(b for b in budgets if b['id'] == id)
            print(f"Budget Status: Spent ${target['spent']} ({target['percentage']}%)")
            
            # Note: Depending on existing data, spent might be > 200, but should be at least 200
            assert target['spent'] >= 200.0
            assert target['percentage'] >= 40.0

        # 4. Clean up (Delete Budget)
        req = urllib.request.Request(f"{SERVER_URL}/api/v1/budgets/{id}", headers=headers, method='DELETE')
        with urllib.request.urlopen(req) as res:
            print("Deleted Budget")
            assert res.status == 200

        print("Budgets Verification Passed!")

    except Exception as e:
        print(f"Test Failed: {e}")
        # raise e

if __name__ == "__main__":
    test_budgets_flow()
