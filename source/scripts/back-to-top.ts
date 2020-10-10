import debounce from 'debounce';
import {html} from 'htm/preact';
import {Component} from 'preact';
import {log} from '..';

type Props = Record<string, unknown>;

type State = {
  hidden: boolean;
};

export class BackToTopFeature extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      hidden: true
    };

    // Add a "debounced" handler to the scroll listener, this will make it so
    // the handler will only run after scrolling has ended for 150ms.
    window.addEventListener('scroll', debounce(this.scrollHandler, 150));

    // Run the handler once in case the page was already scroll down.
    this.scrollHandler();

    log(`Back To Top: Initialized.`);
  }

  scrollHandler = () => {
    this.setState({hidden: window.scrollY < 500});
  };

  scrollToTop = () => {
    window.scrollTo({behavior: 'smooth', top: 0});
  };

  render() {
    const hidden = this.state.hidden ? 'trx-hidden' : '';

    return html`<a
      id="trx-back-to-top"
      class="btn btn-primary ${hidden}"
      onClick=${this.scrollToTop}
    >
      Back To Top
    </a>`;
  }
}
