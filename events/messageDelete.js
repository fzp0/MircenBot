export default {
  name: 'messageDelete',
  async execute(message, client) {
    if (!message.guild) return;

    try {
      if (message.partial) {
        message = await message.fetch();
      }
    } catch (err) {
      console.warn(`Could not fetch deleted message: ${err.message}`);
      return;
    }

    const logChannel = message.guild.channels.cache.find(
      c => c.name === 'edit-delete-log' && c.type === 0 // type 0 = GUILD_TEXT in old versions, or use ChannelType.GuildText
    );
    if (!logChannel) return;

    let deleter = 'Unknown';

    try {
      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: 72 // MESSAGE_DELETE
      });

      const deletionLog = fetchedLogs.entries.first();
      if (deletionLog) {
        const { executor, target, createdTimestamp } = deletionLog;

        const timeDiff = Date.now() - createdTimestamp;
        if (target?.id === message.author?.id && timeDiff < 5000) {
          deleter = executor.tag;
        }
      }
    } catch (err) {
      console.warn(`Could not fetch audit logs: ${err.message}`);
    }

    logChannel.send(
      `🗑️ **${message.author?.tag || 'Unknown User'}**'s message was deleted by **${deleter}**:\n` +
      `\`${message.content || '[no content]'}\``
    );
  }
};