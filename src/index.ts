import FS from "fs-extra";
import HighlightJs from "highlight.js";
import JsDom from "jsdom";
import JQuery from "jquery";
import Markdown from "markdown-it";
import Path from "path";
import PathExt from "path-extra";
import Prettier from "prettier";
import YAML from "yaml";

interface IFileInfo {
    basename: string;
    basenameExt: string;
    content?: string;
    ext: string;
    path: string;
    stat: FS.Stats;
}

function getFileInfo(path: string): IFileInfo {
    const basenameExt = PathExt.base(path, true);
    const basename = PathExt.base(path, true);
    const content = FS.statSync(path).isFile() ? FS.readFileSync(path).toString() : undefined;
    const ext = Path.extname(path);
    const absPath = path;
    const stat = FS.statSync(path);
    return {
        basename: basename,
        basenameExt: basenameExt,
        content,
        ext,
        path: absPath,
        stat,
    };
}

export function build(inDirPath: string, outDirPath: string) {
    const basicData = {} as IBasicData;

    basicData.inDirPath = inDirPath;
    basicData.outDirPath = outDirPath;

    if (!FS.existsSync(inDirPath)) throw new Error(`"${inDirPath}" isn't exist.`);
    FS.removeSync(outDirPath);
    FS.mkdirpSync(outDirPath);

    basicData.templatePath = Path.join(inDirPath, "./.template.html");
    if (!FS.existsSync(basicData.templatePath)) {
        basicData.templatePath = Path.join(__dirname, "../static/.template.html");
    }

    summaryHandler(getFileInfo(Path.join(inDirPath, "./.summary.md")), basicData);

    console.log("\nFinished building. Yay!");
}

interface IBasicData {
    inDirPath: string;
    outDirPath: string;
    templatePath: string;
}

function summaryHandler(fileInfo: IFileInfo, basicData: IBasicData) {
    if (fileInfo.content) {
        const html = Markdown().render(fileInfo.content.replaceAll(/(\n|\r\n)+/g, "\n"));
        const dom = new JsDom.JSDOM(html);
        const window = dom.window as any as Window;
        const summary: ISummaryItem = { children: [], label: "root" };
        const $ = JQuery(window) as any as JQueryStatic;
        const $ul = $("body > ul");
        const parse = ($parent: JQuery, parent: ISummaryItem) => {
            $parent.children().each((i, ele) => {
                const tagName = $(ele)[0].tagName;
                const item: ISummaryItem = { children: [], label: "" };
                const t = $(ele)
                    .contents()
                    .filter((i, ele) => ele.nodeType === 3)
                    .text()
                    .trim();

                if (tagName === "LI" || tagName === "A") {
                    if (t) {
                        item.label = t;
                        parent.children.push(item);
                        if (tagName === "A") {
                            const href = $(ele).attr("href");
                            if (href) {
                                item.link = Path.normalize(href);
                            }
                        }
                        return parse($(ele), item);
                    } else {
                        return parse($(ele), parent);
                    }
                } else {
                    return parse($(ele), parent);
                }
            });
        };

        parse($ul, summary);

        buildPages(summary);
    }
}

function buildPages(summary: ISummaryItem) {
    const parseSidebar = () => {};
    const sidebar = summary;
    console.log(JSON.stringify(summary, null, 4));
}

function buildPage(path: string, basicData: IBasicData) {
    console.log(`Building ${path}...`);
    const fileInfo = getFileInfo(Path.join(basicData.inDirPath, path));
    if (fileInfo.content) {
        const html = Markdown({
            highlight: (str, lang) => {
                if (lang && HighlightJs.getLanguage(lang)) {
                    try {
                        return HighlightJs.highlight(str, { language: lang }).value;
                    } catch (error) {}
                }

                return "";
            },
        }).render(fileInfo.content);

        const template = FS.readFileSync(basicData.templatePath).toString();

        const dom = new JsDom.JSDOM(template);

        const window = dom.window as any as Window;

        const $ = JQuery(window) as any as JQueryStatic;

        $("docs-content").replaceWith(`<div class="content">${html}</div>`);
        $("docs-sidebar").replaceWith(`sidebar`);

        $("a").each((i, ele) => {
            const href = $(ele).attr("href");
            if (href) {
                if (Path.extname(href).toLowerCase() === ".md") {
                    $(ele).attr("href", "");
                }
            }
        });

        const outFilePath =
            fileInfo.basenameExt.toLowerCase() === "readme.md"
                ? Path.join(basicData.outDirPath, Path.dirname(path), "index.html")
                : Path.join(
                      basicData.outDirPath,
                      Path.dirname(path),
                      PathExt.base(path),
                      "index.html"
                  );
        FS.mkdirpSync(Path.dirname(outFilePath));
        FS.writeFileSync(outFilePath, Prettier.format(dom.serialize(), { parser: "html" }));
    }
}

interface ISummaryItem {
    children: ISummaryItem[];
    label: string;
    link?: string;
}

export function watch(inDirPath: string, outDirPath: string) {
    if (!FS.existsSync(inDirPath)) throw new Error(`"${inDirPath}" isn't exist.`);
    FS.removeSync(outDirPath);
    build(inDirPath, outDirPath);

    FS.watch(inDirPath, () => {
        build(inDirPath, outDirPath);
    });
}
