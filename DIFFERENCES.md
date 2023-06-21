# Differences

Tildes ReExtended is a reimagination of [Crius' original Tildes Extended](https://github.com/theCrius/tildes-extended). This document outlines the differences between the two.

## Removed Functionality

Large parts of the original Tildes Extended have been removed for various reasons:

* **Link In New Tab**: this functionality now exists natively and can be configured [in your settings](https://tildes.net/settings)!
* **Markdown Preview**: this too exists natively (although not a "live" preview). Another reason this isn't included is due to Tildes using a customized flavor of Markdown that is difficult to replicate accurately enough with what's available and keep up to date.
* **Sticky Header**: with the dedicated "Back To Top" button now I wasn't sure if there was a need for it, so it's left out.
* **Custom Styles**: this feature introduced many issues in Tildes Extended while better and more dedicated extensions exist, such as [Stylus](https://add0n.com/stylus.html), that can reliably handle custom styles instead.

## Extended Functionality

Some functionality has also been extended more:

* [x] The **Back To Top** button has been separated out into its own feature. It used to be apart of the "Jump To New Comments" one.
* [x] The **Themed Tildes Logo** feature now picks from theme-appropriate logos instead of a regular tilde character.
* [x] The **Jump To New Comment** button now uncollapses comments if the new one is collapsed or is deeper inside a collapsed one.

### User Labels

* [x] Multiple labels per person.
* [x] Specify priority of labels.
* [x] A dropdown with theme-appropriate colors for easy access.
* [x] Pick any hex color you want.
* [x] Dedicated interface to add, edit, and remove labels.

## New Functionality

And various new features have been added such as:

* [ ] Hide (and unhide) topics from the topic listing. [*WIP](https://gitlab.com/tildes-community/tildes-reextended/issues/3)
* [x] Hide your own and/or other people's vote counts.
* [x] Anonymize usernames.
* [x] Assign unique colors to people's usernames.
* [x] Export and import your extension settings.
