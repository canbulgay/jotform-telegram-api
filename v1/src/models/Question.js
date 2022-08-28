const Mongoose = require("mongoose");

const QuestionSchema = new Mongoose.Schema(
  {
    form_id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    qid: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    type: {
      type: String,
    },
    required: {
      type: String,
    },
    validation: {
      type: String,
      default: "None",
    },
    submission: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("Question", QuestionSchema);
