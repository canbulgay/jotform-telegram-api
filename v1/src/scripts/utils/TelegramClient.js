const { TelegramClient, Api } = require("telegram");
const { StoreSession } = require("telegram/sessions");

let API_KEY;
let API_HASH;
let PHONE_NUMBER;
let PHONE_CODE_HASH;
let client;

class Client {
  //Save User's credentials.
  async saveCredentials(api_key, api_hash) {
    API_KEY = parseInt(api_key);
    API_HASH = api_hash;

    client = new TelegramClient(
      new StoreSession("Sessions"),
      API_KEY,
      API_HASH,
      {}
    );
    await client.connect();
    await client.session.setDC(2, "149.154.167.91", 80);
    return;
  }

  //Send code to user via phone_number.
  async sendCode(phone_number) {
    PHONE_NUMBER = phone_number;
    await client.connect();
    const result = await client.sendCode(
      {
        apiId: API_KEY,
        apiHash: API_HASH,
      },
      phone_number
    );

    PHONE_CODE_HASH = result.phoneCodeHash;

    console.log(result);
    return;
  }

  //Sign in user via phone_code.
  async signIn(phone_code) {
    await client.connect();

    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: PHONE_NUMBER,
        phoneCodeHash: PHONE_CODE_HASH,
        phoneCode: phone_code,
      })
    );

    return;
  }

  //Send message by current user.
  async sendMessage(username, message) {
    await client.connect();
    await client.sendMessage(username, { message: message });

    return;
  }

  //Reset autherizations except this one.
  async resetAuthorizations() {
    await client.connect();
    await client.invoke(new Api.auth.ResetAuthorizations({}));

    return;
  }

  // Log out the current user.
  async logOut() {
    await client.connect();
    await client.invoke(new Api.auth.LogOut({}));

    return;
  }
}

module.exports = Client;
