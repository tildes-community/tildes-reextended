type Props = {
  class?: string;
  text: string;
  url: string;
};

/** An `<a />` helper component with `target="_blank"` and `rel="noopener"`. */
export function Link(props: Props): TRXComponent {
  return (
    <a class={props.class} href={props.url} target="_blank" rel="noopener">
      {props.text}
    </a>
  );
}
