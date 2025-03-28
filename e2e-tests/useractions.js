const { url } = require('../fixture.js');
const { expect } = require('@playwright/test');

export class UserActions {
  /**
	* @param {import('@playwright/test').Page} page
	*/
  constructor (page) {
    this.page = page;

    this.loginButton = page.locator('.login');
    this.registerButton = page.locator("[id='register']");
    this.loginLink = page.frameLocator('#sbox-iframe').getByRole('link', { name: 'Log in' });
    this.registerLink = page.frameLocator('#sbox-iframe').getByRole('link', { name: 'Sign up' });
  }

  async login (username, password) {
    await this.page.goto(`${url}/login`);
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.waitForTimeout(1000);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);

    await this.loginButton.waitFor();
    await this.loginButton.click();
    await expect(this.page).toHaveURL(`${url}/drive/#`, { timeout: 100000 });
    if (!await this.page.frameLocator('#sbox-iframe').getByText('CryptDrive', { exact: true }).isVisible({timeout: 10000})) {
      await this.page.reload()
    }
    await this.page.frameLocator('#sbox-iframe').getByText('CryptDrive', { exact: true }).waitFor()
  }

  async register (username, password) {
    await this.page.goto(`${url}/register`);
    await this.registerButton.waitFor();
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Password', { exact: true }).fill(password);
    await this.page.getByPlaceholder('Confirm your password', { exact: true }).fill(password);
    await this.page.waitForTimeout(3000)
    await this.registerButton.waitFor();
    

    if (await this.page.locator('#userForm span').nth(2).isVisible()) {
      await this.page.locator('#userForm span').nth(2).click();
    }
    await this.registerButton.click();

    const modal = this.page.getByText('Warning');
    await expect(modal).toBeVisible({ timeout: 180000 });
    if (await modal.isVisible({ timeout: 180000 })) {
      await this.page.getByRole('button', { name: 'I have written down my username and password, proceed' }).click();
    }
    const hashing = this.page.getByText('Hashing your password');
    await expect(hashing).toBeVisible({ timeout: 200000 });

    await this.page.waitForTimeout(20000);
    await this.page.waitForURL(`${url}/drive/#`);
  }
}
