"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.build = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const jsdom_1 = __importDefault(require("jsdom"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const path_1 = __importDefault(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const yaml_1 = __importDefault(require("yaml"));
function build(inDirPath, outDirPath) {
    if (!fs_extra_1.default.existsSync(inDirPath))
        throw new Error(`"${inDirPath}" isn't exist.`);
    fs_extra_1.default.removeSync(outDirPath);
    fs_extra_1.default.mkdirpSync(outDirPath);
    const sidebarPath = path_1.default.join(inDirPath, ".sidebar.yaml");
    const sidebar = fs_extra_1.default.existsSync(sidebarPath)
        ? yaml_1.default.parse(fs_extra_1.default.readFileSync(sidebarPath).toString())
        : null;
    console.log(sidebar);
    const templatePath = path_1.default.join(inDirPath, ".template.html");
    if (!fs_extra_1.default.existsSync(templatePath))
        throw new Error(`".template.html" isn't exist.`);
    const template = fs_extra_1.default.readFileSync(templatePath).toString();
    const files = fs_extra_1.default.readdirSync(inDirPath);
    files.forEach((file) => {
        const filePath = path_1.default.join(inDirPath, file);
        const fileStat = fs_extra_1.default.lstatSync(filePath);
        const fileBasename = path_1.default.basename(file, path_1.default.extname(file));
        if (fileStat.isFile()) {
            const fileContent = fs_extra_1.default.readFileSync(filePath).toString();
            const fileExt = path_1.default.extname(filePath);
            const isReadme = fileBasename.toLowerCase() === "readme";
            const outFilePath = isReadme
                ? path_1.default.join(outDirPath, "index.html")
                : path_1.default.join(outDirPath, fileBasename, "index.html");
            if (fileExt.toLowerCase() === ".md") {
                const page = new jsdom_1.default.JSDOM(template);
                const out = (0, markdown_it_1.default)().render(fileContent);
                const contentDom = new jsdom_1.default.JSDOM(out);
                const sidebarDom = new jsdom_1.default.JSDOM();
                const sidebarDomList = sidebarDom.window.document.createElement("ul");
                sidebarDom.window.document.body.append(sidebarDomList);
                sidebar.forEach((ele) => {
                    const filePath = ele === "index"
                        ? path_1.default.join(inDirPath, "readme.md")
                        : path_1.default.join(inDirPath, ele + ".md");
                    const fileContent = fs_extra_1.default.readFileSync(filePath);
                    const fileBasename = path_1.default.basename(filePath, path_1.default.extname(filePath));
                    const isReadme2 = fileBasename.toLowerCase() === "readme";
                    const outFilePath2 = isReadme2
                        ? path_1.default.join(outDirPath, "index.html")
                        : path_1.default.join(outDirPath, fileBasename, "index.html");
                    const dom = new jsdom_1.default.JSDOM((0, markdown_it_1.default)().render(fileContent.toString()));
                    const title = dom.window.document.querySelector("h1")?.textContent ?? fileBasename;
                    const item = sidebarDom.window.document.createElement("li");
                    const link = sidebarDom.window.document.createElement("a");
                    link.textContent = title;
                    link.href = path_1.default.relative(path_1.default.dirname(outFilePath), path_1.default.dirname(outFilePath2));
                    item.append(link);
                    sidebarDomList.append(item);
                });
                const title = contentDom.window.document.querySelector("h1")?.textContent ?? fileBasename;
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
                    const fileBasename = path_1.default.basename(href, path_1.default.extname(href));
                    if (path_1.default.extname(href).toLowerCase() === ".md") {
                        const isReadme2 = fileBasename.toLowerCase() === "readme";
                        const outFilePath2 = isReadme2
                            ? path_1.default.join(outDirPath, "index.html")
                            : path_1.default.join(outDirPath, fileBasename, "index.html");
                        element.href = path_1.default.relative(path_1.default.dirname(outFilePath), path_1.default.dirname(outFilePath2));
                    }
                });
                page.window.document.querySelectorAll("img").forEach((element) => {
                    const href = element.src;
                    const fileName = path_1.default.basename(href, path_1.default.extname(href)) + path_1.default.extname(href);
                    const outFilePath2 = path_1.default.join(outDirPath, href);
                    element.src = path_1.default.relative(path_1.default.dirname(outFilePath), outFilePath2);
                });
                page.window.document.title = page.window.document.title.replaceAll("{title}", title);
                var output = page.serialize();
                if (!isReadme) {
                    const p = path_1.default.join(outDirPath, fileBasename);
                    if (!fs_extra_1.default.existsSync(p))
                        fs_extra_1.default.mkdirpSync(p);
                }
                fs_extra_1.default.writeFileSync(outFilePath, prettier_1.default.format(output, { parser: "html", tabWidth: 4 }));
            }
            else {
                fs_extra_1.default.copySync(filePath, path_1.default.join(outDirPath, filePath.slice(filePath.length - fileExt.length - 1 - fileBasename.length + 1, filePath.length)));
            }
        }
    });
}
exports.build = build;
function watch(inDirPath, outDirPath) {
    if (!fs_extra_1.default.existsSync(inDirPath))
        throw new Error(`"${inDirPath}" isn't exist.`);
    fs_extra_1.default.removeSync(outDirPath);
    fs_extra_1.default.watch(inDirPath, () => {
        console.log("asd");
        build(inDirPath, outDirPath);
    });
}
exports.watch = watch;
