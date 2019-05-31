const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "postgres://postgres:secret@localhost:5432/postgres",
  { define: { timestamps: true } }
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const messagesTable = sequelize.define(
  "messages",
  {
    sender: Sequelize.TEXT,
    body: Sequelize.TEXT,
  },
  {
    tableName: "messages"
  }
);

messagesTable.sync({force: true}).then(function () {
  // Table created
  return messagesTable.create({
    sender: 'David',
    body: 'It works!',
    time: Sequelize.NOW
  });
});

//dispatched message from server to client's redux store
function emitMessages() {
  const action = {
    type: "MESSAGES",
    payload: messages
  };
  //send action to all the clients
  io.emit("action", action);
}

app.post("/message", (req, res) => {
  const { message } = req.body;
  messagesTable.create(message).then(message => res.status(201).json(message))
  messages.push(message);
  emitMessages();
  res.send(message);
});

// app.post("/movies", function(req, res) {
//   Movie.create(req.body)
//     .then(movie => res.status(201).json(movie))

app.get("/hello", (req, res) => {
  return res.send("hello world");
});

function onListen() {
  console.log("Hello from port 4000!");
}
const server = app.listen(4000, onListen);
const io = socketIo.listen(server);
const messages = ["goodbye"];
io.on("connection", client => {
  console.log("client.id test", client.id);
  emitMessages();
  client.on("disconnect", () => console.log("disconnect test:", client.id));
});
