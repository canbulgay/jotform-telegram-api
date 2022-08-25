const axios = require("axios");

const jotformToken = "088669390670debab69ffc56927e0801";

const getFormQuestions = (formId) => {
  return axios.get(
    `https://api.jotform.com/form/${formId}/questions?apiKey=${jotformToken}`
  );
};

const submitFormSubmissions = (formId, submissions) => {
  return axios.post(
    `https://api.jotform.com/form/${formId}/submission?apiKey=${jotformToken}`,
    submissions
  );
};
module.exports = {
  getFormQuestions,
  submitFormSubmissions,
};
