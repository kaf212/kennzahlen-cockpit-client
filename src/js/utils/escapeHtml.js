
export function escapeHtml(unsafeString) {
    /**
     * Escapes HTML characters inside a string that could enable cross-site-scripting attacks.
     * After escaping, the string can be securely inserted into the site's HTML.
     * Source: https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
     *
     * @param {String} unsafeString - The string that possibly contains dangerous characters
     * @return {String} The secure escaped string
     */
    return unsafeString
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}