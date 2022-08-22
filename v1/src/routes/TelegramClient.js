const express = require("express");
const router = express.Router();

const {
  getUserTelegramCredentials,
  sendCodeToPhoneNumber,
} = require("../controllers/TelegramClientController");

router.post("/get-client-credentials", getUserTelegramCredentials);
router.post("/send-code", sendCodeToPhoneNumber);
module.exports = router;
