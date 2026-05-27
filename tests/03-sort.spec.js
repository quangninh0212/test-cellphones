const { test, expect } = require('@playwright/test');
const { closeCellphoneSPopups } = require('../utils/helpers');

const CATEGORY_URL = 'https://cellphones.com.vn/mobile.html';
const PRICE_SELECTOR = '.product__price--show';

test.setTimeout(90000);

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

function expectPricesExist(prices) {
  expect(prices.length).toBeGreaterThan(1);
}

function expectPricesAscending(prices) {
  expectPricesExist(prices);

  for (let i = 0; i < prices.length - 1; i++) {
    expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
  }
}

function expectPricesDescending(prices) {
  expectPricesExist(prices);

  for (let i = 0; i < prices.length - 1; i++) {
    expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
  }
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

async function sortHotPromotion(page) {
  await page.getByText('Khuyến mãi HOT').click();
  await page.waitForTimeout(2500);
  await closeCellphoneSPopups(page);
}

async function sortPopular(page) {
  await page.locator('a').filter({ hasText: 'Phổ biến' }).first().click();
  await page.waitForTimeout(2500);
  await closeCellphoneSPopups(page);
}

async function openPhoneTypeFilter(page) {
  await page.getByRole('button', { name: 'Loại điện thoại' }).click();
  await page.waitForTimeout(1000);
}

async function filterByPhoneType(page, phoneTypeName) {
  await openPhoneTypeFilter(page);

  await page
    .locator('#filterModule')
    .getByRole('button', { name: phoneTypeName })
    .click();

  await page
    .locator('#filterModule')
    .getByRole('button', { name: 'Xem kết quả' })
    .click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);

  await closeCellphoneSPopups(page);
}

async function filterByIOS(page) {
  await filterByPhoneType(page, 'iPhone (iOS)');
}

async function clickViewMoreProducts(page) {
  const viewMoreButton = page
    .locator(
      'xpath=//*[contains(normalize-space(.), "Xem thêm") and contains(normalize-space(.), "sản phẩm") and not(contains(normalize-space(.), "bình luận")) and not(.//*[contains(normalize-space(.), "Xem thêm") and contains(normalize-space(.), "sản phẩm")])]'
    )
    .first();

  await expect(viewMoreButton).toBeVisible({
    timeout: 15000,
  });

  await viewMoreButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  await viewMoreButton.click({ force: true });

  await page.waitForTimeout(4000);
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

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 8);

    expectPricesAscending(checkedPrices);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.4 - Kiểm tra danh sách giá sau khi sắp xếp thấp đến cao', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 12);

    expectPricesAscending(checkedPrices);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.5 - Sắp xếp sản phẩm theo giá cao đến thấp', async ({ page }) => {
    await openMobilePage(page);

    await sortHighToLow(page);

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 8);

    expectPricesDescending(checkedPrices);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.6 - Kiểm tra danh sách giá sau khi sắp xếp cao đến thấp', async ({ page }) => {
    await openMobilePage(page);

    await sortHighToLow(page);

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 12);

    expectPricesDescending(checkedPrices);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.7 - Đổi sắp xếp từ giá thấp đến cao sang giá cao đến thấp', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);

    const lowToHighPrices = await getProductPrices(page);
    const checkedLowToHighPrices = lowToHighPrices.slice(0, 8);

    expectPricesAscending(checkedLowToHighPrices);

    await sortHighToLow(page);

    const highToLowPrices = await getProductPrices(page);
    const checkedHighToLowPrices = highToLowPrices.slice(0, 8);

    expectPricesDescending(checkedHighToLowPrices);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.8 - Sắp xếp giá thấp đến cao sau khi lọc loại điện thoại iPhone iOS', async ({ page }) => {
    await openMobilePage(page);

    await filterByIOS(page);
    await sortLowToHigh(page);

    await expect(page.locator('body')).toContainText(/Apple|iPhone|đ/i, {
      timeout: 15000,
    });

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 8);

    expectPricesAscending(checkedPrices);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.9 - Sắp xếp giá cao đến thấp sau khi lọc loại điện thoại iPhone iOS', async ({ page }) => {
    await openMobilePage(page);

    await filterByIOS(page);
    await sortHighToLow(page);

    await expect(page.locator('body')).toContainText(/Apple|iPhone|đ/i, {
      timeout: 15000,
    });

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 8);

    expectPricesDescending(checkedPrices);

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

  test('TC03.11 - Chọn sắp xếp Khuyến mãi HOT và kiểm tra danh sách sản phẩm vẫn hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await sortHotPromotion(page);

    await expect(page.locator('body')).toContainText(/Khuyến mãi HOT|đ|sản phẩm/i, {
      timeout: 15000,
    });

    const prices = await getProductPrices(page);

    expect(prices.length).toBeGreaterThan(0);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.12 - Chọn sắp xếp Phổ biến và kiểm tra danh sách sản phẩm vẫn hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await sortPopular(page);

    await expect(page.locator('body')).toContainText(/Phổ biến|đ|sản phẩm/i, {
      timeout: 15000,
    });

    const prices = await getProductPrices(page);

    expect(prices.length).toBeGreaterThan(0);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.13 - Giữ sắp xếp giá cao đến thấp sau khi bấm Xem thêm sản phẩm', async ({ page }) => {
    await openMobilePage(page);

    await sortHighToLow(page);

    const pricesBeforeViewMore = await getProductPrices(page);
    const checkedPricesBefore = pricesBeforeViewMore.slice(0, 8);

    expectPricesDescending(checkedPricesBefore);

    await clickViewMoreProducts(page);

    const pricesAfterViewMore = await getProductPrices(page);
    const checkedPricesAfter = pricesAfterViewMore.slice(0, 16);

    expectPricesDescending(checkedPricesAfter);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.14 - Giữ sắp xếp giá thấp đến cao sau khi bấm Xem thêm sản phẩm', async ({ page }) => {
    await openMobilePage(page);

    await sortLowToHigh(page);

    const pricesBeforeViewMore = await getProductPrices(page);
    const checkedPricesBefore = pricesBeforeViewMore.slice(0, 8);

    expectPricesAscending(checkedPricesBefore);

    await clickViewMoreProducts(page);

    const pricesAfterViewMore = await getProductPrices(page);
    const checkedPricesAfter = pricesAfterViewMore.slice(0, 16);

    expectPricesAscending(checkedPricesAfter);

    await expectWebsiteStillWorks(page);
  });

  test('TC03.15 - Bấm Xem thêm nhiều lần sau khi sắp xếp giá cao đến thấp vẫn giữ thứ tự giá', async ({ page }) => {
    test.setTimeout(120000);

    await openMobilePage(page);

    await sortHighToLow(page);

    await clickViewMoreProducts(page);
    await clickViewMoreProducts(page);
    await clickViewMoreProducts(page);

    const prices = await getProductPrices(page);
    const checkedPrices = prices.slice(0, 24);

    expectPricesDescending(checkedPrices);

    await expectWebsiteStillWorks(page);
  });
});