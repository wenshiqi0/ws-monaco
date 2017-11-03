"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const convert_1 = require("../utils/convert");
class TypeScriptRenameProvider {
    constructor(client) {
        this.client = client;
    }
    provideRenameEdits(document, position, newName, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = this.client.normalizePath(document.uri);
            if (!filepath) {
                return null;
            }
            const args = Object.assign({}, convert_1.vsPositionToTsFileLocation(filepath, position), { findInStrings: false, findInComments: false });
            try {
                const response = yield this.client.execute('rename', args, token);
                const renameResponse = response.body;
                if (!renameResponse) {
                    return null;
                }
                const renameInfo = renameResponse.info;
                if (!renameInfo.canRename) {
                    return Promise.reject(renameInfo.localizedErrorMessage);
                }
                const result = new vscode_1.WorkspaceEdit();
                for (const spanGroup of renameResponse.locs) {
                    const resource = this.client.asUrl(spanGroup.file);
                    if (!resource) {
                        continue;
                    }
                    for (const textSpan of spanGroup.locs) {
                        result.replace(resource, convert_1.tsTextSpanToVsRange(textSpan), newName);
                    }
                }
                return result;
            }
            catch (e) {
                // noop
            }
            return null;
        });
    }
}
exports.default = TypeScriptRenameProvider;
