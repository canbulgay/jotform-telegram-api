const expect = require("chai").expect;
const sinon = require("sinon");
const Mongoose = require("mongoose");

const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");

const TelegramClientController = require("../src/controllers/TelegramClientController");
const TelegramClientService = require("../src/services/TelegramClientService");
const Client = require("../src/models/TelegramClient");
const TelegramButton = require("../src/models/TelegramButton");

describe("Telegram Client Controller Process", () => {
  describe("Save user telegram client credentials", () => {
    before(async () => {
      await Mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });

    it("should save user telegram client credentials", async () => {
      req = {
        body: {
          api_key: 123456,
          api_hash: "123456",
        },
      };

      await TelegramClientService.saveCredentials(
        req.body.api_key,
        req.body.api_hash
      );
      sinon.stub(Client, "findOne");

      const client = await Client.findOne({ api_key: req.body.api_key });
      expect(client).to.be.an("object");
      expect(client.api_key).to.equal(req.body.api_key);
      expect(client.api_hash).to.equal(req.body.api_hash);

      after(async () => {
        await Client.deleteMany({});
        await Mongoose.disconnect();
      });
    });
    it("should return error if user telegram client credentials already exists", async () => {});
  });
});
