const accountSid = "AC1b109a95cc00ab4c9cca61f8945c1d1c"; // Your Account SID from www.twilio.com/console
const authToken = "4d6486e9aef2905f88fd4c562073a4e4"; // Your Auth Token from www.twilio.com/console

const twilio = require("twilio");
const client = new twilio(accountSid, authToken);

client.messages
  .create({
    body: "Hello from Node",
    to: "+5579991339258", // Text this number
    from: "+5579988205410", // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
