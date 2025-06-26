document.addEventListener('DOMContentLoaded', () => {

  // --- Your image filenames go here ---
  const galleryImages = [
    'beach-sunset.jpg',
    'bunny.jpg',
    'tan-vest-skog.jpg',
    'friendship-garden.JPG',
    'windy-beach.jpg',
    'fish-fit.jpg',
    'washing-machine-skog.jpg',
    'cove-sunset.JPG',
    'vessel.JPEG',
    'norway.jpg',
    'kimchi-fries.jpg',
    'freezing-city.JPEG'
  ];
  // ------------------------------------

  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) { html.setAttribute('data-theme', savedTheme); }
  themeToggle.addEventListener('click', () => {
    if (html.hasAttribute('data-theme')) {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
  
  const navLinks = document.querySelectorAll('header nav a');
  const homeWindow = document.querySelector('.home-window');
  let highestZIndex = 10;
  const openWindows = { 'home': homeWindow }; 

  function focusWindow(windowEl) {
    if (!windowEl) return;
    document.querySelectorAll('.window, .home-window').forEach(win => {
      win.classList.remove('is-active');
    });
    windowEl.classList.add('is-active');
    highestZIndex++;
    windowEl.style.zIndex = highestZIndex;
  }

  function makeWindowInteractive(element) {
    const rect = element.getBoundingClientRect();
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.transform = '';

    interact(element).draggable({ 
      allowFrom: '.window-header', 
      inertia: true, 
      modifiers: [interact.modifiers.restrictRect({restriction: 'body', endOnly: true})],
      listeners: {
        start: (event) => focusWindow(event.target),
        move(event) {
          let left = parseFloat(event.target.style.left) || 0;
          let top = parseFloat(event.target.style.top) || 0;
          event.target.style.left = `${left + event.dx}px`;
          event.target.style.top = `${top + event.dy}px`;
        },
      }
    }).resizable({
      // The new edges configuration:
      edges: {
        top: false, left: false, bottom: false, right: false, // Disable all edges
        bottomRight: '.resize-handle' // ONLY allow resizing via this handle
      },
      listeners: {
        start: (event) => focusWindow(event.target),
        move(event) { Object.assign(event.target.style, { width: `${event.rect.width}px`, height: `${event.rect.height}px` }); },
      },
      modifiers: [interact.modifiers.restrictSize({ min: { width: 400, height: 300 } })],
    });
  }

  function createDynamicWindow(id, title) {
    if (openWindows[id]) {
      focusWindow(openWindows[id]);
      return;
    }
    const contentTemplate = document.getElementById(`${id}-content`);
    if (!contentTemplate) return;

    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    // Added the .resize-handle div to the template
    windowEl.innerHTML = `<div class="window-header"><span>${title}</span><div class="window-controls"><button class="close-btn" aria-label="Close"></button></div></div><div class="window-content">${contentTemplate.innerHTML}</div><div class="resize-handle"></div>`;
    
    const contentPane = windowEl.querySelector('.window-content');
    
    if (id === 'resume' || id === 'projects' || id === 'gallery') {
      contentPane.classList.add('is-document');
    }

    if (id === 'gallery') {
      const grid = windowEl.querySelector('.gallery-grid');
      grid.innerHTML = '';
      for (const imageName of galleryImages) {
        const img = document.createElement('img');
        img.src = `imgs/gallery/${imageName}`;
        img.alt = 'Artwork from gallery';
        img.className = 'gallery-item';
        grid.appendChild(img);
      }
    }

    contentPane.scrollTop = 0;
      
    const offsetX = Math.random() * 40 - 20;
    const offsetY = Math.random() * 40 - 20;
    windowEl.style.top = `calc(50% + ${offsetY}px)`;
    windowEl.style.left = `calc(50% + ${offsetX}px)`;
    windowEl.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(windowEl);
    openWindows[id] = windowEl;
    
    makeWindowInteractive(windowEl);
    focusWindow(windowEl);

    windowEl.querySelector('.close-btn').addEventListener('click', () => {
      document.body.removeChild(windowEl);
      delete openWindows[id];
    });

    windowEl.addEventListener('mousedown', () => focusWindow(windowEl));
  }

  // This is now correctly disabled/removed
  // if (homeWindow) {
  //   homeWindow.addEventListener('mousedown', () => focusWindow(homeWindow));
  // }

  navLinks.forEach(link => {
    if (link.dataset.windowId) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const windowId = link.dataset.windowId;
        const windowTitle = link.textContent;
        createDynamicWindow(windowId, windowTitle);
      });
    }
  });

  const discordLink = document.getElementById('discord-link');
  if (discordLink) {
    discordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const existingPopup = document.querySelector('.discord-popup');
      if (existingPopup) {
        existingPopup.remove();
        return;
      }
      const popup = document.createElement('div');
      popup.className = 'discord-popup';
      popup.innerHTML = `<div class="discord-popup-header">Discord</div><div class="discord-username" data-tooltip="Click to copy">hopenot</div>`;
      document.body.appendChild(popup);
      const iconRect = discordLink.getBoundingClientRect();
      popup.style.left = `${iconRect.left + iconRect.width / 2}px`;
      popup.style.top = `${iconRect.top}px`;
      const usernameEl = popup.querySelector('.discord-username');
      usernameEl.addEventListener('click', () => {
        navigator.clipboard.writeText('hopenot').then(() => {
          usernameEl.setAttribute('data-tooltip', 'Copied!');
          setTimeout(() => { usernameEl.setAttribute('data-tooltip', 'Click to copy'); }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
          usernameEl.setAttribute('data-tooltip', 'Failed to copy!');
        });
      });
      setTimeout(() => {
        const closeOnClickAway = (event) => {
          if (!popup.contains(event.target) && event.target !== discordLink) {
            if (document.body.contains(popup)) { popup.remove(); }
            document.removeEventListener('click', closeOnClickAway);
          }
        };
        document.addEventListener('click', closeOnClickAway);
      }, 0);
    });
  }

  const contactEnvelopeLink = document.getElementById('contact-envelope-link');
  if (contactEnvelopeLink) {
    contactEnvelopeLink.addEventListener('click', (e) => {
      e.preventDefault();

      const existingPopup = document.querySelector('.contact-image-popup');
      if (existingPopup) {
        existingPopup.remove();
        return;
      }

      const popup = document.createElement('div');
      popup.className = 'contact-image-popup';

      const emailLink = document.createElement('a');
      emailLink.className = 'contact-popup-email';
      emailLink.href = 'mailto:jennyxu2012@gmail.com';
      emailLink.textContent = 'jennyxu2012@gmail.com';
      popup.appendChild(emailLink);

      document.body.appendChild(popup);
      const iconRect = contactEnvelopeLink.getBoundingClientRect();
      
      popup.style.top = `${iconRect.bottom + 15}px`;
      popup.style.right = `${window.innerWidth - iconRect.right}px`;
      popup.style.marginRight = "-50px";

      setTimeout(() => popup.classList.add('is-visible'), 10);

      setTimeout(() => {
        const closeOnClickAway = (event) => {
          if (!popup.contains(event.target) && !contactEnvelopeLink.contains(event.target)) {
            popup.remove();
            document.removeEventListener('click', closeOnClickAway);
          }
        };
        document.addEventListener('click', closeOnClickAway);
      }, 0);
    });
  }
});