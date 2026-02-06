# Confession/Love Letter Bot
A Discord bot that allows users to send anonymous or named love/confession letters to others via a persistent UI with modals and buttons.
## Features
- Persistent confession panel with a "Write Love Letter" button
- Modal form for composing letters with From, To, Content, and Image fields
- Single channel output for all letters (defined in .env)
- Reply system that allows recipients to reply to letters
- Anonymous option for senders
- Database storage for tracking letter history
- Feedback system with star ratings
- Matchmaking panel for finding connections
- Admin commands for managing the bot
## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values:
   - `TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord bot client ID
   - `ALLOWED_GUILD_ID`: The guild ID where the bot will operate
   - `TARIK_ROLE_ID`: Role ID required to use the pull command
   - `CONFESSION_SETUP_CHANNEL_ID`: The channel ID for confession letters
   - `MATCHMAKING_CHANNEL_ID`: The channel ID for matchmaking
   - `FEEDBACK_LOG_CHANNEL_ID`: The channel ID for feedback/suggestion logs
   - `SARAN_CHANNEL_ID`: The channel ID for saran (suggestions) submissions
   - `FEEDBACK_CHANNEL_ID`: The channel ID for new feedback submissions
   - `DAILY_QUOTE_CHANNEL_ID`: The channel ID for daily quotes
4. Start the bot: `npm start`
5. In Discord, use `/setup` command in the channel where you want the panel
6. Click the "Tulis Surat Cinta" button to compose a letter
## Commands
- `/setup` - Creates the confession panel with the "Write Love Letter" button
- `/setup-jodoh` - Sets up the matchmaking panel
- `/setup-saran` - Sets up the feedback/suggestion panel
- `/tarik` - Pulls a user to a voice channel (requires special role)
- `/daily-love` - Checks daily love quotes setup
- `/feedback` - Opens a feedback form with star ratings
## Technical Details
- Uses Discord.js v14
- SQLite database for storing letter information
- Modal forms for user input
- Button interactions for UI flow
- Secure input validation and error handling
- Professional feedback system with star ratings
- Logging system for feedback records