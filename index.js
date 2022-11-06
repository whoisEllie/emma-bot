const fs = require('fs');
const { Client, Partials, GatewayIntentBits, version } = require('discord.js');
const { ReactionRole } = require("discordjs-reaction-role");

// the config file contains two fields:
//   channel - name of the roles channel
//   roles   - mapping between reaction and role
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// the client is created with the partial message option to capture events for uncached messages
// if this options is not set, the bot may not be aware of the message that it should be watching
const client = new Client({
  partials: [Partials.Message, Partials.Reaction],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});
const ReactionRoleClass = new ReactionRole(client, [
  {messageId: "1038879978307203174", roleId: "1038879877098651678", reaction: "‼️"}
])

client.login(config.token);

client.on("ready", () => {
  console.log(`Watching message for reactions...`)
});
