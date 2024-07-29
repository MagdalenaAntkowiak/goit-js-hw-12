import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const API_KEY = '45147118-3a4bc08e8d7fb4b6ec64761bc';
const BASE_URL = 'https://pixabay.com/api/';
let query = '';
let page = 1;

async function fetchImages(query, page) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: 40,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch images');
  }
}

const form = document.querySelector('#search-form');
const gallery = document.querySelector('#gallery');
const loader = document.querySelector('#loader');
const input = document.querySelector('input[name="query"]');
const loadMoreButton = document.querySelector('#load-more');
const loadMoreContainer = document.querySelector('.load-more');

form.addEventListener('submit', event => {
  event.preventDefault();
  query = input.value.trim();
  if (query === '') return;
  page = 1;
  gallery.innerHTML = '';
  input.value = '';
  loader.style.display = 'block';
  loadMoreContainer.style.display = 'none';

  fetchAndDisplayImages();
});

loadMoreButton.addEventListener('click', () => {
  page += 1;
  fetchAndDisplayImages();
});

async function fetchAndDisplayImages() {
  try {
    const data = await fetchImages(query, page);
    loader.style.display = 'none';

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'center',
      });
      return;
    }

    const markup = data.hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `
        <li>
          <a href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" />
          </a>
          <div class="image-info">
            <div class="info-item"><span class="label">Likes:</span> ${likes}</div>
            <div class="info-item"><span class="label">Views:</span> ${views}</div>
            <div class="info-item"><span class="label">Comments:</span>${comments}</div>
            <div class="info-item"><span class="label">Downloads:</span>${downloads}</div>
          </div>
        </li>
      `
      )
      .join('');

    gallery.insertAdjacentHTML('beforeend', markup);
    new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    }).refresh();

    if (page < Math.ceil(data.totalHits / 40)) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'bottomLeft',
      });
    }

    scrollPage();
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again!',
      position: 'topRight',
    });
    console.error(error);
  }
}

function scrollPage() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
