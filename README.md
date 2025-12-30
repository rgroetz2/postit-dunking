# Virtual Post-It Dunking Game

A browser-based single-player game where you throw crumpled post-its into a moving office bin from a bird's eye view. Score points by successfully dunking post-its within a 20-second time limit!

## 🎮 Game Overview

Test your aim and timing in this fast-paced throwing game. You have 20 seconds to throw as many crumpled post-its as possible into a moving office bin. Each post-it is randomly colored, and different colors are worth different points based on their difficulty level.

## 📋 Game Rules

### Objective
Score as many points as possible by successfully dunking crumpled post-its into the office bin within 20 seconds.

### Game Duration
- **20 seconds** per game
- The timer starts counting down when you click "Start Game"
- You can throw as many post-its as you want during this time

### Scoring System
Points are awarded based on the color of the post-it you successfully dunk:

- **🟢 Green Post-It**: **1 point** (Easy - larger collision area)
- **🟡 Yellow Post-It**: **2 points** (Medium - normal collision area)
- **🔴 Red Post-It**: **3 points** (Hard - smaller collision area)

### How to Play

1. **Start the Game**: Click the "Start Game" button to begin
2. **Hold the Post-It**: 
   - Click and hold your mouse button near the player (marked with an X)
   - A crumpled post-it will appear with a random color
   - The longer you hold, the more power your throw will have
3. **Aim**: Move your mouse to aim (the post-it stays at the player position while held)
4. **Throw**: Release the mouse button to throw the post-it toward the bin
5. **Repeat**: Quickly grab another post-it and throw again to maximize your score!

### Game Elements

- **Player (X)**: Your throwing position - fixed at the bottom center of the field
- **Office Bin**: Moves automatically from left to right across the field
- **Crumpled Post-Its**: Each throw creates a randomly colored crumpled post-it
- **Bird's Eye View**: The game is viewed from above, showing the entire field

### Audio Feedback

- **🎉 Cheer Sound**: Plays when you successfully dunk a post-it
- **😞 "Buhhh" Sound**: Plays when a post-it misses and goes out of bounds
- **🎰 Jackpot Sound**: Plays when the game ends (after 20 seconds)

### Game Over

When the timer reaches zero:
- A blinking "GAME OVER" sign appears
- The jackpot sound plays
- A summary screen shows:
  - Your total score
  - Breakdown of points by color (Green, Yellow, Red)
  - Number of successful dunks for each color
- Click "Play Again" to restart

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- A modern web browser

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🎯 Tips for High Scores

1. **Speed is Key**: Throw as many post-its as possible - quantity matters!
2. **Aim for the Moving Bin**: The bin moves left to right, so time your throws
3. **Power Control**: Hold longer for more power, but don't waste time - speed is more important
4. **Color Luck**: You can't control the color, but red post-its are worth the most if you can hit them
5. **Practice Your Aim**: Get familiar with the throwing mechanics to improve accuracy

## 🛠️ Technical Details

### Tech Stack

- **Backend**: Node.js + Express (static file server)
- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Styling**: CSS3 with animations
- **Audio**: Web Audio API for sound generation

### Project Structure

```
postit-dunking/
├── server.js              # Express static file server
├── package.json           # Dependencies and scripts
├── README.md             # This file
├── Dockerfile            # Docker configuration (optional)
└── public/
    ├── index.html        # Main game interface
    ├── script.js         # Client-side game logic
    └── style.css         # Styling
```

### Game Configuration

The game canvas dimensions are:
- **Width**: 750px
- **Height**: 338px

Game settings (can be modified in `script.js`):
- Game duration: 20 seconds
- Basket speed: 2 pixels per frame
- Player position: Fixed at bottom center

## 🎨 Features

- ✅ Single-player gameplay
- ✅ 20-second timed rounds
- ✅ Random color system (Green, Yellow, Red)
- ✅ Color-based difficulty and scoring
- ✅ Moving target (office bin)
- ✅ Real-time score tracking
- ✅ Audio feedback (cheer, miss, game over)
- ✅ Visual feedback (confetti animations)
- ✅ Game summary with detailed statistics
- ✅ Bird's eye view perspective
- ✅ Crumpled post-it physics

## 🌐 Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues or pull requests to improve the game!

---

**Have fun and aim for the bin!** 🎯
