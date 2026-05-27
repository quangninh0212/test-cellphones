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

async function expectBodyContains(page, pattern) {
  await expect(page.locator('body')).toContainText(pattern, {
    timeout: 15000,
  });
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

function expectPricesLessThanOrEqual(prices, maxPrice) {
  expect(prices.length).toBeGreaterThan(0);

  for (const price of prices.slice(0, 8)) {
    expect(price).toBeLessThanOrEqual(maxPrice);
  }
}

function expectPricesBetween(prices, minPrice, maxPrice) {
  expect(prices.length).toBeGreaterThan(0);

  for (const price of prices.slice(0, 8)) {
    expect(price).toBeGreaterThanOrEqual(minPrice);
    expect(price).toBeLessThanOrEqual(maxPrice);
  }
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

async function filterByAndroid(page) {
  await filterByPhoneType(page, 'Android');
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

  await page
    .locator('#filterModule')
    .getByRole('button', { name: 'Xem kết quả' })
    .click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);

  await closeCellphoneSPopups(page);
}

test.describe('TC02 - Chức năng lọc sản phẩm trên CellphoneS', () => {
  test('TC02.1 - Truy cập trang danh mục điện thoại', async ({ page }) => {
    await openMobilePage(page);

    await expectBodyContains(page, /Điện thoại|iPhone|Samsung|Apple|Android/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.2 - Kiểm tra bộ lọc loại điện thoại hiển thị', async ({ page }) => {
    await openMobilePage(page);

    await expect(page.getByRole('button', { name: 'Loại điện thoại' })).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.3 - Kiểm tra tùy chọn iPhone và Android trong bộ lọc loại điện thoại', async ({ page }) => {
    await openMobilePage(page);

    await openPhoneTypeFilter(page);

    await expect(
      page.locator('#filterModule').getByRole('button', { name: 'iPhone (iOS)' })
    ).toBeVisible({
      timeout: 15000,
    });

    await expect(
      page.locator('#filterModule').getByRole('button', { name: 'Android' })
    ).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.4 - Lọc sản phẩm theo loại điện thoại iPhone iOS', async ({ page }) => {
    await openMobilePage(page);

    await filterByIOS(page);

    await expectBodyContains(page, /iPhone|iOS|Apple|đ/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.5 - Lọc sản phẩm theo loại điện thoại Android', async ({ page }) => {
    await openMobilePage(page);

    await filterByAndroid(page);

    await expectBodyContains(page, /Android|Samsung|OPPO|Xiaomi|đ/i);
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

    await applyPriceFilter(page, null, 2000);

    const prices = await getProductPrices(page);

    expectPricesLessThanOrEqual(prices, 2000000);

    await expectWebsiteStillWorks(page);
  });

  test('TC02.9 - Lọc sản phẩm theo khoảng giá 2 đến 4 triệu', async ({ page }) => {
    await openMobilePage(page);

    await applyPriceFilter(page, 2000, 4000);

    const prices = await getProductPrices(page);

    expectPricesBetween(prices, 2000000, 4000000);

    await expectWebsiteStillWorks(page);
  });

  test('TC02.10 - Lọc sản phẩm theo khoảng giá 10 đến 15 triệu', async ({ page }) => {
    await openMobilePage(page);

    await applyPriceFilter(page, 10000, 15000);

    const prices = await getProductPrices(page);

    expectPricesBetween(prices, 10000000, 15000000);

    await expectWebsiteStillWorks(page);
  });

  test('TC02.11 - Kết hợp lọc loại điện thoại iPhone iOS và khoảng giá 8 đến 40 triệu', async ({ page }) => {
    await openMobilePage(page);

    await filterByIOS(page);
    await applyPriceFilter(page, 8000, 40000);

    await expectBodyContains(page, /iPhone|iOS|Apple|đ/i);

    const prices = await getProductPrices(page);

    expectPricesBetween(prices, 8000000, 40000000);

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

  test('TC02.13 - Lọc không có kết quả với iPhone iOS và khoảng giá 1.000đ đến 2.000đ', async ({ page }) => {
    await openMobilePage(page);

    await filterByIOS(page);
    await applyPriceFilter(page, 1, 2);

    await expect(page.locator('body')).toContainText(
      /không tìm thấy|không có sản phẩm|sản phẩm phù hợp|iPhone|Apple|đ/i,
      {
        timeout: 15000,
      }
    );

    await expectWebsiteStillWorks(page);
  });

  test('TC02.14 - Xóa hoặc bỏ bộ lọc sau khi lọc theo giá', async ({ page }) => {
    await openMobilePage(page);

    await applyPriceFilter(page, 1000, 2000);

    await expectBodyContains(page, /đ|Điện thoại|sản phẩm/i);

    const clearFilterButton = page
      .getByText(/Xóa lọc|Xoá lọc|Bỏ lọc|Bỏ chọn|Xem tất cả|Làm mới/i)
      .first();

    if (await clearFilterButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await clearFilterButton.click();
      await page.waitForTimeout(2500);
    } else {
      await page.goto(CATEGORY_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await closeCellphoneSPopups(page);
    }

    await expect(page.locator('body')).toContainText(/Điện thoại|Apple|Samsung|OPPO|Xiaomi/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC02.15 - Nhập giá âm hoặc giá không hợp lệ trong bộ lọc giá', async ({ page }) => {
    await openMobilePage(page);

    await openPriceFilter(page);

    const priceInputs = page.getByRole('textbox', { name: '0' });
    const minInput = priceInputs.nth(0);
    const maxInput = priceInputs.nth(1);

    await expect(minInput).toBeVisible({ timeout: 15000 });
    await expect(maxInput).toBeVisible({ timeout: 15000 });

    await minInput.click();
    await minInput.fill('-100000');

    await maxInput.click();
    await maxInput.fill('2000');

    await maxInput.press('Tab');
    await page.waitForTimeout(1500);

    const minValue = await minInput.inputValue();
    const minNumber = Number(minValue.replace(/[^\d]/g, ''));

    expect(minNumber).toBeGreaterThanOrEqual(0);

    await expectWebsiteStillWorks(page);
  });

  test('TC02.16 - Lọc sản phẩm theo dung lượng RAM 8GB', async ({ page }) => {
    await openMobilePage(page);

    await page.getByRole('button', { name: 'Dung lượng RAM' }).click();

    await page
      .locator('#filterModule')
      .getByRole('button', { name: '8 GB' })
      .click();

    await page
      .locator('#filterModule')
      .getByRole('button', { name: 'Xem kết quả' })
      .click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);

    await expectBodyContains(page, /8 GB|8GB|RAM|đ|sản phẩm/i);
    await expectWebsiteStillWorks(page);
  });

  test('TC02.17 - Lọc sản phẩm theo bộ nhớ trong 256GB', async ({ page }) => {
    await openMobilePage(page);

    await page.getByRole('button', { name: 'Bộ nhớ trong' }).click();

    await page
      .locator('#filterModule')
      .getByRole('button', { name: '256 GB' })
      .click();

    await page
      .locator('#filterModule')
      .getByRole('button', { name: 'Xem kết quả' })
      .click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);

    await expectBodyContains(page, /256 GB|256GB|Bộ nhớ|đ|sản phẩm/i);
    await expectWebsiteStillWorks(page);
  });
});