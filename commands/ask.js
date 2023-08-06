const { Configuration, OpenAIApi } = require("openai");
const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRow,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const fs = require("node:fs");
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
var thread = null;

require.extensions[".txt"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};
var context = require("./context.txt");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask EMMA Bot for help with FPS Core, powered by GPT4!")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question you'd like to ask EMMA Bot")
        .setRequired(true),
    ),
  async execute(interaction) {
    let responses = 0;
    const max_responses = 2;

    if (
      !(
        interaction.channel.id == 1094360228922933338 ||
        interaction.channel.id == 1094362469436235777
      )
    ) {
      interaction.reply(
        "Please use the /ask command in the <#1094360228922933338> channel only.",
      );
      return;
    }

    const configuration = new Configuration({
      organization: config.OpenAIOrgID,
      apiKey: config.OpenAIKey,
    });

    const openai = new OpenAIApi(configuration);

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Keep generating!")
      .setStyle(ButtonStyle.Primary);

    const disabledNext = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Keep generating!")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const row = new ActionRowBuilder().addComponents(next);

    const disabledRow = new ActionRowBuilder().addComponents(disabledNext);

    const response = await interaction.deferReply({ ephemeral: false });

    var conversation = [
      { role: "system", content: context },
      { role: "user", content: interaction.options.getString("question") },
    ];

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        max_tokens: 368,
        messages: conversation,
      });

      var res = completion.data.choices[0].message;
      conversation.push({ role: "system", content: res.content });
      conversation.push({ role: "user", content: "continue" });

      const channel = interaction.channel;

      thread = await channel.threads.create({
        name:
          "RE: " +
          interaction.options.getString("question").substring(0, 90) +
          "...",
        autoArchiveDuration: 60,
        reason: "organization",
      });

      if (thread.joinable) {
        await thread.join();
      }

      if (thread) {
        thread.send(
          "**Question**: " +
            interaction.options.getString("question") +
            "\n**Answer**: " +
            res.content,
        );
      }

      interaction.editReply({
        content:
          "You can find your reply in the <#" +
          thread.id +
          "> thread! You have **" +
          (max_responses - responses) +
          "** generations remaining",
        components: [row],
      });
    } catch (error) {
      interaction.editReply("Something went wrong");
    }

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      //TODO: figure out this timing
      time: 3_600_000,
    });

    collector.on("collect", async (i) => {
      responses += 1;
      var res;
      interaction.editReply({ components: [disabledRow] });
      try {
        i.reply({ content: "Generating a new response!", ephemeral: true });

        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          max_tokens: 368,
          messages: conversation,
        });

        res = completion.data.choices[0].message;
        conversation.push({ role: "system", content: res.content });
        conversation.push({ role: "user", content: "continue" });
        thread.send(res.content);

        interaction.editReply({
          content:
            "You can find your reply in the <#" +
            thread.id +
            "> thread! You have **" +
            (max_responses - responses) +
            "** generations remaining",
          components: [responses >= max_responses ? disabledRow : row],
        });
      } catch (error) {
        console.log(error);
      }
    });
  },
};
