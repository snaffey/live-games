# LiveGames - Real-time Football Match Tracker

![LiveGames](https://img.shields.io/badge/LiveGames-1.0-brightgreen)

LiveGames is a modern web application that provides real-time football match information, statistics, and timelines. Built with Next.js and Tailwind CSS, it offers a responsive and intuitive interface for tracking live football matches across various leagues.

## Features

- **Live Match Tracking**: Real-time updates of ongoing football matches
- **Match Details**: Comprehensive match information including scores, team lineups, and match status
- **Interactive Timeline**: Visual representation of key match events (goals, cards, substitutions)
- **Detailed Statistics**: In-depth match statistics with visual comparisons between teams
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing

## Tech Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API Integration**: [API-Football](https://www.api-football.com/) via RapidAPI

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- RapidAPI account with access to API-Football

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/live-games.git
cd live-games
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your API key:

```
NEXT_PUBLIC_API_KEY=your_rapidapi_key_here
```

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Configuration

This project uses the API-Football service through RapidAPI. To get your API key:

1. Sign up for a [RapidAPI](https://rapidapi.com/) account
2. Subscribe to the [API-Football](https://rapidapi.com/api-sports/api/api-football/) API
3. Copy your API key from the RapidAPI dashboard
4. Add it to your `.env.local` file as shown in the installation section

## Project Structure

```
/app                  # Next.js App Router structure
  /[matchId]          # Dynamic route for match details
  /components         # Shared React components
  /services           # API services and data fetching
  /types              # TypeScript type definitions
/components/ui        # UI component library (shadcn/ui)
/public               # Static assets
```

## Features in Detail

### Home Page
- List of live matches grouped by league
- Match cards with team names, scores, and match status
- Auto-refreshing data every 60 seconds

### Match Details Page
- Comprehensive match information with team logos and score
- Tab-based interface for statistics and timeline
- Visual representation of match statistics with comparative bars
- Chronological timeline of match events with icons and details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [API-Football](https://www.api-football.com/) for the football data API
