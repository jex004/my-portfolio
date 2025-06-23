document.addEventListener('DOMContentLoaded', () => {
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
    let x = 0, y = 0;
    
    // This logic ensures any window, regardless of its initial positioning method (CSS or JS), can be dragged smoothly.
    if (element.style.transform) {
        const rect = element.getBoundingClientRect();
        const parentRect = document.body.getBoundingClientRect();
        element.style.transform = 'none';
        element.style.left = `${rect.left - parentRect.left}px`;
        element.style.top = `${rect.top - parentRect.top}px`;
    }

    interact(element).draggable({ allowFrom: '.window-header', inertia: true, modifiers: [interact.modifiers.restrictRect({restriction: 'body', endOnly: true})],
      listeners: {
        start: (event) => focusWindow(event.target),
        move(event) {
          x += event.dx;
          y += event.dy;
          event.target.style.transform = `translate(${x}px, ${y}px)`;
        },
      }
    }).resizable({ edges: { top: false, left: false, bottom: true, right: true },
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
    windowEl.innerHTML = `
      <div class="window-header"><span>${title}</span><div class="window-controls"><button class="close-btn" aria-label="Close"></button></div></div>
      <div class="window-content">${contentTemplate.innerHTML}</div>`;
    
    const contentPane = windowEl.querySelector('.window-content');
    if (id === 'resume') {
      contentPane.classList.add('is-document');
    }
    contentPane.scrollTop = 0;
      
    // === CHANGED: Center the new window with a slight random offset ===
    const offsetX = Math.random() * 40 - 20; // -20 to +20 px
    const offsetY = Math.random() * 40 - 20;
    windowEl.style.top = `calc(45% + ${offsetY}px)`;
    windowEl.style.left = `calc(50% + ${offsetX}px)`;
    windowEl.style.transform = 'translate(-50%, -50%)';
    // =================================================================
    
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

  if (homeWindow) {
    homeWindow.addEventListener('mousedown', () => focusWindow(homeWindow));
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const windowId = link.dataset.windowId;
      const windowTitle = link.textContent;
      if (windowId) {
        createDynamicWindow(windowId, windowTitle);
      }
    });
  });
});