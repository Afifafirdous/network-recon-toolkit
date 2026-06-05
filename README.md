# 🛡️ Network Recon Toolkit

A cybersecurity-themed web application for network intelligence and reconnaissance.
Built as a portfolio project demonstrating full-stack development skills.

## Features

| Tab | Description |
|-----|-------------|
| 🌐 IP Lookup | Geolocation, ISP, ASN, proxy/VPN detection for any IPv4/IPv6 |
| 🌍 My IP | Auto-detect and display your own public IP information |
| 🔎 Domain → IP | Resolve domain names to IPs with full geo data |
| 📡 DNS Lookup | Query A, AAAA, MX, NS, TXT, CNAME, SOA records |
| 🏢 ASN Lookup | Organization, RIR, abuse contacts via BGPView |
| 📜 History | Local search history with re-run capability |

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Tailwind CSS (dark cybersecurity theme)
- Zustand (history state + localStorage persistence)
- React Router v6

**Backend**
- Node.js + Express + TypeScript
- express-rate-limit, helmet, cors
- ip-api.com (free, no API key needed)
- BGPView API (free, no API key needed)

## Quick Start

### Prerequisites
- Node.js 18+

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:3001