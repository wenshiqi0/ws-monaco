"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const nls = require("vscode-nls");
const localize = nls.loadMessageBundle();
const path = require("path");
const fs = require("fs");
const vscode_1 = require("vscode");
const api_1 = require("./api");
class TypeScriptVersion {
    constructor(path, _pathLabel) {
        this.path = path;
        this._pathLabel = _pathLabel;
    }
    get tsServerPath() {
        return path.join(this.path, 'tsserver.js');
    }
    get pathLabel() {
        return typeof this._pathLabel === 'undefined' ? this.path : this._pathLabel;
    }
    get isValid() {
        return this.version !== undefined;
    }
    get version() {
        const version = this.getTypeScriptVersion(this.tsServerPath);
        if (version) {
            return version;
        }
        // Allow TS developers to provide custom version
        const tsdkVersion = vscode_1.workspace.getConfiguration().get('typescript.tsdk_version', undefined);
        if (tsdkVersion) {
            return api_1.default.fromVersionString(tsdkVersion);
        }
        return undefined;
    }
    get versionString() {
        const version = this.version;
        return version ? version.versionString : localize('couldNotLoadTsVersion', 'Could not load the TypeScript version at this path');
    }
    getTypeScriptVersion(serverPath) {
        if (!fs.existsSync(serverPath)) {
            return undefined;
        }
        let p = serverPath.split(path.sep);
        if (p.length <= 2) {
            return undefined;
        }
        let p2 = p.slice(0, -2);
        p2.pop();
        let modulePath = p2.join(path.sep);
        console.log(modulePath);
        let fileName = path.join(modulePath, 'package.json');
        if (!fs.existsSync(fileName)) {
            return undefined;
        }
        let contents = fs.readFileSync(fileName).toString();
        let desc = null;
        try {
            desc = JSON.parse(contents);
        }
        catch (err) {
            return undefined;
        }
        if (!desc || !desc.version) {
            return undefined;
        }
        return desc.version ? api_1.default.fromVersionString(desc.version) : undefined;
    }
}
exports.TypeScriptVersion = TypeScriptVersion;
class TypeScriptVersionProvider {
    constructor(configuration) {
        this.configuration = configuration;
    }
    updateConfiguration(configuration) {
        this.configuration = configuration;
    }
    get defaultVersion() {
        return this.globalVersion || this.bundledVersion;
    }
    get globalVersion() {
        if (this.configuration.globalTsdk) {
            const globals = this.loadVersionsFromSetting(this.configuration.globalTsdk);
            if (globals && globals.length) {
                return globals[0];
            }
        }
        return undefined;
    }
    get localVersion() {
        const tsdkVersions = this.localTsdkVersions;
        if (tsdkVersions && tsdkVersions.length) {
            return tsdkVersions[0];
        }
        const nodeVersions = this.localNodeModulesVersions;
        if (nodeVersions && nodeVersions.length === 1) {
            return nodeVersions[0];
        }
        return undefined;
    }
    get localVersions() {
        const allVersions = this.localTsdkVersions.concat(this.localNodeModulesVersions);
        const paths = new Set();
        return allVersions.filter(x => {
            if (paths.has(x.path)) {
                return false;
            }
            paths.add(x.path);
            return true;
        });
    }
    get bundledVersion() {
        try {
            const bundledVersion = new TypeScriptVersion(path.dirname(require.resolve('/Users/munong/Documents/github/TypeScript/built/local/tsserver.js')), '');
            if (bundledVersion.isValid) {
                return bundledVersion;
            }
        }
        catch (e) {
            // noop
        }
        vscode_1.window.showErrorMessage(localize('noBundledServerFound', 'VS Code\'s tsserver was deleted by another application such as a misbehaving virus detection tool. Please reinstall VS Code.'));
        throw new Error('Could not find bundled tsserver.js');
    }
    get localTsdkVersions() {
        const localTsdk = this.configuration.localTsdk;
        return localTsdk ? this.loadVersionsFromSetting(localTsdk) : [];
    }
    loadVersionsFromSetting(tsdkPathSetting) {
        if (path.isAbsolute(tsdkPathSetting)) {
            return [new TypeScriptVersion(tsdkPathSetting)];
        }
        for (const root of vscode_1.workspace.workspaceFolders || []) {
            const rootPrefixes = [`./${root.name}/`, `${root.name}/`, `.\\${root.name}\\`, `${root.name}\\`];
            for (const rootPrefix of rootPrefixes) {
                if (tsdkPathSetting.startsWith(rootPrefix)) {
                    const workspacePath = path.join(root.uri.fsPath, tsdkPathSetting.replace(rootPrefix, ''));
                    return [new TypeScriptVersion(workspacePath, tsdkPathSetting)];
                }
            }
        }
        return this.loadTypeScriptVersionsFromPath(tsdkPathSetting);
    }
    get localNodeModulesVersions() {
        return this.loadTypeScriptVersionsFromPath(path.join('node_modules', 'typescript', 'lib'))
            .filter(x => x.isValid);
    }
    loadTypeScriptVersionsFromPath(relativePath) {
        if (!vscode_1.workspace.workspaceFolders) {
            return [];
        }
        const versions = [];
        for (const root of vscode_1.workspace.workspaceFolders) {
            let label = relativePath;
            if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 1) {
                label = path.join(root.name, relativePath);
            }
            versions.push(new TypeScriptVersion(path.join(root.uri.fsPath, relativePath), label));
        }
        return versions;
    }
}
exports.TypeScriptVersionProvider = TypeScriptVersionProvider;
//# sourceMappingURL=versionProvider.js.map