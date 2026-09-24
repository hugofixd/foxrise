const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Muestra la ayuda de FOXRISE');

async function execute(interaction) {
  return interaction.reply({
    content: '🦊 FOXRISE\n\nAdministración: /config, /moderation, /automod, /logs\nComunidad: /welcome, /ticket, /suggest\nEconomía: /economy\nUtilidades: /utility, /identity',
    ephemeral: true
  });
}

module.exports = { data, execute };
