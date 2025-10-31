// import { Canvas } from "canvas";
import JsBarcode from "jsbarcode";
import { DOMImplementation, XMLSerializer } from "xmldom";

// // export const generateBarCode = (value: string): Buffer => {
// // const canvas = new Canvas(100, 100, "image");
// //     JsBarcode(canvas, value);
// //     return canvas.toBuffer();
// // };

export const generateBarCode = (value: string): string => {
    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument("http://www.w3.org/1999/xhtml", "html", null);
    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    JsBarcode(svgNode, value, {
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
