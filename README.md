# LiveGames - Real-time Football Match Tracker

![LiveGames](https://img.shields.io/badge/LiveGames-1.0-brightgreen)

LiveGames is a modern web application that provides real-time football match information, statistics, and timelines. Built with Next.js and Tailwind CSS, it offers a responsive and intuitive interface for tracking live football matches across various leagues.

## Features

- **Live Match Tracking**: Real-time updates of ongoing football matches with adaptive refresh rates
- **Match Details**: Comprehensive match information including scores, team lineups, and match status
- **Interactive Timeline**: Visual representation of key match events (goals, cards, substitutions)
- **Detailed Statistics**: In-depth match statistics with visual comparisons between teams
- **User Authentication**: Secure login and registration system powered by Supabase
- **Favorites System**: Ability to save and track favorite matches
- **Smart Caching**: Optimized API usage with intelligent caching strategies
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing

## Tech Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API Integration**: [API-Football](https://www.api-football.com/) via RapidAPI
- **Authentication & Database**: [Supabase](https://supabase.com/) for user management and favorites storage
- **State Management**: React Context API for global state
- **Performance**: Custom caching system for optimized API usage

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- RapidAPI account with access to API-Football
- Supabase account (for authentication and favorites features)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/snaffey/live-games.git
cd live-games
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your API keys:

```
NEXT_PUBLIC_API_KEY=your_rapidapi_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
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

## Supabase Configuration

For authentication and favorites functionality, you'll need to set up Supabase:

1. Create a [Supabase](https://supabase.com/) account and project
2. Set up authentication with email/password provider
3. Create a `favorite_matches` table with the following schema:
   - `id`: uuid (primary key)
   - `user_id`: uuid (foreign key to auth.users)
   - `match_id`: text
   - `created_at`: timestamp with time zone
4. Copy your Supabase URL and anon key to your `.env.local` file

## Project Structure

```
/app                  # Next.js App Router structure
  /[matchId]          # Dynamic route for match details
  /components         # Shared React components
  /services           # API services and data fetching
  /types              # TypeScript type definitions
  /context            # React context providers
  /auth               # Authentication pages
  /favorites          # User favorites page
/components/ui        # UI component library (shadcn/ui)
/lib                  # Utility functions and services
  /cache.ts           # Caching system implementation
  /supabase.ts        # Supabase client and helpers
/public               # Static assets
```

## Features in Detail

### Home Page
- List of live matches grouped by league
- Match cards with team names, scores, and match status
- Adaptive refresh rates based on match status (30s for live matches, 2min for others)
- Manual refresh button for immediate updates

### Match Details Page
- Comprehensive match information with team logos and score
- Tab-based interface for statistics and timeline
- Visual representation of match statistics with comparative bars
- Chronological timeline of match events with icons and details
- Auto-refreshing data for live matches

### Authentication System
- Secure login and registration with email/password
- Protected routes for authenticated users
- User session management

### Favorites System
- Save matches to your favorites list
- Dedicated page to view your favorite matches
- Toggle favorites status from match cards

### Caching System
- Smart caching strategy with different expiration times based on match status:
  - Live matches: 30 seconds
  - Match details: 2 minutes
  - Scheduled matches: 5 minutes
  - Finished matches: 30 minutes
- Memory and localStorage caching for optimal performance
- Debounce mechanism to prevent API rate limiting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [API-Football](https://www.api-football.com/) for providing the football data API
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the authentication and database services
