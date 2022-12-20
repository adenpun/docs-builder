import fs from "fs-extra";
import jsdom from "jsdom";
import markdown from "markdown-it";
import path from "path";
import prettier from "prettier";
import yaml from "yaml";

export function build(inDirPath: string, outDirPath: string) {
    if (!fs.existsSync(inDirPath)) throw new Error(`"${inDirPath}" isn't exist.`);
    fs.removeSync(outDirPath);
    fs.mkdirpSync(outDirPath);

    const sidebarPath = path.join(inDirPath, ".sidebar.yaml");
    const sidebar: string[] = fs.existsSync(sidebarPath)
        ? yaml.parse(fs.readFileSync(sidebarPath).toString())
        : null;

    console.log(sidebar);

    const templatePath = path.join(inDirPath, ".template.html");
    if (!fs.existsSync(templatePath)) throw new Error(`".template.html" isn't exist.`);
    const template = fs.readFileSync(templatePath).toString();

    const files = fs.readdirSync(inDirPath);

    files.forEach((file) => {
        const filePath = path.join(inDirPath, file);
        const fileStat = fs.lstatSync(filePath);
        const fileBasename = path.basename(file, path.extname(file));

        if (fileStat.isFile()) {
            const fileContent = fs.readFileSync(filePath).toString();
            const fileExt = path.extname(filePath);
            const isReadme = fileBasename.toLowerCase() === "readme";

            const outFilePath = isReadme
                ? path.join(outDirPath, "index.html")
                : path.join(outDirPath, fileBasename, "index.html");

            if (fileExt.toLowerCase() === ".md") {
                const page = new jsdom.JSDOM(template);

                const out = markdown().render(fileContent);
                const contentDom = new jsdom.JSDOM(out);

                //#region Sidebar
                const sidebarDom = new jsdom.JSDOM();

                const sidebarDomList = sidebarDom.window.document.createElement("ul");

                sidebarDom.window.document.body.append(sidebarDomList);

                sidebar.forEach((ele) => {
                    const filePath =
                        ele === "index"
                            ? path.join(inDirPath, "readme.md")
                            : path.join(inDirPath, ele + ".md");
                    const fileContent = fs.readFileSync(filePath);

                    const fileBasename = path.basename(filePath, path.extname(filePath));

                    const isReadme2 = fileBasename.toLowerCase() === "readme";

                    const outFilePath2 = isReadme2
                        ? path.join(outDirPath, "index.html")
                        : path.join(outDirPath, fileBasename, "index.html");

                    const dom = new jsdom.JSDOM(markdown().render(fileContent.toString()));
                    const title =
                        dom.window.document.querySelector("h1")?.textContent ?? fileBasename;
                    const item = sidebarDom.window.document.createElement("li");
                    const link = sidebarDom.window.document.createElement("a");
                    link.textContent = title;
                    link.href = path.relative(
                        path.dirname(outFilePath),
                        path.dirname(outFilePath2)
                    );
                    item.append(link);
                    sidebarDomList.append(item);
                });
                //#endregion

                const title =
                    contentDom.window.document.querySelector("h1")?.textContent ?? fileBasename;

                page.window.document.querySelectorAll("docs-title").forEach((element) => {
                    element.replaceWith(title);
                });

                page.window.document.querySelectorAll("docs-content").forEach((element) => {
                    const container = contentDom.window.document.createElement("div");
                    container.classList.add("content");
                    element.before(container);
                    element.remove();
                    container.append(...contentDom.window.document.body.childNodes);
                });

                page.window.document.querySelectorAll("docs-sidebar").forEach((element) => {
                    const container = contentDom.window.document.createElement("div");
                    container.classList.add("sidebar");
                    element.before(container);
                    element.remove();
                    container.append(...sidebarDom.window.document.body.childNodes);
                });

                page.window.document.querySelectorAll("a").forEach((element) => {
                    const href = element.href;

                    const fileBasename = path.basename(href, path.extname(href));

                    if (path.extname(href).toLowerCase() === ".md") {
                        const isReadme2 = fileBasename.toLowerCase() === "readme";

                        const outFilePath2 = isReadme2
                            ? path.join(outDirPath, "index.html")
                            : path.join(outDirPath, fileBasename, "index.html");

                        element.href = path.relative(
                            path.dirname(outFilePath),
                            path.dirname(outFilePath2)
                        );
                    }
                });

                page.window.document.querySelectorAll("img").forEach((element) => {
                    const href = element.src;

                    const fileName = path.basename(href, path.extname(href)) + path.extname(href);

                    const outFilePath2 = path.join(outDirPath, href);

                    element.src = path.relative(path.dirname(outFilePath), outFilePath2);
                });

                page.window.document.title = page.window.document.title.replaceAll(
                    "{title}",
                    title
                );

                var output = page.serialize();

                if (!isReadme) {
                    const p = path.join(outDirPath, fileBasename);
                    if (!fs.existsSync(p)) fs.mkdirpSync(p);
                }
                fs.writeFileSync(
                    outFilePath,
                    prettier.format(output, { parser: "html", tabWidth: 4 })
                );
            } else {
                fs.copySync(
                    filePath,
                    path.join(
                        outDirPath,
                        filePath.slice(
                            filePath.length - fileExt.length - 1 - fileBasename.length + 1,
                            filePath.length
                        )
                    )
                );
            }
        }
    });
}

export function watch(inDirPath: string, outDirPath: string) {
    if (!fs.existsSync(inDirPath)) throw new Error(`"${inDirPath}" isn't exist.`);
    fs.removeSync(outDirPath);

    fs.watch(inDirPath, () => {
        console.log("asd");
        build(inDirPath, outDirPath);
    });
}
