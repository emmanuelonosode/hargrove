import urllib.request, json, re, ssl

# Simulated payload for payment proof submission
body = {
  'invoice': 1, # Assuming invoice ID 1 exists for testing
  'amount': '50.00',
  'payment_method': 'VENMO',
  'reference_id': 'test_ref',
  'proof_file': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Replace with a real token if needed, or test with public access if allowed (it shouldn't be)
# Since the view requires IsAuthenticated, this test will 401/403 but should show if it crashes during parsing
req = urllib.request.Request(
    'https://admin.haskerrealtygroup.com/api/v1/transactions/my-payments/submit-proof/', 
    data=json.dumps(body).encode(), 
    headers={'Content-Type': 'application/json'}
)

try:
    urllib.request.urlopen(req, context=ctx)
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8')
    print(f"Status Code: {e.code}")
    if e.code == 500:
        # Extract traceback if present
        m = re.search(r'<textarea id=\"traceback_area\"[^>]*>([\s\S]*?)</textarea>', html)
        if m:
            print("Traceback Found:")
            print(m.group(1)[:1500])
        else:
            print("No traceback found in HTML response.")
    else:
        print(f"Response: {html[:500]}")
except Exception as e:
    print(f"General Error: {e}")
