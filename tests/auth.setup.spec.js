const { test } = require('@playwright/test');

test('Đăng nhập CellphoneS và lưu trạng thái', async ({ page }) => {
  await page.goto('https://cellphones.com.vn/');

  console.log('Hãy đăng nhập thủ công trên trình duyệt đang mở.');
  console.log('Sau khi đăng nhập xong, quay lại terminal và nhấn Enter nếu cần.');

  await page.pause();

  await page.context().storageState({
    path: 'auth/cellphones-auth.json',
  });
});