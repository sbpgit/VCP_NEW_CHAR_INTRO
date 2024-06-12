sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "sap/ui/core/util/File"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Device, Fragment, File) {
        "use strict";
        var that, oGModel;
        return Controller.extend("vcpapp.vcpnpicharvalue.controller.MultiProd", {
            onInit: function () {
                that = this;
                that.oGModel = this.getOwnerComponent().getModel("oGModel");
                this.newProdAssign = new JSONModel();
                this.newProdAssign.setSizeLimit(1000);
                this.ProdModel = new JSONModel();
                this.ProdModel.setSizeLimit(1000);
            },
            onAfterRendering:function(){
                that.selectedConfigProductOut = that.oGModel.getProperty("/configProduct");
                var newModel ={},newData=[];
                newModel = {
                    NEW_PROD :"",
                    REF_PROD : "",
                    WEIGHT:"",
                    OFFSET : "",
                    VALID_FROM:"",
                    VALID_TO:"",
                    ACTIVE:false
                }
                newData.push(newModel);
                that.newProdAssign.setData({MultiProd:newData});
                that.byId("idMultiProdAssign").setModel(that.newProdAssign);
                if (!this._valueHelpDialogProdLoc) {
                    this._valueHelpDialogProdLoc = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProdLoc);
                }
                this.getOwnerComponent().getModel("BModel").read("/getPartialProd", {
                    filters: [
                        new Filter(
                            "REF_PRODID",
                            FilterOperator.EQ,
                            that.selectedConfigProductOut
                        ),
                    ],
                    success: function (oData1) {
                        if (oData1.results.length > 0) {
                           that.prods=[];
                           that.prods=oData1.results;
                        }
                        else {
                            MessageToast.show("No Products available")
                        }
                    },
                    error: function () {
                        MessageToast.show("Failed to get products");
                    }
                });
            },

            /**On press of add button*/
            onAddPress:function(oEvent){
                var oModel = this.byId("idMultiProdAssign").getModel();
                var aData = oModel.getProperty("/MultiProd");
                // Define the new row
            var oNewRow = { NEW_PROD: "", REF_PROD: "", WEIGHT:"",OFFSET:"",ACTIVE:false,VALID_FROM:"",VALID_TO:"" };
            // Add the new row to the existing data
            aData.push(oNewRow);
            // Update the model with the new data
            oModel.setProperty("/MultiProd", aData);
            },

            /**On removing item from table */
            onTabRowDel:function(oEvent){
                var oTable = this.getView().byId("idMultiProdAssign");			
            // Get the selected context
            var oContext = oEvent.getParameters().listItem.getBindingContext();
            // Get the model
            var oModel = this.byId("idMultiProdAssign").getModel();
            // Get the existing data
            var aData = oModel.getProperty("/MultiProd");
            // Find the index of the selected item
            var sPath = oContext.getPath();
            var iIndex = parseInt(sPath.substring(sPath.lastIndexOf("/") + 1), 10);
            // Remove the selected item from the data
            aData.splice(iIndex, 1);
            // Update the model with the new data
            oModel.setProperty("/MultiProd", aData);
            },
            /**On press of handle value help */
            handleValueHelpInput:function(oEvent){
                that.oSource = oEvent.getSource();
                var table = that.byId("idMultiProdAssign");                
                var selectedIndex = oEvent.getSource().getParent().getCells().indexOf(that.oSource);
                var selectedKey= table.getColumns()[selectedIndex].getHeader().getText();
                if (selectedKey === "Product ID") {
                    that.ProdModel.setData({ configProdRes: that.prods });
                    sap.ui.getCore().byId("prodSlctListOD").setModel(that.ProdModel);
                    that._valueHelpDialogProdLoc.open();
                }
                else{
                    if(oEvent.getSource().getParent().getCells()[0].getTokens().length>0){
                    let filteredItems = that.prods.filter(item => item.PRODUCT_ID !== that.newprodSelected);
                    that.ProdModel.setData({ configProdRes: filteredItems });
                    sap.ui.getCore().byId("prodSlctListOD").setModel(that.ProdModel);
                    that._valueHelpDialogProdLoc.open();
                    }
                    else{
                        MessageToast.show("Please select a new product");
                    }
                }
            },
            /**Handle Product Selection in ProdLocation fragment */
            handleProdChange:function(oEvent){
                that.newprodSelected=[];
                that.oSource.removeAllTokens();
                that.newprodSelected = oEvent.getParameters().listItem.getTitle();
                var selected = oEvent.getParameters().listItem;
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: selected.getDescription(),
                            text: selected.getTitle(),
                            editable: false
                        })
                    );                
            },
            /**On Input Change in RefCharVal fragment to support only numerics */
            onInputChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oEvent.getParameter("value");
                var sNewValue = sValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                if (sNewValue > 0) {
                    oInput.setValue(sNewValue);
                    oInput.setValueState("None");
                }
                else {
                    oInput.setValue(sNewValue);
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Value should be greater than 0");
                }
            },
            onBackMulti: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("RouteHome", {}, true);
                if (this._valueHelpDialogProdLoc) {
                    that._valueHelpDialogProdLoc.destroy(true);
                    that._valueHelpDialogProdLoc = "";
                }
                sap.ui.core.BusyIndicator.hide();
            },
        });
    });