const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('moderation')
  .setDescription('Moderación de FOXRISE')
  .addSubcommand(s => s.setName('warn').setDescription('Advierte a un usuario').addUserOption(o => o.setName('user').setDescription('Usuario').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Razón').setRequired(true)))
  .addSubcommand(s => s.setName('warnings').setDescription('Ver advertencias').addUserOption(o => o.setName('user').setDescription('Usuario').setRequired(true)))
  .addSubcommand(s => s.setName('clear').setDescription('Borra mensajes').addIntegerOption(o => o.setName('amount').setDescription('Cantidad').setMinValue(1).setMaxValue(100).setRequired(true)))
  .addSubcommand(s => s.setName('timeout').setDescription('Aplica timeout').addUserOption(o => o.setName('user').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('Minutos').setMinValue(1).setMaxValue(40320).setRequired(true)));

async function execute(interaction, { db }) {
  if (!admin(interaction)) return interaction.reply({ content: 'No tienes permisos.', ephemeral: true });
  const subcommand = interaction.options.getSubcommand();
  const user = interaction.options.getUser('user');
  if (subcommand === 'warn') {
    const reason = interaction.options.getString('reason', true);
    db.db.prepare('INSERT INTO warns (guild_id, user_id, staff_id, reason, created_at) VALUES (?, ?, ?, ?, ?)').run(interaction.guildId, user.id, interaction.user.id, reason, Date.now());
    db.log(interaction.guildId, 'moderation', 'warn', { user: user.id, staff: interaction.user.id, reason });
    return interaction.reply(`⚠️ ${user} recibió una advertencia: ${reason}`);
  }
  if (subcommand === 'warnings') {
    const rows = db.db.prepare('SELECT reason, staff_id, created_at FROM warns WHERE guild_id = ? AND user_id = ? ORDER BY id DESC').all(interaction.guildId, user.id);
    return interaction.reply({ content: rows.length ? rows.map((row, index) => `${index + 1}. ${row.reason} · <@${row.staff_id}> · <t:${Math.floor(row.created_at / 1000)}:R>`).join('\n') : 'Sin advertencias.', ephemeral: true });
  }
  if (subcommand === 'clear') {
    const amount = interaction.options.getInteger('amount', true);
    const deleted = await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: `FOXRISE eliminó ${deleted.size} mensajes.`, ephemeral: true });
  }
  const member = await interaction.guild.members.fetch(user.id);
  await member.timeout(interaction.options.getInteger('minutes', true) * 60000, `FOXRISE: ${interaction.user.tag}`);
  return interaction.reply(`${user} recibió timeout.`);
}

module.exports = { data, execute };
