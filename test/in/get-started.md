# Get Started

## Docs Builder

Use your Markdowns to create some HTMLs. This is still work in progress so this is very very bad.

Version: 0.3.0

See [CHANGELOG.md](./CHANGELOG.md) to see changes.

## To-dos

-   Make some classes and css
-   Make a table of contents

## Setup

You can install this package globally using `npm install docs-builder -g` and use the `doc [args...]` command.

Or run the npx command `npx docs-builder [args...]`.

Then, create this file structure:

```
my-documentation/
├── <in>/
├──── .sidebar.yaml
├──── .template.html
├──── readme.md
├──── *.md
├──── (Other files)
└── (Other files)
```

In the `.sidebar.yaml`, write some YAML:

```yaml
- index
- my-page
- my-page2
```

`index` is the main page (`readme.md`)

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
        <docs-sidebar></docs-sidebar>
        <docs-content></docs-content>
    </body>
</html>
```

`<docs-title></docs-title>` and `{title}` will be replaced by the title (The first h1 element of the content).

`<docs-content></docs-content>` will be replaced by the content.

`<docs-sidebar></docs-sidebar>` will be replaced by the data of `.sidebar.yaml` (without style).

Create some markdown file to document your creation!

## Links

Input:

```md
[my page](./my-page.md)

![image](./my-img.png)
```

Output:

```html
<p><a href="my-page">my page</a></p>

<p><img src="my-img.png" alt="image" /></p>
```

Links that link to a markdown file will be replaced by the relative path of the page.

Images will be replaced by the relative path of the image.

## Build

Run `doc build <in> <out>`!
