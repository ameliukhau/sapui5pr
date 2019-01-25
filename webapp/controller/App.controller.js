sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"opensap/myapp/model/formatter"
], function (Controller, MessageToast, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("opensap.myapp.controller.App", {

		formatter : formatter,

		onItemSelected: function(oEvent) {
			var oSelectedItem = oEvent.getSource();
			var oContext = oSelectedItem.getBindingContext();
			var sPath = oContext.getPath();
			var oProductDetailPanel = this.byId("productDetailsPanel");
	
			oProductDetailPanel.bindElement({ path: sPath });
			this.byId("productDetailsPanel").setVisible(true); 
		},

		onFilterProducts : function (oEvent) {

			// build filter array
			var aFilter = [], sQuery = oEvent.getParameter("query"),
				// retrieve list control
				oList = this.getView().byId("productsList"),
				// get binding for aggregation 'items'
				oBinding = oList.getBinding("items");

			if (sQuery) {
				aFilter.push(new Filter("ProductID", FilterOperator.Contains, sQuery));
			}
			oBinding.filter(aFilter);
		},

		onPressHideDetails :function() {
			this.byId("productDetailsPanel").setVisible(false)
		},

		onPressToAboutPage: function() {
			this.getOwnerComponent().getRouter().navTo("about");
		},

		onPressToTable: function() {
			this.getOwnerComponent().getRouter().navTo("table");
		},

		onPressLangChange: function() {
			var oGetLang = sap.ui.getCore().getConfiguration().getLanguage();
			if (oGetLang == "ru") {
				sap.ui.getCore().getConfiguration().setLanguage("en_US");	
			} else {
				sap.ui.getCore().getConfiguration().setLanguage("ru");	
			}	
		}
		
	});
});