const { submitFormSubmissions } = require("./axios");

const pushSubmissionsToJotform = async (submissions, formId) => {
  const submissionParams = prepareSubmissionsBeforePushing(submissions);
  const data = await submitFormSubmissions(formId, submissionParams);

  const submissionId = data.content.submissionID;
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
    } else if (submission.type === "control_phone") {
      if (!submission.answer.startsWith("9")) {
        submission.answer = "9" + submission.answer;
      }
      const country = submission.answer.substring(0, 2);
      const area = submission.answer.substring(2, 5);
      const phone = submission.answer.substring(5);
      submissionParams.append(`submission[${submission.qid}_country]`, country);
      submissionParams.append(`submission[${submission.qid}_area]`, area);
      submissionParams.append(`submission[${submission.qid}_phone]`, phone);
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
