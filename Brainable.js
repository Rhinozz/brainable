// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: hdd;

/*
A brainf*** interpreter in Scriptable.
Code almost entirely from Shawn McLaughlin's interpreter - https://gist.github.com/shawnmcla/9a6f98fe4f176b99fe1720b3bc23f005

Forked by Rhinozz.

Added:
- iOS input support
- Automatic outputs
- Pointer wrapping
- Tape wrapping
*/

// Get code and input
let alert = new Alert();
alert.title = 'Run Code';
alert.message = 'Input your brainf*** code and its input, if applicable. The \',\' command will only take one input character per use.';
alert.addTextField('Code');
alert.addTextField('Input (Optional)');
alert.addAction('Run');
await alert.present();

// Create a new 30,000 size array, with each cell initialized with the value of 0. Memory can expand.
const MEMORY_SIZE = 30000;
const memory = new Array(MEMORY_SIZE).fill(0);
// Instruction pointer (Points to the current INSTRUCTION)
let ipointer = 0;
// Memory pointer (Points to a cell in MEMORY)
let mpointer = 0;
// Address stack. Used to track addresses (index) of left brackets
let astack = [];

// Code and input are used from the alert before. Output is to be written
let program = alert.textFieldValue(0);
let input = alert.textFieldValue(1);
let output = "";

function resetState() {
    // Clear memory, reset pointers to zero.
    memory.fill(0);
    ipointer = 0;
    mpointer = 0;
    output = "";
    input = "";
    program = "";
    astack = [];
}

function sendOutput(value) {
    output += String.fromCharCode(value);
}

function getInput() {
    // Set a default value to return in case there is no input to consume
    let val = 0;

    // If input isn't empty
    if (input) {
        // Get the character code of the first character of the string
        val = input.charCodeAt(0);
        // Remove the first character from the string as it is "consumed" by the program
        input = input.substring(1);
    }

    return val;
}

function interpret() {
    let end = false;

    while (!end) {
        switch (program[ipointer]) {
            case '>':
                if (mpointer == memory.length - 1)
                // If we try to access memory beyond 30,000, wrap back to 0
                    mpointer = 0;
                mpointer++;
                break;
            case '<':
                if (mpointer > 0)
                    mpointer--;
                else
                    mpointer = 29999;
                break;
            case '+':
                if(memory[mpointer] == 255)
                    // If we try to access a value beyond 255, wrap back to 0
                    memory[mpointer] = 0;
                else
                    memory[mpointer]++;
                break;
            case '-':
                if(memory[mpointer] == 0)
                    // If we try to access a value beyond 255, wrap back to 0
                    memory[mpointer] = 255;
                else
                    memory[mpointer]--;
                break;
            case '.':
                sendOutput(memory[mpointer]);
                break;
            case ',':
                memory[mpointer] = getInput();
                break;
            case '[':
                if (memory[mpointer]) { // If non-zero
                    astack.push(ipointer);
                } else { // Skip to matching right bracket
                    let count = 0;
                    while (true) {
                        ipointer++;
                        if (!program[ipointer]) break;
                        if (program[ipointer] === "[") count++;
                        else if (program[ipointer] === "]") {
                            if (count) count--;
                            else break;
                        }
                    }
                }
                break;
            case ']':
                // Pointer is automatically incremented every iteration, therefore we must decrement to get the correct value
                ipointer = astack.pop() - 1;
                break;
            case undefined: // We have reached the end of the program
                end = true;
                break;
            default: // We ignore any character that are not part of regular syntax
                break;
        }
        ipointer++;

    }
    console.log(output);
    return output;
}

interpret();
