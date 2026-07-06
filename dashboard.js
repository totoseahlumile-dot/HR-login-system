// ============================================================
// ModernTech Solutions — HR Dashboard
// ------------------------------------------------------------
// Guards this page behind an active session, renders the employee
// directory from the embedded dataset, and provides simple
// client-side search/filter plus logout.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------- session guard ----------
  const session = Auth.getSession();
  if (!session){
    window.location.href = 'index.html';
    return;
  }

  // ---------- populate header ----------
  const initials = (session.firstName?.[0] || '') + (session.lastName?.[0] || '');
  document.getElementById('dashUserAvatar').textContent = initials.toUpperCase() || 'HR';
  document.getElementById('dashUserName').textContent = `${session.firstName} ${session.lastName}`.trim();
  document.getElementById('dashUserRole').textContent = session.position || 'HR';
  document.getElementById('welcomeHeading').textContent = `Welcome back, ${session.firstName || 'there'}`;

  // ---------- logout ----------
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.clearSession();
    window.location.href = 'index.html';
  });

  // ---------- stats ----------
  const total = EMPLOYEES.length;
  const departments = new Set(EMPLOYEES.map(e => e.department));
  const avgSalary = Math.round(EMPLOYEES.reduce((sum, e) => sum + e.salary, 0) / total);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statDepartments').textContent = departments.size;
  document.getElementById('statAvgSalary').textContent =
    avgSalary.toLocaleString('en-ZA', { style:'currency', currency:'ZAR', maximumFractionDigits:0 });

  // ---------- department filter options ----------
  const departmentFilter = document.getElementById('departmentFilter');
  [...departments].sort().forEach((dept) => {
    const opt = document.createElement('option');
    opt.value = dept;
    opt.textContent = dept;
    departmentFilter.appendChild(opt);
  });

  // ---------- table rendering ----------
  const tbody = document.getElementById('employeeTableBody');
  const tableEmpty = document.getElementById('tableEmpty');
  const searchInput = document.getElementById('searchInput');

  function formatSalary(value){
    return value.toLocaleString('en-ZA', { style:'currency', currency:'ZAR', maximumFractionDigits:0 });
  }

  function renderTable(){
    const query = searchInput.value.trim().toLowerCase();
    const dept = departmentFilter.value;

    const filtered = EMPLOYEES.filter((emp) => {
      const matchesQuery = query === '' ||
        emp.name.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query);
      const matchesDept = dept === '' || emp.department === dept;
      return matchesQuery && matchesDept;
    });

    tbody.innerHTML = '';

    if (filtered.length === 0){
      tableEmpty.style.display = 'block';
      return;
    }
    tableEmpty.style.display = 'none';

    filtered.forEach((emp) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="name-cell">${escapeHtml(emp.name)}</td>
        <td>${escapeHtml(emp.position)}</td>
        <td><span class="dept-pill">${escapeHtml(emp.department)}</span></td>
        <td>${formatSalary(emp.salary)}</td>
        <td>${escapeHtml(emp.employmentHistory)}</td>
        <td><a href="mailto:${escapeHtml(emp.contact)}" class="contact-link">${escapeHtml(emp.contact)}</a></td>
      `;
      tbody.appendChild(row);
    });
  }

  // Minimal HTML-escaping since this data renders via innerHTML.
  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  searchInput.addEventListener('input', renderTable);
  departmentFilter.addEventListener('change', renderTable);

  renderTable();
});
