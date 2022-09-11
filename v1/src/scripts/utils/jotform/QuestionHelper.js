const Question = require("../../../models/Question");
const Form = require("../../../models/Form");

const saveQuestionsToDB = async (questions, formId, username) => {
  const form = await checkIsFormExist(formId, username);

  const incomingQuestions = Object.keys(questions)
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
    );

  const savedQuestions = await Question.find({ form_id: form._id });
  if (savedQuestions.length > 0) {

    const isSame = incomingQuestions.every((question) => {
      return savedQuestions.some((q) => {
        return q.qid === question.qid;
      });
    });
    if (!isSame) {
      await Question.deleteMany({ form_id: form._id });

      incomingQuestions.forEach((question) => {
        if(question.type === "control_head"){
          form.title = question.text;
          return;
        }
        let newQuestion = new Question({
          form_id: form._id,
          qid: question.qid,
          text: question.text,
          type: question.type,
          required: question.required,
          validation: question.validation,
        });
        newQuestion.save();
        form.questions.push(newQuestion);
      });
    }else {
      incomingQuestions.forEach((question) => {
        Question.findOneAndUpdate(
          { qid: question.qid },
          {
            text: question.text,
            type: question.type,
            required: question.required,
            validation: question.validation,
          }
        );
      });
    }
  }else {
    incomingQuestions.forEach((question) => {
      if(question.type === "control_head"){
        form.title = question.text;
        return;
      }
      let newQuestion = new Question({
        form_id: form._id,
        qid: question.qid,
        text: question.text,
        type: question.type,
        required: question.required,
        validation: question.validation,
      });
      newQuestion.save();
      form.questions.push(newQuestion);
    });
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
