const schemes = [
  { name: 'PM-KISAN', purpose: 'Financial support for farmers.', link: 'https://pmkisan.gov.in', icon: 'fa-wheat-awn' },
  { name: 'MGNREGA', purpose: 'Employment guarantee for rural households.', link: 'https://nrega.nic.in', icon: 'fa-person-digging' },
  { name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)', purpose: 'Affordable housing for rural families.', link: 'https://pmayg.nic.in', icon: 'fa-house-chimney' },
  { name: 'DAY-NRLM', purpose: 'Self Help Groups and livelihood support.', link: 'https://aajeevika.gov.in', icon: 'fa-people-roof' },
  { name: 'Pradhan Mantri Gram Sadak Yojana (PMGSY)', purpose: 'Rural road connectivity.', link: 'https://pmgsy.nic.in', icon: 'fa-road' },
  { name: 'Swachh Bharat Mission - Gramin', purpose: 'Rural sanitation and cleanliness.', link: 'https://swachhbharatmission.gov.in/sbm-gov-portal', icon: 'fa-broom' },
  { name: 'Ayushman Bharat PM-JAY', purpose: 'Health insurance and healthcare support.', link: 'https://pmjay.gov.in', icon: 'fa-heart-pulse' },
  { name: 'National Scholarship Portal', purpose: 'Scholarships for students.', link: 'https://scholarships.gov.in', icon: 'fa-graduation-cap' },
  { name: 'myScheme Portal', purpose: 'Find government schemes based on eligibility.', link: 'https://www.myscheme.gov.in', icon: 'fa-magnifying-glass-location' },
  { name: 'Ministry of Rural Development', purpose: 'Official rural development initiatives.', link: 'https://rural.gov.in', icon: 'fa-building-columns' }
];

const schemeGrid = document.querySelector('#schemeGrid');
const noResults = document.querySelector('#noResults');
const searchInput = document.querySelector('#schemeSearch');
const themeToggle = document.querySelector('#themeToggle');
const menuToggle = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');
const scrollTopButton = document.querySelector('#scrollTop');
let charts = [];

const schemeFinderData = {
  farmer: {
    icon: 'fa-wheat-awn',
    title: 'Farmer Support',
    description: 'Useful for small and marginal farmers seeking income support, crop-related awareness, and rural development assistance.',
    schemes: ['PM-KISAN', 'Ministry of Rural Development', 'myScheme Portal']
  },
  job: {
    icon: 'fa-person-digging',
    title: 'Employment Support',
    description: 'Useful for rural households looking for wage employment and livelihood opportunities.',
    schemes: ['MGNREGA', 'DAY-NRLM', 'myScheme Portal']
  },
  house: {
    icon: 'fa-house-chimney',
    title: 'Housing Assistance',
    description: 'Useful for rural families who need information about affordable housing support and eligibility.',
    schemes: ['Pradhan Mantri Awas Yojana - Gramin (PMAY-G)', 'myScheme Portal']
  },
  health: {
    icon: 'fa-heart-pulse',
    title: 'Healthcare Benefits',
    description: 'Useful for families who need health insurance and hospital treatment support.',
    schemes: ['Ayushman Bharat PM-JAY', 'myScheme Portal']
  },
  student: {
    icon: 'fa-graduation-cap',
    title: 'Education Support',
    description: 'Useful for students searching for scholarships and education-related government benefits.',
    schemes: ['National Scholarship Portal', 'myScheme Portal']
  },
  women: {
    icon: 'fa-people-roof',
    title: 'Women and SHG Livelihoods',
    description: 'Useful for women interested in Self Help Groups, livelihood support, and financial awareness.',
    schemes: ['DAY-NRLM', 'myScheme Portal', 'Ministry of Rural Development']
  }
};

function renderSchemes(filter = '') {
  const query = filter.trim().toLowerCase();
  const filtered = schemes.filter((scheme) =>
    `${scheme.name} ${scheme.purpose}`.toLowerCase().includes(query)
  );

  schemeGrid.innerHTML = filtered.map((scheme, index) => `
    <article class="scheme-card" data-aos="fade-up" data-aos-delay="${(index % 4) * 70}">
      <i class="fa-solid ${scheme.icon}" aria-hidden="true"></i>
      <h3>${scheme.name}</h3>
      <p>${scheme.purpose}</p>
      <a href="${scheme.link}" target="_blank" rel="noopener noreferrer">
        Official Website <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
      </a>
    </article>
  `).join('');

  noResults.classList.toggle('hidden', filtered.length > 0);
  if (window.AOS) AOS.refreshHard();
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    // Theme should still change visually when storage is unavailable.
  }
  themeToggle.innerHTML = theme === 'dark'
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  refreshChartsTheme();
}

function initTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (error) {
    savedTheme = null;
  }
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (systemDark ? 'dark' : 'light'));
}

function getChartTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    gridColor: isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(100, 116, 139, 0.18)',
    textColor: isDark ? '#e2e8f0' : '#334155'
  };
}

function applyChartOptions(chart) {
  const { gridColor, textColor } = getChartTheme();

  chart.options.plugins.legend.labels = {
    ...(chart.options.plugins.legend.labels || {}),
    color: textColor
  };

  Object.values(chart.scales || {}).forEach((scale) => {
    scale.options.grid.color = gridColor;
    scale.options.ticks.color = textColor;
  });
}

function refreshChartsTheme() {
  if (!charts.length || !window.Chart) return;
  const { gridColor, textColor } = getChartTheme();
  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;

  charts.forEach((chart) => {
    applyChartOptions(chart);
    chart.update();
  });
}

function createCharts() {
  if (!window.Chart) return;
  const { gridColor, textColor } = getChartTheme();

  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;
  Chart.defaults.font.family = 'Inter, sans-serif';

  charts = [
  new Chart(document.querySelector('#awarenessChart'), {
    type: 'doughnut',
    data: {
      labels: ['Before Campaign', 'After Campaign'],
      datasets: [{ data: [28, 82], backgroundColor: ['#f59e0b', '#18864b'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  }),

  new Chart(document.querySelector('#growthChart'), {
    type: 'bar',
    data: {
      labels: ['PM-KISAN', 'MGNREGA', 'PMAY-G', 'PM-JAY', 'NSP'],
      datasets: [
        { label: 'Before', data: [30, 35, 22, 18, 26], backgroundColor: '#93c5fd' },
        { label: 'After', data: [84, 88, 76, 72, 80], backgroundColor: '#18864b' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (value) => `${value}%` } } },
      plugins: { legend: { position: 'bottom' } }
    }
  }),

  new Chart(document.querySelector('#outreachChart'), {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      datasets: [
        { label: 'Villagers Reached', data: [35, 70, 115, 180, 250, 315, 375, 420], borderColor: '#1455d9', backgroundColor: 'rgba(20,85,217,0.12)', fill: true, tension: 0.38 },
        { label: 'Beneficiaries Identified', data: [4, 11, 20, 38, 54, 72, 88, 96], borderColor: '#18864b', backgroundColor: 'rgba(24,134,75,0.12)', fill: true, tension: 0.38 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  })
  ];

  refreshChartsTheme();
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.counter);
      let current = 0;
      const increment = Math.max(1, Math.ceil(target / 70));
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = `${target}+`;
          clearInterval(timer);
        } else {
          element.textContent = current;
        }
      }, 18);
      obs.unobserve(element);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => observer.observe(counter));
}

function initLightbox() {
  const lightbox = document.querySelector('#lightbox');
  const image = document.querySelector('#lightboxImage');
  const caption = document.querySelector('#lightboxCaption');
  const close = document.querySelector('#closeLightbox');

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.addEventListener('click', () => {
      image.src = card.dataset.image;
      image.alt = card.dataset.title;
      caption.textContent = card.dataset.title;
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.add('hidden');
    image.src = '';
    document.body.style.overflow = '';
  }

  close.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.classList.contains('hidden')) closeLightbox();
  });
}

function initSchemeFinder() {
  const result = document.querySelector('#schemeFinderResult');
  const chips = document.querySelectorAll('.need-chip');
  if (!result || !chips.length) return;

  function renderNeed(need) {
    const item = schemeFinderData[need];
    result.innerHTML = `
      <div class="finder-heading">
        <i class="fa-solid ${item.icon}" aria-hidden="true"></i>
        <div>
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </div>
      </div>
      <div class="finder-schemes">
        ${item.schemes.map((schemeName) => {
          const scheme = schemes.find((entry) => entry.name === schemeName);
          return `
            <a href="${scheme.link}" target="_blank" rel="noopener noreferrer">
              <span>${scheme.name}</span>
              <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            </a>
          `;
        }).join('')}
      </div>
    `;
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      renderNeed(chip.dataset.need);
    });
  });

  renderNeed('farmer');
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderSchemes();
  if (window.Chart) createCharts();
  animateCounters();
  initLightbox();
  initSchemeFinder();

  if (window.AOS) AOS.init({ duration: 800, once: true, offset: 80 });

  searchInput.addEventListener('input', (event) => renderSchemes(event.target.value));

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  document.querySelectorAll('#mobileMenu a').forEach((link) => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });

  window.addEventListener('scroll', () => {
    scrollTopButton.classList.toggle('show', window.scrollY > 500);
  });

  scrollTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

});
