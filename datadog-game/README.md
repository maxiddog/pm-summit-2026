# 🧩 NYT Puzzles by Datadog - MCP Treasure Hunt

An interactive puzzle experience for the PM Summit 2026 workshop. Play classic NYT-style games while secretly sending telemetry to Datadog. Use MCP to uncover the hidden clues!

## 🎯 The Challenge

1. **Play 3 Games** - Wordle, Connections, and Spelling Bee
2. **Hidden Clues** - Each game sends secret telemetry to Datadog
3. **Use MCP** - Connect Cursor/Claude Code to Datadog MCP and ask your AI to find the clues
4. **Enter Clues** - Input the 3 secret words to win!

## 🎮 The Games

| Game | Description | Hidden Clue Type | Secret Word |
|------|-------------|------------------|-------------|
| 🟩 **Wordle** | Guess the 5-letter word in 6 tries | Metric | `BLUESKY` |
| 🔗 **Connections** | Find 4 groups of 4 related words | Log | `ASTRO` |
| 🐝 **Spelling Bee** | Make words using 7 letters (reach Genius level) | Trace | `RIGATONI` |

## 🔍 How to Find the Clues

### Step 1: Play the Games
Visit [game.pm-summit.xyz](https://game.pm-summit.xyz) and complete each puzzle. The hidden clues are sent to Datadog even if you don't win!

### Step 2: Connect to Datadog MCP
In your Cursor or Claude Code, ensure the `.mcp.json` is configured:

```json
{
  "mcpServers": {
    "datadog": {
      "type": "http",
      "url": "https://mcp.datadoghq.com/api/unstable/mcp-server/mcp",
      "headers": {
        "DD_API_KEY": "<API_KEY>",
        "DD_APPLICATION_KEY": "<APPLICATION_KEY>"
      }
    }
  }
}
```

### Step 3: Ask Your AI Agent
Try prompts like:
- "Look for any hidden easter eggs or clues in the Datadog logs from the nyt-puzzles-by-datadog service"
- "Search for metrics with 'secret' or 'easter_egg' in the tags"
- "Find any traces that contain hidden messages"

### Step 4: Enter the Clues
Once you find all 3 secret words, enter them in the boxes at the bottom of the game page and submit!

## 📊 Telemetry Details

### Wordle Clue (Metric)
When Wordle is completed, a metric is sent:
```javascript
sendMetricToDatadog('wordle.game.completed', 1, {
    secret_easter_egg: 'BLUESKY',
    hidden_clue_type: 'metric',
    message: 'The secret word hidden in this metric is: BLUESKY'
});
```

### Connections Clue (Log)
When Connections is completed, a log is sent:
```javascript
logToDatadog('Connections game completed', 'info', { 
    secret_easter_egg: 'ASTRO',
    hidden_clue_type: 'log',
    message: 'The secret word hidden in this log is: ASTRO'
});
```

### Spelling Bee Clue (Trace)
When reaching Genius level in Spelling Bee, a trace is sent:
```javascript
sendTraceToDatadog('spelling_bee.genius_achieved', {
    secret_easter_egg: 'RIGATONI',
    hidden_clue_type: 'trace',
    message: 'The secret word hidden in this trace is: RIGATONI'
});
```

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start local server
npm start
```

Then open http://localhost:8080

## 🚢 Deployment

```bash
vercel --prod --yes
```

## ⚙️ Configuration

Before the workshop, update the Datadog tokens in `index.html`:

```javascript
window.DD_RUM.init({
    clientToken: 'YOUR_CLIENT_TOKEN',
    applicationId: 'YOUR_APP_ID',
    // ...
});

window.DD_LOGS.init({
    clientToken: 'YOUR_CLIENT_TOKEN',
    // ...
});
```

## 📁 Project Structure

```
datadog-game/
├── index.html      # Main game file (all 3 games + validation)
├── dog.gif         # Mascot image (legacy, can remove)
├── .mcp.json       # MCP server configuration
├── package.json    # Project metadata
├── vercel.json     # Vercel deployment config
└── README.md       # This file
```

## 🎨 Design

The game features an OpenAI-inspired design:
- Clean, minimalistic white/light theme
- Space Grotesk typography
- Subtle shadows and smooth transitions
- Framer Motion (Motion One) animations for the win screen

---

Made with 💜 for PM Summit 2026
