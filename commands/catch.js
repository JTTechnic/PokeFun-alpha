const {Message, MessageEmbed} = require('discord.js');
const {prefix: defaultPrefix, minlevel, maxlevel} = require('../config.json');

module.exports = {
    name: "catch",
    description: "catch a spawned pokemon",
    args: true,
    usage: "<pokémon>",
    /**
     * catch a spawned pokemon
     * @param {Message} message The sent message
     * @param {string[]} args The arguments used
     */
    async execute(message, args){
        const client = message.client;
        const prefix = client.prefixes.get(message.guild.id) || defaultPrefix;
        if(!client.spawnChannels.has(message.guild.id)){
            return await message.channel.send(new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("**Spawn channel not set**")
                .setDescription(`No spawn channel has been set for this server\nPlease ask someone with the \`MANAGE_SERVER\` permission to set the spawn channel of this server\nThe spawn channel can be set with \`${prefix}setchannel <channel>\``)
            );
        }
        if(!client.spawnedPokemon.has(message.guild.id)){
            return await message.channel.send(new MessageEmbed()
                .setColor("#FF0000")
                .setTitle("**Go into the tall grass for pokémon**")
                .setDescription("Oh, there seems to be no pokémon yet")
            );
        }
        const pokemon = args.join(" ").toLowerCase();
        if(client.spawnedPokemon.get(message.guild.id) != pokemon){
            return await message.channel.send(new MessageEmbed()
                .setColor("#FF0000")
                .setDescription(`${message.author} thats the wrong pokémon\nOr is this a Bug? Do pf!report <bug> to report`)
            );
        }
        const level = Math.ceil(Math.random() * (maxlevel - minlevel)) + minlevel;
        // TODO add moves to pokemon
        const currentPokemon = client.pokemon.has(message.author.id) ? client.pokemon.get(message.author.id) : [];
        currentPokemon.push({name: pokemon, level: level});
        client.pokemon.set(message.author.id, currentPokemon);
        return await message.channel.send(new MessageEmbed()
            .setColor("#00FF00")
            .setDescription(`${message.author} caught a level ${level} ${pokemon}`)
        );
    }
}