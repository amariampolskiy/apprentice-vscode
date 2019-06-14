'use strict';

const tinycolor = require('tinycolor2');
const fsp = require('./fsp');
const { loadYAML } = require('./yaml');

/**
 * On dev mode, sometimes when we read the file the return value of readFile
 * is an empty string. In those cases we need to read the file again
 */
async function readFileRetrying(yamlFilePath) {
    const standardThemeYAML = await fsp.readFile(yamlFilePath, 'utf8');
    if (!standardThemeYAML) {
        return readFileRetrying(yamlFilePath);
    }
    return standardThemeYAML;
}

async function loadTheme(yamlFilePath) {
    const standardThemeYAML = await readFileRetrying(yamlFilePath);
    const standardTheme = await loadYAML(standardThemeYAML);

    const brightThemeYAML = getBrightThemeYAML(standardThemeYAML, standardTheme);
    const brightTheme = await loadYAML(brightThemeYAML);

    return { standardTheme, brightTheme };
}

function getBrightThemeYAML(fileContent, standardTheme) {
    const colors = [
        ...standardTheme.apprentice.base,
    ];

    return fileContent.replace(/#[0-9A-F]{6}/g, color => {
        const idx = colors.findIndex(k => k==color)
        if (idx >= 4 && idx <= 14) {
            return tinycolor(colors[idx + 1])
                .toHexString();
        }
        return color;
    });
}

module.exports = loadTheme;
