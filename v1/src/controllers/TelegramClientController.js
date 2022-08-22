const TelegramUser = require("../models/TelegramUser");
const TelegramClient = require("../scripts/utils/TelegramClient");

// TODO: Hiç bir fonksiyonun hata mesajı doğru bir şekilde gelmiyor. Program hata versede kullanıcıya basarılı cevabı dönüyor. Bunların düzeltilmesi lazım.
// TODO: Api_key statik olarak giriliyor, frontendde cookiye konulabilir cookie üzerindne değer çekilebilir.

/**
 * Create a new telegram user via client credentials.
 *
 * @param {api_key , api_hash , phone_number} req
 * @param {message, user} res
 * @param {error} next
 * @returns
 */
const getUserTelegramCredentials = async (req, res, next) => {
  const { api_key, api_hash } = req.body;

  try {
    const user = await TelegramUser.create({
      api_key: api_key,
      api_hash: api_hash,
    });

    return res.status(201).json({
      message: "Your telegram credentials were saved successfully",
      user: {
        api_key: user.api_key,
        api_hash: user.api_hash,
      },
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
    const user = await TelegramUser.findOne({ api_key: 14961319 });
    const client = new TelegramClient(user);
    await client.sendCode(phone_number);

    return res.status(200).json({
      message: "Your code was sent successfully to your phone",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getUserTelegramCredentials,
  sendCodeToPhoneNumber,
};
