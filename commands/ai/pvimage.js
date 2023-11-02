const { SlashCommandBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');

const txt2imgApiUrl = 'http://192.168.1.234:7860/sdapi/v1/txt2img';



async function callTxt2imgApi(prompt) {
    try {
        // Create a JSON payload
        const payload = {
            prompt: prompt,
        };

        // Make a POST request to the API
        const response = await axios.post(txt2imgApiUrl, payload);

        // Check if the request was successful (status code 200)
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`API request failed with status code: ${response.status}`);
        }
    } catch (error) {
        console.error('Error calling the txt2img API:', error);
        throw error;
    }
}

async function processImage(base64String) {
    try {
        // Decode the base64 string to binary data
        const imageBuffer = Buffer.from(base64String, 'base64');

        // Convert the binary image data to a Jimp image
        const image = await Jimp.read(imageBuffer);

        // Convert the Jimp image to an ImageBuffer (Buffer)
        const imageBufferOutput = await image.getBufferAsync(Jimp.MIME_PNG);

        return imageBufferOutput;
    } catch (error) {
        console.error('Error processing the image:', error);
    }
}

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('pvimage')
        .setDescription('Replies with a stable diffusion AI generated image.')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The prompt for generating the AI image')
                .setRequired(true)),
    async execute(interaction) {
        console.info('Executing txt2img');

        // Defer the reply immediately
        await interaction.deferReply();

        try {
            const response = await callTxt2imgApi(interaction.options.getString('prompt'));

            // Convert the base64 string to a Buffer
            const imageBuffer = await processImage(response.images[0]);

            const attachment = await new AttachmentBuilder(imageBuffer, { name: 'pvimage.png'})

            // Send the edited reply with the image
            await interaction.editReply({
                content: `**Image Generation Results**\n${interaction.options.getString('prompt')}`,
                files: [attachment]
            });
        } catch (error) {
            console.error('Error executing txt2img:', error);
            await interaction.followUp('An error occurred while calling the txt2img API.');
        }
    },
};
