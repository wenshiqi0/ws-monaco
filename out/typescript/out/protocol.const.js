"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class Kind {
}
Kind.alias = 'alias';
Kind.callSignature = 'call';
Kind.class = 'class';
Kind.const = 'const';
Kind.constructorImplementation = 'constructor';
Kind.constructSignature = 'construct';
Kind.directory = 'directory';
Kind.enum = 'enum';
Kind.externalModuleName = 'external module name';
Kind.file = 'file';
Kind.function = 'function';
Kind.indexSignature = 'index';
Kind.interface = 'interface';
Kind.keyword = 'keyword';
Kind.let = 'let';
Kind.localFunction = 'local function';
Kind.localVariable = 'local var';
Kind.memberFunction = 'method';
Kind.memberGetAccessor = 'getter';
Kind.memberSetAccessor = 'setter';
Kind.memberVariable = 'property';
Kind.module = 'module';
Kind.primitiveType = 'primitive type';
Kind.script = 'script';
Kind.type = 'type';
Kind.variable = 'var';
Kind.warning = 'warning';
exports.Kind = Kind;
class DiagnosticCategory {
}
DiagnosticCategory.error = 'error';
DiagnosticCategory.warning = 'warning';
exports.DiagnosticCategory = DiagnosticCategory;
