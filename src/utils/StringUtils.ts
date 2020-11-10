const escapeString = /[|\\{}()[\]^$+*?.]/g;
export const escapeStringRegExp = (str: string): string => {
    return str.replace(escapeString, "\\$&");
};

export const trimChar = (origString, charToTrim) => {
    const escapedCharToTrim = escapeStringRegExp(charToTrim);
    const regEx = new RegExp("^[" + escapedCharToTrim + "]+|[" + escapedCharToTrim + "]+$", "g");
    return origString.replace(regEx, "");
};

export const ensureEndsWithSlash = (url: string): string => {
    const lastChar = url.substr(-1);
    if (lastChar !== "/" && lastChar !== "\\") {
        url = url + "/";
    }
    return url;
};
