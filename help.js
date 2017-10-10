const commands = () => [
  '!help — get the list of available commands',
  '!reminder — !reminder [Take clothes out] in [3 seconds / minutes / hours / days]',
  '!weather - !weather London',
  '!toggleNotifications',
].join('\n\n');

module.exports.commands = commands;
