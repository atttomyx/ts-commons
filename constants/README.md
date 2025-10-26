# `@milesoft/typescript-constants` 🧱

[![npm version](https://badge.fury.io/js/%40milesoft%2Ftypescript-constants.svg)](https://www.npmjs.com/package/@milesoft/typescript-constants)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A centralized collection of fixed, non-computational constants and application-wide configurations shared across
Milesoft's TypeScript applications.**

This package serves as the **single source of truth** for values like configuration settings, enumerations, and
localStorage keys, ensuring consistency across all projects that depend on it.

## ✨ Features

The following constants are available for import:

| Export Name  | Description                                                                                  | Example Value                                    |
|:-------------|:---------------------------------------------------------------------------------------------|:-------------------------------------------------|
| **`themes`** | Provides standardized string values for UI themes.                                           | `{ light: "Light", dark: "Dark" }`               |
| **`limits`** | Defines common numeric size limits for different contexts (e.g., pagination, thresholds).    | `{ small: 10, medium: 100 }`                     |
| **`keys`**   | Contains commonly used string keys, typically for local storage, cookies, or URL parameters. | `{ authToken: "auth_token" }`                    |
| **`time`**   | Defines fundamental units of time as integers.                                               | `{ millisecondsInSecond: 1000, hoursInDay: 24 }` |
| **`times`**  | Calculates common time periods in milliseconds.                                              | `{ minute: 60000, day: 86400000 }`               |

-----

## 🚀 Installation

To use this package in your project, install it using npm or yarn:

```bash
# Using npm
npm install @milesoft/typescript-constants

# Using yarn
yarn add @milesoft/typescript-constants
```

-----

## 💡 Usage

Once installed, you can import the constant objects directly into your TypeScript files.

```typescript
import {keys, limits, themes} from "@milesoft/typescript-constants";

// Accessing a key for local storage
localStorage.setItem('USER_TOKEN', keys.authToken);

// Using a predefined limit
if (userList.length > limits.medium) {
    console.log(`Maximum allowed users exceeded: ${limits.medium}`);
}

// Applying a theme
document.body.className = themes.dark;

// Accessing a time unit (time)
const maxAgeInSeconds = time.hoursInDay * time.secondsInMinute;

// Using a calculated time period (times)
const isRecent = Date.now() - timestamp < times.day;
```
