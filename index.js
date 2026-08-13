const {

  Client,

  GatewayIntentBits,

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle,

  StringSelectMenuBuilder,

  ModalBuilder,

  TextInputBuilder,

  TextInputStyle

} = require("discord.js");

const client = new Client({

  intents: [GatewayIntentBits.Guilds]

});

// 25マス

const cells = Array.from({ length: 25 }, () => ({

  name: "",

  color: ""

}));

// 色

const styles = {

  red: ButtonStyle.Danger,

  green: ButtonStyle.Success,

  blue: ButtonStyle.Primary,

  orange: ButtonStyle.Secondary

};

const emojis = {

  red: "🔴",

  green: "🟢",

  blue: "🔵",

  orange: "🟠"

};

// 盤面

function board() {

  const rows = [];

  for (let row = 0; row < 5; row++) {

    const actionRow = new ActionRowBuilder();

    for (let col = 0; col < 5; col++) {

      const i = row * 5 + col;

      const cell = cells[i];

      const button = new ButtonBuilder()

        .setCustomId(`cell-${i}`)

        .setStyle(

          cell.color

            ? styles[cell.color]

            : ButtonStyle.Secondary

        );

      // マス内には名前・数字を出さない

      if (cell.color) {

        button.setEmoji(emojis[cell.color]);

      } else {

        button.setLabel("・");

      }

      actionRow.addComponents(button);

    }

    rows.push(actionRow);

  }

  return rows;

}

// 名前一覧

function names() {

  const list = [];

  for (const cell of cells) {

    if (cell.name && cell.color) {

      list.push(

        `${emojis[cell.color]} ${cell.name}`

      );

    }

  }

  if (list.length === 0) {

    return "現在の配置：なし";

  }

  return "現在の配置\n" + list.join("\n");

}

// 最新の盤面を更新

async function updateBoard(channel) {

  const messages = await channel.messages.fetch({

    limit: 20

  });

  const message = messages.find(m =>

    m.author.id === client.user.id &&

    m.components.length === 5

  );

  if (!message) return;

  await message.edit({

    content:

      "マスをタップしてください\n\n" +

      names(),

    components: board()

  });

}

// 起動

client.once("ready", async () => {

  console.log(

    `ログイン成功: ${client.user.tag}`

  );

  await client.application.commands.set([

    {

      name: "配置",

      description: "5×5の配置ボード"

    }

  ]);

});

// 操作

client.on("interactionCreate", async interaction => {

  try {

    // /配置

    if (interaction.isChatInputCommand()) {

      if (interaction.commandName !== "配置") return;

      await interaction.reply({

        content:

          "マスをタップしてください\n\n" +

          names(),

        components: board()

      });

      return;

    }

    // マスをタップ

    if (interaction.isButton()) {

      if (!interaction.customId.startsWith("cell-")) {

        return;

      }

      const index =

        interaction.customId.split("-")[1];

      const menu =

        new StringSelectMenuBuilder()

          .setCustomId(`color-${index}`)

          .setPlaceholder("色を選ぶ")

          .addOptions([

            {

              label: "赤",

              value: "red",

              emoji: "🔴"

            },

            {

              label: "緑",

              value: "green",

              emoji: "🟢"

            },

            {

              label: "青",

              value: "blue",

              emoji: "🔵"

            },

            {

              label: "オレンジ",

              value: "orange",

              emoji: "🟠"

            },

            {

              label: "解除",

              value: "clear",

              emoji: "⚪"

            }

          ]);

      await interaction.reply({

        content: "色を選んでください",

        components: [

          new ActionRowBuilder()

            .addComponents(menu)

        ],

        ephemeral: true

      });

      return;

    }

    // 色選択

    if (interaction.isStringSelectMenu()) {

      if (!interaction.customId.startsWith("color-")) {

        return;

      }

      const index =

        Number(interaction.customId.split("-")[1]);

      const color = interaction.values[0];

      // 解除

      if (color === "clear") {

        cells[index] = {

          name: "",

          color: ""

        };

        await interaction.update({

          content: "解除しました",

          components: []

        });

        await updateBoard(interaction.channel);

        return;

      }

      // 名前入力

      const modal =

        new ModalBuilder()

          .setCustomId(`name-${index}-${color}`)

          .setTitle("名前入力");

      const input =

        new TextInputBuilder()

          .setCustomId("name")

          .setLabel("名前")

          .setStyle(TextInputStyle.Short)

          .setRequired(true)

          .setMaxLength(20);

      modal.addComponents(

        new ActionRowBuilder()

          .addComponents(input)

      );

      await interaction.showModal(modal);

      return;

    }

    // 名前入力完了

    if (interaction.isModalSubmit()) {

      if (!interaction.customId.startsWith("name-")) {

        return;

      }

      const parts =

        interaction.customId.split("-");

      const index = Number(parts[1]);

      const color = parts[2];

      const name =

        interaction.fields

          .getTextInputValue("name")

          .trim();

      cells[index] = {

        name: name,

        color: color

      };

      await interaction.reply({

        content:

          `${emojis[color]} ${name} を配置しました`,

        ephemeral: true

      });

      await updateBoard(interaction.channel);

      return;

    }

  } catch (error) {

    console.error(error);

  }

});

// ログイン

client.login(process.env.DISCORD_TOKEN
