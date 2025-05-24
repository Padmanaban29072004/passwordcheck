import re
import random
import string
from typing import Tuple, List

class PasswordAnalyzer:
    def __init__(self):
        self.min_length = 8
        self.max_length = 128
        self.common_passwords = [
            "password", "123456", "qwerty", "admin", "welcome",
            "letmein", "monkey", "password123", "12345678"
        ]

    def analyze_password(self, password: str) -> Tuple[bool, List[str]]:
        """
        Analyze the password strength and return a tuple of (is_strong, issues)
        """
        issues = []
        
        # Check length
        if len(password) < self.min_length:
            issues.append(f"Password is too short (minimum {self.min_length} characters)")
        elif len(password) > self.max_length:
            issues.append(f"Password is too long (maximum {self.max_length} characters)")

        # Check for common passwords
        if password.lower() in self.common_passwords:
            issues.append("This is a very common password")

        # Check for character types
        if not re.search(r"[A-Z]", password):
            issues.append("Password should contain at least one uppercase letter")
        if not re.search(r"[a-z]", password):
            issues.append("Password should contain at least one lowercase letter")
        if not re.search(r"\d", password):
            issues.append("Password should contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            issues.append("Password should contain at least one special character")

        # Check for sequential characters
        if re.search(r"(.)\1{2,}", password):
            issues.append("Password contains repeated characters")

        return len(issues) == 0, issues

    def generate_strong_password(self, length: int = 12, include_uppercase: bool = True,
                               include_lowercase: bool = True, include_numbers: bool = True,
                               include_special: bool = True) -> str:
        """
        Generate a strong password with the specified options
        """
        if length < self.min_length:
            length = self.min_length
        elif length > self.max_length:
            length = self.max_length

        # Define character sets based on options
        char_sets = []
        if include_uppercase:
            char_sets.append(string.ascii_uppercase)
        if include_lowercase:
            char_sets.append(string.ascii_lowercase)
        if include_numbers:
            char_sets.append(string.digits)
        if include_special:
            char_sets.append("!@#$%^&*(),.?\":{}|<>")

        if not char_sets:
            raise ValueError("At least one character set must be selected")

        # Ensure at least one character from each selected set
        password = []
        for char_set in char_sets:
            password.append(random.choice(char_set))

        # Fill the rest with random characters from all selected sets
        all_chars = ''.join(char_sets)
        password.extend(random.choice(all_chars) for _ in range(length - len(char_sets)))

        # Shuffle the password
        random.shuffle(password)
        return ''.join(password)

def main():
    analyzer = PasswordAnalyzer()
    
    print("=== Password Strength Analyzer ===")
    print("Enter 'q' to quit")
    
    while True:
        print("\n1. Analyze password")
        print("2. Generate strong password")
        choice = input("\nEnter your choice (1/2): ").strip()
        
        if choice == 'q':
            break
            
        if choice == '1':
            password = input("\nEnter password to analyze: ").strip()
            if password.lower() == 'q':
                break
                
            is_strong, issues = analyzer.analyze_password(password)
            
            if is_strong:
                print("\n✅ Password is strong!")
            else:
                print("\n❌ Password needs improvement:")
                for issue in issues:
                    print(f"- {issue}")
                    
                # Offer to generate a strong password
                if input("\nWould you like a strong password suggestion? (y/n): ").lower() == 'y':
                    suggested = analyzer.generate_strong_password()
                    print(f"\nSuggested strong password: {suggested}")
                    
        elif choice == '2':
            try:
                length = int(input("\nEnter desired password length (8-128): ").strip())
                password = analyzer.generate_strong_password(length)
                print(f"\nGenerated strong password: {password}")
            except ValueError:
                print("\nInvalid length. Using default length of 12.")
                password = analyzer.generate_strong_password()
                print(f"\nGenerated strong password: {password}")
        else:
            print("\nInvalid choice. Please try again.")

if __name__ == "__main__":
    main() 