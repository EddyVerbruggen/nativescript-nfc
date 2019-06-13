var fs = require('fs-promise');
var path = require('path');

module.exports = function (logger, projectData, hookArgs) {
	var platform = (hookArgs && (hookArgs.platform || (hookArgs.prepareData && hookArgs.prepareData.platform)) || '').toLowerCase();

	if (platform == 'ios') {
		var appResourcesDirectoryPath = projectData.appResourcesDirectoryPath;
		var entitlementsFile = path.join(appResourcesDirectoryPath, 'iOS', 'app.entitlements');
		var entitlementsFileAlt = path.join(appResourcesDirectoryPath, 'iOS', projectData.projectName + '.entitlements');
		var projectRoot = path.join(projectData.platformsDir, 'ios');
		var project = path.join(projectRoot, projectData.projectName);
		var dest = path.join(projectRoot, projectData.projectName + '.entitlements');
		var fileToCopy = fs.existsSync(entitlementsFile) ? entitlementsFile : entitlementsFileAlt;
		return fs.copy(fileToCopy, dest)
			.then(function () {
				logger.info('Copied `' + fileToCopy + '` to `' + dest + '`');
			});
	}

	logger.info('Only iOS');
	return Promise.resolve();
};
