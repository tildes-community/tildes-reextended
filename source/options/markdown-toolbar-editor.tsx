import {Component, type JSX, render, type RefObject, createRef} from "preact";
import {type Value} from "@holllo/webextension-storage";
import {initializeGlobals, log, Link} from "../utilities/exports.js";
import {
  type MarkdownSnippet,
  collectMarkdownSnippets,
  createValueMarkdownSnippet,
  newMarkdownSnippetId,
} from "../storage/exports.js";
import {runMarkdownToolbarFeature} from "../content-scripts/features/markdown-toolbar.js";
import "../scss/index.scss";
import "../scss/markdown-toolbar-editor.scss";

window.addEventListener("load", async () => {
  initializeGlobals();
  render(<App />, document.body);
});

type Props = Record<string, unknown>;

type State = {
  /**
   * Snippets are stored as an array of tuples with the {@linkcode Value}-wrapped
   * {@linkcode MarkdownSnippet} as the first item and a {@linkcode RefObject} to
   * the {@linkcode SnippetEditor} component. This is done so we can have the
   * "Save All" button in the main component but have the logic for saving in
   * the editor components.
   */
  snippets: Array<[Value<MarkdownSnippet>, RefObject<SnippetEditor>]>;
};

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      snippets: [],
    };
  }

  async componentDidMount() {
    const snippets = await collectMarkdownSnippets();
    this.setState({
      snippets: snippets.map((snippet) => [snippet, createRef()]),
    });
  }

  componentDidUpdate() {
    // Each time the main component updates we want to re-run the toolbar setup
    // so the snippets are all updated and in their correct places.
    runMarkdownToolbarFeature(
      this.state.snippets
        .map(([snippet, _ref]) => snippet)
        .filter((snippet) => snippet.value.enabled),
    );
  }

  addSnippet = async () => {
    const id = await newMarkdownSnippetId();
    const snippet = await createValueMarkdownSnippet({
      enabled: true,
      id,
      inDropdown: false,
      markdown: "",
      name: `Snippet ${id}`,
      position: 1,
    });
    await snippet.save();
    const {snippets} = this.state;
    snippets.push([snippet, createRef()]);
    this.setState({snippets});
  };

  applyAndReload = async () => {
    for (const [snippet, ref] of this.state.snippets) {
      if (ref.current === null) {
        throw new Error(
          "SnippetEditor reference is null, this should be unreachable!",
        );
      }

      const editor = ref.current;
      if (editor.state.toBeRemoved) {
        await snippet.remove();
        continue;
      }

      if (editor.state.hasUnsavedChanges) {
        await ref.current.save();
      }
    }

    await this.componentDidMount();
  };

  render() {
    const {snippets} = this.state;

    return (
      <>
        <header class="page-header">
          <h1>
            <img src="/tildes-reextended.png" />
            Markdown Toolbar Editor
          </h1>
        </header>

        <main class="page-main markdown-toolbar-editor">
          <h2>Toolbar Preview</h2>
          <p class="info">
            The Toolbar Preview lets you test out your snippets here directly
            without having to go to Tildes, with the only difference being that
            rendering the Markdown isn't possible here.
          </p>

          {/* The key attribute makes it so the mock re-renders on every update. */}
          <MockMarkdownTextarea key={`mock-${Date.now()}`} />

          <div class="snippets-title">
            <h2>Snippets</h2>
            <button class="add-new-snippet" onClick={this.addSnippet}>
              New Snippet
            </button>
            <button
              class="apply-and-reload-snippets"
              onClick={this.applyAndReload}
            >
              Apply & Reload
            </button>
          </div>

          <details class="snippet-usage-guide">
            <summary>Usage Guide</summary>

            <div class="inner">
              <p>
                Here you can create your own snippets and customize your
                toolbar, each snippet has a number of configurable values:
              </p>

              <ul>
                <li>
                  <b>Position</b>, the number next to the snippet name
                  determines in what order they will be placed in the toolbar.
                  Snippets with the same position will be sorted alphabetically.
                </li>
                <li>
                  <b>Name</b>, the name of the snippet to display in the
                  toolbar.
                </li>
                <li>
                  <b>Enable</b>, whether the snippet should be added to the
                  toolbar.
                </li>
                <li>
                  <b>Dropdown</b>, with this enabled the snippet will be placed
                  in the "More..." dropdown following the same sorting rules as
                  normal.
                </li>
                <li>
                  <b>Snippet (Markdown)</b>, the snippet text itself in
                  Markdown.
                </li>
              </ul>

              <p>
                There are also a few markers that will do special things when
                used in a snippet:
              </p>
              <ul>
                <li>
                  The <code>&lt;cursor&gt;</code> marker indicates where the
                  cursor should be positioned after inserting the snippet. If
                  this marker isn't used the cursor will be placed at the end of
                  the snippet.
                </li>
                <li>
                  The <code>&lt;selected-cursor&gt;</code> marker is used for
                  when you have text selected, placing the cursor at this
                  location and inserting the selected text in the snippet at the{" "}
                  <code>&lt;cursor&gt;</code> position. There is currently{" "}
                  <Link
                    text="a known bug"
                    url="https://gitlab.com/tildes-community/tildes-reextended/-/issues/47"
                  />{" "}
                  when this marker is placed before the{" "}
                  <code>&lt;cursor&gt;</code> marker, causing the cursor
                  position to be incorrectly placed after inserting the snippet.
                </li>
              </ul>

              <p>
                To reload the toolbar after you've made changes click the Apply
                & Reload button. This will save all the snippets and recreate
                the toolbar with your changes. Any snippets with unsaved changes
                will have a yellow border and snippets that are going to be
                removed will have a red border.
              </p>

              <p>
                To remove a snippet click the Remove button, this will remove it
                from storage but keep it loaded in the page. You can then click
                the Apply & Reload button to permanently remove it or click the
                Save or Undo buttons to get it back into storage.
              </p>
            </div>
          </details>

          {snippets.map(([snippet, ref]) => (
            <SnippetEditor key={snippet.value.id} ref={ref} snippet={snippet} />
          ))}
        </main>
      </>
    );
  }
}

type SnippetEditorProps = {
  snippet: Value<MarkdownSnippet>;
};

type SnippetEditorState = {
  enabled: MarkdownSnippet["enabled"];
  hasUnsavedChanges: boolean;
  inDropdown: MarkdownSnippet["inDropdown"];
  markdown: MarkdownSnippet["markdown"];
  name: MarkdownSnippet["name"];
  position: MarkdownSnippet["position"];
  shortcut: MarkdownSnippet["shortcut"];
  toBeRemoved: boolean;
};

class SnippetEditor extends Component<SnippetEditorProps, SnippetEditorState> {
  constructor(props: SnippetEditorProps) {
    super(props);

    const {enabled, inDropdown, markdown, name, position, shortcut} =
      props.snippet.value;

    this.state = {
      enabled,
      hasUnsavedChanges: false,
      inDropdown,
      markdown,
      name,
      position,
      shortcut,
      toBeRemoved: false,
    };
  }

  edit = <K extends keyof SnippetEditorState>(
    key: K,
    input: HTMLInputElement | HTMLTextAreaElement,
  ) => {
    const unsavedChanges: Partial<SnippetEditorState> = {
      hasUnsavedChanges: true,
    };

    if (key === "position") {
      this.setState({
        ...unsavedChanges,
        [key]: Number(input.value),
      });
    } else if (
      ["enabled", "inDropdown"].includes(key) &&
      input instanceof HTMLInputElement
    ) {
      this.setState({
        ...unsavedChanges,
        [key]: input.checked,
      });
    } else {
      this.setState({
        ...unsavedChanges,
        [key]: input.value,
      });
    }
  };

  save = async () => {
    let {snippet} = this.props;
    const {
      enabled,
      inDropdown,
      markdown,
      name,
      position,
      shortcut,
      toBeRemoved,
    } = this.state;

    snippet.value.enabled = enabled;
    snippet.value.inDropdown = inDropdown;
    snippet.value.markdown = markdown;
    snippet.value.name = name;
    snippet.value.position = position;
    snippet.value.shortcut = shortcut;

    const isBuiltin = snippet.value.id < 0;
    if (isBuiltin || toBeRemoved) {
      // If the snippet is a builtin one, then remove it from storage and assign
      // it a new ID indicating it was edited.
      // If it was marked for removal then we also need to assign a new ID
      // because it's possible a new snippet was assigned the old ID while this
      // one was removed.
      const id = await newMarkdownSnippetId();
      if (isBuiltin) {
        await snippet.remove();
      }

      snippet = await createValueMarkdownSnippet({
        ...snippet.value,
        id,
      });
    }

    this.props.snippet = snippet;
    await this.props.snippet.save();
    this.setState({hasUnsavedChanges: false, toBeRemoved: false});
  };

  remove = async () => {
    const toBeRemoved = !this.state.toBeRemoved;
    if (toBeRemoved) {
      await this.props.snippet.remove();
      this.setState({toBeRemoved});
    } else {
      await this.save();
    }
  };

  render() {
    const {
      enabled,
      hasUnsavedChanges,
      inDropdown,
      markdown,
      name,
      position,
      shortcut,
      toBeRemoved,
    } = this.state;

    const onEdit = <K extends keyof SnippetEditorState>(
      event: Event,
      key: K,
    ) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        this.edit(key, event.target);
      } else {
        log("Tried to edit field with unknown event target type", true);
        log(event, true);
      }
    };

    const editorClasses = [
      "snippet-editor",
      hasUnsavedChanges ? "unsaved-changes" : "",
      toBeRemoved ? "to-be-removed" : "",
    ].join(" ");

    return (
      <div class={editorClasses}>
        <div class="top-controls">
          <input
            class="snippet-position"
            type="number"
            placeholder="Snippet Position"
            title="Snippet Position"
            value={position}
            onInput={(event) => {
              onEdit(event, "position");
            }}
          />

          <input
            class="snippet-name"
            type="text"
            placeholder="Snippet Name"
            title="Snippet Name"
            value={name}
            onInput={(event) => {
              onEdit(event, "name");
            }}
          />

          <input
            class="snippet-shortcut"
            placeholder="Shortcut"
            title="Shortcut"
            type="text"
            value={shortcut}
            onInput={(event) => {
              onEdit(event, "shortcut");
            }}
          />

          <label class="snippet-enabled">
            Enable{" "}
            <input
              type="checkbox"
              checked={enabled}
              onClick={(event) => {
                onEdit(event, "enabled");
              }}
            />
          </label>

          <label class="snippet-in-dropdown">
            Dropdown{" "}
            <input
              type="checkbox"
              checked={inDropdown}
              onClick={(event) => {
                onEdit(event, "inDropdown");
              }}
            />
          </label>
        </div>

        <textarea
          class="snippet-markdown"
          placeholder="Snippet (Markdown)"
          title="Snippet (Markdown)"
          onInput={(event) => {
            onEdit(event, "markdown");
          }}
        >
          {markdown}
        </textarea>

        <button class="snippet-save" onClick={this.save}>
          Save
        </button>

        <button
          class={`snippet-remove destructive ${
            toBeRemoved ? "to-be-removed" : ""
          }`}
          onClick={this.remove}
        >
          {toBeRemoved ? "Undo" : "Remove"}
        </button>
      </div>
    );
  }
}

/**
 * Create a mocked version of the Markdown `<textarea>` for topics and comments.
 * The HTML is a stripped down version of the `markdown_textarea` Jinja macro
 * from the Tildes source (link below). If you end up changing this make sure
 * that the Markdown Toolbar content script code is adapted too, since that's
 * what is used for both attaching the toolbar here and on Tildes itself.
 * https://gitlab.com/tildes/tildes/-/blob/d0d6b6d3dc8e31c94cb3c0cab7aecdd835b3836b/tildes/tildes/templates/macros/forms.jinja2#L4-33
 */
function MockMarkdownTextarea(): JSX.Element {
  return (
    <div class="form-markdown">
      <header>
        <menu class="tab tab-markdown-mode">
          <li class="tab-item">
            <button class="btn active">Edit</button>
          </li>
          <li class="tab-item">
            <button class="btn" disabled>
              Preview
            </button>
          </li>
        </menu>
        <Link
          text="Formatting help"
          url="https://docs.tildes.net/instructions/text-formatting"
        />
      </header>

      <textarea
        class="form-input"
        name="markdown"
        placeholder="Text (Markdown)"
      ></textarea>
    </div>
  );
}
