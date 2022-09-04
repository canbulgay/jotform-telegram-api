const Mongoose = require("mongoose");

const QuestionSchema = new Mongoose.Schema(
  {
    form_id: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Form",
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("Question", QuestionSchema);
