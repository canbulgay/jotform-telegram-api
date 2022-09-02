const express = require("express");
const router = express.Router();

const {
  setUserTelegramCredentials,
  sendMessage,
  sendCodeToPhoneNumber,
  signInTheUser,
  logOutTheUser,
  createSendTelegramButton,
} = require("../controllers/TelegramClientController");

const telegram_client_create = require("../middlewares/telegram-client-create");
const telegram_send_message = require("../middlewares/telegram-send-message");
const telegram_client_logout = require("../middlewares/telegram-client-logout");

router.post("/set-client-credentials", setUserTelegramCredentials);
router.post("/send-code", telegram_client_create, sendCodeToPhoneNumber);
router.post("/sign-in", telegram_client_create, signInTheUser);
router.post("/create-button", createSendTelegramButton);
router.post("/send-message", telegram_send_message, sendMessage);
router.get("/logout", telegram_client_logout, logOutTheUser);

module.exports = router;
