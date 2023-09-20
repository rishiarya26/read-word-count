#!/usr/bin/env ts-node
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const worker_threads_1 = require("worker_threads");
// Function to clean a word by removing special characters from start and end.
function sanitizeWord(word) {
    return word.replace(/^[.,:<>!?'" ();`]+|[.,:<>!?'" ();`]+$/g, '').toLowerCase();
}
// Function to count words
function countWords(text) {
    const words = text.split(/\s+/);
    const wordCounter = {};
    words.forEach((word) => {
        const sanitizedWord = sanitizeWord(word);
        if (sanitizedWord.length > 0) {
            wordCounter[sanitizedWord] = (wordCounter[sanitizedWord] || 0) + 1;
        }
    });
    return wordCounter;
}
// Function to read a portion of text and count words
function readAndGetWordsCount(text, start, end) {
    const chunk = text.substring(start, end);
    return countWords(chunk);
}
// Main thread logic
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length === 1) {
            const filePath = args[0];
            try {
                const fileContent = yield fs.promises.readFile(filePath, { encoding: 'utf8' });
                const fileLength = fileContent.length;
                const numThreads = 3; // We can configure this based on CPU cores.
                const workerPromises = [];
                const chunkSize = Math.ceil(fileLength / numThreads);
                for (let i = 0; i < numThreads; i++) {
                    const start = i === 0 ? i * chunkSize : i * chunkSize + 1;
                    const end = i === numThreads - 1 ? fileLength : (i + 1) * chunkSize;
                    const worker = new worker_threads_1.Worker(__filename, {
                        workerData: { text: fileContent, start, end },
                    });
                    const workerPromise = new Promise((resolve, reject) => {
                        worker.on('message', (wordCount) => {
                            resolve(wordCount);
                        });
                        worker.on('error', (error) => {
                            reject(`Worker error: ${error}`);
                        });
                        worker.postMessage('start');
                    });
                    workerPromises.push(workerPromise);
                }
                const results = yield Promise.all(workerPromises);
                const finalWordCount = results.reduce((acc, result) => {
                    Object.keys(result).forEach((word) => {
                        acc[word] = (acc[word] || 0) + result[word];
                    });
                    return acc;
                }, {});
                console.log(finalWordCount);
            }
            catch (err) {
                console.error(`Error reading file: ${err.message}`);
            }
        }
        else {
            console.error('Usage: ts-node wordcount.ts <file-path>');
        }
    });
}
if (worker_threads_1.isMainThread) {
    main();
}
else {
    const { text, start, end } = worker_threads_1.workerData;
    worker_threads_1.parentPort && worker_threads_1.parentPort.once('message', () => {
        try {
            const wordCount = readAndGetWordsCount(text, start, end);
            worker_threads_1.parentPort && worker_threads_1.parentPort.postMessage(wordCount);
        }
        catch (error) {
            console.error(error);
        }
    });
}
