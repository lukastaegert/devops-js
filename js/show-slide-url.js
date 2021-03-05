export function registerShowSlideUrl() {
  const slideUrl = document.querySelector('.slide-url');

  updateOpacity({ currentSlide: document.querySelector('section.present') });

  Reveal.on('slidechanged', updateOpacity);

  function updateOpacity({ currentSlide }) {
    slideUrl.style.opacity = currentSlide.hasAttribute('data-show-slide-url') ? 1 : 0;
  }
}
