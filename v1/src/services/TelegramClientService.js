const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");

const ClientModel = require("../models/TelegramClient");

// Save user's telegram credentials.
const saveCredentials = async (api_key, api_hash) => {
  if (typeof api_key === "string") {
    api_key = parseInt(api_key);
  }

  let clientModel = await ClientModel.findOne({ api_key: api_key });

  if (clientModel) throw new Error("Client is exists");

  const client = new TelegramClient(
    new StringSession(""),
    api_key,
    api_hash,
    {}
  );
  await client.connect();

  clientModel = new ClientModel({
    api_key: api_key,
    api_hash: api_hash,
    session_string: client.session.save(),
  });
  clientModel.save();

  await client.session.setDC(2, "149.154.167.91", 80);

  return clientModel._id;
};

// Send a code to user's phone.
const sendCode = async (phone_number, client, userToken) => {
  const clientModel = await ClientModel.findOne({ _id: userToken });
  if (!clientModel) throw new Error("Client not found");

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
  const clientModel = await ClientModel.findOne({ _id: userToken });
  if (!clientModel) throw new Error("Client not found");

  const result = await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: clientModel.phone_number,
      phoneCodeHash: phone_code_hash,
      phoneCode: phone_code,
    })
  );

  if (!(await client.isUserAuthorized())) throw new Error("Sign in failed");

  clientModel.first_name = result.user.firstName;
  clientModel.last_name = result.user.lastName;
  clientModel.username = result.user.username;
  clientModel.save();

  return clientModel;
};

// Send message to user.
const sendMessageToUser = async (username, message, bot_url, client) => {
  const messageWithBot = `${message}\n\n Jotform Bot ${bot_url}`;
  await client.sendMessage(username, {
    message: messageWithBot,
  });
  return;
};

// Log out the current user.
const logOutAndRemove = async (client, userToken) => {
  const clientModel = await ClientModel.findOneAndRemove({ _id: userToken });
  if (!clientModel) throw new Error("Client not found");
  await client.invoke(new Api.auth.LogOut({}));

  return;
};

module.exports = {
  saveCredentials,
  sendCode,
  signIn,
  sendMessageToUser,
  logOutAndRemove,
};
