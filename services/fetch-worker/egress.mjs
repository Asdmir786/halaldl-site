import { lookup } from "node:dns/promises";
import { createServer } from "node:http";
import { BlockList, connect, isIP } from "node:net";
import { networkInterfaces } from "node:os";

const denied = new BlockList();
for (const [ip, bits] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]]) denied.addSubnet(ip, bits, "ipv4");
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
denied.addSubnet("2001::", 23, "ipv6");
denied.addSubnet("2001:db8::", 32, "ipv6");
denied.addSubnet("2002::", 16, "ipv6");

export function isPublicAddress(address, blocked = []) {
  const version = isIP(address);
  const hostAddresses = new BlockList();
  for (const ip of blocked) { if (isIP(ip)) hostAddresses.addAddress(ip, isIP(ip) === 4 ? "ipv4" : "ipv6"); }
  if (!version || hostAddresses.check(address, version === 4 ? "ipv4" : "ipv6")) return false;
  return version === 4 ? !denied.check(address, "ipv4") : globalV6.check(address, "ipv6") && !denied.check(address, "ipv6");
}

export async function resolvePublic(hostname, { resolver = lookup, blocked = [] } = {}) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.length > 253) throw new Error("blocked_destination");
  let timer;
  const addresses = await Promise.race([
    isIP(host) ? Promise.resolve([{ address: host, family: isIP(host) }]) : resolver(host, { all: true, verbatim: true }),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("dns_timeout")), 5000); }),
  ]).finally(() => clearTimeout(timer));
  if (!addresses.length || addresses.some(a => !isPublicAddress(a.address, blocked))) throw new Error("blocked_destination");
  return addresses[0];
}

// Every CONNECT (including redirects/CDN requests) resolves once, validates all
// answers and connects to that pinned address. TLS verification stays in yt-dlp.
export async function createEgressProxy(options = {}) {
  const blocked = [...Object.values(networkInterfaces()).flat().filter(Boolean).map(a => a.address), ...(options.blocked ?? [])];
  const sockets = new Set();
  const server = createServer((_req, res) => { res.writeHead(403); res.end("HTTPS connections only"); });
  server.maxConnections = 24;
  server.headersTimeout = 10_000;
  server.on("connection", socket => { sockets.add(socket); socket.on("close", () => sockets.delete(socket)); socket.on("error", () => {}); });
  server.on("connect", async (req, client, head) => {
    let upstream;
    try {
      const match = /^(\[[0-9a-f:]+\]|[a-z0-9.-]+):443$/i.exec(req.url ?? "");
      if (!match) throw new Error("blocked_destination");
      const target = await resolvePublic(match[1], { ...options, blocked });
      if (client.destroyed) return;
      upstream = connect({ host: target.address, family: target.family, port: 443 });
      sockets.add(upstream);
      upstream.setTimeout(30_000, () => upstream.destroy());
      upstream.on("error", () => client.destroy());
      client.on("close", () => upstream.destroy());
      upstream.on("close", () => { sockets.delete(upstream); client.destroy(); });
      upstream.once("connect", () => {
        client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        if (head.length) upstream.write(head);
        upstream.pipe(client); client.pipe(upstream);
      });
    } catch {
      upstream?.destroy();
      if (!client.destroyed) client.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");
    }
  });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(options.port ?? 0, "127.0.0.1", resolve); });
  return { url: `http://127.0.0.1:${server.address().port}`, close: async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise(resolve => server.close(resolve));
  } };
}
