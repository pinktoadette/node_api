var _ = require('lodash'),
    fs = require('fs'),
    glob = require('glob');


 const getGlobbedFiles =  (globPatterns, removeRoot) => {
    const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    let output = [];

    if (_.isArray(globPatterns)) {
        globPatterns.forEach((globPattern) => {
            output = _.union(output, getGlobbedFiles(globPattern, removeRoot));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else if (fs.existsSync(globPatterns)) {
            output.push(globPatterns);
        } else {
            const files = glob.sync(globPatterns);
            output = _.union(output, files);
        }
    }
    
    if (removeRoot) {
        output = _.invokeMap(output, file => {
            return file.replace(removeRoot, '');
        });
    }

    return output;
};

module.exports.getGlobbedFiles = getGlobbedFiles;