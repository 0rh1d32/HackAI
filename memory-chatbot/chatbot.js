const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask the user's name
rl.question('What is your name? ', (name) => {
  console.log(`Hello ${name}, nice to meet you!`);

  // Ask about memory loss
  rl.question('Do you remember what you did today? ', (response) => {
    if (response.toLowerCase().includes('no') || response.toLowerCase().includes('not really')) {
      console.log("That's okay! It's normal to forget sometimes.");
    } else {
      console.log("Great to hear that you remember!");
    }

    // Ask a follow-up question
    rl.question("Can you tell me more about what you did today? ", (moreInfo) => {
      console.log(`Thank you for sharing! Here's what you said: ${moreInfo}`);
      rl.close();
    });
  });
});
