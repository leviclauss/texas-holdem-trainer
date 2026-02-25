# RangeIQ — Poker Training App

A full-stack Texas Hold'em poker training web application built with React, Express, and SQLite.

## Features

- **Spot Quiz** — Practice poker decisions with realistic scenarios across all streets
- **Range Trainer** — Interactive 13x13 hand grid to practice GTO-approximate opening/defending ranges
- **Daily Challenge** — One featured hand per day with community results
- **Concept Library** — 12 detailed poker concepts from pot odds to ICM
- **Skill Profile** — ELO rating system with per-category tracking and tier progression

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + Recharts
- **Backend:** Express + SQLite (better-sqlite3)
- **Styling:** Dark poker-table theme with gold accents

## Getting Started

```bash
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

## Project Structure

```
rangeiq/
├── client/         # Vite React app
├── server/         # Express API
├── seed/           # JSON data files (scenarios, ranges, concepts)
└── package.json    # Root with concurrent dev scripts
```
