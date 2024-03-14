"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unescapeSegment = exports.unescape = exports.isTemplateStringsArray = exports.templateContent = exports.RetortMessage = void 0;
const id_1 = require("./id");
class RetortMessage {
    constructor({ role, content }) {
        this.id = (0, id_1.id)("msg");
        this.content = "";
        this.role = role;
        this.content = content;
    }
}
exports.RetortMessage = RetortMessage;
function templateContent(templateStrings, ...values) {
    // Get the strings in raw form.
    let strings = templateStrings.raw.map((x) => x);
    // Remove carriage returns from strings.
    strings = strings.map((str) => str.replace(/\r/g, ""));
    // Remove any whitespace at the start of a line in each of the strings - except that which is explicitly specified.
    strings = strings.map((str) => str.replace(/\n[^\S\r\n]+/g, "\n"));
    // Remove any whitespace at the end of a line in each of the strings - except that which is explicitly specified.
    strings = strings.map((str) => str.replace(/[^\S\r\n]+\n/g, "\n"));
    // Allow line continuations. TODO: Allow line continuations with an even number of preceding backslashes.
    strings = strings.map((str) => str.replace(/(?<!\\)((?:\\\\)*)\\\n/g, "$1"));
    // Remove leading whitespace from the first string, if any.
    strings[0] = (strings[0] || "").trimStart();
    // Remove trailing whitespace from the last string, if any.
    strings[strings.length - 1] = (strings[strings.length - 1] || "").trimEnd();
    // Now, finally, encode the strings.
    strings = strings.map((str) => unescape(str));
    let content = strings[0] || "";
    for (let i = 1, l = strings.length; i < l; i++) {
        let currentValue = values[i - 1];
        let insertion = "";
        if (currentValue === null) {
            insertion = "";
        }
        else if (typeof currentValue === "number") {
            insertion = currentValue.toString();
        }
        else if (typeof currentValue === "string") {
            insertion = currentValue;
        }
        else if (typeof currentValue === "boolean") {
            insertion = currentValue.toString();
        }
        else if (typeof currentValue === "object") {
            if (currentValue instanceof RetortMessage) {
                insertion = currentValue.content;
            }
            else {
                throw new Error("Unknown object passed to retort template");
            }
            // TODO: Messages being inserted.
            // TODO: Conversations being inserted.
        }
        else if (currentValue === undefined) {
            throw new Error("Undefined passed to retort template");
        }
        else if (typeof currentValue === "function") {
            throw new Error("Function passed to retort template");
        }
        else if (typeof currentValue === "symbol") {
            throw new Error("Symbol passed to retort template");
        }
        else if (typeof currentValue === "bigint") {
            throw new Error("BigInt not yet supported");
        }
        else {
            throw new Error("Unsupported value inserted into template");
        }
        content += insertion;
        content += strings[i] || "";
    }
    return content;
}
exports.templateContent = templateContent;
function isTemplateStringsArray(templateStrings) {
    return (Array.isArray(templateStrings) &&
        Array.isArray(templateStrings.raw));
}
exports.isTemplateStringsArray = isTemplateStringsArray;
function unescape(str) {
    let segments = str
        .split(/(\\\x[a-fA-F0-9]{2}|\\\u[a-fA-F0-9]{4}|\\\u\{[a-fA-F0-9]{1,6}\}|\\.)/g)
        .filter((x) => x);
    return segments.map(unescapeSegment).join("");
}
exports.unescape = unescape;
function unescapeSegment(str) {
    if (str.startsWith("\\")) {
        if (str[1] === "x") {
            // Use a regex to check that this is a valid escape sequence
            if (!/\\x[a-fA-F0-9][a-fA-F0-9]/.test(str)) {
                throw new Error(`Malformed Latin-1 escape sequence; should be like "\\x00"`);
            }
            return String.fromCharCode(parseInt(str.slice(2), 16));
        }
        else if (str[1] === "u") {
            if (str[2] === "{") {
                // Use a regex to check that this is a valid escape sequence
                if (!/\\u\{[a-fA-F0-9]{1,6}\}/.test(str)) {
                    throw new Error(`Malformed unicode escape sequence; should be like "\\u{000000} or "\\u0000`);
                }
                return String.fromCodePoint(parseInt(str.slice(3, -1), 16));
            }
            else {
                // Use a regex to check that this is a valid escape sequence
                if (!/\\u[a-fA-F0-9]{4}/.test(str)) {
                    throw new Error(`Malformed unicode escape sequence; should be like "\\u{000000} or "\\u0000`);
                }
                return String.fromCharCode(parseInt(str.slice(2, 6), 16));
            }
        }
        else if (str[1] === "n") {
            return "\n";
        }
        else if (str[1] === "r") {
            return "\r";
        }
        else if (str[1] === "t") {
            return "\t";
        }
        else if (str[1] === "\\") {
            return "\\";
        }
        else if (str[1] === "s") {
            // Special space escaping behaviour.
            return " ";
        }
        else {
            throw new Error(`Unsupported escape sequence: "${str}"`);
        }
    }
    else {
        return str;
    }
}
exports.unescapeSegment = unescapeSegment;
