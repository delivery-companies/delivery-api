"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBarCode = void 0;
// import { Canvas } from "canvas";
const jsbarcode_1 = __importDefault(require("jsbarcode"));
const xmldom_1 = require("xmldom");
// // export const generateBarCode = (value: string): Buffer => {
// // const canvas = new Canvas(100, 100, "image");
// //     JsBarcode(canvas, value);
// //     return canvas.toBuffer();
// // };
const generateBarCode = (value) => {
    const xmlSerializer = new xmldom_1.XMLSerializer();
    const document = new xmldom_1.DOMImplementation().createDocument("http://www.w3.org/1999/xhtml", "html", null);
    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    (0, jsbarcode_1.default)(svgNode, value, {
        xmlDocument: document,
        height: 120,
        width: 3,
        fontOptions: "bold"
    });
    // svgNode.setAttribute("width", "500");
    // svgNode.setAttribute("height", "400");
    const svgText = xmlSerializer.serializeToString(svgNode);
    return svgText;
};
exports.generateBarCode = generateBarCode;
//# sourceMappingURL=generateBarCode.js.map