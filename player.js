// player.js
import { Player } from 'discord-player';
import { DefaultExtractors} from '@discord-player/extractor';
import { YoutubeiExtractor } from "discord-player-youtubei"
import fs from 'fs';

export async function setupPlayer(client) {
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
        }
    });


    const options = {
        soundcloud: { clientId: process.env.SOUNDCLOUD_CLIENT_ID }
    };

    // ✅ Register each pre-instantiated extractor
    await player.extractors.loadMulti(DefaultExtractors, options);
    await player.extractors.register(YoutubeiExtractor, {
        cookie: fs.readFileSync('./youtube_cookies.txt', 'utf-8')
    });

    client.player = player;
    console.log("✅ All extractors registered!");
}