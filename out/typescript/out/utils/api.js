"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
class API {
    constructor(versionString, version) {
        this.versionString = versionString;
        this.version = version;
    }
    static fromVersionString(versionString) {
        let version = semver.valid(versionString);
        if (!version) {
            return new API(localize('invalidVersion', 'invalid version'), '1.0.0');
        }
        // Cut of any prerelease tag since we sometimes consume those on purpose.
        const index = versionString.indexOf('-');
        if (index >= 0) {
            version = version.substr(0, index);
        }
        return new API(versionString, version);
    }
    has203Features() {
        return semver.gte(this.version, '2.0.3');
    }
    has206Features() {
        return semver.gte(this.version, '2.0.6');
    }
    has208Features() {
        return semver.gte(this.version, '2.0.8');
    }
    has213Features() {
        return semver.gte(this.version, '2.1.3');
    }
    has220Features() {
        return semver.gte(this.version, '2.2.0');
    }
    has222Features() {
        return semver.gte(this.version, '2.2.2');
    }
    has230Features() {
        return semver.gte(this.version, '2.3.0');
    }
    has234Features() {
        return semver.gte(this.version, '2.3.4');
    }
    has240Features() {
        return semver.gte(this.version, '2.4.0');
    }
    has250Features() {
        return semver.gte(this.version, '2.5.0');
    }
}
API.defaultVersion = new API('1.0.0', '1.0.0');
exports.default = API;
