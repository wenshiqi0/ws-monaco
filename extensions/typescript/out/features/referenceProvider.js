"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const convert_1 = require("../utils/convert");
class TypeScriptReferenceSupport {
    constructor(client) {
        this.client = client;
    }
    provideReferences(document, position, options, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return Promise.resolve([]);
        }
        const args = convert_1.vsPositionToTsFileLocation(filepath, position);
        const apiVersion = this.client.apiVersion;
        return this.client.execute('references', args, token).then((msg) => {
            const result = [];
            if (!msg.body) {
                return result;
            }
            const refs = msg.body.refs;
            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                if (!options.includeDeclaration && apiVersion.has203Features() && ref.isDefinition) {
                    continue;
                }
                const url = this.client.asUrl(ref.file);
                const location = new vscode_1.Location(url, convert_1.tsTextSpanToVsRange(ref));
                result.push(location);
            }
            return result;
        }, () => {
            return [];
        });
    }
}
exports.default = TypeScriptReferenceSupport;
