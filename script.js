document.addEventListener('DOMContentLoaded', () => {
  const galleryCaptions = {
    "bday-2023.JPG": "19th",
    "beach-day.JPG": "Beach day",
    "cove-sunset.JPG": "Sunset at the cove",
    "freezing-city.JPEG": "Just NYC",
    "frog-skog.jpg": "Froggy Skoggy",
    "hello-there.jpg": "Hello there",
    "interns.jpeg": "Happy Hour!",
    "jersey-beach.jpg": "By the ocean",
    "nyc-stairs.jpg": "SoHo",
    "nyse.jpeg": "NYSE!",
    "restaurant.jpg": "Carmine's - Upper West Side",
    "tan-vest-skog.jpg": "Skoggy's new outfit",
    "vessel.JPEG": "Holiday at the Vessel",
    "washing-machine-skog.jpg": "Bath time for Skoggy"
};
  const galleryImages = [
    "bday-2023.JPG",
    "beach-day.JPG",
    "cove-sunset.JPG",
    "freezing-city.JPEG",
    "frog-skog.jpg",
    "hello-there.jpg",
    "interns.jpeg",
    "jersey-beach.jpg",
    "nyc-stairs.jpg",
    "nyse.jpeg",
    "restaurant.jpg",
    "tan-vest-skog.jpg",
    "vessel.JPEG",
    "washing-machine-skog.jpg"
];
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  function setTheme(theme) {
    html.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    themeToggle.firstElementChild.textContent = theme === 'dark' ? '☼' : '☾';
  }
  let savedTheme;
  try { savedTheme = localStorage.getItem('theme'); } catch { /* Storage may be disabled. */ }
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => {
    const theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('theme', theme); } catch { /* The toggle still works without storage. */ }
  });

  const dialog = document.getElementById('content-dialog');
  const pane = dialog.querySelector('.window-content');
  const photoDialog = document.getElementById('photo-dialog');
  const slides = window.moodysSlides;
  const slideFeature = document.getElementById('internship');
  const slidePreview = document.getElementById('slide-preview');
  const pagination = document.getElementById('slide-pagination');
  let slideIndex = 0;
  function showSlide(index) {
    slideIndex = Math.max(0, Math.min(slides.length - 1, index));
    const slide = slides[slideIndex];
    const image = document.getElementById('slide-image');
    image.src = slide.image;
    image.alt = `${slide.title}. ${slide.summary}`;
    document.getElementById('flipbook-link').hidden = slideIndex !== 4;
    document.getElementById('slide-title').textContent = slide.title;
    document.getElementById('slide-summary').textContent = slide.summary;
    document.getElementById('slide-position').textContent = `Slide ${slideIndex + 1} of ${slides.length}: ${slide.title}`;
    pagination.querySelectorAll('button').forEach((button, position) => {
      if (position === slideIndex) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-slide-step]').forEach(button => {
      button.disabled = Number(button.dataset.slideStep) < 0 ? slideIndex === 0 : slideIndex === slides.length - 1;
    });
  }
  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.textContent = String(index + 1).padStart(2, '0');
    button.setAttribute('aria-label', `Slide ${index + 1}: ${slide.title}`);
    button.addEventListener('click', () => showSlide(index));
    pagination.append(button);
  });
  document.querySelectorAll('[data-slide-step]').forEach(button => {
    button.addEventListener('click', () => showSlide(slideIndex + Number(button.dataset.slideStep)));
  });
  slideFeature.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = { ArrowLeft: slideIndex - 1, ArrowRight: slideIndex + 1, Home: 0, End: slides.length - 1 }[event.key];
    if (target !== undefined) { event.preventDefault(); showSlide(target); }
  });
  let pointerStart;
  slidePreview.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  slidePreview.addEventListener('pointercancel', () => { pointerStart = null; });
  slidePreview.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      showSlide(slideIndex + (dx < 0 ? 1 : -1));
    }
    pointerStart = null;
  });
  showSlide(0);
  document.querySelectorAll('[data-photo-src]').forEach(button => {
    button.addEventListener('click', () => {
      const fullPhoto = photoDialog.querySelector('img');
      fullPhoto.src = button.dataset.photoSrc;
      fullPhoto.alt = document.querySelector('.receipt-photo img').alt;
      photoDialog.querySelector('p').textContent = 'Receiptify / September 2026';
      photoDialog.classList.add('receipt-view');
      photoDialog.showModal();
    });
  });
  photoDialog.addEventListener('close', () => photoDialog.classList.remove('receipt-view'));
  const album = [
    {
        "file": "norway.jpg",
        "caption": "Norway",
        "alt": "A snowy street in Norway"
    },
    {
        "file": "bc-canada.jpeg",
        "caption": "British Columbia",
        "alt": "Jenny on a boat in British Columbia"
    },
    {
        "file": "china.jpg",
        "caption": "China",
        "alt": "Jenny beside a carved doorway in China"
    },
    {
        "file": "dc-garden.jpg",
        "caption": "Washington, DC",
        "alt": "Jenny in a garden in Washington, DC"
    },
    {
        "file": "iceland.jpg",
        "caption": "Iceland",
        "alt": "Jenny by the rocky coast in Iceland"
    },
    {
        "file": "japan.jpeg",
        "caption": "Japan",
        "alt": "Jenny at a fountain in Japan"
    }
];
  let albumIndex = 0;
  const albumImage = document.getElementById('album-image');
  const albumButton = document.getElementById('album-photo');
  function turnAlbum(direction) {
    albumIndex = (albumIndex + direction + album.length) % album.length;
    const photo = album[albumIndex];
    albumImage.src = `imgs/gallery/${photo.file}`;
    albumImage.alt = photo.alt;
    document.getElementById('album-caption').textContent = photo.caption;
    document.getElementById('album-position').textContent = `${String(albumIndex + 1).padStart(2, '0')} / ${String(album.length).padStart(2, '0')}`;
    albumButton.setAttribute('aria-label', `Enlarge photo: ${photo.caption}`);
  }
  document.getElementById('album-prev').addEventListener('click', () => turnAlbum(-1));
  document.getElementById('album-next').addEventListener('click', () => turnAlbum(1));
  albumButton.addEventListener('click', () => {
    const photo = album[albumIndex];
    const fullPhoto = photoDialog.querySelector('img');
    fullPhoto.src = albumImage.src;
    fullPhoto.alt = photo.alt;
    photoDialog.querySelector('p').textContent = photo.caption;
    photoDialog.showModal();
  });
  const titles = { about: 'About Jenny', projects: 'Project archive', gallery: 'Camera roll', resume: 'Jenny Xu / Résumé' };

  // Close only the top window when the photo viewer is above the gallery.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const activeDialog = photoDialog.open ? photoDialog : dialog.open ? dialog : null;
    if (activeDialog) {
      event.preventDefault();
      activeDialog.close();
    }
  });

  function buildGallery() {
    const grid = pane.querySelector('.gallery-grid');
    galleryImages.forEach(name => {
      const caption = galleryCaptions[name] ?? name.replace(/\.[^.]+$/, '').replaceAll('-', ' ');
      const button = document.createElement('button');
      button.className = 'gallery-photo';
      button.setAttribute('aria-label', `View photo: ${caption}`);
      const img = document.createElement('img');
      img.src = `imgs/gallery/${name}`;
      img.alt = caption;
      img.loading = 'lazy';
      const label = document.createElement('span');
      label.textContent = caption;
      button.append(img, label);
      button.addEventListener('click', () => {
        const fullPhoto = photoDialog.querySelector('img');
        fullPhoto.src = img.src;
        fullPhoto.alt = caption;
        photoDialog.querySelector('p').textContent = caption;
        photoDialog.showModal();
      });
      grid.append(button);
    });
  }

  document.querySelectorAll('[data-window-id]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.windowId;
      const template = document.getElementById(`${id}-content`);
      if (!template) return;
      pane.innerHTML = template.innerHTML;
      document.getElementById('dialog-title').textContent = titles[id];
      if (id === 'gallery') buildGallery();
      dialog.showModal();
      pane.scrollTop = 0;
      if (button.dataset.project) {
        const project = [...pane.querySelectorAll('.project-entry')].find(entry => entry.querySelector('h4').textContent.startsWith(button.dataset.project));
        if (project) project.scrollIntoView({ block: 'start' });
      }
    });
  });

  [dialog, photoDialog].forEach(modal => {
    modal.querySelector('.close-btn').addEventListener('click', () => modal.close());
    // Only dismiss when both the press and release happen on the backdrop.
    let pressedBackdrop = false;
    const outside = event => {
      const rect = modal.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    modal.addEventListener('pointerdown', event => { pressedBackdrop = event.target === modal && outside(event); });
    modal.addEventListener('click', event => {
      if (pressedBackdrop && event.target === modal && outside(event)) modal.close();
      pressedBackdrop = false;
    });
  });

  let toastTimeout;
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 5000);
  }
  const skoggy = document.getElementById('skoggy-button');
  skoggy.addEventListener('click', () => {
    skoggy.classList.remove('is-waving');
    // Restart the little wave on each click, including repeated clicks.
    void skoggy.offsetWidth;
    skoggy.classList.add('is-waving');
    showToast('Skoggy says hi!');
  });
  skoggy.addEventListener('animationend', () => skoggy.classList.remove('is-waving'));
  document.getElementById('discord-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('hopenot');
      showToast('Discord username copied: hopenot');
    } catch {
      showToast('Find me on Discord: hopenot');
    }
  });
  document.getElementById('copyright-year').textContent = new Date().getFullYear();
});
