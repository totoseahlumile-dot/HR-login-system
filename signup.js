// ============================================================
// ModernTech Solutions — Create Account
// Validation: names, email, password strength, confirm match,
// terms agreement. Reuses the visual patterns from the sign-in page.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('signupForm');
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const agreeTerms = document.getElementById('agreeTerms');

  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');
  const termsError = document.getElementById('termsError');

  const strengthMeter = document.getElementById('strengthMeter');
  const strengthLabel = document.getElementById('strengthLabel');
  const signupBtn = document.getElementById('signupBtn');
  const ssoBtn = document.getElementById('ssoBtn');

  const wrapOf = (input) => input.closest('.input-wrap');

  function setState(input, state){
    wrapOf(input).dataset.state = state;
  }

  function showError(input, errorEl, message){
    if (wrapOf(input)) setState(input, 'error');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }

  function clearError(input, errorEl){
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
    if (wrapOf(input) && wrapOf(input).dataset.state === 'error'){
      setState(input, document.activeElement === input ? 'focus' : 'default');
    }
  }

  function isValidEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // ---------- focus / blur visual states for all text inputs ----------
  [firstName, lastName, email, password, confirmPassword].forEach((input) => {
    input.addEventListener('focus', () => {
      if (wrapOf(input).dataset.state !== 'error') setState(input, 'focus');
    });
    input.addEventListener('blur', () => {
      if (wrapOf(input).dataset.state !== 'error') setState(input, 'default');
    });
  });

  // ---------- password visibility toggles (works for both password fields) ----------
  document.querySelectorAll('.toggle-visibility').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      const isHidden = targetInput.type === 'password';
      targetInput.type = isHidden ? 'text' : 'password';

      btn.querySelector('.icon-eye').style.display = isHidden ? 'none' : 'block';
      btn.querySelector('.icon-eye-off').style.display = isHidden ? 'block' : 'none';
      btn.setAttribute('aria-pressed', String(isHidden));
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      targetInput.focus();
    });
  });

  // ---------- password strength scoring ----------
  // Simple heuristic: length + character variety. Not a security control,
  // just a UX nudge — real strength enforcement always happens server-side.
  function scorePassword(value){
    if (value.length === 0) return 0;
    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
    return Math.max(1, Math.min(score, 4));
  }

  const strengthText = { 0:'', 1:'Weak', 2:'Fair', 3:'Good', 4:'Strong' };

  password.addEventListener('input', () => {
    const level = scorePassword(password.value);
    strengthMeter.dataset.level = level;
    strengthLabel.dataset.level = level;
    strengthLabel.textContent = strengthText[level];

    if (password.value.length === 0 || password.value.length >= 8){
      clearError(password, passwordError);
    }
    // re-check confirm match live if it already has a value
    if (confirmPassword.value.length > 0){
      validateConfirmMatch();
    }
  });

  function validateConfirmMatch(showIfInvalid){
    if (confirmPassword.value.length === 0){
      clearError(confirmPassword, confirmPasswordError);
      return true;
    }
    if (confirmPassword.value !== password.value){
      if (showIfInvalid) showError(confirmPassword, confirmPasswordError, 'Passwords do not match.');
      return false;
    }
    clearError(confirmPassword, confirmPasswordError);
    return true;
  }

  confirmPassword.addEventListener('input', () => validateConfirmMatch(true));

  // ---------- live-clear simple fields as user corrects them ----------
  firstName.addEventListener('input', () => {
    if (firstName.value.trim() !== '') clearError(firstName, firstNameError);
  });
  lastName.addEventListener('input', () => {
    if (lastName.value.trim() !== '') clearError(lastName, lastNameError);
  });
  email.addEventListener('input', () => {
    if (email.value.trim() === '' || isValidEmail(email.value.trim())){
      clearError(email, emailError);
    }
  });
  agreeTerms.addEventListener('change', () => {
    if (agreeTerms.checked){
      termsError.classList.remove('visible');
      termsError.textContent = '';
    }
  });

  // ---------- form submit ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    let firstInvalidField = null;

    if (firstName.value.trim() === ''){
      showError(firstName, firstNameError, 'Enter your first name.');
      valid = false;
      firstInvalidField = firstInvalidField || firstName;
    } else {
      clearError(firstName, firstNameError);
    }

    if (lastName.value.trim() === ''){
      showError(lastName, lastNameError, 'Enter your last name.');
      valid = false;
      firstInvalidField = firstInvalidField || lastName;
    } else {
      clearError(lastName, lastNameError);
    }

    const emailVal = email.value.trim();
    if (emailVal === ''){
      showError(email, emailError, 'Enter your work email address.');
      valid = false;
      firstInvalidField = firstInvalidField || email;
    } else if (!isValidEmail(emailVal)){
      showError(email, emailError, 'Enter a valid email address.');
      valid = false;
      firstInvalidField = firstInvalidField || email;
    } else {
      clearError(email, emailError);
    }

    if (password.value.length === 0){
      showError(password, passwordError, 'Create a password.');
      valid = false;
      firstInvalidField = firstInvalidField || password;
    } else if (password.value.length < 8){
      showError(password, passwordError, 'Password must be at least 8 characters.');
      valid = false;
      firstInvalidField = firstInvalidField || password;
    } else {
      clearError(password, passwordError);
    }

    if (!validateConfirmMatch(true)){
      valid = false;
      firstInvalidField = firstInvalidField || confirmPassword;
    } else if (confirmPassword.value.length === 0){
      showError(confirmPassword, confirmPasswordError, 'Confirm your password.');
      valid = false;
      firstInvalidField = firstInvalidField || confirmPassword;
    }

    if (!agreeTerms.checked){
      termsError.textContent = 'You must agree to the Terms and Privacy Policy to continue.';
      termsError.classList.add('visible');
      valid = false;
      firstInvalidField = firstInvalidField || agreeTerms;
    }

    if (!valid){
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    // ---- create the account against the HR employee directory ----
    signupBtn.classList.add('is-loading');
    signupBtn.disabled = true;

    const result = await Auth.registerAccount(
      email.value, password.value, firstName.value, lastName.value
    );

    signupBtn.classList.remove('is-loading');
    signupBtn.disabled = false;

    if (!result.success){
      // Every current failure reason (not on file / not HR / already
      // registered) is about the email, so surface it there.
      showError(email, emailError, result.error);
      email.focus();
      return;
    }

    signupBtn.querySelector('.btn-label').textContent = 'Account Created';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
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

});
