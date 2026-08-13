const {

  Client,

  GatewayIntentBits,

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle

} = require('discord.js');

const client = new Client({

  intents: [GatewayIntentBits.Guilds]

});

function createBoard() {

  const rows = [];

  for (let y = 0; y < 5; y++) {

    const row = new ActionRowBuilder();

    for (let x = 0; x < 5; x++) {

      const number = y * 5 + x;

      row.addComponents(

        new ButtonBuilder()

          .setCustomId(`cell_${number}`)

          .setLabel('　')

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

      description: '5×5の光るマスを表示します'

    }

  ]);

});

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === '配置') {

      await interaction.reply({

        content: 'タップすると光るよ👇',

        components: createBoard()

      });

    }

    return;

  }

  if (interaction.isButton()) {

    if (!interaction.customId.startsWith('cell_')) return;

    const newRows = interaction.message.components.map(row => {

      const newRow = new ActionRowBuilder();

      row.components.forEach(button => {

        const newButton = ButtonBuilder.from(button);

        if (button.customId === interaction.customId) {

          newButton.setStyle(

            button.style === ButtonStyle.Success

              ? ButtonStyle.Secondary

              : ButtonStyle.Success

          );

        }

        newRow.addComponents(newButton);

      });

      return newRow;

    });

    await interaction.update({

      components: newRows

    });

  }

});

client.login(process.env.DISCORD_TOKEN);
