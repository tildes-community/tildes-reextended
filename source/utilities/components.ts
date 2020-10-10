import {html} from 'htm/preact';
import {TRXComponent} from '..';

type LinkProps = {
  class: string;
  text: string;
  url: string;
};

/**
 * A `<a />` helper component with `target="_blank"` and `rel="noopener"`.
 * @param props Link properties.
 */
export function Link(props: LinkProps): TRXComponent {
  return html`
    <a
      class="${props.class}"
      href="${props.url}"
      target="_blank"
      rel="noopener"
    >
      ${props.text}
    </a>
  `;
}
