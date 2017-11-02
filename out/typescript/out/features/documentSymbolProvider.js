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
const PConst = require("../protocol.const");
const convert_1 = require("../utils/convert");
const outlineTypeTable = Object.create(null);
outlineTypeTable[PConst.Kind.module] = vscode_1.SymbolKind.Module;
outlineTypeTable[PConst.Kind.class] = vscode_1.SymbolKind.Class;
outlineTypeTable[PConst.Kind.enum] = vscode_1.SymbolKind.Enum;
outlineTypeTable[PConst.Kind.interface] = vscode_1.SymbolKind.Interface;
outlineTypeTable[PConst.Kind.memberFunction] = vscode_1.SymbolKind.Method;
outlineTypeTable[PConst.Kind.memberVariable] = vscode_1.SymbolKind.Property;
outlineTypeTable[PConst.Kind.memberGetAccessor] = vscode_1.SymbolKind.Property;
outlineTypeTable[PConst.Kind.memberSetAccessor] = vscode_1.SymbolKind.Property;
outlineTypeTable[PConst.Kind.variable] = vscode_1.SymbolKind.Variable;
outlineTypeTable[PConst.Kind.const] = vscode_1.SymbolKind.Variable;
outlineTypeTable[PConst.Kind.localVariable] = vscode_1.SymbolKind.Variable;
outlineTypeTable[PConst.Kind.variable] = vscode_1.SymbolKind.Variable;
outlineTypeTable[PConst.Kind.function] = vscode_1.SymbolKind.Function;
outlineTypeTable[PConst.Kind.localFunction] = vscode_1.SymbolKind.Function;
class TypeScriptDocumentSymbolProvider {
    constructor(client) {
        this.client = client;
    }
    provideDocumentSymbols(resource, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const filepath = this.client.normalizePath(resource.uri);
            if (!filepath) {
                return [];
            }
            const args = {
                file: filepath
            };
            try {
                const result = [];
                if (this.client.apiVersion.has206Features()) {
                    const response = yield this.client.execute('navtree', args, token);
                    if (response.body) {
                        // The root represents the file. Ignore this when showing in the UI
                        let tree = response.body;
                        if (tree.childItems) {
                            tree.childItems.forEach(item => TypeScriptDocumentSymbolProvider.convertNavTree(resource.uri, result, item));
                        }
                    }
                }
                else {
                    const response = yield this.client.execute('navbar', args, token);
                    if (response.body) {
                        let foldingMap = Object.create(null);
                        response.body.forEach(item => TypeScriptDocumentSymbolProvider.convertNavBar(resource.uri, 0, foldingMap, result, item));
                    }
                }
                return result;
            }
            catch (e) {
                return [];
            }
        });
    }
    static convertNavBar(resource, indent, foldingMap, bucket, item, containerLabel) {
        let realIndent = indent + item.indent;
        let key = `${realIndent}|${item.text}`;
        if (realIndent !== 0 && !foldingMap[key] && TypeScriptDocumentSymbolProvider.shouldInclueEntry(item.text)) {
            let result = new vscode_1.SymbolInformation(item.text, outlineTypeTable[item.kind] || vscode_1.SymbolKind.Variable, containerLabel ? containerLabel : '', new vscode_1.Location(resource, convert_1.tsTextSpanToVsRange(item.spans[0])));
            foldingMap[key] = result;
            bucket.push(result);
        }
        if (item.childItems && item.childItems.length > 0) {
            for (let child of item.childItems) {
                TypeScriptDocumentSymbolProvider.convertNavBar(resource, realIndent + 1, foldingMap, bucket, child, item.text);
            }
        }
    }
    static convertNavTree(resource, bucket, item, containerLabel) {
        const result = new vscode_1.SymbolInformation(item.text, outlineTypeTable[item.kind] || vscode_1.SymbolKind.Variable, containerLabel ? containerLabel : '', new vscode_1.Location(resource, convert_1.tsTextSpanToVsRange(item.spans[0])));
        if (item.childItems && item.childItems.length > 0) {
            for (const child of item.childItems) {
                TypeScriptDocumentSymbolProvider.convertNavTree(resource, bucket, child, result.name);
            }
        }
        if (TypeScriptDocumentSymbolProvider.shouldInclueEntry(result.name)) {
            bucket.push(result);
        }
    }
    static shouldInclueEntry(name) {
        return !!(name && name !== '<function>' && name !== '<class>');
    }
}
exports.default = TypeScriptDocumentSymbolProvider;
