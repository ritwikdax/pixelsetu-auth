export interface LoginFailureEvent {
    username: string;
    time: string;
    password: string;
    merchant: string;
}

export interface OrgInviteEvent {
    cta: string;
    name: string;
    namespace: string;
    sender: string;
    to: string;
}

