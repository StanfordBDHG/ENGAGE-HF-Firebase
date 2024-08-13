<!--

This source file is part of the Stanford Biodesign Digital Health Next.js Template open-source project

SPDX-FileCopyrightText: 2023 Stanford University and the project authors (see CONTRIBUTORS.md)

SPDX-License-Identifier: MIT

-->

# Minimally Reproducible Example

We set up a small, reproducible example for you to investigate the issue. The function calls you have been seeing are not from first creating an Anonymous account and second then creating an account with a username and password. It is only being called when a user directly creates an account.

To make this easy for you to reproduce, we went ahead and created a minimal reproducible example only containing a log in the blocking before user create and sign in methods. We even made it simple to reproduce it locally in the Firebase emulator. You can then also deploy it to a Firebase project in the cloud as well.

## Steps to Reproduce:

1. Check out Git repo [https://github.com/StanfordBDHG/ENGAGE-HF-Firebase](https://github.com/StanfordBDHG/ENGAGE-HF-Firebase) at branch `before-user-created` (latest commit).
2. Run `npm run prepare` (in the root directory of the repository) to install dependencies for both frontend and functions.
3. Run `npm run build` (in the root directory of the repository) to build both frontend and functions.
4. Run `npm run start` (in the root directory of the repository) to start up emulators and run the website - you will find the website at `localhost:3000` after a few seconds.

### Blue Button:

When tapping the blue button, we sign in anonymously and link to email credentials.  
- Results in console output of the website stating it successfully logged in and linked credentials.
- Neither `beforeUserSignedIn` nor `beforeUserCreated` is called, because there is no output on the functions log.

> [!CAUTION]
> This is unexpected behavior in our project setup. According to the documentation, this should be the case. In addition, we have this behavior working in other projects in the emulator and in the cloud.

### Red Button:

When tapping the red button, we sign in using credentials.  
- Results in console output of the website stating that it successfully logged in.
- Both `beforeUserCreated` and `beforeUserSignedIn` are called, as there is console output of the functions log.

> [!NOTE]
> This demonstrates that the logs are generally working and the cloud functions are executed in other use cases.

### Replicate in Production Setup

Paste the Firebase Credentials in the [https://github.com/StanfordBDHG/ENGAGE-HF-Firebase/blob/before-user-created/frontend/app/page.tsx#L15](frontend application) and remove the localhost and Firebase Emulator settings.

### Additional Context:

For some additional context: We successfully use the same blocking function setup with an anonymous login first and then linking the username, password, and credentials after that, and it correctly calls all functions in our Pediatric Apple Watch Study Firebase setup ([https://github.com/StanfordBDHG/PediatricAppleWatchStudy](https://github.com/StanfordBDHG/PediatricAppleWatchStudy)) in production, so we can confirm that the general mechanism seems to work. Somehow, this project seems to silently fail on this use case, and we don’t have any idea where this might come from.

## License

This project is licensed under the MIT License. See [Licenses](https://github.com/StanfordBDHG/NextJSTemplate/tree/main/LICENSES) for more information.

## Contributors

This project is developed as part of the Stanford Byers Center for Biodesign at Stanford University.
See [CONTRIBUTORS.md](https://github.com/StanfordBDHG/NextJSTemplate/tree/main/CONTRIBUTORS.md) for a full list of all Next.js Template contributors.

![Stanford Byers Center for Biodesign Logo](https://raw.githubusercontent.com/StanfordBDHG/.github/main/assets/biodesign-footer-light.png#gh-light-mode-only)
![Stanford Byers Center for Biodesign Logo](https://raw.githubusercontent.com/StanfordBDHG/.github/main/assets/biodesign-footer-dark.png#gh-dark-mode-only)
