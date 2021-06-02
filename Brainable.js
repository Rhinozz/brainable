/*
A brainf*** interpreter in Scriptable.
Code almost entirely from Shawn McLaughlin's inrerpreter - https://gist.github.com/shawnmcla/9a6f98fe4f176b99fe1720b3bc23f005

Forked by Rhinozz into Brainable.

Added:
- iOS input support
- Automatic output
- Pointer wrapping
- Tape wrapping
- Warnings for debugging
- Commenting
*/

// Get code and input
let alert = new Alert();
alert.title = 'Run Code';
alert.message = 'Input your brainf*** code and its input, if applicable. The \',\' command will only take one input character per use.';
alert.addTextField('Code');
alert.addTextField('Input (Optional)');
alert.addAction('Run');
await alert.present();

// Create a new 30,000 size array, with each cell initialized with the value of 0
const memory = new Array(30000).fill(0);
// Instruction pointer and memory pointer, tracks the current cell and tape locations
let ipointer = mpointer = 0;
// Address stack. Used to track addresses (index) of left brackets
let astack = [];

// Program and input are taken from the alert before. Output is to be written
let program = alert.textFieldValue(0);
let input = alert.textFieldValue(1);
let output = "";

// If program is empty, warn
if (!input.includes('.')) {
    logWarning('Warning: Your program does not contain a \'.\'. It will not print anything.');
}

function resetState() {
    // Clear memory, reset pointers to zero
    memory.fill(0);
    ipointer = mpointer = 0;
    output = input = program = "";
    astack = [];
}

function sendOutput(value) {
    // Used by the '.' instruction to print
    output += String.fromCharCode(value);
}

function getInput() {
    // Set a default value to return in case there is no input to consume
    let val = 0;

    // If input isn't empty...
    if (input) {
        // Get the character code of the first character of the string
        val = input.charCodeAt(0);
        // Remove the first character from the string as it is "consumed" by the program
        input = input.substring(1);
    } else {
        // If input is empty, warn
        logWarning('Warning: You have a blank input. It has been defaulted to 0.');
    }
    
    // Return value of input
    return val;
}

// Lets program know if it's done or not
let end = false;

// Runs until end of program
while (!end) {
    // Checks each input
    switch (program[ipointer]) {
        // Move pointer right
        case '>':
            if (mpointer == memory.length - 1) {
                // If we try to access memory beyond 30,000, wrap back to 1
                mpointer = 0;
            }
            // Increment pointer
            mpointer++;
            break;
            
        // Move pointer left
        case '<':
            if (mpointer > 0) {
                // Decrement pointer
                mpointer--;
            } else {
                // If we try to access memory below 1, wrap around to 30,000
                mpointer = 29999;
            }
            break;
            
        // Add 1 to cell
        case '+':
            if (memory[mpointer] == 255) {
                // If we try to access a value beyond 255, wrap back to 0
                memory[mpointer] = 0;
            } else {
                // Increment cell
                memory[mpointer]++;
            }
            break;
            
        // Subtract 1 from cell
        case '-':
            if (memory[mpointer] == 0) {
                // If we try to access a value beyond 255, wrap back to 0
                memory[mpointer] = 255;
            } else {
                // Decrement cell
                memory[mpointer]--;
            }
            break;
            
        // Print current cell's ascii value
        case '.':
            // Send ascii value to output
            sendOutput(memory[mpointer]);
            break;
            
        // Take 1 character of input
        case ',':
            // Get ascii value from input
            memory[mpointer] = getInput();
            break;
            
        // Start loop
        case '[':
            if (memory[mpointer]) {
                // If non-zero, track current location and continue
                astack.push(ipointer);
            } else {
                // Skip to matching right bracket
                // Start loop count
                let count = 0;
                // Start actual loop
                while (true) {
                    ipointer++;
                    if (!program[ipointer]) {
                        // Backup if something is undefined
                        break;
                    }
                    if (program[ipointer] === "[") {
                        // If start of loop, continue
                        count++;
                    }
                    else if (program[ipointer] === "]") {
                        // If end of loop
                        if (count) {
                            // Decrement loop counter
                            count--;
                        } else {
                            // End loop
                            break;
                        }
                    }
                }
            }
            break;
            
        // End loop
        case ']':
            // Pointer is automatically incremented every iteration, therefore we must decrement to get the correct value
            ipointer = astack.pop() - 1;
            break;
            
        // End of commands
        case undefined:
            // We have reached the end of the program
            end = true;
            break;
        
        // Character that isn't a part of the command set
        default:
            // We ignore any character that are not part of regular syntax
            break;
    }
    
    // Backup increment
    ipointer++;
}

// Output
log(output);
