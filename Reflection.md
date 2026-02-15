# Final Project Reflection

At first, finding and recording all the bugs was unexpectedly difficult. I had to think of many unexpected ways a user might break the app, like typing letters instead of numbers or sending money to a missing account. Testing these edge cases and writing down every detail in the test plan took a lot of time and effort.

Another big challenge was writing the automated tests. The application uses a tool called 'readline' to wait for human keyboard input. Since there is no real person typing during an automated test, my tests kept freezing. Trying to mock this user input was very confusing and hard to debug.

To solve this, I learned a great concept called "Separation of Concerns." I moved the math and data logic into a separate file (`core.js`) away to avoid the problem of 'readline' interface. After doing that, writing unit tests became very easy and clean. This also allowed me to easily fix critical bugs I found during Black Box testing. This project taught me how separating the user interface from the core logic makes code much better and easier to test.
