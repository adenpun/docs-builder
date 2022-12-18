# Docs Builder

Use your Markdowns to create some HTMLs. This is still work in progress so this is very very bad.

Version: 0.2.0

See [CHANGELOG.md](./CHANGELOG) to see changes.

## To-dos

-   Make some classes and css
-   Make a sidebar
-   Make a table of contents

## Setup

You can install this package globally using `npm install docs-builder -g` and use the `doc [args...]` command.

Or run the npx command `npx docs-builder [args...]`.

Then, create this file structure:

```
my-documentation/
├── <in>/
├──── .template.html
├──── *.md
└── (Other files)
```

In the `.template.html`, write some HTML:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
    </head>
    <body>
        <docs-content />
    </body>
</html>
```

`<docs-title />` and `{title}` will be replaced by the title (The first h1 element of the content).

`<docs-content />` will be replaced by the content.

Create some markdown file to document your creation!

## Build

Run `doc build <in> <out>`!
