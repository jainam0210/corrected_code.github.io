const rssConverter = "https://api.rss2json.com/v1/api.json?rss_url=";
const feeds = [
  { name: "bbc", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
  { name: "guardian", url: "https://www.theguardian.com/international/rss" }
];
let allArticles = []; // Store all fetched articles here

const list = document.getElementById("newsList");
const loading = document.getElementById("loading");
const searchInput = document.getElementById("search");
const sourceSelect = document.getElementById("source");
const articleCount = document.getElementById("articleCount");

// Function to display articles based on current filters
function displayArticles() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm) ||
    article.description.toLowerCase().includes(searchTerm)
  );

  articleCount.textContent = `Total articles: ${filteredArticles.length}`;
  list.innerHTML = ""; // Clear previous results

  filteredArticles.forEach(article => {
    const div = document.createElement("div");
    div.className = "news-item";
    div.innerHTML = `
      <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
      <p><strong>Source:</strong> ${article.source} |
         <strong>Date:</strong> ${article.pubDate}</p>
      <p>${article.description}</p>
    `;
    list.appendChild(div);
  });
}

// Function to fetch news from selected sources
async function fetchNews() {
  const source = sourceSelect.value;
  allArticles = []; // Clear existing articles before fetching new ones
  list.innerHTML = ""; // Clear display
  loading.style.display = "block";
  articleCount.textContent = `Total articles: 0`;

  try {
    const selectedFeeds = source === "all" ? feeds : feeds.filter(f => f.name === source);

    // Use Promise.all to fetch feeds concurrently
    const fetchPromises = selectedFeeds.map(async (feed) => {
      const res = await fetch(`${rssConverter}${encodeURIComponent(feed.url)}`);
      if (!res.ok) {
        console.error(`Failed to fetch ${feed.name}`);
        return []; // Return empty array on error for this feed
      }
      const data = await res.json();
      return (data.items || []).map(item => ({
        title: item.title || "No title",
        description: item.description || "No description",
        url: item.link || "#",
        source: feed.name.toUpperCase(),
        pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Unknown"
      }));
    });

    const results = await Promise.all(fetchPromises);
    // Flatten the array of arrays into allArticles
    allArticles = results.flat();

    displayArticles(); // Display the newly fetched articles

  } catch (err) {
    list.innerHTML = `<p style="color: red;">Error fetching news: ${err.message}</p>`;
  } finally {
    loading.style.display = "none";
  }
}

// Event listener for search input
searchInput.addEventListener("input", displayArticles); // Only filter and display

// Event listener for source selection change
sourceSelect.addEventListener("change", fetchNews); // Fetch new articles

// Initial load
fetchNews();