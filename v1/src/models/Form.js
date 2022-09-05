const Mongoose = require("mongoose");

const FormSchema = new Mongoose.Schema(
  {
    _id: {
      type: Mongoose.Schema.Types.String,
      required: true,
    },
    title: {
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
