export const getHyperMediaLink = (linkName, obj) => {
    if (obj && obj['_links'] && obj['_links'][linkName]) {
        let url = new URL(obj['_links'][linkName].href);
        return '' + url.pathname + url.search;
    }
    return null;
}

export const getHyperMediaAddLink = (navs) => {
    if (navs && navs.add && navs.add.href) {
        let url = new URL(navs.add.href);
        return '' + url.pathname + url.search;
    }
    return null;
}