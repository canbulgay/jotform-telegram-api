const express = require("express");
const helmet = require("helmet");

const loaders = require("./src/loaders");
const configs = require("./src/configs");
const events = require("./src/scripts/events");
const { TelegramClientRoutes } = require("./src/routes");

configs();
loaders();
events();
helmet();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  let status = error.statusCode || 500;
  let message = error.message || "Something went wrong";
  return res.status(status).json({ message: message });
});

const port = process.env.PORT || 8080;
app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  app.use("/api/telegram-client", TelegramClientRoutes);
});
