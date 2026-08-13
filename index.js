const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({

  intents: [

    GatewayIntentBits.Guilds,

    GatewayIntentBits.GuildMessages,

    GatewayIntentBits.MessageContent,

    GatewayIntentBits.GuildVoiceStates

  ]

});

client.once('ready', () => {

  console.log(`ログイン成功: ${client.user.tag}`);

});

client.login(process.env.DISCORD_TOKEN);
