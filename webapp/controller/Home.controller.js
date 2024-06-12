sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "sap/ui/core/util/File",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Device, Fragment, File, library, Spreadsheet) {
        "use strict";
        var that, oGModel;
        return Controller.extend("vcpapp.vcpnpicharvalue.controller.Home", {
            onInit: function () {
                that = this;
                that.oTable = that.byId("idOrderList"); // Get reference to the table
                that.oGModel = this.getOwnerComponent().getModel("oGModel");
                that.partModel = new JSONModel();
                that.locModel = new JSONModel();
                that.prodModel1 = new JSONModel();
                that.uniqModel = new JSONModel();
                that.custModel = new JSONModel();
                that.oNewModel = new JSONModel();
                that.phaseOutModel = new JSONModel();
                that.projModel = new JSONModel();
                that.partModel.setSizeLimit(1000);
                that.locModel.setSizeLimit(1000);
                that.prodModel1.setSizeLimit(1000);
                that.uniqModel.setSizeLimit(1000);
                that.custModel.setSizeLimit(1000);
                that.oNewModel.setSizeLimit(1000);
                that.phaseOutModel.setSizeLimit(1000);
                that.projModel.setSizeLimit(1000);
                this._oCore = sap.ui.getCore();


            },
            onAfterRendering: function () {
                sap.ui.core.BusyIndicator.show()
                that.byId("idConfigProd").setValue();
                that.byId("idProjDet").setValue();
                that.byId("idToggleButton").setPressed(false);
                that.byId("idToggleButton1").setPressed(false);
                that.byId("idToggleButton2").setPressed(false);
                if (!this._popOver) {
                    this._popOver = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.PopOver",
                        this
                    );
                    this.getView().addDependent(this._popOver);
                }
                if (!this._valueHelpDialogProjectDet) {
                    this._valueHelpDialogProjectDet = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.MultiProjectDetails",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProjectDet);
                }
                if (!this._valueHelpDialogProd) {
                    this._valueHelpDialogProd = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProd);
                }
                if (!this._valueHelpDialogProject) {
                    this._valueHelpDialogProject = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.ProjectDetails",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProject);
                }
                sap.ui.getCore().byId("idList").removeSelections();
                this.getOwnerComponent().getModel("BModel").read("/getProducts", {
                    method: "GET",
                    success: function (oData) {

                        that.prodModel1.setData({ configProdRes: oData.results });
                        sap.ui.getCore().byId("prodSlctListOD").setModel(that.prodModel1);
                        sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get configurable products");
                    },
                });
                this.getOwnerComponent().getModel("BModel").read("/getNPICharVal", {
                    method: "GET",
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            that.tabData = [];
                            that.tabData = oData.results;
                            that.tabData.forEach(function (oItem) {
                                if (oItem.ACTIVE === true) {
                                    oItem.ACTIVE = "Active";
                                }
                                else {
                                    oItem.ACTIVE = "InActive";
                                }

                            });
                            that.custModel.setData({ configProdResults: that.tabData });
                            that.byId("idOrderList").setModel(that.custModel);
                        }
                        sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get new characteristic value data");
                    },
                });
                this.getOwnerComponent().getModel("BModel").read("/getPhaseOutDet", {
                    method: "GET",
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            that.tabPhaseData = [];
                            that.tabPhaseData = oData.results;
                            that.phaseOutModel.setData({ phaseOutDet: that.tabPhaseData });
                            that.byId("idPhaseOutList").setModel(that.phaseOutModel);
                        }
                        sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get phaseout details");
                    },
                });

                this.getOwnerComponent().getModel("BModel").read("/getProjDetails", {
                    method: "GET",
                    success: function (oData) {
                        if (oData.results.length > 0) {
                            that.tabProjDe = [];
                            that.tabProjDe = oData.results;
                            that.tabProjDe.forEach(function (oItem) {
                                if (oItem.PROJ_STATUS === true) {
                                    oItem.PROJ_STATUS = "Active";
                                }
                                else {
                                    oItem.PROJ_STATUS = "InActive";
                                }

                            });
                            that.projModel.setData({ projDetails: that.tabProjDe });
                            that.byId("idMPD").setModel(that.projModel);
                            sap.ui.getCore().byId("idProjDetailsFrag").setModel(that.projModel);
                        }
                        else{
                            MessageToast.show("No Projects available");
                        }
                        sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get project details");
                    },
                });
            },

            handleValueHelp: function (oEvent) {
                var sId = oEvent.getParameter("id");
                // Prod Dialog
                if (sId.includes("ConfigProd")) {
                    that._valueHelpDialogProd.open();
                }
                else if (sId.includes("idProjDet")) {
                    that._valueHelpDialogProject.open();
                }
            },
            /**On Press of dropdown Add */
            onAddPressed: function (oEvent) {
                if (oEvent.getSource().getPressed()) {
                    this._popOver.openBy(oEvent.getSource());
                }
                else {
                    this._popOver.close();
                }
            },
            /**On Selection of Item in Add button */
            handleSelectPress: function (oEvent) {
                var selectedTitle = oEvent.getParameters().listItems[0].getTitle();
                var selectedProduct = that.byId("idConfigProd").getValue();
                var selectedProject = that.byId("idProjDet").getValue();
                this._popOver.close();
                sap.ui.getCore().byId("idList").removeSelections();
                that.byId("idToggleButton").setPressed(false);
                that.byId("idToggleButton1").setPressed(false);
                that.byId("idToggleButton2").setPressed(false);
                if (selectedProduct && selectedProject) {
                    // sap.ui.core.BusyIndicator.show();
                    if (selectedTitle === "Characteristic Value Replacement") {
                        that.oGModel.setProperty("/configProduct", selectedProduct);
                        that.oGModel.setProperty("/projectDetails", selectedProject);
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("CreateWizard", {}, true);
                    }
                    else if (selectedTitle === "Phase-Out") {
                        that.oGModel.setProperty("/configProduct", selectedProduct);
                        that.oGModel.setProperty("/projectDetails", selectedProject);
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("PhaseOutWizard", {}, true);
                    }
                    else if (selectedTitle === "Multiple Product Assignments") {
                        that.oGModel.setProperty("/configProduct", selectedProduct);
                        that.oGModel.setProperty("/projectDetails", selectedProject);
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("MultiProdAssign", {}, true);
                        if (this._valueHelpDialogProd) {
                            this._valueHelpDialogProd.destroy(true);
                            this._valueHelpDialogProd = "";
                        }
                    }
                }
                else if (selectedTitle === "Maintain Project Details") {
                    
                    that.oGModel.setProperty("/configProduct", selectedProduct);
                    that.oGModel.setProperty("/projectDetails", selectedProject);
                    var projDetTable = that.byId("idMPD").getItems();
                    that.projArray = [];
                    if (projDetTable.length === 0) {
                        var projectID = "PROJ" + "000001";
                        sap.ui.getCore().byId("idProjID").setValue(projectID);
                    }
                    else {
                        projDetTable.forEach(function (oItem) {
                            var item = oItem.getCells()[0].getText().slice(4)
                            that.projArray.push(item)
                        });
                        var maxNumber = that.maxNumber(that.projArray);
                        var incrementedNumber = that.incrmntNum(maxNumber);
                        var projectID = "PROJ" + incrementedNumber;
                        sap.ui.getCore().byId("idProjID").setValue(projectID);
                    }
                    this._valueHelpDialogProjectDet.open();
                }
                else {
                    MessageToast.show("Please select a Configurable Product/Project");
                }
            },

            /**On Selection of config product in prod dialog */
            handleSelection: function (oEvent) {
                var selectedItem = oEvent.getParameters().selectedItems[0].getTitle();
                that.byId("idConfigProd").setValue(selectedItem);
                sap.ui.getCore().byId("prodSlctListOD").getBinding("items").filter([]);
                sap.ui.getCore().byId("prodSlctListOD").clearSelection();
            },

            /**On Press of Reset Button */
            
            onResetData: function () {
                that.byId("idConfigProd").setValue("");
                that.byId("idProjDet").setValue("");
                that.byId("newProjSearch").setValue("");
                that.byId("newCharSearch").setValue("");
                that.byId("newPhaseSearch").setValue("");
                that.byId("idOrderList").getBinding("items").filter([]);
                that.custModel.setData({ configProdResults: that.tabData });
                that.byId("idOrderList").setModel(that.custModel);
            },
            /**Handle Search  */
            oHomesearch: function (oEvent) {
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                // Location
                if (sId.includes("newCharSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery),
                                    new Filter("REF_PRODID", FilterOperator.Contains, sQuery),
                                    new Filter("REF_CHAR_VALUE", FilterOperator.Contains, sQuery),
                                    new Filter("REF_CHAR_NAME", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    that.byId("idOrderList").getBinding("items").filter(oFilters);
                }
              else if (sId.includes("newProjSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("PROJECT_ID", FilterOperator.Contains, sQuery),
                                    new Filter("PROJECT_DET", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    that.byId("idMPD").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("newPhaseSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("REF_PRODID", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_NUM", FilterOperator.Contains, sQuery),
                                    new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    that.byId("idPhaseOutList").getBinding("items").filter(oFilters);
                }
            },
            /**On Press of Go on home screem */
            onGetData: function () {
                var selectedProd = that.byId("idConfigProd").getValue();
                that.proDetails = [];
                that.proDetails = that.tabData;
                if (that.proDetails && that.proDetails.length > 0) {
                    that.proDetails = that.proDetails.filter(item => item.REF_PRODID === selectedProd);
                    that.custModel.setData({ configProdResults: that.proDetails });
                    that.byId("idOrderList").setModel(that.custModel);
                }
                else {
                    MessageToast.show("No new characteristics for the selected product");
                }
            },/**On change of switch button in MultiProjDetails fragment */
            onSwitchChange: function (oEvent) {
                var switchState = oEvent.getSource().getState();
                if (switchState === true) {
                    sap.ui.getCore().byId("idRelDate").setDateValue(new Date());
                }
                else {
                    sap.ui.getCore().byId("idRelDate").setDateValue();
                }
            },
            /**On press of Cancle in MultiProjDetails */
            onProjCancel: function () {
                this._valueHelpDialogProjectDet.close();
                if (this._valueHelpDialogProjectDet) {
                    this._valueHelpDialogProjectDet.destroy(true);
                    this._valueHelpDialogProjectDet = "";
                }
            },
            /**On click of save in MultiProjdetails */
            onProjSave: function () {
                var object = {}, finalArray = [];
                var projID = sap.ui.getCore().byId("idProjID").getValue();
                var projDetails = sap.ui.getCore().byId("idProjDesc").getValue();
                var projStatus = sap.ui.getCore().byId("idSwitchState").getState();
                if (projStatus === true) {
                    var releaseDate = sap.ui.getCore().byId("idRelDate").getDateValue();
                }
                else {
                    var releaseDate = null;
                }

                object = {
                    PROJECT_ID: projID,
                    PROJECT_DET: projDetails,
                    PROJ_STATUS: projStatus,
                    RELEASE_DATE: releaseDate,
                }
                finalArray.push(object);
                this.getOwnerComponent().getModel("BModel").callFunction("/saveProjDetails", {
                    method: "GET",
                    urlParameters: {
                        NEWPROJDET: JSON.stringify(finalArray)
                    },
                    success: function (oData) {
                        MessageToast.show(oData.saveProjDetails);
                        that.onProjCancel();
                        that.onAfterRendering();
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to save project details");
                    },
                });
            },
            /**On Press of Edit in Maintain project Details tab */
            onEditPress: function () {
                var tabItemSelected = that.byId("idMPD").getSelectedItem();
                if (tabItemSelected === null) {
                    MessageToast.show("Please select an item to edit");
                }
                else {
                    if (!this._valueHelpDialogProjectDet) {
                        this._valueHelpDialogProjectDet = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.MultiProjectDetails",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogProjectDet);
                        this._valueHelpDialogProjectDet.open();
                    }
                    else {
                        this._valueHelpDialogProjectDet.open();
                    }
                    var objectItems = tabItemSelected.getBindingContext().getObject();
                    sap.ui.getCore().byId("idProjID").setValue(objectItems.PROJECT_ID);
                    sap.ui.getCore().byId("idProjDesc").setValue(objectItems.PROJECT_DET);

                    if (objectItems.PROJ_STATUS === "Active") {
                        sap.ui.getCore().byId("idSwitchState").setState(true);
                    }
                    else {
                        sap.ui.getCore().byId("idSwitchState").setState(false);
                    }
                    if (objectItems.RELEASE_DATE) {
                        sap.ui.getCore().byId("idRelDate").setValue(objectItems.RELEASE_DATE.toLocaleDateString());
                    }

                }
            },
            /**Finding out Max number in Array */
            maxNumber: function (oEvent) {
                // Convert each element to a number
                let numArray = oEvent.map(function (str) {
                    return parseInt(str, 10);
                });
                // Find the maximum number
                let maxNum = Math.max(...numArray);

                // Convert the maximum number back to a string with leading zeros
                // Determine the length of the original strings
                let length = oEvent[0].length;

                // Convert the max number to a string and pad with leading zeros
                let maxString = maxNum.toString().padStart(length, '0');
                return maxString;
            },
            /**Incremental Number */
            incrmntNum: function (oEvent) {
                // Convert the string to a number and increment it
                let num = parseInt(oEvent, 10) + 1;

                // Determine the number of leading zeros in the original string
                let leadingZeros = oEvent.length - num.toString().length;

                // Create a string with the incremented number and add leading zeros
                let incrementedStr = '0'.repeat(leadingZeros) + num;

                return incrementedStr;
            },
            handleProjSelection:function(oEvent){
                var selectedItemz = oEvent.getParameters().selectedItem.getTitle();
                that.byId("idProjDet").setValue(selectedItemz);
                sap.ui.getCore().byId("idProjDetailsFrag").getBinding("items").filter([]);
                sap.ui.getCore().byId("idProjDetailsFrag").clearSelection();
            },
            /**Search in Projects dialog */
            handleCharSearch:function(oEvent){
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            // Check if search filter is to be applied
            sQuery = sQuery ? sQuery.trim() : "";
            // Location
            if (sId.includes("idProjDetailsFrag")) {
                if (sQuery !== "") {
                    oFilters.push(
                        new Filter({
                            filters: [
                                new Filter("PROJECT_ID", FilterOperator.Contains, sQuery),
                                new Filter("PROJECT_DET", FilterOperator.Contains, sQuery)
                            ],
                            and: false,
                        })
                    );
                }
                sap.ui.getCore().byId("idProjDetailsFrag").getBinding("items").filter(oFilters);
            }
            else if (sId.includes("prodSlctListOD")) {
                if (sQuery !== "") {
                    oFilters.push(
                        new Filter({
                            filters: [
                                new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                new Filter("PROD_DESC", FilterOperator.Contains, sQuery)
                            ],
                            and: false,
                        })
                    );
                }
                sap.ui.getCore().byId("prodSlctListOD").getBinding("items").filter(oFilters);
            }
            }
        });
    });
