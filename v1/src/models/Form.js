const Mongoose = require("mongoose");

const FormSchema = new Mongoose.Schema(
  {
    form_id: {
      type: String,
      required: true,
    },
    form_title: {
      type: String,
    },
    assigned_to: [
      {
        type: String,
      },
    ],
    questions: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = Mongoose.model("Form", FormSchema);
