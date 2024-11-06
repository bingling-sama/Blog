'use strict';

var obsidian = require('obsidian');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var commands$3 = {
	"Format Document": "Dokument formatieren"
};
var editorMenu$3 = {
	"Format Document": "Dokument formatieren"
};
var noticeMessages$3 = {
	"Document Formatted!": "",
	"Document is already formatted!": "",
	"No open document is found.": "",
	"You can only format in editing mode.": "",
	"Please enter a valid number.\nIt must be at least 0.": "",
	"Please enter a valid number.\nIt must be a whole number.": ""
};
var optionWarnings$3 = {
	"Gap value must be a whole number and it needs to be at least 0.": ""
};
var placeholders$3 = {
	"(Default)": ""
};
var optionSections$3 = {
	"Heading gaps": "",
	"Other gaps": "",
	"Format options": "",
	"Other options": ""
};
var headingGaps$3 = {
	"Before top-level headings": "",
	"Decides the gap before a top-level heading.": "",
	"Before the first sub-level heading": "",
	"Decides the child heading gap right after a parent heading.": "",
	"Before sub-level headings": "",
	"Decides gaps before headings that are not top-level.": ""
};
var otherGaps$3 = {
	"After properties": "",
	"Decides the gap after a property section.": "",
	"Before contents": "",
	"Decides gaps before content sections. (ex: Text before headings)": "",
	"Before contents after code blocks": "",
	"Decides gaps before \"contents that are after code blocks.\"": "",
	"Before code blocks": "",
	"Decides gaps before code blocks.": "",
	"Before code blocks after headings": "",
	"Decides gaps before \"code blocks that are after headings.\"": ""
};
var formatOptions$3 = {
	"Newline at the end of a document": "",
	"Inserts a newline at the end of a document.": ""
};
var otherOptions$3 = {
	"Notify when no change is needed": "",
	"Displays a different message when no change is needed.": "",
	"More detailed error message": "",
	"Displays additional information when parsing fails.": ""
};
var wasm$4 = {
	parsing: {
		"Failed to parse the document. [Line: {LINE_NUMBER}]": "",
		"Failed to parse the document.": ""
	},
	formatting: {
		"Failed to read options. Some of them are possibly not positive number values.": ""
	}
};
var de = {
	commands: commands$3,
	editorMenu: editorMenu$3,
	noticeMessages: noticeMessages$3,
	optionWarnings: optionWarnings$3,
	placeholders: placeholders$3,
	optionSections: optionSections$3,
	headingGaps: headingGaps$3,
	otherGaps: otherGaps$3,
	formatOptions: formatOptions$3,
	otherOptions: otherOptions$3,
	wasm: wasm$4
};

var commands$2 = {
	"Format Document": "Format Document"
};
var editorMenu$2 = {
	"Format Document": "Format Document"
};
var noticeMessages$2 = {
	"Document Formatted!": "Document Formatted!",
	"Document is already formatted!": "Document is already formatted!",
	"No open document is found.": "No open document is found.",
	"You can only format in editing mode.": "You can only format in editing mode.",
	"Please enter a valid number.\nIt must be at least 0.": "Please enter a valid number.\nIt must be at least 0.",
	"Please enter a valid number.\nIt must be a whole number.": "Please enter a valid number.\nIt must be a whole number."
};
var optionWarnings$2 = {
	"Gap value must be a whole number and it needs to be at least 0.": "Gap value must be a whole number and it needs to be at least 0."
};
var placeholders$2 = {
	"(Default)": "(Default)"
};
var optionSections$2 = {
	"Heading gaps": "Heading gaps",
	"Other gaps": "Other gaps",
	"Format options": "Format options",
	"Other options": "Other options"
};
var headingGaps$2 = {
	"Before top-level headings": "Before top-level headings",
	"Decides the gap before a top-level heading.": "Decides the gap before a top-level heading.",
	"Before the first sub-level heading": "Before the first sub-level heading",
	"Decides the child heading gap right after a parent heading.": "Decides the child heading gap right after a parent heading.",
	"Before sub-level headings": "Before sub-level headings",
	"Decides gaps before headings that are not top-level.": "Decides gaps before headings that are not top-level."
};
var otherGaps$2 = {
	"After properties": "After properties",
	"Decides the gap after a property section.": "Decides the gap after a property section.",
	"Before contents": "Before contents",
	"Decides gaps before content sections. (ex: Text before headings)": "Decides gaps before content sections. (ex: Text before headings)",
	"Before contents after code blocks": "Before contents after code blocks",
	"Decides gaps before \"contents that are after code blocks.\"": "Decides gaps before \"contents that are after code blocks.\"",
	"Before code blocks": "Before code blocks",
	"Decides gaps before code blocks.": "Decides gaps before code blocks.",
	"Before code blocks after headings": "Before code blocks after headings",
	"Decides gaps before \"code blocks that are after headings.\"": "Decides gaps before \"code blocks that are after headings.\""
};
var formatOptions$2 = {
	"Newline at the end of a document": "Newline at the end of a document",
	"Inserts a newline at the end of a document.": "Inserts a newline at the end of a document."
};
var otherOptions$2 = {
	"Notify when no change is needed": "Notify when no change is needed",
	"Displays a different message when no change is needed.": "Displays a different message when no change is needed.",
	"More detailed error message": "More detailed error message",
	"Displays additional information when parsing fails.": "Displays additional information when parsing fails."
};
var wasm$3 = {
	parsing: {
		"Failed to parse the document. [Line: {LINE_NUMBER}]": "Failed to parse the document. [Line: {LINE_NUMBER}]",
		"Failed to parse the document.": "Failed to parse the document."
	},
	formatting: {
		"Failed to read options. Some of them are possibly not positive number values.": "Failed to read options. Some of them are possibly not positive number values."
	}
};
var en = {
	commands: commands$2,
	editorMenu: editorMenu$2,
	noticeMessages: noticeMessages$2,
	optionWarnings: optionWarnings$2,
	placeholders: placeholders$2,
	optionSections: optionSections$2,
	headingGaps: headingGaps$2,
	otherGaps: otherGaps$2,
	formatOptions: formatOptions$2,
	otherOptions: otherOptions$2,
	wasm: wasm$3
};

var commands$1 = {
	"Format Document": "Dokumentum formázása"
};
var editorMenu$1 = {
	"Format Document": "Dokumentum formázása"
};
var noticeMessages$1 = {
	"Document Formatted!": "A dokumentum meg lett formázva!",
	"Document is already formatted!": "A dokumentum már meg van formázva!",
	"No open document is found.": "Nem található megnyitott dokumentum.",
	"You can only format in editing mode.": "A formázás csakis a szerkesztői módban lehetséges. ",
	"Please enter a valid number.\nIt must be at least 0.": "Kérlek egy megfelelő számot írjál be.\nLegalább 0 legyen.",
	"Please enter a valid number.\nIt must be a whole number.": "Kérlek egy megfelelő számot írjál be.\nEgész szám legyen."
};
var optionWarnings$1 = {
	"Gap value must be a whole number and it needs to be at least 0.": ""
};
var placeholders$1 = {
	"(Default)": "(Alapértelmezett)"
};
var optionSections$1 = {
	"Heading gaps": "Fejléc hézagok",
	"Other gaps": "Egyéb hézagok",
	"Format options": "Formázási opciók",
	"Other options": "Egyéb opciók"
};
var headingGaps$1 = {
	"Before top-level headings": "",
	"Decides the gap before a top-level heading.": "",
	"Before the first sub-level heading": "",
	"Decides the child heading gap right after a parent heading.": "",
	"Before sub-level headings": "",
	"Decides gaps before headings that are not top-level.": ""
};
var otherGaps$1 = {
	"After properties": "Tulajdonságok után",
	"Decides the gap after a property section.": "Meghatározza a hézagot a tulajdonságok szekció után.",
	"Before contents": "Tartalmak előtt",
	"Decides gaps before content sections. (ex: Text before headings)": "",
	"Before contents after code blocks": "Tartalmak előtti kód részek",
	"Decides gaps before \"contents that are after code blocks.\"": "Meghatározza azon tartalmi hézagokat, melyek kód részek előtt vannak.",
	"Before code blocks": "Kód részek előtt",
	"Decides gaps before code blocks.": "Meghatározza a hézagot kód részek előtt.",
	"Before code blocks after headings": "Kód részek előtt, a címsorok előtt",
	"Decides gaps before \"code blocks that are after headings.\"": "Meghatározza azon kód részi hézagokat, melyek címsorok után vannak."
};
var formatOptions$1 = {
	"Newline at the end of a document": "Új sor a dokumentum végére.",
	"Inserts a newline at the end of a document.": "Beszúr egy új sort a dokumentum végére."
};
var otherOptions$1 = {
	"Notify when no change is needed": "Értesítsen, hogyha nem szükséges változás",
	"Displays a different message when no change is needed.": "Eltérő üzenetet mutat, hogyha nem történt változás",
	"More detailed error message": "Mutasson részletesebb hiba üzeneteket",
	"Displays additional information when parsing fails.": "Plusz információt mutat, amikor az átírás közben hiba történik."
};
var wasm$2 = {
	parsing: {
		"Failed to parse the document. [Line: {LINE_NUMBER}]": "",
		"Failed to parse the document.": ""
	},
	formatting: {
		"Failed to read options. Some of them are possibly not positive number values.": ""
	}
};
var hu = {
	commands: commands$1,
	editorMenu: editorMenu$1,
	noticeMessages: noticeMessages$1,
	optionWarnings: optionWarnings$1,
	placeholders: placeholders$1,
	optionSections: optionSections$1,
	headingGaps: headingGaps$1,
	otherGaps: otherGaps$1,
	formatOptions: formatOptions$1,
	otherOptions: otherOptions$1,
	wasm: wasm$2
};

var commands = {
	"Format Document": "문서 포맷하기"
};
var editorMenu = {
	"Format Document": "문서 포맷하기"
};
var noticeMessages = {
	"Document Formatted!": "포맷 완료!",
	"Document is already formatted!": "문서가 이미 포맷돼 있습니다.",
	"No open document is found.": "열려 있는 문서를 찾지 못했습니다.",
	"You can only format in editing mode.": "편집 모드에서만 포맷할 수 있습니다.",
	"Please enter a valid number.\nIt must be at least 0.": "유효한 숫자를 입력해주세요.\n0 이상만 입력할 수 있습니다.",
	"Please enter a valid number.\nIt must be a whole number.": "유효한 숫자를 입력해주세요.\n자연수만 입력할 수 있습니다."
};
var optionWarnings = {
	"Gap value must be a whole number and it needs to be at least 0.": "여백 옵션의 값은 반드시 자연수이고 0 이상이어야 합니다."
};
var placeholders = {
	"(Default)": "(기본값)"
};
var optionSections = {
	"Heading gaps": "제목 여백",
	"Other gaps": "기타 여백",
	"Format options": "포맷 옵션",
	"Other options": "기타 옵션"
};
var headingGaps = {
	"Before top-level headings": "최상위 제목 앞",
	"Decides the gap before a top-level heading.": "최상위 제목들의 앞 여백을 결정합니다.",
	"Before the first sub-level heading": "첫 번째 하위 제목 앞",
	"Decides the child heading gap right after a parent heading.": "부모 제목 바로 뒤 자식 제목의 여백을 결정합니다.",
	"Before sub-level headings": "하위 제목 앞",
	"Decides gaps before headings that are not top-level.": "최상위 제목이 아닌 제목들의 앞 여백을 결정합니다."
};
var otherGaps = {
	"After properties": "속성 영역 뒤",
	"Decides the gap after a property section.": "속성 영역 뒤 여백을 결정합니다.",
	"Before contents": "내용 영역 앞",
	"Decides gaps before content sections. (ex: Text before headings)": "내용 영역의 앞 여백을 결정합니다. (예: 제목 앞 텍스트)",
	"Before contents after code blocks": "코드 블럭 뒤 내용 영역 앞",
	"Decides gaps before \"contents that are after code blocks.\"": "\"코드 블럭 뒤 내용 영역\"의 앞 여백을 결정합니다.",
	"Before code blocks": "코드 블럭 앞",
	"Decides gaps before code blocks.": "코드 블럭의 앞 여백을 결정합니다.",
	"Before code blocks after headings": "제목 뒤 코드 블럭 앞",
	"Decides gaps before \"code blocks that are after headings.\"": "\"제목 뒤 코드 블럭\"의 앞 여백을 결정합니다."
};
var formatOptions = {
	"Newline at the end of a document": "문서 끝 새 줄",
	"Inserts a newline at the end of a document.": "문서 끝에 새 줄을 추가합니다."
};
var otherOptions = {
	"Notify when no change is needed": "변경사항이 없을 때 알려주기",
	"Displays a different message when no change is needed.": "변경할 사항이 없으면 다른 메세지를 표시합니다.",
	"More detailed error message": "더 상세한 에러 메세지",
	"Displays additional information when parsing fails.": "문서를 읽지 못했을 때 추가 정보를 표시합니다."
};
var wasm$1 = {
	parsing: {
		"Failed to parse the document. [Line: {LINE_NUMBER}]": "문서를 읽지 못했습니다. [줄: {LINE_NUMBER}]",
		"Failed to parse the document.": "문서를 읽지 못했습니다."
	},
	formatting: {
		"Failed to read options. Some of them are possibly not positive number values.": "설정을 읽지 못했습니다. 양수가 아닌 값이 있을수도 있습니다."
	}
};
var ko = {
	commands: commands,
	editorMenu: editorMenu,
	noticeMessages: noticeMessages,
	optionWarnings: optionWarnings,
	placeholders: placeholders,
	optionSections: optionSections,
	headingGaps: headingGaps,
	otherGaps: otherGaps,
	formatOptions: formatOptions,
	otherOptions: otherOptions,
	wasm: wasm$1
};

const detectedLanguage = window.localStorage.getItem("language");
const LOCALE_CATEGORY = {
    COMMANDS: "commands",
    EDITOR_MENU: "editorMenu",
    NOTICE_MESSAGES: "noticeMessages",
    OPTION_WARNINGS: "optionWarnings",
    PLACEHOLDERS: "placeholders",
    OPTION_SECTIONS: "optionSections",
    HEADING_GAPS: "headingGaps",
    OTHER_GAPS: "otherGaps",
    FORMAT_OPTIONS: "formatOptions",
    OTHER_OPTIONS: "otherOptions",
};
const locales = {
    en: en,
    de: de,
    hu: hu,
    ko: ko,
};
/** @example getLocale(LOCALE_CATEGORY.COMMANDS, "Format Document") */
const getLocale = (category, key) => {
    var _a;
    const usingLocale = (_a = locales[detectedLanguage]) !== null && _a !== void 0 ? _a : locales.en;
    const message = usingLocale[category][key];
    if (message === "") {
        const usingLocale = locales.en;
        return usingLocale[category][key];
    }
    return usingLocale[category][key];
};
/** Returns the "wasm" object in the locale file. */
const getWasmLocale = () => {
    var _a;
    const usingLocale = (_a = locales[detectedLanguage]) !== null && _a !== void 0 ? _a : locales.en;
    return usingLocale.wasm;
};

class FormattoCommands {
    constructor(plugin) {
        this.plugin = plugin;
    }
    registerCommands() {
        this.getCommandsArr().forEach((item) => {
            this.plugin.addCommand(item);
        });
    }
    getCommandsArr() {
        return [
            {
                id: "formatto-logo",
                name: getLocale(LOCALE_CATEGORY.COMMANDS, "Format Document"),
                icon: "formatto-logo",
                editorCallback: (editor) => {
                    this.plugin.utils.formatDocument(editor);
                },
            },
        ];
    }
}

class FormattoEditorMenu {
    constructor(plugin) {
        this.plugin = plugin;
    }
    registerEditorMenus() {
        this.getEventsArr().forEach((item) => {
            this.plugin.registerEvent(item);
        });
    }
    getEventsArr() {
        return [
            this.plugin.app.workspace.on("editor-menu", (menu, editor) => {
                menu.addItem((item) => item
                    .setTitle(getLocale(LOCALE_CATEGORY.EDITOR_MENU, "Format Document"))
                    .setIcon("formatto-logo")
                    .onClick(() => {
                    this.plugin.utils.formatDocument(editor);
                }));
            }),
        ];
    }
}

var formattoLogo = "<svg class=\"formatto__custom-icons\" viewBox=\"0 0 16 16\" xmlns=\"http://www.w3.org/2000/svg\">\n<rect x=\"2\" y=\"2\" width=\"6.65444\" height=\"3.02\" rx=\"0.5\" />\n<rect x=\"2\" y=\"6.31047\" width=\"12.0693\" height=\"3.44838\" rx=\"0.5\" />\n<rect x=\"10.621\" y=\"2\" width=\"3.44838\" height=\"6.03466\" rx=\"0.5\" />\n<rect x=\"2.03467\" y=\"11\" width=\"6.98996\" height=\"3.01966\" rx=\"0.5\" />\n</svg>";

class FormattoIcons {
    constructor() {
        this.icons = [{ iconId: "formatto-logo", svg: formattoLogo }];
        this.registerIcons = () => {
            this.icons.forEach(({ iconId, svg }) => {
                obsidian.addIcon(iconId, svg);
            });
        };
    }
}

class FormattoRibbonIcons {
    constructor(plugin) {
        this.registerRibbonIcons = () => {
            this.plugin.addRibbonIcon("formatto-logo", "Format Document", () => {
                var _a;
                const editor = (_a = this.plugin.app.workspace.activeEditor) === null || _a === void 0 ? void 0 : _a.editor;
                const activeView = this.plugin.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                if (!editor) {
                    new obsidian.Notice(getLocale(LOCALE_CATEGORY.NOTICE_MESSAGES, "No open document is found."));
                    return;
                }
                if (activeView.getMode() !== "source") {
                    new obsidian.Notice(getLocale(LOCALE_CATEGORY.NOTICE_MESSAGES, "You can only format in editing mode."));
                    return;
                }
                this.plugin.utils.formatDocument(editor);
            });
        };
        this.plugin = plugin;
    }
}

let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); }
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
/**
* This function will be called from the TypeScript side.
* @param {string} input
* @param {any} js_options
* @param {any} js_locales
* @returns {string}
*/
function format_document(input, js_options, js_locales) {
    let deferred2_0;
    let deferred2_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.format_document(retptr, ptr0, len0, addHeapObject(js_options), addHeapObject(js_locales));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        deferred2_0 = r0;
        deferred2_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_error_706641c7c47bf457 = function(arg0, arg1) {
        console.error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg_String_b9412f8799faab3e = function(arg0, arg1) {
        const ret = String(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getwithrefkey_edc2c8960f0f1191 = function(arg0, arg1) {
        const ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_61dfc3198373c902 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_buffer_b7b08af79b0b0974 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_ea1883e1e5e86686 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_d1e79e2388520f18 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_8339fcf5d8ecd12e = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_247a91427532499e = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;



    return wasm;
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined' && Object.getPrototypeOf(module_or_path) === Object.prototype)
    ({module_or_path} = module_or_path);
    else
    console.warn('using deprecated parameters for the initialization function; pass a single object instead');

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('formatto_wasm_bg.wasm', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('main.js', document.baseURI).href)));
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

/*
  Type Declarations
*/
/*
  Fallback Option Values
*/
const FALLBACK_HEADING_GAPS = {
    beforeTopLevelHeadings: "3",
    beforeFirstSubHeading: "1",
    beforeSubHeadings: "2",
};
const FALLBACK_OTHER_GAPS = {
    afterProperties: "2",
    beforeContents: "0",
    beforeContentsAfterCodeBlocks: "1",
    beforeCodeBlocks: "1",
    beforeCodeBlocksAfterHeadings: "0",
};
const FALLBACK_FORMAT_OPTIONS = {
    insertNewline: true,
};
const FALLBACK_OTHER_OPTIONS = {
    notifyWhenUnchanged: true,
    showMoreDetailedErrorMessages: false,
};
const FALLBACK_OPTIONS = {
    headingGaps: FALLBACK_HEADING_GAPS,
    otherGaps: FALLBACK_OTHER_GAPS,
    formatOptions: FALLBACK_FORMAT_OPTIONS,
    otherOptions: FALLBACK_OTHER_OPTIONS,
};
/*
  Default Option Values
*/
const EMPTY_HEADING_GAPS = {
    beforeTopLevelHeadings: "",
    beforeFirstSubHeading: "",
    beforeSubHeadings: "",
};
const EMPTY_OTHER_GAPS = {
    afterProperties: "",
    beforeContents: "",
    beforeContentsAfterCodeBlocks: "",
    beforeCodeBlocks: "",
    beforeCodeBlocksAfterHeadings: "",
};
const DEFAULT_OPTIONS = {
    headingGaps: EMPTY_HEADING_GAPS,
    otherGaps: EMPTY_OTHER_GAPS,
    formatOptions: FALLBACK_FORMAT_OPTIONS,
    otherOptions: FALLBACK_OTHER_OPTIONS,
};

class FormattoUtils {
    constructor(plugin) {
        this.plugin = plugin;
    }
    formatDocument(editor) {
        const copiedOptions = JSON.parse(JSON.stringify(this.plugin.settings));
        this.handleEmptyOptions(copiedOptions);
        this.cursorPosition = editor.getCursor();
        this.originalDocument = editor.getValue();
        try {
            this.formattedDocument = format_document(this.originalDocument, copiedOptions, JSON.stringify(getWasmLocale()));
            this.displayMessage();
        }
        catch (error) {
            new obsidian.Notice(error);
        }
        if (!this.formattedDocument)
            return;
        if (this.formattedDocument !== this.originalDocument) {
            editor.setValue(this.formattedDocument);
            editor.setSelection(this.cursorPosition, this.cursorPosition);
        }
        this.clearVariables();
    }
    displayMessage() {
        if (this.plugin.settings.otherOptions.notifyWhenUnchanged &&
            this.formattedDocument === this.originalDocument) {
            new obsidian.Notice(getLocale(LOCALE_CATEGORY.NOTICE_MESSAGES, "Document is already formatted!"));
        }
        else {
            new obsidian.Notice(getLocale(LOCALE_CATEGORY.NOTICE_MESSAGES, "Document Formatted!"));
        }
    }
    handleEmptyOptions(copiedOptions) {
        for (const sectionKey of Object.keys(copiedOptions)) {
            for (const optionKey of Object.keys(copiedOptions[sectionKey])) {
                if (copiedOptions[sectionKey][optionKey] === "") {
                    copiedOptions[sectionKey][optionKey] =
                        FALLBACK_OPTIONS[sectionKey][optionKey];
                }
            }
        }
    }
    clearVariables() {
        this.cursorPosition = undefined;
        this.originalDocument = undefined;
        this.formattedDocument = undefined;
    }
}

class FormattoOptionTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.noticeMessages = {
            invalidNumberMessage: getLocale(LOCALE_CATEGORY.NOTICE_MESSAGES, "Please enter a valid number.\nIt must be at least 0."),
            notWholeNumberMessage: getLocale(LOCALE_CATEGORY.NOTICE_MESSAGES, "Please enter a valid number.\nIt must be a whole number."),
        };
        this.plugin = plugin;
    }
    checkDecimal(value) {
        return value !== "0" && value !== "1" && parseFloat(value) % 1 !== 0;
    }
    putDefaultIndicator(value) {
        return `${value} ${getLocale(LOCALE_CATEGORY.PLACEHOLDERS, "(Default)")}`;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        const debounceMsg = obsidian.debounce((value) => {
            if (value !== "") {
                // Check if the value is a valid number
                if (isNaN(parseInt(value)) || parseInt(value) < 0) {
                    new obsidian.Notice(this.noticeMessages.invalidNumberMessage);
                    return;
                }
                // Check if the value is a whole number
                if (this.checkDecimal(value)) {
                    new obsidian.Notice(this.noticeMessages.notWholeNumberMessage);
                    return;
                }
            }
        }, 1000, true);
        containerEl.createDiv({}, (div) => {
            div.innerHTML = `<div style="color: var(--text-accent)">
                ${getLocale(LOCALE_CATEGORY.OPTION_WARNINGS, "Gap value must be a whole number and it needs to be at least 0.")}
            </div>`;
            div.className = "setting-item setting-item-description";
        });
        // Heading Gaps
        containerEl.createEl("h2", {
            text: getLocale(LOCALE_CATEGORY.OPTION_SECTIONS, "Heading gaps"),
        });
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.HEADING_GAPS, "Before top-level headings"))
            .setDesc(getLocale(LOCALE_CATEGORY.HEADING_GAPS, "Decides the gap before a top-level heading."))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.headingGaps.beforeTopLevelHeadings))
            .setValue(this.plugin.settings.headingGaps.beforeTopLevelHeadings)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.headingGaps.beforeTopLevelHeadings =
                value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.HEADING_GAPS, "Before the first sub-level heading"))
            .setDesc(getLocale(LOCALE_CATEGORY.HEADING_GAPS, "Decides the child heading gap right after a parent heading."))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.headingGaps.beforeFirstSubHeading))
            .setValue(this.plugin.settings.headingGaps.beforeFirstSubHeading)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.headingGaps.beforeFirstSubHeading =
                value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.HEADING_GAPS, "Before sub-level headings"))
            .setDesc(getLocale(LOCALE_CATEGORY.HEADING_GAPS, "Decides gaps before headings that are not top-level."))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.headingGaps.beforeSubHeadings))
            .setValue(this.plugin.settings.headingGaps.beforeSubHeadings)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.headingGaps.beforeSubHeadings =
                value;
            yield this.plugin.saveOptions();
        })));
        // Other Gaps
        containerEl.createEl("h2", {
            text: getLocale(LOCALE_CATEGORY.OPTION_SECTIONS, "Other gaps"),
        });
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "After properties"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Decides the gap after a property section."))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.otherGaps.afterProperties))
            .setValue(this.plugin.settings.otherGaps.afterProperties)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.otherGaps.afterProperties = value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Before contents"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Decides gaps before content sections. (ex: Text before headings)"))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.otherGaps.beforeContents))
            .setValue(this.plugin.settings.otherGaps.beforeContents)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.otherGaps.beforeContents = value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Before contents after code blocks"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_GAPS, 'Decides gaps before "contents that are after code blocks."' // eslint-disable-line
        ))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.otherGaps
            .beforeContentsAfterCodeBlocks))
            .setValue(this.plugin.settings.otherGaps
            .beforeContentsAfterCodeBlocks)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.otherGaps.beforeContentsAfterCodeBlocks =
                value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Before code blocks"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Decides gaps before code blocks."))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.otherGaps.beforeCodeBlocks))
            .setValue(this.plugin.settings.otherGaps.beforeCodeBlocks)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.otherGaps.beforeCodeBlocks = value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_GAPS, "Before code blocks after headings"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_GAPS, 'Decides gaps before "code blocks that are after headings."'))
            .addText((text) => text
            .setPlaceholder(this.putDefaultIndicator(FALLBACK_OPTIONS.otherGaps
            .beforeCodeBlocksAfterHeadings))
            .setValue(this.plugin.settings.otherGaps
            .beforeCodeBlocksAfterHeadings)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            debounceMsg(value);
            this.plugin.settings.otherGaps.beforeCodeBlocksAfterHeadings =
                value;
            yield this.plugin.saveOptions();
        })));
        // Format Options
        containerEl.createEl("h2", {
            text: getLocale(LOCALE_CATEGORY.OPTION_SECTIONS, "Format options"),
        });
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.FORMAT_OPTIONS, "Newline at the end of a document"))
            .setDesc(getLocale(LOCALE_CATEGORY.FORMAT_OPTIONS, "Inserts a newline at the end of a document."))
            .addToggle((text) => text
            .setValue(this.plugin.settings.formatOptions.insertNewline)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.formatOptions.insertNewline =
                value;
            yield this.plugin.saveOptions();
        })));
        // Other Options
        containerEl.createEl("h2", {
            text: getLocale(LOCALE_CATEGORY.OPTION_SECTIONS, "Other options"),
        });
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_OPTIONS, "Notify when no change is needed"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_OPTIONS, "Displays a different message when no change is needed."))
            .addToggle((text) => text
            .setValue(this.plugin.settings.otherOptions.notifyWhenUnchanged)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.otherOptions.notifyWhenUnchanged =
                value;
            yield this.plugin.saveOptions();
        })));
        new obsidian.Setting(containerEl)
            .setName(getLocale(LOCALE_CATEGORY.OTHER_OPTIONS, "More detailed error message"))
            .setDesc(getLocale(LOCALE_CATEGORY.OTHER_OPTIONS, "Displays additional information when parsing fails."))
            .addToggle((text) => text
            .setValue(this.plugin.settings.otherOptions
            .showMoreDetailedErrorMessages)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.otherOptions.showMoreDetailedErrorMessages =
                value;
            yield this.plugin.saveOptions();
        })));
    }
}

function _loadWasmModule (sync, filepath, src, imports) {
  function _instantiateOrCompile(source, imports, stream) {
    var instantiateFunc = stream ? WebAssembly.instantiateStreaming : WebAssembly.instantiate;
    var compileFunc = stream ? WebAssembly.compileStreaming : WebAssembly.compile;

    if (imports) {
      return instantiateFunc(source, imports)
    } else {
      return compileFunc(source)
    }
  }

  
var buf = null;
var isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

if (isNode) {
  
buf = Buffer.from(src, 'base64');

} else {
  
var raw = globalThis.atob(src);
var rawLength = raw.length;
buf = new Uint8Array(new ArrayBuffer(rawLength));
for(var i = 0; i < rawLength; i++) {
   buf[i] = raw.charCodeAt(i);
}

}


  {
    return _instantiateOrCompile(buf, imports, false)
  }
}

function formatto_wasm(imports){return _loadWasmModule(0, null, 'AGFzbQEAAAABwAEaYAJ/fwF/YAJ/fwBgA39/fwF/YAN/f38AYAF/AGABfwF/YAR/f39/AGAFf39/f38AYAR/f39/AX9gAAF/YAV/f39+fwBgBn9/f39/fwBgBX9/f39/AX9gBn9/f39/fwF/YAd/f39/f39/AGAJf39/f39/fn5+AGAHf39/f39/fwF/YAN+f38Bf2AEf39/fgBgAABgBX9/fn9/AGAEf35/fwBgBX9/fH9/AGAEf3x/fwBgBX9/fX9/AGAEf31/fwAC7QUXA3diZxpfX3diaW5kZ2VuX29iamVjdF9kcm9wX3JlZgAEA3diZxdfX3diaW5kZ2VuX2lzX3VuZGVmaW5lZAAFA3diZw1fX3diaW5kZ2VuX2luAAADd2JnFl9fd2JpbmRnZW5fYm9vbGVhbl9nZXQABQN3YmcVX193YmluZGdlbl9zdHJpbmdfZ2V0AAEDd2JnFF9fd2JpbmRnZW5faXNfb2JqZWN0AAUDd2JnHF9fd2JnX2Vycm9yXzcwNjY0MWM3YzQ3YmY0NTcAAQN3YmcbX193YmluZGdlbl9vYmplY3RfY2xvbmVfcmVmAAUDd2JnGV9fd2JpbmRnZW5fanN2YWxfbG9vc2VfZXEAAAN3YmcVX193YmluZGdlbl9udW1iZXJfZ2V0AAEDd2JnHV9fd2JnX1N0cmluZ19iOTQxMmY4Nzk5ZmFhYjNlAAEDd2JnFF9fd2JpbmRnZW5fZXJyb3JfbmV3AAADd2JnFV9fd2JpbmRnZW5fc3RyaW5nX25ldwAAA3diZyRfX3diZ19nZXR3aXRocmVma2V5X2VkYzJjODk2MGYwZjExOTEAAAN3YmctX193YmdfaW5zdGFuY2VvZl9BcnJheUJ1ZmZlcl82MWRmYzMxOTgzNzNjOTAyAAUDd2JnHV9fd2JnX2J1ZmZlcl9iN2IwOGFmNzliMGIwOTc0AAUDd2JnGl9fd2JnX25ld19lYTE4ODNlMWU1ZTg2Njg2AAUDd2JnGl9fd2JnX3NldF9kMWU3OWUyMzg4NTIwZjE4AAMDd2JnHV9fd2JnX2xlbmd0aF84MzM5ZmNmNWQ4ZWNkMTJlAAUDd2JnLF9fd2JnX2luc3RhbmNlb2ZfVWludDhBcnJheV8yNDdhOTE0Mjc1MzI0OTllAAUDd2JnF19fd2JpbmRnZW5fZGVidWdf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aiACQZgBaikDADcCACAGQQhqIAJBkAFqKQMANwIAIAJBQGsgCykCADcDACACQcgAaiAJKQIANwMAIAJB0ABqIAJBuAFqKAIANgIAIAIgAikCoAE3AzggAiAHNgJUIAIgED4CWCACIBBCIIg+AlwgAkHwAGogBUEQaikCADcDACACQegAaiAFQQhqKQIANwMAIAIgBSkCADcDYCACQaABaiACQRRqIAJB1ABqIAJB4ABqEFcgAi0AoAFBBkYNASACQaABahCLAQwBCwsgAkGrAWogAkEcaigCADYAACAEQQU6AAAgAiACKQIUNwCjASAEIAIpAKABNwABIARBCGogAkGnAWopAAA3AAAMAgsgBCACKAKkATYCBCAEQQY6AAAgBUUNACAQpyAFQQEQ5AELIAJBFGoQeAsgAkHAAWokACABIAEtABhBAWo6ABgjAEEwayIFJAACfyABKAIUIgIgASgCECIESQRAIAFBDGohByABKAIMIQkDQAJAAkACQAJAIAIgCWotAAAiBkEMTQRAIAZBCWtBAkkNBAwBCyAGQR9NBEAgBkENRw0BDAQLIAZBIEYNAyAGQf0ARg0BIAZBLEYNAgsgBUEWNgIkIAVBCGogByAEIAJBAWoiAiACIARLGxA0IAVBJGogBSgCCCAFKAIMEJEBDAULIAEgAkEBajYCFEEADAQLIAVBFTYCJCAFQRhqIAcgBCACQQFqIgIgAiAESxsQNCAFQSRqIAUoAhggBSgCHBCRAQwDCyABIAJBAWoiAjYCFCACIARHDQALIAQhAgsgBUEDNgIkIAVBEGogAUEMaiAEIAJBAWoiAiACIARLGxA0IAVBJGogBSgCECAFKAIUEJEBCyECIAVBMGokACADIAI2AnAgAy0AWEEGRwRAIAJFBEAgA0EwaiADQegAaikDADcDACADQShqIANB4ABqKQMANwMAIAMgAykDWDcDIAwHCyADQQY6ACAgAyACNgIkIANB2ABqEIsBDAYLIAMgAygCXDYCJCADQQY6ACAgAkUNBSADQfAAahB2DAULIANByABqIAFBARAvIAMpA0hCA1ENAiADQSBqIANByABqEG8gAy0AIEEGRwRAIAAgAykDIDcDACAAQRBqIANBMGopAwA3AwAgAEEIaiADQShqKQMANwMADAkLIAMoAiQgARCMASEBIABBBjoAACAAIAE2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Rw0BQYyWwQAgADYCACACIAIoAgRBfnE2AgQgASAAQQFyNgIEIAIgADYCAA8LIAEgAxA/CwJAAkAgAigCBCIDQQJxRQRAIAJBmJbBACgCAEYNAiACQZSWwQAoAgBGDQUgAiADQXhxIgIQPyABIAAgAmoiAEEBcjYCBCAAIAFqIAA2AgAgAUGUlsEAKAIARw0BQYyWwQAgADYCAA8LIAIgA0F+cTYCBCABIABBAXI2AgQgACABaiAANgIACyAAQYACSQ0CIAEgABBIQQAhAUGslsEAQayWwQAoAgBBAWsiADYCACAADQFB9JPBACgCACIABEADQCABQQFqIQEgACgCCCIADQALC0GslsEAQf8fIAEgAUH/H00bNgIADwtBmJbBACABNgIAQZCWwQBBkJbBACgCACAAaiIANgIAIAEgAEEBcjYCBEGUlsEAKAIAIAFGBEBBjJbBAEEANgIAQZSWwQBBADYCAAsgAEGklsEAKAIAIgNNDQBBmJbBACgCACICRQ0AQQAhAQJAQZCWwQAoAgAiBEEpSQ0AQeyTwQAhAANAIAIgACgCACIFTwRAIAUgACgCBGogAksNAgsgACgCCCIADQALC0H0k8EAKAIAIgAEQANAIAFBAWohASAAKAIIIgANAAsLQayWwQBB/x8gASABQf8fTRs2AgAgAyAETw0AQaSWwQBBfzYCAAsPCyAAQXhxQfyTwQBqIQICf0GElsEAKAIAIgNBASAAQQN2dCIAcUUEQEGElsEAIAAgA3I2AgAgAgwBCyACKAIICyEAIAIgATYCCCAAIAE2AgwgASACNgIMIAEgADYCCA8LQZSWwQAgATYCAEGMlsEAQYyWwQAoAgAgAGoiADYCACABIABBAXI2AgQgACABaiAANgIAC/sFAgF/AXwjAEEwayICJAACfwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCAALQAAQQFrDhEBAgMEBQYHCAkKCwwNDg8QEQALIAIgAC0AAToACCACQQI2AhQgAkGgw8AANgIQIAJCATcCHCACQT02AiwgAiACQShqNgIYIAIgAkEIajYCKCABKAIUIAEoAhggAkEQahAlDBELIAIgACkDCDcDCCACQQI2AhQgAkG8w8AANgIQIAJCATcCHCACQT42AiwgAiACQShqNgIYIAIgAkEIajYCKCABKAIUIAEoAhggAkEQahAlDBALIAIgACkDCDcDCCACQQI2AhQgAkG8w8AANgIQIAJCATcCHCACQT82AiwgAiACQShqNgIYIAIgAkEIajYCKCABKAIUIAEoAhggAkEQahAlDA8LIAArAwghAyACQQI2AhQgAkHcw8AANgIQIAJCATcCHCACQcAANgIMIAIgAzkDKCACIAJBCGo2AhggAiACQShqNgIIIAEoAhQgASgCGCACQRBqECUMDgsgAiAAKAIENgIIIAJBAjYCFCACQfjDwAA2AhAgAkIBNwIcIAJBwQA2AiwgAiACQShqNgIYIAIgAkEIajYCKCABKAIUIAEoAhggAkEQahAlDA0LIAIgACkCBDcCCCACQQE2AhQgAkGQxMAANgIQIAJCATcCHCACQcIANgIsIAIgAkEoajYCGCACIAJBCGo2AiggASgCFCABKAIYIAJBEGoQJQwMCyABQZjEwABBChDMAQwLCyABQaLEwABBChDMAQwKCyABQazEwABBDBDMAQwJCyABQbjEwABBDhDMAQwICyABQcbEwABBCBDMAQwHCyABQc7EwABBAxDMAQwGCyABQdHEwABBBBDMAQwFCyABQdXEwABBDBDMAQwECyABQeHEwABBDxDMAQwDCyABQfDEwABBDRDMAQwCCyABQf3EwABBDhDMAQwBCyABIAAoAgQgACgCCBDMAQsgAkEwaiQAC/oEAQd/IwBBQGoiAiQAAkAgASgCACIFKAIUIgMgBSgCECIESQRAIAVBDGohByAFKAIMIQgDQAJAAkACQAJAAkACQAJAAkAgAyAIai0AACIGQQxNBEAgBkEJa0ECSQ0IDAELIAZBH00EQCAGQQ1HDQEMCAsgBkEgRg0HIAZBLEYNASAGQd0ARg0ECyABLQAEDQEgAkEHNgIoIAJBCGogByAEIANBAWoiASABIARLGxA0IAJBKGogAigCCCACKAIMEJEBIQEgAEEHOgAAIAAgATYCBAwJCyABLQAEDQAgBSADQQFqIgM2AhQgAyAESQRAA0AgAyAIai0AACIGQQlrIgFBF0tBASABdEGTgIAEcUVyDQMgBSADQQFqIgM2AhQgAyAERw0ACyAEIQMLIAJBBTYCKCACQSBqIAcgBCADQQFqIgEgASAESxsQNCACQShqIAIoAiAgAigCJBCRASEDDAQLIAFBADoABAsg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AUHgAGogAUEIakEoEIECGiABKAI4IQggASgCPCEFIAMoAogCIgQNAAsLIAFBCGogAUHgAGpBKBCBAhogASAFNgI8IAEgCDYCOCABIAI2AjQgASADNgIwIBEoAgAiAygCACIERQ0CIAMoAgQhBhCwASICIAQ2ApgDIAJBADsBkgMgAkEANgKIAiADIAZBAWoiBjYCBCADIAI2AgAgBEEAOwGQAyAEIAI2AogCIAEgBjYCjAEgASACNgKIASABQQhqIQYgAUEYaiEDAkACQCAFIAFBiAFqIgIoAgRBAWtGBEAgAigCACICLwGSAyIEQQtPDQEgAiAEQQFqIgU7AZIDIAIgBEEMbGoiB0GUAmogBkEIaigCADYCACAHQYwCaiAGKQIANwIAIAIgBEEYbGoiBCADKQMANwMAIARBCGogA0EIaikDADcDACAEQRBqIANBEGopAwA3AwAgAiAFQQJ0akGYA2ogCDYCACAIIAU7AZADIAggAjYCiAIMAgtBq7/AAEEwQdy/wAAQmwEAC0GwvsAAQSBB7L/AABCbAQALCyAQIA42AgggECASNgIEIBAgDzYCAAsgAUGQAWokAAwBC0GgvsAAEOYBAAsgCygCDCIBIAEoAghBAWo2AgggCSgCFCAJKAIcQRhsahoLIAlBMGokACAAQQY6AAAMAQsgCigCCCAKKAIQQRhsaiIBKQMAIRMgASADKQMANwMAIAAgEzcDACABQQhqIgIpAwAhEyACIANBCGopAwA3AwAgAEEIaiATNwMAIAFBEGoiASkDACETIAEgA0EQaikDADcDACAAQRBqIBM3AwALIApBQGskAAvXAQEEfwJAIAAgARBVBEBBASEDIAAgARAsDQEgACABaiEFA0AgACAFRg0CAn8gACwAACIBQQBOBEAgAUH/AXEhASAAQQFqDAELIAAtAAFBP3EhAiABQR9xIQQgAUFfTQRAIARBBnQgAnIhASAAQQJqDAELIAAtAAJBP3EgAkEGdHIhAiABQXBJBEAgAiAEQQx0ciEBIABBA2oMAQsgBEESdEGAgPAAcSAALQADQT9xIAJBBnRyciIBQYCAxABGDQMgAEEEagshACABQSNGDQALC0EAIQMLIAML9gECAn8CfiMAQRBrIgQkAAJAAkACQAJAAkACQCABKAIUIgUgASgCEEkEQCABKAIMIAVqLQAAIgVB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AzoAAAwCCyAAQgA3AwggAEECOgAAIAAgASkDCDcDEAwBCyAAQQI6AAAgACABKQMIIgU3AxAgACAFQj+INwMICyACQSBqJAALkgEBBH8jAEEQayICJABBASEEAkAgASgCFCIDQScgASgCGCIFKAIQIgERAAANACACQQRqIAAoAgBBgQIQHwJAIAItAARBgAFGBEAgAyACKAIIIAERAABFDQEMAgsgAyACLQAOIgAgAkEEamogAi0ADyAAayAFKAIMEQIADQELIANBJyABEQAAIQQLIAJBEGokACAEC48BAgN/AX4jAEEgayICJAAgASgCAEGAgICAeEYEQCABKAIMIQMgAkEcaiIEQQA2AgAgAkKAgICAEDcCFCACQRRqQYjIwAAgAxAlGiACQRBqIAQoAgAiAzYCACACIAIpAhQiBTcDCCABQQhqIAM2AgAgASAFNwIACyAAQfjQwAA2AgQgACABNgIAIAJBIGokAAuIAQECfyAAKAIIIgIEQCAAKAIEQQRqIQADQAJAAkACQAJAIABBBGstAAAOBQMDAwECAAsgABB4DAILIAAoAgAiAUUNASAAQQRqKAIAIAFBARDkAQwBCyAAEHIgACgCACIBRQ0AIABBBGooAgAgAUEYbEEIEOQBCyAAQRhqIQAgAkEBayICDQALCwtrAQF/IAACfyABRQRAIABCgICAgBA3AgRBAAwBCyABQQBIBEAgAEEANgIEQQEMAQtBmZLBAC0AABogAUEBENMBIgIEQCAAIAI2AgggACABNgIEQQAMAQsgACABNgIIIABBATYCBEEBCzYCAAu5AgEDfyMAQRBrIgMkACADIAE2AgACQCADENUBRQRAIANBBGohBCMAQTBrIgIkACACIAE2AhwgAkEQaiABEAQCQAJAIAIoAhAiAUUNACACQQhqIAEgAigCFBDUASACQSBqIAIoAgggAigCDBDHASACKAIgQYCAgIB4Rg0AIAQgAikCIDcCACAEQQhqIAJBKGooAgA2AgAMAQsgAkEcaiACQS9qQeiDwAAQJiEBIARBgICAgHg2AgAgBCABNgIECyACKAIcIgFBhAFPBEAgARAACyACQTBqJAAgAygCBEGAgICAeEcEQCAAIAMpAgQ3AgAgAEEIaiADQQxqKAIANgIADAILIAAgAygCCDYCBCAAQYGAgIB4NgIADAELIABBgICA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NgIMIANB+PfAADYCCCADQgI3AhQgA0KAgICAsAYiBCADQQRqrYQ3AyggAyAEIAOthDcDICADIANBIGo2AhAgA0EIaiACEKABAAtnACMAQTBrIgAkAEGYksEALQAABEAgAEECNgIMIABBlNDAADYCCCAAQgE3AhQgACABNgIsIAAgAEEsaq1CgICAgLAGhDcDICAAIABBIGo2AhAgAEEIakG80MAAEKABAAsgAEEwaiQAC2cBA38gASgCBCEEAkAgASgCCCIBRQRAQQEhAgwBCyABQQBOBEBBmZLBAC0AABpBASEDIAFBARDTASICDQELIAMgARDIAQALIAIgBCABEIECIQIgACABNgIIIAAgAjYCBCAAIAE2AgALWAECfyAAKAIMIgIgACgCBCIBRwRAIAIgAWtBBHYhAiABQQRqIQEDQCABEMQBIAFBEGohASACQQFrIgINAAsLIAAoAggiAQRAIAAoAgAgAUEEdEEEEOQBCwuZAQEGfwJAIAEoAgAiBxASIgNFBEBBASEEDAELIANBAE4EQEGZksEALQAAGkEBIQIgA0EBENMBIgQNAQsgAiADEMgBAAsQFiIFEA8iBhAQIQIgBkGEAU8EQCAGEAALIAIgASgCACAEEBEgAkGEAU8EQCACEAALIAVBhAFPBEAgBRAACyAAIAcQEjYCCCAAIAQ2AgQgACADNgIAC1oBAn8jAEEQayIDJAAgA0EEaiACEHMgAygCCCEEIAMoAgQEQCAEIAMoAgwQyAEACyADKAIMIAEgAhCBAiEBIAAgAjYCCCAAIAE2AgQgACAENgIAIANBEGokAAtcAQF/IwBBMGsiAiQAIAIgATYCDCACIAA2AgggAkECNgIUIAJBjI/AADYCECACQgE3AhwgAkEBNgIsIAIgAkEoajYCGCACIAJBCGo2AiggAkEQahBgIAJBMGokAAtcAQF/IwBBMGsiAiQAIAIgATYCDCACIAA2AgggAkECNgIUIAJBsI/AADYCECACQgE3AhwgAkEBNgIsIAIgAkEoajYCGCACIAJBCGo2AiggAkEQahBgIAJBMGokAAtbAQF/IwBBMGsiAyQAIAMgATYCDCADIAA2AgggA0EBNgIUIANBlPHAADYCECADQgE3AhwgAyADQQhqrUKAgICA8AyENwMoIAMgA0EoajYCGCADQRBqIAIQoAEAC6MBAQR/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ISUCQAJAIClQBEBBAyAlQoCAgICAgID4/wBRDQMaICVQRQ0BQQQMAwsgJVANAQtCgICAgICAgCAgJ0IBhiAnQoCAgICAgIAIUSIAGyEnQgJCASAAGyElQct3Qcx3IAAbIAtqIQsgKFAMAQsgC0GzCGshC0IBISUgKFALIQAgAyALOwF4IAMgJTcDcCADQgE3A2ggAyAnNwNgIAMgADoAegJ/AkACQAJAIABBAmsiAQRAQQEhAEHj7sAAQeTuwAAgJkIAUyIEG0Hj7sAAQQEgBBsgAhshCyAmQj+IpyACciEbQQMgAUH/AXEiASABQQNPG0ECaw4CAwIBCyADQQM2AiggA0Hl7sAANgIkIANBAjsBIEEBIQtBASEAIANBIGoMAwsgA0EDNgIoIANB6O7AADYCJCADQQI7ASAgA0EgagwCCyADQSBqIQUgA0EPaiEMIwBBMGsiBCQAAkACQAJ/AkACQAJAAkACQAJAAkACQCADQeAAaiIAKQMAIiVQRQRAIAApAwgiJ1ANASAAKQMQIiZQDQIgJSAmfCImICVUDQMgJSAnVA0EICZCgICAgICAgIAgWg0FIAQgAC8BGCIAOwEIIAQgJSAnfSInNwMAIAAgAEEgayAAICZCgICAgBBUIgEbIgJBEGsgAiAmQiCGICYgARsiJkKAgICAgIDAAFQiARsiAkEIayACICZCEIYgJiABGyImQoCAgICAgICAAVQiARsiAkEEayACICZCCIYgJiABGyImQoCAgICAgICAEFQiARsiAkECayACICZCBIYgJiABGyImQoCAgICAgICAwABUIgEbICZCAoYgJiABGyIsQgBZIgJrIgFrwSIKQQBIDQYgBCAnIAqtIiaGIiggJogiKTcDECAnIClSDQogBCAAOwEIIAQgJTcDACAEICUgJkI/gyInhiImICeIIic3AxAgJSAnUg0KQaB/IAFrwUHQAGxBsKcFakHOEG0iAEHRAE8NByAAQQR0IgBBqN/AAGopAwAiJ0L/////D4MiJSAmQiCIIjN+IipCIIgiOyAnQiCIIikgM34iPHwgKSAmQv////8PgyImfiInQiCIIj18IS4gKkL/////D4MgJSAmfkIgiHwgJ0L/////D4N8QoCAgIAIfEIgiCEyQgFBACABIABBsN/AAGovAQBqa0E/ca0iK4YiKkIBfSEvICUgKEIg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AkkNAAsLIAALDgAgAUGWxcAAQQkQzAELDgAgAUGfxcAAQQgQzAELCQAgAEEANgIACwcAIAAgAWsLAwABCwuNkAEdAEGAgMAAC08CAAAADAAAAAQAAAADAAAABAAAAAUAAABhIERpc3BsYXkgaW1wbGVtZW50YXRpb24gcmV0dXJuZWQgYW4gZXJyb3IgdW5leHBlY3RlZGx5AEHYgMAAC+0CAQAAAAYAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L2FsbG9jL3NyYy9zdHJpbmcucnMAYAAQAEsAAAADCgAADgAAAC9ydXN0Yy8zZjVmZDhkZDQxMTUzYmM1ZmRjYTk0MjdlOWUwNWJlMmM3NjdiYTIzL2xpYnJhcnkvY29yZS9zcmMvc3RyL3BhdHRlcm4ucnMAvAAQAE8AAADDBQAAFAAAALwAEABPAAAAwwUAACEAAAC8ABAATwAAALcFAAAhAAAARXJyb3IAAAC8ABAATwAAAEcEAAAkAAAAIy0tLWBgYCMgCgAAXQEQAAEAAABGYWlsZWQgdG8gcGFyc2UgdGhlIGRvY3VtZW50LiBbTGluZToge0xJTkVfTlVNQkVSfV17TElORV9OVU1CRVJ9RmFpbGVkIHRvIHBhcnNlIHRoZSBkb2N1bWVudC4AQdCDwAALBQEAAAAHAEHgg8AACwUBAAAACABB8IPAAAsFAQAAAAkAQYCEwAALBQEAAAAKAEGQhMAACwUBAAAACwBBoITAAAsFAQAAAAwAQbCEwAALsw0BAAAADQAAAGJlZm9yZVRvcExldmVsSGVhZGluZ3NiZWZvcmVGaXJzdFN1YkhlYWRpbmdiZWZvcmVTdWJIZWFkaW5nc2FmdGVyUHJvcGVydGllc2JlZm9yZUNvbnRlbnRzYmVmb3JlQ29udGVudHNBZnRlckNvZGVCbG9ja3NiZWZvcmVDb2RlQmxvY2tzYmVmb3JlQ29kZUJsb2Nrc0FmdGVySGVhZGluZ3NpbnNlcnROZXdsaW5lbm90aWZ5V2hlblVuY2hhbmdlZHNob3dNb3JlRGV0YWlsZWRFcnJvck1lc3NhZ2VzaGVhZGluZ0dhcHNvdGhlckdhcHNmb3JtYXRPcHRpb25zb3RoZXJPcHRpb25zc3JjL3Rvb2xzL2Zvcm1hdHRpbmcucnMKAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZUUDEAAXAAAArwAAABEAAAABAAAAAAAAAEZhaWxlZCB0byByZWFkIG9wdGlvbnMuIFNvbWUgb2YgdGhlbSBhcmUgcG9zc2libHkgbm90IHBvc2l0aXZlIG51bWJlciB2YWx1ZXMuYXR0ZW1wdCB0byBqb2luIGludG8gY29sbGVjdGlvbiB3aXRoIGxlbiA+IHVzaXplOjpNQVhtaWQgPiBsZW4AOgQQAAkAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L2FsbG9jL3NyYy9zdHIucnNMBBAASAAAALIAAAAWAAAATAQQAEgAAACbAAAACgAAAHNyYy90b29scy9wYXJzaW5nL2hlYWRpbmdzLnJzAAAAtAQQAB0AAABmAAAADAAAAGJlZm9yZVRvcExldmVsSGVhZGluZ3NiZWZvcmVGaXJzdFN1YkhlYWRpbmdiZWZvcmVTdWJIZWFkaW5nc+QEEAAWAAAA+gQQABUAAAAPBRAAEQAAAHN0cnVjdCBIZWFkaW5nR2Fwc2FmdGVyUHJvcGVydGllc2JlZm9yZUNvbnRlbnRzYmVmb3JlQ29udGVudHNBZnRlckNvZGVCbG9ja3NiZWZvcmVDb2RlQmxvY2tzYmVmb3JlQ29kZUJsb2Nrc0FmdGVySGVhZGluZ3MAAABKBRAADwAAAFkFEAAOAAAAZwUQAB0AAACEBRAAEAAAAJQFEAAdAAAAc3RydWN0IE90aGVyR2Fwc2luc2VydE5ld2xpbmUAAADsBRAADQAAAHN0cnVjdCBGb3JtYXRPcHRpb25zbm90aWZ5V2hlblVuY2hhbmdlZHNob3dNb3JlRGV0YWlsZWRFcnJvck1lc3NhZ2VzGAYQABMAAAArBhAAHQAAAHN0cnVjdCBPdGhlck9wdGlvbnNQbHVnaW5PcHRpb25zaGVhZGluZ0dhcHNvdGhlckdhcHNmb3JtYXRPcHRpb25zb3RoZXJPcHRpb25zAAAAeAYQAAsAAACDBhAACQAAAIwGEAANAAAAmQYQAAwAAABzdHJ1Y3QgUGx1Z2luT3B0aW9ucxAAAAAEAAAABAAAABEAAAAQAAAABAAAAAQAAAASAAAAEQAAANwGEAATAAAAFAAAABUAAAAWAAAAFwAAABgAAAAEAAAABAAAABkAAAAYAAAABAAAAAQAAAAaAAAAGQAAABgHEAAbAAAAHAAAABUAAAAbAAAAFwAAAGRlc2NyaXB0aW9uKCkgaXMgZGVwcmVjYXRlZDsgdXNlIERpc3BsYXltaXNzaW5nIGZpZWxkIGBgfAcQAA8AAACLBxAAAQAAAGR1cGxpY2F0ZSBmaWVsZCBgAAAAnAcQABEAAACLBxAAAQAAAEVycm9yAAAAAAAAAAQAAAAEAAAAHQAAAGNhbGxlZCBgT3B0aW9uOjp1bndyYXBfdGhyb3coKWAgb24gYSBgTm9uZWAgdmFsdWVzcmMvdG9vbHMvcGFyc2luZy9oZWFkaW5ncy5ycwAACQgQAB0AAACAAAAALgAAAEZhaWxlZCB0byByZWFkIGxvY2FsZSBmaWxlLnBhcnNpbmdmb3JtYXR0aW5nYGBgc3JjL3Rvb2xzL3BhcnNpbmcvaGVhZGluZ3MucnNnCBAAHQAAACYAAAA7AAAAHgAAAAwAAAAEAAAAHwAAACAAAAAFAAAAYSBEaXNwbGF5IGltcGxlbWVudGF0aW9uIHJldHVybmVkIGFuIGVycm9yIHVuZXhwZWN0ZWRseQBB7JHAAAuyAwEAAAAhAAAAL3J1c3RjLzNmNWZkOGRkNDExNTNiYzVmZGNhOTQyN2U5ZTA1YmUyYzc2N2JhMjMvbGlicmFyeS9hbGxvYy9zcmMvc3RyaW5nLnJzAPQIEABLAAAAAwoAAA4AAABFcnJvci9ydXN0Yy8zZjVmZDhkZDQxMTUzYmM1ZmRjYTk0MjdlOWUwNWJlMmM3NjdiYTIzL2xpYnJhcnkvY29yZS9zcmMvc3RyL3BhdHRlcm4ucnNVCRAATwAAAL8BAAA3AAAAL3J1c3RjLzNmNWZkOGRkNDExNTNiYzVmZGNhOTQyN2U5ZTA1YmUyYzc2N2JhMjMvbGlicmFyeS9jb3JlL3NyYy9zdHIvcGF0dGVybi5ycwC0CRAATwAAAMMFAAAUAAAAtAkQAE8AAADDBQAAIQAAALQJEABPAAAAtwUAACEAAAC0CRAATwAAAEcEAAAkAAAAIyAjAAEAAAAAAAAARgoQAAEAAABjYW5ub3QgYWNjZXNzIGEgVGhyZWFkIExvY2FsIFN0b3JhZ2UgdmFsdWUgZHVyaW5nIG9yIGFmdGVyIGRlc3RydWN0aW9uAEGolcAAC6MBAQAAACUAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L3N0ZC9zcmMvdGhyZWFkL2xvY2FsLnJzALAKEABPAAAABAEAABoAAABpbnZhbGlkIHR5cGU6ICwgZXhwZWN0ZWQgAAAAEAsQAA4AAAAeCxAACwAAAAAAAAD//////////0ALEABB2JbAAAuHAgEAAAAAAAAAJgAAAC9ob21lL3J1bm5lci8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby02ZjE3ZDIyYmJhMTUwMDFmL3NlcmRlLXdhc20tYmluZGdlbi0wLjYuNS9zcmMvbGliLnJzAAAAZAsQAGUAAAA1AAAADgAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkAAA2AAAADAAAAAQAAAA3AAAAOAAAAAUAAABhIERpc3BsYXkgaW1wbGVtZW50YXRpb24gcmV0dXJuZWQgYW4gZXJyb3IgdW5leHBlY3RlZGx5AEHomMAAC5kGAQAAADkAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L2FsbG9jL3NyYy9zdHJpbmcucnMAcAwQAEsAAAADCgAADgAAAEVycm9yRU9GIHdoaWxlIHBhcnNpbmcgYSBsaXN0RU9GIHdoaWxlIHBhcnNpbmcgYW4gb2JqZWN0RU9GIHdoaWxlIHBhcnNpbmcgYSBzdHJpbmdFT0Ygd2hpbGUgcGFyc2luZyBhIHZhbHVlZXhwZWN0ZWQgYDpgZXhwZWN0ZWQgYCxgIG9yIGBdYGV4cGVjdGVkIGAsYCBvciBgfWBleHBlY3RlZCBpZGVudGV4cGVjdGVkIHZhbHVlZXhwZWN0ZWQgYCJgaW52YWxpZCBlc2NhcGVpbnZhbGlkIG51bWJlcm51bWJlciBvdXQgb2YgcmFuZ2VpbnZhbGlkIHVuaWNvZGUgY29kZSBwb2ludGNvbnRy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el5Z9yFF5hp725c6NevPUHvSPYkC5gOFe0aNK4PfRLp7TDj7sQtr8HtfBnqezoUkfPaHGEZCp1l8+lTPa4kIkHw4KsPGqwrEfMf0c7hWDfl8+PGQZqxQL307lxrAa5JjfQo9IbAGd5h9TIwpXMiUzn2w95k5/RwDfpx1AIg85Dd+A5MAqkvdbX7iW0BKT6qiftpy0BzjVNd+kI8E5BsqDX+62YJuUTpCfymQI8rlyHZ/M3SsPB97rH+gyOuF88zhf3VsbHJ1ZWFsc2UvaG9tZS9ydW5uZXIvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tNmYxN2QyMmJiYTE1MDAxZi9zZXJkZV9qc29uLTEuMC4xMjcvc3JjL3JlYWQucnMAADoZEABgAAAAoAEAAEUAAAA6GRAAYAAAAKUBAAA9AAAAOhkQAGAAAACtAQAAGgAAADoZEABgAAAA+gEAABMAAAA6GRAAYAAAAAMCAAA+AAAAOhkQAGAAAAD/AQAAMwAAADoZEABgAAAACQIAADoAAAA6GRAAYAAAAGgCAAAZAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAABAAIAAwAEAAUABgAHAAgACQD//////////////////woACwAMAA0ADgAPAP////////////////////////////////////////////////////////////////////8KAAsADAANAA4ADwD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AABAAIAAwAEAAUABgAHAAgACQAP//////////////////oACwAMAA0ADgAPAA/////////////////////////////////////////////////////////////////////6AAsADAANAA4ADwAP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBBuLzAAAu1CVRyaWVkIHRvIHNocmluayB0byBhIGxhcmdlciBjYXBhY2l0eTgeEAAkAAAAL3J1c3RjLzNmNWZkOGRkNDExNTNiYzVmZGNhOTQyN2U5ZTA1YmUyYzc2N2JhMjMvbGlicmFyeS9hbGxvYy9zcmMvcmF3X3ZlYy5yc2QeEABMAAAAAwIAAAkAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L2FsbG9jL3NyYy9jb2xsZWN0aW9ucy9idHJlZS9tYXAvZW50cnkucnPAHhAAYAAAAHEBAAA2AAAAYXNzZXJ0aW9uIGZhaWxlZDogaWR4IDwgQ0FQQUNJVFkvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L2FsbG9jL3NyYy9jb2xsZWN0aW9ucy9idHJlZS9ub2RlLnJzYXNzZXJ0aW9uIGZhaWxlZDogZWRnZS5oZWlnaHQgPT0gc2VsZi5oZWlnaHQgLSAxAFAfEABbAAAArwIAAAkAAABQHxAAWwAAALMCAAAJAAAAYXNzZXJ0aW9uIGZhaWxlZDogc3JjLmxlbigpID09IGRzdC5sZW4oKVAfEABbAAAALwcAAAUAAABQHxAAWwAAAK8EAAAjAAAAUB8QAFsAAADvBAAAJAAAAGFzc2VydGlvbiBmYWlsZWQ6IGVkZ2UuaGVpZ2h0ID09IHNlbGYubm9kZS5oZWlnaHQgLSAxAAAAUB8QAFsAAADwAwAACQAAAC9ydXN0Yy8zZjVmZDhkZDQxMTUzYmM1ZmRjYTk0MjdlOWUwNWJlMmM3NjdiYTIzL2xpYnJhcnkvYWxsb2Mvc3JjL2NvbGxlY3Rpb25zL2J0cmVlL25hdmlnYXRlLnJzAJwgEABfAAAAWQIAADAAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L2FsbG9jL3NyYy9jb2xsZWN0aW9ucy9idHJlZS9uYXZpZ2F0ZS5ycwAMIRAAXwAAAMcAAAAnAAAAAAAAAAgAAAAEAAAARAAAAEUAAABGAAAAYm9vbGVhbiBgYAAAlCEQAAkAAACdIRAAAQAAAGludGVnZXIgYAAAALAhEAAJAAAAnSEQAAEAAABmbG9hdGluZyBwb2ludCBgzCEQABAAAACdIRAAAQAAAGNoYXJhY3RlciBgAOwhEAALAAAAnSEQAAEAAABzdHJpbmcgAAgiEAAHAAAAYnl0ZSBhcnJheXVuaXQgdmFsdWVPcHRpb24gdmFsdWVuZXd0eXBlIHN0cnVjdHNlcXVlbmNlbWFwZW51bXVuaXQgdmFyaWFudG5ld3R5cGUgdmFyaWFudHR1cGxlIHZhcmlhbnRzdHJ1Y3QgdmFyaWFudAABAAAAAAAAAC4wYSBib29sZWFuYSBzdHJpbmdjYW5ub3QgYWNjZXNzIGEgVGhyZWFkIExvY2FsIFN0b3JhZ2UgdmFsdWUgZHVyaW5nIG9yIGFmdGVyIGRlc3RydWN0aW9uAEH4xcAAC8ULAQAAACUAAAAvcnVzdGMvM2Y1ZmQ4ZGQ0MTE1M2JjNWZkY2E5NDI3ZTllMDViZTJjNzY3YmEyMy9saWJyYXJ5L3N0ZC9zcmMvdGhyZWFkL2xvY2FsLnJzAAAjEABPAAAABAEAABoAAABKc1ZhbHVlKCkAAABgIxAACAAAAGgjEAABAAAASAAAAFRyaWVkIHRvIHNocmluayB0byBhIGxhcmdlciBjYXBhY2l0eYAjEAAkAAAAL3J1c3RjLzNmNWZkOGRkNDExNTNiYzVmZGNhOTQyN2U5ZTA1YmUyYzc2N2JhMjMvbGlicmFyeS9hbGxvYy9zcmMvcmF3X3ZlYy5yc6wjEABMAAAAAwIAAAkAAABNAAAADAAAAAQAAABOAAAATwAAAFAAAAAvcnVzdC9kZXBzL2RsbWFsbG9jLTAuMi42L3NyYy9kbG1hbGxvYy5yc2Fzc2VydGlvbiBmYWlsZWQ6IHBzaXplID49IHNpemUgKyBtaW5fb3ZlcmhlYWQAICQQACkAAACoBAAACQAAAGFzc2VydGlvbiBmYWlsZWQ6IHBzaXplIDw9IHNpemUgKyBtYXhfb3ZlcmhlYWQAACAkEAApAAAArgQAAA0AAABBY2Nlc3NFcnJvcgABAAAAAAAAAGVudGl0eSBub3QgZm91bmRwZXJtaXNzaW9uIGRlbmllZGNvbm5lY3Rpb24gcmVmdXNlZGNvbm5lY3Rpb24gcmVzZXRob3N0IHVucmVhY2hhYmxlbmV0d29yayB1bnJlYWNoYWJsZWNvbm5lY3Rpb24gYWJvcnRlZG5vdCBjb25uZWN0ZWRhZGRyZXNzIGluIHVzZWFkZHJlc3Mgbm90IGF2YWlsYWJsZW5ldHdvcmsgZG93bmJyb2tlbiBwaXBlZW50aXR5IGFscmVhZHkgZXhpc3Rzb3BlcmF0aW9uIHdvdWxkIGJsb2Nrbm90IGEgZGlyZWN0b3J5aXMgYSBkaXJlY3RvcnlkaXJlY3Rvcnkgbm90IGVtcHR5cmVhZC1vbmx5IGZpbGVzeXN0ZW0gb3Igc3RvcmFnZSBtZWRpdW1maWxlc3lzdGVtIGxvb3Agb3IgaW5kaXJlY3Rpb24gbGltaXQgKGUuZy4gc3ltbGluayBsb29wKXN0YWxlIG5ldHdvcmsgZmlsZSBoYW5kbGVpbnZhbGlkIGlucHV0IHBhcmFtZXRlcmludmFsaWQgZGF0YXRpbWVk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', imports)}

/** Entry Point. */
class FormattoPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.utils = new FormattoUtils(this);
        this.icons = new FormattoIcons();
        this.ribbonIcons = new FormattoRibbonIcons(this);
        this.editorMenus = new FormattoEditorMenu(this);
        this.commands = new FormattoCommands(this);
    }
    /** Load and Save Options */
    loadOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_OPTIONS, yield this.loadData());
        });
    }
    saveOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    /** Runs whenever the user starts using the plugin in Obsidian. */
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadOptions();
            // Initialize WebAssembly
            yield (() => __awaiter(this, void 0, void 0, function* () {
                // @ts-expect-error: formatto_wasm should be called.
                yield __wbg_init(yield formatto_wasm());
            }))();
            this.addSettingTab(new FormattoOptionTab(this.app, this));
            this.icons.registerIcons();
            this.ribbonIcons.registerRibbonIcons();
            this.editorMenus.registerEditorMenus();
            this.commands.registerCommands();
            console.log("Plugin Loaded: Formatto\n(Some error details are going to be displayed here.)");
        });
    }
    /** Runs when the plugin is disabled. */
    onunload() {
        console.log("Plugin Unloaded: Formatto");
    }
}

module.exports = FormattoPlugin;

/* nosourcemap */