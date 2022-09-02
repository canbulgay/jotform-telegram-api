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

/************************* Session Functions ******************************/

/************************* Message Functions ******************************/
const showNextQuestion = async (chatId, username, questionIndex) => {
  let session = getSession(username);
  let questions = getSessionQuestions(username);
  let submissions = getSessionSubmissions(username);

  if (questions?.length > 0) {
    let question;
    if (session.properties.currentQuestion === null) {
      question = questions[0];
      session.properties.currentQuestion = question;
    } else {
      question = session.properties.currentQuestion;
    }
    let index = questionIndex;
    let questionRequired = question.required === "Yes" ? "*" : "";

    let botQuestion = await bot.sendMessage(
      chatId,
      `${questionIndex})${questionRequired} ${question.text}`,
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(chatId, botQuestion.message_id, (message) => {
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
        index = index + 1;
        session.properties.questionIndex = index;
        questions.shift();
      }
      session.properties.currentQuestion = null;
      showNextQuestion(chatId, username, index);
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
  const information = `You can skip questions by typing /skip \nYou can back to previous question by typing /back \n\n '*' means that question is required you can't skip it. \n Do not use the /skip and /back commands to replying the question.`;
  bot.sendMessage(chatId, information);
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
          questionIndex: 1,
          currentQuestion: null,
        },
      });
    }
  }
  const questions = getSessionQuestions(username);
  const submissions = getSessionSubmissions(username);

  if (questions?.length > 0 && !submissions?.length > 0) {
    sendStartMessage(chatId);
  } else if (questions?.length > 0 && submissions?.length > 0) {
    sendContinueFormMessage(chatId);
  } else if (!questions?.length > 0 && submissions?.length > 0) {
    sendFormAlreadySubmittedMessage(chatId);
  } else {
    sendCantStartMessage(chatId);
  }
});

bot.onText(/\/begin/, (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  informationMessage(chatId);
  let questionIndex = getSession(username)?.properties.questionIndex;
  const questionFill = `You have ${
    getSessionQuestions(username)?.length
  } questions to fill.`;
  setTimeout(() => {
    bot.sendMessage(chatId, questionFill);
  }, 1000);
  setTimeout(() => {
    showNextQuestion(chatId, username, questionIndex);
  }, 2000);
});

bot.onText(/\/again/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  if (getSession(username)) {
    bot.sendMessage(chatId, "Form started over.");
    let session = getSession(username);
    session.properties.questionIndex = 1;
    session.properties.currentQuestion = null;
    session.properties.submissions = [];
    session.properties.questions = await getUsersQuestions(username);
    showNextQuestion(chatId, username, session.properties.questionIndex);
  }
});

bot.onText(/\/continue/, (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  let session = getSession(username);
  if (session) {
    let questionIndex = session.properties.questionIndex;
    if (
      getSessionQuestions(username)?.length > 0 &&
      getSessionSubmissions(username)?.length > 0
    ) {
      showNextQuestion(chatId, username, questionIndex);
    }
  }
});

bot.onText(/\/submit/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;

  let session = getSession(username);
  if (session) {
    const submissionId = await pushSubmissionsToJotform(
      session.properties.submissions,
      session.formId
    );
    bot.sendMessage(chatId, "Form submited.");
    session.properties.submissionId = submissionId;
  }
});

bot.onText(/\/skip/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  const session = getSession(username);
  const questions = getSessionQuestions(username);
  const submissions = getSessionSubmissions(username);

  if (compareQuestionIsRequired(questions[0])) {
    bot.sendMessage(chatId, "This question is required. You can't skip it.");
    showNextQuestion(chatId, username, session.properties.questionIndex);
  } else {
    session.properties.questionIndex++;
    const question = questions.shift();
    session.properties.currentQuestion = null;
    submissions.push({
      qid: question.qid,
      answer: "",
      type: question.type,
      required: question.required,
      text: question.text,
      username: username,
      validation: question.validation,
    });
    showNextQuestion(chatId, username, session.properties.questionIndex);
  }
});

bot.onText(/\/back/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.chat.username;
  const session = getSession(username);
  const questions = getSessionQuestions(username);
  const submissions = getSessionSubmissions(username);

  if (session?.properties?.questionIndex > 1) {
    session.properties.questionIndex--;
    const question = submissions.pop();
    questions.unshift(question);
    session.properties.currentQuestion = null;
    showNextQuestion(chatId, username, session.properties.questionIndex);
  } else {
    bot.sendMessage(chatId, "You can't go back anymore.");
    showNextQuestion(chatId, username, session.properties.questionIndex);
  }
}),
  //handling bot errors
  bot.on("polling_error", (err) => {
    console.log(err);
    bot.stopPolling();
  });

/************************* Bot Functions ******************************/

module.exports = bot;
