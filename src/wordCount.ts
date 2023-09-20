#!/usr/bin/env ts-node

import * as fs from 'fs';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

// Function to clean a word by removing special characters from start and end.
function sanitizeWord(word: string): string {
  return word.replace(/^[.,:<>!?'" ();`]+|[.,:<>!?'" ();`]+$/g, '').toLowerCase();
}

// Function to count words
function countWords(text: string): Record<string, number> {
  const words = text.split(/\s+/);
  const wordCounter: Record<string, number> = {};

  words.forEach((word) => {
    const sanitizedWord = sanitizeWord(word);
    if (sanitizedWord.length > 0) {
      wordCounter[sanitizedWord] = (wordCounter[sanitizedWord] || 0) + 1;
    }
  });

  return wordCounter;
}

// Function to read a portion of text and count words
function readAndGetWordsCount(text: string, start: number, end: number): Record<string, number> {
  const chunk = text.substring(start, end);
  return countWords(chunk);
}

// Main thread logic
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1) {
    const filePath = args[0];

    try {
      const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf8' });
      const fileLength = fileContent.length;
      const numThreads = 3; // We can configure this based on CPU cores.

      const workerPromises: Promise<Record<string, number>>[] = [];
      const chunkSize = Math.ceil(fileLength / numThreads);

      for (let i = 0; i < numThreads; i++) {
        const start = i === 0 ? i * chunkSize : i * chunkSize + 1;
        const end = i === numThreads - 1 ? fileLength : (i + 1) * chunkSize;

        const worker = new Worker(__filename, {
          workerData: { text: fileContent, start, end },
        });

        const workerPromise = new Promise<Record<string, number>>((resolve, reject) => {
          worker.on('message', (wordCount: Record<string, number>) => {
            resolve(wordCount);
          });

          worker.on('error', (error) => {
            reject(`Worker error: ${error}`);
          });

          worker.postMessage('start');
        });

        workerPromises.push(workerPromise);
      }

      const results = await Promise.all(workerPromises);
      const finalWordCount: Record<string, number> = results.reduce((acc, result) => {
        Object.keys(result).forEach((word) => {
          acc[word] = (acc[word] || 0) + result[word];
        });
        return acc;
      }, {});

      console.log(finalWordCount);
    } catch (err) {
      console.error(`Error reading file: ${(err as Error).message}`);
    }
  } else {
    console.error('Usage: ts-node wordcount.ts <file-path>');
  }
}

if (isMainThread) {
  main();
} else {
  const { text, start, end } = workerData;

  parentPort && parentPort.once('message', () => {
    try {
      const wordCount = readAndGetWordsCount(text, start, end);
      parentPort && parentPort.postMessage(wordCount);
    } catch (error) {
      console.error(error);
    }
  });
}

