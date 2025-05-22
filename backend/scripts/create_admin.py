import requests
import json

def create_admin():
    url = 'http://localhost:3000/register'
    data = {
        'name': 'Admin',
        'email': 'admin@besustainable.com',
        'password': '1234'
    }
    
    try:
        response = requests.post(url, json=data)
        print('Status:', response.status_code)
        print('Response:', response.json())
    except Exception as e:
        print('Error:', str(e))

if __name__ == '__main__':
    create_admin() 