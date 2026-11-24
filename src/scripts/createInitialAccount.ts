/*
 This file runs as part of the setup and creates an administrator account.
*/

import {hashSync} from '@node-rs/argon2';
import reader from 'readline-sync';
import Account from '../models/Account.js';
import {createAccount, getAllAccounts} from 'src/services/account.js';
import {isEmail, isPasswordStrong} from 'src/tools/utils';

const main = async () => {
    const accounts = await getAllAccounts();
    if (accounts.length > 0) {
        console.log("An administrator account already exists. Exiting setup.");
        process.exit(0);
    }

    console.log("Welcome to the SensorSphere setup! Let's create an administrator account.");

    let name, email, password;
    while (!name || !email || !password) {
        name = reader.question("Enter a username: ");
        email = reader.question("Enter an email address: ");
        password = reader.question("Enter a password: ", {hideEchoBack: true});
        if (!name || !email || !password) console.error("Please provide a username, email address, and password.\n");
    }

    while (!isEmail(email)) {
        console.error("The email address is not valid.");
        email = reader.question("Enter an email address: ");
    }

    while (!isPasswordStrong(password)) {
        console.error("The password is not strong enough. Please make sure it is between 15 and 128 characters long");
        password = reader.question("Enter a password: ", {hideEchoBack: true});
    }

    console.log("Creating administrator account...");
    const accountObj: Partial<Account> = {
        name,
        email,
        password: hashSync(password),
        role: "admin",
        hasChangedPassword: true,
    };

    try {
        const account = await createAccount(accountObj);

        if (!account) {
            console.error("An error occurred while creating the administrator account.");
            process.exit(1);
        }

        console.log("Administrator account created successfully.");
        console.log("Setup complete. You can now start the backend and frontend.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to create administrator account (the username or email may already exist):", error);
        process.exit(1);
    }
};

main().catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
});