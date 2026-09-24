const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('automod')
  .setDescription('Configura el automod de FOXRISE')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand
    .setName('enable')
    .setDescription('Activa el automod'))
  .addSubcommand(subcommand => subcommand
    .setName('disable')
    .setDescription('Desactiva el automod'))
  .addSubcommand(subcommand => subcommand
    .setName('invites')
    .setDescription('Configura el bloqueo de invitaciones de Discord')
    .addBooleanOption(option => option
      .setName('enabled')
      .setDescription('Bloquear invitaciones')
      .setRequired(true)));

async function execute(interaction, { db }) {
  if (!admin(interaction)) {
    return interaction.reply({ content: 'Necesitas permiso para gestionar el servidor.', ephemeral: true });
  }

  const settings = db.get(interaction.guildId, 'automod', {});
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'enable') settings.enabled = true;
  if (subcommand === 'disable') settings.enabled = false;
  if (subcommand === 'invites') settings.invites = interaction.options.getBoolean('enabled');

  db.set(interaction.guildId, 'automod', settings);
  db.log(interaction.guildId, 'configuration', 'automod_updated', { subcommand, settings });

  return interaction.reply({
    content: `Automod actualizado: ${JSON.stringify(settings)}`,
    ephemeral: true
  });
}

module.exports = { data, execute };
