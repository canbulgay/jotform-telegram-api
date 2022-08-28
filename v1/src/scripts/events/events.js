const eventEmitter = require("./eventEmitter");
const { getFormQuestions } = require("../utils/jotform/axios");
const {
  saveQuestionsToDB,
  checkIfQuestionsNotExist,
} = require("../utils/jotform/QuestionHelper");

module.exports = () => {
  eventEmitter.on("fetch:questions", async (formId, username) => {
    try {
      if (await checkIfQuestionsNotExist(formId, username)) {
        const response = await getFormQuestions(formId);
        const questions = response.data?.content;
        await saveQuestionsToDB(questions, formId, username);
      }
      return;
    } catch (error) {
      console.log(error);
    }
  });
};
