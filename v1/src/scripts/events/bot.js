const TelegramBot = require("node-telegram-bot-api");

const Question = require("../../models/Question");
const {
  pushSubmissionsToJotform,
} = require("../utils/jotform/SubmissionHelper");

const token = "5432638025:AAEYYjO0L3WKLSQyDkhHdZ5WlO3pxry-mHU";
const bot = new TelegramBot(token, { polling: true });

const sessions = [];

/************************* Session Functions ******************************/
const getUsersQuestions = async (username) => {
  return await Question.find({ username: username });
};
const getSession = (username) => {
  return sessions.find((session) => session.username === username);
};

const getSessionQuestions = (username) => {
  const session = getSession(username);
  if (session) {
    return session.properties.questions;
  }
};

const getSessionSubmissions = (username) => {
  const session = getSession(username);
  if (session) {
    return session.properties.submissions;
  }
};

const getSessionFormSubmissionId = (username) => {
  const session = getSession(username);
  if (session) {
    return session.properties.submissionId;
  }
};

/************************* Session Functions ******************************/

/************************* Message Functions ******************************/
const showNextQuestion = async (chatId, username) => {
  if (getSessionQuestions(username)?.length > 0) {
    let question = getSessionQuestions(username).shift();

    let botQuestion = await bot.sendMessage(chatId, question.text, {
      reply_markup: {
        force_reply: true,
      },
    });
    bot.onReplyToMessage(chatId, botQuestion.message_id, (message) => {
      if (!compareAnswerAndValidation(message.text, question.validation)) {
        bot.sendMessage(chatId, "Please enter a valid answer.");
        getSessionQuestions(username).unshift(question);
      } else {
        getSessionSubmissions(username).push({
          qid: question.qid,
          answer: message.text,
          type: question.type,
        });
      }
      showNextQuestion(chatId, username);
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
/************************* Message Functions ******************************/

/************************* Messages ******************************/

const sendStartMessage = (chatId) => {
  const welcomeMessage = "Welcome to the jotform bot.";
  const description = "This bot is for filling the questions from Jotform.";
  const instructions = "Type or press /begin to start filling the questions.";
  const startMessage = `${welcomeMessage}\n\n${description}\n\n${instructions}`;
  bot.sendDocument(
    chatId,
    "https://cdn.discordapp.com/attachments/1011189838109757450/1012362776091557968/podo.gif"
  );
  bot.sendMessage(chatId, startMessage);
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
    "You have already submitted the form. Do you want to start over? \n If you want to start over, type or press /startover";

  bot.sendMessage(chatId, formAlreadySubmittedMessage);
};

const sendContinueFormMessage = (chatId) => {
  const continueFormMessage =
    "You have already started filling the form. Do you want to continue? \n If you want to continue, type or press /continue \n If you want to start over, type or press /startover";

  bot.sendMessage(chatId, continueFormMessage);
};

const askForSubmitOrStartOver = (chatId) => {
  console.log("Burdayım3");

  const submitOrStartOverMessage =
    "Do you want to submit the form or start over? \n If you want to submit, type or press /submit \n If you want to start over, type or press /startover";

  bot.sendMessage(chatId, submitOrStartOverMessage);
};

/************************* Messages ******************************/

/************************* Bot Functions ******************************/
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  if (!getSession(username)) {
    const questions = await getUsersQuestions(username);
    if (questions.length > 0) {
      sessions.push({
        username: username,
        formId: questions[0].form_id,
        properties: {
          questions: questions,
          submissions: [],
          submissionId: null,
        },
      });
    }
  }

  if (
    getSessionQuestions(username)?.length > 0 &&
    !getSessionSubmissions(username)?.length > 0
  ) {
    sendStartMessage(chatId);
  } else if (
    getSessionQuestions(username)?.length > 0 &&
    getSessionSubmissions(username)?.length > 0
  ) {
    sendContinueFormMessage(chatId);
  } else if (getSessionFormSubmissionId(username) !== null) {
    sendFormAlreadySubmittedMessage(chatId);
  } else {
    sendCantStartMessage(chatId);
  }
});

bot.onText(/\/begin/, (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  showNextQuestion(chatId, username);
});

bot.onText(/\/startover/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  if (getSession(username)) {
    bot.sendMessage(chatId, "Form started over.");
    let session = getSession(username);
    session.properties.submissions = [];
    session.properties.questions = await getUsersQuestions(username);
    showNextQuestion(chatId, username);
  }
});

bot.onText(/\/continue/, (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  if (
    getSessionQuestions(username)?.length > 0 &&
    getSessionSubmissions(username)?.length > 0
  ) {
    showNextQuestion(chatId, username);
  }
});

bot.onText(/\/submit/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  const session = getSession(username);
  const submissionId = await pushSubmissionsToJotform(
    session.properties.submissions,
    session.formId
  );
  bot.sendMessage(chatId, "Form submited.");
  session.properties.submissionId = submissionId;
});

//handling bot errors
bot.on("polling_error", (err) => {
  console.log(err);
  bot.stopPolling();
});

/************************* Bot Functions ******************************/

module.exports = bot;
