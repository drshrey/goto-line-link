# Goto Line Link

With this extension, you can instantly go to the hosted link of the current code line you're on in VSCode.

# Installation 

Go to your VSCode editor. Make sure you're on the minimum version required (check package.json's version attribute). Go to extensions and type in "goto-link-line". You should see one by Colo Labs. Install that.

# Usage

```
Goto link of current line
```
Takes you to the actual link in a browser.

```
Get link of current line
```
Copies the link line to your clipboard

# How does it work?

TODO

# Assumptions

- You are working out of a directory in VSCode that matches the name of the repository
- Your root directory contains the appropriate .git folder.

# Known Issues

- `Goto link` is broken for repositories that have the git@... format in the .git/config file 