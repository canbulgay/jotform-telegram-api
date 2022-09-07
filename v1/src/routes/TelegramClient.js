const express = require("express");
const router = express.Router();

const {
  setClientCredentials,
  sendMessage,
  sendCodeToPhoneNumber,
  signInClient,
  removeClient,
  createSendTelegramButton,
  getClients,
} = require("../controllers/TelegramClientController");

const telegram_client_create = require("../middlewares/telegram-client-create");
const telegram_send_message = require("../middlewares/telegram-send-message");
const telegram_client_logout = require("../middlewares/telegram-client-logout");

router.post("/set-client-credentials", setClientCredentials);
router.post("/send-code", telegram_client_create, sendCodeToPhoneNumber);
router.post("/sign-in", telegram_client_create, signInClient);
router.post("/:userToken/create-button", createSendTelegramButton);
router.post("/send-message", telegram_send_message, sendMessage);
router.post("/:userToken/remove-client", telegram_client_logout, removeClient);
router.get("/get-clients", getClients);

module.exports = router;
