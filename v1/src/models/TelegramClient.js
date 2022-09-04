const Mongoose = require("mongoose");

const TelegramClientSchema = new Mongoose.Schema(
  {
    api_key: {
      type: Number,
      required: true,
      unique: true,
    },
    api_hash: {
      type: String,
      required: true,
      unique: true,
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
