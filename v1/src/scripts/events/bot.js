const TelegramBot = require("node-telegram-bot-api");

const Question = require("../../models/Question");
const Form = require("../../models/Form");
const {
  pushSubmissionsToJotform,
} = require("../utils/jotform/SubmissionHelper");

const token = "5742132834:AAHrr1DhYdNDqyCcblaDNi8L3WSXibp1Dlg";
const bot = new TelegramBot(token, { polling: true });

const sessions = [];

/************************* Session Functions ******************************/

const getSession = (username) => {
  return sessions.find((session) => session.username === username);
};

const getUserForms = async (username) => {
  const form = await Form.find({ assigned_to: username });
  return form;
};
// Returns the users active form questions
const getFormQuestions = async (formId) => {
  const questions = await Question.find({ form_id: formId });
  return questions;
};

/************************* Session Functions ******************************/

/************************* Message Functions ******************************/
const findSessionOrCreate = async (username, chatId) => {
  let session = getSession(username);
  if (!session) {
    const usersForms = await getUserForms(username);
    if (usersForms.length > 0) {
      let forms = [];
      for (let index = 0; index < usersForms.length; index++) {
        forms.push({
          form_id: usersForms[index]._id,
          title: usersForms[index].title,
          questions: await getFormQuestions(usersForms[index]._id, username),
          submissions: [],
          currentQuestion: null,
          questionIndex: 1,
          submissionId: null,
        });
      }
      sessions.push({
        username: username,
        activeFormId: null,
        forms: forms,
      });
      session = getSession(username);
    } else {
      sendCantStartMessage(chatId);
    }
  } else {
    return session;
  }
  return getSession(username);
};

const showNextQuestion = async (chatId, username, form) => {
  let questions = form.questions;
  let submissions = form.submissions;
  let index = form.questionIndex;

  if (questions?.length > 0) {
    let question;
    if (form.currentQuestion === null) {
      question = questions[0];
      form.currentQuestion = question;
    } else {
      question = form.currentQuestion;
    }

    let questionRequired = question.required === "Yes" ? "*" : "";

    let botQuestion = await bot.sendMessage(
      chatId,
      `${index})${questionRequired} ${question.text}`,
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(chatId, botQuestion.message_id, (message) => {
      if (message.text.includes("/skip") || message.text.includes("/back")) {
        return;
      }
      if (!compareAnswerAndValidation(message.text, question.validation)) {
        bot.sendMessage(chatId, "Please enter a valid answer.");
      } else {
        submissions.push({
          qid: question.qid,
          answer: message.text,
          type: question.type,
          required: question.required,
          text: question.text,
          validation: question.validation,
        });
        form.questionIndex = index + 1;
        questions.shift();
      }
      form.currentQuestion = null;
      showNextQuestion(chatId, username, form);
    });
  } else {
    askForSubmitOrStartOver(chatId);
  }
};

const compareAnswerAndValidation = (answer, validation) => {
  switch (validation) {
    case "Email":
      if (answer.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        return true;
      }
      return false;
    case "None":
      return true;
    default:
      break;
  }
};

const compareQuestionIsRequired = (question) => {
  if (question.required === "Yes") {
    return true;
  }
  return false;
};
/************************* Message Functions ******************************/

/************************* Messages ******************************/

const sendStartMessage = (chatId, formCount) => {
  const welcomeMessage = "Welcome to the jotform bot.";
  const formCountMessage = `You have ${formCount} forms assigned to you.`;
  const instructions = "Type or press /select to select a form to fill out.";
  const startMessage = `${formCountMessage}\n\n${instructions}`;
  setTimeout(() => {
    bot.sendDocument(
      chatId,
      "https://cdn.discordapp.com/attachments/1011189838109757450/1012362776091557968/podo.gif"
    );
  }, 1000);
  setTimeout(() => {
    bot.sendMessage(chatId, welcomeMessage);
  }, 2000);
  setTimeout(() => {
    bot.sendMessage(chatId, startMessage);
  }, 3000);
};

const sendStartFillingQuestionsMessage = (chatId, formTitle) => {
  const startFillingMessage = `You have selected the "${formTitle}".`;
  const instructions = "Type or press /begin to start filling out the form.";
  const startFillingQuestionsMessage = `${startFillingMessage}\n\n${instructions}`;
  bot.sendMessage(chatId, startFillingQuestionsMessage);
};

const sendCantStartMessage = (chatId) => {
  const cantStartMessage =
    "You can't start filling the questions. You have no questions to fill.";
  const askYourFormOwner = "Ask your form owner to add you to the form.";
  const endMessage = `${cantStartMessage}\n\n${askYourFormOwner}`;
  bot.sendMessage(chatId, endMessage);
};

const sendFormAlreadySubmittedMessage = (chatId) => {
  const formAlreadySubmittedMessage =
    "You have already submitted the form. Do you want to start over? \n If you want to start over, type or press /again";

  bot.sendMessage(chatId, formAlreadySubmittedMessage);
};

const sendContinueFormMessage = (chatId) => {
  const continueFormMessage =
    "You have already started filling the form. Do you want to continue? \n\n If you want to continue, type or press /continue \n If you want to start over, type or press /again";

  bot.sendMessage(chatId, continueFormMessage);
};

const askForSubmitOrStartOver = (chatId) => {
  const submitOrStartOverMessage =
    "Do you want to submit the form or start over? \n\n If you want to submit, type or press /submit \n If you want to start over, type or press /again";

  bot.sendMessage(chatId, submitOrStartOverMessage);
};

const informationMessage = (chatId) => {
  const information = `You can skip questions by typing /skip \nYou can back to previous question by typing /back \n\n '*' means that question is required you can't skip it.`;
  bot.sendMessage(chatId, information);
};

/************************* Messages ******************************/

/************************* Bot Functions ******************************/
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  const session = await findSessionOrCreate(username);
  if (session) {
    const formCount = session.forms.length;
    sendStartMessage(chatId, formCount);
  }
});

bot.onText(/\/select/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  const session = await getSession(username);
  if (session) {
    const forms = session.forms;
    if (forms.length > 0) {
      let formTitles = [];
      forms.forEach((form) => {
        formTitles.push({ text: form.title, callback_data: form.form_id });
      });

      bot.sendMessage(chatId, "Select a form to fill out.", {
        reply_markup: {
          inline_keyboard: [formTitles],
        },
      });

      bot.on("callback_query", (callbackQuery) => {
        const form_id = callbackQuery.data;
        const form_title = forms.find((form) => form.form_id === form_id).title;
        session.activeFormId = form_id;
        sendStartFillingQuestionsMessage(chatId, form_title);
        setTimeout(() => {
          bot.deleteMessage(chatId, callbackQuery.message.message_id);
        }, 2000);

        bot.removeListener("callback_query");
      });
    } else {
      sendCantStartMessage(chatId);
    }
  }
});

bot.onText(/\/begin/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  const session = await getSession(username);

  if (session) {
    const activeFormId = session.activeFormId;
    const form = session.forms.find((form) => form.form_id === activeFormId);
    console.log("Selected form => ", form);
    if (form) {
      let questionsCount = form.questions.length;
      let submissionsCount = form.submissions.length;
      if (questionsCount > 0 && !submissionsCount > 0) {
        informationMessage(chatId);
        const questionFill = `You have ${questionsCount} questions to fill.`;
        setTimeout(() => {
          bot.sendMessage(chatId, questionFill);
        }, 1000);
        setTimeout(() => {
          showNextQuestion(chatId, username, form);
        }, 2000);
      } else if (questionsCount > 0 && submissionsCount > 0) {
        sendContinueFormMessage(chatId);
      } else {
        sendFormAlreadySubmittedMessage(chatId);
      }
    }
  } else {
    sendCantStartMessage(chatId);
  }
});

bot.onText(/\/again/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  if (getSession(username)) {
    bot.sendMessage(chatId, "Form started over.");
    let session = getSession(username);
    const activeFormId = session.activeFormId;
    const form = session.forms.find((form) => form.form_id === activeFormId);
    form.questionIndex = 1;
    form.currentQuestion = null;
    form.submissions = [];
    form.questions = await getFormQuestions(activeFormId);
    showNextQuestion(chatId, username, form);
  }
});

bot.onText(/\/continue/, (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  let session = getSession(username);
  if (session) {
    const activeFormId = session.activeFormId;
    const form = session.forms.find((form) => form.form_id === activeFormId);
    if (form.questions.length > 0 && form.submissions.length > 0) {
      showNextQuestion(chatId, username, form);
    }
  }
});

bot.onText(/\/submit/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  let session = getSession(username);
  if (session) {
    const activeFormId = session.activeFormId;
    const form = session.forms.find((form) => form.form_id === activeFormId);
    const submissionId = await pushSubmissionsToJotform(
      form.submissions,
      activeFormId
    );
    bot.sendMessage(chatId, "Form submited.");
    form.submissionId = submissionId;
    form.activeFormId = null;
    form.questionIndex = 1;
  }
});

bot.onText(/\/skip/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  const session = getSession(username);
  if (session) {
    const activeFormId = session.activeFormId;
    const form = session.forms.find((form) => form.form_id === activeFormId);
    const questions = form.questions;
    const submissions = form.submissions;

    if (compareQuestionIsRequired(questions[0])) {
      bot.sendMessage(chatId, "This question is required. You can't skip it.");
    } else {
      form.questionIndex++;
      const question = questions.shift();
      form.currentQuestion = null;
      submissions.push({
        qid: question.qid,
        answer: "",
        type: question.type,
        required: question.required,
        text: question.text,
        username: username,
        validation: question.validation,
      });
    }
    showNextQuestion(chatId, username, form);
  }
});

bot.onText(/\/back/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  const session = getSession(username);
  if (session) {
    const activeFormId = session.activeFormId;
    const form = session.forms.find((form) => form.form_id === activeFormId);
    const questions = form.questions;
    const submissions = form.submissions;

    if (form.questionIndex > 1) {
      form.questionIndex--;
      const question = submissions.pop();
      questions.unshift(question);
      form.currentQuestion = null;
    } else {
      bot.sendMessage(chatId, "You can't go back anymore.");
    }
    showNextQuestion(chatId, username, form);
  }
}),
  //handling bot errors
  bot.on("polling_error", (err) => {
    console.log(err);
    bot.stopPolling();
  });
/************************* Bot Functions ******************************/

module.exports = bot;
