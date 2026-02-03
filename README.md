# Confession/Love Letter Bot

A Discord bot that allows users to send anonymous or named love/confession letters to others via a persistent UI with modals and buttons.

## Features

- Persistent confession panel with a "Write Love Letter" button
- Modal form for composing letters with From, To, Content, and Image fields
- Single channel output for all letters (defined in .env)
- Reply system that allows recipients to reply to letters
- Anonymous option for senders
- Database storage for tracking letter history

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values:
   - `TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord bot client ID
   - `TARGET_CHANNEL_ID`: The channel ID where letters will appear
4. Start the bot: `npm start`
5. In Discord, use `/setup` command in the channel where you want the panel
6. Click the "Tulis Surat Cinta" button to compose a letter

## Commands

- `/setup` - Creates the confession panel with the "Write Love Letter" button

## Technical Details

- Uses Discord.js v14
- SQLite database for storing letter information
- Modal forms for user input
- Button interactions for UI flow
- Secure input validation and error handling