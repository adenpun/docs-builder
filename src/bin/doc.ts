#!/usr/bin/env node

// import minimist from "minimist";
import { program } from "commander";
import path from "path";
import * as doc from "..";

const cwd = process.cwd();

program.name("docs-builder").description("A documentation builder in Node.js").version("0.2.0");

program
    .command("build")
    .description("build the documentation")
    .argument("<in>")
    .argument("<out>")
    .action((inDir, outDir) => {
        const inDirPath = path.isAbsolute(inDir) ? path.join(inDir, ".") : path.join(cwd, inDir);
        const outDirPath = path.isAbsolute(outDir)
            ? path.join(outDir, ".")
            : path.join(cwd, outDir);
        doc.build(inDirPath, outDirPath);
    });

program
    .command("watch")
    .description("watch")
    .argument("<in>")
    .argument("<out>")
    .action((inDir, outDir) => {
        const inDirPath = path.isAbsolute(inDir) ? path.join(inDir, ".") : path.join(cwd, inDir);
        const outDirPath = path.isAbsolute(outDir)
            ? path.join(outDir, ".")
            : path.join(cwd, outDir);
        doc.watch(inDirPath, outDirPath);
    });

program.parse();
