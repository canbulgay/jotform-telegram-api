const {
  saveCredentials,
  sendCode,
  signIn,
  sendMessageToUser,
  logOut,
} = require("../services/TelegramClientService");

const eventEmitter = require("../scripts/events/eventEmitter");
const TelegramButton = require("../models/TelegramButton");

/**
 * Create a new telegram user via client credentials.
 *
 * @param {api_key , api_hash} req.body
 * @param {message, userToken} res
 * @param {error} next
 * @returns
 */
const setUserTelegramCredentials = async (req, res, next) => {
  const { api_key, api_hash } = req.body;

  try {
    const userToken = await saveCredentials(api_key, api_hash);

    res.cookie("userToken", userToken, {
      maxAge: 3600000,
    });

    return res.status(201).json({
      message: "Your credentials has been saved.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sent a code to user's phone.
 *
 * @param {phone_number} req.body
 * @param {client , userToken} req
 * @param {message , phoneCodeHash } res
 * @param {error} next
 * @return json
 */

const sendCodeToPhoneNumber = async (req, res, next) => {
  const { phone_number } = req.body;
  const client = req.client;
  const userToken = req.userToken;

  try {
    const phoneCodeHash = await sendCode(phone_number, client, userToken);

    return res.status(200).json({
      message: "Your code sent to your phone.",
      phoneCodeHash: phoneCodeHash,
    });
  } catch (error) {
    if (error.errorMessage === "PHONE_NUMBER_INVALID") {
      return res.status(406).json({
        error: "Phone number is invalid.",
      });
    }
    next(error);
  }
};

/**
 * Sign in the user via phone_code and phone_code_hash
 *
 * @param {phone_code , phone_code_hash} req.body
 * @param {client , userToken} req
 * @param {message , userData} res
 * @param {error} next
 * @return json
 */
const signInTheUser = async (req, res, next) => {
  const { phone_code, phone_code_hash } = req.body;
  const client = req.client;
  const userToken = req.userToken;

  try {
    const userData = await signIn(
      phone_code,
      phone_code_hash,
      client,
      userToken
    );
    // Delete cookie for userToken
    res.clearCookie("userToken");

    if (userData) {
      return res.status(200).json({
        messsage: "You are logged in.",
        user: userData,
      });
    }
  } catch (error) {
    switch (error.errorMessage) {
      case "PHONE_CODE_INVALID":
        res.status(406).json({
          error: "Phone code is invalid.",
        });
        break;
      case "PHONE_CODE_EXPIRED":
        res.status(400).json({
          error: "Phone code is expired.",
        });
        break;
      case "PHONE_CODE_EMPTY":
        res.status(406).json({
          error: "Phone code hash is invalid.",
        });
        break;
      default:
        break;
    }
    next(error);
  }
};

/**
 * Create send telegram button.
 *
 * @param {form_id , message , sheet_id , column_id , userToken} req.body
 * @param {message} res
 * @param {error} next
 * @return json
 */
const createSendTelegramButton = async (req, res, next) => {
  const { form_id, message, sheet_id, column_id, userToken } = req.body;

  try {
    const button = new TelegramButton({
      client_id: userToken,
      form_id: form_id,
      message: message,
      sheet_id: sheet_id,
      column_id: column_id,
    });
    await button.save();

    return res.status(201).json({
      message: "Your button has been created.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a custom message to user by telegram client.
 *
 * @param {username} req.body
 * @param {client, form_id , bot_url , message } req
 * @param {message , payload} res
 * @param {error} next
 * @return json
 */
const sendMessage = async (req, res, next) => {
  const { username } = req.body;
  const form_id = req.form_id;
  const message = req.message;
  const bot_url = req.bot_url;
  const client = req.client;

  try {
    await sendMessageToUser(username, message, bot_url, client);
    eventEmitter.emit("fetch:questions", form_id, username);

    return res.status(200).json({
      message: "Your message was sent successfully",
      payload: {
        username: username,
        message: message,
      },
    });
  } catch (error) {
    return res.status(404).json({
      error: "User not found.",
    });
  }
};

/**
 * Logged out the authenticated user.
 *
 * @param {client , userToken} req
 * @param {message} res
 * @param {error} next
 * @return json
 */

const logOutTheUser = async (req, res, next) => {
  const client = req.client;
  try {
    await logOut(client);

    return res.status(200).json({
      message: "You are logged out.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setUserTelegramCredentials,
  sendCodeToPhoneNumber,
  sendMessage,
  signInTheUser,
  logOutTheUser,
  createSendTelegramButton,
};
