const dns = require('node:dns');

/**
 * Configure DNS resolution for MongoDB Atlas SRV lookups.
 *
 * Problem Context:
 * On Windows systems running modern Node.js (v20+ / v22+ / v24+), the c-ares asynchronous
 * DNS resolver can return `ECONNREFUSED` on SRV queries (`_mongodb._tcp.cluster.mongodb.net`)
 * due to virtual adapters (WSL, Hyper-V, VPN) or local IPv6 binding conflicts, even though
 * Windows native `nslookup` succeeds.
 *
 * Cross-Platform Solution:
 * 1. If `DNS_SERVERS` is explicitly defined in environment variables, use those servers.
 * 2. If running on Windows (`process.platform === 'win32'`) and connecting to an Atlas SRV URI (`mongodb+srv://`),
 *    automatically fallback to public resolvers (Google `8.8.8.8` & Cloudflare `1.1.1.1`).
 * 3. In Linux / production environments (e.g. Render, Docker, AWS), do NOT override system DNS
 *    unless `DNS_SERVERS` is explicitly specified. This preserves internal cloud DNS resolution.
 *
 * @param {string} mongoUri - MongoDB connection URI
 */
function configureDNS(mongoUri = '') {
  if (process.env.DNS_SERVERS) {
    const servers = process.env.DNS_SERVERS
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (servers.length > 0) {
      dns.setServers(servers);
      console.log(`[DNS] Explicit DNS resolvers configured: ${servers.join(', ')}`);
      return;
    }
  }

  const isWindows = process.platform === 'win32';
  const isAtlasSRV = typeof mongoUri === 'string' && mongoUri.startsWith('mongodb+srv://');

  if (isWindows && isAtlasSRV) {
    const fallbackServers = ['8.8.8.8', '1.1.1.1'];
    dns.setServers(fallbackServers);
    console.log(`[DNS] Windows Atlas SRV fallback applied: ${fallbackServers.join(', ')}`);
  } else {
    console.log('[DNS] Using default operating system DNS resolver.');
  }
}

module.exports = configureDNS;
