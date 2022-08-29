const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const ClientModel = require("../models/TelegramClient");

module.exports = async (req, res, next) => {
  // TODO: userToken dinamik girildi. Statik olarak header'dan alınmalıç

  const userToken = "c38e4be0ee2046b8adbb9eda4d6dab8c";
  const telegramClient = await ClientModel.findOne({ userId: userToken });
  if (!telegramClient) {
    return res.status(400).json({
      message: "Telegram client not found",
    });
  }
  const client = new TelegramClient(
    new StringSession(telegramClient.session_string),
    telegramClient.api_key,
    telegramClient.api_hash,
    {}
  );
  await client.connect();
  await client.session.setDC(2, "149.154.167.91", 80);
  req.client = client;
  req.userToken = userToken;
  next();
};
