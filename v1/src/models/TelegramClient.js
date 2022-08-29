const Mongoose = require("mongoose");

const TelegramClientSchema = new Mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
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
    form_id: {
      type: String,
    },
    column_id: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("TelegramClient", TelegramClientSchema);
