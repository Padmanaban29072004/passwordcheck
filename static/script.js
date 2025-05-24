// Theme Management
const themes = ['light', 'dark', 'neon'];
let currentTheme = localStorage.getItem('theme') || 'light';

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

// Initialize theme
setTheme(currentTheme);

// Theme switcher event listeners
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        setTheme(theme);
    });
});

// Settings Modal
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeBtn = document.querySelector('.close-btn');

settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Theme options in settings
document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        setTheme(theme);
    });
});

// Section Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${sectionId}Section`).style.display = 'block';
}

// Password strength calculation
function calculatePasswordStrength(password) {
    let strength = 0;
    const issues = [];

    // Length check
    if (password.length >= 8) {
        strength += 20;
    } else {
        issues.push("Password is too short");
    }

    // Character type checks
    if (/[A-Z]/.test(password)) {
        strength += 20;
    } else {
        issues.push("No uppercase letters");
    }

    if (/[a-z]/.test(password)) {
        strength += 20;
    } else {
        issues.push("No lowercase letters");
    }

    if (/[0-9]/.test(password)) {
        strength += 20;
    } else {
        issues.push("No numbers");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        strength += 20;
    } else {
        issues.push("No special characters");
    }

    // Additional checks
    if (/(.)\1{2,}/.test(password)) {
        strength -= 10;
        issues.push("Contains repeated characters");
    }

    return { strength, issues };
}

// Update strength meter with animation
function updateStrengthMeter(password) {
    const indicator = document.getElementById('strengthIndicator');
    const text = document.getElementById('strengthText');
    const { strength, issues } = calculatePasswordStrength(password);

    // Set CSS variable for animation
    document.documentElement.style.setProperty('--strength-width', `${strength}%`);
    
    // Update indicator width and color with animation
    indicator.style.width = `${strength}%`;
    
    if (strength < 40) {
        indicator.style.backgroundColor = 'var(--danger-color)';
        text.textContent = 'Very Weak';
        text.style.color = 'var(--danger-color)';
        animateElement(text, 'shake');
    } else if (strength < 60) {
        indicator.style.backgroundColor = 'var(--warning-color)';
        text.textContent = 'Weak';
        text.style.color = 'var(--warning-color)';
    } else if (strength < 80) {
        indicator.style.backgroundColor = 'var(--accent-primary)';
        text.textContent = 'Moderate';
        text.style.color = 'var(--accent-primary)';
    } else {
        indicator.style.backgroundColor = 'var(--success-color)';
        text.textContent = 'Strong';
        text.style.color = 'var(--success-color)';
        animateElement(text, 'pulse');
    }
}

// Animation helper function
function animateElement(element, animation) {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = `${animation} 0.5s ease-in-out`;
}

// Real-time password strength update with debounce
let strengthUpdateTimeout;
document.getElementById('passwordInput').addEventListener('input', function(e) {
    const password = e.target.value;
    
    // Clear previous timeout
    clearTimeout(strengthUpdateTimeout);
    
    // Set new timeout for debounced update
    strengthUpdateTimeout = setTimeout(() => {
        if (password) {
            updateStrengthMeter(password);
        } else {
            document.getElementById('strengthIndicator').style.width = '0';
            document.getElementById('strengthText').textContent = 'Enter a password';
            document.getElementById('strengthText').style.color = 'var(--text-secondary)';
        }
    }, 100);
});

// Password length slider
const lengthSlider = document.getElementById('passwordLength');
const lengthValue = document.getElementById('lengthValue');

lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

async function analyzePassword() {
    const password = document.getElementById('passwordInput').value;
    const resultDiv = document.getElementById('analysisResult');

    if (!password) {
        resultDiv.innerHTML = '<div class="alert alert-warning">Please enter a password to analyze</div>';
        animateElement(resultDiv, 'shake');
        return;
    }

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();
        
        if (data.is_strong) {
            resultDiv.innerHTML = `
                <div class="strong-password">
                    <h4><i class="fas fa-check-circle"></i> Password is Strong!</h4>
                    <p>Your password meets all the security criteria.</p>
                </div>`;
            animateElement(resultDiv, 'fadeIn');
        } else {
            let issuesHtml = '<div class="weak-password"><h4><i class="fas fa-exclamation-circle"></i> Password Needs Improvement</h4><ul>';
            data.issues.forEach(issue => {
                issuesHtml += `<li><i class="fas fa-times"></i> ${issue}</li>`;
            });
            issuesHtml += '</ul></div>';
            resultDiv.innerHTML = issuesHtml;
            animateElement(resultDiv, 'shake');
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Error analyzing password. Please try again.</div>';
        animateElement(resultDiv, 'shake');
    }
}

async function generatePassword() {
    const length = document.getElementById('passwordLength').value;
    const resultDiv = document.getElementById('generatedPassword');

    // Get password options
    const options = {
        length: parseInt(length),
        includeUppercase: document.getElementById('includeUppercase').checked,
        includeLowercase: document.getElementById('includeLowercase').checked,
        includeNumbers: document.getElementById('includeNumbers').checked,
        includeSpecial: document.getElementById('includeSpecial').checked
    };

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        });

        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> ${data.error}</div>`;
            animateElement(resultDiv, 'shake');
            return;
        }

        resultDiv.innerHTML = `
            <div class="generated-password">
                <div>${data.password}</div>
                <button class="btn-primary" onclick="copyToClipboard('${data.password}')">
                    <i class="fas fa-copy"></i> Copy to Clipboard
                </button>
            </div>`;
        animateElement(resultDiv, 'fadeIn');

        // Add to history if enabled
        if (document.getElementById('saveHistory').checked) {
            addToHistory(data.password);
        }

        // Auto-copy if enabled
        if (document.getElementById('autoCopy').checked) {
            copyToClipboard(data.password);
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> Error generating password. Please try again.</div>';
        animateElement(resultDiv, 'shake');
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const button = document.querySelector('.generated-password .btn-primary');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.backgroundColor = 'var(--success-color)';
        animateElement(button, 'pulse');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Password History
function addToHistory(password) {
    const historyList = document.getElementById('passwordHistory');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-password">${password}</div>
        <div class="history-actions">
            <button class="btn-icon" onclick="copyToClipboard('${password}')">
                <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    historyList.insertBefore(historyItem, historyList.firstChild);
}

// Event Listeners
document.getElementById('passwordInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        animateElement(this, 'pulse');
        analyzePassword();
    }
});

// Add hover animations for interactive elements
document.querySelectorAll('.btn-primary, .action-btn, .checkbox-custom').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
}); 