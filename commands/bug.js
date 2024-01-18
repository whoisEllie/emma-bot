const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

var apiKey = config.trelloAPIKey;
var oauthToken = config.trelloOauthKey;

var Trello = require("trello-node-api")(apiKey, oauthToken);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bug-report")
    .setDescription("Send a bug request directly to the trello board!")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The name of the trello card")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("A more detailed description of the bug you've found")
        .setRequired(false),
    ),
  async execute(interaction) {
    var data = {
      name: interaction.options.getString("title"),
      desc:
        interaction.options.getString("description") ??
        "No description provided",
      pos: "top",
      idList: "641207dd28d38b6f38c92cce", //REQUIRED
    };
    await Trello.card
      .create(data)
      .then(function (response) {
        console.log("response ", response);
        interaction.reply(
          interaction.options.getString("title") + " reported!",
        );
      })
      .catch(function (error) {
        console.log("error", error);
        interaction.reply("Error sending message, please try again.");
      });
  },
};
