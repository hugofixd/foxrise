const { SlashCommandBuilder, ActivityType } = require('discord.js');
const { admin } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('identity')
  .setDescription('Gestiona la presencia de FOXRISE')
  .addSubcommand(s => s.setName('set').setDescription('Establece la presencia').addStringOption(o => o.setName('type').setDescription('Tipo').setRequired(true).addChoices({ name: 'Playing', value: 'Playing' }, { name: 'Watching', value: 'Watching' }, { name: 'Listening', value: 'Listening' }, { name: 'Competing', value: 'Competing' })).addStringOption(o => o.setName('text').setDescription('Texto').setRequired(true)).addStringOption(o => o.setName('status').setDescription('online, idle, dnd o invisible')))
  .addSubcommand(s => s.setName('view').setDescription('Ver la identidad'));

async function execute(interaction, { db, client }) {
  if (!admin(interaction)) return interaction.reply({ content: 'Necesitas gestionar el servidor.', ephemeral: true });
  if (interaction.options.getSubcommand() === 'view') return interaction.reply({ content: 'FOXRISE puede cambiar presencia. El nombre, avatar, banner y descripción de la aplicación se cambian desde Discord Developer Portal, no mediante la API normal del bot.', ephemeral: true });
  const type = interaction.options.getString('type', true);
  const text = interaction.options.getString('text', true);
  const types = { Playing: ActivityType.Playing, Watching: ActivityType.Watching, Listening: ActivityType.Listening, Competing: ActivityType.Competing };
  client.user.setPresence({ activities: [{ name: text, type: types[type] }], status: interaction.options.getString('status') || 'online' });
  db.set(interaction.guildId, 'identity', { type, text, status: interaction.options.getString('status') || 'online' });
  db.log(interaction.guildId, 'identity', 'presence_updated', { type, text });
  return interaction.reply('Presencia de FOXRISE actualizada.');
}

module.exports = { data, execute };
