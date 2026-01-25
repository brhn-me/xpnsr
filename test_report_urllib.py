import urllib.request
import urllib.parse
import json

API_URL = "http://localhost:8000/api/v1"

def main():
    # 1. Login
    login_data = urllib.parse.urlencode({
        "username": "test@example.com",
        "password": "password"
    }).encode()

    print("Logging in...")
    try:
        req = urllib.request.Request(f"{API_URL}/auth/login", data=login_data, method="POST")
        with urllib.request.urlopen(req) as resp:
            data = json.load(resp)
            token = data["access_token"]
            print(f"Got token: {token[:10]}...")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. Call yearly-summary
    headers = {"Authorization": f"Bearer {token}"}
    
    for year in [2025, 2026]:
        print(f"Calling yearly-summary {year}...")
        try:
            req = urllib.request.Request(f"{API_URL}/reports/yearly-summary?year={year}", headers=headers)
            with urllib.request.urlopen(req) as resp:
                print(f"Status: {resp.getcode()}")
                data = json.load(resp)
                print("Data:", json.dumps(data, indent=2))
        except urllib.error.HTTPError as e:
            print(f"HTTP Error: {e.code} {e.reason}")
            print(e.read().decode())
        except Exception as e:
            print(f"Request failed: {e}")

    # 3. Call category-pie 2026
    print("Calling category-pie 2026...")
    try:
        from datetime import datetime
        start = "2026-01-01T00:00:00.000Z"
        end = "2026-12-31T23:59:59.999Z"
        params = urllib.parse.urlencode({
            "type": "expense",
            "start_date": start,
            "end_date": end
        })
        req = urllib.request.Request(f"{API_URL}/reports/category-pie?{params}", headers=headers)
        with urllib.request.urlopen(req) as resp:
            print(f"Status: {resp.getcode()}")
            data = json.load(resp)
            print("Data:", json.dumps(data, indent=2))
    except Exception as e:
        print(f"Category Request failed: {e}")

    # 4. Call category-trends
    print("Calling category-trends 2025...")
    try:
        req = urllib.request.Request(f"{API_URL}/reports/category-trends?year=2025", headers=headers)
        with urllib.request.urlopen(req) as resp:
            print(f"Status: {resp.getcode()}")
            data = json.load(resp)
            print("Data:", json.dumps(data, indent=2))
    except Exception as e:
        print(f"Trends Request failed: {e}")

    # 5. Call daily-activity
    print("Calling daily-activity 2025...")
    try:
        req = urllib.request.Request(f"{API_URL}/reports/daily-activity?year=2025", headers=headers)
        with urllib.request.urlopen(req) as resp:
            print(f"Status: {resp.getcode()}")
            data = json.load(resp)
            # Print first 3 items to avoid flood
            print("Data (first 3):", json.dumps(data[:3], indent=2))
    except Exception as e:
        print(f"Daily Request failed: {e}")

if __name__ == "__main__":
    main()
