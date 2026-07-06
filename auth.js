// ============================================================
// ModernTech Solutions — Auth Module
// ------------------------------------------------------------
// Shared by signup.html and index.html (login).
//
// Honesty note for anyone reviewing this code: this stores
// hashed credentials in the browser's localStorage. That's fine
// for a portfolio/demo project, but it is NOT how you'd do this
// in production — a real system hashes + stores credentials in a
// server-side database (e.g. bcrypt + Postgres/Mongo) and issues
// a server-signed session token. Nothing client-side is ever
// truly secure, since the user controls their own browser.
// ============================================================

const Auth = (() => {

  const ACCOUNTS_KEY = 'moderntech_accounts';
  const SESSION_KEY = 'moderntech_session';

  // ---------- password hashing (SHA-256 via Web Crypto) ----------
  async function hashPassword(password, salt){
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + ':' + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generateSalt(){
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ---------- account storage ----------
  function getAccounts(){
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error('Auth: failed to read accounts', err);
      return {};
    }
  }

  function saveAccounts(accounts){
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return true;
    } catch (err) {
      console.error('Auth: failed to save accounts', err);
      return false;
    }
  }

  function findEmployeeByEmail(email){
    const normalized = email.trim().toLowerCase();
    return EMPLOYEES.find(emp => emp.contact.toLowerCase() === normalized) || null;
  }

  function isHrEmployee(employee){
    return !!employee && employee.department.toLowerCase() === 'hr';
  }

  // ---------- registration ----------
  // Returns { success, error } — never throws to the caller.
  async function registerAccount(email, password, firstName, lastName){
    const normalized = email.trim().toLowerCase();

    const employee = findEmployeeByEmail(normalized);
    if (!employee){
      return { success:false, error:'This email is not on file as a ModernTech employee.' };
    }
    if (!isHrEmployee(employee)){
      return { success:false, error:'Only HR department accounts can register for this portal.' };
    }

    const accounts = getAccounts();
    if (accounts[normalized]){
      return { success:false, error:'An account with this email already exists. Try signing in instead.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    accounts[normalized] = {
      email: normalized,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      employeeId: employee.employeeId,
      position: employee.position,
      department: employee.department,
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    if (!saveAccounts(accounts)){
      return { success:false, error:'Could not save your account. Your browser storage may be full or disabled.' };
    }

    return { success:true, employee };
  }

  // ---------- login ----------
  async function login(email, password){
    const normalized = email.trim().toLowerCase();
    const accounts = getAccounts();
    const account = accounts[normalized];

    if (!account){
      return { success:false, error:'No account found with that email. Create an account first.' };
    }

    const attemptHash = await hashPassword(password, account.salt);
    if (attemptHash !== account.passwordHash){
      return { success:false, error:'Incorrect password. Please try again.' };
    }

    return { success:true, account };
  }

  // ---------- session ----------
  // "Remember me" -> persists in localStorage (survives browser close).
  // Otherwise -> sessionStorage (cleared when the tab/browser closes).
  function createSession(account, remember){
    const session = {
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      position: account.position,
      department: account.department,
      employeeId: account.employeeId,
      loggedInAt: new Date().toISOString()
    };
    const payload = JSON.stringify(session);

    if (remember){
      localStorage.setItem(SESSION_KEY, payload);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, payload);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function getSession(){
    try {
      const fromLocal = localStorage.getItem(SESSION_KEY);
      if (fromLocal) return JSON.parse(fromLocal);
      const fromSession = sessionStorage.getItem(SESSION_KEY);
      if (fromSession) return JSON.parse(fromSession);
      return null;
    } catch (err) {
      console.error('Auth: failed to read session', err);
      return null;
    }
  }

  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return {
    registerAccount,
    login,
    createSession,
    getSession,
    clearSession,
    findEmployeeByEmail,
    isHrEmployee
  };

})();
