import QRCode from "qrcode";

export const generateQRCode = async (value: string): Promise<string> => {
    return await QRCode.toDataURL(value, {
        margin: 0
    });
};
