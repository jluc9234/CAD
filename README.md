# Create-A-Date: AI-Powered Dating App

This is a modern, AI-enhanced dating application built with React, TypeScript, and Tailwind CSS. The backend is powered by Netlify Functions connected to a Neon PostgreSQL database.

## Deployment to Netlify

This project is configured for easy deployment to Netlify.

### 1. Fork and Clone the Repository

Start by forking this repository to your own GitHub account and cloning it to your local machine.

### 2. Set Up a Neon Database

1.  Go to [Neon](https://neon.tech) and create a new project.
2.  Once the project is created, find the **Connection String** for your database. It will look something like `postgres://user:password@host/dbname`. Keep this safe; you will need it for the environment variables.
3.  Navigate to the **SQL Editor** in your Neon project.
4.  Copy the entire content of the `schema.sql` file from this repository and run it in the SQL Editor. This will create all the necessary tables (`users`, `date_ideas`, `likes`, `matches`).

### 3. Create a Netlify Project

1.  Go to [Netlify](https://app.netlify.com) and create a new site from Git.
2.  Connect it to the GitHub repository you forked.
3.  Netlify will automatically detect the build settings from the `netlify.toml` file.
    -   **Build command:** `npm run build`
    -   **Publish directory:** `dist`
    -   **Functions directory:** `netlify/functions`
4.  Before deploying, you must configure the environment variables.

### 4. Configure Environment Variables

In your Netlify site settings, go to **Site configuration > Environment variables** and add the following variables:

-   `DATABASE_URL`: The connection string from your Neon database.
-   `JWT_SECRET`: A long, random, and secret string used for signing authentication tokens. You can generate one using a password generator.
-   `API_KEY`: Your Google Gemini API key.
-   `PAYPAL_CLIENT_ID`: Your PayPal application's Client ID.
-   `PAYPAL_CLIENT_SECRET`: Your PayPal application's Client Secret.
-   `PAYPAL_WEBHOOK_ID`: The ID of the webhook you configured in your PayPal developer dashboard.

### 5. Deploy

Once the environment variables are set, trigger a deployment in Netlify. Your site will be built and deployed.

## Local Development

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:** Create a `.env` file in the root of the project and add the same environment variables you configured in Netlify.
3.  **Install Netlify CLI:**
    ```bash
    npm install -g netlify-cli
    ```
4.  **Run the Development Server:**
    The Netlify CLI will run your Vite dev server and the serverless functions together.
    ```bash
    netlify dev
    ```
    This will start the application, usually available at `http://localhost:8888`. API requests to `/api/*` will be correctly proxied to your local functions.
