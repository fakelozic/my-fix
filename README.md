# my-fix

my-fix is a modern, high-performance productivity dashboard designed to help users manage their daily tasks, track long-term habits, visualize focus trends, and stay inspired.

## Core Features

-   **Dynamic Habit Tracking**: A dedicated "Habits" system where you can define and track recurring tasks with a simple cycle-toggle (Done, Missed, or Partial).
-   **Intelligent Task Management**: Organize your day with a dedicated Daily Tasks section and a flexible Kanban Board.
-   **Deep Work Timer**: Built-in Pomodoro-style timer with preset focus sessions (30m/60m) to help you enter flow states.
-   **Multi-View History**: 
    -   **Week View**: A condensed breakdown of focus time and habit completion scores grouped by month.
    -   **Month View**: High-detail habit completion matrices and interactive focus heatmaps.
-   **Database Encryption**: Personal data (habits, tasks, kanban items, quotes) is encrypted using AES-256-CBC before being stored, ensuring your privacy.
-   **Hourly Inspiration**: A custom Quotes widget that rotates your favorite motivational snippets every hour with automatic updates.
-   **Sticky Notes**: Quick-access notes section for jotting down fleeting thoughts and reminders.
-   **Modern UI**: A responsive, 3-column dashboard layout designed for a full-height experience on PC and native scrolling on mobile.

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
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Productivity Principles

my-fix is built on the philosophy that productivity is about **consistency and focus**. By combining habit tracking, time-blocking, and visual reflection, it provides a holistic environment to improve your work systems and maintain a sustainable peak performance.