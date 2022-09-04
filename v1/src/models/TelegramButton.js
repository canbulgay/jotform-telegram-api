const Mongoose = require("mongoose");

const TelegramButtonSchema = new Mongoose.Schema(
  {
    client_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "TelegramClient",
    },
    form_id: {
      type: String,
      required: true,
    },
    column_id: {
      type: String,
      required: true,
    },
    sheet_id: {
      type: String,
      required: true,
    },
    bot_url: {
      type: String,
      default: "t.me/PodoFormBot",
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("TelegramButton", TelegramButtonSchema);
