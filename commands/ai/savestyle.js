const { SlashCommandBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

function saveStyleToJsonFile(filename, key, text) {
    try {
        // Read existing data from the file
        const existingData = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename)) : {};

        // Check if the key already exists
        if (existingData.hasOwnProperty(key)) {
            console.log(`Key '${key}' already exists in ${filename}. Updating the existing value.`);
            // Update the existing value for the key
            //existingData[key] = text;
        } else {
            console.log(`Adding new key '${key}' to ${filename}.`);
            // Add the new key-value pair
            existingData[key] = text;
        }

        /*
        // Update or add the new text
        existingData[key] = text;

        // Write the updated data back to the file
        fs.writeFileSync(filename, JSON.stringify(existingData, null, 2));

        console.log(`Text saved successfully to ${filename}`);
        */
    } catch (error) {
        console.error(`Error saving text to ${filename}: ${error.message}`);
    }
}

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('savestyle')
        .setDescription('Save a style to be accessed quickly at a later date and time.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the style to save')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text of the style to save')
                .setRequired(true)),
    async execute(interaction) {
        //console.info('Executing txt2img');

        // Defer the reply immediately
        await interaction.deferReply();

        try {
            //const response = await callTxt2imgApi(interaction.options.getString('prompt'),interaction.options.getString('negprompt'));

            saveStyleToJsonFile('styles.json', interaction.options.getString('name'), interaction.options.getString('text'));

            content = `Style ${interaction.options.getString('name')} as been saved`;

            // Send the edited reply with the image
            await interaction.editReply({
                content: content,
            });
        } catch (error) {
            console.error('Error saving style:', error);
            await interaction.followUp('An error occurred while saving the style.');
        }
    },
};
