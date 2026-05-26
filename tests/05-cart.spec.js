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

  await page.getByText(/^Giỏ hàng/).first().click();

  await page.waitForLoadState('domcontentloaded').catch(() => { });
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

async function getMainBuyNowButton(page) {
  return page.getByRole('button', {
    name: 'MUA NGAY Giao nhanh từ 2 giờ',
  });
}

async function getMainAddToCartButton(page) {
  return page.getByRole('button', {
    name: 'Thêm vào giỏ',
  }).first();
}

async function getFloatingBuyNowButton(page) {
  return page.getByRole('button', {
    name: 'Mua Ngay',
    exact: true,
  });
}

async function getFloatingAddToCartButton(page) {
  return page.locator('.button-desktop.button-add-to-cart');
}

async function scrollToFloatingBuyBar(page) {
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(1500);
  await closeImagePreviewIfOpen(page);
}

async function clickMainAddToCart(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);

  const mainAddToCartButton = await getMainAddToCartButton(page);

  await expect(mainAddToCartButton).toBeVisible({ timeout: 15000 });

  await mainAddToCartButton.scrollIntoViewIfNeeded();
  await mainAddToCartButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function clickMainBuyNow(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);

  const mainBuyNowButton = await getMainBuyNowButton(page);

  await expect(mainBuyNowButton).toBeVisible({ timeout: 15000 });

  await mainBuyNowButton.scrollIntoViewIfNeeded();
  await mainBuyNowButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function clickFloatingAddToCart(page) {
  await openProductDetail(page);
  await selectProductVersionAndColor(page);

  await closeImagePreviewIfOpen(page);
  await scrollToFloatingBuyBar(page);

  const floatingAddToCartButton = await getFloatingAddToCartButton(page);

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
  await scrollToFloatingBuyBar(page);

  const floatingBuyButton = await getFloatingBuyNowButton(page);

  await expect(floatingBuyButton).toBeVisible({ timeout: 15000 });

  await floatingBuyButton.click();

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
  await closeImagePreviewIfOpen(page);
}

async function prepareProductInCartByMainBuyNow(page) {
  await clickMainBuyNow(page);
  await openCartPage(page);
  await expectCartHasProduct(page);
}

async function prepareProductInCartByMainAddToCart(page) {
  await clickMainAddToCart(page);
  await openCartPage(page);
  await expectCartHasProduct(page);
}

async function prepareProductInCartByFloatingBuyNow(page) {
  await clickFloatingBuyNow(page);
  await openCartPage(page);
  await expectCartHasProduct(page);
}

async function prepareProductInCartByFloatingAddToCart(page) {
  await clickFloatingAddToCart(page);
  await openCartPage(page);
  await expectCartHasProduct(page);
}

async function clickPlusInCart(page) {
  await expect(page.locator('#listItemSuperCart')).toBeVisible({
    timeout: 15000,
  });

  await page.getByText('+', { exact: true }).first().click();
  await page.waitForTimeout(1200);
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

  if (!(await cartItem.isVisible({ timeout: 5000 }).catch(() => false))) {
    return;
  }

  const deleteButton = cartItem.getByRole('button').nth(0);

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

async function getQuantityValue(page) {
  const quantityInput = page.locator('#listItemSuperCart').getByRole('textbox');

  if (await quantityInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    const value = await quantityInput.inputValue();
    return Number(value.replace(/[^\d]/g, ''));
  }

  return null;
}

async function increaseUntilLimitWarning(page, maxClicks = 30) {
  const plusButton = page.getByText('+', { exact: true }).first();
  const closeWarningButton = page.getByRole('button', { name: 'Close' });

  let warningFound = false;

  for (let i = 0; i < maxClicks; i++) {
    await plusButton.click();
    await page.waitForTimeout(500);

    const isWarningVisible = await closeWarningButton
      .isVisible({ timeout: 500 })
      .catch(() => false);

    if (isWarningVisible) {
      warningFound = true;
      break;
    }
  }

  expect(warningFound).toBeTruthy();

  await closeAlertPopupIfOpen(page);
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

    const mainBuyNowButton = await getMainBuyNowButton(page);

    await expect(mainBuyNowButton).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.5 - Kiểm tra nút Thêm vào giỏ ở khu vực chính hiển thị', async ({ page }) => {
    await openProductDetail(page);
    await selectProductVersionAndColor(page);

    const mainAddToCartButton = await getMainAddToCartButton(page);

    await expect(mainAddToCartButton).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.6 - Kiểm tra nút Mua Ngay ở thanh mua hàng nổi hiển thị', async ({ page }) => {
    await openProductDetail(page);
    await selectProductVersionAndColor(page);

    await scrollToFloatingBuyBar(page);

    const floatingBuyNowButton = await getFloatingBuyNowButton(page);

    await expect(floatingBuyNowButton).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.7 - Kiểm tra nút Thêm vào giỏ ở thanh mua hàng nổi hiển thị', async ({ page }) => {
    await openProductDetail(page);
    await selectProductVersionAndColor(page);

    await scrollToFloatingBuyBar(page);

    const floatingAddToCartButton = await getFloatingAddToCartButton(page);

    await expect(floatingAddToCartButton).toBeVisible({
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.8 - Bấm Thêm vào giỏ ở khu vực chính, kiểm tra giỏ hàng có sản phẩm và xóa sau kiểm tra', async ({ page }) => {
    await prepareProductInCartByMainAddToCart(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.9 - Bấm Mua Ngay ở khu vực chính, kiểm tra giỏ hàng có sản phẩm và xóa sau kiểm tra', async ({ page }) => {
    await prepareProductInCartByMainBuyNow(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.10 - Bấm Thêm vào giỏ ở thanh mua hàng nổi, kiểm tra giỏ hàng có sản phẩm và xóa sau kiểm tra', async ({ page }) => {
    await prepareProductInCartByFloatingAddToCart(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.11 - Bấm Mua Ngay ở thanh mua hàng nổi, kiểm tra giỏ hàng có sản phẩm và xóa sau kiểm tra', async ({ page }) => {
    await prepareProductInCartByFloatingBuyNow(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.12 - Mở giỏ hàng và kiểm tra giỏ hàng hoạt động', async ({ page }) => {
    await openMobilePage(page);

    await openCartPage(page);

    await expect(page.locator('body')).toContainText(/Giỏ hàng|Thanh toán|Tạm tính|sản phẩm/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC05.13 - Tăng số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
    await prepareProductInCartByMainBuyNow(page);

    await clickPlusInCart(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.14 - Giảm số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
    await prepareProductInCartByMainBuyNow(page);

    await clickPlusInCart(page);
    await clickMinusInCart(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.15 - Tăng quá số lượng cho phép và kiểm tra hệ thống hiển thị thông báo', async ({ page }) => {
    test.setTimeout(180000);

    await prepareProductInCartByMainBuyNow(page);

    await increaseUntilLimitWarning(page, 30);

    await expectWebsiteStillWorks(page);

    await deleteProductInCart(page);
  });

  test('TC05.16 - Xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
    await prepareProductInCartByMainBuyNow(page);

    await expectCartHasProduct(page);

    await deleteProductInCart(page);

    await expectWebsiteStillWorks(page);
  });

  test('TC05.17 - Kiểm tra có thể nhập trực tiếp số lượng sản phẩm trong giỏ hàng', async ({ page }) => {
    await prepareProductInCartByMainBuyNow(page);

    const quantityInput = page.locator('#listItemSuperCart').getByRole('textbox');

    await expect(quantityInput).toBeVisible({ timeout: 15000 });

    await quantityInput.click();
    await quantityInput.fill('3');

    await expect(quantityInput).toHaveValue('3', {
      timeout: 5000,
    });

    await deleteProductInCart(page);
  });
});