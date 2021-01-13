const {Message, MessageEmbed} = require('discord.js');
const {prefix: defaultPrefix} = require('../config.json');

module.exports = {
    name: "prefix",
    description: "set or look at the prefix of this bot for your server",
    usage: "[prefix]",
    /**
     * set or look at prefix
     * @param {Message} message The sent message
     * @param {string[]} args The arguments used
     */
    async execute(message, args = []){
        const client = message.client;
        if(!args.length){
            const currentPrefix = client.prefixes.get(message.guild.id) || defaultPrefix;
            return await message.channel.send(new MessageEmbed()
                .setColor("#0000FF")
                .setTitle("**Prefix**")
                .setDescription(`The currenct prefix for this guild is ${currentPrefix}`)
            );
        }
        if(!message.member.permissions.has("MANAGE_GUILD")) return message.channel.send(new MessageEmbed()
            .setColor("#FF0000")
            .setTitle("**Missing Permission**")
            .setDescription("You need the `MANAGE_GUILD` permission to change the guilds prefix")
        );
        const prefix = args.join(" ");
        client.prefixes.set(message.guild.id, prefix);
        await message.channel.send(new MessageEmbed()
            .setColor("#00FF00")
            .setTitle("**Set Prefix**")
            .setDescription(`Succesfully set guilds prefix to ${prefix}`)
        );
    }
}