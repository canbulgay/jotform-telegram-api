const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const TelegramButton = require("../models/TelegramButton");
const ClientModel = require("../models/TelegramClient");

module.exports = async (req, res, next) => {
  const { sheet_id, column_id } = req.body;

  const button = await TelegramButton.findOne({
    sheet_id: sheet_id,
    column_id: column_id,
  });

  if (!button) {
    return res.status(400).json({
      message: "Button not found.",
    });
  }

  const telegramClient = await ClientModel.findOne({
    _id: button.client_id,
  });
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
  req.form_id = button.form_id;
  req.message = button.message;
  req.bot_url = button.bot_url;

  next();
};
