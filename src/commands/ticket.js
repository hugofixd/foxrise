const { SlashCommandBuilder, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Sistema de tickets de FOXRISE')
  .addSubcommand(s => s.setName('setup').setDescription('Configura tickets').addChannelOption(o => o.setName('category').setDescription('Categoría').setRequired(true)).addChannelOption(o => o.setName('logs').setDescription('Canal de logs').setRequired(true)))
  .addSubcommand(s => s.setName('panel').setDescription('Publica un panel').addStringOption(o => o.setName('title').setDescription('Título').setRequired(true)).addStringOption(o => o.setName('description').setDescription('Descripción').setRequired(true)))
  .addSubcommand(s => s.setName('stats').setDescription('Muestra estadísticas'));

async function execute(interaction, { db }) {
  if (!admin(interaction)) return interaction.reply({ content: 'Necesitas gestionar el servidor.', ephemeral: true });
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === 'setup') {
    db.set(interaction.guildId, 'tickets', { category: interaction.options.getChannel('category', true).id, logs: interaction.options.getChannel('logs', true).id });
    return interaction.reply({ content: 'Sistema de tickets configurado.', ephemeral: true });
  }
  if (subcommand === 'panel') {
    const embed = new EmbedBuilder().setColor(0xf97316).setTitle(interaction.options.getString('title', true)).setDescription(interaction.options.getString('description', true));
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket:create').setLabel('Abrir ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary));
    await interaction.channel.send({ embeds: [embed], components: [row] });
    return interaction.reply({ content: 'Panel publicado.', ephemeral: true });
  }
  const count = db.db.prepare('SELECT COUNT(*) AS count FROM tickets WHERE guild_id = ?').get(interaction.guildId).count;
  return interaction.reply({ content: `FOXRISE ha registrado ${count} tickets.`, ephemeral: true });
}

module.exports = { data, execute };
