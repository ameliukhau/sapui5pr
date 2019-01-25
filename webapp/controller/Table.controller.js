sap.ui.define([
    "opensap/myapp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "opensap/myapp/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("opensap.myapp.controller.Table", {

        formatter: formatter,

        _mFilters: {
            cheap: [new sap.ui.model.Filter("Price", "LT", 100)],
            moderate: [new sap.ui.model.Filter("Price", "BT", 100, 1000)],
            expensive: [new sap.ui.model.Filter("Price", "GT", 1000)]
        },

        onInit : function () {
            var oViewModel,
                iOriginalBusyDelay,
                oTable = this.byId("table");

            iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
            this._oTable = oTable;
            // keeps the search state
            this._oTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
                shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
                tableBusyDelay : 0,
                cheap: 0,
                moderate: 0,
                expensive: 0
            });
            this.setModel(oViewModel, "worklistView");

            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oTable.attachEventOnce("updateFinished", function(){
                // Restore original busy indicator delay for worklist's table
                oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
            });
        },

        onAdd: function() {
            this.getRouter().navTo("add");
        },

        onQuickFilter: function(oEvent) {
           var sKey = oEvent.getParameter("selectedKey"),
                oFilter = this._mFilters[sKey],
                oBinding = this._oTable.getBinding("items");

            if (oFilter) {
                oBinding.filter(oFilter);		   		   	
            } else {
                oBinding.filter([]);	
            }
        },

        onUpdateFinished : function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                oModel = this.getModel(),
                oViewModel = this.getModel("worklistView"),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
                // iterate the filters and request the count from the server
                jQuery.each(this._mFilters, function (sFilterKey, oFilter) {
                    oModel.read("/ProductSet/$count", {
                        filters: oFilter,
                        success: function (oData) {
                            var sPath = "/" + sFilterKey;
                            oViewModel.setProperty(sPath, oData);
                        }
                    });
                });
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        onPress : function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        onNavBack : function () {
			this.getOwnerComponent().getRouter().navTo("main");
		},


        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
            
                this.onRefresh();
            } else {
                var oTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    if (sQuery == "Name") {
                        oTableSearchState = [new Filter("Name", FilterOperator.Contains, sQuery)];
                    } else {
                        oTableSearchState = [ new sap.ui.model.Filter([
                            new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery ),
                            new sap.ui.model.Filter("ProductID", sap.ui.model.FilterOperator.Contains, sQuery )
                         ],false)
                      ];
                    }
                                          
                  }
                  this._applySearch(oTableSearchState);
            }

        },

      
        onRefresh : function () {
            this._oTable.getBinding("items").refresh();
        },
        
        onShowDetailPopover : function (oEvent) {
            // fetch and bind popover
            // var oPopover = this.byId("dimensionsPopover");
            var oPopover = this._getPopover();
            oPopover.bindElement(oEvent.getSource().getBindingContext().getPath());

            // open it at the current position
            var oOpener = oEvent.getParameter("domRef");
            oPopover.openBy(oOpener);
        },

        _getPopover : function () {
            // create dialog lazily via fragment factory
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("opensap.myapp.view.DetailPopover", this);
                this.getView().addDependent(this._oPopover);
            }
            return this._oPopover;
        },

       
        _showObject : function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getProperty("ProductID")
            });
        },

       
        _applySearch: function(oTableSearchState) {
            var oViewModel = this.getModel("worklistView");
            this._oTable.getBinding("items").filter(oTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (oTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
}
);