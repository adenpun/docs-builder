#!/usr/bin/env node

// import minimist from "minimist";
import { program } from "commander";
import path from "path";
import * as doc from "..";

const cwd = process.cwd();

program.name("docs-builder").description("A documentation builder in Node.js").version("0.1.0");

program
    .command("build")
    .description("Build the documentation")
    .argument("<in>")
    .argument("<out>")
    .action((inDir, outDir) => {
        const inDirPath = path.join(cwd, inDir);
        const outDirPath = path.join(cwd, outDir);
        doc.build(inDirPath, outDirPath);
    });

program.parse();
