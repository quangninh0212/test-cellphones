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

async function getFirstProductInfo(page) {
  await expect(page.locator(PRICE_SELECTOR).first()).toBeVisible({
    timeout: 15000,
  });

  const firstPrice = page.locator(PRICE_SELECTOR).first();
  const productLink = firstPrice.locator('xpath=ancestor::a[1]');
  const productName = await productLink.locator('h3').first().innerText().catch(async () => {
    return await productLink.innerText();
  });

  const productPrice = await firstPrice.innerText();
  const href = await productLink.getAttribute('href');

  return {
    productLink,
    productName: productName.trim(),
    productPrice: productPrice.trim(),
    href,
  };
}

async function openFirstProductDetail(page) {
  const productInfo = await getFirstProductInfo(page);

  await productInfo.productLink.scrollIntoViewIfNeeded();
  await productInfo.productLink.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2500);
  await closeCellphoneSPopups(page);

  return productInfo;
}

function getMainKeyword(productName) {
  return productName
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3)[0];
}

test.describe('TC04 - Chức năng xem chi tiết sản phẩm trên CellphoneS', () => {
  test('TC04.1 - Mở trang chi tiết sản phẩm từ danh mục điện thoại', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    expect(page.url()).toContain('cellphones.com.vn');
    expect(page.url()).not.toBe(CATEGORY_URL);

    await expectWebsiteStillWorks(page);
  });

  test('TC04.2 - Trang chi tiết hiển thị tên sản phẩm', async ({ page }) => {
    await openMobilePage(page);

    const productInfo = await openFirstProductDetail(page);
    const keyword = getMainKeyword(productInfo.productName);

    await expect(page.locator('body')).toContainText(new RegExp(keyword, 'i'), {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.3 - Trang chi tiết hiển thị giá sản phẩm', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.4 - Trang chi tiết hiển thị hình ảnh sản phẩm', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    const images = page.locator('img');

    expect(await images.count()).toBeGreaterThan(0);

    await expectWebsiteStillWorks(page);
  });

  test('TC04.5 - Trang chi tiết hiển thị thông tin mua hàng hoặc nút mua hàng', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/Mua ngay|Thêm vào giỏ|Trả góp|Đặt trước/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.6 - Trang chi tiết hiển thị thông tin khuyến mãi hoặc ưu đãi', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/khuyến mãi|ưu đãi|giảm|Smember|trả góp/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.7 - Trang chi tiết hiển thị thông tin chính sách hoặc bảo hành', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/bảo hành|chính sách|đổi trả|giao hàng/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.8 - Trang chi tiết hiển thị thông số kỹ thuật hoặc cấu hình', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/Thông số|Cấu hình|RAM|Bộ nhớ|Màn hình|Camera|Pin/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.9 - Có thể quay lại danh mục sau khi xem chi tiết sản phẩm', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    await page.goBack({
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);
    await closeCellphoneSPopups(page);

    await expect(page.locator('body')).toContainText(/Điện thoại|Apple|Samsung/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.10 - Mở chi tiết sản phẩm sau khi lọc hãng Apple', async ({ page }) => {
    await openMobilePage(page);

    await page.getByRole('link', { name: 'Điện thoại Apple' }).first().click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2500);
    await closeCellphoneSPopups(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/iPhone|Apple|đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.11 - Mở chi tiết sản phẩm sau khi sắp xếp giá thấp đến cao', async ({ page }) => {
    await openMobilePage(page);

    await page.getByText('Giá Thấp - Cao').click();

    await page.waitForTimeout(3000);
    await closeCellphoneSPopups(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/đ|Mua ngay|Trả góp|Thông số/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.12 - Kiểm tra URL trang chi tiết là đường dẫn sản phẩm hợp lệ', async ({ page }) => {
    await openMobilePage(page);

    await openFirstProductDetail(page);

    const currentUrl = page.url();

    expect(currentUrl).toContain('cellphones.com.vn');
    expect(currentUrl).toMatch(/\.html/);

    await expectWebsiteStillWorks(page);
  });
});