const commands = () => [
  '!help — get the list of available commands',
  '!reminder — !reminder [Take clothes out] in [3 seconds / minutes / hours / days]',
  '!weather - !weather Cluj-Napoca',
  '!toggleNotifications',
].join('\n\n');

module.exports.commands = commands;
