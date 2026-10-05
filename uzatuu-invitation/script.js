const days = document.querySelector('#days');
const targetDate = new Date(2026, 9, 22, 17, 0, 0);
const monthName = document.querySelector('.month');
const calendar = document.querySelector('.calendar');
const targetMonth = targetDate.getMonth();
const targetYear = targetDate.getFullYear();
monthName.textContent = new Intl.DateTimeFormat('ky-KG', {month:'long'}).format(targetDate);
calendar.setAttribute('aria-label', `Календарь ${monthName.textContent} ${targetYear}`);
const start = (new Date(targetYear, targetMonth, 1).getDay() + 6) % 7;
for (let i = 0; i < start; i++) days.append(document.createElement('span'));
for (let n = 1; n <= new Date(targetYear, targetMonth + 1, 0).getDate(); n++) {
  const cell = document.createElement('span');
  cell.className = 'day' + (n === targetDate.getDate() ? ' selected' : '');
  cell.textContent = n;
  if (n === targetDate.getDate()) cell.setAttribute('aria-current', 'date');
  days.append(cell);
}

const countdownParts = {
  days: document.querySelector('#cd-days'),
  hours: document.querySelector('#cd-hours'),
  minutes: document.querySelector('#cd-minutes')
};
function updateCountdown() {
  const remaining = Math.max(0, targetDate.getTime() - Date.now());
  const minutes = Math.floor(remaining / 60000);
  countdownParts.days.textContent = Math.floor(minutes / 1440);
  countdownParts.hours.textContent = String(Math.floor((minutes % 1440) / 60)).padStart(2, '0');
  countdownParts.minutes.textContent = String(minutes % 60).padStart(2, '0');
}
updateCountdown();
window.setInterval(updateCountdown, 30000);

const music = document.querySelector('#music-track');
const musicButton = document.querySelector('#music');
async function toggleMusic() {
  if (music.paused) {
    try {
      await music.play();
      musicButton.classList.add('is-playing');
      musicButton.setAttribute('aria-pressed', 'true');
      musicButton.setAttribute('aria-label', 'Музыканы токтотуу');
      musicButton.querySelector('.music-icon').textContent = 'Ⅱ';
    } catch {
      musicButton.title = 'Музыка иштетилген жок. Баракты кайра ачып көрүңүз.';
    }
  } else {
    music.pause();
    musicButton.classList.remove('is-playing');
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.setAttribute('aria-label', 'Музыканы иштетүү');
    musicButton.querySelector('.music-icon').textContent = '♫';
  }
}
musicButton.addEventListener('click', toggleMusic);
music.addEventListener('ended', () => {
  musicButton.classList.remove('is-playing');
  musicButton.setAttribute('aria-pressed', 'false');
  musicButton.querySelector('.music-icon').textContent = '♫';
});

const welcome = document.querySelector('#welcome');
welcome.addEventListener('click', () => {
  welcome.classList.add('opened');
  welcome.setAttribute('aria-hidden', 'true');
  document.querySelector('#top').scrollIntoView({behavior:'smooth'});
  // Opening the invitation is a user gesture, so browsers allow its soundtrack to start.
  toggleMusic();
});

let guestCount = 1;
const guestCountOutput = document.querySelector('#guest-count');
const guestControl = document.querySelector('#guest-control');
const yesChoice = document.querySelector('input[name="attendance"][value="Ооба, барам"]');
function setGuestControl(visible) {
  guestControl.classList.toggle('is-visible', visible);
  if (visible) guestControl.classList.add('in-view');
  guestControl.setAttribute('aria-hidden', String(!visible));
  guestControl.inert = !visible;
  document.querySelector('#rsvp-form').classList.toggle('has-guests', visible);
  if (!visible) {
    guestCount = 0;
    guestCountOutput.value = '0';
    guestCountOutput.textContent = '0';
  } else if (guestCount === 0) {
    guestCount = 1;
    guestCountOutput.value = '1';
    guestCountOutput.textContent = '1';
  }
}
document.querySelectorAll('input[name="attendance"]').forEach(input => {
  input.addEventListener('change', () => setGuestControl(input === yesChoice && input.checked));
});
document.querySelector('#minus').addEventListener('click', () => {
  guestCount = Math.max(1, guestCount - 1);
  guestCountOutput.value = String(guestCount);
  guestCountOutput.textContent = String(guestCount);
});
document.querySelector('#plus').addEventListener('click', () => {
  guestCount = Math.min(20, guestCount + 1);
  guestCountOutput.value = String(guestCount);
  guestCountOutput.textContent = String(guestCount);
});

document.querySelector('#rsvp-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const attending = data.get('attendance') === 'Ооба, барам';
  const answer = {
    name: String(data.get('name')).trim(),
    attendance: data.get('attendance'),
    guests: attending ? guestCount : 0,
    savedAt: new Date().toISOString()
  };
  const message = document.querySelector('#form-message');
  try {
    const responses = JSON.parse(localStorage.getItem('aidina-rsvp') || '[]');
    responses.push(answer);
    localStorage.setItem('aidina-rsvp', JSON.stringify(responses));
    message.textContent = 'Жообуңуз кабыл алынды, рахмат!';
    form.reset();
    guestCount = 1;
    guestCountOutput.value = '1';
    guestCountOutput.textContent = '1';
    setGuestControl(false);
  } catch {
    message.textContent = 'Жообуңузду сактоо мүмкүн болгон жок. Кайра аракет кылыңыз.';
  }
});

// Gentle section reveals; content stays visible if IntersectionObserver is unavailable.
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }
  }, {threshold: 0.16});
  document.querySelectorAll('.paper > *, .section-title, .timeline article, .host-one, .host-two').forEach(item => {
    item.classList.add('reveal');
    observer.observe(item);
  });
}

// Draw the program's gold curve as the section enters the screen.
const programStem = document.querySelector('.timeline-stem');
if (programStem && 'IntersectionObserver' in window) {
  const stemObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      programStem.classList.add('is-drawn');
      stemObserver.disconnect();
    }
  }, {threshold: 0.2});
  stemObserver.observe(programStem);
} else if (programStem) {
  programStem.classList.add('is-drawn');
}
