const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const playdl = require('play-dl');


module.exports ={
    name: 'messageCreate',
    async execute(message, client) {
        if (message.content.startsWith('!play ')) {
            try {
                const args = message.content.slice('!play '.length).trim();
            
                if (!args) {
                    return message.reply('Please provide a YouTube URL or search term. Usage: !play <youtube-url/search>');
                }

                // Handle search vs direct URL
                let videoURL = args;
                let videoTitle = '';
                

                // Check if it's a YouTube URL using regex
                const isYouTubeUrl = args.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/);
                
                if (!isYouTubeUrl) {
                    // Handle search
                    try {
                        const searchResults = await playdl.search(args, {
                            limit: 1,
                            source: { youtube: "video" }
                        });
                        
                        if (!searchResults || searchResults.length === 0) {
                            return message.reply('Could not find any videos matching your search.');
                        }
                        
                        videoURL = searchResults[0].url;
                        videoTitle = searchResults[0].title;
                        console.log(`Found video: ${videoTitle} (${videoURL})`);
                    } catch (searchError) {
                        console.error('Search error:', searchError);
                        return message.reply('An error occurred while searching. Please try a different search term.');
                    }
                } else {
                    // Handle direct YouTube URL
                    try {
                        const videoInfo = await playdl.video_basic_info(args);
                        if (!videoInfo || !videoInfo.video_details) {
                            return message.reply('Could not get video information.');
                        }
                        videoURL = args;
                        videoTitle = videoInfo.video_details.title;
                        console.log(`Using direct URL: ${videoTitle} (${videoURL})`);
                    } catch (error) {
                        console.error('Video info error:', error);
                        return message.reply('Invalid YouTube URL. Please provide a valid YouTube video URL.');
                    }
                }

                // Voice channel check
                if (!message.member.voice.channel) {
                    return message.reply('You need to join a voice channel first!');
                }

                if (!videoURL) {
                    throw new Error('No valid video URL found');
                }
                console.log(`Attempting to stream URL: ${videoURL}`);
                
                try {
                    const streamData = await playdl.stream(videoURL);
                    
                    if (!streamData) {
                        throw new Error('Failed to get stream data');
                    }

                    const resource = createAudioResource(streamData.stream, {
                        inputType: streamData.type,
                        inlineVolume: true
                    });

                    const player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Play
                        }
                    });

                    const connection = joinVoiceChannel({
                        channelId: message.member.voice.channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                    });

                    connection.subscribe(player);
                    player.play(resource);

                    player.on(AudioPlayerStatus.Idle, () => {
                        connection.destroy();
                    });

                    player.on('error', error => {
                        console.error('Playback error:', error);
                        message.channel.send('An error occurred while playing the audio.');
                        connection.destroy();
                    });

                    message.reply(`Now playing: ${videoTitle || videoURL}`);
                } catch (streamError) {
                    console.error('Stream error:', streamError);
                    throw new Error('Failed to create audio stream');
                }
            } 
            catch (error) {
            console.error('Play command error:', error);
            message.reply('An error occurred while processing your request. Make sure the video is not age-restricted.');
            }
        }


        if (message.content === '!terpeny') {
            message.channel.send(`
            Terpenowy hymn

            W świecie zapachów i cudów zielonych
            Królują terpeny – nuty nieskończone.
            Niech każdy z nich znajdzie swój moment,
            By w wierszu tym zabłysnąć płomieniem.

            Limonen – cytrusowa moc, świeżość pełna słońca,
            Mircen – mango, zioła, relaks płynący do końca.
            Pinen – las, powietrze czyste, tlenem tchnący świat,
            Linalool – lawenda, spokój, w miękkości sen zatopiony brat.

            Humulen – chmielny szept, smak piwa i głód co znika,
            Terpinolen – sosna, cytrusy, w umyśle iskra dzika.
            Kariofilen – pieprzny wojownik, CB2 z nim w parze,
            Ocymen – owocowy blask, w odporności karcie.

            Eukaliptol – kamforowa nuta, powiew chłodnej mgły,
            Fenchol – drzewny aromat, jak balsam dla skóry.
            Geraniol – róży pocałunek, antybakteryjna moc,
            Bisabolol – z rumianku czar, koi stres i noc.

            Valencen – cytrusowe słońce, w letnim tropiku,
            Nerolidol – kwiaty i las, sen w złotym dotyku.
            Phytol – zielona poświata, chlorofilna pieśń,
            Guaiol – drzewny dym, zapach kadzidła gdzieś.
            `);
        }
    }
}