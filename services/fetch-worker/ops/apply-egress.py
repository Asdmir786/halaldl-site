"""Render by default; --apply installs only the worker UID's own nftables table.

This file is deployment tooling, not an application startup side effect. Install
root-owned alongside the reviewed systemd units; never call it from the web app.
"""
import argparse
import ipaddress
import json
import os
from pathlib import Path
import pwd
import subprocess


def rules(uid, addresses, table_exists):
    public_hosts = [ipaddress.ip_address(ip) for ip in addresses]
    lines = ["delete table inet halaldl_fetch_egress"] if table_exists else []
    lines += ["table inet halaldl_fetch_egress {", "chain output {", "type filter hook output priority -10; policy accept;",
              f"meta skuid {uid} ct state established,related accept",
              f"meta skuid {uid} ip daddr 127.0.0.1 tcp dport 18656 accept",
              f"meta skuid {uid} ip daddr {{ 127.0.0.53, 127.0.0.54 }} udp dport 53 accept",
              f"meta skuid {uid} ip daddr {{ 127.0.0.53, 127.0.0.54 }} tcp dport 53 accept"]
    for ip in public_hosts:
        family = "ip" if ip.version == 4 else "ip6"
        lines.append(f"meta skuid {uid} {family} daddr {ip} reject")
    v4 = "0.0.0.0/8, 10.0.0.0/8, 100.64.0.0/10, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.0.0.0/24, 192.0.2.0/24, 192.168.0.0/16, 198.18.0.0/15, 198.51.100.0/24, 203.0.113.0/24, 224.0.0.0/4, 240.0.0.0/4"
    lines += [f"meta skuid {uid} ip daddr {{ {v4} }} reject",
              f"meta skuid {uid} ip6 daddr != 2000::/3 reject",
              f"meta skuid {uid} ip6 daddr {{ 2001::/23, 2001:db8::/32, 2002::/16 }} reject", "}", "}"]
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    uid = pwd.getpwnam("halaldl-fetch").pw_uid
    interfaces = json.loads(subprocess.check_output(["ip", "-j", "address", "show"], text=True))
    addresses = [a["local"] for interface in interfaces for a in interface.get("addr_info", [])]
    extra = Path("/etc/halaldl-fetch-blocked-addresses")
    if extra.exists():
        addresses += [line.strip() for line in extra.read_text().splitlines() if line.strip() and not line.startswith("#")]
    exists = subprocess.run(["nft", "list", "table", "inet", "halaldl_fetch_egress"], capture_output=True).returncode == 0
    config = rules(uid, addresses, exists)
    if not args.apply:
        print(config, end="")
        return
    if os.geteuid() != 0:
        raise SystemExit("Root is required to apply the reviewed firewall")
    subprocess.run(["nft", "--check", "-f", "-"], input=config, text=True, check=True)
    subprocess.run(["nft", "-f", "-"], input=config, text=True, check=True)
    ready = Path("/run/halaldl-fetch-egress/ready")
    ready.write_text("worker-egress-v2\n")
    ready.chmod(0o644)


if __name__ == "__main__":
    main()
