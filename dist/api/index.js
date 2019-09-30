"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_source_1 = require("http-source");
var AuthApi = (function () {
    function AuthApi(domain) {
        var _this = this;
        this.setAccessToken = function (accessToken) {
            return _this.source.setGlobalHeader('Authorization', "Bearer " + accessToken);
        };
        this.unsetAccessToken = function () {
            return _this.source.removeGlobalHeader('Authorization');
        };
        this.getUserInfo = function () {
            return _this.source.httpGet('/userinfo', {});
        };
        var baseUrl = AuthApi.ResolveBaseUrl(domain);
        this.source = new http_source_1.HttpSource(baseUrl);
        this.source.ErrorParser = function (error) { return error; };
    }
    AuthApi.ResolveBaseUrl = function (domain) {
        if (!domain.startsWith('http')) {
            return "https://" + domain;
        }
        return domain;
    };
    return AuthApi;
}());
exports.AuthApi = AuthApi;
//# sourceMappingURL=index.js.map