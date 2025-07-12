// messageUpdate.js
export default {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild) return;

    // Fetch partials if needed
    if (oldMessage.partial) {
      try {
        oldMessage = await oldMessage.fetch();
      } catch (err) {
        console.error('Could not fetch old message:', err);
      }
    }

    if (newMessage.partial) {
      try {
        newMessage = await newMessage.fetch();
      } catch (err) {
        console.error('Could not fetch new message:', err);
      }
    }

    // If the content hasn't changed, don't log it
    if (oldMessage.content === newMessage.content) return;

    const logChannel = newMessage.guild.channels.cache.find(
      c => c.name === 'edit-delete-log' && c.type === 0 // optionally replace 0 with ChannelType.GuildText
    );
    if (!logChannel) return;

    logChannel.send(
      `✏️ **${newMessage.author?.tag || 'Unknown User'}** edited a message:\n` +
      `**Before:** \`${oldMessage.content || '[no content]'}\`\n` +
      `**After:** \`${newMessage.content || '[no content]'}\``
    );
  }
};
