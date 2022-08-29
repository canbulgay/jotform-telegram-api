const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { v4: uuidv4 } = require("uuid");

const ClientModel = require("../models/TelegramClient");

// Save user's telegram credentials.
const saveCredentials = async (api_key, api_hash) => {
  if (typeof api_key === "string") {
    api_key = parseInt(api_key);
  }
  const client = new TelegramClient(
    new StringSession(""),
    api_key,
    api_hash,
    {}
  );
  await client.connect();

  const clientModel = new ClientModel({
    api_key: api_key,
    api_hash: api_hash,
    userId: createRandomToken(),
    session_string: client.session.save(),
  });
  clientModel.save();
  await client.session.setDC(2, "149.154.167.91", 80);

  return clientModel.userId;
};

// Create random token for user.
const createRandomToken = () => {
  return uuidv4().replace(/-/g, "");
};

// Send a code to user's phone.
const sendCode = async (phone_number, client, userToken) => {
  const clientModel = await ClientModel.findOne({ userId: userToken });
  clientModel.phone_number = phone_number;
  clientModel.save();
  const result = await client.sendCode(
    {
      apiId: clientModel.api_key,
      apiHash: clientModel.api_hash,
    },
    phone_number
  );

  return result.phoneCodeHash;
};

// Sign in user with phone code.
const signIn = async (phone_code, phone_code_hash, client, userToken) => {
  const clientModel = await ClientModel.findOne({ userId: userToken });

  await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: clientModel.phone_number,
      phoneCodeHash: phone_code_hash,
      phoneCode: phone_code,
    })
  );
  if (await client.isUserAuthorized()) {
    return true;
  }
  return false;
};

// Send message to user.
const sendMessageToUser = async (username, message, client) => {
  await client.sendMessage(username, { message: message });
  return;
};

//Reset autherizations except this one.
const resetAuthorizations = async (client) => {
  await client.invoke(new Api.auth.ResetAuthorizations({}));
  return;
};

// Log out the current user.
const logOut = async (client) => {
  await client.invoke(new Api.auth.LogOut({}));
  return;
};

module.exports = {
  saveCredentials,
  sendCode,
  signIn,
  sendMessageToUser,
  resetAuthorizations,
  logOut,
};
