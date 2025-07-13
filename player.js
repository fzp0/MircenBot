// player.js
import { Player } from 'discord-player';
import { DefaultExtractors} from '@discord-player/extractor';
import fs from 'fs';

export async function setupPlayer(client) {
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
        }
    });


    const options = {
        soundcloud: { clientId: process.env.SOUNDCLOUD_CLIENT_ID },
        youtube: { cookies: fs.readFileSync('./youtube_cookies.txt', 'utf-8') }
    };

    // ✅ Register each pre-instantiated extractor
    await player.extractors.loadMulti(DefaultExtractors, options);

    client.player = player;
    console.log("✅ All extractors registered!");
}