# Global Village 🌍

Global Village is an interactive cultural exploration web application designed to help users learn about countries and cultures around the world in a fun, visual, and accessible way.

The project was developed as part of my COMP3000 Final Year Computing Project at the University of Plymouth. The main aim of the application is to make learning about the world feel relaxed, interactive, and engaging rather than text-heavy or overwhelming.

## Project Overview

Global Village allows users to explore countries, continents, flags, food, cultural facts, and traditions through a range of interactive features. The application combines dynamic country data, visual navigation, and game-based learning to create a more enjoyable educational experience.

The project was inspired by my own multicultural background, growing up in London, speaking Arabic, English, and French, and my experience as an ESL teacher. Through teaching, I noticed that students were more engaged when learning was made visual, interactive, and fun. Global Village applies that same idea to cultural and geographical learning.

## Features

### Interactive World Map

Users can explore the world through an interactive map. Selecting a continent takes the user to a countries page filtered by that region.

### Pixel Map

A playful pixel-style map gives users another way to explore the world using keyboard-based interaction.

### Countries Page

The countries page displays country cards with key information such as:

- Country name
- Flag
- Region
- Capital
- Population

Users can open a modal to view more detailed country and cultural information.

### Cultural Information

The application includes cultural content such as:

- Traditional foods
- Holidays
- Music
- Clothing
- Traditions
- Fun facts

### Guess the Flag Game

A 10-question quiz where users guess the country from its flag. The game includes:

- Score tracking
- Streak tracking
- Immediate feedback
- Confetti animation

### Country Scramble Game

A word-based game where users unscramble country names. This supports memory, spelling, and country-name recognition.

### Food Explorer

A food-based exploration feature that helps users learn about culture through traditional dishes and food images.

### About Page and Fun Facts

The About page explains the purpose of Global Village and includes short fun facts to make cultural learning quick and engaging.

## Tech Stack

Global Village was built using frontend web technologies.

| Technology | Purpose |
|---|---|
| HTML | Page structure and semantic layout |
| CSS | Custom styling, animations, and visual design |
| JavaScript | Interactivity, API calls, games, dynamic rendering, and DOM manipulation |
| Tailwind CSS | Responsive design, layouts, cards, buttons, spacing, and styling |
| D3.js | Rendering the interactive SVG world map |
| REST Countries API | Fetching country names, flags, capitals, regions, and population data |
| Wikipedia API | Supporting food-based content and images |
| JSON | Storing cultural data such as food, holidays, music, clothing, and traditions |
| Web Components | Reusable navigation component |

## Languages Used

- HTML
- CSS
- JavaScript
- JSON

## Project Structure

COMP3000 Project
│
├── .venv
├── data
├── templates
│   ├── assets
│   │   ├── continents.svg
│   │   ├── player.png
│   │   ├── playerboat.png
│   │   ├── world-map-pixel.png
│   │   └── Worldmap.png
│   │
│   ├── scripts
│   │   ├── about.js
│   │   ├── countries.js
│   │   ├── countries-data.js
│   │   ├── food.js
│   │   ├── guess-flag.js
│   │   ├── migration.js
│   │   ├── real-world-map.js
│   │   └── world-map.js
│   │
│   ├── about.html
│   ├── countries.html
│   ├── country-scramble.html
│   ├── country-scramble.js
│   ├── culturalData.json
│   ├── culture-card.js
│   ├── filter-sidebar.js
│   ├── food.html
│   ├── guess-the-flag.html
│   ├── index.html
│   ├── navbar.js
│   ├── pixel-world.html
│   ├── pixel-world.js
│   ├── script.js
│   └── style.css
│
├── README.md
└── requirements.txt
