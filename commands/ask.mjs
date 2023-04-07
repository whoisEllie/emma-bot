import { Configuration, OpenAIApi } from 'openai';
const { SlashCommandBuilder } =   require('discord.js');
const fs = require('node:fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
var context = require("./context.txt");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask EMMA Bot for help with FPS Core, powered by GPT4!')
  .addStringOption(option =>
    option
      .setName('Question')
      .setDescription("The question you'd like to ask EMMA Bot")
      .setRequired(true)),
  async execute(interaction) {

    const configuration = new Configuration({
      organization: config.OpenAIOrgID,
      apiKey: config.OpenAIKey
    });

    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      max_tokens: 384,
      messages: [
        {role: "system", content: context},
        {role: "user", content: interaction.options.getString('Question')}
      ]
    })

    await interaction.reply(completion.data.choices[0].message);
  },
};
