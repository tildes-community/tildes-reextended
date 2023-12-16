import {log, querySelector} from "../../utilities/exports.js";

export function runThemedLogoFeature() {
  if (themedLogo()) {
    log("Themed Logo: Initialized.");
  }
}

const tildesLogo = `
<svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 100 100">
  <rect fill="var(--background-primary-color)" width="100" height="100"/>
  <rect fill="var(--comment-label-joke-color)" width="12.5" height="12.5" x="0" y="50"/>
  <rect fill="var(--comment-label-offtopic-color)" width="12.5" height="12.5" x="12.5" y="37.5"/>
  <rect fill="var(--comment-label-exemplary-color)" width="12.5" height="12.5" x="25" y="25"/>
  <rect fill="var(--stripe-mine-color)" width="12.5" height="12.5" x="37.5" y="37.5"/>
  <rect fill="var(--button-used-color)" width="12.5" height="12.5" x="50" y="50"/>
  <rect fill="var(--comment-label-malice-color)" width="12.5" height="12.5" x="62.5" y="62.5"/>
  <rect fill="var(--alert-color)" width="12.5" height="12.5" x="75" y="50"/>
  <rect fill="var(--comment-label-noise-color)" width="12.5" height="12.5" x="87.5" y="37.5"/>
</svg>
`;

function themedLogo(): boolean {
  const siteHeader = querySelector<HTMLElement>(".site-header-logo");
  if (siteHeader.dataset.trxThemedLogo === "true") {
    return false;
  }

  let themedLogo = tildesLogo;
  for (const customProperty of tildesLogo.match(/var\(--.+\)/g) ?? []) {
    let color = window
      .getComputedStyle(document.body)
      .getPropertyValue(customProperty.slice("var(".length, -1));
    if (color === "") {
      color = "#f0f";
    }

    themedLogo = themedLogo.replace(customProperty, color);
  }

  const encodedSvg = encodeURIComponent(themedLogo);
  siteHeader.dataset.trxThemedLogo = "true";
  siteHeader.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;
  return true;
}
