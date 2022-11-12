const { SlashCommandBuilder } =   require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('help')
  .setDescription('Need help? Start here!'),
  async execute(interaction) {
    await interaction.reply("Before you ask for help, it's worth going through the documentation one more time and making sure that you're running the most up-to-date version of the plugin\n\nIf you're still having issues, check through the thread archive in #help, or search the discord for your issue, as there may already be a solution for it \n\nIf neither of these have worked, then feel free to ask for help in the #help channel!");
  },
};
