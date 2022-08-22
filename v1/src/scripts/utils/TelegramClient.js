const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");

let telegramUser = "";

// TODO: Bazı değişkenleri tanımlamaya gerek yok düzenlenmesi lazım.
class telegramClient {
  constructor(TelegramUser) {
    telegramUser = TelegramUser;
    this.api_key = telegramUser.api_key;
    this.api_hash = telegramUser.api_hash;
    this.session = new StringSession(telegramUser.session);
    this.client = new TelegramClient(
      this.session,
      telegramUser.api_key,
      telegramUser.api_hash,
      {}
    );
  }

}

module.exports = telegramClient;
