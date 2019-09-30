
import { AxiosError } from 'axios'
import { HttpSource } from 'http-source'

import {
    UserInfo,
} from '../../index.d'

class AuthApi {
    private source: HttpSource<AxiosError>

    private static ResolveBaseUrl(domain: string): string {
        if (!domain.startsWith('http')) {
            return `https://${domain}`
        }
        return domain
    }

    constructor(domain: string) {
        const baseUrl: string = AuthApi.ResolveBaseUrl(domain)
        this.source = new HttpSource<AxiosError>(baseUrl)
        this.source.ErrorParser = error => error
    }

    public setAccessToken = (accessToken: string): void =>
        this.source.setGlobalHeader('Authorization', `Bearer ${accessToken}`)

    public unsetAccessToken = (): void =>
        this.source.removeGlobalHeader('Authorization')

    public getUserInfo = (): Promise<UserInfo> =>
        this.source.httpGet<UserInfo>('/userinfo', {})
}

export { AuthApi }
