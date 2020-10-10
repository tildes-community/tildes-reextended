import platform from 'platform';

/**
 * Creates a bug report template in Markdown.
 * @param location The location this template will apply to.
 * @param trxVersion The Tildes ReExtended version to include in the template.
 */
export function createReportTemplate(
  location: 'gitlab' | 'tildes',
  trxVersion: string
): string {
  let introText =
    "Thank you for taking the time to report a bug! Don't forget to fill in an\n  appropriate title above, and make sure the information below is correct.";

  if (location === 'tildes') {
    introText =
      'Thank you for taking the time to report a bug! Please make sure the\n  information below is correct.';
  }

  const layout: string = platform.layout!;
  const name: string = platform.name!;
  const os: string = platform.os?.toString()!;
  const version: string = platform.version!;

  // Set the headers using HTML tags, these can't be with #-style Markdown
  // headers as they'll be interpreted as an ID instead of Markdown content.
  let reportTemplate = `<h2>Bug Report</h2>
<!--
  ${introText}
-->
<h3>Info</h3>\n
| Type | Value |
|------|-------|
| Extension Version | ${trxVersion} |
| Operating System | ${os} |
| Browser | ${name} ${version} (${layout}) |\n`;

  // The platform manufacturer and product can be null in certain cases (such as
  // desktops) so only when they're both not null include them.
  if (platform.manufacturer !== null && platform.product !== null) {
    const manufacturer: string = platform.manufacturer!;
    const product: string = platform.product!;
    reportTemplate += `| Device | ${manufacturer} ${product} |\n`;
  }

  reportTemplate += `\n<h3>The Problem</h3>
<!--
  Please explain in sufficient detail what the problem is. When possible,
  including an image or video showing the problem also helps immensely.
-->\n\n\n
<h3>A Solution</h3>
<!--
  If you know of any possible solutions, feel free to include them. If the
  solution is just something like "it should work" then you can safely omit
  this section.
-->\n\n\n`;

  return reportTemplate;
}
