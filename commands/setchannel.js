const {Message, MessageEmbed} = require('discord.js');

module.exports = {
    name: "setchannel",
    description: "set the spawn channel for your guild",
    args: true,
    minArgs: 1,
    maxArgs: 1,
    usage: "<channel>",
    neededPerm: "MANAGE_GUILD",
    /**
     * set spawn channel
     * @param {Message} message The sent message
     * @param {string[]} args The arguments used
     */
    async execute(message, args){
        const client = message.client;
        const channel = message.mentions.channels.first();
        if(!channel){
            return await message.channel.send(new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("Channel not found")
                .setDescription("Please mention a channel")
            );
        }
        client.spawnChannels.set(message.guild.id, channel);
        await message.channel.send(new MessageEmbed()
            .setColor("#00FF00")
            .setTitle("**Set spawn channel**")
            .setDescription(`Succesfully set guilds spawn channel to ${channel}`)
        );
    }
}