"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const convert_1 = require("../utils/convert");
class TypeScriptDefinitionProviderBase {
    constructor(client) {
        this.client = client;
    }
    getSymbolLocations(definitionType, document, position, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return Promise.resolve(null);
        }
        const args = convert_1.vsPositionToTsFileLocation(filepath, position);
        return this.client.execute(definitionType, args, token).then(response => {
            const locations = (response && response.body) || [];
            if (!locations || locations.length === 0) {
                return [];
            }
            return locations.map(location => {
                const resource = this.client.asUrl(location.file);
                if (resource === null) {
                    return null;
                }
                else {
                    return new vscode_1.Location(resource, convert_1.tsTextSpanToVsRange(location));
                }
            }).filter(x => x !== null);
        }, () => {
            return [];
        });
    }
}
exports.default = TypeScriptDefinitionProviderBase;
