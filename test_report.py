import asyncio
import httpx

API_URL = "http://localhost:8000/api/v1"

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_data = {
            "username": "test@example.com",
            "password": "password"
        }
        print("Logging in...")
        try:
            resp = await client.post(f"{API_URL}/auth/login", data=login_data)
            resp.raise_for_status()
            token = resp.json()["access_token"]
            print(f"Got token: {token[:10]}...")
        except Exception as e:
            print(f"Login failed: {e}")
            if resp:
                print(resp.text)
            return

        # 2. Call yearly-summary
        headers = {"Authorization": f"Bearer {token}"}
        print("Calling yearly-summary...")
        try:
            resp = await client.get(f"{API_URL}/reports/yearly-summary?year=2025", headers=headers)
            print(f"Status: {resp.status_code}")
            if resp.status_code == 200:
                print("Data:", resp.json())
            else:
                print("Error:", resp.text)
        except Exception as e:
            print(f"Request failed: {e}")

        # Also call 2026 just in case
        print("Calling yearly-summary 2026...")
        try:
            resp = await client.get(f"{API_URL}/reports/yearly-summary?year=2026", headers=headers)
            print(f"Status: {resp.status_code}")
            print("Data:", resp.json())
        except Exception as e:
            pass

if __name__ == "__main__":
    asyncio.run(main())
