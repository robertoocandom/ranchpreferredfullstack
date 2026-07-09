import { chromium } from 'playwright-core';

const outDir = '/tmp/claude-0/-home-claude/cc67964d-0fa7-594d-accb-50ce43834481/scratchpad/shots-fs';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
const errors = [];
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error' && !msg.text().includes('ERR_CERT_AUTHORITY_INVALID')) errors.push('console: ' + msg.text());
});

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.click('text=Entrar con cuenta de prueba');
await page.waitForSelector('text=Tus Puntos', { timeout: 10000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/01-home.png` });

// Check points value matches backend seed (847)
const pointsText = await page.textContent('body');
console.log('Has 847 on home:', pointsText.includes('847'));

// Go to Activate tab, verify real QR loads
await page.click('nav >> text=Activar');
await page.waitForSelector('text=Activar Compra', { timeout: 5000 });
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/02-activate.png` });

// Points tab -> redeem flow against real backend
await page.click('nav >> text=Puntos');
await page.waitForSelector('text=Puntos & Premios', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/03-points.png` });

const canjearButtons = await page.$$('button:has-text("Canjear")');
await canjearButtons[0].click();
await page.waitForSelector('text=Confirmar Canje', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/04-redeem-modal.png` });
await page.click('text=Confirmar Canje');
await page.waitForSelector('text=¡Canje realizado con éxito!', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/05-redeem-toast.png` });

const afterRedeemText = await page.textContent('body');
console.log('Has 747 after redeem (847-100):', afterRedeemText.includes('747'));

// Refer screen -> real referrals from DB
await page.click('nav >> text=Inicio');
await page.waitForSelector('text=Tus Puntos', { timeout: 5000 });
await page.click('button:has-text("Referir")');
await page.waitForSelector('text=Referir y Ganar', { timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/06-refer.png` });
const referText = await page.textContent('body');
console.log('Has Juan Méndez referral:', referText.includes('Méndez'));

// Stores tab
await page.click('text=×'.repeat(0)); // noop
await page.keyboard.press('Escape').catch(() => {});
await page.evaluate(() => window.scrollTo(0, 0));
await page.goBack().catch(() => {});

console.log('ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
