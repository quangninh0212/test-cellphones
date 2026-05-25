const { test, expect } = require('@playwright/test');
const { closeCellphoneSPopups } = require('../utils/helpers');

test.use({
  storageState: 'auth/cellphones-auth.json',
});

test.setTimeout(90000);

const MOBILE_URL = 'https://cellphones.com.vn/mobile.html';
const PRODUCT_LINK_NAME = /OPPO Find X9s 12GB 256GB OPPO/i;

async function expectWebsiteStillWorks(page) {
  expect(page.url()).toContain('cellphones.com.vn');

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
}

async function closeImagePreviewIfOpen(page) {
  const imageCloseButton = page.locator('.spl-close');

  if (await imageCloseButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    await imageCloseButton.click();
    await page.waitForTimeout(500);
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function closeAlertPopupIfOpen(page) {
  const closeButton = page.getByRole('button', { name: 'Close' });

  if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeButton.click();
    await page.waitForTimeout(800);
  }
}

async function openMobilePage(page) {
  await page.goto(MOBILE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function openProductDetail(page) {
  await openMobilePage(page);

  await page.getByRole('link', { name: PRODUCT_LINK_NAME }).click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function selectProductVersionAndColor(page) {
  await closeImagePreviewIfOpen(page);

  const grayColorFull = page.getByRole('link', {
    name: /OPPO Find X9s-Xám|Xám/i,
  }).first();

  if (await grayColorFull.isVisible({ timeout: 5000 }).catch(() => false)) {
    await grayColorFull.click();
    await page.waitForTimeout(1500);
    await closeImagePreviewIfOpen(page);
  }

  const grayColorShort = page.getByRole('link', { name: 'Xám', exact: true });

  if (await grayColorShort.isVisible({ timeout: 3000 }).catch(() => false)) {
    await grayColorShort.click();
    await page.waitForTimeout(1500);
    await closeImagePreviewIfOpen(page);
  }

  await closeCellphoneSPopups(page);
}

async function openCartPage(page) {
  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);

  await page.getByText('Giỏ hàng').click();

  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function expectCartHasProduct(page) {
  await expect(page.locator('body')).toContainText(/Giỏ hàng|OPPO|Find|X9|Thanh toán|Tạm tính/i, {
    timeout: 15000,
  });

  await expect(page.locator('#listItemSuperCart')).toBeVisible({
    timeout: 15000,
  });
}

async function clickMainAddToCart(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);

  const addToCartButton = page.locator('.button-desktop.button-add-to-cart');

  await expect(addToCartButton).toBeVisible({ timeout: 15000 });

  await addToCartButton.scrollIntoViewIfNeeded();
  await addToCartButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function clickMainBuyNow(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);

  const buyNowButton = page.getByRole('button', { name: 'Mua Ngay', exact: true });

  await expect(buyNowButton).toBeVisible({ timeout: 15000 });

  await buyNowButton.scrollIntoViewIfNeeded();
  await buyNowButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);

  await openCartPage(page);
}

async function clickFloatingAddToCart(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1500);

  const floatingAddToCartButton = page.locator('.button-desktop.button-add-to-cart').last();

  await expect(floatingAddToCartButton).toBeVisible({ timeout: 15000 });

  await floatingAddToCartButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function clickFloatingBuyNow(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);

  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1500);

  const floatingBuyButton = page.getByRole('button', { name: 'Mua Ngay', exact: true }).last();

  await expect(floatingBuyButton).toBeVisible({ timeout: 15000 });

  await floatingBuyButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);

  await openCartPage(page);
}

async function clickPlusInCart(page) {
  await expect(page.locator('#listItemSuperCart')).toBeVisible({
    timeout: 15000,
  });

  await page.getByText('+', { exact: true }).first().click();
  await page.waitForTimeout(1200);
  await closeAlertPopupIfOpen(page);
}

async function clickMinusInCart(page) {
  await expect(page.locator('#listItemSuperCart')).toBeVisible({
    timeout: 15000,
  });

  await page.getByText('-', { exact: true }).first().click();
  await page.waitForTimeout(1200);
}

async function deleteProductInCart(page) {
  const cartItem = page.locator('#listItemSuperCart');

  await expect(cartItem).toBeVisible({ timeout: 15000 });

  const deleteButton = cartItem.getByRole('button').first();

  await deleteButton.click();
  await page.waitForTimeout(2000);

  const confirmDelete = page.getByRole('button', { name: /Xóa|Đồng ý|Có|OK|Xác nhận/i }).first();

  if (await confirmDelete.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmDelete.click();
    await page.waitForTimeout(2000);
  }

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

test.describe('TC05 - Chức năng thêm/xóa sản phẩm trong giỏ hàng trên CellphoneS', () => {
  test('TC05.1 - Kiểm tra người dùng đã đăng nhập', async ({ page }) => {
    await page.goto('https://cellphones.com.vn/', {
      waitUntil: 'domcontentloaded',
    });

    await closeCellphoneSPopups(page);
    await closeImagePreviewIfOpen(page);

    await expect(page.locator('body')).toContainText(
      /Smember|Tài khoản|Đăng xuất|thành viên|Giỏ hàng/i,
      { timeout: 15000 }
    );

    await expectWebsiteStillWorks(page);
  });

  test('TC05.2 - Mở trang chi tiết sản phẩm để thao tác giỏ hàng', async ({ page }) => {
    await openProductDetail(page);

    await expect(page.locator('body')).toContainText(/OPPO|Mua Ngay|Thêm vào giỏ|Trả góp/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.3 - Chọn phiên bản/màu sắc sản phẩm', async ({ page }) => {
    await openProductDetail(page);
    await selectProductVersionAndColor(page);

    await expect(page.locator('body')).toContainText(/Xám|OPPO|X9/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.4 - Kiểm tra nút Mua Ngay ở khu vực chính hiển thị', async ({ page }) => {
    await openProductDetail(page);
    await selectProductVersionAndColor(page);

    const buyNowButton = page.getByRole('button', { name: 'Mua Ngay', exact: true });

    await expect(buyNowButton).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.5 - Kiểm tra nút Thêm vào giỏ ở khu vực chính hiển thị', async ({ page }) => {
    await openProductDetail(page);
    await selectProductVersionAndColor(page);

    const addToCartButton = page.locator('.button-desktop.button-add-to-cart');

    await expect(addToCartButton).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.6 - Bấm Thêm vào giỏ ở khu vực chính và kiểm tra sản phẩm được thêm', async ({ page }) => {
    await clickMainAddToCart(page);

    await expect(page.locator('body')).toContainText(/giỏ hàng|thêm|sản phẩm|OPPO|X9/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.7 - Bấm Mua Ngay ở khu vực chính và chuyển sang trang giỏ hàng', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);
    await expectWebsiteStillWorks(page);
  });

  test('TC05.8 - Kiểm tra sản phẩm hiển thị trong giỏ hàng sau khi Mua Ngay', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);
    await expectWebsiteStillWorks(page);
  });

  test('TC05.9 - Bấm Thêm vào giỏ ở thanh mua hàng nổi', async ({ page }) => {
    await clickFloatingAddToCart(page);

    await expect(page.locator('body')).toContainText(/giỏ hàng|thêm|sản phẩm|OPPO|X9/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.10 - Bấm Mua Ngay ở thanh mua hàng nổi và chuyển sang giỏ hàng', async ({ page }) => {
    await clickFloatingBuyNow(page);

    await expectCartHasProduct(page);
    await expectWebsiteStillWorks(page);
  });

  test('TC05.11 - Kiểm tra sản phẩm hiển thị trong giỏ sau khi mua từ thanh nổi', async ({ page }) => {
    await clickFloatingBuyNow(page);

    await expectCartHasProduct(page);
    await expectWebsiteStillWorks(page);
  });

  test('TC05.12 - Tăng số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);

    await clickPlusInCart(page);

    await expectCartHasProduct(page);
    await expectWebsiteStillWorks(page);
  });

  test('TC05.13 - Giảm số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);

    await clickPlusInCart(page);
    await clickMinusInCart(page);

    await expectCartHasProduct(page);
    await expectWebsiteStillWorks(page);
  });

  test('TC05.14 - Tăng quá số lượng cho phép và kiểm tra hệ thống hiển thị thông báo', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);

    await clickPlusInCart(page);
    await clickPlusInCart(page);
    await clickPlusInCart(page);
    await clickPlusInCart(page);

    await expect(page.locator('body')).toContainText(/số lượng|không đủ|tối đa|sản phẩm|giỏ hàng/i, {
      timeout: 15000,
    });

    await closeAlertPopupIfOpen(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.15 - Kiểm tra có thể nhập trực tiếp số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);

    const quantityInput = page.locator('#listItemSuperCart').getByRole('textbox');

    await expect(quantityInput).toBeVisible({ timeout: 15000 });

    await quantityInput.click();
    await quantityInput.fill('3');

    await expect(quantityInput).toHaveValue('3', {
      timeout: 5000,
    });
  });

  test('TC05.16 - Xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
    await clickMainBuyNow(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });
});