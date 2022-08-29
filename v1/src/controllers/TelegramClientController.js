const {
  saveCredentials,
  sendCode,
  signIn,
  sendMessageToUser,
  resetAuthorizations,
  logOut,
} = require("../services/TelegramClientService");
const eventEmitter = require("../scripts/events/eventEmitter");

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
    // await TelegramClientService.saveCredentials(api_key, api_hash);
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
  const { username, message, form_id } = req.body;
  const client = req.client;

  try {
    await sendMessageToUser(username, message, client);
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
 * Terminates all user's authorized sessions except for the current one.
 *
 * @param {client } req
 * @param {message} res
 * @param {error} next
 * @return json
 */
const terminateSessions = async (req, res, next) => {
  const client = req.client;
  try {
    await resetAuthorizations(client);

    return res.status(200).json({
      message: "All sessions were terminated.",
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
  terminateSessions,
  signInTheUser,
  logOutTheUser,
};
