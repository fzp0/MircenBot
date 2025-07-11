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
                
                // Check if it's a valid YouTube URL first
                const isYouTubeUrl = await playdl.yt_validate(args);
                
                if (!isYouTubeUrl) {
                    // If not a valid URL, try searching
                    try {
                    const searchResults = await playdl.search(args, { limit: 1 });
                    if (!searchResults || searchResults.length === 0) {
                        return message.reply('Could not find any videos matching your search.');
                    }
                    videoURL = searchResults[0].url;
                    videoTitle = searchResults[0].title;
                    } catch (searchError) {
                    console.error('Search error:', searchError);
                    return message.reply('An error occurred while searching. Please try a different search term.');
                    }
                } else {
                    // If it is a valid YouTube URL, get video info
                    const videoInfo = await playdl.video_info(videoURL);
                    videoTitle = videoInfo.video_details.title;
                }

                // Voice channel check
                if (!message.member.voice.channel) {
                    return message.reply('You need to join a voice channel first!');
                }

                // Stream setup
                const stream = await playdl.stream(videoURL, {
                    discordPlayerCompatibility: true,
                    quality: 2
                });

                const resource = createAudioResource(stream.stream, {
                    inputType: stream.type,
                    inlineVolume: true
                });

                const player = createAudioPlayer();
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

                // Use the correct videoURL variable and include title if available
                message.reply(`Now playing: ${videoTitle || videoURL}`);
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