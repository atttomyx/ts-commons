# `@milesoft/typescript-utils` 🛠️

[![npm version](https://badge.fury.io/js/%40milesoft%2Ftypescript-utils.svg)](https://www.npmjs.com/package/@milesoft/typescript-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A core utility library providing a collection of reusable, pure functions and specialized classes to enhance development efficiency and ensure code consistency across all Milesoft TypeScript projects.**

This package includes essential utilities for array entity management, error handling, storage access, and more, making it easier to write consistent and maintainable code.

***

## ✨ Features

This package provides utility functions organized into distinct, reusable classes. Since the module exports instantiated utility objects (e.g., `arrayUtils`), you should import the specific utility object you need.

| Exported Utility | Description | Key Methods Highlighted |
| :--- | :--- | :--- |
| **`arrayUtils`** | Comprehensive tools for array manipulation, focusing on entity management where items have an `id` field. | **`syncSavedEntity` / `syncSavedEntities`**: Handles upsert (update/insert) logic for entities in a local array, preserving existing fields if specified, and applying a sorter. |
| **`objectUtils`** | Fundamental helpers for checking object presence and deep cloning. | `nullOrUndefined`, `deepCopy`, `defaultIfNullOrUndefined` |
| **`stringUtils`** | Functions for safe string checking, sanitization, and case-insensitive comparisons. | `isNotBlank`, `sanitizeStr`, `containsIgnoreCase` |
| **`errorUtils`** | Standardized methods for error handling and API response status checks. | `sanitizeMessage`, `getStatusCode`, `isStatusCode` |
| **`storageUtils`** | Facades for interacting with `localStorage` and `sessionStorage` with built-in namespacing and JSON serialization/deserialization. | **`setNamespace`**, `getLocal()`, `getSession()` |
| **`cursorUtils`** | Utility class for abstracting recursive API calls that use a cursor/pagination token to load large datasets incrementally. | **`loadAll`** (recursive data fetching) |

***

## 🚀 Installation

To use this package in your project, install it using npm or yarn:

```bash
# Using npm
npm install @milesoft/typescript-utils

# Using yarn
yarn add @milesoft/typescript-utils
````

-----

## 💡 Usage

Utility objects should be imported directly from the package. This modular approach ensures that your bundler only includes the code you actually use.

### 🧱 Array and Object Helpers

```typescript
import { arrayUtils, objectUtils } from "@milesoft/typescript-utils";

// Object check
const isDefined = objectUtils.notNullOrUndefined(value); 

// Array entity management (assuming entities have an 'id')
const entities = [{ id: 'a', count: 1 }];
const newEntity = { id: 'a', count: 2 };
const updatedArray = arrayUtils.syncSavedEntity(entities, newEntity, null); 
// updatedArray is now [{ id: 'a', count: 2 }]
```

### 💾 Storage Facade

This demonstrates using the namespacing and object serialization features of `storageUtils`.

```typescript
import { storageUtils } from "@milesoft/typescript-utils";

// Set a global namespace to avoid key collisions with other apps
storageUtils.setNamespace('MILESOFT_APP'); 

interface UserSettings {
    theme: 'dark' | 'light';
}

// Get the local storage facade
const localStore = storageUtils.getLocal();

// Set an object (it handles JSON.stringify)
localStore.setObj('user_settings', { theme: 'dark' } as UserSettings);

// Get an object (it handles JSON.parse and is type-safe)
const settings = localStore.getObj<UserSettings>('user_settings');
console.log(settings?.theme); // Outputs: dark
```
