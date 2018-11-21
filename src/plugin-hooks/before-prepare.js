var fs = require('fs-promise');
var path = require('path');

module.exports = function (logger, platformsData, projectData, hookArgs) {
	var platform = hookArgs.platform.toLowerCase();

	if (platform == 'ios') {
		var appResourcesDirectoryPath = projectData.appResourcesDirectoryPath;
		var platformResourcesDirectory = path.join(appResourcesDirectoryPath, 'iOS');
		var target = path.join(platformResourcesDirectory, 'build.xcconfig');

		return fs.readFile(target)
			.then(function (data) {
				return data.toString();
			})
			.then(function (buildData) {
				if (!buildData.toString().match(/^\s*CODE_SIGN_ENTITLEMENTS/mg)) {
					var entitlementsFile = projectData.projectName + '.entitlements';
					var entitlementsPath = path.join(projectData.projectName, entitlementsFile);
					var codeSignProp = '\nCODE_SIGN_ENTITLEMENTS = ' + entitlementsPath;
					logger.info('Add code sign prop: ' + codeSignProp);
					return fs.appendFile(target, codeSignProp);
				}
				logger.warn('CODE_SIGN_ENTITLEMENTS already added');
			});
	}
	logger.info('Only iOS');
	// skip android
	return Promise.resolve();
};
