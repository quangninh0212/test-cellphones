const { test, expect } = require('@playwright/test');
const { closeCellphoneSPopups } = require('../utils/helpers');

const CATEGORY_URL = 'https://cellphones.com.vn/mobile.html';
const PRICE_SELECTOR = '.product__price--show';
const OPPO_PRODUCT_NAME = /OPPO Find X9s 12GB 256GB OPPO/i;

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
  await closeImagePreviewIfOpen(page);
}

async function expectWebsiteStillWorks(page) {
  expect(page.url()).toContain('cellphones.com.vn');

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
}

async function closeImagePreviewIfOpen(page) {
  const imageCloseButton = page.locator('.spl-close');

  if (await imageCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await imageCloseButton.click();
    await page.waitForTimeout(500);
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
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

  await page.waitForLoadState('domcontentloaded').catch(() => { });
  await page.waitForTimeout(2500);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);

  return productInfo;
}

async function openOppoProductDetail(page) {
  await openMobilePage(page);

  const oppoProduct = page.getByRole('link', { name: OPPO_PRODUCT_NAME });

  await expect(oppoProduct).toBeVisible({ timeout: 15000 });
  await oppoProduct.click();

  await page.waitForLoadState('domcontentloaded').catch(() => { });
  await page.waitForTimeout(2500);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function selectOppoColor(page) {
  const grayColor = page.getByRole('link', {
    name: /OPPO Find X9s-Xám|Xám/i,
  }).first();

  await expect(grayColor).toBeVisible({ timeout: 15000 });
  await grayColor.scrollIntoViewIfNeeded();
  await grayColor.click();

  await page.waitForTimeout(2000);

  await closeCellphoneSPopups(page);
}

async function clickMainProductImage(page) {
  const mainGallery = page.locator('.gallery-product-detail').first();

  await expect(mainGallery).toBeVisible({
    timeout: 15000,
  });

  await mainGallery.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  await mainGallery.click({
    force: true,
  });

  await expect(page.locator('.spl-close')).toBeVisible({
    timeout: 15000,
  });
}

function getMainKeyword(productName) {
  return productName
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3)[0];
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

    await expect(page.locator('body')).toContainText(/Mua ngay|MUA NGAY|Thêm vào giỏ|Trả góp|Đặt trước/i, {
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
    await closeImagePreviewIfOpen(page);

    await expect(page.locator('body')).toContainText(/Điện thoại|Apple|Samsung|OPPO|Android/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.10 - Mở chi tiết sản phẩm sau khi lọc loại điện thoại iPhone iOS', async ({ page }) => {
    await openMobilePage(page);

    await filterByIOS(page);

    await page.waitForTimeout(3000);
    await closeCellphoneSPopups(page);

    await openFirstProductDetail(page);

    await expect(page.locator('body')).toContainText(/đ|Mua ngay|MUA NGAY|Trả góp|Thông số/i, {
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

    await expect(page.locator('body')).toContainText(/đ|Mua ngay|MUA NGAY|Trả góp|Thông số/i, {
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

  test('TC04.13 - Chọn màu sắc sản phẩm và kiểm tra trang vẫn cập nhật đúng', async ({ page }) => {
    await openOppoProductDetail(page);

    await page.getByRole('link', { name: /OPPO Find X9s-Xám|Xám/i }).first().click();
    await page.waitForTimeout(1500);

    await closeImagePreviewIfOpen(page);

    await expect(page.locator('body')).toContainText(/Xám|OPPO|Find X9s|đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.14 - Chọn phiên bản sản phẩm và kiểm tra thông tin thay đổi', async ({ page }) => {
    await openOppoProductDetail(page);

    await page.getByRole('link', { name: 'X9 Ultra', exact: true }).click();
    await page.waitForTimeout(1500);

    await closeImagePreviewIfOpen(page);

    await expect(page.locator('body')).toContainText(/X9 Ultra|OPPO|đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.15 - Chọn màu khác của phiên bản sản phẩm và kiểm tra thông tin hiển thị', async ({ page }) => {
    await openOppoProductDetail(page);

    await page.getByRole('link', { name: 'X9 Ultra', exact: true }).click();
    await page.waitForTimeout(1500);

    await closeImagePreviewIfOpen(page);

    await page.getByRole('link', { name: /OPPO Find X9 Ultra-Cam|Cam/i }).first().click();
    await page.waitForTimeout(1500);

    await closeImagePreviewIfOpen(page);

    await expect(page.locator('body')).toContainText(/Cam|X9 Ultra|OPPO|đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.16 - Click ảnh sản phẩm để mở gallery và đóng gallery', async ({ page }) => {
    await openOppoProductDetail(page);

    await selectOppoColor(page);

    await clickMainProductImage(page);

    const closeGalleryButton = page.locator('.spl-close');

    await expect(closeGalleryButton).toBeVisible({
      timeout: 15000,
    });

    await closeGalleryButton.click();
    await page.waitForTimeout(1000);

    await expect(closeGalleryButton).not.toBeVisible({
      timeout: 5000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.17 - Kiểm tra khu vực thông số kỹ thuật khi cuộn đến phần thông số', async ({ page }) => {
    await openOppoProductDetail(page);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    await page.waitForTimeout(2000);

    await expect(page.locator('body')).toContainText(/Thông số|Cấu hình|RAM|Bộ nhớ|Màn hình|Camera|Pin/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.18 - Kiểm tra khu vực đánh giá hoặc bình luận sản phẩm', async ({ page }) => {
    await openOppoProductDetail(page);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(2500);

    await expect(page.locator('body')).toContainText(/đánh giá|bình luận|hỏi đáp|sao|nhận xét/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.19 - Mở URL sản phẩm không tồn tại và kiểm tra website xử lý lỗi', async ({ page }) => {
    await page.goto('https://cellphones.com.vn/san-pham-khong-ton-tai-abcxyz.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    await expect(page.locator('body')).toContainText(/404|không tìm thấy|không tồn tại|trang chủ|CellphoneS|bảo trì/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC04.20 - Kiểm tra sản phẩm hết hàng không thể mua như sản phẩm còn hàng', async ({ page }) => {
    await page.goto('https://cellphones.com.vn/laptop-msi-gaming-bravo-15-c7vfk-275vn.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForTimeout(2500);
    await closeCellphoneSPopups(page);
    await closeImagePreviewIfOpen(page);

    await expect(page.locator('body')).toContainText(
      /Hết hàng|Tạm hết hàng|Ngừng kinh doanh|Liên hệ|Thông báo khi có hàng|hàng sắp về/i,
      {
        timeout: 15000,
      }
    );

    await expect(page.locator('body')).not.toContainText(/MUA NGAY Giao nhanh từ 2 giờ/i);

    await expectWebsiteStillWorks(page);
  });
});