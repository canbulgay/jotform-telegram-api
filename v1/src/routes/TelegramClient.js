const express = require("express");
const router = express.Router();

const {
  getUserTelegramCredentials,
} = require("../controllers/TelegramClientController");

router.post("/get-client-credentials", getUserTelegramCredentials);
module.exports = router;
