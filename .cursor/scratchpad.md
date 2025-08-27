# Project Scratchpad

## Background and Motivation

## How to get Supabase Environment Variables

To run the `ai-career-dashboard` application, you need to connect it to a Supabase backend. This requires two environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Here is how you can find them in your Supabase project:

1.  **Log in to your Supabase account**: Go to [supabase.com](https://supabase.com) and log in.
2.  **Navigate to your project**: Open the dashboard for the project you want to connect.
3.  **Go to Project Settings**: In the left sidebar, click on the gear icon for "Project Settings".
4.  **Select the API section**: In the settings menu, click on "API".
5.  **Find your credentials**:
    *   **URL**: Under "Project API info", you will find the **Project URL**. This is your `VITE_SUPABASE_URL`.
    *   **Anon Key**: Under "Project API keys", you will find the **anon public** key. This is your `VITE_SUPABASE_ANON_KEY`.

### Creating the `.env` file

Once you have these keys, you need to create a file named `.env` in the `ai-career-dashboard` directory. The content of the file should be:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with the actual values you copied from your Supabase dashboard.

