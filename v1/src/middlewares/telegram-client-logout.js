const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const ClientModel = require("../models/TelegramClient");

module.exports = async (req, res, next) => {
  const { userToken } = req.body;
  if (!userToken) {
    return res.status(404).json({
      message: "Your user token is not found.",
    });
  }

  const telegramClient = await ClientModel.findOne({ _id: userToken });
  if (!telegramClient) {
    return res.status(404).json({
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
  next();
};
