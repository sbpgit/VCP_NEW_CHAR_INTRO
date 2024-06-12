/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"vcpapp/vcp_npi_charvalue/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
