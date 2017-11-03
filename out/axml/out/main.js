(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vscode"));
	else if(typeof define === 'function' && define.amd)
		define(["vscode"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("vscode")) : factory(root["vscode"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function webpackUniversalModuleDefinition(root, factory) {
    if (true) module.exports = factory(__webpack_require__(1));else if (typeof define === 'function' && define.amd) define(["vscode"], factory);else {
        var a = typeof exports === 'object' ? factory(require("vscode")) : factory(root["vscode"]);
        for (var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
    }
})(undefined, function (__WEBPACK_EXTERNAL_MODULE_1__) {
    return (/******/function (modules) {
            // webpackBootstrap
            /******/ // The module cache
            /******/var installedModules = {};
            /******/
            /******/ // The require function
            /******/function __webpack_require__(moduleId) {
                /******/
                /******/ // Check if module is in cache
                /******/if (installedModules[moduleId]) {
                    /******/return installedModules[moduleId].exports;
                    /******/
                }
                /******/ // Create a new module (and put it into the cache)
                /******/var module = installedModules[moduleId] = {
                    /******/i: moduleId,
                    /******/l: false,
                    /******/exports: {}
                    /******/ };
                /******/
                /******/ // Execute the module function
                /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
                /******/
                /******/ // Flag the module as loaded
                /******/module.l = true;
                /******/
                /******/ // Return the exports of the module
                /******/return module.exports;
                /******/
            }
            /******/
            /******/
            /******/ // expose the modules object (__webpack_modules__)
            /******/__webpack_require__.m = modules;
            /******/
            /******/ // expose the module cache
            /******/__webpack_require__.c = installedModules;
            /******/
            /******/ // define getter function for harmony exports
            /******/__webpack_require__.d = function (exports, name, getter) {
                /******/if (!__webpack_require__.o(exports, name)) {
                    /******/Object.defineProperty(exports, name, {
                        /******/configurable: false,
                        /******/enumerable: true,
                        /******/get: getter
                        /******/ });
                    /******/
                }
                /******/
            };
            /******/
            /******/ // getDefaultExport function for compatibility with non-harmony modules
            /******/__webpack_require__.n = function (module) {
                /******/var getter = module && module.__esModule ?
                /******/function getDefault() {
                    return module['default'];
                } :
                /******/function getModuleExports() {
                    return module;
                };
                /******/__webpack_require__.d(getter, 'a', getter);
                /******/return getter;
                /******/
            };
            /******/
            /******/ // Object.prototype.hasOwnProperty.call
            /******/__webpack_require__.o = function (object, property) {
                return Object.prototype.hasOwnProperty.call(object, property);
            };
            /******/
            /******/ // __webpack_public_path__
            /******/__webpack_require__.p = "";
            /******/
            /******/ // Load entry module and return exports
            /******/return __webpack_require__(__webpack_require__.s = 0);
            /******/
        }(
        /************************************************************************/
        /******/[
        /* 0 */
        /***/function (module, exports, __webpack_require__) {

            "use strict";

            const { languages, SnippetString, Position, IndentAction, TextEdit } = __webpack_require__(1);
            const Formatter = __webpack_require__(2);
            const snippets = __webpack_require__(3);
            const completions = __webpack_require__(4);

            const EMPTY_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

            const completionsMap = new Map();
            function activate(context) {
                languages.setLanguageConfiguration('axml', {
                    comments: {
                        "blockComment": ["<!--", "-->"]
                    },
                    "brackets": [["<!--", "-->"], ["<", ">"], ["{", "}"], ["(", ")"]],
                    "autoClosingPairs": [{ "open": "{", "close": "}" }, { "open": "[", "close": "]" }, { "open": "(", "close": ")" }, { "open": "'", "close": "'" }, { "open": "\"", "close": "\"" }],
                    "surroundingPairs": [{ "open": "'", "close": "'" }, { "open": "\"", "close": "\"" }, { "open": "{", "close": "}" }, { "open": "[", "close": "]" }, { "open": "(", "close": ")" }, { "open": "<", "close": ">" }],
                    indentationRules: {
                        increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
                        decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
                    },
                    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
                    onEnterRules: [{
                        beforeText: new RegExp("<(?!(?:" + EMPTY_ELEMENTS.join('|') + "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
                        action: { indentAction: IndentAction.IndentOutdent }
                    }, {
                        beforeText: new RegExp("<(?!(?:" + EMPTY_ELEMENTS.join('|') + "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", 'i'),
                        action: { indentAction: IndentAction.Indent }
                    }]
                });

                completions.forEach(completion => {
                    completionsMap.set(completion.label, completion);
                });

                languages.registerCompletionItemProvider('axml', new CompletionsProvider(), '.', ':', '<', '"', '=', '/', '\s');
                languages.registerDocumentRangeFormattingEditProvider('axml', new AxmlFormatter());
            }

            const tagRex = /<[a-zA-Z\-\:\"\'\=\{\}\s]*\/?>?/;

            function getTagName(document, line) {
                try {
                    const text = document.lineAt(line).text;
                    const tagText = text.match(tagRex);
                    if (tagText) {
                        const tagName = tagText[0].split(' ')[0].substring(1);
                        return tagName;
                    }
                } catch (e) {}
                return '';
            }

            function getSnippets(document, position, tagFilter) {
                return Object.keys(snippets).map(key => {
                    const body = snippets[key].body;
                    return {
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        label: snippets[key].prefix,
                        insertText: new SnippetString(Array.isArray(body) ? body.join('\n') : body),
                        documentation: snippets[key].description,
                        document,
                        position
                    };
                }).filter(({ tag }) => tagFilter ? !tag : true);
            }

            class CompletionsProvider {
                provideCompletionItems(document, position, token) {
                    const tag = getTagName(document, position.line);

                    if (tag) {
                        return ((completionsMap.get(tag) || {}).attributes || []).map(item => Object.assign({}, item, { document, position })).concat(getSnippets(document, position, true));
                    } else {
                        return getSnippets(document, position, false);
                    }
                }
                resolveCompletionItem(item, token) {
                    const { document, position } = item;
                    const range = document.getWordRangeAtPosition(position);
                    const tag = getTagName(document, position.line);
                    if (tag && item.insertText.value.charAt(0) === '<') item.insertText.value = item.insertText.value.slice(1);
                    return item;
                }
            }

            class AxmlFormatter {
                provideDocumentFormattingEdits(document, options) {
                    let range = RangeUtil.getRangeForDocument(document);

                    return this._provideFormattingEdits(document, range, options);
                }

                provideDocumentRangeFormattingEdits(document, range, options) {
                    return this._provideFormattingEdits(document, range, options);
                }

                _provideFormattingEdits(document, range, options) {

                    let formatterOptions = {
                        preferSpaces: options.insertSpaces,
                        tabSize: options.tabSize
                    };

                    let formatter = new Formatter(formatterOptions);
                    let xml = formatter.format(document.getText(range));

                    return [TextEdit.replace(range, xml)];
                }
            }

            exports.activate = activate;
            module.exports['default'] = activate;

            /***/
        },
        /* 1 */
        /***/function (module, exports) {

            module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

            /***/
        },
        /* 2 */
        /***/function (module, exports, __webpack_require__) {

            "use strict";

            // Based on pretty-data (https://github.com/vkiryukhin/pretty-data)

            module.exports = class XmlFormatter {
                constructor(options) {
                    options = options || {};

                    if (typeof options.preferSpaces === "undefined") {
                        options.preferSpaces = false;
                    }

                    if (typeof options.splitNamespaces === "undefined") {
                        options.splitNamespaces = true;
                    }

                    options.tabSize = options.tabSize || 4;
                    options.newLine = options.newLine || "\n";

                    this.newLine = options.newLine || "\n";
                    this.indentPattern = options.preferSpaces ? " ".repeat(options.tabSize) : "\t";
                    this.splitNamespaces = options.splitNamespaces;
                }

                format(xml) {
                    xml = this.minify(xml, false);
                    xml = xml.replace(/</g, "~::~<");

                    if (this.splitNamespaces) {
                        xml = xml.replace(/xmlns\:/g, "~::~xmlns:").replace(/xmlns\=/g, "~::~xmlns=");
                    }

                    let parts = xml.split("~::~");
                    let inComment = false;
                    let level = 0;
                    let output = "";

                    for (let i = 0; i < parts.length; i++) {
                        // <!
                        if (parts[i].search(/<!/) > -1) {
                            output += this._getIndent(level, parts[i]);
                            inComment = true;

                            // end <!
                            if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1 || parts[i].search(/!DOCTYPE/) > -1) {
                                inComment = false;
                            }
                        }

                        // end <!
                        else if (parts[i].search(/-->/) > -1 || parts[i].search(/\]>/) > -1) {
                                output += parts[i];
                                inComment = false;
                            }

                            // <elm></elm>
                            else if (/^<(\w|:)/.test(parts[i - 1]) && /^<\/(\w|:)/.test(parts[i]) && /^<[\w:\-\.\,\/]+/.exec(parts[i - 1])[0] == /^<\/[\w:\-\.\,]+/.exec(parts[i])[0].replace("/", "")) {

                                    output += parts[i];
                                    if (!inComment) level--;
                                }

                                // <elm>
                                else if (parts[i].search(/<(\w|:)/) > -1 && parts[i].search(/<\//) == -1 && parts[i].search(/\/>/) == -1) {
                                        output = !inComment ? output += this._getIndent(level++, parts[i]) : output += parts[i];
                                    }

                                    // <elm>...</elm>
                                    else if (parts[i].search(/<(\w|:)/) > -1 && parts[i].search(/<\//) > -1) {
                                            output = !inComment ? output += this._getIndent(level, parts[i]) : output += parts[i];
                                        }

                                        // </elm>
                                        else if (parts[i].search(/<\//) > -1) {
                                                output = !inComment ? output += this._getIndent(--level, parts[i]) : output += parts[i];
                                            }

                                            // <elm />
                                            else if (parts[i].search(/\/>/) > -1 && (!this.splitNamespaces || parts[i].search(/xmlns(:|=)/) == -1)) {
                                                    output = !inComment ? output += this._getIndent(level, parts[i]) : output += parts[i];
                                                }

                                                // xmlns />
                                                else if (parts[i].search(/\/>/) > -1 && parts[i].search(/xmlns(:|=)/) > -1 && this.splitNamespaces) {
                                                        output = !inComment ? output += this._getIndent(level--, parts[i]) : output += parts[i];
                                                    }

                                                    // <?xml ... ?>
                                                    else if (parts[i].search(/<\?/) > -1) {
                                                            output += this._getIndent(level, parts[i]);
                                                        }

                                                        // xmlns
                                                        else if (this.splitNamespaces && (parts[i].search(/xmlns\:/) > -1 || parts[i].search(/xmlns\=/) > -1)) {
                                                                output += this._getIndent(level, parts[i]);
                                                            } else {
                                                                output += parts[i];
                                                            }
                    }

                    // remove leading newline
                    if (output[0] == this.newLine) {
                        output = output.slice(1);
                    } else if (output.substring(0, 1) == this.newLine) {
                        output = output.slice(2);
                    }

                    return output;
                }

                minify(xml, removeComments) {
                    if (typeof removeComments === "undefined") {
                        removeComments = false;
                    }

                    xml = this._stripLineBreaks(xml); // all line breaks outside of CDATA elements
                    xml = removeComments ? xml.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, "") : xml;
                    xml = xml.replace(/>\s{0,}</g, "><"); // insignificant whitespace between tags
                    xml = xml.replace(/"\s+(?=[^\s]+=)/g, "\" "); // spaces between attributes
                    xml = xml.replace(/"\s+(?=>)/g, "\""); // spaces between the last attribute and tag close (>)
                    xml = xml.replace(/"\s+(?=\/>)/g, "\" "); // spaces between the last attribute and tag close (/>)
                    xml = xml.replace(/[^ <>="]\s+[^ <>="]+=/g, match => {
                        // spaces between the node name and the first attribute
                        return match.replace(/\s+/g, " ");
                    });

                    return xml;
                }

                _getIndent(level, trailingValue) {
                    trailingValue = trailingValue || "";

                    return `${this.newLine}${this.indentPattern.repeat(level)}${trailingValue}`;
                }

                _stripLineBreaks(xml) {
                    let output = "";
                    let inTag = false;
                    let inTagName = false;
                    let inCdata = false;
                    let inAttribute = false;

                    for (let i = 0; i < xml.length; i++) {
                        let char = xml.charAt(i);
                        let prev = xml.charAt(i - 1);
                        let next = xml.charAt(i + 1);

                        if (char == "!" && (xml.substr(i, 8) == "![CDATA[" || xml.substr(i, 3) == "!--")) {
                            inCdata = true;
                        } else if (char == "]" && xml.substr(i, 3) == "]]>") {
                            inCdata = false;
                        } else if (char == "-" && xml.substr(i, 3) == "-->") {
                            inCdata = false;
                        } else if (char.search(/[\r\n]/g) > -1 && !inCdata) {
                            if (/\r/.test(char) && /\S|\r|\n/.test(prev) && /\S|\r|\n/.test(xml.charAt(i + this.newLine.length))) {
                                output += char;
                            } else if (/\n/.test(char) && /\S|\r|\n/.test(xml.charAt(i - this.newLine.length)) && /\S|\r|\n/.test(next)) {
                                output += char;
                            }

                            continue;
                        }

                        output += char;
                    }

                    return output;
                }
            };

            /***/
        },
        /* 3 */
        /***/function (module, exports) {

            module.exports = { "view": { "prefix": "view", "body": "<view>$2</view>$3", "description": "视图容器" }, "scroll-view": { "prefix": "scroll-view", "body": "<scroll-view>$3</scroll-view>$4", "description": "可滚动视图区域" }, "canvas": { "prefix": "canvas", "body": "<canvas id=\"{{${1:canvasId}}}\">$3</canvas>$4", "description": "画布" }, "swiper": { "prefix": "swiper", "body": ["<swiper indicator-dots=\"{{${1:indicatorDots}}}\" autoplay=\"{{${2:autoplay}}}\" interval=\"{{${3:interval}}}\" duration=\"{{${4:duration}}}\">", "\t<block a:for=\"{{${5:imgUrls}}}\">", "\t\t<swiper-item>", "\t\t\t<image src=\"{{${6:item}}}\" class=\"slide-image\" />", "\t\t</swiper-item>", "\t</block>", "</swiper>$7"], "description": "滑块视图容器" }, "icon": { "prefix": "icon", "body": "<icon type=\"$1\" size=\"$2\" color=\"$3\" />$4", "description": "图标" }, "text": { "prefix": "text", "body": "<text>$1</text>$2", "description": "文本" }, "textarea": { "prefix": "textarea", "body": "<textarea placeholder=\"${1:placeholder}\" />" }, "progress": { "prefix": "progress", "body": "<progress percent=\"$1\" color=\"$2\" stroke-width=\"${3:6}\" ${4:active} ${5:show-info} />$6", "description": "进度条" }, "button": { "prefix": "button", "body": "<button type=\"${1:default}\" size=\"${2:defaultSize}\" loading=\"${3:loading}\" plain=\"${4:plain}}\" disabled=\"${5:disabled}\" onTap=\"${6:defaultTap}\" hover-class=\"${6:other-button-hover}\"> Button </button>", "description": "按钮" }, "checkbox-group": { "prefix": "checkboxGroup", "body": ["<checkbox-group>", "\t<label a:for=\"{{${1:item}}}\">", "\t\t<checkbox value=\"${1:item}.${3:name}\" />{{${1:item}.${4:value}}}", "\t</label>", "</checkbox-group>$5"], "description": "多项选择器" }, "radio-group": { "prefix": "radioGroup", "body": ["<radio-group>", "\t<label class=\"$1\" a:for=\"{{${2:item}}}\">", "\t\t<radio value=\"${2:item}.${3:name}\" />{{${2:item}.${4:value}}}", "\t</label>", "</radio-group>$5"], "description": "多项选择器" }, "form": { "prefix": "form", "body": "<form onSubmit=\"$1\" onReset=\"$2\">$3</form>$4", "description": "表单" }, "input": { "prefix": "input", "body": "<input type=\"$1\" placeholder=\"$2\" ${3:auto-focus} ${4:password} />$5", "description": "自动聚焦的input" }, "picker-view": { "prefix": "picker-view", "body": "<picker-view>$1</picker-view>", "description": "嵌入页面的滚动选择器。" }, "picker-date": { "prefix": "pickerDate", "body": ["<picker>$3</picker>$4"], "description": "日期选择器" }, "slider": { "prefix": "slider", "body": "<slider min=\"$1\" max=\"$2\" step=\"$3\" />$4", "description": "滑动选择器" }, "switch": { "prefix": "switch", "body": "<switch checked=\"${1:false}\" />$2", "description": "开关选择器" }, "loading": { "prefix": "loading", "body": "<loading>$1</loading>$2", "description": "加载提示" }, "navigator": { "prefix": "navigator", "body": "<navigator url=\"$1\" ${2:redirect} hover-class=\"${3:className}\">$4</navigator>$5", "description": "导航" }, "audio": { "prefix": "audio", "body": "<audio src=\"$1\" ${2:controls} ${3:loop}></audio>$4", "description": "音频" }, "image": { "prefix": "image", "body": "<image src=\"$1\" mode=\"$2\" />$3", "description": "图片" }, "video": { "prefix": "video", "body": "<video src=\"$1\"></video>$2", "description": "视频" }, "map": { "prefix": "map", "body": "<map longitude=\"$1\" latitude=\"$2\"></map>$3", "description": "地图" }, "a:for": { "prefix": "afor", "body": "a:for=\"{{item in ${1:items}}}\"", "description": "列表渲染" }, "a:if": { "prefix": "aif", "body": "a:if=\"{{condition}}\"", "description": "条件渲染if" }, "a:elif": { "prefix": "aelif", "body": "a:elif=\"{{condition}}\"", "description": "条件渲染else if" }, "onTap": { "prefix": "onTap", "body": "onTap=\"${1:tapname}\"", "description": "绑定事件" }, "class": { "prefix": "class", "body": "class=\"${1:classname}\"", "description": "class" }, "hover": { "prefix": "hover-class", "body": "hover-class=\"${1:hoverclass}\"", "description": "hover" }

                /***/ };
        },
        /* 4 */
        /***/function (module, exports) {

            module.exports = [{ "documentation": "音频。", "label": "audio", "insertText": { "value": "<audio>$1</audio>" }, "attributes": [{ "label": "id", "type": "String", "default": "", "insertText": { "value": "id=\"$1\"" }, "documentation": "video 组件的唯一标识符" }, { "label": "src", "type": "String", "default": "", "insertText": { "value": "src=\"$1\"" }, "documentation": "要播放音频的资源地址" }, { "label": "loop", "type": "Boolean", "default": "false", "insertText": { "value": "loop=\"$1\"" }, "documentation": "是否循环播放" }, { "label": "controls", "type": "Boolean", "default": "true", "insertText": { "value": "controls=\"$1\"" }, "documentation": "是否显示默认控件" }, { "label": "poster", "type": "String", "default": "默认控件上的音频封面的图片资源地址，如果 controls 属性值为 false 则设置 poster 无效", "insertText": { "value": "poster=\"$1\"" }, "documentation": null }, { "label": "name", "type": "String", "default": "未知音频", "insertText": { "value": "name=\"$1\"" }, "documentation": "默认控件上的音频名字，如果 controls 属性值为 false 则设置 name 无效" }, { "label": "author", "type": "String", "default": "未知作者", "insertText": { "value": "author=\"$1\"" }, "documentation": "默认控件上的作者名字，如果 controls 属性值为 false 则设置 author 无效" }, { "label": "onError", "type": "EventHandle", "default": "", "insertText": { "value": "onError=\"$1\"" }, "documentation": "当发生错误时触发 error 事件，detail = {errMsg: MediaError.code}" }, { "label": "onPlay", "type": "EventHandle", "default": "", "insertText": { "value": "onPlay=\"$1\"" }, "documentation": "当开始/继续播放时触发play事件" }, { "label": "onPause", "type": "EventHandle", "default": "", "insertText": { "value": "onPause=\"$1\"" }, "documentation": "当暂停播放时触发 pause 事件" }, { "label": "onTimeUpdate", "type": "EventHandle", "default": "", "insertText": { "value": "onTimeUpdate=\"$1\"" }, "documentation": "当播放进度改变时触发 timeupdate 事件，detail = {currentTime, duration}" }, { "label": "onEnded", "type": "EventHandle", "default": "", "insertText": { "value": "onEnded=\"$1\"" }, "documentation": "当播放到末尾时触发 ended 事件" }] }, { "documentation": "按钮。", "label": "button", "insertText": { "value": "<button>$1</button>" }, "attributes": [{ "label": "size", "type": "String", "default": "default", "insertText": { "value": "size=\"$1\"" }, "documentation": "有效值 default, mini" }, { "label": "type", "type": "String", "default": "default", "insertText": { "value": "type=\"$1\"" }, "documentation": "按钮的样式类型，有效值 primary, default, warn" }, { "label": "plain", "type": "Boolean", "default": "false", "insertText": { "value": "plain=\"$1\"" }, "documentation": "按钮是否镂空，背景色透明" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }, { "label": "loading", "type": "Boolean", "default": "false", "insertText": { "value": "loading=\"$1\"" }, "documentation": "名称前是否带 loading 图标" }, { "label": "form-type", "type": "String", "default": "", "insertText": { "value": "form-type=\"$1\"" }, "documentation": "有效值：submit, reset，用于 " }, { "label": "hover-class", "type": "String", "default": "button-hover", "insertText": { "value": "hover-class=\"$1\"" }, "documentation": "指定按钮按下去的样式类。当 hover-class=\"none\" 时，没有点击态效果" }, { "label": "hover-start-time", "type": "Number", "default": "20", "insertText": { "value": "hover-start-time=\"$1\"" }, "documentation": "按住后多久出现点击态，单位毫秒" }, { "label": "hover-stay-time", "type": "Number", "default": "70", "insertText": { "value": "hover-stay-time=\"$1\"" }, "documentation": "手指松开后点击态保留时间，单位毫秒" }] }, { "documentation": "画布。", "label": "canvas", "insertText": { "value": "<canvas>$1</canvas>" }, "attributes": [{ "label": "id", "type": "String", "default": "", "insertText": { "value": "id=\"$1\"" }, "documentation": "canvas  组件的唯一标识符" }, { "label": "style", "type": "String", "default": "", "insertText": { "value": "style=\"$1\"" }, "documentation": null }, { "label": "class", "type": "String", "default": "", "insertText": { "value": "class=\"$1\"" }, "documentation": null }, { "label": "width", "type": "String", "default": "canvas width attribute", "insertText": { "value": "width=\"$1\"" }, "documentation": null }, { "label": "height", "type": "String", "default": "canvas height attribute", "insertText": { "value": "height=\"$1\"" }, "documentation": null }, { "label": "disable-scroll", "type": "Boolean", "default": "false", "insertText": { "value": "disable-scroll=\"$1\"" }, "documentation": "当在 canvas 中移动时，禁止屏幕滚动以及下拉刷新" }, { "label": "onTouchStart", "type": "EventHandle", "default": "", "insertText": { "value": "onTouchStart=\"$1\"" }, "documentation": "手指触摸动作开始" }, { "label": "onTouchMove", "type": "EventHandle", "default": "", "insertText": { "value": "onTouchMove=\"$1\"" }, "documentation": "手指触摸后移动" }, { "label": "onTouchEnd", "type": "EventHandle", "default": "", "insertText": { "value": "onTouchEnd=\"$1\"" }, "documentation": "手指触摸动作结束" }, { "label": "onTouchCancel", "type": "EventHandle", "default": "", "insertText": { "value": "onTouchCancel=\"$1\"" }, "documentation": "手指触摸动作被打断，如来电提醒，弹窗" }, { "label": "onLongTap", "type": "EventHandle", "default": "", "insertText": { "value": "onLongTap=\"$1\"" }, "documentation": "手指长按 500ms 之后触发，触发了长按事件后进行移动不会触发屏幕的滚动" }] }, { "documentation": "多项选择器，内部由多个checkbox组成", "label": "checkbox-group", "insertText": { "value": "<checkbox-group>$1</checkbox-group>" }, "attributes": [{ "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "<checkbox-group />中选中项发生改变时触发 change 事件，detail = {value: 选中的checkbox项value的值}" }] }, { "documentation": "多选项目", "label": "checkbox", "insertText": { "value": "<checkbox>$1</checkbox>" }, "attributes": [{ "label": "value", "type": "String", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": ["checkbox"] }, { "label": "checked", "type": "Boolean", "default": "false", "insertText": { "value": "checked=\"$1\"" }, "documentation": "当前是否选中，可用来设置默认选中" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "发生改变时触发 change 事件，detail = {value: 该 checkbox 是否 checked}" }] }, { "documentation": "表单，将组件内的用户输入的 ", "label": "form", "insertText": { "value": "<form>$1</form>" }, "attributes": [{ "label": "onSubmit", "type": "EventHandle", "default": "", "insertText": { "value": "onSubmit=\"$1\"" }, "documentation": "携带 form 中的数据触发 submit 事件，event.detail = {value : {'name': 'value'} , formId: ''}" }, { "label": "onReset", "type": "EventHandle", "default": "", "insertText": { "value": "onReset=\"$1\"" }, "documentation": "表单重置时会触发 reset 事件" }] }, { "documentation": "图标。", "label": "icon", "insertText": { "value": "<icon>$1</icon>" }, "attributes": [{ "label": "type", "type": "String", "default": "", "insertText": { "value": "type=\"$1\"" }, "documentation": "icon的类型，有效值：success, success_no_circle, info, warn, waiting, cancel, download, search, clear" }, { "label": "size", "type": "Number", "default": "23", "insertText": { "value": "size=\"$1\"" }, "documentation": "icon的大小，单位px" }, { "label": "color", "type": "Color", "default": "", "insertText": { "value": "color=\"$1\"" }, "documentation": "icon的颜色，同css的colo" }] }, { "documentation": "图片。", "label": "image", "insertText": { "value": "<image>$1</image>" }, "attributes": [{ "label": "src", "type": "String", "default": "", "insertText": { "value": "src=\"$1\"" }, "documentation": "图片资源地址" }, { "label": "mode", "type": "String", "default": "scaleToFill", "insertText": { "value": "mode=\"$1\"" }, "documentation": "图片裁剪、缩放的模式" }, { "label": "onError", "type": "HandleEvent", "default": "", "insertText": { "value": "onError=\"$1\"" }, "documentation": "当错误发生时，发布到 AppService 的事件名，事件对象event.detail = {errMsg: 'something wrong'}" }, { "label": "onLoad", "type": "HandleEvent", "default": "", "insertText": { "value": "onLoad=\"$1\"" }, "documentation": "当图片载入完毕时，发布到 AppService 的事件名，事件对象event.detail = {height:'图片高度px', width:'图片宽度px'}" }] }, { "documentation": "输入框。", "label": "input", "insertText": { "value": "<input>$1</input>" }, "attributes": [{ "label": "value", "type": "String", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": "输入框的初始内容" }, { "label": "type", "type": "String", "default": "text", "insertText": { "value": "type=\"$1\"" }, "documentation": "input 的类型，有效值：text, number, idcard, digit" }, { "label": "password", "type": "Boolean", "default": "false", "insertText": { "value": "password=\"$1\"" }, "documentation": "是否是密码类型" }, { "label": "placeholder", "type": "String", "default": "", "insertText": { "value": "placeholder=\"$1\"" }, "documentation": "输入框占位符" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }, { "label": "maxlength", "type": "Number", "default": "140", "insertText": { "value": "maxlength=\"$1\"" }, "documentation": "最大输入长度" }, { "label": "focus", "type": "Boolean", "default": "false", "insertText": { "value": "focus=\"$1\"" }, "documentation": "获取焦点" }, { "label": "onInput", "type": "EventHandle", "default": "", "insertText": { "value": "onInput=\"$1\"" }, "documentation": "当键盘输入时，触发input事件，event.detail = {value: value}" }, { "label": "onConfirm", "type": "EventHandle", "default": "", "insertText": { "value": "onConfirm=\"$1\"" }, "documentation": "当点击键盘完成时触发，event.detail = {value: value}" }, { "label": "onFocus", "type": "EventHandle", "default": "", "insertText": { "value": "onFocus=\"$1\"" }, "documentation": "输入框聚焦时触发，event.detail = {value: value}" }, { "label": "onBlur", "type": "EventHandle", "default": "", "insertText": { "value": "onBlur=\"$1\"" }, "documentation": "输入框失去焦点时触发，event.detail = {value: value}" }] }, { "documentation": "用来改进表单组件的可用性，使用for属性找到对应的id，或者将控件放在该标签下，当点击时，就会触发对应的控件。", "label": "label", "insertText": { "value": "<label>$1</label>" }, "attributes": [{ "label": "for", "type": "String", "default": "绑定控件的 id", "insertText": { "value": "for=\"$1\"" }, "documentation": null }] }, { "documentation": "地图。", "label": "map", "insertText": { "value": "<map>$1</map>" }, "attributes": [{ "label": "longitude", "type": "Number", "default": "", "insertText": { "value": "longitude=\"$1\"" }, "documentation": "中心经度" }, { "label": "latitude", "type": "Number", "default": "", "insertText": { "value": "latitude=\"$1\"" }, "documentation": "中心纬度" }, { "label": "scale", "type": "Number", "default": "16", "insertText": { "value": "scale=\"$1\"" }, "documentation": "缩放级别，取值范围为5-18" }, { "label": "markers", "type": "Array", "default": "", "insertText": { "value": "markers=\"$1\"" }, "documentation": "标记点" }, { "label": "polyline", "type": "Array", "default": "", "insertText": { "value": "polyline=\"$1\"" }, "documentation": "路线" }, { "label": "circles", "type": "Array", "default": "", "insertText": { "value": "circles=\"$1\"" }, "documentation": "圆" }, { "label": "controls", "type": "Array", "default": "", "insertText": { "value": "controls=\"$1\"" }, "documentation": "控件" }, { "label": "polygon", "type": "Array", "default": "", "insertText": { "value": "polygon=\"$1\"" }, "documentation": "多边形" }, { "label": "include-points", "type": "Array", "default": "", "insertText": { "value": "include-points=\"$1\"" }, "documentation": "缩放视野以包含所有给定的坐标点" }, { "label": "show-location", "type": "Boolean", "default": "", "insertText": { "value": "show-location=\"$1\"" }, "documentation": "显示带有方向的当前定位点" }, { "label": "onMarkerTap", "type": "EventHandle", "default": "", "insertText": { "value": "onMarkerTap=\"$1\"" }, "documentation": "点击标记点时触发" }, { "label": "onCalloutTap", "type": "EventHandle", "default": "", "insertText": { "value": "onCalloutTap=\"$1\"" }, "documentation": "点击标记点对应的气泡时触发" }, { "label": "onControlTap", "type": "EventHandle", "default": "", "insertText": { "value": "onControlTap=\"$1\"" }, "documentation": "点击控件时触发" }, { "label": "onRegionChange", "type": "EventHandle", "default": "", "insertText": { "value": "onRegionChange=\"$1\"" }, "documentation": "视野发生变化时触发，{type: \"begin\"/ \"end\", latitude，longitude， scale}" }, { "label": "onTap", "type": "EventHandle", "default": "", "insertText": { "value": "onTap=\"$1\"" }, "documentation": "点击地图时触发" }] }, { "documentation": "页面链接。", "label": "navigator", "insertText": { "value": "<navigator>$1</navigator>" }, "attributes": [{ "label": "hover-class", "type": "String", "default": "none", "insertText": { "value": "hover-class=\"$1\"" }, "documentation": "点击时附加的类" }, { "label": "hover-start-time", "type": "Number", "default": "", "insertText": { "value": "hover-start-time=\"$1\"" }, "documentation": "按住后多久出现点击态，单位毫秒" }, { "label": "hover-stay-time", "type": "Number", "default": "", "insertText": { "value": "hover-stay-time=\"$1\"" }, "documentation": "手指松开后点击态保留时间，单位毫秒" }, { "label": "url", "type": "String", "default": "", "insertText": { "value": "url=\"$1\"" }, "documentation": "应用内的跳转链接" }, { "label": "open-type", "type": "String", "default": "navigate", "insertText": { "value": "open-type=\"$1\"" }, "documentation": "跳转方式" }] }, { "documentation": "嵌入页面的滚动选择器。", "label": "picker-view", "insertText": { "value": "<picker-view>$1</picker-view>" }, "attributes": [{ "label": "value", "type": "Number Array", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": "数组中的数字依次表示 picker-view 内的 picker-view-column 选择的第几项（下标从 0 开始），数字大于 picker-view-column 可选项长度时，选择最后一项。" }, { "label": "indicatorStyle", "type": "String", "default": "", "insertText": { "value": "indicatorStyle=\"$1\"" }, "documentation": "设置选择器中间选中框的样式" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "当滚动选择，value 改变时触发 change 事件，event.detail = {value: value}；value为数组，表示 picker-view 内的 picker-view-column 当前选择的是第几项（下标从 0 开始）" }] }, { "documentation": "普通选择器：mode = selector", "label": "picker mode:selector", "insertText": { "value": "<picker mode=\"selector\">$1</picker>" }, "attributes": [{ "label": "range", "type": "Array / Object Array", "default": "[]", "insertText": { "value": "range=\"$1\"" }, "documentation": "mode为 selector 时，range 有效" }, { "label": "range-key", "type": "String", "default": "", "insertText": { "value": "range-key=\"$1\"" }, "documentation": "当 range 是一个 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容" }, { "label": "value", "type": "Number", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": "value 的值表示表示选择了 range 中的第几个（下标从 0 开始）。" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "value 改变时触发 change 事件，event.detail = {value: value}" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }] }, { "documentation": "时间选择器：mode = time", "label": "picker mode:time", "insertText": { "value": "<picker mode=\"time\">$1</picker>" }, "attributes": [{ "label": "value", "type": "String", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": "表示选中的时间，格式为\"hh:mm\"" }, { "label": "start", "type": "String", "default": "", "insertText": { "value": "start=\"$1\"" }, "documentation": "表示有效时间范围的开始，字符串格式为\"hh:mm\"" }, { "label": "end", "type": "String", "default": "", "insertText": { "value": "end=\"$1\"" }, "documentation": "表示有效时间范围的结束，字符串格式为\"hh:mm\"" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "value 改变时触发 change 事件，event.detail = {value: value}" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }] }, { "documentation": "日期选择器：mode = date", "label": "picker mode:date", "insertText": { "value": "<picker mode=\"date\">$1</picker>" }, "attributes": [{ "label": "value", "type": "String", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": "表示选中的日期，格式为\"YYYY-MM-DD\"" }, { "label": "start", "type": "String", "default": "", "insertText": { "value": "start=\"$1\"" }, "documentation": "表示有效日期范围的开始，字符串格式为\"YYYY-MM-DD\"" }, { "label": "end", "type": "String", "default": "", "insertText": { "value": "end=\"$1\"" }, "documentation": "表示有效日期范围的结束，字符串格式为\"YYYY-MM-DD\"" }, { "label": "fields", "type": "String", "default": "day", "insertText": { "value": "fields=\"$1\"" }, "documentation": "有效值 year,month,day，表示选择器的粒度" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "value 改变时触发 change 事件，event.detail = {value: value}" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }] }, { "documentation": "进度条。", "label": "progress", "insertText": { "value": "<progress>$1</progress>" }, "attributes": [{ "label": "percent", "type": "Float", "default": "", "insertText": { "value": "percent=\"$1\"" }, "documentation": "百分比0~100" }, { "label": "show-info", "type": "Boolean", "default": "false", "insertText": { "value": "show-info=\"$1\"" }, "documentation": "在进度条右侧显示百分比" }, { "label": "stroke-width", "type": "Number", "default": "6", "insertText": { "value": "stroke-width=\"$1\"" }, "documentation": "进度条线的宽度，单位px" }, { "label": "color", "type": "Color", "default": "#09BB07", "insertText": { "value": "color=\"$1\"" }, "documentation": "进度条颜色 （请使用 activeColor）" }, { "label": "activeColor", "type": "Color", "default": "#09BB07", "insertText": { "value": "activeColor=\"$1\"" }, "documentation": "已选择的进度条的颜色" }, { "label": "backgroundColor", "type": "Color", "default": "", "insertText": { "value": "backgroundColor=\"$1\"" }, "documentation": "未选择的进度条的颜色" }, { "label": "active", "type": "Boolean", "default": "false", "insertText": { "value": "active=\"$1\"" }, "documentation": "进度条从左往右的动画" }] }, { "documentation": "单项选择器，内部由多个", "label": "radio-group", "insertText": { "value": "<radio-group>$1</radio-group>" }, "attributes": [{ "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "<radio-group/> 中的选中项发生变化时触发 change 事件，event.detail = {value: 选中项radio的value}" }] }, { "documentation": "单选项目", "label": "radio", "insertText": { "value": "<radio>$1</radio>" }, "attributes": [{ "label": "value", "type": "String", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": ["radio"] }, { "label": "checked", "type": "Boolean", "default": "false", "insertText": { "value": "checked=\"$1\"" }, "documentation": "当前是否选中" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }] }, { "documentation": "可滚动视图区域。", "label": "scroll-view", "insertText": { "value": "<scroll-view>$1</scroll-view>" }, "attributes": [{ "label": "scroll-x", "type": "Boolean", "default": "false", "insertText": { "value": "scroll-x=\"$1\"" }, "documentation": "允许横向滚动" }, { "label": "scroll-y", "type": "Boolean", "default": "false", "insertText": { "value": "scroll-y=\"$1\"" }, "documentation": "允许纵向滚动" }, { "label": "upper-threshold", "type": "Number", "default": "50", "insertText": { "value": "upper-threshold=\"$1\"" }, "documentation": "距顶部/左边多远时（单位px），触发 scrolltoupper 事件" }, { "label": "lower-threshold", "type": "Number", "default": "50", "insertText": { "value": "lower-threshold=\"$1\"" }, "documentation": "距底部/右边多远时（单位px），触发 scrolltolower 事件" }, { "label": "scroll-top", "type": "Number", "default": "", "insertText": { "value": "scroll-top=\"$1\"" }, "documentation": "设置竖向滚动条位置" }, { "label": "scroll-left", "type": "Number", "default": "", "insertText": { "value": "scroll-left=\"$1\"" }, "documentation": "设置横向滚动条位置" }, { "label": "scroll-into-view", "type": "String", "default": "", "insertText": { "value": "scroll-into-view=\"$1\"" }, "documentation": "值应为某子元素id，则滚动到该元素，元素顶部对齐滚动区域顶部" }, { "label": "scroll-with-animation", "type": "Boolean", "default": "false", "insertText": { "value": "scroll-with-animation=\"$1\"" }, "documentation": "在设置滚动条位置时使用动画过渡" }, { "label": "onScrollToUpper", "type": "EventHandle", "default": "", "insertText": { "value": "onScrollToUpper=\"$1\"" }, "documentation": "滚动到顶部/左边，会触发 scrolltoupper 事件" }, { "label": "onScrollToLower", "type": "EventHandle", "default": "", "insertText": { "value": "onScrollToLower=\"$1\"" }, "documentation": "滚动到底部/右边，会触发 scrolltolower 事件" }, { "label": "onScroll", "type": "EventHandle", "default": "", "insertText": { "value": "onScroll=\"$1\"" }, "documentation": "滚动时触发，event.detail = {scrollLeft, scrollTop, scrollHeight, scrollWidth, deltaX, deltaY}" }] }, { "documentation": "滑动选择器", "label": "slider", "insertText": { "value": "<slider>$1</slider>" }, "attributes": [{ "label": "min", "type": "Number", "default": "0", "insertText": { "value": "min=\"$1\"" }, "documentation": "最小值" }, { "label": "max", "type": "Number", "default": "100", "insertText": { "value": "max=\"$1\"" }, "documentation": "最大值" }, { "label": "step", "type": "Number", "default": "1", "insertText": { "value": "step=\"$1\"" }, "documentation": "步长，取值必须大于 0，并且可被(max - min)整除" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }, { "label": "value", "type": "Number", "default": "0", "insertText": { "value": "value=\"$1\"" }, "documentation": "当前取值" }, { "label": "show-value", "type": "Boolean", "default": "false", "insertText": { "value": "show-value=\"$1\"" }, "documentation": "是否显示当前 value" }, { "label": "activeColor", "type": "String", "default": "", "insertText": { "value": "activeColor=\"$1\"" }, "documentation": "已选择的颜色" }, { "label": "backgroundColor", "type": "String", "default": "", "insertText": { "value": "backgroundColor=\"$1\"" }, "documentation": "背景条的颜色" }, { "label": "trackSize", "type": "Number", "default": "", "insertText": { "value": "trackSize=\"$1\"" }, "documentation": "轨道线条高度" }, { "label": "handleSize", "type": "Number", "default": "", "insertText": { "value": "handleSize=\"$1\"" }, "documentation": "滑块大小" }, { "label": "handleColor", "type": "String", "default": "", "insertText": { "value": "handleColor=\"$1\"" }, "documentation": "滑块填充色" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "完成一次拖动后触发的事件，event.detail = {value: value}" }] }, { "documentation": "滑块视图容器。", "label": "swiper", "insertText": { "value": "<swiper>$1</swiper>" }, "attributes": [{ "label": "indicator-dots", "type": "Boolean", "default": "false", "insertText": { "value": "indicator-dots=\"$1\"" }, "documentation": "是否显示面板指示点" }, { "label": "indicator-color", "type": "Color", "default": "rgba(0, 0, 0, .3)", "insertText": { "value": "indicator-color=\"$1\"" }, "documentation": "指示点颜色" }, { "label": "indicator-active-color", "type": "Color", "default": "#000", "insertText": { "value": "indicator-active-color=\"$1\"" }, "documentation": "当前选中的指示点颜色" }, { "label": "autoplay", "type": "Boolean", "default": "false", "insertText": { "value": "autoplay=\"$1\"" }, "documentation": "是否自动切换" }, { "label": "current", "type": "Number", "default": "0", "insertText": { "value": "current=\"$1\"" }, "documentation": "当前所在页面的 index" }, { "label": "duration", "type": "Number", "default": "500", "insertText": { "value": "duration=\"$1\"" }, "documentation": "滑动动画时长" }, { "label": "interval", "type": "Number", "default": "5000", "insertText": { "value": "interval=\"$1\"" }, "documentation": "自动切换时间间隔" }, { "label": "circular", "type": "Boolean", "default": "false", "insertText": { "value": "circular=\"$1\"" }, "documentation": "是否采用衔接滑动" }, { "label": "onChange", "type": "Function", "default": "否", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "current 改变时会触发 change 事件，event.detail = {current: current}" }] }, { "documentation": "单选项目", "label": "switch", "insertText": { "value": "<switch>$1</switch>" }, "attributes": [{ "label": "checked", "type": "Boolean", "default": "", "insertText": { "value": "checked=\"$1\"" }, "documentation": "是否选中" }, { "label": "disabled", "type": "Boolean", "default": "", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }, { "label": "color", "type": "String", "default": "", "insertText": { "value": "color=\"$1\"" }, "documentation": "switch 的颜色，同 css 的 color" }, { "label": "onChange", "type": "EventHandle", "default": "", "insertText": { "value": "onChange=\"$1\"" }, "documentation": "checked 改变时触发 change 事件，event.detail={ value:checked}" }] }, { "documentation": "文本。", "label": "text", "insertText": { "value": "<text>$1</text>" }, "attributes": [{ "label": "selectable", "type": "Boolean", "default": "false", "insertText": { "value": "selectable=\"$1\"" }, "documentation": "文本是否可选" }] }, { "documentation": "输入框。", "label": "textarea", "insertText": { "value": "<textarea>$1</textarea>" }, "attributes": [{ "label": "value", "type": "String", "default": "", "insertText": { "value": "value=\"$1\"" }, "documentation": "输入框的初始内容" }, { "label": "placeholder", "type": "String", "default": "", "insertText": { "value": "placeholder=\"$1\"" }, "documentation": "输入框占位符" }, { "label": "disabled", "type": "Boolean", "default": "false", "insertText": { "value": "disabled=\"$1\"" }, "documentation": "是否禁用" }, { "label": "maxlength", "type": "Number", "default": "140", "insertText": { "value": "maxlength=\"$1\"" }, "documentation": "最大输入长度" }, { "label": "focus", "type": "Boolean", "default": "false", "insertText": { "value": "focus=\"$1\"" }, "documentation": "获取焦点" }, { "label": "auto-height", "type": "Boolean", "default": "false", "insertText": { "value": "auto-height=\"$1\"" }, "documentation": "是否自动增高" }, { "label": "onInput", "type": "EventHandle", "default": "", "insertText": { "value": "onInput=\"$1\"" }, "documentation": "当键盘输入时，触发input事件，event.detail = {value: value}，处理函数可以直接 return 一个字符串，将替换输入框的内容。" }, { "label": "onFocus", "type": "EventHandle", "default": "", "insertText": { "value": "onFocus=\"$1\"" }, "documentation": "输入框聚焦时触发，event.detail = {value: value}" }, { "label": "onBlur", "type": "EventHandle", "default": "", "insertText": { "value": "onBlur=\"$1\"" }, "documentation": "输入框失去焦点时触发，event.detail = {value: value}" }, { "label": "onConfirm", "type": "EventHandle", "default": "", "insertText": { "value": "onConfirm=\"$1\"" }, "documentation": "点击完成时， 触发 confirm 事件，event.detail = {value: value}" }] }, { "documentation": "视频。", "label": "video", "insertText": { "value": "<video>$1</video>" }, "attributes": [{ "label": "src", "type": "String", "default": "", "insertText": { "value": "src=\"$1\"" }, "documentation": "要播放视频的资源地址" }, { "label": "controls", "type": "Boolean", "default": "true", "insertText": { "value": "controls=\"$1\"" }, "documentation": "是否显示默认播放控件（播放/暂停按钮、播放进度、时间）" }, { "label": "autoplay", "type": "Boolean", "default": "false", "insertText": { "value": "autoplay=\"$1\"" }, "documentation": "是否自动播放" }, { "label": "duration", "type": "Number", "default": "", "insertText": { "value": "duration=\"$1\"" }, "documentation": "指定视频时长，到点会暂停播放" }, { "label": "onPlay", "type": "EventHandle", "default": "", "insertText": { "value": "onPlay=\"$1\"" }, "documentation": "当开始/继续播放时触发play事件" }, { "label": "onPause", "type": "EventHandle", "default": "", "insertText": { "value": "onPause=\"$1\"" }, "documentation": "当暂停播放时触发 pause 事件" }, { "label": "onEnded", "type": "EventHandle", "default": "", "insertText": { "value": "onEnded=\"$1\"" }, "documentation": "当播放到末尾时触发 ended 事件" }, { "label": "onTimeUpdate", "type": "EventHandle", "default": "", "insertText": { "value": "onTimeUpdate=\"$1\"" }, "documentation": "播放进度变化时触发，event.detail = {currentTime: '当前播放时间'} 。触发频率应该在 250ms 一次" }, { "label": "objectFit", "type": "String", "default": "contain", "insertText": { "value": "objectFit=\"$1\"" }, "documentation": "当视频大小与 video 容器大小不一致时，视频的表现形式。contain：包含，fill：填充，cover：覆盖video标签认宽度300px、高度225px，设置宽高需要通过abridgess设置width和height。" }, { "label": "poster", "type": "String", "default": "contain", "insertText": { "value": "poster=\"$1\"" }, "documentation": "默认控件上的封面的图片资源地址" }] }, { "documentation": "视图容器。相当于 web 的 div 或者 react-native 的 View。", "label": "view", "insertText": { "value": "<view>$1</view>" }, "attributes": [{ "label": "hover-class", "type": "String", "default": "none", "insertText": { "value": "hover-class=\"$1\"" }, "documentation": "点击时附加的类" }, { "label": "hover-start-time", "type": "Number", "default": "", "insertText": { "value": "hover-start-time=\"$1\"" }, "documentation": "按住后多久出现点击态，单位毫秒" }, { "label": "hover-stay-time", "type": "Number", "default": "", "insertText": { "value": "hover-stay-time=\"$1\"" }, "documentation": "手指松开后点击态保留时间，单位毫秒" }, { "label": "hidden", "type": "boolean", "default": "false", "insertText": { "value": "hidden=\"$1\"" }, "documentation": "是否隐藏" }] }];

            /***/
        }]
        /******/)
    );
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ })
/******/ ]);
});