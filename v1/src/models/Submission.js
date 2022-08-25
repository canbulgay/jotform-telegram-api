const Mongoose = require("mongoose");

const SubmissionSchema = new Mongoose.Schema(
  {
    form_id: {
      type: String,
      required: true,
    },
    telegram_username: {
      type: String,
    },
    submission_id: {
      type: String,
    },
    qid: {
      type: String,
      required: true,
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

module.exports = Mongoose.model("Submission", SubmissionSchema);
