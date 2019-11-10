import debounce from 'debounce';
import {
  getSettings,
  Settings,
  createElementFromString,
  querySelector
} from '../utilities';

(async (): Promise<void> => {
  const settings: Settings = await getSettings();
  if (!settings.features.backToTop) {
    return;
  }

  // Create the Back To Top button.
  const backToTopButton: HTMLAnchorElement = createElementFromString(
    '<a id="trx-back-to-top" class="btn btn-primary trx-hidden">Back To Top</a>'
  );
  backToTopButton.addEventListener('click', clickHandler);
  document.body.append(backToTopButton);

  // Add a "debounced" handler to the scroll listener, this will make it so
  // the handler will only run after scrolling has ended for 150ms.
  window.addEventListener('scroll', debounce(scrollHandler, 150));
  // And finally run the handler once, in case the page was already scrolled
  // down when it got loaded.
  scrollHandler();
})();

function scrollHandler(): void {
  const backToTopButton: HTMLAnchorElement = querySelector('#trx-back-to-top');
  const yPosition: number = window.scrollY;
  // TODO: See if 500 is a good position. Tildes Extended was originally at 250
  // but I think that might be a bit too little.
  if (yPosition > 500) {
    backToTopButton.classList.remove('trx-hidden');
  } else {
    backToTopButton.classList.add('trx-hidden');
  }
}

function clickHandler(): void {
  window.scrollTo({behavior: 'smooth', top: 0});
}
