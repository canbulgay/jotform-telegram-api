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

const telegram_auth_middleware = require("../middlewares/telegram-client-auth");
const telegram_button = require("../middlewares/telegram-button");

router.post("/set-client-credentials", setUserTelegramCredentials);
router.post("/send-code", telegram_auth_middleware, sendCodeToPhoneNumber);
router.post("/sign-in", telegram_auth_middleware, signInTheUser);
router.post(
  "/create-button",
  telegram_auth_middleware,
  createSendTelegramButton
);
router.post("/send-message", telegram_button, sendMessage);
router.get("/logout", telegram_auth_middleware, logOutTheUser);

module.exports = router;
