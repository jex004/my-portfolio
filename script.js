document.addEventListener('DOMContentLoaded', () => {
  const desktop = document.getElementById('desktop');
  const navLinks = document.querySelectorAll('header nav a');
  let highestZIndex = 10;
  const openWindows = {}; // Object to track open windows by their ID

  /**
   * Brings a window to the front by increasing its z-index.
   */
  function focusWindow(windowEl) {
    if (!windowEl) return;
    // Remove 'active' class from all windows
    document.querySelectorAll('.window, .hero-window').forEach(win => {
      win.classList.remove('is-active');
    });
    // Add 'active' class to the clicked window
    windowEl.classList.add('is-active');
    // Increment and apply the new highest z-index
    highestZIndex++;
    windowEl.style.zIndex = highestZIndex;
  }

  /**
   * Creates a new window, or focuses it if it already exists.
   */
  function createWindow(id, title, isHero = false) {
    // If window is already open, just focus it and do nothing else.
    if (openWindows[id]) {
      focusWindow(openWindows[id]);
      return;
    }

    const contentTemplate = document.getElementById(`${id}-content`);
    if (!contentTemplate) return; // Exit if no content template is found

    const windowEl = document.createElement('div');
    // Use 'hero-window' class for the initial large window, or 'window' for others
    windowEl.className = isHero ? 'hero-window' : 'window';
    windowEl.innerHTML = `
      <div class="window-header">
        <span>${title}</span>
        <div class="window-controls">
          <button class="close-btn" aria-label="Close"></button>
        </div>
      </div>
      <div class="window-content">${contentTemplate.innerHTML}</div>
    `;

    // Position subsequent windows in a cascading manner
    if (!isHero) {
      const openCount = Object.keys(openWindows).length;
      windowEl.style.left = `${150 + openCount * 30}px`;
      windowEl.style.top = `${100 + openCount * 30}px`;
    }

    desktop.appendChild(windowEl);
    openWindows[id] = windowEl;
    focusWindow(windowEl);

    // Make the newly created window draggable and resizable
    makeWindowInteractive(windowEl);

    // Add event listeners for closing and focusing
    windowEl.querySelector('.close-btn').addEventListener('click', () => {
      desktop.removeChild(windowEl);
      delete openWindows[id];
    });

    windowEl.addEventListener('mousedown', () => focusWindow(windowEl), true);
  }

  /**
   * Sets up draggable and resizable functionality for a given element.
   * This function is now robust and correctly handles positioning.
   */
  function makeWindowInteractive(element) {
    let x = 0;
    let y = 0;

    // If the element is centered with transform, we need to reset its position
    // before making it draggable, so it doesn't "jump".
    if (element.classList.contains('hero-window')) {
        const rect = element.getBoundingClientRect();
        element.style.transform = 'none';
        element.style.left = `${rect.left}px`;
        element.style.top = `${rect.top}px`;
    }

    interact(element)
      .draggable({
        allowFrom: '.window-header',
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true,
          }),
        ],
        autoScroll: false,
        listeners: {
          start: (event) => focusWindow(event.target),
          move(event) {
            x += event.dx;
            y += event.dy;
            event.target.style.transform = `translate(${x}px, ${y}px)`;
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          start: (event) => focusWindow(event.target),
          move(event) {
            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
              height: `${event.rect.height}px`,
            });
          },
        },
        modifiers: [interact.modifiers.restrictSize({ min: { width: 350, height: 300 } })],
      });
  }

  // Attach click listeners to header navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const windowId = link.dataset.windowId;
      const windowTitle = link.textContent;
      if (windowId) {
        createWindow(windowId, windowTitle);
      }
    });
  });

  // Automatically open the main "About" window on page load
  createWindow('about', 'About', true);
});