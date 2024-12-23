const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'pvimage') {
    // Check if the interaction occurred in the desired guild
    if (interaction.guildId === '989929039055691816') {
      await client.guilds.cache.get(interaction.guildId).commands.create({
        name: 'pvimage',
        description: 'Your custom description for /pvimage command.',
      });
      await interaction.reply('Slash command /pvimage has been added to this guild.');
    } else {
      await interaction.reply('Sorry, you can only use this command in the designated guild.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
