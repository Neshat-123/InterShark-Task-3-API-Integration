# GitHub Explorer

A simple and responsive GitHub Explorer web application that allows users to search for GitHub profiles and explore their public repositories using the GitHub REST API.

## Features

* Search GitHub users by username
* Display GitHub profile information
* Display profile picture, name, username and bio
* Show followers and following count
* Show public repository count
* View the user's GitHub profile
* Display public repositories
* Show repository language, stars and forks
* Search and filter repositories
* Loading state while fetching data
* Error handling for invalid usernames
* Responsive design for desktop and mobile devices

## Technologies Used

* HTML5
* CSS3
* JavaScript
* GitHub REST API

## API Used

This project uses the GitHub REST API.

### User API

https://api.github.com/users/{username}

### Repository API

https://api.github.com/users/{username}/repos

## How to Run

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a web browser.
4. Enter a GitHub username in the search box.
5. Click the **Search** button.
6. Explore the user's profile and repositories.

## Project Structure

InterShark-Task-3-API-Integration/
│
├── index.html
├── style.css
├── script.js
└── README.md

## Error Handling

The application handles:

* Empty username input
* GitHub users that do not exist
* API request errors
* Users with no public repositories

## Responsive Design

The application is designed to work on:

* Desktop
* Laptop
* Tablet
* Mobile devices

## Internship Task

This project was created as part of the **InterShark Internship – Task 3: API Integration**.

## Author

Neshat Parween

GitHub: [Neshat-123](https://github.com/Neshat-123)