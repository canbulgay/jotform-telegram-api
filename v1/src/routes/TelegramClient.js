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

const telegram_auth_middleware = require("../middlewares/telegram-client-auth");

router.post("/set-client-credentials", setUserTelegramCredentials);
router.post("/send-code", telegram_auth_middleware, sendCodeToPhoneNumber);
router.post("/sign-in", telegram_auth_middleware, signInTheUser);
router.post("/send-message", telegram_auth_middleware, sendMessage);
router.get("/terminate-sessions", telegram_auth_middleware, terminateSessions);
router.get("/logout", telegram_auth_middleware, logOutTheUser);

module.exports = router;
