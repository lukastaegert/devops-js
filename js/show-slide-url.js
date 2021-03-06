export function registerShowSlideUrl() {
  const slides = Reveal.getSlidesElement();
  const slideUrl = document.createElement('div');
  slides.appendChild(slideUrl);
  slideUrl.classList.add('white-box');
  slideUrl.classList.add('quote-box');
  slideUrl.classList.add('slide-url');

  updateSlideUrl({ currentSlide: Reveal.getCurrentSlide() });

  Reveal.on('slidechanged', updateSlideUrl);

  function updateSlideUrl({ currentSlide }) {
    if (currentSlide.hasAttribute('data-show-slide-url')) {
      slideUrl.innerHTML = `<span style='margin-right: 40px'>☞</span>https://<span style='font-weight: bold'>lukastaegert.github.io/devops-js</span>/#/${Reveal.getSlidePastCount()}`;
      slideUrl.style.opacity = 1;
    } else {
      slideUrl.style.opacity = 0;
    }
  }
}
