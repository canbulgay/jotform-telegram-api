const Mongoose = require("mongoose");

const TelegramUserSchema = new Mongoose.Schema(
  {
    api_key: { type: Number, required: true },
    api_hash: { type: String, required: true },
    phone_number: String,
    session: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("TelegramUser", TelegramUserSchema);
