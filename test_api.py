import urllib.request, json, re, ssl

body = {
  'first_name': 'Test', 'last_name': 'Test', 'email': 'test@test.com', 'cell_phone': '1231231234',
  'present_address': '123', 'city': 'atl', 'state': 'ga', 'zip_code': '12345',
  'move_in_date': '2026-05-01', 'intended_stay_duration': '6 months',
  'payment_method': 'CASHAPP', 'reference_id': '123',
  'proof_file': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://admin.haskerrealtygroup.com/api/v1/leads/apply/', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req, context=ctx)
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8')
    # Print the lines containing Exception Value
    lines = html.split('\n')
    for i, line in enumerate(lines):
        if 'Exception Value' in line or 'Exception Location' in line:
            print(line)
            print(lines[i+1])
            print(lines[i+2])
