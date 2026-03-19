const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let page = 1;
const limit = 20;
let mode = "random";
let query = "";

const API_KEY = "pkWDP3CdIJpA600y651ezvEM3iYlGHpFzEt9ixBBbPCenT6NEtIr1Ds3";

/* Intersection Observer */

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
  showSkeleton(6);

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/curated?page=${page}&per_page=${limit}`,
      {
        headers: {
          Authorization: API_KEY,
        },
      },
    );

    const data = await res.json();

    removeSkeleton();

    createImages(data.photos);
  } catch (err) {
    console.log(err);
  }
}

/* Search Images */

async function searchImages() {
  showSkeleton(6);

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&page=${page}&per_page=${limit}`,
      {
        headers: {
          Authorization: API_KEY,
        },
      },
    );

    const data = await res.json();

    removeSkeleton();

    createImages(data.photos);
  } catch (err) {
    console.log(err);
  }
}

/* Create Images */

function createImages(images) {
  if (page === 1 && mode === "search") {
    gallery.innerHTML = "";
  }

  images.forEach((img) => {
    const div = document.createElement("div");

    div.classList.add("grid-item");

    const image = document.createElement("img");

    image.src = "https://via.placeholder.com/300x200";

    image.classList.add("lazy-img");

    image.dataset.src = img.src.large;

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

/* Skeleton */

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
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const fullHeight = document.body.scrollHeight;

  if (scrollTop + windowHeight >= fullHeight - 200) {
    page++;

    if (mode === "search") {
      searchImages();
    } else {
      loadImages();
    }
  }
});

/* Search */

searchBtn.addEventListener("click", () => {
  query = searchInput.value.trim();

  if (!query) return;

  mode = "search";

  page = 1;

  searchImages();
});

/* Initial Load */

loadImages();
