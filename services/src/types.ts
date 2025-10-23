// auth

export interface AuthUser {
    appId: string;
    accountId: string;
    userId: string;
    email: string;
    roles: string[];
}

export interface LoginResponse {
    accounts?: Account[];
    cursor?: string;
}

export interface Login {
    userId: string;
    created: string;
    updated: string;
}

export interface LoginList {
    users: Login[];
    cursor?: string;
}

// account

export interface Branding {
    logoUrl?: string;
    logoContainsName: boolean;
    primaryColor: string;
    secondaryColor: string;
}

export interface Account {
    id: string;
    name: string;
    website?: string;
    branding: Branding;
    allowJoin: boolean;
    code?: string;
    created: string;
    modified: string;
    settings: Record<string, any>;
    decorations: Record<string, any>;
}

export interface JoinUser {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
}

export interface Join {
    user?: JoinUser;
    google?: string;
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
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    imageUrl?: string;
    typeId?: string;
    roles: string[];
    created: string;
    updated: string;
    types: Record<string, boolean>;
    settings: Record<string, any>;
    decorations: Record<string, any>;
}

export interface Profile {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    imageUrl?: string;
    google?: boolean;
    temporary?: boolean;
    created: string;
    updated: string;
    settings: Record<string, any>;
    decorations: Record<string, any>;
}

export interface UserList {
    users: User[];
    cursor?: string;
}

export interface UserUtils {
    sanitizeUser: (user: User) => void;
    sanitizeProfile: (profile: Profile) => void;
}

// types

export interface Type {
    id: string;
    title: string;
    description?: string;
    roles: string[];
    created: string;
    updated: string;
}

export interface TypeList {
    types: Type[];
    cursor?: string;
}

// nodes

export interface LabeledString {
    label: string;
    value: string;
}

export interface LabeledAddress {
    label: string;
    line1?: string;
    line2?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
}

export interface Node {
    id: string;
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
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
    decorations: Record<string, any>;
}

export interface NodeList {
    nodes: Node[];
    cursor?: string;
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
    metadata: Record<string, any>;
    decorations: Record<string, any>;
}

export interface EdgeList {
    edges: Edge[];
    cursor?: string;
}
