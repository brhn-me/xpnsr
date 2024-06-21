export const getHyperMediaLink = (linkName, obj) => {
    if (obj && obj['_links'] && obj['_links'][linkName]) {
        const url = new URL(obj['_links'][linkName].href);
        const hyperMediaUrl = url.pathname + url.search;
        return hyperMediaUrl;
    }
    return null;
}