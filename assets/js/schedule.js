// G7/8 bell schedule on an 8-day cycle. The cycle moves forward one day for
// every school day (weekends and NO_SCHOOL dates are skipped).

// A known date and its cycle day; every other date is counted from here.
const ANCHOR = { date: '2026-10-13', day: 8 };

// Weekdays with no school (holidays, breaks). Add ranges as [first, last].
const NO_SCHOOL = [
  ['2026-10-19', '2026-10-23'],
];

// Which block meets in periods 1–4 on each cycle day.
// Odd days are A days, even days are B days.
const CYCLE = {
  1: ['Core A', 'Core B', 'Elective 1', 'Elective 2'],
  2: ['Elective 3', 'Elective 4', 'Core C', 'Core D'],
  3: ['Core B', 'Core A', 'Elective 2', 'Elective 1'],
  4: ['Elective 4', 'Elective 3', 'Core D', 'Core C'],
  5: ['Elective 1', 'Elective 2', 'Core A', 'Core B'],
  6: ['Core C', 'Core D', 'Elective 3', 'Elective 4'],
  7: ['Elective 2', 'Elective 1', 'Core B', 'Core A'],
  8: ['Core D', 'Core C', 'Elective 4', 'Elective 3'],
};

const CLUB_DAYS = { 2: 'Tuesday Club', 4: 'Thursday Club' };

function bellSchedule(date, blocks) {
  const club = CLUB_DAYS[date.getDay()];
  const morning = club
    ? [['PCG', '7:50', '7:55'], ['Passing Time', '7:55', '8:00'], [club, '8:00', '8:25']]
    : [['PCG', '7:50', '8:25']];

  return [
    ...morning,
    ['Passing Time', '8:25', '8:30'],
    [blocks[0], '8:30', '9:40'],
    ['Break', '9:40', '9:55'],
    ['Passing Time', '9:55', '10:00'],
    [blocks[1], '10:00', '11:10'],
    ['Passing Time', '11:10', '11:15'],
    ['Academic Team Time', '11:15', '11:45'],
    ['Lunch', '11:45', '12:25'],
    ['Passing Time', '12:25', '12:30'],
    [blocks[2], '12:30', '13:40'],
    ['Passing Time', '13:40', '13:50'],
    [blocks[3], '13:50', '15:00'],
    ['Extended Clubs / After School', '15:00', '16:00'],
  ];
}

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
  if (day === 0 || day === 6) return false;
  const key = toKey(date);
  return !NO_SCHOOL.some(([first, last]) => key >= first && key <= last);
}

function nearestSchoolDay(date, step) {
  let d = date;
  while (!isSchoolDay(d)) d = addDays(d, step);
  return d;
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

// --- Rendering ---

let viewing = nearestSchoolDay(new Date(new Date().toDateString()), 1);

function render() {
  const today = new Date();
  const isToday = toKey(viewing) === toKey(today);
  const nowMinutes = today.getHours() * 60 + today.getMinutes();
  const day = cycleDay(viewing);

  document.getElementById('schedule-date').textContent = viewing.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  document.getElementById('schedule-day').textContent = `Day ${day} (${day % 2 ? 'A' : 'B'})${isToday ? ' · Today' : ''}`;

  const list = document.getElementById('schedule-list');
  list.replaceChildren(...bellSchedule(viewing, CYCLE[day]).map(([name, start, end]) => {
    const item = document.createElement('li');
    if (name === 'Passing Time') item.classList.add('passing');
    if (isToday && nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end)) item.classList.add('now');
    const label = document.createElement('strong');
    label.textContent = name;
    const time = document.createElement('span');
    time.textContent = `${start} – ${end}`;
    item.append(label, time);
    return item;
  }));
}

function initSchedule() {
  document.getElementById('prev-day').addEventListener('click', () => {
    viewing = nearestSchoolDay(addDays(viewing, -1), -1);
    render();
  });
  document.getElementById('next-day').addEventListener('click', () => {
    viewing = nearestSchoolDay(addDays(viewing, 1), 1);
    render();
  });
  document.getElementById('today-day').addEventListener('click', () => {
    viewing = nearestSchoolDay(new Date(new Date().toDateString()), 1);
    render();
  });

  render();
  setInterval(render, 60 * 1000); // keep the "now" highlight current
}

document.addEventListener('DOMContentLoaded', initSchedule);
