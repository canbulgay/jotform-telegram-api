const { submitFormSubmissions } = require("./axios");

// Push submissions to Jotform
const pushSubmissionsToJotform = async (submissions, formId) => {
  try {
    const submissionParams = prepareSubmissionsBeforePushing(submissions);
    const data = await submitFormSubmissions(formId, submissionParams);
    const submissionId = data?.content?.submissionID;

    return submissionId;
  } catch (err) {
    console.log(err);
  }
};

// Prepare submissions before pushing to Jotform
const prepareSubmissionsBeforePushing = (submissions) => {
  const submissionParams = new URLSearchParams();

  submissions.forEach((submission) => {
    switch (submission.type) {
      case "control_fullname":
        const fullName = submission.answer ?? submission.answer.split(" ");
        if (fullName.length == 2) {
          submissionParams.append(
            `submission[${submission.qid}_first]`,
            fullName[0]
          );
          submissionParams.append(
            `submission[${submission.qid}_last]`,
            fullName[1]
          );
        }
        break;
      case "control_phone":
        if (!submission.answer.startsWith("9") && submission.answer !== "") {
          submission.answer = "9" + submission.answer;
        }
        const country = submission.answer.substring(0, 2);
        const area = submission.answer.substring(2, 5);
        const phone = submission.answer.substring(5);
        submissionParams.append(
          `submission[${submission.qid}_country]`,
          country
        );
        submissionParams.append(`submission[${submission.qid}_area]`, area);
        submissionParams.append(`submission[${submission.qid}_phone]`, phone);

      default:
        submissionParams.append(
          `submission[${submission.qid}]`,
          submission.answer
        );
        break;
    }
  });

  return submissionParams;
};

module.exports = {
  pushSubmissionsToJotform,
};
