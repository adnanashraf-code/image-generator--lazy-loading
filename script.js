const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");

let page = Math.floor(Math.random() * 50) + 1;
const limit = 20;
let mode = "random";
let query = "";
let isLoading = false;

const API_KEY = "YOUR_API_KEY";

/* MODAL */

const modal = document.createElement("div");
modal.className = "modal";

modal.innerHTML = `
  <span class="close">&times;</span>
  <img class="modal-img">
`;

document.body.appendChild(modal);

const modalImg = modal.querySelector(".modal-img");

modal.querySelector(".close").onclick = () => {
  modal.style.display = "none";
};

/* OBSERVER */

const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const img = entry.target;

      if (img.dataset.src) {
        img.src = img.dataset.src;
      }

      obs.unobserve(img);
    });
  },
  { rootMargin: "200px" },
);

/* FETCH */

async function fetchImages(url) {
  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  return res.json();
}

/* LOAD RANDOM */

async function loadImages() {
  if (isLoading) return;

  isLoading = true;
  showSkeleton(6);

  try {
    const data = await fetchImages(
      `https://api.pexels.com/v1/curated?page=${page}&per_page=${limit}`,
    );

    removeSkeleton();
    createImages(data.photos);
  } catch (err) {
    console.log(err);
    removeSkeleton();
  }

  isLoading = false;
}

/* SEARCH */

async function searchImages() {
  if (isLoading) return;

  isLoading = true;
  showSkeleton(6);

  if (page === 1) gallery.innerHTML = "";

  try {
    const data = await fetchImages(
      `https://api.pexels.com/v1/search?query=${query}&page=${page}&per_page=${limit}`,
    );

    removeSkeleton();

    if (!data.photos.length) {
      gallery.innerHTML = "<h2>No images found</h2>";
      return;
    }

    createImages(data.photos);
  } catch (err) {
    console.log(err);
    removeSkeleton();
  }

  isLoading = false;
}

/* CREATE IMAGES */

function createImages(images) {
  images.forEach((imgData) => {
    const div = document.createElement("div");
    div.className = "grid-item";

    const img = document.createElement("img");

    img.src = imgData.src.tiny; // blur preview
    img.dataset.src = imgData.src.large;

    img.loading = "lazy";

    img.onload = () => {
      img.classList.add("loaded");
    };

    img.onerror = () => {
      img.src = imgData.src.medium || imgData.src.small;
      img.classList.add("loaded");
    };

    img.onclick = () => {
      modal.style.display = "flex";
      modalImg.src = imgData.src.large2x;
    };

    div.appendChild(img);
    gallery.appendChild(div);

    observer.observe(img);
  });
}

/* SKELETON */

function showSkeleton(count) {
  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "grid-item";

    const skeleton = document.createElement("div");
    skeleton.className = "skeleton";

    div.appendChild(skeleton);
    gallery.appendChild(div);
  }
}

function removeSkeleton() {
  document.querySelectorAll(".skeleton").forEach((el) => el.remove());
}

/* SCROLL */

window.addEventListener("scroll", () => {
  if (isLoading) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    page++;
    mode === "search" ? searchImages() : loadImages();
  }
});

/* SEARCH */

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    query = searchInput.value.trim();

    if (!query) return;

    mode = "search";
    page = 1;
    searchImages();
  }
});

/* INIT */

loadImages();
