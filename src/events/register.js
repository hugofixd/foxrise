const { Events, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const cooldowns = new Map();
const { render, sendLog, transcript } = require('../utils/helpers');
function registerEvents(client, db) {
 client.once(Events.ClientReady, c => { console.log(`FOXRISE conectado como ${c.user.tag}`); c.user.setActivity('FOXRISE | /help', { type: 0 }); });
 client.on(Events.InteractionCreate, async i => { try {
  if (i.isChatInputCommand()) { const command=client.commands.get(i.commandName); if (!command) return; const key=`${i.user.id}:${i.commandName}`; const now=Date.now(); if ((cooldowns.get(key)||0)>now) return i.reply({content:`Espera ${Math.ceil((cooldowns.get(key)-now)/1000)}s.`,ephemeral:true}); cooldowns.set(key,now+(command.cooldown||1500)); if(command.execute) return command.execute(i,{db,client}); }
  if (i.isButton()) { if(i.customId.startsWith('ticket:')) return require('../systems/tickets').button(i,db); if(i.customId.startsWith('rating:')) return require('../systems/tickets').rating(i,db); if(i.customId.startsWith('report:')) return require('../systems/reports').button(i,db); if(i.customId.startsWith('suggest:')) return require('../systems/suggestions').button(i,db); }
  if(i.isModalSubmit() && i.customId.startsWith('ticket-close:')) return require('../systems/tickets').closeModal(i,db);
 } catch(e){ console.error(e); const msg={content:'FOXRISE encontró un error procesando la acción.',ephemeral:true}; if(i.replied||i.deferred) await i.followUp(msg).catch(()=>{}); else await i.reply(msg).catch(()=>{}); } });
 client.on(Events.GuildMemberAdd, async m=>{ const cfg=db.get(m.guild.id,'welcome',{}); if(cfg.enabled!==false&&cfg.channel){const ch=m.guild.channels.cache.get(cfg.channel); if(ch) ch.send({content:render(cfg.message||'Bienvenido {user} a {server}',m),embeds:cfg.embed?[new EmbedBuilder(cfg.embed)]:[]}).catch(()=>{});} const ar=db.get(m.guild.id,'autoroles',[]); for(const r of ar.filter(x=>x.humans!==false)) m.roles.add(r.role).catch(()=>{}); db.log(m.guild.id,'members','join',{user:m.id}); });
 client.on(Events.GuildMemberRemove,m=>db.log(m.guild.id,'members','leave',{user:m.id}));
 client.on(Events.MessageCreate, async m=>{if(!m.guild||m.author.bot)return; const u=db.user(m.guild.id,m.author.id), cfg=db.get(m.guild.id,'levels',{}); if(cfg.enabled){const gain=Math.floor(Math.random()*8)+5; db.db.prepare('UPDATE users SET xp=xp+?, level=CAST((xp+?)/100 AS INTEGER) WHERE guild_id=? AND user_id=?').run(gain,gain,m.guild.id,m.author.id);} const a=db.get(m.guild.id,'automod',{}); if(a.invites&&/discord\.gg\//i.test(m.content)){await m.delete().catch(()=>{}); db.log(m.guild.id,'automod','invite',{user:m.author.id});}});
 client.on(Events.MessageDelete,m=>m.guild&&db.log(m.guild.id,'messages','delete',{author:m.author?.id,content:m.content?.slice(0,1000)}));
 client.on(Events.MessageUpdate,(o,n)=>n.guild&&o.content!==n.content&&db.log(n.guild.id,'messages','edit',{message:n.id,before:o.content,after:n.content}));
}
module.exports={registerEvents};
