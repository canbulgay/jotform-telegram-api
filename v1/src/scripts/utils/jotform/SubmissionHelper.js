const { submitFormSubmissions } = require("./axios");

const pushSubmissionsToJotform = async (submissions, formId) => {
  const submissionParams = prepareSubmissionsBeforePushing(submissions);
  const data = await submitFormSubmissions(formId, submissionParams);

  const submissionId = data.content.submissionID;;
  return submissionId;
};

const prepareSubmissionsBeforePushing = (submissions) => {
  const submissionParams = new URLSearchParams();
  submissions.forEach((submission) => {
    if (submission.type === "control_fullname") {
      const fullName = submission.answer.split(" ");
      if (fullName.length > 1) {
        submissionParams.append(
          `submission[${submission.qid}_first]`,
          fullName[0]
        );
        submissionParams.append(
          `submission[${submission.qid}_last]`,
          fullName[1]
        );
      }
    } else {
      submissionParams.append(
        `submission[${submission.qid}]`,
        submission.answer
      );
    }
  });

  return submissionParams;
};

module.exports = {
  pushSubmissionsToJotform,
};
