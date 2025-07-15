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

        if (message.content.startsWith('!play')) {
            return handlePlayCommand(message, client);
        }

        if (message.content === '!pause') {
            return handlePauseCommand(message, client);
        }

        if (message.content === '!queue') {
            return handleQueueCommand(message, client);
        }

        if (message.content === '!skip') {
            return handleSkipCommand(message, client);
        }

        if (message.content === '!clear') {
            return handleClearCommand(message, client);
        }

        if (message.content === '!stop' || message.content === '!disconnect') {
            return handleDisconnectCommand(message, client);
        }

        if (message.content === '!terpeny') {
            return handleTerpenyCommand(message);
        }
    }
};


async function handlePauseCommand(message, client) {
    const queue = client.player.nodes.get(message.guild.id);

    if (!queue || !queue.isPlaying()) {
        return message.reply('❌ There is no track currently playing.');
    }

    try {
        queue.node.pause(); // Pauses the playback
        return message.reply('⏸️ Playback paused.');
    } catch (err) {
        console.error('❌ Pause command error:', err);
        return message.reply('⚠️ An error occurred while pausing playback.');
    }
}

async function handleQueueCommand(message, client) {
    const queue = client.player.nodes.get(message.guild.id);

    if (!queue) {
        console.log('Queue does not exist.');
        return message.reply('❌ The queue is empty.');
    }

    const currentTrack = queue.currentTrack;
    const tracks = queue.tracks.data;

    if (!currentTrack && !tracks.length) {
        console.log('Queue exists but is completely empty.');
        console.log('Queue object:', queue);
        return message.reply('❌ The queue is empty.');
    }

    console.log('Current track:', currentTrack);
    console.log('Upcoming tracks:', tracks);

    const maxTracksToShow = 10;
    const displayedTracks = tracks
        .slice(0, maxTracksToShow)
        .map((track, index) => `${index + 1}. **${track.title}** (${track.duration})`)
        .join('\n');

    const additionalTracks = tracks.length > maxTracksToShow
        ? `\n...and ${tracks.length - maxTracksToShow} more tracks.`
        : '';

    const nowPlaying = currentTrack
        ? `▶️ **Now Playing:** ${currentTrack.title} (${currentTrack.duration})\n\n`
        : '';

    return message.reply(`${nowPlaying}🎶 **Queue:**\n${displayedTracks}${additionalTracks}`);
}



async function handleSkipCommand(message, client) {
    const queue = client.player.nodes.get(message.guild.id);

    if (!queue || !queue.isPlaying()) {
        return message.reply('❌ There is no track currently playing.');
    }

    try {
        queue.node.skip(); // Skips the current track
        return message.reply('⏭️ Skipped to the next track.');
    } catch (err) {
        console.error('❌ Skip command error:', err);
        return message.reply('⚠️ An error occurred while skipping the track.');
    }
}

async function handleClearCommand(message, client) {
    const queue = client.player.nodes.get(message.guild.id);

    if (!queue || !queue.tracks || !queue.tracks.data.length) {
        return message.reply('❌ The queue is already empty.');
    }

    try {
        queue.tracks.clear(); // Clears all tracks in the queue (not the current track)
        console.log(`✅ Cleared queue for guild: ${message.guild.id}`);
        return message.reply('🗑️ The queue has been cleared.');
    } catch (err) {
        console.error('❌ Error while clearing the queue:', err);
        return message.reply('⚠️ An error occurred while clearing the queue.');
    }
}


async function handlePlayCommand(message, client) {
    const query = message.content.replace('!play', '').trim();
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) return message.reply('🎙️ Join a voice channel first!');

    try {
        const queue = client.player.nodes.get(message.guild.id);

        // Check if the queue exists and is paused
        if (queue && queue.node.isPaused()) {
            queue.node.resume(); // Resume playback
            return message.reply('▶️ Resumed playback.');
        }

        if (!query) return message.reply('❌ Provide a song name or URL.');

        // Search for the track
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

        // Create or get the queue
        const newQueue = queue || await client.player.nodes.create(message.guild, {
            metadata: { channel: message.channel }
        });

        if (!newQueue.connection) await newQueue.connect(voiceChannel);
        await newQueue.addTrack(result.tracks[0]);

        if (!newQueue.isPlaying()) await newQueue.node.play();

        if (!newQueue.isPlaying()) {
            await newQueue.node.play();
            return message.reply(`🎶 Now playing: **${result.tracks[0].title}**`);
        } else {
            return message.reply(`🎶 Added to queue: **${result.tracks[0].title}**`);
        }

    } catch (err) {
        console.error('❌ Playback error:', err);
        return message.reply('⚠️ An error occurred while playing your track.');
    }
}

async function handleDisconnectCommand(message, client) {
    const queue = client.player.nodes.get(message.guild.id);

    if (!queue || !queue.connection) {
        return message.reply('❌ The bot is not connected to a voice channel.');
    }

    try {
        queue.node.stop(); // Stops playback
        queue.connection.destroy(); // Disconnects from the voice channel
        return message.reply('🛑 Playback stopped and disconnected from the voice channel.');
    } catch (err) {
        console.error('❌ Disconnect command error:', err);
        return message.reply('⚠️ An error occurred while disconnecting.');
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
