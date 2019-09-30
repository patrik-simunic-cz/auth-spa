"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var auth0_js_1 = require("auth0-js");
var jsignal_1 = require("jsignal");
var _ = require("lodash");
var api_1 = require("./api");
var Auth = (function () {
    function Auth(options) {
        var _this = this;
        this.onAccessTokenChange = new jsignal_1.jSignal();
        this.onIdTokenChange = new jsignal_1.jSignal();
        this.setSession = function (authResult) { return __awaiter(_this, void 0, void 0, function () {
            var expiresAt;
            return __generator(this, function (_a) {
                expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
                this.accessToken = authResult.accessToken;
                this.idToken = authResult.idToken;
                this.expiresAt = expiresAt;
                return [2];
            });
        }); };
        this.connect = function (listeners) {
            if (typeof listeners.onAccessTokenChange === 'string') {
                _this.onAccessTokenChange.listen(listeners.onAccessTokenChange);
            }
            if (typeof listeners.onIdTokenChange === 'string') {
                _this.onIdTokenChange.listen(listeners.onIdTokenChange);
            }
        };
        this.disconnect = function (listeners) {
            if (typeof listeners.onAccessTokenChange === 'string') {
                _this.onAccessTokenChange.unlisten(listeners.onAccessTokenChange);
            }
            if (typeof listeners.onIdTokenChange === 'string') {
                _this.onIdTokenChange.unlisten(listeners.onIdTokenChange);
            }
        };
        this.login = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2, this.webAuth.authorize()];
        }); }); };
        this.logout = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                Auth.removeLSItem(Auth.AccessTokenLSKey, this.localStoragePrefix);
                Auth.removeLSItem(Auth.IdTokenLSKey, this.localStoragePrefix);
                Auth.removeLSItem(Auth.ExpiresAtLSKey, this.localStoragePrefix);
                this.api.unsetAccessToken();
                return [2];
            });
        }); };
        this.handleAuthorizationCallback = function () {
            return new Promise(function (resolve, reject) {
                _this.webAuth.parseHash(function (err, authResult) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    return [2, reject(err)];
                                }
                                return [4, this.setSession(authResult)];
                            case 1:
                                _a.sent();
                                return [2, resolve()];
                        }
                    });
                }); });
            });
        };
        this.api = new api_1.AuthApi(options.auth0.domain);
        if (this.isAuthenticated) {
            this.api.setAccessToken(this.accessToken);
        }
        var responseType = _.isArray(options.auth0.responseType) ?
            options.auth0.responseType.join(' ') : Auth.DefaultResponseType;
        var scope = _.isArray(options.auth0.scope) ?
            options.auth0.scope.join(' ') : Auth.DefaultScope;
        this.webAuth = new auth0_js_1.WebAuth({
            responseType: responseType, scope: scope,
            domain: options.auth0.domain,
            clientID: options.auth0.clientId,
            redirectUri: options.auth0.callbackUrl,
        });
        if (options.listeners) {
            this.connect(options.listeners);
        }
        if (options.localStorage && options.localStorage.prefix) {
            this.localStoragePrefix = options.localStorage.prefix;
        }
    }
    Auth.resolveLSItemName = function (key, prefix) {
        return typeof prefix === 'string' ? prefix + "_" + key : key;
    };
    Auth.getLSItem = function (key, prefix) {
        return localStorage.getItem(Auth.resolveLSItemName(key, prefix));
    };
    Auth.setLSItem = function (key, value, prefix) {
        localStorage.setItem(Auth.resolveLSItemName(key, prefix), value);
    };
    Auth.removeLSItem = function (key, prefix) {
        localStorage.removeItem(Auth.resolveLSItemName(key, prefix));
    };
    Object.defineProperty(Auth.prototype, "expiresAt", {
        get: function () { return Number(Auth.getLSItem(Auth.ExpiresAtLSKey, this.localStoragePrefix) || 0); },
        set: function (value) {
            Auth.setLSItem(Auth.ExpiresAtLSKey, value.toString(), this.localStoragePrefix);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Auth.prototype, "accessToken", {
        get: function () { return Auth.getLSItem(Auth.AccessTokenLSKey, this.localStoragePrefix) || null; },
        set: function (value) {
            Auth.setLSItem(Auth.AccessTokenLSKey, value, this.localStoragePrefix);
            this.api.setAccessToken(value);
            this.onAccessTokenChange.dispatch(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Auth.prototype, "idToken", {
        get: function () { return Auth.getLSItem(Auth.IdTokenLSKey, this.localStoragePrefix) || null; },
        set: function (value) {
            Auth.setLSItem(Auth.IdTokenLSKey, value, this.localStoragePrefix);
            this.onIdTokenChange.dispatch(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Auth.prototype, "isAuthenticated", {
        get: function () {
            return this.accessToken && new Date().getTime() < this.expiresAt;
        },
        enumerable: true,
        configurable: true
    });
    Auth.DefaultResponseType = 'token id_token';
    Auth.DefaultScope = 'openid profile email';
    Auth.AccessTokenLSKey = 'access_token';
    Auth.IdTokenLSKey = 'id_token';
    Auth.ExpiresAtLSKey = 'expires_at';
    return Auth;
}());
exports.Auth = Auth;
//# sourceMappingURL=auth.js.map