const eventEmitter = require("./eventEmitter");
const { getFormQuestions } = require("../utils/jotform/axios");
const { saveQuestionsToDB } = require("../utils/jotform/QuestionHelper");

module.exports = () => {
  eventEmitter.on("fetch:questions", async (formId, username) => {
    try {
      const response = await getFormQuestions(formId);
      const questions = response.data?.content;
      const result = await saveQuestionsToDB(questions, formId, username);
      if (result) {
        console.log("Questions saved to DB");
      }
      return;
    } catch (error) {
      console.log(error);
    }
  });
};
