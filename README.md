# Word Count using Worker Threads in TypeScript

This Node.js project demonstrates how to use worker threads in TypeScript to perform word counting on a large text file efficiently.


## Prerequisites
Before you begin, ensure you have met the following requirements:

- **Node.js:** Make sure you have Node.js installed. You can download it from [https://nodejs.org/](https://nodejs.org/).

- **npm:** NPM is typically included with Node.js installation. You can verify its installation by running `npm -v` in your terminal.

- **TypeScript:** You should have TypeScript installed globally. If not, you can install it using npm: `npm install -g typescript`


## Installation

- Install the project dependencies:  `npm install`
  **Note:** If you have installed typescript globally then you dont require to do `npm install`.  

- Build the TypeScript files into JavaScript by runnung this in command line: `tsc`

- You can see the build javascript file in `dist/wordCount.js`


## Usage
To count words in a text file, follow these steps:

1. Run the application using Node.js make sure you are in dist folder before executing the following command:
`node wordCount.js <TxtFilePath>`

 **Important Note:** 
 - If you are not using worker threads and want to run the TypeScript file directly, you can use ts-node as follows: 
  `ts-node wordCount.ts <TxtFilePath>` 
 - However, when using worker threads for parallel processing, compilation to JavaScript is necessary.

2. Replace <TxtFilePath> with the path to the text file you want to analyze.
   I have a sample .txt file in project `gnu.txt`, you can give its path.

3. The program will read the file, divide it into chunks, and use worker threads to count words in parallel.

4. After processing, the program will output the word count results to the console.


## Notes

1. You can configure the number of worker threads by modifying the `numThreads` variable in the `wordCount.js` file. By default, it is set to `3`, but you can adjust it based on your CPU cores for optimal performance. For example:
`const numThreads = 3; // Configure this based on your CPU cores.`

2. This program reads the entire file in the main thread once and then distributes portions of the text to worker threads for parallel word counting.

3. Please ensure that your text file is in the same directory as the script or provide the full path to the file when running the script.