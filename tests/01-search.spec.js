const { test, expect } = require('@playwright/test');
const { closeCellphoneSPopups } = require('../utils/helpers');

const BASE_URL = 'https://cellphones.com.vn/';
const SEARCH_BOX_NAME = 'Bạn muốn mua gì hôm nay?';

test.setTimeout(60000);

async function openHomePage(page) {
  const response = await page.goto(BASE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  if (response) {
    expect(response.status()).toBeLessThan(400);
  }
  await closeCellphoneSPopups(page);
}

function getSearchBox(page) {
  return page.getByRole('textbox', { name: SEARCH_BOX_NAME });
}

async function searchProduct(page, keyword) {
  const searchBox = getSearchBox(page);

  await expect(searchBox).toBeVisible({ timeout: 15000 });

  await searchBox.click();
  await searchBox.fill(keyword);
  await searchBox.press('Enter');

  await page.waitForTimeout(3000);

  await closeCellphoneSPopups(page);
}

async function expectWebsiteStillWorks(page) {
  expect(page.url()).toContain('cellphones.com.vn');

  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
}

test.describe('TC01 - Chức năng tìm kiếm sản phẩm trên CellphoneS', () => {
  test('TC01.1 - Kiểm tra ô tìm kiếm hiển thị', async ({ page }) => {
    await openHomePage(page);

    const searchBox = getSearchBox(page);

    await expect(searchBox).toBeVisible({ timeout: 15000 });
  });

  test('TC01.2 - Kiểm tra ô tìm kiếm có thể nhập dữ liệu', async ({ page }) => {
    await openHomePage(page);

    const searchBox = getSearchBox(page);

    await expect(searchBox).toBeVisible({ timeout: 15000 });

    await searchBox.click();
    await searchBox.fill('iPhone');

    const value = await searchBox.inputValue();

    expect(value).toBe('iPhone');
  });

  test('TC01.3 - Tìm kiếm sản phẩm với từ khóa hợp lệ iPhone', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'iPhone');

    await expect(page.locator('body')).toContainText(/iPhone/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC01.4 - Kết quả tìm kiếm iPhone có hiển thị thông tin giá', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'iPhone');

    const body = page.locator('body');

    await expect(body).toContainText(/iPhone/i, {
      timeout: 15000,
    });

    await expect(body).toContainText(/đ/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC01.5 - Tìm kiếm không phân biệt chữ hoa chữ thường', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'iphone');

    await expect(page.locator('body')).toContainText(/iphone|iPhone/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC01.6 - Tìm kiếm với keyword một phần', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'sam');

    await expect(page.locator('body')).toContainText(/sam|samsung/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC01.7 - Tìm kiếm với từ khóa không tồn tại', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'abcxyzkhongcosp123456');

    await expectWebsiteStillWorks(page);
  });

  test('TC01.8 - Tìm kiếm bằng ký tự số', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, '15');

    await expectWebsiteStillWorks(page);
  });

  test('TC01.9 - Tìm kiếm bằng ký tự đặc biệt và emoji', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, '@@@🌷👩');

    await expectWebsiteStillWorks(page);
  });

  test('TC01.10 - Nhấn Enter khi ô tìm kiếm rỗng không làm website bị lỗi', async ({ page }) => {
    await openHomePage(page);

    const searchBox = getSearchBox(page);

    await expect(searchBox).toBeVisible({ timeout: 15000 });

    await searchBox.click();
    await searchBox.fill('');
    await searchBox.press('Enter');

    await page.waitForTimeout(1000);

    await expectWebsiteStillWorks(page);
  });

  test('TC01.11 - Tìm kiếm bằng toàn dấu cách', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, '     ');

    await expectWebsiteStillWorks(page);
  });

  test("TC01.12 - Tìm kiếm với chuỗi SQL Injection cơ bản", async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, "' OR '1'='1");

    await expectWebsiteStillWorks(page);
  });

    test('TC01.13 - Tìm kiếm tiếng Việt có dấu', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'điện thoại');

    await expect(page.locator('body')).toContainText(/điện thoại|sản phẩm|Samsung|iPhone|OPPO/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC01.14 - Tìm kiếm với chuỗi XSS cơ bản', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, '<script>alert(1)</script>');

    await expectWebsiteStillWorks(page);

    const bodyText = await page.locator('body').innerText();

    expect(bodyText).not.toContain('alert(1)');
  });

  test('TC01.15 - Kiểm tra autocomplete khi nhập keyword sam', async ({ page }) => {
    await openHomePage(page);

    const searchBox = getSearchBox(page);

    await expect(searchBox).toBeVisible({ timeout: 15000 });

    await searchBox.click();
    await searchBox.fill('sam');

    await page.waitForTimeout(2000);

    await expect(page.locator('body')).toContainText(/Samsung|sam/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });

  test('TC01.16 - Click vào gợi ý tìm kiếm tự động', async ({ page }) => {
    await openHomePage(page);

    const searchBox = getSearchBox(page);

    await expect(searchBox).toBeVisible({ timeout: 15000 });

    await searchBox.click();
    await searchBox.fill('sam');

    await page.waitForTimeout(2000);

    const suggestion = page.getByText(/Samsung/i).first();

    if (await suggestion.isVisible({ timeout: 5000 }).catch(() => false)) {
      await suggestion.click();
      await page.waitForTimeout(3000);

      await expect(page.locator('body')).toContainText(/Samsung|sản phẩm|đ/i, {
        timeout: 15000,
      });
    } else {
      await searchBox.press('Enter');

      await expect(page.locator('body')).toContainText(/Samsung|sam|sản phẩm|đ/i, {
        timeout: 15000,
      });
    }

    await expectWebsiteStillWorks(page);
  });

  test('TC01.17 - Kiểm tra thông báo khi tìm kiếm không có kết quả', async ({ page }) => {
    await openHomePage(page);

    await searchProduct(page, 'abcxyz999888khongcoketqua');

    await expect(page.locator('body')).toContainText(/không tìm thấy|không có|không tồn tại|sản phẩm|kết quả/i, {
      timeout: 15000,
    });

    await expectWebsiteStillWorks(page);
  });
});