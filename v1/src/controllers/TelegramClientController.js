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
 * @param {api_key , api_hash} req
 * @param {message} res
 * @param {error} next
 * @returns
 */
const setUserTelegramCredentials = async (req, res, next) => {
  const { api_key, api_hash } = req.body;

  try {
    const userToken = await saveCredentials(api_key, api_hash);

    return res.status(201).json({
      message: "Your credentials has been saved.",
      userToken: userToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sent a code to user's phone.
 *
 * @param {phone_number} req
 * @param {client , userToken} req
 * @param {message} res
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
    next(error);
  }
};

/**
 * Send a custom message to user by telegram client.
 *
 * @param {username , message , form_id} req
 * @param {client } req
 * @param {message , payload} res
 * @param {*} next
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
    next(error);
  }
};

/**
 * Sign in the user via phone_code and phone_code_hash
 *
 * @param {phone_code , phone_code_hash} req
 * @param {client , userToken} req
 * @param {message} res
 * @param {error} next
 * @return json
 */
const signInTheUser = async (req, res, next) => {
  const { phone_code, phone_code_hash } = req.body;
  const client = req.client;
  const userToken = req.userToken;

  try {
    const result = await signIn(phone_code, phone_code_hash, client, userToken);

    if (result) {
      return res.status(200).json({
        messsage: "You are logged in.",
      });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Create send telegram button.
 *
 * @param {form_id , message , sheet_id , column_id } req
 * @param {message} res
 * @param {error} next
 * @return json
 */
const createSendTelegramButton = async (req, res, next) => {
  const { form_id, message, sheet_id, column_id } = req.body;
  const userToken = req.userToken;

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
 * Logged out the authenticated user.
 *
 * @param {client} req
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
