async function clickIfVisible(locator, timeout = 3000) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click();
  } catch (error) {
    // Nếu không xuất hiện thì bỏ qua
  }
}

async function closeCellphoneSPopups(page) {
  await clickIfVisible(page.getByRole('button', { name: 'Bữa khác nha!' }), 3000);
  await clickIfVisible(page.getByRole('button', { name: 'Chấp nhận' }), 3000);

  try {
    const chatFrame = page.frameLocator('iframe[title="cs-live-chat-ifrm"]');
    await clickIfVisible(chatFrame.getByRole('button', { name: 'minimize' }), 3000);
  } catch (error) {
    // Nếu khung chat không xuất hiện thì bỏ qua
  }
}

module.exports = {
  closeCellphoneSPopups,
};