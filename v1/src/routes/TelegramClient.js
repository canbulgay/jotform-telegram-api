const express = require("express");
const router = express.Router();

const {
  getUserTelegramCredentials,
  startTelegramClientWithPhoneCode,
  sendMessage,
  sendCodeToPhoneNumber,
} = require("../controllers/TelegramClientController");

router.post("/get-client-credentials", getUserTelegramCredentials);
router.post("/send-code", sendCodeToPhoneNumber);
router.post("/start-telegram-client", startTelegramClientWithPhoneCode);
router.post("/send-message", sendMessage);
module.exports = router;
