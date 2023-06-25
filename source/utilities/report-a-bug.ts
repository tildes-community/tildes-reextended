import platform from "platform";

/**
 * Creates a bug report template in Markdown.
 * @param location The location this template will apply to.
 * @param trxVersion The Tildes ReExtended version to include in the template.
 */
export function createReportTemplate(
  location: "gitlab" | "tildes",
  trxVersion: string,
): string {
  let introText = "Thank you for taking the time to report a bug!";
  introText += "\n  Please make sure the information below is correct.";

  if (location === "gitlab") {
    introText += "\n  Don't forget to set a title for the issue!";
  }

  const layout = platform.layout ?? "<unknown>";
  const name = platform.name ?? "<unknown>";
  const os = platform.os?.toString() ?? "<unknown>";
  const version = platform.version ?? "<unknown>";

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

  reportTemplate += `\n
<!--
  Please explain in sufficient detail what the problem is. When possible,
  including an image or video showing the problem also helps immensely, but it's
  not required.
-->\n\n\n`;

  return reportTemplate;
}
