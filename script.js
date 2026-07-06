// ============================================================
// ModernTech Solutions — Sign In
// Interactivity: input states, validation, password toggle,
// loading states, and accessible focus handling.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // If a remembered/active session already exists, skip straight to the dashboard.
  const existingSession = Auth.getSession();
  if (existingSession){
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const signInBtn = document.getElementById('signInBtn');
  const ssoBtn = document.getElementById('ssoBtn');
  const toggleBtn = document.getElementById('toggleVisibility');
  const forgotLink = document.getElementById('forgotLink');
  const rememberMe = document.getElementById('rememberMe');

  // ---------- helpers ----------
  const wrapOf = (input) => input.closest('.input-wrap');

  function setState(input, state){
    wrapOf(input).dataset.state = state;
  }

  function showError(input, errorEl, message){
    setState(input, 'error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }

  function clearError(input, errorEl){
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
    if (wrapOf(input).dataset.state === 'error'){
      setState(input, document.activeElement === input ? 'focus' : 'default');
    }
  }

  function isValidEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // ---------- focus / blur visual states ----------
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener('focus', () => {
      if (wrapOf(input).dataset.state !== 'error') setState(input, 'focus');
    });
    input.addEventListener('blur', () => {
      if (wrapOf(input).dataset.state !== 'error') setState(input, 'default');
    });
  });

  // ---------- live validation ----------
  emailInput.addEventListener('input', () => {
    if (emailInput.value.trim() === '' || isValidEmail(emailInput.value.trim())){
      clearError(emailInput, emailError);
    }
  });

  passwordInput.addEventListener('input', () => {
    if (passwordInput.value.length === 0 || passwordInput.value.length >= 8){
      clearError(passwordInput, passwordError);
    }
  });

  // ---------- password visibility toggle ----------
  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';

    toggleBtn.querySelector('.icon-eye').style.display = isHidden ? 'none' : 'block';
    toggleBtn.querySelector('.icon-eye-off').style.display = isHidden ? 'block' : 'none';
    toggleBtn.setAttribute('aria-pressed', String(isHidden));
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');

    // keep focus + caret position sensible after type swap
    passwordInput.focus();
  });

  // ---------- form submit ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    const emailVal = emailInput.value.trim();
    const passVal = passwordInput.value;

    if (emailVal === ''){
      showError(emailInput, emailError, 'Enter your work email address.');
      valid = false;
    } else if (!isValidEmail(emailVal)){
      showError(emailInput, emailError, 'Enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    if (passVal === ''){
      showError(passwordInput, passwordError, 'Enter your password.');
      valid = false;
    } else {
      clearError(passwordInput, passwordError);
    }

    if (!valid){
      const firstInvalid = wrapOf(emailInput).dataset.state === 'error' ? emailInput : passwordInput;
      firstInvalid.focus();
      return;
    }

    // ---- authenticate against stored accounts ----
    signInBtn.classList.add('is-loading');
    signInBtn.disabled = true;

    const result = await Auth.login(emailVal, passVal);

    if (!result.success){
      signInBtn.classList.remove('is-loading');
      signInBtn.disabled = false;
      // Incorrect password is specific to that field; anything else
      // (no account found) belongs on the email field.
      if (result.error.toLowerCase().includes('password')){
        showError(passwordInput, passwordError, result.error);
        passwordInput.focus();
      } else {
        showError(emailInput, emailError, result.error);
        emailInput.focus();
      }
      return;
    }

    Auth.createSession(result.account, rememberMe.checked);

    signInBtn.querySelector('.btn-label').textContent = 'Signed In';
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 700);
  });

  // ---------- SSO button ----------
  ssoBtn.addEventListener('click', () => {
    ssoBtn.classList.add('is-loading');
    const label = ssoBtn.querySelector('span:last-child');
    const originalText = label.textContent;
    label.textContent = 'Redirecting to SSO…';

    setTimeout(() => {
      ssoBtn.classList.remove('is-loading');
      label.textContent = originalText;
    }, 1600);
  });

  // ---------- forgot password (placeholder demo behavior) ----------
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotLink.textContent = 'Check your email';
    setTimeout(() => { forgotLink.textContent = 'Forgot password?'; }, 2200);
  });

});
