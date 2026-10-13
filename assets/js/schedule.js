// Bell schedules for each day of the cycle. To add a day, copy one of the
// entries below and change the periods. Times are 24-hour "HH:MM".
const SCHEDULES = {
  1: {
    G6: [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Tuesday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Elective 1A', '8:30', '9:15'],
      ['Elective 2A', '9:20', '10:05'],
      ['Break', '10:05', '10:20'],
      ['Passing Time', '10:20', '10:25'],
      ['Elective 3A', '10:25', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['Dyad', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Core A', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Core B', '13:50', '15:00'],
    ],
    'G7/8': [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Tuesday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Core A', '8:30', '9:40'],
      ['Break', '9:40', '9:55'],
      ['Passing Time', '9:55', '10:00'],
      ['Core B', '10:00', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['AT: C', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Elective 1', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Elective 2', '13:50', '15:00'],
    ],
  },
  2: {
    G6: [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Tuesday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Elective 1A', '8:30', '9:15'],
      ['Elective 2A', '9:20', '10:05'],
      ['Break', '10:05', '10:20'],
      ['Passing Time', '10:20', '10:25'],
      ['Elective 3A', '10:25', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['Dyad', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Core A', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Core B', '13:50', '15:00'],
    ],
    'G7/8': [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Tuesday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Elective 3', '8:30', '9:40'],
      ['Break', '9:40', '9:55'],
      ['Passing Time', '9:55', '10:00'],
      ['Elective 4', '10:00', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['AT: A', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Core C', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Core D', '13:50', '15:00'],
    ],
  },
  3: {
    G6: [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Tuesday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Elective 1A', '8:30', '9:15'],
      ['Elective 2A', '9:20', '10:05'],
      ['Break', '10:05', '10:20'],
      ['Passing Time', '10:20', '10:25'],
      ['Elective 3A', '10:25', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['Dyad', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Core A', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Core B', '13:50', '15:00'],
    ],
    'G7/8': [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Tuesday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Core B', '8:30', '9:40'],
      ['Break', '9:40', '9:55'],
      ['Passing Time', '9:55', '10:00'],
      ['Core A', '10:00', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['AT: D', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Elective 2', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Elective 1', '13:50', '15:00'],
    ],
  },
  5: {
    G6: [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Thursday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Elective 1', '8:30', '9:40'],
      ['Break', '9:40', '9:55'],
      ['Passing Time', '9:55', '10:00'],
      ['Elective 2', '10:00', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['AT: A', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Core A', '12:30', '13:40'],
      ['Passing Time', '13:40', '13:50'],
      ['Core B', '13:50', '15:00'],
    ],
    'G7/8': [
      ['PCG', '7:50', '7:55'],
      ['Passing Time', '7:55', '8:00'],
      ['Thursday Club', '8:00', '8:25'],
      ['Passing Time', '8:25', '8:30'],
      ['Core A', '8:30', '9:40'],
      ['Break', '9:40', '9:55'],
      ['Passing Time', '9:55', '10:00'],
      ['Core B', '10:00', '11:10'],
      ['Passing Time', '11:10', '11:15'],
      ['Dyad', '11:15', '11:45'],
      ['Lunch', '11:45', '12:25'],
      ['Passing Time', '12:25', '12:30'],
      ['Elective 1A', '12:30', '13:15'],
      ['Passing Time', '13:15', '13:20'],
      ['Elective 2A', '13:20', '14:05'],
      ['Passing Time', '14:05', '14:15'],
      ['Elective 3A', '14:15', '15:00'],
    ],
  },
};

const days = Object.keys(SCHEDULES);
let selectedDay = days[0];

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function renderGroup(grade, periods) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const section = document.createElement('section');
  section.className = 'schedule-group';
  const heading = document.createElement('h2');
  heading.className = 'schedule-title';
  heading.textContent = grade;
  const list = document.createElement('ul');
  list.className = 'schedule-list';

  periods.forEach(([name, start, end]) => {
    const item = document.createElement('li');
    if (name === 'Passing Time') item.classList.add('passing');
    if (nowMinutes >= toMinutes(start) && nowMinutes < toMinutes(end)) item.classList.add('now');
    const label = document.createElement('strong');
    label.textContent = name;
    const time = document.createElement('span');
    time.textContent = `${start} – ${end}`;
    item.append(label, time);
    list.append(item);
  });

  section.append(heading, list);
  return section;
}

function renderSchedule() {
  const container = document.getElementById('schedule-groups');
  container.replaceChildren(
    ...Object.entries(SCHEDULES[selectedDay]).map(([grade, periods]) => renderGroup(grade, periods)),
  );
  document.querySelectorAll('[data-day]').forEach((button) => {
    button.classList.toggle('active', button.dataset.day === selectedDay);
  });
}

function initSchedule() {
  document.getElementById('schedule-date').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const picker = document.getElementById('day-picker');
  days.forEach((day) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'day-button';
    button.dataset.day = day;
    button.textContent = `Day ${day}`;
    button.addEventListener('click', () => {
      selectedDay = day;
      renderSchedule();
    });
    picker.append(button);
  });

  renderSchedule();
  setInterval(renderSchedule, 60 * 1000); // keep the "now" highlight current
}

document.addEventListener('DOMContentLoaded', initSchedule);
