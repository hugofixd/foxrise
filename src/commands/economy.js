const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('economy')
  .setDescription('Economía persistente de FOXRISE')
  .addSubcommand(s => s.setName('balance').setDescription('Consulta tu saldo').addUserOption(o => o.setName('user').setDescription('Usuario')))
  .addSubcommand(s => s.setName('daily').setDescription('Reclama tu recompensa diaria'))
  .addSubcommand(s => s.setName('work').setDescription('Trabaja para ganar monedas'))
  .addSubcommand(s => s.setName('pay').setDescription('Paga a otro usuario').addUserOption(o => o.setName('user').setDescription('Usuario').setRequired(true)).addIntegerOption(o => o.setName('amount').setDescription('Cantidad').setMinValue(1).setRequired(true)));

async function execute(interaction, { db }) {
  const subcommand = interaction.options.getSubcommand();
  const target = interaction.options.getUser('user') || interaction.user;
  const current = db.user(interaction.guildId, interaction.user.id);

  if (subcommand === 'balance') {
    return interaction.reply(`${target} tiene ${db.user(interaction.guildId, target.id).money} monedas.`);
  }

  if (subcommand === 'pay') {
    const amount = interaction.options.getInteger('amount', true);
    if (target.id === interaction.user.id) return interaction.reply({ content: 'No puedes pagarte a ti mismo.', ephemeral: true });
    if (current.money < amount) return interaction.reply({ content: 'Saldo insuficiente.', ephemeral: true });
    db.db.prepare('UPDATE users SET money = money - ? WHERE guild_id = ? AND user_id = ?').run(amount, interaction.guildId, interaction.user.id);
    db.db.prepare('UPDATE users SET money = money + ? WHERE guild_id = ? AND user_id = ?').run(amount, interaction.guildId, target.id);
    return interaction.reply(`Transferiste ${amount} monedas a ${target}.`);
  }

  const now = Date.now();
  const column = subcommand === 'daily' ? 'daily_at' : 'work_at';
  const wait = subcommand === 'daily' ? 86400000 : 3600000;
  if (current[column] > now - wait) return interaction.reply({ content: 'Todavía estás en cooldown.', ephemeral: true });
  const amount = subcommand === 'daily' ? 500 : Math.floor(Math.random() * 251) + 100;
  db.db.prepare(`UPDATE users SET money = money + ?, ${column} = ? WHERE guild_id = ? AND user_id = ?`).run(amount, now, interaction.guildId, interaction.user.id);
  return interaction.reply(`FOXRISE te entregó ${amount} monedas.`);
}

module.exports = { data, execute };
