const { SlashCommandBuilder } =   require('discord.js');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var apiKey = config.trelloAPIKey;
var oauthToken = config.trelloOauthKey;


var Trello = require('trello-node-api')(apiKey, oauthToken);

module.exports = {
  data: new SlashCommandBuilder()
   .setName('suggest')
   .setDescription('Post a suggestion and send it directly to the trello board!')
   .addStringOption(option =>
      option
         .setName('title')
         .setDescription("The name of the trello card")
         .setRequired(true))
   .addStringOption(option =>
      option
         .setName('description')
         .setDescription("A more detailed description of your suggestion")
         .setRequired(false)),
  async execute(interaction) {
     var data = {
        name: interaction.options.getString('title'),
        desc: interaction.options.getString('description') ?? "No description provided",
        pos: 'top',
        idList: '63f9f24362a88d61e9bc3f9a' //REQUIRED
    };
    await Trello.card.create(data).then(function (response) {
      console.log('response ', response);
      interaction.reply(interaction.options.getString('title') + ' added!');
    }).catch(function (error) {
       console.log('error', error);
       interaction.reply('Error sending message, please try again.');
    });
  },
};
