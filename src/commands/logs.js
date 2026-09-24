const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('logs')
  .setDescription('Configura los logs de FOXRISE')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(s => s.setName('set').setDescription('Establece el canal de logs').addChannelOption(o => o.setName('channel').setDescription('Canal').setRequired(true)))
  .addSubcommand(s => s.setName('view').setDescription('Muestra logs recientes'));

async function execute(interaction, { db }) {
  if (!admin(interaction)) return interaction.reply({ content: 'Necesitas gestionar el servidor.', ephemeral: true });
  if (interaction.options.getSubcommand() === 'set') {
    db.set(interaction.guildId, 'logChannel', interaction.options.getChannel('channel', true).id);
    return interaction.reply({ content: 'Canal de logs configurado.', ephemeral: true });
  }
  const rows = db.db.prepare('SELECT category, event, created_at FROM logs WHERE guild_id = ? ORDER BY id DESC LIMIT 10').all(interaction.guildId);
  const content = rows.length ? rows.map(row => `${row.category}/${row.event} <t:${Math.floor(row.created_at / 1000)}:R>`).join('\n') : 'No hay logs todavía.';
  return interaction.reply({ content, ephemeral: true });
}

module.exports = { data, execute };
