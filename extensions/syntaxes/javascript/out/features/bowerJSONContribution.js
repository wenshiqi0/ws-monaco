/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var vscode_1 = require("vscode");
var markedTextUtil_1 = require("./markedTextUtil");
var nls = require("vscode-nls");
var localize = nls.loadMessageBundle();
var BowerJSONContribution = (function () {
    function BowerJSONContribution(xhr) {
        this.xhr = xhr;
        this.topRanked = ['twitter', 'bootstrap', 'angular-1.1.6', 'angular-latest', 'angulerjs', 'd3', 'myjquery', 'jq', 'abcdef1234567890', 'jQuery', 'jquery-1.11.1', 'jquery',
            'sushi-vanilla-x-data', 'font-awsome', 'Font-Awesome', 'font-awesome', 'fontawesome', 'html5-boilerplate', 'impress.js', 'homebrew',
            'backbone', 'moment1', 'momentjs', 'moment', 'linux', 'animate.css', 'animate-css', 'reveal.js', 'jquery-file-upload', 'blueimp-file-upload', 'threejs', 'express', 'chosen',
            'normalize-css', 'normalize.css', 'semantic', 'semantic-ui', 'Semantic-UI', 'modernizr', 'underscore', 'underscore1',
            'material-design-icons', 'ionic', 'chartjs', 'Chart.js', 'nnnick-chartjs', 'select2-ng', 'select2-dist', 'phantom', 'skrollr', 'scrollr', 'less.js', 'leancss', 'parser-lib',
            'hui', 'bootstrap-languages', 'async', 'gulp', 'jquery-pjax', 'coffeescript', 'hammer.js', 'ace', 'leaflet', 'jquery-mobile', 'sweetalert', 'typeahead.js', 'soup', 'typehead.js',
            'sails', 'codeigniter2'];
    }
    BowerJSONContribution.prototype.getDocumentSelector = function () {
        return [{ language: 'json', pattern: '**/bower.json' }, { language: 'json', pattern: '**/.bower.json' }];
    };
    BowerJSONContribution.prototype.collectDefaultSuggestions = function (resource, collector) {
        var defaultValue = {
            'name': '${1:name}',
            'description': '${2:description}',
            'authors': ['${3:author}'],
            'version': '${4:1.0.0}',
            'main': '${5:pathToMain}',
            'dependencies': {}
        };
        var proposal = new vscode_1.CompletionItem(localize('json.bower.default', 'Default bower.json'));
        proposal.kind = vscode_1.CompletionItemKind.Class;
        proposal.insertText = new vscode_1.SnippetString(JSON.stringify(defaultValue, null, '\t'));
        collector.add(proposal);
        return Promise.resolve(null);
    };
    BowerJSONContribution.prototype.collectPropertySuggestions = function (resource, location, currentWord, addValue, isLast, collector) {
        if ((location.matches(['dependencies']) || location.matches(['devDependencies']))) {
            if (currentWord.length > 0) {
                var queryUrl = 'https://bower.herokuapp.com/packages/search/' + encodeURIComponent(currentWord);
                return this.xhr({
                    url: queryUrl
                }).then(function (success) {
                    if (success.status === 200) {
                        try {
                            var obj = JSON.parse(success.responseText);
                            if (Array.isArray(obj)) {
                                var results = obj;
                                for (var i = 0; i < results.length; i++) {
                                    var name = results[i].name;
                                    var description = results[i].description || '';
                                    var insertText = new vscode_1.SnippetString().appendText(JSON.stringify(name));
                                    if (addValue) {
                                        insertText.appendText(': ').appendPlaceholder('latest');
                                        if (!isLast) {
                                            insertText.appendText(',');
                                        }
                                    }
                                    var proposal = new vscode_1.CompletionItem(name);
                                    proposal.kind = vscode_1.CompletionItemKind.Property;
                                    proposal.insertText = insertText;
                                    proposal.filterText = JSON.stringify(name);
                                    proposal.documentation = description;
                                    collector.add(proposal);
                                }
                                collector.setAsIncomplete();
                            }
                        }
                        catch (e) {
                        }
                    }
                    else {
                        collector.error(localize('json.bower.error.repoaccess', 'Request to the bower repository failed: {0}', success.responseText));
                        return 0;
                    }
                }, function (error) {
                    collector.error(localize('json.bower.error.repoaccess', 'Request to the bower repository failed: {0}', error.responseText));
                    return 0;
                });
            }
            else {
                this.topRanked.forEach(function (name) {
                    var insertText = new vscode_1.SnippetString().appendText(JSON.stringify(name));
                    if (addValue) {
                        insertText.appendText(': ').appendPlaceholder('latest');
                        if (!isLast) {
                            insertText.appendText(',');
                        }
                    }
                    var proposal = new vscode_1.CompletionItem(name);
                    proposal.kind = vscode_1.CompletionItemKind.Property;
                    proposal.insertText = insertText;
                    proposal.filterText = JSON.stringify(name);
                    proposal.documentation = '';
                    collector.add(proposal);
                });
                collector.setAsIncomplete();
                return Promise.resolve(null);
            }
        }
        return null;
    };
    BowerJSONContribution.prototype.collectValueSuggestions = function (resource, location, collector) {
        if ((location.matches(['dependencies', '*']) || location.matches(['devDependencies', '*']))) {
            // not implemented. Could be do done calling the bower command. Waiting for web API: https://github.com/bower/registry/issues/26
            var proposal = new vscode_1.CompletionItem(localize('json.bower.latest.version', 'latest'));
            proposal.insertText = new vscode_1.SnippetString('"${1:latest}"');
            proposal.filterText = '""';
            proposal.kind = vscode_1.CompletionItemKind.Value;
            proposal.documentation = 'The latest version of the package';
            collector.add(proposal);
        }
        return Promise.resolve(null);
    };
    BowerJSONContribution.prototype.resolveSuggestion = function (item) {
        if (item.kind === vscode_1.CompletionItemKind.Property && item.documentation === '') {
            return this.getInfo(item.label).then(function (documentation) {
                if (documentation) {
                    item.documentation = documentation;
                    return item;
                }
                return null;
            });
        }
        ;
        return null;
    };
    BowerJSONContribution.prototype.getInfo = function (pack) {
        var queryUrl = 'https://bower.herokuapp.com/packages/' + encodeURIComponent(pack);
        return this.xhr({
            url: queryUrl
        }).then(function (success) {
            try {
                var obj = JSON.parse(success.responseText);
                if (obj && obj.url) {
                    var url = obj.url;
                    if (url.indexOf('git://') === 0) {
                        url = url.substring(6);
                    }
                    if (url.lastIndexOf('.git') === url.length - 4) {
                        url = url.substring(0, url.length - 4);
                    }
                    return url;
                }
            }
            catch (e) {
            }
            return void 0;
        }, function (error) {
            return void 0;
        });
    };
    BowerJSONContribution.prototype.getInfoContribution = function (resource, location) {
        if ((location.matches(['dependencies', '*']) || location.matches(['devDependencies', '*']))) {
            var pack = location.path[location.path.length - 1];
            if (typeof pack === 'string') {
                return this.getInfo(pack).then(function (documentation) {
                    if (documentation) {
                        return [markedTextUtil_1.textToMarkedString(documentation)];
                    }
                    return null;
                });
            }
        }
        return null;
    };
    return BowerJSONContribution;
}());
exports.BowerJSONContribution = BowerJSONContribution;
//# sourceMappingURL=bowerJSONContribution.js.map