/*
 This file runs as part of the setup and creates an administrator account.
*/

import { hashSync } from "@node-rs/argon2";
import reader from "readline-sync";
import Account from "src/models/Account";
// import dbConnect from "src/mongo";
import { createAccount, getAllAccounts } from "src/services/Account";
import { isEmail, isPasswordStrong } from "src/tools/utils";

// dbConnect();

const main = async () => {
  const accounts = await getAllAccounts();
  if (accounts.length > 0) {
    console.log("An administrator account already exists. Exiting setup.");
    process.exit(0);
  }

  console.log("Welcome to the SensorSphere setup! Let's create an administrator account.");

  let Name, Email, Password;
  while (!Name || !Email || !Password) {
    Name = reader.question("Enter a username: ");
    Email = reader.question("Enter an email address: ");
    Password = reader.question("Enter a password: ", { hideEchoBack: true });
    if (!Name || !Email || !Password) console.error("Please provide a username, email address, and password.\n");
  }

  while (!isEmail(Email)) {
    console.error("The email address is not valid.");
    Email = reader.question("Enter an email address: ");
  }

  //   while (!isPasswordStrong(password)) {
  //     console.error(
  //       "The password is not strong enough. Please make sure it has at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
  //     );
  //     password = reader.question("Enter a password: ", { hideEchoBack: true });
  //   }

  console.log("Creating administrator account...");
  const accountObj: Partial<Account> = {
    Name,
    Email,
    Password: hashSync(Password),
    Role: "administrator",
    HasChangedPassword: true, // We already created a secure password, no need to change it
  };
  const account = await createAccount(accountObj);

  if (!account) {
    console.error("An error occurred while creating the administrator account.");
    process.exit(1);
  }

  console.log("Administrator account created successfully.");
  console.log("Setup complete. You can now start the backend and frontend.");
  process.exit(0);
};

main();
