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

import { QueryType } from 'discord-player';

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


export async function handlePlayCommand(message, client) {
    var query = message.content.replace('!play', '').trim();
    if (!query) return message.reply('❌ Provide a song name or URL.');
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('🎙️ Join a voice channel first!');

    try {
    // Always use AUTO to let extractors handle URL vs search
    console.log(`🔍 Searching for: ${query}`);
    const result = await client.player.search(query, {
      requestedBy: message.member,
      searchEngine: QueryType.AUTO
    });

    console.log('🔍 Search result:', {
        queryType: result.queryType,
        tracksCount: result.tracks.length,
        tracks: result.tracks.map(t => ({ title: t.title, url: t.url }))
    });

    if (!result.hasTracks()) {
      return message.reply('❌ No results found.');
    }

    const queue = await client.player.nodes.create(message.guild, {
      metadata: { channel: message.channel }
    });

    if (!queue.connection) await queue.connect(voiceChannel);
    await queue.addTrack(result.tracks[0]);
    if (!queue.isPlaying()) await queue.node.play();

    return message.reply(`🎶 Now playing: **${result.tracks[0].title}**`);
  } catch (err) {
    console.error('❌ Playback error:', err);
    return message.reply('⚠️ An error occurred while playing your track.');
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
