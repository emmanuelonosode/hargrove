import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_resend_otp():
    email = "test@example.com"
    # First try to register
    print(f"Registering {email}...")
    reg_res = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": email,
        "password": "password123",
        "first_name": "Test",
        "last_name": "User"
    })
    print(f"Register Status: {reg_res.status_code}")
    print(f"Register Response: {reg_res.json()}")

    # Now try to resend OTP
    print(f"Resending OTP for {email}...")
    res = requests.post(f"{BASE_URL}/auth/resend-otp/", json={"email": email})
    print(f"Resend Status: {res.status_code}")
    print(f"Resend Response: {res.json()}")

if __name__ == "__main__":
    test_resend_otp()
