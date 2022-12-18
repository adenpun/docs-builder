import fs from "fs-extra";
import jsdom from "jsdom";
import markdown from "markdown-it";
import path from "path";

// const markdown = require("markdown").markdown;

export function build(inDirPath: string, outDirPath: string) {
    if (!fs.existsSync(inDirPath)) throw new Error(`"${inDirPath}" isn't exist.`);
    fs.removeSync(outDirPath);

    const templatePath = path.join(inDirPath, ".template.html");
    if (!fs.existsSync(templatePath)) throw new Error(`".template.html" isn't exist.`);
    const template = fs.readFileSync(templatePath).toString();

    fs.mkdirSync(outDirPath);

    const files = fs.readdirSync(inDirPath);

    files.forEach((file) => {
        const filePath = path.join(inDirPath, file);
        const fileStat = fs.lstatSync(filePath);

        if (fileStat.isFile()) {
            const fileContent = fs.readFileSync(filePath).toString();
            const fileExt = path.extname(filePath);

            if (fileExt.toLowerCase() === ".md") {
                const out = markdown().render(fileContent);
                const dom = new jsdom.JSDOM(out);

                const title = dom.window.document.querySelector("h1")?.textContent;

                var output = template;
                output = output.replaceAll("<!-- {title} -->", title ?? "Title");
                output = output.replaceAll("<!-- {content} -->", out);

                const a = path.join(outDirPath, file);
                const outFilePath = a.slice(0, a.length - 2) + "html";

                fs.writeFileSync(outFilePath, output);

                console.log(outFilePath);
            }
        }
    });
}
