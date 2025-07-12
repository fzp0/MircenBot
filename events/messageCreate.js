// messageCreate.js
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    entersState
} from '@discordjs/voice';

export default {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        if (message.content.startsWith('!play ')) {
            return handlePlayCommand(message, client);
        }

        if (message.content === '!terpeny') {
            return handleTerpenyCommand(message);
        }
    }
};

async function handlePlayCommand(message, client) {
   const query = message.content.replace('!play', '').trim();
        if (!query) return message.reply('Please provide a song name or URL.');

        const channel = message.member.voice.channel;
        if (!channel) return message.reply('Join a voice channel first!');

        try {
            const result = await client.player.search(query, {
                requestedBy: message.user
            });

            if (!result.hasTracks()) {
                return message.reply('No results found.');
            }

            const queue = await client.player.nodes.create(message.guild, {
                metadata: {
                    channel: message.channel
                }
            });

            if (!queue.connection) await queue.connect(channel);
            await queue.addTrack(result.tracks[0]);

            if (!queue.isPlaying()) await queue.node.play();

            message.reply(`🎶 Now playing: **${result.tracks[0].title}**`);
        } catch (err) {
            console.error('❌ Player error:', err);
            message.reply('An error occurred while trying to play that song.');
        }
}

// 🌿 Handles the !terpeny command
function handleTerpenyCommand(message) {
    const poem = `
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
`;
    message.channel.send(poem);
}
