// Render the active slide from each saved HTML snapshot without loading those
// multi-megabyte documents into the portfolio. Run with a local preview server
// on port 8000 and a Chromium browser exposing DevTools on port 9223.
// Usage: node scripts/build-slide-previews.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const order = [1, 8, 7, 6, 5, 4, 3, 2];
const titles = ['Internship final presentation', 'A little about me', 'My internship in numbers', 'Behind the tickets', 'Projects I helped deliver', 'A chance to help another team', 'People who made this experience special', 'Thank you'];
const summaries = [
  'A look back at my software engineering internship on the Multimedia and Graphics team.',
  'My background at UC San Diego, where I am from, and a few interests outside work.',
  'A visual snapshot of the summer: tickets, coffee chats, training, and more.',
  'Security fixes, test coverage, framework updates, and a custom donut chart component.',
  'Reusable components, Cartis, and the June 2026 Monthly Defaults Flipbook.',
  'A Python tools showcase for the Business Intelligence team.',
  'The teammates, mentors, and fellow interns who shaped the experience.',
  'The closing slide from my final presentation.'
];
async function main() {
  const tab = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', { method: 'PUT' })).json();
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (!pending.has(message.id)) return;
    const request = pending.get(message.id);
    clearTimeout(request.timer);
    pending.delete(message.id);
    message.error ? request.reject(message.error) : request.resolve(message.result);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => reject(new Error(`Timed out: ${method}`)), 20000);
    pending.set(requestId, { resolve, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const slides = [];
  try {
    await send('Page.bringToFront');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const [index, sourceNumber] of order.entries()) {
      const source = `moodys-intern-slides/moodys-slide-${sourceNumber}.html`;
      await send('Page.navigate', { url: `http://127.0.0.1:8000/${source}` });
      for (let attempt = 0; attempt < 80; attempt++) {
        if (await evaluate(`location.pathname.endsWith(${JSON.stringify(source)}) && document.readyState === 'complete' && !!document.querySelector('[data-flipid]')`)) break;
        await new Promise(resolve => setTimeout(resolve, 100));
        if (attempt === 79) throw new Error(`Slide did not load: ${source}`);
      }
      const transcript = await evaluate(`(async () => {
        const active = [...document.querySelectorAll('[data-flipid]')].find(element => getComputedStyle(element).visibility === 'visible');
        if (!active) throw new Error('No visible slide');
        const slide = active.cloneNode(true);
        document.body.replaceChildren(slide);
        const style = document.createElement('style');
        style.textContent = 'html,body{margin:0!important;width:100%!important;height:100%!important;overflow:hidden!important}body>[data-flipid]{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;content-visibility:visible!important;visibility:visible!important}';
        document.head.append(style);
        // The saved bar chart retains desktop SVG coordinates even though its
        // responsive column is narrower. Give those coordinates enough room.
        if (${index} === 2) {
          style.textContent += '.sl-fb-view{width:1150px!important}.sl-fb-flip-grid{grid-template-columns:330px 780px!important;column-gap:40px!important}.sl-fb-left-column p{font-size:22px!important;line-height:1.3!important}.sl-fb-chart{height:460px!important}';
        }
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const wrapper = slide.querySelector('.sl-fb-wrapper');
        if (${index} === 0) {
          wrapper.style.transform = 'scale(1.2)';
          wrapper.style.transformOrigin = 'center';
        } else {
          // Frame the actual text, photos, and SVG marks, not their empty
          // full-slide containers. This also accounts for chart overflow.
          const bounds = [];
          const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim() || node.parentElement.closest('svg,style,script')) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const rect of range.getClientRects()) if (rect.width && rect.height) bounds.push(rect);
          }
          wrapper.querySelectorAll('img').forEach(image => bounds.push(image.getBoundingClientRect()));
          wrapper.querySelectorAll('svg').forEach(svg => {
            const box = svg.getBBox();
            const matrix = svg.getScreenCTM();
            const start = new DOMPoint(box.x, box.y).matrixTransform(matrix);
            const end = new DOMPoint(box.x + box.width, box.y + box.height).matrixTransform(matrix);
            bounds.push({left:start.x, top:start.y, right:end.x, bottom:end.y});
          });
          if (!bounds.length) throw new Error('No slide content to frame');
          const left = Math.min(...bounds.map(rect => rect.left));
          const top = Math.min(...bounds.map(rect => rect.top));
          const right = Math.max(...bounds.map(rect => rect.right));
          const bottom = Math.max(...bounds.map(rect => rect.bottom));
          const scale = Math.min(1.45, 1280 / (right - left), 740 / (bottom - top));
          const origin = wrapper.getBoundingClientRect();
          const x = 720 - origin.left - scale * ((left + right) / 2 - origin.left);
          const y = 450 - origin.top - scale * ((top + bottom) / 2 - origin.top);
          wrapper.style.transformOrigin = 'top left';
          wrapper.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
        }
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return slide.innerText;
      })()`);
      const screenshot = await send('Page.captureScreenshot', { format: 'webp', quality: 92 });
      const filename = `imgs/moodys/slide-${String(index + 1).padStart(2, '0')}.webp`;
      fs.mkdirSync(path.join(root, 'imgs/moodys'), { recursive: true });
      fs.writeFileSync(path.join(root, filename), Buffer.from(screenshot.data, 'base64'));
      slides.push({ title: titles[index], summary: summaries[index], image: filename, source, transcript });
      console.log(`${index + 1}/8: ${titles[index]}`);
    }
    fs.writeFileSync(path.join(root, 'moodys-intern-slides/slides.js'), '// Generated by scripts/build-slide-previews.cjs. Original snapshots are preserved.\nwindow.moodysSlides = ' + JSON.stringify(slides, null, 2).replaceAll('<', '\\u003c') + ';\n');
  } finally {
    socket.close();
    await fetch(`http://127.0.0.1:9223/json/close/${tab.id}`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
