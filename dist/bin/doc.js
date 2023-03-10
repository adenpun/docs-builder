#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path_1 = __importDefault(require("path"));
const doc = __importStar(require(".."));
const cwd = process.cwd();
commander_1.program.name("docs-builder").description("A documentation builder in Node.js").version("0.2.1");
commander_1.program
    .command("build")
    .description("build the documentation")
    .argument("<in>")
    .argument("<out>")
    .action((inDir, outDir) => {
    const inDirPath = path_1.default.isAbsolute(inDir) ? path_1.default.join(inDir, ".") : path_1.default.join(cwd, inDir);
    const outDirPath = path_1.default.isAbsolute(outDir)
        ? path_1.default.join(outDir, ".")
        : path_1.default.join(cwd, outDir);
    doc.build(inDirPath, outDirPath);
});
commander_1.program
    .command("watch")
    .description("watch")
    .argument("<in>")
    .argument("<out>")
    .action((inDir, outDir) => {
    const inDirPath = path_1.default.isAbsolute(inDir) ? path_1.default.join(inDir, ".") : path_1.default.join(cwd, inDir);
    const outDirPath = path_1.default.isAbsolute(outDir)
        ? path_1.default.join(outDir, ".")
        : path_1.default.join(cwd, outDir);
    doc.watch(inDirPath, outDirPath);
});
commander_1.program.parse();
