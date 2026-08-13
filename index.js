con

  Client,

  GatewayIntentBits,

  ActionRowBuilder,
  ButtonBuilder,

  ButtonStyle,

  StringSelectMenuBuilder,

  ModalBuilder,

  TextInputBuilder,

  TextInputStyle,

  Events

} = require("discord.js");

const client = new Client({

  intents: [GatewayIntentBits.Guilds]

});

// 25マスの状態

const cells = Array.from({ length: 25 }, () => ({

  name: "",

  color: null

}));

// ユーザーが編集中のマス

const editing = new Map();

// 色

const colors = {

  red: {

    name: "赤",

    emoji: "🔴",

    style: ButtonStyle.Danger

  },

  green: {

    name: "緑",

    emoji: "🟢",

    style: ButtonStyle.Success

  },

  blue: {

    name: "青",

    emoji: "🔵",

    style: ButtonStyle.Primary

  },

  orange: {

    name: "オレンジ",

    emoji: "🟠",

    style: ButtonStyle.Secondary

  }

};

// 5×5のマスを作る

function createBoard() {

  const rows = [];

  for (let y = 0; y < 5; y++) {

    const row = new ActionRowBuilder();

    for (let x = 0; x < 5; x++) {

      const index = y * 5 + x;

      const cell = cells[index];

      const button = new ButtonBuilder()

        .setCustomId(`cell_${index}`)

        .setStyle(

          cell.color

            ? colors[cell.color].style

            : ButtonStyle.Secondary

        );

      // 名前がある時だけ表示

      // 空マスは数字を表示しない

      if (cell.name) {

        button.setLabel(cell.name);

        if (cell.color) {

          button.setEmoji(colors[cell.color].emoji);

        }

      } else {

        // Discordボタンは完全な空文字にできないので

        // 見えない文字を入れて空マスにする

        button.setLabel("\u200B");

      }

      row.addComponents(button);

    }

    rows.push(row);

  }

  return rows;

}

client.once(Events.ClientReady, async readyClient => {

  console.log(`ログイン成功: ${readyClient.user.tag}`);

  const commands = [

    {

      name: "配置",

      description: "配置ボードを表示します"

    }

  ];

  await client.application.commands.set(commands);

  console.log("コマンド登録完了");

});

client.on(Events.InteractionCreate, async interaction => {

  // ──────────────

  // /配置

  // ──────────────

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "配置") {

      await interaction.reply({

        content: "マスをタップしてください",

        components: createBoard()

      });

      return;

    }

  }

  // ──────────────

  // マスを押した

  // ──────────────

  if (

    interaction.isButton() &&

    interaction.customId.startsWith("cell_")

  ) {

    const index = Number(

      interaction.customId.replace("cell_", "")

    );

    editing.set(interaction.user.id, {

      index,

      messageId: interaction.message.id,

      channelId: interaction.channelId

    });

    const menu =

      new StringSelectMenuBuilder()

        .setCustomId("select_color")

        .setPlaceholder("色を選択")

        .addOptions(

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

          }

        );

    const row =

      new ActionRowBuilder()

        .addComponents(menu);

    await interaction.reply({

      content: "色を選んでください",

      components: [row],

      ephemeral: true

    });

    return;

  }

  // ──────────────

  // 色を選択

  // ──────────────

  if (

    interaction.isStringSelectMenu() &&

    interaction.customId === "select_color"

  ) {

    const data = editing.get(interaction.user.id);

    if (!data) {

      await interaction.reply({

        content: "もう一度マスを選んでください",

        ephemeral: true

      });

      return;

    }

    data.color = interaction.values[0];

    editing.set(interaction.user.id, data);

    const modal =

      new ModalBuilder()

        .setCustomId("name_modal")

        .setTitle("名前を入力");

    const input =

      new TextInputBuilder()

        .setCustomId("cell_name")

        .setLabel("マスに表示する名前")

        .setStyle(TextInputStyle.Short)

        .setRequired(true)

        .setMaxLength(20);

    const row =

      new ActionRowBuilder()

        .addComponents(input);

    modal.addComponents(row);

    await interaction.showModal(modal);

    return;

  }

  // ──────────────

  // 名前を入力した

  // ──────────────

  if (

    interaction.isModalSubmit() &&

    interaction.customId === "name_modal"

  ) {

    const data = editing.get(interaction.user.id);

    if (!data) {

      await interaction.reply({

        content: "もう一度マスを選んでください",

        ephemeral: true

      });

      return;

    }

    const name =

      interaction.fields.getTextInputValue("cell_name");

    cells[data.index] = {

      name,

      color: data.color

    };

    // 元の5×5ボードを更新

    try {

      const channel =

        await client.channels.fetch(data.channelId);

      const message =

        await channel.messages.fetch(data.messageId);

      await message.edit({

        content: "マスをタップしてください",

        components: createBoard()

      });

    } catch (error) {

      console.error(

        "ボード更新エラー:",

        error

      );

    }

    editing.delete(interaction.user.id);

    await interaction.reply({

      content:

        `${colors[data.color].emoji} ${name} に設定しました！`,

      ephemeral: true

    });

    return;

  }

});

client.login(process.env.DISCORD_TOKEN);
