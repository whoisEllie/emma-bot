const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("docs")
    .setDescription("Replies with a link to the documentation!"),
  async execute(interaction) {
    await interaction.reply("https://emmadocs.dev");
  },
};
