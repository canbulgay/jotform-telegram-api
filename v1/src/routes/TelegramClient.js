const express = require("express");
const router = express.Router();

const {
  getUserTelegramCredentials,
  startTelegramClientWithPhoneCode,
  sendCodeToPhoneNumber,
} = require("../controllers/TelegramClientController");

router.post("/get-client-credentials", getUserTelegramCredentials);
router.post("/send-code", sendCodeToPhoneNumber);
router.post("/start-telegram-client", startTelegramClientWithPhoneCode);
module.exports = router;
