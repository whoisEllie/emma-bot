const PocketBase = require("pocketbase/cjs");
const { SlashCommandBuilder, InteractionResponse } = require("discord.js");
const fs = require("node:fs");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const pb = new PocketBase("http://38.242.137.81:8090");
const pbUser = config.pbAdminEmail;
const pbPass = config.pbAdminPass;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("thank")
    .setDescription("Thanks someoone who helped you out!")

    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to thank!")
        .setRequired(true),
    ),

  async execute(interaction) {
    var discordUser = interaction.options.getMember("user");

    if (interaction.member.id == discordUser.id) {
      interaction.reply("Oops! You can't thank yourself!");
      return;
    }

    await pb.admins.authWithPassword(pbUser, pbPass);

    let user;

    try {
      user = await pb
        .collection("users")
        .getFirstListItem(`userid=${discordUser.user.id}`);
    } catch (error) {
      if (error.status === 404) {
        const data = {
          userid: discordUser.user.id,
          username: discordUser.user.username,
        };

        user = await pb.collection("users").create(data);
      }
    }

    try {
      const data = {
        karma: user.karma + 1,
      };

      await pb.collection("users").update(user.id, data);

      config.roles.forEach((role) => {
        if (
          data.karma >= role.cost &&
          !discordUser.roles.cache.has(role.roleid)
        ) {
          discordUser.roles.add(role.roleid);
          interaction.reply(
            `You thanked ${discordUser.user.username}! They are now a ${role.rolename}!`,
          );
        }
      });

      interaction.reply(`You thanked ${discordUser.user.username}!`);
    } catch (error) {
      interaction.reply("Something went wrong. Please try again later.");
    }

    pb.authStore.clear();
  },
};
