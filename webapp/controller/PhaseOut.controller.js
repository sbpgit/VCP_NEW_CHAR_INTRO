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
        var that, oGModel,
            oData = {
                backButtonVisible: false,
                finishButtonVisible: false,
                nextButtonVisible: true
            };
        return Controller.extend("vcpapp.vcpnpicharvalue.controller.PhaseOut", {
            onInit: function () {
                that = this;

            },
            onAfterRendering: function () {
                that.totalTabData = [];
                that.prodModelPhase = new JSONModel();
                that.prodModelPhase.setSizeLimit(1000);
                that.listModePhase = new JSONModel();
                that.listModePhase.setSizeLimit(1000);
                that.locModel = new JSONModel();
                that.locModel.setSizeLimit(1000);
                that.ProdModel = new JSONModel();
                that.ProdModel.setSizeLimit(1000);
                that.locProdModel = new JSONModel();
                that.locProdModel.setSizeLimit(1000);
                that.configProdModel = new JSONModel();
                that.configProdModel.setSizeLimit(1000)
                that.charNamePhase = new JSONModel();
                that.charNamePhase.setSizeLimit(1000000);
                that.charValModel = new JSONModel();
                that.charValModel.setSizeLimit(100000);
                that.oGModel = that.getOwnerComponent().getModel("oGModel");
                that.selectedConfigProductOut = that.oGModel.getProperty("/configProduct");
                that.selectedProjectPhase = that.oGModel.getProperty("/projectDetails");
                if (that.selectedProjectPhase === undefined || that.selectedProjectPhase === "" || that.selectedProjectPhase === null) {
                    if (this._valueHelpDialogProd) {
                        that._valueHelpDialogProd.destroy(true);
                        that._valueHelpDialogProd = "";
                    }
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                    oRouter.navTo("RouteHome", {}, true);
                }
                else {
                    this._oCore = sap.ui.getCore();
                    if (!this._valueHelpDialogLocProd) {
                        this._valueHelpDialogLocProd = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.LocatioProd",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogLocProd);
                    }
                    if (!this._valueHelpDialogProdLoc) {
                        this._valueHelpDialogProdLoc = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.ProdLocation",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogProdLoc);
                    }
                    if (!this._valueHelpDialogPhaseOut) {
                        this._valueHelpDialogPhaseOut = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.PhaseOutStart",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogPhaseOut);
                    }
                    if (!this._valueHelpDialogProduct) {
                        this._valueHelpDialogProduct = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.ProdDialog",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogProduct);
                    }
                    if (!this._valueHelpCharName) {
                        this._valueHelpCharName = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.CharacteristicName",
                            this
                        );
                        this.getView().addDependent(this._valueHelpCharName);
                    }
                    if (!this._valueHelpDialogCharacter) {
                        this._valueHelpDialogCharacter = sap.ui.xmlfragment(
                            "vcpapp.vcpnpicharvalue.view.OldCharacteristicValues",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogCharacter);
                    }
                    that.oldCharVal1 = that.byId("idCharValuePhase");

                    var oModel1 = new JSONModel(),
                        oInitialModelState = Object.assign({}, oData);
                    oModel1.setData(oInitialModelState);
                    this.getView().setModel(oModel1);
                    that._oWizard = this.byId("PhaseOutWizard");
                    that._oWizard._getProgressNavigator().ontap = function () { };
                    that._iSelectedStepIndex = 0;
                    that._iNewSelectedIndex = 0;
                    that.oGModel.setProperty("/setStepPhase", "X");
                    that.handleButtonsVisibility1();
                    that.charValTabData = that.oGModel.getProperty("/charValTab");
                    that.phaseOutTabData = that.oGModel.getProperty("/phaseOutTab");

                }

            },
            /**On press of Back */
            onBackPhase: function () {
                that._oWizard.discardProgress(that._oWizard.getSteps()[0]);
                that.clearAllData();
                that.getView().getModel().setData(Object.assign({}, oData));
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("MaintainProject", {}, true);
                if (this._valueHelpDialogCharacter) {
                    that._valueHelpDialogCharacter.destroy(true);
                    that._valueHelpDialogCharacter = "";
                }
                if (this._valueHelpDialogPhaseOut) {
                    that._valueHelpDialogPhaseOut.destroy(true);
                    that._valueHelpDialogPhaseOut = "";
                }
                if (this._valueHelpDialogLocProd) {
                    that._valueHelpDialogLocProd.destroy(true);
                    that._valueHelpDialogLocProd = "";
                }
                if (this._valueHelpDialogProdLoc) {
                    that._valueHelpDialogProdLoc.destroy(true);
                    that._valueHelpDialogProdLoc = "";
                }
                if (this._valueHelpCharName) {
                    that._valueHelpCharName.destroy(true);
                    that._valueHelpCharName = "";
                }
                if (that._valueHelpDialogProduct) {
                    that._valueHelpDialogProduct.destroy(true);
                    that._valueHelpDialogProduct = "";
                }

                sap.ui.core.BusyIndicator.hide();
            },
            handleOldCharSelection: function (oEvent) {
                that.selectedItemsPhase = [], that.intChars = {};
                that.oldCharVal1 = that.byId("idCharValuePhase");
                that.oldCharVal1.removeAllTokens();
                sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter([]);
                that.selectedItemsPhase = oEvent.getParameter("selectedContexts");
                that.selectedItemsPhase.forEach(function (oItem) {
                    that.oldCharVal1.addToken(
                        new sap.m.Token({
                            key: oItem.getModel().getProperty(oItem.sPath).CHAR_VALUE,
                            text: oItem.getModel().getProperty(oItem.sPath).CHARVAL_DESC,
                            editable: false
                        })
                    );
                });
            },
            handleButtonsVisibility1: function () {
                var oModel = this.getView().getModel();
                switch (that._iSelectedStepIndex) {
                    case 0:
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/nextButtonEnabled", true);
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        break;
                    case "Characteristic Value Selection":
                        if (that.byId("idCharValuePhase").getTokens().length > 0) {
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", true);
                            oModel.setProperty("/finishButtonVisible", false);
                        }
                        else {
                            MessageToast.show("Please select atleast one Characteristic Value");
                        }
                        break;
                    case "Launch Dimension":
                        sap.ui.core.BusyIndicator.show();
                        that.combinedArray = [];
                        var items = that.byId("idDimenTablePhase").getItems();
                        if (items[0].getCells()[1].getTokens().length > 0 && items[1].getCells()[1].getTokens().length > 0) {
                            var locItems = items[0].getCells()[1].getTokens();
                            var prodItems = items[1].getCells()[1].getTokens();
                            if (locItems.length > 0 && prodItems.length > 0) {
                                that.locSelection.forEach(function(oItem){
                                    that.combinedArray.push(...that.prodSelection.filter(item => item.DEMAND_LOC === oItem.DEMAND_LOC));                                                
                                })
                            }
                            that.locProdModel.setData({ PhaseOutList: that.combinedArray });
                            that.byId("idPhaseOutTab").setModel(that.locProdModel);
                            that.byId("idPhaseOutDate").setMinDate(new Date());
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/finishButtonVisible", true);
                            sap.ui.core.BusyIndicator.hide();
                        }
                        else if (items[0].getCells()[1].getTokens().length === 0 && items[1].getCells()[1].getTokens().length === 0) {
                            that.combinedArray = [];
                            this.getOwnerComponent().getModel("BModel").read("/getfactorylocdesc", {
                                filters: [
                                    new Filter(
                                        "REF_PRODID",
                                        FilterOperator.EQ,
                                        that.selectedConfigProductOut
                                    ),
                                ],
                                success: function (oData1) {
                                    if (oData1.results.length > 0) {
                                        that.locDetails1 = [];
                                        that.locDetails1 = that.removeDuplicate(oData1.results,"DEMAND_LOC");
                                        sap.ui.getCore().byId("idLocSelect").setVisible(false);
                                        sap.ui.getCore().byId("idProdSelect").setVisible(true);
                                        that.getOwnerComponent().getModel("BModel").read("/getfactorylocdesc", {
                                            filters: [
                                                new Filter(
                                                    "REF_PRODID",
                                                    FilterOperator.EQ,
                                                    that.selectedConfigProductOut
                                                ),
                                            ],
                                            success: function (oData2) {
                                                if (oData2.results.length > 0) {
                                                    that.prods1 = [];
                                                    that.prods1 = oData2.results;
                                                    if (that.locDetails1.length > 0 && that.prods1.length > 0) {
                                                        that.locDetails1.forEach(function(oItem){
                                                            that.combinedArray.push(...that.prods1.filter(item => item.DEMAND_LOC === oItem.DEMAND_LOC));                                                
                                                        })
                                                    }
                                                    that.locProdModel.setData({ PhaseOutList: that.combinedArray });
                                                    that.byId("idPhaseOutTab").setModel(that.locProdModel);
                                                    that.byId("idPhaseOutDate").setMinDate(new Date());
                                                    that._oWizard.nextStep();
                                                    that._iNewSelectedIndex++
                                                    oModel.setProperty("/nextButtonVisible", false);
                                                    oModel.setProperty("/backButtonVisible", true);
                                                    oModel.setProperty("/finishButtonVisible", true);
                                                    sap.ui.core.BusyIndicator.hide();
                                                }
                                                else {
                                                    sap.ui.core.BusyIndicator.hide();
                                                    MessageToast.show("No Products available")
                                                }
                                            },
                                            error: function () {
                                                sap.ui.core.BusyIndicator.hide();
                                                MessageToast.show("Failed to get products");
                                            }
                                        });

                                    }
                                    else {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageToast.show("No Locations available")
                                    }
                                },
                                error: function () {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Failed to get Locations");
                                }
                            });
                        }
                        else if (items[0].getCells()[1].getTokens().length > 0 && items[1].getCells()[1].getTokens().length === 0 ||
                            items[0].getCells()[1].getTokens().length === 0 && items[1].getCells()[1].getTokens().length > 0) {
                            MessageToast.show("Please select Location/Product")
                        }
                        sap.ui.core.BusyIndicator.hide();
                        break;
                    default: break;
                }
            },

            onStep2Phase: function () {
                that.byId("idConfigPhase").setText(that.selectedConfigProductOutDESC);
                that.selectedItemsPhase.forEach(function (oItem) {
                    that.byId("idOldDimenPhase").addToken(
                        new sap.m.Token({
                            key: oItem.getObject().CHAR_VALUE,
                            text: oItem.getObject().CHARVAL_DESC,
                            editable: false
                        })
                    );
                });
                that.byId("idCharNameStep2").setText(that.selectedCharName);
                var object = { LAUNCH: [{ DIMENSIONS: 'Locations', VALUE: '', ROW: 1 }, { DIMENSIONS: 'Poducts', VALUE: '', ROW: 2 }] };
                that.listModePhase.setData({ dimenListPhase: object.LAUNCH });
                that.byId("idDimenTablePhase").setModel(that.listModePhase)
            },
            onDialogNextButton1: function () {
                that._iSelectedStepIndex = that._oWizard.getSteps()[that._iNewSelectedIndex].getTitle();
                that.handleButtonsVisibility1();
            },
            onDialogBackButton1: function () {
                that._iSelectedStepIndex = that._oWizard.getSteps()[that._iNewSelectedIndex].getTitle()
                that._oWizard.previousStep();
                that._iNewSelectedIndex--;
                var oModel = this.getView().getModel();
                switch (that._iSelectedStepIndex) {
                    case "Phase-Out Details Characteristic Value":
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/backButtonVisible", true);
                        oModel.setProperty("/finishButtonVisible", false);
                        that.locProdModel.setData({ PhaseOutList: that.combinedArray });
                        that.byId("idPhaseOutTab").setModel(that.locProdModel);
                        that.byId("idPhaseOutNew").removeAllTokens();
                        break;

                    case "Launch Dimension":
                        that.byId("idOldDimenPhase").removeAllTokens();
                        that.listModePhase.setData({ dimenListPhase: [] });
                        that.byId("idDimenTablePhase").setModel(that.listModePhase);
                        oModel.setProperty("/nextButtonEnabled", true);
                        sap.ui.getCore().byId("idProdSelect").getBinding("items").filter([]);
                        sap.ui.getCore().byId("idLocSelect").getBinding("items").filter([]);
                        that.ProdModel.setData({ setProds: [] });
                        sap.ui.getCore().byId("idProdSelect").setModel(that.ProdModel);
                        that.locModel.setData({ setLocation: [] });
                        sap.ui.getCore().byId("idLocSelect").setModel(that.locModel);
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        break;
                    default: break;
                }
            },
            /**On select of value help in table in step2*/
            handleValueHelpTable: function (oEvent) {
                that.oSource = oEvent.getSource();
                var oFilters=[];
                var table = that.byId("idDimenTablePhase");
                var selectedKey = oEvent.getSource().getEventingParent().getCells()[0].getText();
                if (selectedKey === "Locations") {
                    sap.ui.getCore().byId("idLocSelect").setVisible(true);
                    sap.ui.getCore().byId("idProdSelect").setVisible(false);
                    var dimTab = that.byId("idDimenTablePhase").getItems()[1].getCells()[1].getTokens();
                    oFilters.push(new Filter("REF_PRODID", FilterOperator.EQ, that.selectedConfigProductOut));                   
                    if(dimTab.length>0){
                        for(var i=0;i<dimTab.length;i++){
                            oFilters.push(new Filter("PRODUCT_ID", FilterOperator.EQ, dimTab[i].getKey()))
                        }
                    }
                    this.getOwnerComponent().getModel("BModel").read("/getfactorylocdesc", {
                        filters:oFilters,
                        success: function (oData1) {
                            if (oData1.results.length > 0) {
                                var location = that.removeDuplicate(oData1.results,"DEMAND_LOC");
                                that.locModel.setData({ setLocation: location });
                                sap.ui.getCore().byId("idLocSelect").setModel(that.locModel);
                            }
                            else {
                                MessageToast.show("No Locations available")
                            }
                        },
                        error: function () {
                            MessageToast.show("Failed to get Locations");
                        }
                    });

                    that._valueHelpDialogLocProd.open();
                }
                else {
                    oFilters=[];
                    var dimTab = that.byId("idDimenTablePhase").getItems()[0].getCells()[1].getTokens();
                    oFilters.push(new Filter("REF_PRODID", FilterOperator.EQ, that.selectedConfigProductOut));                   
                    if(dimTab.length>0){
                        for(var i=0;i<dimTab.length;i++){
                            oFilters.push(new Filter("DEMAND_LOC", FilterOperator.EQ, dimTab[i].getKey()))
                        }
                    }
                    sap.ui.getCore().byId("idLocSelect").setVisible(false);
                    sap.ui.getCore().byId("idProdSelect").setVisible(true);
                    this.getOwnerComponent().getModel("BModel").read("/getfactorylocdesc", {
                        filters:oFilters,
                        success: function (oData1) {
                            if (oData1.results.length > 0) {
                                var products = that.removeDuplicate(oData1.results,"PRODUCT_ID");
                                that.ProdModel.setData({ setProds: products });
                                sap.ui.getCore().byId("idProdSelect").setModel(that.ProdModel);
                            }
                            else {
                                MessageToast.show("No Products available")
                            }
                        },
                        error: function () {
                            MessageToast.show("Failed to get products");
                        }
                    });
                    that._valueHelpDialogProdLoc.open();
                }
            },
            /**On Selecting Location in Step2 Launch Dimension */
            handleLocSelection: function (oEvent) {
                that.locSelection=[];
                var object={};
                that.oSource.removeAllTokens();
                sap.ui.getCore().byId("idLocSelect").getBinding("items").filter([]);
                var selectedItem = oEvent.getParameter("selectedContexts");
                selectedItem.forEach(function (oItem) {
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: oItem.getModel().getProperty(oItem.sPath).DEMAND_LOC,
                            text: oItem.getModel().getProperty(oItem.sPath).DEMAND_DESC,
                            editable: false
                        })
                    );
                    object={
                        FACTORY_LOC : oItem.getModel().getProperty(oItem.sPath).FACTORY_LOC,
                        LOCATION_DESC : oItem.getModel().getProperty(oItem.sPath).LOCATION_DESC,
                        PLAN_LOC :  oItem.getModel().getProperty(oItem.sPath).PLAN_LOC,
                        PLANLOC_DESC :  oItem.getModel().getProperty(oItem.sPath).PLANLOC_DESC,
                        DEMAND_LOC :  oItem.getModel().getProperty(oItem.sPath).DEMAND_LOC,
                        DEMAND_DESC :  oItem.getModel().getProperty(oItem.sPath).DEMAND_DESC,
                        PRODUCT_ID :  oItem.getModel().getProperty(oItem.sPath).PRODUCT_ID,
                        PROD_DESC :  oItem.getModel().getProperty(oItem.sPath).PROD_DESC,
                        REF_PRODID :  oItem.getModel().getProperty(oItem.sPath).REF_PRODID,
                    }
                    that.locSelection.push(object);
                    object={};
                });
            },
            /**On Selecting Productt in Step2 Launch Dimension */
            handleProdSelection: function (oEvent) {
                that.prodSelection=[];var object={};
                that.oSource.removeAllTokens();
                sap.ui.getCore().byId("idProdSelect").getBinding("items").filter([]);
                var selectedItem = oEvent.getParameter("selectedContexts");
                selectedItem.forEach(function (oItem) {
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: oItem.getModel().getProperty(oItem.sPath).PRODUCT_ID,
                            text: oItem.getModel().getProperty(oItem.sPath).PROD_DESC,
                            editable: false
                        })
                    );
                    object={
                        FACTORY_LOC : oItem.getModel().getProperty(oItem.sPath).FACTORY_LOC,
                        LOCATION_DESC : oItem.getModel().getProperty(oItem.sPath).LOCATION_DESC,
                        PLAN_LOC :  oItem.getModel().getProperty(oItem.sPath).PLAN_LOC,
                        PLANLOC_DESC :  oItem.getModel().getProperty(oItem.sPath).PLANLOC_DESC,
                        DEMAND_LOC :  oItem.getModel().getProperty(oItem.sPath).DEMAND_LOC,
                        DEMAND_DESC :  oItem.getModel().getProperty(oItem.sPath).DEMAND_DESC,
                        PRODUCT_ID :  oItem.getModel().getProperty(oItem.sPath).PRODUCT_ID,
                        PROD_DESC :  oItem.getModel().getProperty(oItem.sPath).PROD_DESC,
                        REF_PRODID :  oItem.getModel().getProperty(oItem.sPath).REF_PRODID,
                    }
                    that.prodSelection.push(object);
                    object={};
                });
            },
            /**On Press of step 3 */
            onStep3Phase: function () {
                that.combinedArray = [];
                var newObject = {}, locArray = [], prodArray = [];
                that.byId("idPhaseOutProd").setText(that.selectedConfigProductOutDESC);
                that.selectedItemsPhase.forEach(function (oItem) {
                    that.byId("idPhaseOutNew").addToken(
                        new sap.m.Token({
                            key: oItem.getObject().CHAR_VALUE,
                            text: oItem.getObject().CHARVAL_DESC,
                            editable: false
                        })
                    );
                });
                that.byId("idCharNameStep3").setText(that.selectedCharName);

            },
            /**On Change of Table Item in Phase In */
            onPhaseOutChange: function () {
                var selectedItems = that.byId("idPhaseOutTab").getSelectedItems();
                if (selectedItems.length === 1) {
                    that.byId("idEditBtn").setEnabled(true);
                }
                else {
                    that.byId("idEditBtn").setEnabled(false);
                }
            },
            /**On Press of Edit button in Phase step 3 */
            onEditPhaseOutPressed: function () {
                var selectedObject = that.byId("idPhaseOutTab").getSelectedItems();
                sap.ui.getCore().byId("idLAunchText1").setValue(selectedObject[0].getCells()[0].getText());
                sap.ui.getCore().byId("idLocDesc1").setValue(selectedObject[0].getCells()[1].getText());
                sap.ui.getCore().byId("idProdId1").setValue(selectedObject[0].getCells()[2].getText());
                sap.ui.getCore().byId("idProdDesc1").setValue(selectedObject[0].getCells()[3].getText());
                that._valueHelpDialogPhaseOut.open();
                sap.ui.getCore().byId("idPhaseOutPhase").setTitle("Phase-Out Details");

            },
            onPhaseOutCancel: function () {
                that._valueHelpDialogPhaseOut.close();
            },
            /**On Change of Date in From Field in PhaseOutSTart Fragment */
            onPhaseOutDate: function (oEvent) {
                var selectedDate = oEvent.getSource().getDateValue();
                sap.ui.getCore().byId("idPhaseOutTo").setMinDate(selectedDate);
                sap.ui.getCore().byId("idPhaseOutTo").setEnabled(true);
            },
            /**On Ok Press in PhaseOutStart Fragment */
            onPhaseOutPress: function (oEvent) {
                var selectedLoc = sap.ui.getCore().byId("idLAunchText1").getValue();
                var selectedLocDesc = sap.ui.getCore().byId("idLocDesc1").getValue();
                var selectedProdId = sap.ui.getCore().byId("idProdId1").getValue();
                var selectedProdDesc = sap.ui.getCore().byId("idProdDesc1").getValue();
                var selectedPhaseOutDate = sap.ui.getCore().byId("idPhaseOutFrom").getValue();
                var selectedPhaseOutDateTo = sap.ui.getCore().byId("idPhaseOutTo").getValue();

                that.combinedArray = that.combinedArray.map(item => {
                    if (item.LOCATION_ID === selectedLoc && item.LOCATION_DESC === selectedLocDesc && item.PROD_ID === selectedProdId
                        && item.PROD_DESC === selectedProdDesc) {
                        return {
                            ...item,
                            LOCATION_ID: selectedLoc,
                            LOCATION_DESC: selectedLocDesc,
                            PROD_ID: selectedProdId,
                            PROD_DESC: selectedProdDesc,
                            PHASE_OUT_START: selectedPhaseOutDate,
                            PHASE_OUT_END: selectedPhaseOutDateTo
                        };
                    } else {
                        return item; // Keep the item unchanged
                    }
                });
                that.locProdModel.setData({ PhaseOutList: that.combinedArray });
                that.byId("idPhaseOutTab").setModel(that.locProdModel);
                sap.ui.getCore().byId("idPhaseOutFrom").setValue();
                sap.ui.getCore().byId("idPhaseOutFrom").setValue();
                sap.ui.getCore().byId("idPhaseOutTo").setEnabled(false);
                that._valueHelpDialogPhaseOut.close();
            },
            /**On press of finish in last step */
            handleWizardSubmit1: function () {
                var oTable = this.byId("idPhaseOutTab");
                var aItems = oTable.getItems();
                var bIsEmpty = false;
                aItems.forEach(function (oItem) {
                    var aCells = oItem.getCells();
                    aCells.forEach(function (oCell) {
                        if (oCell instanceof sap.m.Text) {
                            if (oCell.getText().trim() === "") { // Check if the text content is empty
                                bIsEmpty = true;
                                return false; // Break out of inner loop
                            }
                        }
                        else if (oCell instanceof sap.m.DatePicker) {
                            if (oCell.getDateValue() === null || oCell.getDateValue() === "") {
                                bIsEmpty = true;
                                return false;
                            }
                        }
                    });
                    if (bIsEmpty) {
                        return false; // Break out of outer loop
                    }
                });

                if (bIsEmpty) {
                    return MessageToast.show("At least one of the row's data is empty. Please fill in all the details.");
                }
                else {
                    var object = {}, finalArray = [];
                    var tableItemsStep3 = that.byId("idOldDimenPhase").getTokens();
                    for (var i = 0; i < that.selectedItemsPhase.length; i++) {
                        for (var j = 0; j < aItems.length; j++) {
                            object = {
                                PROJECT_ID: that.selectedProjectPhase,
                                REF_PRODID: that.selectedConfigProductOut,
                                CHAR_NUM: that.selectedItemsPhase[i].getModel().getProperty(that.selectedItemsPhase[i].sPath).CHAR_NAME,
                                CHAR_VALUE: that.selectedItemsPhase[i].getModel().getProperty(that.selectedItemsPhase[i].sPath).CHAR_VALUE,
                                CHARVAL_DESC: that.selectedItemsPhase[i].getModel().getProperty(that.selectedItemsPhase[i].sPath).CHARVAL_DESC,
                                REF_PROD_DESC: that.selectedProdDesc,
                                CHARNUM_DESC: that.selectedItemsPhase[i].getModel().getProperty(that.selectedItemsPhase[i].sPath).CHAR_DESC,
                                PHASE_OUT_START: aItems[j].getCells()[4].getDateValue(),
                                LOCATION_ID: aItems[j].getCells()[0].getText(),
                                PRODUCT_ID: aItems[j].getCells()[2].getText(),
                                LOCATION_DESC: aItems[j].getCells()[1].getText(),
                                PRODUCT_DESC: aItems[j].getCells()[3].getText()
                            }
                            finalArray.push(object);
                        }
                    }
                    console.log(JSON.stringify(finalArray));
                    this.getOwnerComponent().getModel("BModel").callFunction("/savePhaseOutCharValDetails", {
                        method: "GET",
                        urlParameters: {
                            PHASEOUTDATA: JSON.stringify(finalArray)
                        },
                        success: function (oData1) {
                            if (oData1.savePhaseOutCharValDetails.includes("Successfully")) {
                                that.clearAllData();
                                that.onAfterRendering();
                                that.getView().getModel().setData(Object.assign({}, oData));
                                that.onBackPhase();
                                setTimeout(function () { MessageToast.show(oData1.savePhaseOutCharValDetails) }, 1000);
                            }
                            else {
                                MessageToast.show(oData1.savePhaseOutCharValDetails);
                            }
                        },
                        error: function (error) {
                            MessageToast.show("Failed to save new phase out details");
                        }
                    });
                }
            },

            /**Clearing all Data */
            clearAllData: function () {
                /**Clearing data in Step 1 */
                // that.byId("idConfigTextPhase").setText();
                that.byId("ConfigProdPhase").setValue();
                that.byId("idCharValuePhase").removeAllTokens();
                that.byId("idCharNamePhase").setValue();
                that.byId("idCharNamePhase").setEnabled(false);
                that.byId("idCharValuePhase").setEnabled(false)

                /**Clearing data in Step 2 */
                that.byId("idConfigPhase").setText();
                that.byId("idOldDimenPhase").removeAllTokens();
                that.listModePhase.setData({ dimenListPhase: [] });
                that.byId("idDimenTablePhase").setModel(that.listModePhase)

                /**Clearing data in Step 3 */
                that.byId("idPhaseOutProd").setText();
                that.byId("idPhaseOutNew").removeAllTokens();
                that.locProdModel.setData({ PhaseOutList: [] });
                that.byId("idPhaseOutTab").setModel(that.locProdModel);
            },
            handleCharSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                if (sId.includes("idCharOldSelect")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery),
                                    new Filter("CHARVAL_DESC", FilterOperator.Contains, sQuery),
                                    new Filter("CHARVAL__NUM", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("prodSlctListOD")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("prodSlctListOD").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("idCharNameSelect")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("CHAR_NAME", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_NUM", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_DESC", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idCharNameSelect").getBinding("items").filter(oFilters);
                }
            },
            /**Handle Search in fragment */
            handleSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                // Location
                if (sId.includes("idLocSelect")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                                    new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idLocSelect").getBinding("items").filter(oFilters);
                }
                else if (sId.includes("idProdSelect")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                    new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idProdSelect").getBinding("items").filter(oFilters);
                }
            },
            /**On Press of cancel in any Step */
            handleWizardCancel1: function () {
                this._handleMessageBoxOpen("Are you sure you want to cancel the process?", "warning");
            },
            _handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
                MessageBox[sMessageBoxType](sMessage, {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            that._oWizard.discardProgress(that._oWizard.getSteps()[0]);
                            that.clearAllData();
                            that.onAfterRendering();
                            this.getView().getModel().setData(Object.assign({}, oData));
                        }
                    }.bind(this)
                });
            },
            discardProgress: function () {
                var oModel = this.getView().getModel();
                that._oWizard.discardProgress(this.byId("idWizardStep1"));
                var clearContent = function (aContent) {
                    for (var i = 0; i < aContent.length; i++) {
                        if (aContent[i].setValue) {
                            aContent[i].setValue("");
                        }

                        if (aContent[i].getContent) {
                            clearContent(aContent[i].getContent());
                        }
                    }
                };
                clearContent(that._oWizard.getSteps());
            },
            /**ON Selection of config product */
            handleSelection: function (oEvent) {
                sap.ui.core.BusyIndicator.show()
                var selectedItem = oEvent.getParameters().selectedItems[0].getDescription();
                var selectedItemDesc = oEvent.getParameters().selectedItems[0].getTitle();
                that.byId("ConfigProdPhase").setValue(selectedItemDesc);
                that.selectedConfigProductOut = selectedItem;
                that.selectedConfigProductOutDESC = selectedItemDesc;
                that.selectedProdDesc = selectedItemDesc;
                sap.ui.getCore().byId("prodSlctListOD").getBinding("items").filter([]);
                sap.ui.getCore().byId("prodSlctListOD").clearSelection();
                that.getOwnerComponent().getModel("BModel").read("/getCharType", {
                    filters: [
                        new Filter(
                            "PRODUCT_ID",
                            FilterOperator.EQ,
                            selectedItem
                        ),
                        new Filter(
                            "CHAR_TYPE",
                            FilterOperator.EQ,
                            "CHAR"
                        ),
                    ],
                    success: function (oData1) {
                        if (oData1.results.length > 0) {
                            that.newChars = [];
                            that.newChars = oData1.results;
                            var charNames = that.removeDuplicate(oData1.results, 'CHAR_NAME');
                            that.charNamePhase.setData({ setCharacteristicNames: charNames })
                            sap.ui.getCore().byId("idCharNameSelect").setModel(that.charNamePhase);
                            that.byId("idCharNamePhase").setEnabled(true);
                            sap.ui.core.BusyIndicator.hide()
                        }
                        else {
                            that.charNamePhase.setData({ setCharacteristicNames: [] })
                            sap.ui.getCore().byId("idCharNameSelect").setModel(that.charNamePhase);
                            that.byId("idCharNamePhase").setEnabled(false);
                            sap.ui.core.BusyIndicator.hide()
                            MessageToast.show("No Characteristcs available for this product.")
                        }

                        that.byId("idCharNamePhase").setValue();
                        that.byId("idCharValuePhase").setEnabled(false);
                        that.byId("idCharValuePhase").removeAllTokens();
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get characteristics");
                    }
                });

            },
            /**On Press of value help in Config Prod Input */
            handleValueHelpPhase: function (oEvent) {
                sap.ui.core.BusyIndicator.show()
                var sId = oEvent.getParameter("id");
                // Prod Dialog
                if (sId.includes("ConfigProd")) {
                    this.getOwnerComponent().getModel("BModel").read("/getProducts", {
                        method: "GET",
                        success: function (oData) {
                            that.configProdModel.setData({ configProdRes: oData.results });
                            sap.ui.getCore().byId("prodSlctListOD").setModel(that.configProdModel);
                            that._valueHelpDialogProduct.open();
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function () {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to get configurable products");
                        },
                    });

                }
                else if (sId.includes("idCharNamePhase")) {
                    sap.ui.core.BusyIndicator.hide()
                    that._valueHelpCharName.open();
                }
                else if (sId.includes("idCharValuePhase")) {
                    sap.ui.core.BusyIndicator.hide()
                    that._valueHelpDialogCharacter.open();
                }
            },
            /**Remoing duplicates function */
            removeDuplicate: function (array, key) {
                var check = new Set();
                return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
            },

            /**On Selection of Char Name */
            handleCharNameSelection: function (oEvent) {
                sap.ui.core.BusyIndicator.show()
                var object = {}, charData = [];
                var selectedName = oEvent.getParameters().selectedItems[0].getTitle();
                that.selectedCharName = selectedName;
                var selectedNum = oEvent.getParameters().selectedItems[0].getDescription();
                that.PhaseoUtTab = [], that.charValTab = [], that.finalData = [], that.allCharacterstics = [];
                that.allCharacterstics = that.newChars;
                var allChars = that.newChars.filter(a => a.CHAR_NAME === selectedName && a.CHAR_NUM === selectedNum);
                that.charValTab = that.charValTabData.filter(a => a.PROJECT_ID === that.selectedProjectPhase
                    && a.REF_PRODID === that.selectedConfigProductOut
                    && a.REF_CHAR_NAME === selectedName && a.CHAR_NUM === selectedNum);
                that.PhaseoUtTab = that.phaseOutTabData.filter(a => a.PROJECT_ID === that.selectedProjectPhase
                    && a.REF_PRODID === that.selectedConfigProductOut
                    && a.CHAR_NUM === selectedNum);
                that.charValTab.forEach(function (oItem) {
                    object.CHAR_VALUE = oItem.CHAR_VALUE;
                    charData.push(object);
                    object = {};
                });
                that.PhaseoUtTab.forEach(function (oItem) {
                    object.CHAR_VALUE = oItem.CHAR_VALUE;
                    charData.push(object);
                    object = {};
                })
                charData = that.removeDuplicate(charData, "CHAR_VALUE");
                that.finalData = that.getUniqueValues(charData, allChars);
                that.charValModel.setData({ setOldCharacteristics: that.finalData })
                sap.ui.getCore().byId("idCharOldSelect").setModel(that.charValModel);
                that.byId("idCharValuePhase").setEnabled(true);
                that.byId("idCharNamePhase").setValue(selectedName);
                sap.ui.getCore().byId("idCharNameSelect").getBinding("items").filter([]);
                sap.ui.core.BusyIndicator.hide()
            },
            getUniqueValues: function (array1, array2) {
                const array2Ids = array2.map(item => item.CHAR_VALUE);
                const uniqueToArray1 = array1.filter(item => !array2Ids.includes(item.CHAR_VALUE));
                // Filter array2 elements that are not present in array1 based on 'id'
                const uniqueToArray2 = array2.filter(item => !array1.map(obj => obj.CHAR_VALUE).includes(item.CHAR_VALUE));
                // Combine both unique arrays to get the result
                const uniqueArray = uniqueToArray1.concat(uniqueToArray2);
                return uniqueArray;
            },
            /**ON Change of date in Step3 */
            onDateChangePhase: function (oEvent) {
                var selectedDate = oEvent.getSource().getDateValue();
                var tabItems = that.byId("idPhaseOutTab").getItems();
                for (var s = 0; s < tabItems.length; s++) {
                    tabItems[s].getCells()[4].setDateValue(selectedDate);
                    tabItems[s].getCells()[4].setMinDate(new Date());
                }

            }
        });
    });