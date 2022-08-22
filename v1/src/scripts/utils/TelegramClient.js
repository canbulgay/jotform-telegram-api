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

  // TODO: Kullanıcının telefon numarası ile api kullanıcısının telefon numarasının eşleşip eşleşmeyeceğini kontrol et.
  async sendCode(phone_number) {
    telegramUser.phone_number = phone_number;

    await telegramUser.save();
    await this.client.connect();
    this.client.invoke(
      new Api.auth.SendCode({
        phoneNumber: phone_number,
        apiId: this.api_key,
        apiHash: this.api_hash,
        settings: new Api.CodeSettings({
          allowFlashcall: true,
          currentNumber: true,
          allowAppHash: true,
          allowMissedCall: true,
          logoutTokens: [Buffer.from("arbitrary data here")],
        }),
      })
    );

    // await this.client.sendCode({
    //   phoneNumber: phone_number,
    //   apiId: this.api_key,
    //   apiHash: this.api_hash,
    //   settings: new Api.CodeSettings({
    //     allowFlashcall: true,
    //     currentNumber: true,
    //     allowAppHash: true,
    //     allowMissedCall: true,
    //     logoutTokens: [Buffer.from("arbitrary data here")],
    //   }),
    // });
  }
}

module.exports = telegramClient;