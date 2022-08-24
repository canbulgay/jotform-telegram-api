const express = require("express");
const router = express.Router();

const {
  setUserTelegramCredentials,
  sendMessage,
  sendCodeToPhoneNumber,
  terminateSessions,
  signInTheUser,
  logOutTheUser,
} = require("../controllers/TelegramClientController");

router.post("/set-client-credentials", setUserTelegramCredentials);
router.post("/send-code", sendCodeToPhoneNumber);
router.post("/sign-in", signInTheUser);
router.post("/send-message", sendMessage);
router.get("/terminate-sessions", terminateSessions);
router.get("/logout", logOutTheUser);

module.exports = router;
