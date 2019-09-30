
import { Listener } from 'jsignal'

export interface UserInfo {
    sub: string
    name: string
    nickname: string
    picture: string
    email: string
    email_verified?: boolean
}

export type Auth0AuthScope = 'openid'|'profile'|'email'
export type Auth0ResponseType = 'token'|'id_token'

export interface AuthListeners {
    onAccessTokenChange?: Listener<string>
    onIdTokenChange?: Listener<string>
}

export interface Auth0Options {
    domain: string
    clientId: string
    callbackUrl: string
    responseType?: Auth0ResponseType[]
    scope?: Auth0AuthScope[]
}

export interface AuthLocalStorageOptions {
    prefix?: string
}

export interface AuthOptions {
    auth0: Auth0Options
    listeners?: AuthListeners
    localStorage?: AuthLocalStorageOptions
}

export interface AuthApi {
    setAccessToken(accessToken: string): void
    unsetAccessToken(): void

    getUserInfo(): Promise<UserInfo>
}

declare module '@7h3d0c70r/auth-spa' {
    export class Auth {
        public readonly api: AuthApi

        public accessToken: string
        public idToken: string
        public isAuthenticated: boolean

        constructor(options: AuthOptions)

        public connect(listeners: AuthListeners): void
        public disconnect(listeners: AuthListeners): void

        public login(): Promise<void>
        public logout(): Promise<void>
        public handleAuthorizationCallback(): Promise<void>
    }
}
