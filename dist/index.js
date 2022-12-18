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
function build(inDirPath, outDirPath) {
    if (!fs_extra_1.default.existsSync(inDirPath))
        throw new Error(`"${inDirPath}" isn't exist.`);
    fs_extra_1.default.removeSync(outDirPath);
    fs_extra_1.default.mkdirpSync(outDirPath);
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
            if (fileExt.toLowerCase() === ".md") {
                const page = new jsdom_1.default.JSDOM(template);
                const out = (0, markdown_it_1.default)().render(fileContent);
                const contentDom = new jsdom_1.default.JSDOM(out);
                const title = contentDom.window.document.querySelector("h1")?.textContent ?? "Title";
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
                page.window.document.title = page.window.document.title.replaceAll("{title}", title);
                const sidebarDom = new jsdom_1.default.JSDOM();
                var output = page.serialize();
                const isReadme = fileBasename.toLowerCase() === "readme";
                const outFilePath = isReadme
                    ? path_1.default.join(outDirPath, "index.html")
                    : path_1.default.join(outDirPath, fileBasename, "index.html");
                if (!isReadme) {
                    const p = path_1.default.join(outDirPath, fileBasename);
                    if (!fs_extra_1.default.existsSync(p))
                        fs_extra_1.default.mkdirpSync(p);
                }
                fs_extra_1.default.writeFileSync(outFilePath, output);
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
