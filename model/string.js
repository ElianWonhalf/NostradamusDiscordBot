global.getUnicodeCode = (character) => {
    const hex = character.codePointAt(0).toString(16);
    return "\\u" + '0000'.substring(0, 4 - hex.length) + hex;
};
