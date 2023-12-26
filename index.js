const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Partials,
  GatewayIntentBits,
  Collection,
  Events,
} = require("discord.js");
const { ReactionRole } = require("discordjs-reaction-role");

// the config file contains two fields:
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

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

client.commands = new Collection();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property`,
    );
  }
}

const ReactionRoleClass = new ReactionRole(client, [
  {
    messageId: "1038879978307203174",
    roleId: "1038879877098651678",
    reaction: "‼️",
  },
  {
    messageId: "1038879978307203174",
    roleId: "1189001687629832193",
    reaction: "❓",
  },
]);

client.login(config.token);

client.on("ready", () => {
  console.log(`Watching message for reactions...`);
});
