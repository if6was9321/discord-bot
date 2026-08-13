const {

  Client,

  GatewayIntentBits,

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle,

  ModalBuilder,

  TextInputBuilder,

  TextInputStyle,

  StringSelectMenuBuilder

} = require('discord.js');

const client = new Client({

  intents: [GatewayIntentBits.Guilds]

});

// 25マスの状態

const cells = Array.from({ length: 25 }, () => ({

  name: '',

  color: ''

}));

const emojis = {

  red: '🔴',

  green: '🟢',

  blue: '🔵',

  orange: '🟠'

};

// 5×5の盤面を作る

function createBoard() {

  const rows = [];

  for (let y = 0; y < 5; y++) {

    const row = new ActionRowBuilder();

    for (let x = 0; x < 5; x++) {

      const i = y * 5 + x;

      const cell = cells[i];

      let label = `${i + 1}`;

      if (cell.name && cell.color) {

        label = `${emojis[cell.color]}${cell.name}`;

      }

      row.addComponents(

        new ButtonBuilder()

          .setCustomId(`cell_${i}`)

          .setLabel(label)

          .setStyle(ButtonStyle.Secondary)

      );

    }

    rows.push(row);

  }

  return rows;

}

client.once('ready', async () => {

  console.log(`ログイン成功: ${client.user.tag}`);

  await client.application.commands.set([

    {

      name: '配置',

      description: '5×5の配置ボードを表示'

    }

  ]);

});

client.on('interactionCreate', async interaction => {

  // /配置

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === '配置') {

      await interaction.reply({

        content: 'マスをタップしてください',

        components: createBoard()

      });

    }

    return;

  }

  // マスを押した

  if (interaction.isButton()) {

    if (!interaction.customId.startsWith('cell_')) return;

    const index = interaction.customId.split('_')[1];

    const menu = new StringSelectMenuBuilder()

      .setCustomId(`color_${index}`)

      .setPlaceholder('色を選んでください')

      .addOptions(

        {

          label: '赤',

          value: 'red',

          emoji: '🔴'

        },

        {

          label: '緑',

          value: 'green',

          emoji: '🟢'

        },

        {

          label: '青',

          value: 'blue',

          emoji: '🔵'

        },

        {

          label: 'オレンジ',

          value: 'orange',

          emoji: '🟠'

        }

      );

    await interaction.reply({

      content: '色を選んでください',

      components: [

        new ActionRowBuilder().addComponents(menu)

      ],

      ephemeral: true

    });

    return;

  }

  // 色を選んだ

  if (interaction.isStringSelectMenu()) {

    if (!interaction.customId.startsWith('color_')) return;

    const index = interaction.customId.split('_')[1];

    const color = interaction.values[0];

    const modal = new ModalBuilder()

      .setCustomId(`name_${index}_${color}`)

      .setTitle('名前を入力');

    const input = new TextInputBuilder()

      .setCustomId('name')

      .setLabel('マスに表示する名前')

      .setStyle(TextInputStyle.Short)

      .setRequired(true)

      .setMaxLength(20);

    modal.addComponents(

      new ActionRowBuilder().addComponents(input)

    );

    await interaction.showModal(modal);

    return;

  }

  // 名前入力完了

  if (interaction.isModalSubmit()) {

    if (!interaction.customId.startsWith('name_')) return;

    const parts = interaction.customId.split('_');

    const index = Number(parts[1]);

    const color = parts[2];

    const name = interaction.fields.getTextInputValue('name');

    cells[index] = {

      name,

      color

    };

    await interaction.reply({

      content: `${emojis[color]} ${name} に設定しました！`,

      ephemeral: true

    });

  }

});

client.login(process.env.DISCORD_TOKEN);
