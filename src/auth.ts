
import {
    WebAuth,
    Auth0DecodedHash,
} from 'auth0-js'
import { jSignal } from 'jsignal'
import * as _ from 'lodash'

import {
    AuthListeners,
    AuthOptions,
} from '../index.d'
import { AuthApi } from './api'

class Auth {
    private static DefaultResponseType: string = 'token id_token'
    private static DefaultScope: string = 'openid profile email'
    private static AccessTokenLSKey: string = 'access_token'
    private static IdTokenLSKey: string = 'id_token'
    private static ExpiresAtLSKey: string = 'expires_at'

    public readonly api: AuthApi

    private webAuth: WebAuth
    private localStoragePrefix: string
    private onAccessTokenChange: jSignal<string> = new jSignal<string>()
    private onIdTokenChange: jSignal<string> = new jSignal<string>()

    private static resolveLSItemName(key: string, prefix?: string): string {
        return typeof prefix === 'string' ? `${prefix}_${key}` : key
    }

    private static getLSItem(key: string, prefix?: string): string {
        return localStorage.getItem(Auth.resolveLSItemName(key, prefix))
    }

    private static setLSItem(key: string, value: string, prefix?: string): void {
        localStorage.setItem(Auth.resolveLSItemName(key, prefix), value)
    }

    private static removeLSItem(key: string, prefix?: string): void {
        localStorage.removeItem(Auth.resolveLSItemName(key, prefix))
    }

    private get expiresAt(): number { return Number(Auth.getLSItem(Auth.ExpiresAtLSKey, this.localStoragePrefix) || 0) }
    private set expiresAt(value: number) {
        Auth.setLSItem(Auth.ExpiresAtLSKey, value.toString(), this.localStoragePrefix)
    }

    public get accessToken(): string { return Auth.getLSItem(Auth.AccessTokenLSKey, this.localStoragePrefix) || null }
    public set accessToken(value: string) {
        Auth.setLSItem(Auth.AccessTokenLSKey, value, this.localStoragePrefix)
        this.api.setAccessToken(value)
        this.onAccessTokenChange.dispatch(value)
    }

    public get idToken(): string { return Auth.getLSItem(Auth.IdTokenLSKey, this.localStoragePrefix) || null }
    public set idToken(value: string) {
        Auth.setLSItem(Auth.IdTokenLSKey, value, this.localStoragePrefix)
        this.onIdTokenChange.dispatch(value)
    }

    public get isAuthenticated(): boolean {
        return this.accessToken && new Date().getTime() < this.expiresAt
    }

    constructor(options: AuthOptions) {
        this.api = new AuthApi(options.auth0.domain)
        if (this.isAuthenticated) {
            this.api.setAccessToken(this.accessToken)
        }

        const responseType = _.isArray(options.auth0.responseType) ?
            options.auth0.responseType.join(' ') : Auth.DefaultResponseType
        const scope = _.isArray(options.auth0.scope) ?
            options.auth0.scope.join(' ') : Auth.DefaultScope

        this.webAuth = new WebAuth({
            responseType, scope,
            domain: options.auth0.domain,
            clientID: options.auth0.clientId,
            redirectUri: options.auth0.callbackUrl,
        })

        if (options.listeners) {
            this.connect(options.listeners)
        }

        if (options.localStorage && options.localStorage.prefix) {
            this.localStoragePrefix = options.localStorage.prefix
        }
    }

    private setSession = async (authResult: Auth0DecodedHash): Promise<void> => {
        const expiresAt = (authResult.expiresIn * 1000) + new Date().getTime()
        this.accessToken = authResult.accessToken
        this.idToken = authResult.idToken
        this.expiresAt = expiresAt
    }

    public connect = (listeners: AuthListeners): void => {
        if (typeof listeners.onAccessTokenChange === 'string') {
            this.onAccessTokenChange.listen(listeners.onAccessTokenChange)
        }
        if (typeof listeners.onIdTokenChange === 'string') {
            this.onIdTokenChange.listen(listeners.onIdTokenChange)
        }
    }

    public disconnect = (listeners: AuthListeners): void => {
        if (typeof listeners.onAccessTokenChange === 'string') {
            this.onAccessTokenChange.unlisten(listeners.onAccessTokenChange)
        }
        if (typeof listeners.onIdTokenChange === 'string') {
            this.onIdTokenChange.unlisten(listeners.onIdTokenChange)
        }
    }

    public login = async (): Promise<void> => this.webAuth.authorize()

    public logout = async (): Promise<void> => {
        Auth.removeLSItem(Auth.AccessTokenLSKey, this.localStoragePrefix)
        Auth.removeLSItem(Auth.IdTokenLSKey, this.localStoragePrefix)
        Auth.removeLSItem(Auth.ExpiresAtLSKey, this.localStoragePrefix)
        this.api.unsetAccessToken()
    }

    public handleAuthorizationCallback = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            this.webAuth.parseHash(async (err, authResult) => {
                if (err) {
                    return reject(err)
                }
                await this.setSession(authResult)
                return resolve()
            })
        })
    }
}

export { Auth }
