const { SlashCommandBuilder } = require('discord.js');
const { admin, render } = require('../utils/helpers');

const data = new SlashCommandBuilder()
  .setName('welcome')
  .setDescription('Configura las bienvenidas de FOXRISE')
  .addSubcommand(s => s.setName('enable').setDescription('Activa bienvenidas'))
  .addSubcommand(s => s.setName('disable').setDescription('Desactiva bienvenidas'))
  .addSubcommand(s => s.setName('channel').setDescription('Configura el canal').addChannelOption(o => o.setName('channel').setDescription('Canal').setRequired(true)))
  .addSubcommand(s => s.setName('message').setDescription('Configura el mensaje').addStringOption(o => o.setName('text').setDescription('Mensaje').setRequired(true)))
  .addSubcommand(s => s.setName('test').setDescription('Envía una prueba'));

async function execute(interaction, { db }) {
  if (!admin(interaction)) return interaction.reply({ content: 'Necesitas gestionar el servidor.', ephemeral: true });
  const settings = db.get(interaction.guildId, 'welcome', {});
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === 'enable') settings.enabled = true;
  if (subcommand === 'disable') settings.enabled = false;
  if (subcommand === 'channel') settings.channel = interaction.options.getChannel('channel', true).id;
  if (subcommand === 'message') settings.message = interaction.options.getString('text', true);
  if (subcommand === 'test') {
    const channel = settings.channel ? interaction.guild.channels.cache.get(settings.channel) : interaction.channel;
    if (!channel) return interaction.reply({ content: 'Configura primero un canal.', ephemeral: true });
    await channel.send(render(settings.message || 'Bienvenido {user} a {server}', interaction.member));
    return interaction.reply({ content: 'Bienvenida de prueba enviada.', ephemeral: true });
  }
  db.set(interaction.guildId, 'welcome', settings);
  return interaction.reply({ content: 'Configuración de bienvenida guardada.', ephemeral: true });
}

module.exports = { data, execute };
