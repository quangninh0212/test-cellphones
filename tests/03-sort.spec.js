const { test, expect } = require('@playwright/test');
const { closeCellphoneSPopups } = require('../utils/helpers');

const CATEGORY_URL = 'https://cellphones.com.vn/mobile.html';
const PRICE_SELECTOR = '.product__price--show';

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

function convertPriceToNumber(priceText) {
  return Number(priceText.replace(/[^\d]/g, ''));
}

async function getProductPrices(page) {
  await page.waitForTimeout(2500);

  const priceTexts = await page.locator(PRICE_SELECTOR).allTextContents();

  return priceTexts
    .map(convertPriceToNumber)
    .filter(price => price > 0);
}

function isAscending(numbers) {
  for (let i = 0; i < numbers.length - 1; i++) {
    if (numbers[i] > numbers[i + 1]) {
      return false;
    }
  }

  return true;
}

function isDescending(numbers) {
  for (let i = 0; i < numbers.length - 1; i++) {
    if (numbers[i] < numbers[i + 1]) {
      return false;
    }
  }

  return true;
}

async function sortLowToHigh(page) {
  await page.getByText('Giá Thấp - Cao').click();
  await page.waitForTimeout(3000);
  await closeCellphoneSPopups(page);
}

async function sortHighToLow(page) {
  await page.getByText('Giá Cao - Thấp').click();
  await page.waitForTimeout(3000);
  await closeCellphoneSPopups(page);
}

async function filterByApple(page) {
  await page.getByRole('link', { name: 'Điện thoại Apple' }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  await closeCellphoneSPopups(page);
}

test.describe('TC03 - Chức năng sắp xếp sản phẩm theo giá trên CellphoneS', () => {
  test('TC03.1 - Kiểm tra tùy chọn sắp xếp Giá Thấp - Cao hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await expect(page.getByText('Giá Thấp - Cao')).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC03.2 - Kiểm tra tùy chọn sắp xếp Giá Cao - Thấp hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await expect(page.getByText('Giá Cao - Thấp')).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC03.3 - Sắp xếp sản phẩm theo giá thấp đến cao', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);

    await expect(page.locator('body')).toContainText(/Giá Thấp - Cao|đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC03.4 - Kiểm tra danh sách giá sau khi sắp xếp thấp đến cao', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);

    const prices = await getProductPrices(page);
    const firstPrices = prices.slice(0, 8);

    expect(firstPrices.length).toBeGreaterThan(1);
    expect(isAscending(firstPrices)).toBeTruthy();

    await expectWebsiteStillWorks(page);
  });

  test('TC03.5 - Sắp xếp sản phẩm theo giá cao đến thấp', async ({ page }) => {
    await openMobilePage(page);

    await sortHighToLow(page);

    await expect(page.locator('body')).toContainText(/Giá Cao - Thấp|đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC03.6 - Kiểm tra danh sách giá sau khi sắp xếp cao đến thấp', async ({ page }) => {
    await openMobilePage(page);

    await sortHighToLow(page);

    const prices = await getProductPrices(page);
    const firstPrices = prices.slice(0, 8);

    expect(firstPrices.length).toBeGreaterThan(1);
    expect(isDescending(firstPrices)).toBeTruthy();

    await expectWebsiteStillWorks(page);
  });

  test('TC03.7 - Đổi sắp xếp từ giá thấp đến cao sang giá cao đến thấp', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);
    await sortHighToLow(page);

    const prices = await getProductPrices(page);
    const firstPrices = prices.slice(0, 8);

    expect(firstPrices.length).toBeGreaterThan(1);
    expect(isDescending(firstPrices)).toBeTruthy();

    await expectWebsiteStillWorks(page);
  });

  test('TC03.8 - Sắp xếp giá thấp đến cao sau khi lọc hãng Apple', async ({ page }) => {
    await openMobilePage(page);

    await filterByApple(page);
    await sortLowToHigh(page);

    await expect(page.locator('body')).toContainText(/Apple|iPhone|đ/i, {
      timeout: 15000,
    });

    const prices = await getProductPrices(page);
    const firstPrices = prices.slice(0, 8);

    expect(firstPrices.length).toBeGreaterThan(1);
    expect(isAscending(firstPrices)).toBeTruthy();

    await expectWebsiteStillWorks(page);
  });

  test('TC03.9 - Sắp xếp giá cao đến thấp sau khi lọc hãng Apple', async ({ page }) => {
    await openMobilePage(page);

    await filterByApple(page);
    await sortHighToLow(page);

    await expect(page.locator('body')).toContainText(/Apple|iPhone|đ/i, {
      timeout: 15000,
    });

    const prices = await getProductPrices(page);
    const firstPrices = prices.slice(0, 8);

    expect(firstPrices.length).toBeGreaterThan(1);
    expect(isDescending(firstPrices)).toBeTruthy();

    await expectWebsiteStillWorks(page);
  });

  test('TC03.10 - Kiểm tra sản phẩm vẫn hiển thị giá sau khi sắp xếp', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);

    const prices = await getProductPrices(page);

    expect(prices.length).toBeGreaterThan(0);

    await expect(page.locator('body')).toContainText(/đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC03.11 - Chọn sắp xếp Khuyến mãi HOT', async ({ page }) => {
    await openMobilePage(page);

    await page.getByText('Khuyến mãi HOT').click();
    await page.waitForTimeout(2500);

    await expect(page.locator('body')).toContainText(/Khuyến mãi HOT|đ|sản phẩm/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC03.12 - Chọn sắp xếp Phổ biến', async ({ page }) => {
    await openMobilePage(page);

    await page.locator('a').filter({ hasText: 'Phổ biến' }).first().click();
    await page.waitForTimeout(2500);

    await expect(page.locator('body')).toContainText(/Phổ biến|đ|sản phẩm/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });
});