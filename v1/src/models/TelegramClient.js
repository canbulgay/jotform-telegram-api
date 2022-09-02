const Mongoose = require("mongoose");

const TelegramClientSchema = new Mongoose.Schema(
  {
    api_key: {
      type: Number,
    },
    api_hash: {
      type: String,
    },
    session_string: {
      type: String,
      default: "",
    },
    phone_number: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    username: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("TelegramClient", TelegramClientSchema);
