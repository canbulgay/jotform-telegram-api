const TelegramClientService = require("../services/TelegramClientService");
const eventEmitter = require("../scripts/events/eventEmitter");

// TODO: Hiç bir fonksiyonun hata mesajı doğru bir şekilde gelmiyor. Program hata versede kullanıcıya basarılı cevabı dönüyor. Bunların düzeltilmesi lazım.

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
    await TelegramClientService.saveCredentials(api_key, api_hash);

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
 * @param {phone_number} req
 * @param {message} res
 * @param {error} next
 * @return json
 */

const sendCodeToPhoneNumber = async (req, res, next) => {
  const { phone_number } = req.body;

  try {
    await TelegramClientService.sendCode(phone_number);

    return res.status(200).json({
      message: "Your code sent to your phone.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a custom message to user by telegram client.
 * TODO: Form id burada alınıp bir event listener yardımıyla jotformdan veri cekmek icin kullanılabilir.
 *
 * @param {username , message} req
 * @param {message , payload} res
 * @param {*} next
 * @return json
 */
const sendMessage = async (req, res, next) => {
  const { username, message, form_id } = req.body;
  try {
    eventEmitter.emit("fetch:questions", form_id);

    await TelegramClientService.sendMessage(username, message);

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
 * @param {api_key} req
 * @param {message} res
 * @param {error} next
 * @return json
 */
const terminateSessions = async (req, res, next) => {
  try {
    await TelegramClientService.resetAuthorizations();

    return res.status(200).json({
      message: "All sessions were terminated.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign in the user via phone_code
 *
 * @param {phone_code} req
 * @param {message} res
 * @param {error} next
 * @return json
 */
const signInTheUser = async (req, res, next) => {
  const { phone_code } = req.body;
  try {
    await TelegramClientService.signIn(phone_code);

    return res.status(200).json({
      messsage: "You are logged in.",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logged out the authenticated user.
 *
 * @param {message} res
 * @param {error} next
 * @return json
 */

const logOutTheUser = async (req, res, next) => {
  try {
    await TelegramClientService.logOut();

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
