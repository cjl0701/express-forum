const bcrypt = require("bcrypt");
const saltRounds = 10; //높을수록 뚫기 어려움
const myPlaintextPassword = "1111";
const someOtherPlaintextPassword = "1112";

bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
  // Store hash in your password DB.
  console.log(hash);
  bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
    // result == true
    console.log("my password: ", result);
  });
  bcrypt.compare(someOtherPlaintextPassword, hash, function (err, result) {
    // result == false
    console.log("other password: ", result);
  });
});
