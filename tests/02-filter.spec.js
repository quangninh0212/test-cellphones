const { test, expect } = require('@playwright/test');
const { closeCellphoneSPopups } = require('../utils/helpers');

const CATEGORY_URL = 'https://cellphones.com.vn/mobile.html';

test.setTimeout(60000);

async function openMobilePage(page) {
  const response = await page.goto(CATEGORY_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  if (response) {
    expect(response.status()).toBeLessThan(400);
  }

  await closeCellphoneSPopups(page);
}

async function expectWebsiteStillWorks(page) {
  expect(page.url()).toContain('cellphones.com.vn');

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
}

async function expectBodyContains(page, pattern) {
  await expect(page.locator('body')).toContainText(pattern, {
    timeout: 15000,
  });
}

async function filterByApple(page) {
  await page.getByRole('link', { name: 'Điện thoại Apple' }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await closeCellphoneSPopups(page);
}

async function filterBySamsung(page) {
  await page.getByRole('link', { name: 'Điện thoại Samsung' }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await closeCellphoneSPopups(page);
}

async function openPriceFilter(page) {
  await page.getByRole('button', { name: 'Xem theo giá' }).click();
  await page.waitForTimeout(1000);
}

async function applyPriceFilter(page, minPrice, maxPrice) {
  await openPriceFilter(page);

  const minInput = page.locator('#filterModule #min-price');
  const maxInput = page.locator('#filterModule #max-price');

  await expect(minInput).toBeVisible({ timeout: 15000 });
  await expect(maxInput).toBeVisible({ timeout: 15000 });

  if (minPrice !== null) {
    await minInput.click();
    await minInput.fill(String(minPrice));
  }

  if (maxPrice !== null) {
    await maxInput.click();
    await maxInput.fill(String(maxPrice));
  }

  await page.locator('#filterModule').getByRole('button', { name: 'Xem kết quả' }).click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  await closeCellphoneSPopups(page);
}

test.describe('TC02 - Chức năng lọc sản phẩm trên CellphoneS', () => {
  test('TC02.1 - Truy cập trang danh mục điện thoại', async ({ page }) => {
    await openMobilePage(page);

    await expectBodyContains(page, /Điện thoại|iPhone|Samsung|Apple/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.2 - Kiểm tra bộ lọc hãng Apple hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await expect(page.getByRole('link', { name: 'Điện thoại Apple' }).first()).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.3 - Kiểm tra bộ lọc hãng Samsung hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await expect(page.getByRole('link', { name: 'Điện thoại Samsung' }).first()).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.4 - Lọc sản phẩm theo hãng Apple', async ({ page }) => {
    await openMobilePage(page);

    await filterByApple(page);

    await expectBodyContains(page, /Apple|iPhone/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.5 - Lọc sản phẩm theo hãng Samsung', async ({ page }) => {
    await openMobilePage(page);

    await filterBySamsung(page);

    await expectBodyContains(page, /Samsung/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.6 - Kiểm tra nút xem theo giá hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await expect(page.getByRole('button', { name: 'Xem theo giá' })).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.7 - Mở bộ lọc theo giá', async ({ page }) => {
    await openMobilePage(page);

    await openPriceFilter(page);

    await expect(page.locator('#filterModule #min-price')).toBeVisible({
      timeout: 15000,
    });

    await expect(page.locator('#filterModule #max-price')).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.8 - Lọc sản phẩm theo giá tối đa 2 triệu', async ({ page }) => {
    await openMobilePage(page);

    await applyPriceFilter(page, null, 2);

    await expectBodyContains(page, /đ|Điện thoại|sản phẩm/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.9 - Lọc sản phẩm theo khoảng giá 2 đến 4 triệu', async ({ page }) => {
    await openMobilePage(page);

    await applyPriceFilter(page, 2, 4);

    await expectBodyContains(page, /đ|Điện thoại|sản phẩm/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.10 - Lọc sản phẩm theo khoảng giá 10 đến 15 triệu', async ({ page }) => {
    await openMobilePage(page);

    await applyPriceFilter(page, 10, 15);

    await expectBodyContains(page, /đ|Điện thoại|sản phẩm/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.11 - Kết hợp lọc hãng Apple và khoảng giá 8 đến 40 triệu', async ({ page }) => {
    await openMobilePage(page);

    await filterByApple(page);
    await applyPriceFilter(page, 8, 40);

    await expectBodyContains(page, /Apple|iPhone|đ/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.12 - Nhập min lớn hơn max và kiểm tra website tự điều chỉnh khoảng giá', async ({ page }) => {
    await openMobilePage(page);

    await openPriceFilter(page);

    const priceInputs = page.getByRole('textbox', { name: '0' });
    const minInput = priceInputs.nth(0);
    const maxInput = priceInputs.nth(1);
    const viewResultButton = page.getByRole('button', { name: 'Xem kết quả' });

    await expect(minInput).toBeVisible({ timeout: 15000 });
    await expect(maxInput).toBeVisible({ timeout: 15000 });

    await minInput.click();
    await minInput.fill('8');

    await maxInput.click();
    await maxInput.fill('4');

    await maxInput.press('Tab');

    await expect.poll(async () => {
      const minValue = await minInput.inputValue();
      const maxValue = await maxInput.inputValue();

      const minNumber = Number(minValue.replace(/[^\d]/g, ''));
      const maxNumber = Number(maxValue.replace(/[^\d]/g, ''));

      return minNumber <= maxNumber;
    }, {
      timeout: 15000,
    }).toBeTruthy();

    if (await viewResultButton.isEnabled().catch(() => false)) {
      await viewResultButton.click();
    }

    await expectWebsiteStillWorks(page);
  });
});