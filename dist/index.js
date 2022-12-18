"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const jsdom_1 = __importDefault(require("jsdom"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const path_1 = __importDefault(require("path"));
function build(inDirPath, outDirPath) {
    if (!fs_extra_1.default.existsSync(inDirPath))
        throw new Error(`"${inDirPath}" isn't exist.`);
    fs_extra_1.default.removeSync(outDirPath);
    const templatePath = path_1.default.join(inDirPath, ".template.html");
    if (!fs_extra_1.default.existsSync(templatePath))
        throw new Error(`".template.html" isn't exist.`);
    const template = fs_extra_1.default.readFileSync(templatePath).toString();
    fs_extra_1.default.mkdirSync(outDirPath);
    const files = fs_extra_1.default.readdirSync(inDirPath);
    files.forEach((file) => {
        const filePath = path_1.default.join(inDirPath, file);
        const fileStat = fs_extra_1.default.lstatSync(filePath);
        if (fileStat.isFile()) {
            const fileContent = fs_extra_1.default.readFileSync(filePath).toString();
            const fileExt = path_1.default.extname(filePath);
            if (fileExt.toLowerCase() === ".md") {
                const out = (0, markdown_it_1.default)().render(fileContent);
                const dom = new jsdom_1.default.JSDOM(out);
                const title = dom.window.document.querySelector("h1")?.textContent;
                var output = template;
                output = output.replaceAll("<!-- {title} -->", title ?? "Title");
                output = output.replaceAll("<!-- {content} -->", out);
                const a = path_1.default.join(outDirPath, file);
                const outFilePath = a.slice(0, a.length - 2) + "html";
                fs_extra_1.default.writeFileSync(outFilePath, output);
                console.log(outFilePath);
            }
        }
    });
}
exports.build = build;
