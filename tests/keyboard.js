const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.URL || 'http://127.0.0.1:8000/';
  console.log('Testing URL:', url);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForSelector('#primary-navigation');

  // Use Tab order to land on the first focusable nav item, then verify the handler from there.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  const initial = await page.evaluate(() => ({
    tag: document.activeElement && document.activeElement.tagName,
    text: document.activeElement && document.activeElement.textContent.trim(),
    href: document.activeElement && document.activeElement.getAttribute('href')
  }));
  console.log('initial-focus:', JSON.stringify(initial));

  // ArrowRight -> move focus to the next nav link
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  const afterRight = await page.evaluate(() => ({
    tag: document.activeElement && document.activeElement.tagName,
    text: document.activeElement && document.activeElement.textContent.trim(),
    href: document.activeElement && document.activeElement.getAttribute('href')
  }));
  console.log('after-arrow-right:', JSON.stringify(afterRight));

  // ArrowLeft -> back
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(150);
  const afterLeft = await page.evaluate(() => ({
    tag: document.activeElement && document.activeElement.tagName,
    text: document.activeElement && document.activeElement.textContent.trim(),
    href: document.activeElement && document.activeElement.getAttribute('href')
  }));
  console.log('after-arrow-left:', JSON.stringify(afterLeft));

  // Focus Services and ArrowDown to open mega
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.nav-links > li > a'));
    const svc = links.find(a => /services/i.test(a.textContent));
    if (svc) svc.focus();
  });
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(250);

  const megaOpen = await page.evaluate(() => {
    const parent = document.querySelector('.nav-links li.has-mega');
    if (!parent) return null;
    const link = parent.querySelector('a');
    const panel = parent.querySelector('.mega-menu');
    return {
      openClass: parent.classList.contains('open'),
      ariaExpanded: link ? link.getAttribute('aria-expanded') : null,
      panelHidden: panel ? panel.getAttribute('aria-hidden') : null,
      firstPanelLink: panel ? (panel.querySelector('a') ? panel.querySelector('a').textContent.trim() : null) : null
    };
  });
  console.log('mega-open:', JSON.stringify(megaOpen));

  // Escape to close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  const megaClosed = await page.evaluate(() => {
    const parent = document.querySelector('.nav-links li.has-mega');
    if (!parent) return null;
    const link = parent.querySelector('a');
    const panel = parent.querySelector('.mega-menu');
    return {
      openClass: parent.classList.contains('open'),
      ariaExpanded: link ? link.getAttribute('aria-expanded') : null,
      panelHidden: panel ? panel.getAttribute('aria-hidden') : null,
      bodyOverflow: document.body.style.overflow || null
    };
  });
  console.log('after-escape:', JSON.stringify(megaClosed));

  await browser.close();

  const pass = afterRight && afterRight.tag && afterRight.text && initial.text && afterRight.text !== initial.text && megaOpen && megaOpen.openClass && (megaOpen.panelHidden === 'false' || megaOpen.ariaExpanded === 'true');
  if (!pass) {
    console.error('Keyboard checks failed');
    process.exit(2);
  }
  console.log('Keyboard checks passed');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(3); });
