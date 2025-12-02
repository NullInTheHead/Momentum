function formatUsername(username) {
  if (!username || typeof username !== 'string') return '';
  return username.toLowerCase().trim();
}
function formatName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
module.exports = { formatUsername, formatName };
