"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const Previewer = require("./previewer");
const convert_1 = require("../utils/convert");
class TypeScriptSignatureHelpProvider {
    constructor(client) {
        this.client = client;
    }
    provideSignatureHelp(document, position, token) {
        const filepath = this.client.normalizePath(document.uri);
        if (!filepath) {
            return Promise.resolve(null);
        }
        const args = convert_1.vsPositionToTsFileLocation(filepath, position);
        return this.client.execute('signatureHelp', args, token).then((response) => {
            const info = response.body;
            if (!info) {
                return null;
            }
            const result = new vscode_1.SignatureHelp();
            result.activeSignature = info.selectedItemIndex;
            result.activeParameter = info.argumentIndex;
            info.items.forEach((item, i) => {
                if (!info) {
                    return;
                }
                // keep active parameter in bounds
                if (i === info.selectedItemIndex && item.isVariadic) {
                    result.activeParameter = Math.min(info.argumentIndex, item.parameters.length - 1);
                }
                const signature = new vscode_1.SignatureInformation('');
                signature.label += Previewer.plain(item.prefixDisplayParts);
                item.parameters.forEach((p, i, a) => {
                    const parameter = new vscode_1.ParameterInformation(Previewer.plain(p.displayParts), Previewer.plain(p.documentation));
                    signature.label += parameter.label;
                    signature.parameters.push(parameter);
                    if (i < a.length - 1) {
                        signature.label += Previewer.plain(item.separatorDisplayParts);
                    }
                });
                signature.label += Previewer.plain(item.suffixDisplayParts);
                signature.documentation = Previewer.markdownDocumentation(item.documentation, item.tags);
                result.signatures.push(signature);
            });
            return result;
        }, () => {
            return null;
        });
    }
}
exports.default = TypeScriptSignatureHelpProvider;
