// player.js
import { Player } from 'discord-player';
import extractor from '@discord-player/extractor';

export async function setupPlayer(client) {
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }
    });

    const { DefaultExtractors } = extractor;

    // ✅ Register each pre-instantiated extractor
    for (const extractorInstance of DefaultExtractors) {
        await player.extractors.register(extractorInstance);
    }

    client.player = player;
    console.log("✅ All extractors registered!");
}