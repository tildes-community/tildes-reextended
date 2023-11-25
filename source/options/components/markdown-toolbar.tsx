import {type JSX} from "preact";
import {Link} from "../../utilities/exports.js";
import {Setting, type SettingProps} from "./index.js";

export function MarkdownToolbarSetting(props: SettingProps): JSX.Element {
  return (
    <Setting {...props}>
      <p class="info">
        Adds a toolbar with a selection of Markdown snippets that when used will
        insert the according Markdown where your cursor is. Particularly useful
        for the{" "}
        <Link
          url="https://docs.tildes.net/instructions/text-formatting#expandable-sections"
          text="expandable section"
        />
        /spoilerbox syntax. If you have text selected, the Markdown will be
        inserted around your text.
        <br />
        You can edit the available snippets and their position in the toolbar
        using the{" "}
        <a href="/options/markdown-toolbar-editor.html">
          Markdown Toolbar Editor
        </a>
        .
      </p>
    </Setting>
  );
}
