const events = require("./events");
const bot = require("./bot");

module.exports = () => {
  events(), bot;
};
