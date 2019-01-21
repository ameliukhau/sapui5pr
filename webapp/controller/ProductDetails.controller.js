sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"opensap/myapp/model/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("opensap.myapp.controller.ProductDetails", {

		formatter: formatter,

		onInit: function() {
			this.byId("categoryLabel").setVisible(false);
			this.byId("category").setVisible(false);
		}
	});

});
