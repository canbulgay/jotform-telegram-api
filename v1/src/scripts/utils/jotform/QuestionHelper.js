const Question = require("../../../models/Question");
const Form = require("../../../models/Form");

// TODO: Aynı form tekrar gönderildiğinde tekrar questionları db ye kaydetmemesi lazım.
const saveQuestionsToDB = async (questions, formId, username) => {
  const form = await checkIsFormExist(formId, username);

  Object.keys(questions)
    .reduce((acc, key) => {
      const temp = {
        qid: questions[key].qid,
        text: questions[key].text,
        type: questions[key].type,
        required: questions[key].required || "None",
        validation: questions[key]?.validation || "None",
      };
      acc.push(temp);
      return acc;
    }, [])
    .filter(
      (question) =>
        question.type !== "control_pagebreak" &&
        question.type !== "control_captcha" &&
        question.type !== "control_divider" &&
        question.type !== "control_signature" &&
        question.type !== "control_button"
    )
    .map(async (question) => {
      if (question.type === "control_head") {
        form.title = question.text;
      } else {
        Question.create({
          form_id: form._id,
          qid: question.qid,
          text: question.text,
          type: question.type,
          required: question.required,
          validation: question.validation,
        });
      }
    });

  const newQuestions = await Question.find({ form_id: form._id });
  
  if (form.questions.length === 0) {
    form.questions.push(...newQuestions);
  }else if (form.questions.length !== newQuestions.length) {
    form.questions = [];
    form.questions.push(...newQuestions);
  }
  return form.save();
};

const checkIsFormExist = async (formId, username) => {
  let form = await Form.findOne({ _id: formId });
  if (form) {
    if (!form.assigned_to.includes(username)) {
      form.assigned_to.push(username);
      await form.save();
    }
  } else {
    form = new Form({
      _id: formId,
      assigned_to: [username],
    });
    await form.save();
  }
  return form;
};

module.exports = {
  saveQuestionsToDB,
};
