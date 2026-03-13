export type EmailTemplate = 'pixelsetu_login_failure' | 'onboard_pixelsetu' | 'pixelsetu_org_invitation' | 'pixelsetu_welcome';

export interface LoginFailureEvent {
    username: string;
    time: string;
    password: string;
    merchant: string;
}

export interface OrgInviteEvent {
    ctaUrl: string;
    name: string;
    orgName: string;
    orgOwner: string;
    orgRole: string;
    sender: string;
    to: string;
}

export interface WelcomeEmailEvent {
    name: string;
    email: string;
    ctaUrl: string;
}



//Payload structure of Email For Mailgun Template
//===============================================
export interface OrgInviteMailPayload {
    ctaUrl: string;
    orgName: string;
    orgRole: string;
}

export interface WelcomeMailPayload {
    name: string;
    ctaUrl: string;
}

//===============================================
