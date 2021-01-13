const fs = require('fs');
const {Client, Collection, MessageEmbed} = require('discord.js');
const {prefix: defaultPrefix, spawnrate, generations} = require('./config.json');
const Pokemon = require('pokemon.js');

const token = fs.existsSync("./secrets.json") ? require('./secrets.json').token : process.env.BOT_TOKEN;

const client = new Client();
// a collection with commands as value and command names as keys
client.commands = new Collection();
// a collection with prefixes as value and guild ids as keys
client.prefixes = new Collection();
// a collection with channels as value and guild ids as keys
client.spawnChannels = new Collection();
// a collection with an array of pokemon as value and user ids as keys
client.pokemon = new Collection();
// a collection with a pokemon name as value and a guild ids as keys
client.spawnedPokemon = new Collection();
// a collection with numbers as value and guild ids as keys
client.messageAmount = new Collection();
// set commands
for (let file of fs.readdirSync('./commands').filter(file => file.endsWith('.js'))) {
    const command = require('./commands/' + file);
    client.commands.set(command.name, command);
}

// set pokemon that can be caught
const availablePokemon = [];
(async function(){
    for(let generation of generations){
        const gen = await Pokemon.getGeneration(generation); 
        availablePokemon.push(...gen.pokemon_species);
    }
})();

async function setGuilds(){
    await client.user.setActivity(`pokéfun with ${client.guilds.cache.size} guilds`, {type: "PLAYING"});
}

client.on("ready", async () => {
    await setGuilds();
    console.log(`${client.user.username} is ready!`);
});

client.on("guildCreate", async guild => {
    await setGuilds();
});

client.on("guildDelete", async guild => {
    await setGuilds();
});

client.on("message", async message => {
    const messageAmount = client.messageAmount.get(message.guild.id);
    const prefix = client.prefixes.get(message.guild.id) || defaultPrefix;
    if(!message.author.bot || message.webhookID){
        if(messageAmount >= spawnrate && client.spawnChannels.has(message.guild.id)){
            client.messageAmount.set(message.guild.id, 0);
            const chosenPokemon = await Pokemon.getPokemon(availablePokemon[Math.floor(Math.random() * availablePokemon.length)]);
            client.spawnedPokemon.set(message.guild.id, chosenPokemon.name);
            await client.spawnChannels.get(message.guild.id).send(new MessageEmbed()
                .setColor("#00FF00")
                .setTitle("A wild pokémon appeared!")
                .setDescription(`Do ${prefix}catch <pokémon> to catch this pokémon\nExample: \`${prefix}catch bulbasaur\``)
                .setImage(chosenPokemon.sprites.other["official-artwork"].front_default)
            );
        } else {
            client.messageAmount.set(message.guild.id, messageAmount ? messageAmount + 1 : 1);
        }
    }
    if(/^<@!?[0-9]{18}>$/.test(message.content.trim()) && message.mentions.has(client.user)) return client.commands.get("prefix").execute(message);
    if(!message.content.toLowerCase().startsWith(prefix.toLowerCase()) || message.author.bot || message.webhookID) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift();
    console.log(`Command used by ${message.author.tag}`, commandName);
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.alias && (cmd.alias == commandName || cmd.alias?.includes(commandName)));
    if(!command) return;
    const embedMsg = new MessageEmbed().setColor("#FF0000");
    // TODO make it possible to make this an array
    if(command.neededPerm && !message.member.permissions.has(command.neededPerm)){
        return message.channel.send(embedMsg
            .setTitle("**Missing permission**")
            .setDescription(`You need the \`${neededPerm}\` permission for this command!`)
        );
    }
    let reply;
    if(command.args && !args.length){
        reply = `There were no arguments given, ${message.author}`;
        if (command.usage) reply += `\nThe proper usage is: '${prefix}${command.name} ${command.usage}'`;
        return message.channel.send(embedMsg
            .setTitle("**No arguments**")
            .setDescription(reply)
        );
    }
    if (command.args == false && args.length) {
        return message.channel.send(embedMsg
            .setTitle("**No arguments needed**")
            .setDescription(`This command doesn't require any arguments, ${message.author}`)
        );
    }
    if (command.minArgs && args.length < command.minArgs) {
        reply = `${prefix}${command.name} takes a minimum of ${command.minArgs} argument(s)`;
        if (command.usage) reply += `\nThe proper usage is ${prefix}${command.name} ${command.usage}`;
        return message.channel.send(embedMsg
            .setDescription(reply)
        );
    }
    if (command.maxArgs && args.length > command.maxArgs) {
        reply = `${prefix}${command.name} takes a maximum of ${command.maxArgs} argument(s)`;
        if (command.usage) reply += `\nThe proper usage is ${prefix}${command.name} ${command.usage}`;
        return message.channel.send(embedMsg
            .setDescription(reply)
        );
    }
    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
    }
});

client.login(token);