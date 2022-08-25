const eventEmitter = require("./eventEmitter");
const { getFormQuestions } = require("../utils/jotform/axios");
const {
  saveQuestionsToDB,
  checkIfQuestionsExist,
} = require("../utils/jotform/QuestionHelper");

module.exports = () => {
  eventEmitter.on("fetch:questions", async (formId) => {
    try {
      if (await checkIfQuestionsExist(formId)) {
        const response = await getFormQuestions(formId);
        const questions = response.data?.content;
        await saveQuestionsToDB(questions, formId);
      }
      return;
    } catch (error) {
      console.log(error);
    }
  });
};
