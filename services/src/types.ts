// auth

export interface AuthUser {
    appId: string;
    accountId: string;
    userId: string;
    email: string;
    roles: string[];
}

export interface LoginResponse {
    accounts: Account[] | null;
    cursor: string;
}

export interface RecoverResponse {
    password: string;
}

export interface Login {
    userId: string;
    created: string;
    updated: string;
}

export interface LoginList {
    users: Login[];
    cursor: string | null;
}

// account

export interface Branding {
    logoUrl: string | null;
    logoContainsName: boolean;
    primaryColor: string;
    secondaryColor: string;
}

export interface Account {
    id: string;
    name: string;
    website: string | null;
    branding: Branding;
    allowJoin: boolean;
    code: string | null;
    created: string;
    modified: string;
    settings: Record<string, string | number | boolean | null>;
    decorations: Record<string, string | number | boolean | null>;
}

export interface Join {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    password: string;
    code: string;
}

export interface AccountUser {
    account: Account;
    user: User;
}

export interface AccountUtils {
    sanitizeAccount: (account: Account) => void;
}

// users

export interface User {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    imageUrl: string | null;
    typeId: string | null;
    roles: string[];
    created: string;
    updated: string;
    types: Record<string, boolean>;
    settings: Record<string, string | number | boolean | null>;
    decorations: Record<string, string | number | boolean | null>;
}

export interface Profile {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    imageUrl: string | null;
    created: string;
    updated: string;
    settings: Record<string, string | number | boolean | null>;
    decorations: Record<string, string | number | boolean | null>;
}

export interface UserList {
    users: User[];
    cursor: string | null;
}

export interface UserUtils {
    sanitizeUser: (user: User) => void;
    sanitizeProfile: (profile: Profile) => void;
}

// types

export interface Type {
    id: string;
    title: string;
    description: string | null;
    roles: string[];
    created: string;
    updated: string;
}

export interface TypeList {
    types: Type[];
    cursor: string | null;
}

// nodes

export interface LabeledString {
    label: string;
    value: string;
}

export interface LabeledAddress {
    label: string;
    line1: string | null;
    line2: string | null;
    locality: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
}

export interface Node {
    id: string;
    imageUrl: string | null;
    firstName: string | null;
    lastName: string | null;
    phones: LabeledString[];
    emails: LabeledString[];
    urls: LabeledString[];
    addresses: LabeledAddress[];
    dates: LabeledString[];
    others: LabeledString[];
    tags: string[];
    created: string;
    updated: string;
    metadata: Record<string, any>;
    decorations: Record<string, string | number | boolean | null>;
}

export interface NodeList {
    nodes: Node[];
    cursor: string | null;
}

// edges

export interface Edge {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    category: string;
    label: string;
    created: string;
    updated: string;
    metadata: Record<string, string | number | boolean | null>;
    decorations: Record<string, string | number | boolean | null>;
}

export interface EdgeList {
    edges: Edge[];
    cursor: string | null;
}
