// HKIS Middle School bell schedules (2026–27) on an 8-day cycle. The cycle
// moves forward one day for every school day; weekends and NO_SCHOOL dates
// are skipped.

// A known date and its cycle day; every other date is counted from here.
const ANCHOR = { date: '2026-10-13', day: 8 };

const SCHOOL_YEAR = { first: '2026-08-13', last: '2027-06-16' };

// Weekdays with no school for students, from the 2026–27 schoolwide
// calendar. Add ranges as [first, last].
const NO_SCHOOL = [
  ['2026-10-01', '2026-10-02'], // National Day, PD day
  ['2026-10-19', '2026-10-23'], // Fall break
  ['2026-11-26', '2026-11-27'], // PD day, Thanksgiving
  ['2026-12-14', '2027-01-01'], // Winter break, New Year's Day
  ['2027-02-05', '2027-02-12'], // PD day, Lunar New Year
  ['2027-03-26', '2027-04-05'], // Spring break
  ['2027-05-13', '2027-05-14'], // Buddha's Birthday, school holiday
  ['2027-06-09', '2027-06-09'], // Tuen Ng Festival
];

const CLUB_DAYS = { 2: 'Tuesday Club', 4: 'Thursday Club' };
const OFFICE_HOUR_DAYS = [1, 3, 5];

const AFTER_SCHOOL = (date) => ['After School', '15:00', '16:00', OFFICE_HOUR_DAYS.includes(date.getDay())
  ? 'Office hours · Extended clubs · Activities'
  : 'Extended clubs · Activities'];

// --- Grade 7/8: four 70-minute periods ---

// Which block meets in periods 1–4 on each cycle day.
const G78_CYCLE = {
  1: ['Core A', 'Core B', 'Elective 1', 'Elective 2'],
  2: ['Elective 3', 'Elective 4', 'Core C', 'Core D'],
  3: ['Core B', 'Core A', 'Elective 2', 'Elective 1'],
  4: ['Elective 4', 'Elective 3', 'Core D', 'Core C'],
  5: ['Elective 1', 'Elective 2', 'Core A', 'Core B'],
  6: ['Core C', 'Core D', 'Elective 3', 'Elective 4'],
  7: ['Elective 2', 'Elective 1', 'Core B', 'Core A'],
  8: ['Core D', 'Core C', 'Elective 4', 'Elective 3'],
};

function grade78(date, day) {
  const blocks = G78_CYCLE[day];
  return [
    [CLUB_DAYS[date.getDay()] || 'Pastoral Care Group', '7:50', '8:25'],
    ['Passing Time', '8:25', '8:30'],
    [blocks[0], '8:30', '9:40', 'Period 1'],
    ['Break', '9:40', '9:55'],
    ['Passing Time', '9:55', '10:00'],
    [blocks[1], '10:00', '11:10', 'Period 2'],
    ['Passing Time', '11:10', '11:15'],
    ['Academic Team & WIN Time', '11:15', '11:45'],
    ['Lunch', '11:45', '12:25'],
    ['Passing Time', '12:25', '12:30'],
    [blocks[2], '12:30', '13:40', 'Period 3'],
    ['Passing Time', '13:40', '13:50'],
    [blocks[3], '13:50', '15:00', 'Period 4'],
    AFTER_SCHOOL(date),
  ];
}

// --- Grade 6: Core A/B in one half of the day, three short electives in the other ---

// Days where the electives are in the morning; on the rest they're after lunch.
const G6_MORNING_ELECTIVES = [1, 3, 6, 8];

function grade6(date, day) {
  const track = day % 2 ? 'A' : 'B'; // Elective 2 & 3 alternate A/B rotations
  const morning = G6_MORNING_ELECTIVES.includes(day)
    ? [
      ['Elective 1', '8:30', '9:15', 'Period 1'],
      ['Passing Time', '9:15', '9:20'],
      [`Elective 2${track}`, '9:20', '10:05', 'Period 1'],
      ['Break', '10:05', '10:20'],
      ['Passing Time', '10:20', '10:25'],
      [`Elective 3${track}`, '10:25', '11:10', 'Period 2'],
    ]
    : [
      ['Core A', '8:30', '9:40', 'Period 1'],
      ['Break', '9:40', '9:55'],
      ['Passing Time', '9:55', '10:00'],
      ['Core B', '10:00', '11:10', 'Period 2'],
    ];
  const afternoon = G6_MORNING_ELECTIVES.includes(day)
    ? [
      ['Core A', '12:30', '13:40', 'Period 3'],
      ['Passing Time', '13:40', '13:50'],
      ['Core B', '13:50', '15:00', 'Period 4'],
    ]
    : [
      ['Elective 1', '12:30', '13:15', 'Period 3'],
      ['Passing Time', '13:15', '13:20'],
      [`Elective 2${track}`, '13:20', '14:05', 'Period 3'],
      ['Passing Time', '14:05', '14:15'],
      [`Elective 3${track}`, '14:15', '15:00', 'Period 4'],
    ];

  return [
    ['Pastoral Care Group Check In', '7:50', '7:55'],
    ['Passing Time', '7:55', '8:00'],
    [CLUB_DAYS[date.getDay()] || 'Pastoral Care Group', '8:00', '8:25'],
    ['Passing Time', '8:25', '8:30'],
    ...morning,
    ['Passing Time', '11:10', '11:15'],
    ['Dyad', '11:15', '11:45'],
    ['Lunch', '11:45', '12:25'],
    ['Passing Time', '12:25', '12:30'],
    ...afternoon,
    AFTER_SCHOOL(date),
  ];
}

const GRADES = {
  6: {
    label: 'Grade 6',
    schedule: grade6,
    blocks: ['Core A', 'Core B', 'Elective 1', 'Elective 2A', 'Elective 2B', 'Elective 3A', 'Elective 3B'],
  },
  78: {
    label: 'Grade 7/8',
    schedule: grade78,
    blocks: ['Core A', 'Core B', 'Core C', 'Core D', 'Elective 1', 'Elective 2', 'Elective 3', 'Elective 4'],
  },
};

// --- Date helpers (all in local time) ---

function toKey(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const next = new Date(date);
  next.setDate(next.getDate() + n);
  return next;
}

function isSchoolDay(date) {
  const day = date.getDay();
  const key = toKey(date);
  if (day === 0 || day === 6 || key < SCHOOL_YEAR.first || key > SCHOOL_YEAR.last) return false;
  return !NO_SCHOOL.some(([first, last]) => key >= first && key <= last);
}

// The closest school day from `date` in direction `step` (1 or -1), or null
// if the school year runs out first.
function nearestSchoolDay(date, step) {
  for (let d = date; toKey(d) >= SCHOOL_YEAR.first && toKey(d) <= SCHOOL_YEAR.last; d = addDays(d, step)) {
    if (isSchoolDay(d)) return d;
  }
  return null;
}

function cycleDay(date) {
  const anchor = fromKey(ANCHOR.date);
  const step = date >= anchor ? 1 : -1;
  let offset = 0;
  for (let d = anchor; toKey(d) !== toKey(date); d = addDays(d, step)) {
    if (isSchoolDay(addDays(d, step))) offset += step;
  }
  return ((((ANCHOR.day - 1 + offset) % 8) + 8) % 8) + 1;
}

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')}`;
}

// --- State ---

function startOfToday() {
  return new Date(new Date().toDateString());
}

function defaultDay() {
  const today = startOfToday();
  if (toKey(today) < SCHOOL_YEAR.first) return fromKey(SCHOOL_YEAR.first);
  return nearestSchoolDay(today, 1) || nearestSchoolDay(today, -1) || fromKey(SCHOOL_YEAR.last);
}

const state = {
  viewing: defaultDay(),
  grade: '78',
  user: null,
  classes: {}, // block -> the student's own class name, e.g. { 'Core A': 'Social Studies' }
  editing: false,
};

function loadSavedGrade() {
  try {
    return localStorage.getItem('dragonweb-grade');
  } catch (err) {
    return null;
  }
}

function saveGrade(grade) {
  try {
    localStorage.setItem('dragonweb-grade', grade);
  } catch (err) {
    // Private mode etc. – the toggle still works for this visit.
  }
}

function loadSavedClasses() {
  try {
    return JSON.parse(localStorage.getItem('dragonweb-classes')) || {};
  } catch (err) {
    return {};
  }
}

function saveClassesLocally(classes) {
  try {
    localStorage.setItem('dragonweb-classes', JSON.stringify(classes));
  } catch (err) {
    // Not saved, but still shown for this visit.
  }
}

// --- Rendering ---

function render() {
  const now = new Date();
  const isToday = toKey(state.viewing) === toKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const day = cycleDay(state.viewing);
  const grade = GRADES[state.grade];

  document.getElementById('schedule-date').textContent = state.viewing.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  document.getElementById('schedule-day').textContent = `Day ${day} (${day % 2 ? 'A' : 'B'})${isToday ? ' · Today' : ''}`;
  document.getElementById('schedule-subtitle').textContent = state.user?.grade
    ? `Your ${grade.label} schedule, ${state.user.name.split(' ')[0]}.`
    : `${grade.label} daily schedule`;

  document.querySelectorAll('[data-grade]').forEach((button) => {
    const active = button.dataset.grade === state.grade;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  document.getElementById('prev-day').disabled = !nearestSchoolDay(addDays(state.viewing, -1), -1);
  document.getElementById('next-day').disabled = !nearestSchoolDay(addDays(state.viewing, 1), 1);
  document.getElementById('today-day').classList.toggle('hidden', toKey(state.viewing) === toKey(defaultDay()));

  const list = document.getElementById('schedule-list');
  list.replaceChildren(...grade.schedule(state.viewing, day).map(([name, start, end, detail]) => {
    const item = document.createElement('li');
    if (name === 'Passing Time') item.classList.add('passing');
    if (name === 'Break' || name === 'Lunch') item.classList.add('break');
    if (/^(Core|Elective)/.test(name)) item.classList.add('class');
    if (isToday && nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end)) item.classList.add('now');

    const className = state.classes[name];
    const text = document.createElement('div');
    const label = document.createElement('strong');
    label.textContent = className || name;
    text.append(label);
    const sub = [className && name, detail].filter(Boolean).join(' · ');
    if (sub) {
      const small = document.createElement('small');
      small.textContent = sub;
      text.append(small);
    }
    const time = document.createElement('span');
    time.textContent = `${formatTime(start)} – ${formatTime(end)}`;
    item.append(text, time);
    return item;
  }));

  renderClassEditor();
}

function renderClassEditor() {
  const form = document.getElementById('classes-form');
  const toggle = document.getElementById('edit-classes');
  form.classList.toggle('hidden', !state.editing);
  toggle.classList.toggle('hidden', state.editing);
  toggle.textContent = Object.keys(state.classes).length ? 'Edit my classes' : 'Add my classes';
  document.getElementById('classes-hint').textContent = state.user
    ? 'Saved to your account.'
    : 'Saved on this device. Log in to keep them on your account.';
  if (!state.editing) return;

  const fields = document.getElementById('classes-fields');
  if (fields.dataset.grade === state.grade) return; // keep what's being typed
  fields.dataset.grade = state.grade;
  fields.replaceChildren(...GRADES[state.grade].blocks.map((block) => {
    const id = `class-${block.replace(/\s+/g, '-').toLowerCase()}`;
    const label = document.createElement('label');
    label.className = 'form-label';
    label.htmlFor = id;
    label.textContent = block;
    const input = document.createElement('input');
    input.className = 'form-input';
    input.id = id;
    input.name = block;
    input.maxLength = 40;
    input.placeholder = block.startsWith('Core') ? 'e.g. Math' : 'e.g. Art';
    input.value = state.classes[block] || '';
    return [label, input];
  }).flat());
}

function openClassEditor() {
  state.editing = true;
  delete document.getElementById('classes-fields').dataset.grade;
  render();
  document.querySelector('#classes-fields input').focus();
}

function closeClassEditor() {
  state.editing = false;
  render();
  document.getElementById('edit-classes').focus();
}

async function saveClasses(event) {
  event.preventDefault();
  const error = document.getElementById('classes-error');
  error.classList.add('hidden');

  const classes = { ...state.classes };
  document.querySelectorAll('#classes-fields input').forEach((input) => {
    const value = input.value.trim();
    if (value) classes[input.name] = value;
    else delete classes[input.name];
  });

  if (state.user) {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classes }),
    }).catch(() => null);
    if (!res?.ok) {
      error.textContent = (await res?.json().catch(() => null))?.error || 'Could not save. Try again.';
      error.classList.remove('hidden');
      return;
    }
    state.user = { ...state.user, ...(await res.json()) };
  } else {
    saveClassesLocally(classes);
  }

  state.classes = classes;
  closeClassEditor();
}

async function setGrade(grade) {
  state.grade = grade;
  saveGrade(grade);
  render();

  // Logged-in students keep their grade on their account.
  const accountGrade = grade === '6' ? 6 : state.user?.grade === 8 ? 8 : 7;
  if (state.user && state.user.grade !== accountGrade) {
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: accountGrade }),
    });
    if (res.ok) {
      state.user = { ...state.user, ...(await res.json()) };
      render();
    }
  }
}

async function initSchedule() {
  document.getElementById('prev-day').addEventListener('click', () => {
    state.viewing = nearestSchoolDay(addDays(state.viewing, -1), -1) || state.viewing;
    render();
  });
  document.getElementById('next-day').addEventListener('click', () => {
    state.viewing = nearestSchoolDay(addDays(state.viewing, 1), 1) || state.viewing;
    render();
  });
  document.getElementById('today-day').addEventListener('click', () => {
    state.viewing = defaultDay();
    render();
  });
  document.querySelectorAll('[data-grade]').forEach((button) => {
    button.addEventListener('click', () => setGrade(button.dataset.grade));
  });
  document.getElementById('edit-classes').addEventListener('click', openClassEditor);
  document.getElementById('cancel-classes').addEventListener('click', closeClassEditor);
  document.getElementById('classes-form').addEventListener('submit', saveClasses);

  const saved = loadSavedGrade();
  if (GRADES[saved]) state.grade = saved;
  state.classes = loadSavedClasses();
  render();

  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      state.user = await res.json();
      if (state.user.grade) state.grade = state.user.grade === 6 ? '6' : '78';
      const local = state.classes;
      state.classes = state.user.classes || {};
      render();

      // Classes typed in before logging in move onto the account.
      if (!Object.keys(state.classes).length && Object.keys(local).length) {
        const saved = await fetch('/api/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classes: local }),
        });
        if (saved.ok) {
          state.user = await saved.json();
          state.classes = state.user.classes;
          render();
        }
      }
    }
  } catch (err) {
    // Offline or logged out – the saved/default grade is fine.
  }

  setInterval(render, 60 * 1000); // keep the "now" highlight current
}

document.addEventListener('DOMContentLoaded', initSchedule);
