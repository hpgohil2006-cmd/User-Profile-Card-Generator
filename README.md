# User Profile Card Generator

A polished Node.js + Express + SQLite app that lets users submit profile details, generate dynamic profile cards on the server, and store the results in a local database.

## Features

- Server-side form processing with Express
- String sanitization and formatting
- Dynamic HTML profile card rendering using EJS
- SQLite persistence for created profiles
- Modern responsive dashboard UI

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## Project structure

- `server.js` – Express server and database setup
- `views/index.ejs` – form and profile gallery UI
- `public/styles.css` – responsive styling
- `data/profiles.db` – SQLite database (created automatically)

## Notes

The app stores profile records in SQLite so every generated card remains available after refresh.
