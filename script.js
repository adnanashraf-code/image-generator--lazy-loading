const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");

let page = Math.floor(Math.random() * 50) + 1;
const limit = 20;
let mode = "random";
let query = "";
let isLoading = false;

const API_KEY = "ngEyN97apXaF72xVg5GHRoPwAJUE3fqM9xri2qpKeGepe8c0X1iL7oki";

/* Modal */

const modal = document.createElement("div");
modal.classList.add("modal");

modal.innerHTML = `
<span class="close">&times;</span>
<img class="modal-img">
`;

document.body.appendChild(modal);

const modalImg = modal.querySelector(".modal-img");
const closeBtn = modal.querySelector(".close");

closeBtn.onclick = () => {
  modal.style.display = "none";
};

/* Lazy Loading */

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const img = entry.target;

    img.src = img.dataset.src;

    img.onload = () => {
      img.classList.add("loaded");
      resizeGridItem(img.parentElement);
    };

    obs.unobserve(img);
  });
});

/* Load Random Images */

async function loadImages() {
  if (isLoading) return;

  isLoading = true;

  showSkeleton(6);

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/curated?page=${page}&per_page=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: API_KEY,
        },
      },
    );

    const data = await res.json();

    removeSkeleton();

    createImages(data.photos);
  } catch (err) {
    console.log("Error:", err);
    removeSkeleton();
  }

  isLoading = false;
}

/* Search Images */

async function searchImages() {
  if (isLoading) return;

  isLoading = true;

  showSkeleton(6);

  if (page === 1) {
    gallery.innerHTML = "";
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&page=${page}&per_page=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: API_KEY,
        },
      },
    );

    const data = await res.json();

    removeSkeleton();

    if (!data.photos || data.photos.length === 0) {
      gallery.innerHTML = "<h2>No images found</h2>";
      return;
    }

    createImages(data.photos);
  } catch (err) {
    console.log("Error:", err);
    removeSkeleton();
  }

  isLoading = false;
}

/* Create Images */

function createImages(images) {
  images.forEach((img) => {
    const div = document.createElement("div");
    div.classList.add("grid-item");

    const image = document.createElement("img");

    image.src = "https://via.placeholder.com/300x200";

    image.dataset.src = img.src.large;

    image.classList.add("lazy-img");

    image.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.src.large2x;
    });

    div.appendChild(image);

    gallery.appendChild(div);

    observer.observe(image);
  });
}

/* Masonry Layout */

function resizeGridItem(item) {
  const rowHeight = parseInt(
    window.getComputedStyle(gallery).getPropertyValue("grid-auto-rows"),
  );

  const rowGap = parseInt(
    window.getComputedStyle(gallery).getPropertyValue("gap"),
  );

  const img = item.querySelector("img");

  const itemHeight = img.getBoundingClientRect().height;

  const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap));

  item.style.gridRowEnd = "span " + rowSpan;
}

/* Skeleton Loading */

function showSkeleton(count) {
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");

    skeleton.classList.add("skeleton");

    gallery.appendChild(skeleton);
  }
}

function removeSkeleton() {
  document.querySelectorAll(".skeleton").forEach((s) => s.remove());
}

/* Infinite Scroll */

window.addEventListener("scroll", () => {
  if (isLoading) return;

  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const fullHeight = document.body.scrollHeight;

  if (scrollTop + windowHeight >= fullHeight - 500) {
    page++;

    if (mode === "search") {
      searchImages();
    } else {
      loadImages();
    }
  }
});

/* Search */

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    query = searchInput.value.trim();

    if (!query) return;

    mode = "search";
    page = 1;

    searchImages();
  }
});

/* Initial Load */

loadImages();
