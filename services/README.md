# `@milesoft/typescript-services` ☁️

[![npm version](https://badge.fury.io/js/%40milesoft%2Ftypescript-services.svg)](https://www.npmjs.com/package/@milesoft/typescript-services)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A collection of client-side service classes for interacting with Milesoft's standardized REST APIs. This package
centralizes HTTP configuration, authentication, and error handling.**

This library provides ready-to-use, initialized service objects (`authService`, `userService`, etc.) that abstract away
network logic, allowing application code to focus purely on data flow.

-----

## ✨ Features

The package exports singleton instances of service classes, each managing API calls for a specific domain:

| Service Export            | Domain                           | Key Responsibilities                                                                                                                                                                          |
|:--------------------------|:---------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`authService`**         | Authentication and Authorization | Initializes and manages `axios` instances (including one *without* auth headers for login/recovery). Handles JWT storage, request cancellation, and unauthenticated response interceptors.    |
| **`accountService`**      | Account Management and Joining   | Provides logic for loading, saving, and joining accounts. Requires an external `AccountUtils` object for entity sanitation.                                                                   |
| **`userService`**         | User and Profile Management      | Provides CRUD operations (`list`, `create`, `save`, `delete`) for user entities, and dedicated methods for profile management. Requires an external `UserUtils` object for entity sanitation. |
| **`typeService`**         | User Typ Management              | Provides standardized CRUD operations for custom user types and permissions.                                                                                                                  |
| **`notificationService`** | Notifications and Preferences    | Provides methods for listing, marking, and deleting user notifications. Manages user preference settings for different notification types and topics.                                         |
| **`nodeService`**         | Node/Entity Management           | Provides CRUD and list operations for generic graph nodes, including contact information and metadata.                                                                                        |
| **`edgeService`**         | Edge/Relationship Management     | Provides CRUD and list operations for relationships (edges) between nodes.                                                                                                                    |
| **`cloudinaryService`**   | Image Uploads                    | Dedicated service for uploading user and account images to the configured Cloudinary instance.                                                                                                |

-----

## ⚙️ Peer Dependencies

This library is designed to work within the Milesoft ecosystem and relies on the following packages (which you must
install alongside this one):

| Package                          | Purpose                                                                       |
|:---------------------------------|:------------------------------------------------------------------------------|
| `@milesoft/typescript-constants` | Provides keys for JWT and temporary password storage.                         |
| `@milesoft/typescript-utils`     | Provides `storageUtils` for browser storage and `stringUtils` for JWT checks. |
| `axios` & `axios-retry`          | The underlying HTTP client and its robust retry logic.                        |

-----

## 🚀 Installation

Install the service package and its required peer dependencies:

```bash
# Install the core service package
npm install @milesoft/typescript-services

# Install peer dependencies
npm install @milesoft/typescript-constants @milesoft/typescript-utils axios axios-retry
```

-----

## 💡 Usage

### 1\. Initialization (Required)

Before making any requests, the service objects **must be initialized** to configure the base URL, timeouts, and error
handling. It's recommended to do this once at application startup.

**Note:** `userService` and other services rely on `authService` for its configured `axios` instance.

```typescript
import {authService, userService, accountService, cloudinaryService} from "@milesoft/typescript-services";

// Define unauthenticated handler
const handleUnauthenticated = () => {
    // Redirect user to login page, clear state, etc.
    authService.clearAuthToken();
    window.location.href = '/login';
};

// Required utilities for data formatting
const myAppUserUtils = {
    sanitizeUser: (user) => { /* ... */
    },
    sanitizeProfile: (profile) => { /* ... */
    },
};

const myAppAccountUtils = {
    sanitizeAccount: (account) => { /* ... */
    },
};

// 1. Initialize Auth Service (Must be first)
authService.init({
    baseUrl: 'https://api.yourdomain.com',
    timeout: 30000,
    retries: 3,
    onUnauthenticated: handleUnauthenticated,
});

// 2. Initialize other services
accountService.init({
    baseUrl: 'https://api.yourdomain.com',
    accountUtils: myAppAccountUtils,
    userUtils: myAppUserUtils,
});

userService.init({
    baseUrl: 'https://api.yourdomain.com',
    userUtils: myAppUserUtils,
});

typeService.init({
    baseUrl: 'https://api.yourdomain.com',
});

notificationService.init({
    baseUrl: 'https://api.yourdomain.com',
    notificationTypes: {
        'new_user': { role: 'ROLE_ADMIN', description: 'Someone signed up', delivery: 'App' },
        // ... other types
    },
    topicTypes: {
        'announcement': { role: 'ROLE_USER', description: 'Something interesting happened', delivery: 'App' },
        // ... other topics
    }
});

nodeService.init({
    baseUrl: 'https://api.yourdomain.com',
});

edgeService.init({
    baseUrl: 'https://api.yourdomain.com',
});

cloudinaryService.init({
    cloudinaryId: 'your-cloudinary-cloud-name', // e.g., 'milesoft'
});
```

### 2\. Making Requests

All service methods utilize standardized success and failure callback patterns.

```typescript
import {authService, userService, type Type} from "@milesoft/typescript-services";

// --- Example: Getting the logged-in user ---
authService.getLoggedInUser(
    (user) => {
        console.log("Logged-in user:", user.email);
    },
    (error) => {
        console.error("Failed to fetch user:", error.message);
    }
);

// --- Example: Creating a new Type Entity ---
const newTypeData: Partial<Type> = {
    title: "New Role",
    description: "A description of the role.",
    roles: ["admin", "editor"],
};

typeService.createType(
    newTypeData,
    (createdType) => {
        console.log("Type created with ID:", createdType.id);
    },
    (error) => {
        console.error("Type creation failed:", error);
    }
);

// --- Example: Marking notifications as read ---
notificationService.markAsRead(
    ["id-1", "id-2"],
    (ids) => {
        console.log(`Successfully marked ${ids.length} notifications as read.`);
    },
    (error) => {
        console.error("Failed to mark notifications as read:", error);
    }
);

// --- Example: Creating a new Node Entity ---
const newNodeData: Partial<Node> = {
    firstName: "John",
    lastName: "Doe",
    emails: [{label: "Work", value: "john@work.com"}],
};

nodeService.createNode(
    newNodeData,
    (createdNode) => {
        console.log("Node created with ID:", createdNode.id);
    },
    (error) => {
        console.error("Node creation failed:", error);
    }
);

// --- Example: Creating an Edge (relationship) between two Nodes ---
const newEdgeData: Partial<Edge> = {
    sourceNodeId: "node-123",
    targetNodeId: "node-456",
    category: "WorksWith",
    label: "Colleague",
};

edgeService.createEdge(
    newEdgeData,
    (createdEdge) => {
        console.log("Edge created from", createdEdge.sourceNodeId, "to", createdEdge.targetNodeId);
    },
    (error) => {
        console.error("Edge creation failed:", error);
    }
);

// --- Example: Uploading an image ---
const imageFile: File = new File(["..."], "logo.png");  // Assume you have a file object
const accountId: string = "a1b2c3d4e5f6";

cloudinaryService.uploadAccountImage(
    accountId,
    imageFile,
    (secureUrl) => {
        console.log("Image uploaded to:", secureUrl);
    },
    (error) => {
        console.error("Image upload failed:", error);
    }
);
```
