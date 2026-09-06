console.log("SCRIPT LOADED");

const GITHUB_API_URL = "https://api.github.com";
const MAX_RECENT_SEARCHES = 5;

const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username-input");
const searchButton = document.getElementById("search-button");

const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");

const errorTitle = document.getElementById("error-title");
const errorMessage = document.getElementById("error-message");
const retryButton = document.getElementById("retry-button");

const profileResult = document.getElementById("profile-result");

const profileAvatar = document.getElementById("profile-avatar");
const profileUsername = document.getElementById("profile-username");
const profileName = document.getElementById("profile-name");
const profileBio = document.getElementById("profile-bio");
const profileLink = document.getElementById("profile-link");

const repoCount = document.getElementById("repo-count");
const followersCount = document.getElementById("followers-count");
const followingCount = document.getElementById("following-count");

const profileLocation = document.getElementById("profile-location");
const profileCompany = document.getElementById("profile-company");
const profileWebsite = document.getElementById("profile-website");
const profileJoined = document.getElementById("profile-joined");

const repositoryTotal = document.getElementById("repository-total");
const repositoryList = document.getElementById("repository-list");
const repositoryLoading = document.getElementById("repository-loading");
const noRepositories = document.getElementById("no-repositories");

const recentSearches = document.getElementById("recent-searches");
const recentSearchList = document.getElementById("recent-search-list");

let currentUsername = "";

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showError(
            "Username required",
            "Please enter a GitHub username to continue."
        );
        return;
    }

    searchUser(username);
});

retryButton.addEventListener("click", function () {
    if (currentUsername) {
        searchUser(currentUsername);
    } else {
        usernameInput.focus();
    }
});

async function searchUser(username) {
    currentUsername = username;

    showLoading();
    setSearchButtonState(true);

    try {
        const user = await fetchUser(username);

        displayUser(user);

        await fetchRepositories(username);

        saveRecentSearch(username);
        renderRecentSearches();
    } catch (error) {
        console.error("GitHub API Error:", error);
        handleApiError(error);
    } finally {
        setSearchButtonState(false);
    }
}

async function fetchUser(username) {
    const response = await fetch(
        `${GITHUB_API_URL}/users/${encodeURIComponent(username)}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("GitHub user not found.");
        }

        if (response.status === 403) {
            throw new Error(
                "GitHub API rate limit reached. Please try again later."
            );
        }

        throw new Error(
            `GitHub API returned status ${response.status}.`
        );
    }

    return response.json();
}

async function fetchRepositories(username) {
    repositoryList.innerHTML = "";
    repositoryLoading.hidden = false;
    noRepositories.hidden = true;

    try {
        const response = await fetch(
            `${GITHUB_API_URL}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`
        );

        if (!response.ok) {
            throw new Error("Unable to load repositories.");
        }

        const repositories = await response.json();

        repositoryLoading.hidden = true;

        displayRepositories(repositories);
    } catch (error) {
        repositoryLoading.hidden = true;

        repositoryList.innerHTML = "";

        const message = document.createElement("div");
        message.className = "repository-loading";
        message.textContent = "Unable to load repositories right now.";

        repositoryList.appendChild(message);
    }
}

function displayUser(user) {
    emptyState.hidden = true;
    loadingState.hidden = true;
    errorState.hidden = true;
    profileResult.hidden = false;

    profileAvatar.src = user.avatar_url;
    profileAvatar.alt = `${user.login}'s GitHub profile avatar`;

    profileUsername.textContent = `@${user.login}`;
    profileName.textContent = user.name || "GitHub Developer";
    profileBio.textContent = user.bio || "No bio available.";

    profileLink.href = user.html_url;

    repoCount.textContent = formatNumber(user.public_repos);
    followersCount.textContent = formatNumber(user.followers);
    followingCount.textContent = formatNumber(user.following);

    profileLocation.textContent = user.location || "Not available";
    profileCompany.textContent = user.company || "Not available";

    if (user.blog) {
        const website = normalizeWebsite(user.blog);

        profileWebsite.href = website;
        profileWebsite.textContent = formatWebsite(user.blog);
    } else {
        profileWebsite.removeAttribute("href");
        profileWebsite.textContent = "Not available";
    }

    profileJoined.textContent = formatDate(user.created_at);
}

function displayRepositories(repositories) {
    repositoryList.innerHTML = "";

    const publicRepositories = repositories.filter(
        repository => !repository.fork
    );

    repositoryTotal.textContent =
        `${publicRepositories.length} shown`;

    if (publicRepositories.length === 0) {
        noRepositories.hidden = false;
        return;
    }

    publicRepositories.forEach(repository => {
        const card = createRepositoryCard(repository);
        repositoryList.appendChild(card);
    });
}

function createRepositoryCard(repository) {
    const article = document.createElement("article");
    article.className = "repository-card";

    const title = document.createElement("h3");

    const link = document.createElement("a");
    link.href = repository.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = repository.name;

    title.appendChild(link);

    const description = document.createElement("p");
    description.className = "repository-description";
    description.textContent =
        repository.description || "No description available.";

    const meta = document.createElement("div");
    meta.className = "repository-meta";

    const language = document.createElement("span");

    if (repository.language) {
        const languageDot = document.createElement("span");
        languageDot.className = "language-dot";

        language.appendChild(languageDot);
        language.appendChild(
            document.createTextNode(repository.language)
        );
    } else {
        language.textContent = "No language";
    }

    const stars = document.createElement("span");
    stars.textContent =
        `★ ${formatNumber(repository.stargazers_count)}`;

    const forks = document.createElement("span");
    forks.textContent =
        `⑂ ${formatNumber(repository.forks_count)}`;

    meta.appendChild(language);
    meta.appendChild(stars);
    meta.appendChild(forks);

    article.appendChild(title);
    article.appendChild(description);
    article.appendChild(meta);

    return article;
}

function showLoading() {
    emptyState.hidden = true;
    errorState.hidden = true;
    profileResult.hidden = true;
    loadingState.hidden = false;
}

function showError(title, message) {
    emptyState.hidden = true;
    loadingState.hidden = true;
    profileResult.hidden = true;
    errorState.hidden = false;

    errorTitle.textContent = title;
    errorMessage.textContent = message;
}

function handleApiError(error) {
    let title = "Something went wrong";
    let message =
        "We couldn't retrieve the requested profile.";

    if (error.message.includes("not found")) {
        title = "User not found";
        message =
            "We couldn't find that GitHub username. Check the spelling and try again.";
    } else if (error.message.includes("rate limit")) {
        title = "API limit reached";
        message =
            "GitHub has temporarily limited API requests. Please try again later.";
    } else if (error.message.includes("Failed to fetch")) {
        title = "Connection problem";
        message =
            "Please check your internet connection and try again.";
    } else if (error.message) {
        message = error.message;
    }

    showError(title, message);
}

function setSearchButtonState(isLoading) {
    searchButton.disabled = isLoading;

    searchButton.textContent =
        isLoading ? "Searching..." : "Search";
}

function formatNumber(number) {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number || 0);
}

function formatDate(dateString) {
    if (!dateString) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric"
    }).format(new Date(dateString));
}

function normalizeWebsite(url) {
    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `https://${url}`;
}

function formatWebsite(url) {
    return url
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
}

function getRecentSearches() {
    try {
        return JSON.parse(
            localStorage.getItem("githubRecentSearches")
        ) || [];
    } catch {
        return [];
    }
}

function saveRecentSearch(username) {
    const searches = getRecentSearches();

    const normalizedUsername =
        username.toLowerCase();

    const updatedSearches = [
        normalizedUsername,
        ...searches.filter(
            item => item !== normalizedUsername
        )
    ].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(
        "githubRecentSearches",
        JSON.stringify(updatedSearches)
    );
}

function renderRecentSearches() {
    const searches = getRecentSearches();

    recentSearchList.innerHTML = "";

    if (searches.length === 0) {
        recentSearches.hidden = true;
        return;
    }

    recentSearches.hidden = false;

    searches.forEach(username => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "recent-search-item";
        button.textContent = `@${username}`;

        button.addEventListener("click", function () {
            usernameInput.value = username;
            searchUser(username);
        });

        recentSearchList.appendChild(button);
    });
}

renderRecentSearches();
