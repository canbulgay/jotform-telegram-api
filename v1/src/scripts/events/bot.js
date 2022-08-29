const TelegramBot = require("node-telegram-bot-api");

const Question = require("../../models/Question");

const token = "5432638025:AAEYYjO0L3WKLSQyDkhHdZ5WlO3pxry-mHU";

const bot = new TelegramBot(token, { polling: true });

let questions = [];
let questionsLength;
let userCanStart;
let questionIndex;

// TODO: Sorular user'a göre çekiliyor. Form id ve user id 'nin birlikte çekilmesi lazım. Yada öncesinde kullanıcıya dolduracagı formların sorulması lazım.
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let username = msg.from.username;
  questions = await getUsersQuestions(username);

  if (questions.length > 0) {
    questionsLength = questions.length;
    questionIndex = 1;
    userCanStart = true;
    sendStartMessage(chatId);
  } else {
    userCanStart = false;
    sendCantStartMessage(chatId);
  }
});

bot.onText(/\/begin/, async (msg) => {
  const chatId = msg.chat.id;
  if (userCanStart) {
    await showNextQuestion(chatId);
  } else {
    sendCantStartMessage(chatId);
  }
});

const sendStartMessage = (chatId) => {
  const welcomeMessage = "Welcome to the jotform bot.";
  const description = "This bot is for filling the questions from Jotform.";
  const instructions = "Type or press /begin to start filling the questions.";
  const startMessage = `${welcomeMessage}\n\n${description}\n\n${instructions}`;
  //Send podo.gif in animations folder invalid file HTTP URL specified: URL host is empty
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

const getUsersQuestions = async (username) => {
  return await Question.find({ username: username });
};

let questionIndex = 1;
const showNextQuestion = async (chatId) => {
  if (questions.length > 0) {
    let question = questions.shift();

    let botQuestion = await bot.sendMessage(
      chatId,
      `(${questionIndex} / ${questionsLength}) ` + question.text,
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );
    bot.onReplyToMessage(chatId, botQuestion.message_id, (message) => {
      questionIndex = questionIndex + 1;
      if (!compareAnswerAndValidation(message.text, question.validation)) {
        questionIndex = questionIndex - 1;
        bot.sendMessage(chatId, "Please enter a valid answer.");
        questions.unshift(question);
      }
      showNextQuestion(chatId);
    });
  } else {
    askForSubmit(chatId);
  }
};

// Ask user for submit form or start over the form
const askForSubmit = (chatId) => {
  bot.sendMessage(chatId, "Do you want to submit the form?", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Submit Form",
            callback_data: "submit",
          },
          {
            text: "Start Over",
            callback_data: "startOver",
          },
        ],
      ],
    },
  });
};

//
bot.on("callback_query", async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  username = msg.chat.username;

  switch (action) {
    case "submit":
      bot.sendMessage(chatId, "Form submitted.");
      break;
    case "startOver":
      bot.sendMessage(chatId, "Form started over.");
      questions = await getUsersQuestions(username);
      questionsLength = questions.length;
    questionIndex = 1;
      userCanStart = true;

      await showNextQuestion(chatId);
      break;
    default:
      bot.sendMessage(chatId, "Please select an option.");
      await askForSubmit(chatId);
      break;
  }
});

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

module.exports = bot;
