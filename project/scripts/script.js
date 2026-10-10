/* =========================================================
   Cedar3 Technology — Main Script
   Modules:
     1. Visitor Portal (localStorage)
     2. Services Catalog (array of objects + filter)
     3. Service Estimator (switch + conditionals)
     4. Contact Form (validation + localStorage)
     5. Helpers
   ========================================================= */

'use strict';

/* =========================================================
   1. SERVICES CATALOG — Data layer
   ========================================================= */

const services = [
  {
    id: 1,
    title: 'Multifunction Printer Diagnostic',
    category: 'printer',
    categoryLabel: 'Printers',
    description: 'Full inspection of print quality, paper path, and firmware; report issued same day.',
    turnaround: '24 hours'
  },
  {
    id: 2,
    title: 'Printhead & Roller Maintenance',
    category: 'printer',
    categoryLabel: 'Printers',
    description: 'Deep-clean, alignment, and replacement of worn rollers and printheads.',
    turnaround: '24–48 hours'
  },
  {
    id: 3,
    title: 'Toner & Consumables Replacement',
    category: 'printer',
    categoryLabel: 'Printers',
    description: 'Genuine and compatible toner supply, installation, and waste-toner service.',
    turnaround: 'Same day'
  },
  {
    id: 4,
    title: 'Desktop & Laptop Hardware Repair',
    category: 'it',
    categoryLabel: 'IT Support',
    description: 'Diagnostics and repair for motherboards, storage, RAM, and power issues.',
    turnaround: '48–72 hours'
  },
  {
    id: 5,
    title: 'Component Upgrades',
    category: 'it',
    categoryLabel: 'IT Support',
    description: 'SSD, RAM, and GPU upgrades to extend the life of existing machines.',
    turnaround: '24 hours'
  },
  {
    id: 6,
    title: 'Peripheral Setup & Support',
    category: 'it',
    categoryLabel: 'IT Support',
    description: 'Printers, scanners, and multi-device network configuration for your office.',
    turnaround: 'On-site, same day'
  },
  {
    id: 7,
    title: 'Preventative Maintenance Contracts',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    description: 'Scheduled monthly or quarterly servicing for printer fleets.',
    turnaround: 'Scheduled'
  },
  {
    id: 8,
    title: 'Annual Equipment Health Check',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    description: 'A full audit of all office equipment with a written report and recommendations.',
    turnaround: '5 business days'
  }
];

/* =========================================================
   2. HELPER FUNCTIONS
   ========================================================= */

/**
 * Format a Date object as a readable local string.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return date.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Safely read a JSON value from localStorage.
 * @param {string} key
 * @param {*} fallback
 */
function readStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn(`Could not read "${key}" from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely write a JSON value to localStorage.
 * @param {string} key
 * @param {*} value
 */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Could not write "${key}" to localStorage:`, err);
  }
}

/* =========================================================
   3. MODULE: VISITOR PORTAL (index.html)
   ========================================================= */

/**
 * Initialise the "Client Welcome Portal" on the home page.
 * Uses localStorage to greet returning visitors by name and
 * to display how many times they've visited.
 */
function initVisitorPortal() {
  const target = document.getElementById('welcome-message');
  if (!target) return; // Not on this page — exit quietly.

  const VISIT_KEY = 'cedar3.visitCount';
  const NAME_KEY = 'cedar3.visitorName';

  const previousVisits = readStorage(VISIT_KEY, 0);
  const visitorName = readStorage(NAME_KEY, null);
  const newVisitCount = previousVisits + 1;

  writeStorage(VISIT_KEY, newVisitCount);

  // Build the message — conditionally.
  let greeting;

  if (newVisitCount === 1) {
    greeting = `Welcome to Cedar3 Technology! This is your first visit.`;
  } else if (visitorName) {
    greeting = `Welcome back, ${visitorName}! This is visit number ${newVisitCount}.`;
  } else {
    greeting = `Welcome back! You have visited ${newVisitCount} times.`;
  }

  // Optional: if no name stored, prompt for one via a second line.
  const nameLine = visitorName
    ? `We last saw you on ${formatDate(new Date())}.`
    : `Enter your name below and we will remember you next time.`;

  target.innerHTML = `
    <span class="portal-greeting">${greeting}</span><br>
    <span class="portal-sub">${nameLine}</span>
  `;

  // Simple inline form for storing the visitor's name.
  if (!visitorName) {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'visitor-name-input';
    nameInput.placeholder = 'Your name';
    nameInput.maxLength = 40;
    nameInput.className = 'portal-input';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn portal-btn';
    saveBtn.textContent = 'Remember Me';

    saveBtn.addEventListener('click', () => {
      const value = nameInput.value.trim();
      if (value.length < 2) {
        target.querySelector('.portal-sub').textContent = 'Please enter at least 2 characters.';
        return;
      }
      writeStorage(NAME_KEY, value);
      target.innerHTML = `
        <span class="portal-greeting">Thanks, ${value}! We will remember you on your next visit.</span>
      `;
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'portal-input-row';
    wrapper.appendChild(nameInput);
    wrapper.appendChild(saveBtn);
    target.appendChild(wrapper);
  }
}

/* =========================================================
   4. MODULE: SERVICES CATALOG + FILTER (services.html)
   ========================================================= */

/**
 * Render an array of service objects into #services-container.
 * @param {Array} list
 */
function renderServices(list) {
  const container = document.getElementById('services-container');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<p class="no-results">No services match this filter.</p>`;
    return;
  }

  // Build the markup with .map() and template literals.
  const html = list
    .map(
      (svc) => `
        <article class="card" data-category="${svc.category}">
          <span class="badge">${svc.categoryLabel}</span>
          <h3>${svc.title}</h3>
          <p>${svc.description}</p>
          <p class="turnaround"><strong>Typical turnaround:</strong> ${svc.turnaround}</p>
        </article>
      `
    )
    .join('');

  container.innerHTML = html;
}

/**
 * Wire up the filter buttons on services.html.
 * Uses array.filter() to narrow the list.
 */
function initServiceFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const container = document.getElementById('services-container');
  if (!container || buttons.length === 0) return;

  // Initial render.
  renderServices(services);

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter; // 'all' | 'printer' | 'it' | 'maintenance'

      // Update active state on buttons.
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Conditional filter + array method.
      const filtered = filter === 'all'
        ? services
        : services.filter((svc) => svc.category === filter);

      renderServices(filtered);
    });
  });
}

/* =========================================================
   5. MODULE: SERVICE ESTIMATOR (services.html)
   ========================================================= */

/**
 * Map a service category to an estimated turnaround message.
 * Uses a switch to demonstrate conditional branching.
 * @param {string} value
 * @returns {{ message: string, isError: boolean }}
 */
function estimateTurnaround(value) {
  switch (value) {
    case 'printer':
      return { message: 'Printer diagnostic: typically completed within 24 hours.', isError: false };
    case 'it':
      return { message: 'Hardware / PC repair: typical turnaround is 48–72 hours.', isError: false };
    case 'maintenance':
      return { message: 'Preventative maintenance: scheduled within 3–5 business days.', isError: false };
    case 'toner':
      return { message: 'Toner & consumables: available same-day for in-stock items.', isError: false };
    case 'network':
      return { message: 'Network setup: on-site visit booked within 2 business days.', isError: false };
    case '':
      return { message: '', isError: false };
    default:
      return { message: 'Please choose a valid service type.', isError: true };
  }
}

/**
 * Wire the estimator <select> on services.html.
 */
function initEstimator() {
  const select = document.getElementById('estimator-select');
  const result = document.getElementById('estimator-result');
  if (!select || !result) return;

  select.addEventListener('change', (event) => {
    const value = event.target.value;
    const { message, isError } = estimateTurnaround(value);

    result.classList.remove('success', 'error');

    if (message === '') {
      result.textContent = '';
      return;
    }

    result.textContent = message;
    result.classList.add(isError ? 'error' : 'success');

    // Save the last viewed service to localStorage.
    if (!isError) {
      writeStorage('cedar3.lastService', value);
    }
  });

  // Restore last viewed service on page load.
  const last = readStorage('cedar3.lastService', null);
  if (last) {
    select.value = last;
    const { message, isError } = estimateTurnaround(last);
    result.textContent = message;
    if (message) {
      result.classList.add(isError ? 'error' : 'success');
    }
  }
}

/* =========================================================
   6. MODULE: CONTACT FORM (contact.html)
   ========================================================= */

/**
 * Validate a single form field.
 * Returns { valid: boolean, message: string }
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field
 */
function validateField(field) {
  const value = field.value.trim();
  const name = field.name;

  if (field.required && value === '') {
    return { valid: false, message: `Please fill in the "${name}" field.` };
  }

  if (name === 'email' && value !== '') {
    // Simple pattern — HTML5 <input type="email"> is stricter, but this is a backup.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { valid: false, message: 'Please enter a valid email address.' };
    }
  }

  if (field.minLength > 0 && value.length < field.minLength) {
    return { valid: false, message: `"${name}" must be at least ${field.minLength} characters.` };
  }

  if (field.maxLength > 0 && value.length > field.maxLength) {
    return { valid: false, message: `"${name}" must be ${field.maxLength} characters or fewer.` };
  }

  return { valid: true, message: '' };
}

/**
 * Wire up the contact form on contact.html.
 * Validates, stores the submission in localStorage, and shows feedback.
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.textContent = '';
    feedback.classList.remove('success', 'error');

    const fields = form.querySelectorAll('input, textarea, select');
    const errors = [];

    // Validate every field with .forEach (array-like NodeList).
    fields.forEach((field) => {
      const { valid, message } = validateField(field);
      if (!valid) errors.push(message);
    });

    // Consent checkbox needs its own check.
    const consent = form.querySelector('#consent');
    if (consent && !consent.checked) {
      errors.push('Please tick the consent box before submitting.');
    }

    // Conditional branch: show errors OR success.
    if (errors.length > 0) {
      feedback.classList.add('error');
      feedback.innerHTML = `
        <strong>Please fix the following:</strong>
        <ul>${errors.map((e) => `<li>${e}</li>`).join('')}</ul>
      `;
      return;
    }

    // Build a submission object from the form.
    const data = Object.fromEntries(new FormData(form).entries());

    // Add a timestamp.
    const submission = {
      ...data,
      submittedAt: new Date().toISOString()
    };

    // Read existing submissions from localStorage.
    const existing = readStorage('cedar3.submissions', []);
    existing.push(submission);
    writeStorage('cedar3.submissions', existing);

    // Success message.
    feedback.classList.add('success');
    feedback.innerHTML = `
      <strong>Thank you, ${data.fullname}!</strong>
      <p>Your support request for <em>${data.device}</em> has been logged. We will contact you at <em>${data.email}</em> within one business day.</p>
    `;

    // Remember the visitor's name for the home page portal.
    if (data.fullname) {
      writeStorage('cedar3.visitorName', data.fullname);
    }

    // Reset the form.
    form.reset();
  });

  // Pre-fill the name field if we already know the visitor.
  const storedName = readStorage('cedar3.visitorName', null);
  const nameField = form.querySelector('#fullname');
  if (storedName && nameField && !nameField.value) {
    nameField.value = storedName;
  }
}

/* =========================================================
   7. BOOTSTRAP
   ========================================================= */

/**
 * Run all page-specific initialisers.
 * Each one exits quietly if its target element isn't on the page.
 */
function init() {
  initVisitorPortal();
  initServiceFilter();
  initEstimator();
  initContactForm();
}

document.addEventListener('DOMContentLoaded', init);