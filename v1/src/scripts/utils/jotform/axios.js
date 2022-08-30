const axios = require("axios");

const jotformToken = "088669390670debab69ffc56927e0801";

const getFormQuestions = (formId) => async (_req, _res, next) => {
  try {
    return await axios.get(
      `https://api.jotform.com/form/${formId}/questions?apiKey=${jotformToken}`
    );
  } catch (error) {
    next(error);
  }
};

const submitFormSubmissions = async (formId, submissions) => {
  try {
    const result = await axios.post(
      `https://api.jotform.com/form/${formId}/submissions?apiKey=${jotformToken}`,
      submissions
    );
    console.log(result.data);
    return result.data;
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getFormQuestions,
  submitFormSubmissions,
};
