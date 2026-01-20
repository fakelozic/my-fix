# my-fix

my-fix is a modern, high-performance productivity dashboard designed to help users manage their daily tasks, visualize their focus trends, and stay inspired.

## Core Features

-   **Intelligent Task Management**: Organize your day with a dedicated Daily Tasks section and a flexible Kanban Board.
-   **Deep Work Timer**: Built-in Pomodoro-style timer with preset focus sessions (30m/60m) to help you enter flow states.
-   **Database Encryption**: Personal data (tasks, kanban items, quotes) is encrypted using AES-256-CBC before being stored, ensuring your privacy.
-   **Hourly Inspiration**: A custom Quotes widget that rotates your favorite motivational snippets every hour with automatic updates.
-   **Visual Analytics**: Track your productivity over time with interactive history charts and calendar heatmaps.
-   **Secure Sessions**: Built-in JWT-based authentication to keep your tasks and notes private.
-   **Modern UI**: A beautiful, dark-mode-first design with glassmorphism effects and responsive layouts optimized for both desktop and mobile.

## Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
-   **Database**: [Neon](https://neon.tech/) (Serverless PostgreSQL)
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Authentication**: Custom JWT implementation using `jose` and `bcryptjs`
-   **Encryption**: Node.js `crypto` (AES-256-CBC)
-   **Styling**: Tailwind CSS
-   **UI Components**: Radix UI & Lucide Icons
-   **Charts**: Recharts

## Getting Started

### Prerequisites

-   Node.js 18+ 
-   A Neon PostgreSQL database instance

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file:
   ```env
   DATABASE_URL=your_neon_postgres_url
   JWT_SECRET=your_secure_random_string
   ENCRYPTION_KEY=your_32_byte_hex_key
   ```
4. Push the database schema:
   ```bash
   npx drizzle-kit push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Productivity Principles

my-fix is built on the philosophy that productivity is about **focus, not just busyness**. By combining task tracking with time-blocking (the timer) and reflection (the history charts), it provides a holistic environment to improve your work habits and maintain a consistent focus streak.
