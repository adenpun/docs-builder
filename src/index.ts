import fs from "fs-extra";
import jsdom from "jsdom";
import markdown from "markdown-it";
import path from "path";

export function build(inDirPath: string, outDirPath: string) {
    if (!fs.existsSync(inDirPath)) throw new Error(`"${inDirPath}" isn't exist.`);
    // fs.removeSync(outDirPath);

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

            if (fileExt.toLowerCase() === ".md") {
                const page = new jsdom.JSDOM(template);

                const out = markdown().render(fileContent);
                const contentDom = new jsdom.JSDOM(out);

                const title =
                    contentDom.window.document.querySelector("h1")?.textContent ?? "Title";

                page.window.document.querySelectorAll("docs-title").forEach((element) => {
                    element.replaceWith(title);
                });

                page.window.document.querySelectorAll("docs-content").forEach((element) => {
                    const container = contentDom.window.document.createElement("div");
                    container.classList.add("content");
                    element.before(container);
                    element.remove();
                    container.append(contentDom.window.document.body);
                });

                page.window.document.title = page.window.document.title.replaceAll(
                    "{title}",
                    title
                );

                const sidebar = new jsdom.JSDOM();

                var output = page.serialize();

                const isReadme = fileBasename.toLowerCase() === "readme";

                const outFilePath = isReadme
                    ? path.join(outDirPath, "index.html")
                    : path.join(outDirPath, fileBasename, "index.html");

                if (!isReadme) {
                    const p = path.join(outDirPath, fileBasename);
                    if (!fs.existsSync(p)) fs.mkdirpSync(p);
                }
                fs.writeFileSync(outFilePath, output);
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
