const Question = require("../../../models/Question");

const saveQuestionsToDB = (questions, formId, username) => {
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
        question.type !== "control_head" &&
        question.type !== "control_pagebreak" &&
        question.type !== "control_captcha" &&
        question.type !== "control_divider" &&
        question.type !== "control_signature" &&
        question.type !== "control_button"
    )
    .map((question) => {
      let newQuestion = new Question({
        form_id: formId,
        username: username,
        qid: question.qid,
        text: question.text,
        type: question.type,
        required: question.required,
        validation: question.validation,
      });
      newQuestion.save();
    });
  return;
};

const checkIfQuestionsNotExist = async (formId, username) => {
  const questions = await Question.find({
    form_id: formId,
    username: username,
  });
  if (questions.length > 0) {
    return false;
  }
  return true;
};

module.exports = {
  saveQuestionsToDB,
  checkIfQuestionsNotExist,
};
