const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configura FOXRISE por servidor')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand
    .setName('view')
    .setDescription('Ver configuración'))
  .addSubcommand(subcommand => subcommand
    .setName('reset')
    .setDescription('Borrar configuración'))
  .addSubcommand(subcommand => subcommand
    .setName('set')
    .setDescription('Establecer un ajuste')
    .addStringOption(option => option
      .setName('key')
      .setDescription('Clave de configuración')
      .setRequired(true))
    .addStringOption(option => option
      .setName('value')
      .setDescription('JSON o texto')
      .setRequired(true)));

async function execute(interaction, { db }) {
  if (!admin(interaction)) {
    return interaction.reply({ content: 'Necesitas permiso para gestionar el servidor.', ephemeral: true });
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === 'view') {
    return interaction.reply({
      content: 'La configuración de FOXRISE está guardada de forma persistente en SQLite. Usa /config set para cambiar una clave.',
      ephemeral: true
    });
  }

  if (subcommand === 'reset') {
    db.db.prepare('DELETE FROM guild_config WHERE guild_id = ?').run(interaction.guildId);
    db.log(interaction.guildId, 'configuration', 'config_reset', { user: interaction.user.id });
    return interaction.reply({ content: 'Configuración de FOXRISE reiniciada.', ephemeral: true });
  }

  const key = interaction.options.getString('key', true);
  const rawValue = interaction.options.getString('value', true);
  let value = rawValue;

  try {
    value = JSON.parse(rawValue);
  } catch {
    // Valores simples se guardan como texto.
  }

  db.set(interaction.guildId, key, value);
  db.log(interaction.guildId, 'configuration', 'config_updated', {
    user: interaction.user.id,
    key
  });

  return interaction.reply({ content: `Configuración «${key}» guardada.`, ephemeral: true });
}

module.exports = { data, execute };
