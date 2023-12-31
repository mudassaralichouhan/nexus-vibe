import crypto from "crypto";

export const strRand = (length = 10) => {
    if (length <= 0)
        throw new Error('Length must be a positive integer');

    const buffer = crypto.randomBytes(Math.ceil(length / 2));

    return buffer.toString('hex').slice(0, length);
}

function getFileExtensionFromMimeType(mimeType) {
    const mimeParts = mimeType.split('/');
    if (mimeParts.length === 2) {
        return mimeParts[1];
    }
    return null; // Invalid or unknown MIME type
}
