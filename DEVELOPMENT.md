# Development Guide

## Prerequisites

### Nix + Direnv

If you have [Nix](https://nixos.org/) with flakes enabled and [Direnv](https://direnv.net/) installed, all you need to do is `direnv allow` the directory and all the prerequisites will be automatically installed. This may take a moment on first load.

Firefox and git are excluded, which are assumed to already be present on your system.

### Manual

To build and develop Tildes ReExtended you will need:

* [git](https://git-scm.com)
* [NodeJS](https://nodejs.org) (recommended 18.16.0)
* [pnpm](https://pnpm.io) (recommended 8.6.0)
* [cargo-make](https://sagiegurari.github.io/cargo-make/)

## cargo-make

All the different tasks we'd want to do are setup in `Makefile.toml` to be used with `cargo-make` (or the `makers` alias).

In the Tasks section below you can find a list of all the tasks, or you can look at the Makefile itself, where all the tasks have a description of what they do.

### Environment

Two important environment variables are `BROWSER` and `NODE_ENV`.

`BROWSER` dictates what browser should be targeted, by default `BROWSER="firefox"`. To target Chromium set `BROWSER="chromium"`.

`NODE_ENV` dictates minifying and optimization found in `source/build.ts`, by default `NODE_ENV="development"` which does no minifying and includes sourcemaps in the build. Setting `NODE_ENV="production"` will minify and exclude sourcemaps.

### Tasks

<details>
<summary>Click to view all tasks</summary>

* The most common scenario will likely be that you want a live-reloading browser instance, this can be done using the `dev` task.

```sh
# If makers doesn't work, replace it with cargo-make.
makers dev

# To change the environment, prefix the command with the
# variables you want to set.
BROWSER="chromium" NODE_ENV="production" makers dev
```

* To watch for changes but without starting a live-reloading browser instance, use the `watch` task.

```sh
makers watch

# Which is a simple alias for the following.
WATCH="true" makers build
```

* To start a browser instance with an already built extension present in the `build/` directory, the `run` task is available. Note that this will fail if the extension hasn't been built before.

```sh
makers run
```

* To clean the build directory, a `clean` task is available. This uses `trash-cli` so if you accidentally remove something and want it back, check your trash bin where you can restore it.

```sh
makers clean

# Clean the Chromium directory.
BROWSER="chromium" makers clean
```

* To lint the code, `lint` is the task.

```sh
makers lint

# To only lint JS or SCSS.
makers lint-js
makers lint-scss
```

* To pack the WebExtension for publishing, `pack` is what you need.

```sh
# Make sure to set NODE_ENV, otherwise the extension size will be
# a lot bigger than it needs to be.
NODE_ENV="production" makers pack

# To pack Chromium.
BROWSER="chromium" NODE_ENV="production" makers pack
```

* Mozilla Addons requires the zipped source code too, since we're using minification, so `zip-source` is available. This uses Git's `archive` command.

```sh
makers zip-source
```
</details>

## Firefox for Android

* See also the [Extension Workshop](https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/) documentation.

### Setup

On the Android device:

1. Install [Firefox for Android Nightly](https://play.google.com/store/apps/details?id=org.mozilla.fenix).
2. Enable Android's developer options by going to the "Build Number" section in your settings and tapping on it repeatedly until it says "You are now a developer".
3. Enable USB debugging in the newly enabled Developer Options.
4. Attach to the computer using USB, allow USB debugging when prompted.
5. Open Firefox Nightly and in the settings page enable "Remote debugging via USB."

On the development computer:

1. Open a terminal and run `adb devices`, when prompted on your phone allow remote debugging.
2. Copy the ID and set it in your terminal `export ADB_DEVICE="..."`.
3. Grant Firefox Nightly the read external storage permission:

```txt
adb shell pm grant org.mozilla.fenix android.permission.READ_EXTERNAL_STORAGE
```

### Tasks

Now you should be able to use any of the available `cargo-make` tasks for development by setting `TARGET="firefox-android"`. For example to install the extension into Firefox Nightly and reload on changes `TARGET="firefox-android" makers dev` can be used.

This should open Firefox Nightly on your Android device and prompt you to install the extension. If it opens Firefox on your desktop you will also be able to use USB debugging in the `about:debugging#/setup` page.
