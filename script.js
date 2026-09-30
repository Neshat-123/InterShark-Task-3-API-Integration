const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

const profileSection = document.getElementById("profileSection");
const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const followers = document.getElementById("followers");
const following = document.getElementById("following");
const repositoryCount = document.getElementById("repositoryCount");
const profileLink = document.getElementById("profileLink");

const repositorySection = document.getElementById("repositorySection");
const repositoryList = document.getElementById("repositoryList");
const repositoryTotal = document.getElementById("repositoryTotal");
const repositorySearch = document.getElementById("repositorySearch");
const noRepositories = document.getElementById("noRepositories");

let repositories = [];

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showError("Please enter a GitHub username.");
        return;
    }

    fetchGitHubData(username);
});

repositorySearch.addEventListener("input", function () {
    const searchTerm = repositorySearch.value.toLowerCase().trim();

    const filteredRepositories = repositories.filter(repository =>
        repository.name.toLowerCase().includes(searchTerm)
    );

    displayRepositories(filteredRepositories);
});

async function fetchGitHubData(username) {
    showLoading();

    try {
        const userResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error("GitHub user not found. Please check the username.");
            }

            throw new Error("Unable to fetch GitHub user data.");
        }

        const userData = await userResponse.json();

        const repositoryResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
        );

        if (!repositoryResponse.ok) {
            throw new Error("Unable to fetch repository data.");
        }

        repositories = await repositoryResponse.json();

        displayProfile(userData);
        displayRepositories(repositories);

        hideLoading();

        profileSection.hidden = false;
        repositorySection.hidden = false;

    } catch (error) {
        hideLoading();
        profileSection.hidden = true;
        repositorySection.hidden = true;
        showError(error.message);
    }
}

function displayProfile(user) {
    profileImage.src = user.avatar_url;
    profileImage.alt = `${user.login}'s GitHub profile picture`;

    profileName.textContent = user.name || user.login;
    profileUsername.textContent = `@${user.login}`;

    profileBio.textContent =
        user.bio || "This GitHub user has not added a bio.";

    followers.textContent = user.followers;
    following.textContent = user.following;
    repositoryCount.textContent = user.public_repos;

    profileLink.href = user.html_url;
}

function displayRepositories(repositoryData) {
    repositoryList.innerHTML = "";

    repositoryTotal.textContent =
        `${repositoryData.length} ${repositoryData.length === 1 ? "repository" : "repositories"}`;

    if (repositoryData.length === 0) {
        noRepositories.hidden = false;
        return;
    }

    noRepositories.hidden = true;

    repositoryData.forEach(repository => {
        const card = createRepositoryCard(repository);
        repositoryList.appendChild(card);
    });
}

function createRepositoryCard(repository) {
    const card = document.createElement("article");
    card.className = "repository-card";

    const title = document.createElement("h3");
    title.textContent = repository.name;

    const description = document.createElement("p");
    description.textContent =
        repository.description || "No description available.";

    const meta = document.createElement("div");
    meta.className = "repository-meta";

    const language = document.createElement("span");
    language.textContent =
        `Language: ${repository.language || "Not specified"}`;

    const stars = document.createElement("span");
    stars.textContent =
        `Stars: ${repository.stargazers_count}`;

    const forks = document.createElement("span");
    forks.textContent =
        `Forks: ${repository.forks_count}`;

    meta.appendChild(language);
    meta.appendChild(stars);
    meta.appendChild(forks);

    const link = document.createElement("a");
    link.href = repository.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Repository →";

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(meta);
    card.appendChild(link);

    return card;
}

function showLoading() {
    loading.hidden = false;
    errorMessage.hidden = true;
}

function hideLoading() {
    loading.hidden = true;
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.hidden = false;
}