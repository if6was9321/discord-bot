const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({

  intents: [GatewayIntentBits.Guilds]

});

client.once('ready', async () => {

  console.log(`ログイン成功: ${client.user.tag}`);

  await client.application.commands.set([

    {

      name: '配置',

      description: '配置テスト'

    }

  ]);

});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === '配置') {

    await interaction.reply('配置テスト成功！');

  }

});

client.login(process.env.DISCORD_TOKEN);
