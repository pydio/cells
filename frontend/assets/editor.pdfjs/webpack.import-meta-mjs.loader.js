/**
 * Simple loader to ignore import.meta.url usages in third-party modules that assume
 * an ESM environment (e.g. pdfjs-dist) while we bundle into classic scripts.
 *
 * This fixes the issue with replacing import.meta.url with absolute file paths during bundling.
 */
module.exports = function replaceImportMeta(source) {
    return source.replace(
        /import\.meta\.url/g,
        '(typeof document!=="undefined"&&document.currentScript?document.currentScript.src:(typeof location!=="undefined"?location.href:""))'
    );
};
