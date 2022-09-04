const axios = require("axios");

const jotformToken = "088669390670debab69ffc56927e0801";

const getFormQuestions = async (formId) => {
  const form = await axios.get(
    `https://api.jotform.com/form/${formId}/questions?apiKey=${jotformToken}`
  );

  if (!form) throw new Error("Form not found");
  return form;
};

const submitFormSubmissions = async (formId, submissions) => {
  const result = await axios.post(
    `https://api.jotform.com/form/${formId}/submissions?apiKey=${jotformToken}`,
    submissions
  );
  if (!result) throw new Error("Cannot submit the form");
  console.log(result.data);
  return result.data;
};

module.exports = {
  getFormQuestions,
  submitFormSubmissions,
};
