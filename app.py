from flask import Flask, render_template, request, jsonify
from password_analyzer import PasswordAnalyzer
import secrets
import string
import re

app = Flask(__name__)
analyzer = PasswordAnalyzer()

@app.route('/')
def index():
    return render_template('index.html', title='PassworkCheck')

@app.route('/analyze', methods=['POST'])
def analyze_password():
    data = request.get_json()
    password = data.get('password', '')
    
    is_strong, issues = analyzer.analyze_password(password)
    
    return jsonify({
        'is_strong': is_strong,
        'issues': issues
    })

@app.route('/generate', methods=['POST'])
def generate_password():
    data = request.get_json()
    length = data.get('length', 12)
    include_uppercase = data.get('includeUppercase', True)
    include_lowercase = data.get('includeLowercase', True)
    include_numbers = data.get('includeNumbers', True)
    include_special = data.get('includeSpecial', True)
    
    try:
        length = int(length)
        if length < 8 or length > 128:
            return jsonify({
                'password': None,
                'error': 'Password length must be between 8 and 128 characters'
            })
            
        # Generate password with specified options
        password = analyzer.generate_strong_password(
            length=length,
            include_uppercase=include_uppercase,
            include_lowercase=include_lowercase,
            include_numbers=include_numbers,
            include_special=include_special
        )
        
        return jsonify({
            'password': password,
            'error': None
        })
    except ValueError:
        return jsonify({
            'password': None,
            'error': 'Invalid length provided'
        })

if __name__ == '__main__':
    app.run(debug=True) 