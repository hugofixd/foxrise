const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('utility')
  .setDescription('Utilidades de FOXRISE')
  .addSubcommand(s => s.setName('ping').setDescription('Latencia'))
  .addSubcommand(s => s.setName('uptime').setDescription('Tiempo activo'))
  .addSubcommand(s => s.setName('serverinfo').setDescription('Información del servidor'))
  .addSubcommand(s => s.setName('userinfo').setDescription('Información de usuario').addUserOption(o => o.setName('user').setDescription('Usuario')))
  .addSubcommand(s => s.setName('poll').setDescription('Crea una encuesta').addStringOption(o => o.setName('question').setDescription('Pregunta').setRequired(true)))
  .addSubcommand(s => s.setName('remind').setDescription('Crea un recordatorio').addIntegerOption(o => o.setName('minutes').setDescription('Minutos').setMinValue(1).setMaxValue(10080).setRequired(true)).addStringOption(o => o.setName('text').setDescription('Texto').setRequired(true)));

async function execute(interaction) {
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === 'ping') return interaction.reply(`🏓 ${interaction.client.ws.ping}ms`);
  if (subcommand === 'uptime') return interaction.reply(`FOXRISE activo durante ${Math.floor(process.uptime() / 3600)}h ${Math.floor(process.uptime() / 60) % 60}m.`);
  if (subcommand === 'serverinfo') return interaction.reply(`**${interaction.guild.name}** · ${interaction.guild.memberCount} miembros · creado <t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:D>`);
  if (subcommand === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder().setColor(0xf97316).setTitle(user.tag).setThumbnail(user.displayAvatarURL()).addFields({ name: 'ID', value: user.id }, { name: 'Cuenta', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` });
    return interaction.reply({ embeds: [embed] });
  }
  if (subcommand === 'poll') {
    const message = await interaction.reply({ content: `📊 ${interaction.options.getString('question', true)}`, fetchReply: true });
    await message.react('👍');
    await message.react('👎');
    return;
  }
  await interaction.reply({ content: `⏰ Recordatorio creado: ${interaction.options.getString('text', true)}`, ephemeral: true });
  setTimeout(() => interaction.user.send(`⏰ ${interaction.options.getString('text', true)}`).catch(() => {}), interaction.options.getInteger('minutes', true) * 60000);
}

module.exports = { data, execute };
