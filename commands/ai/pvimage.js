const { SlashCommandBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const Jimp = require('jimp');
const http = require('http');
const https = require('https');

let stableDiffusionServers = [
	//'192.168.1.245:7860',
	'192.168.1.234:7860',
];

let currentStableDiffusionServerIndex = 0;

//const txt2imgApiUrl = 'http://192.168.1.234:7860/sdapi/v1/txt2img';
//const txt2imgApiUrl = 'http://192.168.1.245:7860/sdapi/v1/txt2img';
const txt2imgApiUrl = 'http://192.168.1.247:7860/sdapi/v1/txt2img';

// Axios for the slash command, always call this
const axiosInstance = axios.create({
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
});

async function getStableDiffusionServer(count = 0) {
    let stabelDiffusionServerOutput = '';

    const apiUrl = 'http://' + stableDiffusionServers[currentStableDiffusionServerIndex] + '/sdapi/v1/progress?skip_current_image=true';
    const responseAPIProgress = await axiosInstance.get(apiUrl, { timeout : 1000 });

    if (responseAPIProgress.status === 200) {
        stabelDiffusionServerOutput = 'http://' + stableDiffusionServers[currentStableDiffusionServerIndex] + '/sdapi/v1/txt2img'; 
    } else {
        if ($count < (stableDiffusionServers.length) - 1) {
            getStableDiffusionServer(count++);
        } else {
            //
        }
    }

    if (currentStableDiffusionServerIndex < (stableDiffusionServers.length - 1)) {
        currentStableDiffusionServerIndex++;
    }
    else {
        currentStableDiffusionServerIndex = 0;
    }

    return stabelDiffusionServerOutput;
}

// Function to pause for a specified duration in milliseconds
function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTxt2imgApiUrl() {
    // Choose a URL based on some logic (e.g., random selection)
    const serverStatus = [];
    let openAPIServerFound = false;
    let apiServerURL = 'http://' + stableDiffusionServers[0] + '/sdapi/v1/txt2img';

    //console.log('Before loop');

    for (let i = 0; i < stableDiffusionServers.length && !openAPIServerFound; i++) {
        const apiUrl = 'http://' + stableDiffusionServers[i] + '/sdapi/v1/progress?skip_current_image=true';
        //console.log(apiUrl);
        const responseAPIProgress = await axiosInstance.get(apiUrl, { timeout : 1000 });
        //console.log(responseAPIProgress.data);

        // Check if the request was successful (status code 200)
        if (responseAPIProgress.status === 200) {
            const curServerStatus = {
                server: stableDiffusionServers[i],
                status: responseAPIProgress.status,
                jobCount: responseAPIProgress.data.state.job_count,
            };
    
            serverStatus.push(curServerStatus);

            if (responseAPIProgress.data.state.job_count === 0) {
                console.log('Server without any jobs!');
                openAPIServerFound = true;
                apiServerURL = 'http://' + stableDiffusionServers[i] + '/sdapi/v1/txt2img'; 
            }
        } else {
            //throw new Error(`API request failed with status code: ${response.status}`);
            // Do I need to do anything here?
        }
    }

    console.log(serverStatus);

    if (!openAPIServerFound) {
        const bestServersSorted = serverStatus.slice().sort((a, b) => a.jobCount - b.jobCount);
        apiServerURL = 'http://' + bestServersSorted[i].server + '/sdapi/v1/txt2img'; 
        
    }

    return apiServerURL;
}

async function getResolution(text) {
    const resolutions = {
      'vertical': { width: 768, height: 1344 },
      'portrait': { width: 915, height: 1144 },
      'square': { width: 1024, height: 1024 },
      'photo': { width: 1182, height: 886 },
      'landscape': { width: 1254, height: 836 },
      'widescreen': { width: 1365, height: 768 },
      'cinematic': { width: 1564, height: 670 }
    };
  
    if (text == null || text == undefined) {
        text = 'square';
    }

    const lowerText = text.toLowerCase();
  
    return resolutions[lowerText];
}

async function callTxt2imgApi(prompt, negprompt, ratio) {
    try {
        const txt2imgApiUrlTest = await getStableDiffusionServer();
        console.log(txt2imgApiUrlTest);
        // Get resolution object from the getResolution function
        const resolution = await getResolution(ratio);

        // Create a JSON payload
        const payload = {
            prompt: prompt,
            'negative prompt': negprompt,
            width: resolution.width,
            height: resolution.height,
            'sampler_name': 'DPM++ 2M Karras',
            //'sampler_name': 'Euler a',
            'refiner_checkpoint': 'sd_xl_refiner_1.0.safetensors',
            'refiner_switch_at': .7,
            steps: 40
        };

        console.info(payload)

        // Make a POST request to the API
        const response = await axiosInstance.post(txt2imgApiUrl, payload);

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
                .setRequired(true))
        .addStringOption(option =>
            option.setName('negprompt')
                .setDescription('Negative Prompt')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('ratio')
                .setDescription('Aspect Ratio (square is default if left blank)')
                .setRequired(false)),
    async execute(interaction) {
        console.info('Executing txt2img');

        // Defer the reply immediately
        await interaction.deferReply();

        try {
            // Access the user who triggered the command
            const user = interaction.user;

            console.log(`User ${user.username} called pvimage with payload:`);

            //console.info(`User ${interaction.user} called pvimage with payload:`)
            const response = await callTxt2imgApi(interaction.options.getString('prompt'),interaction.options.getString('negprompt'),interaction.options.getString('ratio'));

            // Convert the base64 string to a Buffer
            const imageBuffer = await processImage(response.images[0]);

            const attachment = await new AttachmentBuilder(imageBuffer, { name: 'pvimage.png'})

            let content = ``;

            if (interaction.options.getString('negprompt') == null || interaction.options.getString('negprompt') == undefined) {
                content = `**Image Generation Results**\nPrompt: ${interaction.options.getString('prompt')}`;
                
            } else {
                content = `**Image Generation Results**\nPrompt: ${interaction.options.getString('prompt')}\nNegative Prompt: ${interaction.options.getString('negprompt')}`;
            }

            // Send the edited reply with the image
            await interaction.editReply({
                content: content,
                files: [attachment]
            });
        } catch (error) {
            console.error('Error executing txt2img:', error);
            await interaction.followUp('An error occurred while calling the txt2img API.');
        }
    },
};
