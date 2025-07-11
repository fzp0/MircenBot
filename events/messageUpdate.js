module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild) return;

    // Fetch partials if needed
    if (oldMessage.partial) try {
      oldMessage = await oldMessage.fetch();
    } catch (err) {
      console.error('Could not fetch old message:', err);
    }

    if (newMessage.partial) try {
      newMessage = await newMessage.fetch();
    } catch (err) {
      console.error('Could not fetch new message:', err);
    }

    if (oldMessage.content === newMessage.content) return;

    const logChannel = newMessage.guild.channels.cache.find(
      c => c.name === 'edit-delete-log' && c.type === 0
    );
    if (!logChannel) return;

    logChannel.send(
      `✏️ **${newMessage.author.tag}** edited a message:\n` +
      `**Before:** \`${oldMessage.content || '[no content]'}\`\n` +
      `**After:** \`${newMessage.content || '[no content]'}\``
    );
  }
};
