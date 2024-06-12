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
                that.oGModel = that.getOwnerComponent().getModel("oGModel");
            },
            onAfterRendering: function () {
                that.selectedConfigProductOut = that.oGModel.getProperty("/configProduct");
                that.selectedProjectPhase = that.oGModel.getProperty("/projectDetails");
                that.byId("idConfigTextPhase").setText(that.selectedConfigProductOut);
                this.getOwnerComponent().getModel("BModel").read("/getProdClsChar", {
                    filters: [
                        new Filter(
                            "PRODUCT_ID",
                            FilterOperator.EQ,
                            that.selectedConfigProductOut
                        ),
                    ],
                    success: function (oData1) {
                        that.allCharactersticsPhase = [], that.aDistinctPhase = [];
                        that.aDistinctPhase = oData1.results;
                        that.prodModelPhase.setData({ setOldCharacteristics: that.aDistinctPhase })
                        sap.ui.getCore().byId("idCharOldSelect").setModel(that.prodModelPhase);
                    },
                    error: function () {
                        MessageToast.show("Failed to get characteristics");
                    }
                });
                this._oCore = sap.ui.getCore();
                if (!this._valueHelpDialogCharacter) {
                    this._valueHelpDialogCharacter = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.OldCharacteristicValues",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogCharacter);
                }
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
                that.oldCharVal1 = that.byId("idCharValuePhase");

                var oModel1 = new JSONModel(),
                    oInitialModelState = Object.assign({}, oData);
                oModel1.setData(oInitialModelState);
                this.getView().setModel(oModel1);
                that._oWizard = this.byId("PhaseOutWizard");
                that._oWizard._getProgressNavigator().ontap = function(){};
                that._iSelectedStepIndex = 0;
                that._iNewSelectedIndex=0;
                that.oGModel.setProperty("/setStepPhase", "X");
                that.handleButtonsVisibility1();
            },
             /**On press of Back */
             onBackPhase: function () {
                that._oWizard.discardProgress(that._oWizard.getSteps()[0]);
                that.clearAllData();
                that.getView().getModel().setData(Object.assign({}, oData));
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("RouteHome", {}, true);
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
                sap.ui.core.BusyIndicator.hide();
            },
            handleOldCharSelection: function (oEvent) {
                that.selectedItemsPhase = [], that.intChars = {};
                that.oldCharVal1.removeAllTokens();
                sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter([]);
                that.selectedItemsPhase = oEvent.getParameters().selectedItems;
                that.selectedItemsPhase.forEach(function (oItem) {
                    that.oldCharVal1.addToken(
                        new sap.m.Token({
                            key: oItem.getTitle(),
                            text: oItem.getTitle(),
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
                        var tabItems = this.byId("idDimenTablePhase").getItems();
                        var bIsEmpty = false;
                        for (var i = 0; i < tabItems.length; i++) {
                            if (tabItems[i].getCells()[1].getTokens().length === 0) {
                                bIsEmpty = true;
                                break;
                                // return false
                            }
                        }
                        if (bIsEmpty) {
                            return MessageToast.show("At least one of the row's data is empty. Please fill in all the details.");
                        } else {
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/finishButtonVisible", true);
                            break;
                        }
                    default: break;
                }
            },
            handleValueHelpPhase: function (oEvent) {
                var sId = oEvent.getParameter("id");
                if (sId.includes("idCharValuePhase")) {
                    that._valueHelpDialogCharacter.open();
                }
                else if (sId.includes("")) {
                    that._valueHelpDialogOldCharacter.open();
                }
            },
            onStep2Phase: function () {
                that.byId("idConfigPhase").setText(that.selectedConfigProductOut);
                that.selectedItemsPhase.forEach(function (oItem) {
                    that.byId("idOldDimenPhase").addToken(
                        new sap.m.Token({
                            key: oItem.getTitle(),
                            text: oItem.getTitle(),
                            editable: false
                        })
                    );
                });
                var object = { LAUNCH: [{ DIMENSIONS: 'LOCATION_ID', VALUE: '', ROW: 1 }, { DIMENSIONS: 'PRODUCT_ID', VALUE: '', ROW: 2 }] };
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
                        // that.selectedItemsPhase=[];
                        that.byId("idPhaseOutNew").removeAllTokens();
                        break;
                    
                    case "Launch Dimension":
                        // that.selectedItemsPhase=[];
                        that.byId("idOldDimenPhase").removeAllTokens();
                        that.listModePhase.setData({ dimenListPhase: [] });
                        that.byId("idDimenTablePhase").setModel(that.listModePhase);
                        oModel.setProperty("/nextButtonEnabled", true);
                        sap.ui.getCore().byId("idLocSelect").clearSelection();
                        sap.ui.getCore().byId("idProdSelect").clearSelection();
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        break;
                        default: break;
                }
            },
            /**On select of value help in table in step2*/
            handleValueHelpTable: function (oEvent) {
                that.oSource = oEvent.getSource();
                var table = that.byId("idDimenTablePhase");
                var selectedKey = oEvent.getSource().getEventingParent().getCells()[0].getText();
                if (selectedKey === "LOCATION_ID") {
                    sap.ui.getCore().byId("idLocSelect").setVisible(true);
                    sap.ui.getCore().byId("idProdSelect").setVisible(false);
                    this.getOwnerComponent().getModel("BModel").read("/getLocation", {
                        success: function (oData1) {
                            if (oData1.results.length > 0) {
                                that.locModel.setData({ setLocation: oData1.results });
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
                    sap.ui.getCore().byId("idLocSelect").setVisible(false);
                    sap.ui.getCore().byId("idProdSelect").setVisible(true);
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
                                that.ProdModel.setData({ setProds: oData1.results });
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
                that.oSource.removeAllTokens();
                var selectedItem = oEvent.getParameters().selectedItems;
                selectedItem.forEach(function (oItem) {
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: oItem.getDescription(),
                            text: oItem.getTitle(),
                            editable: false
                        })
                    );
                });
            },
            /**On Selecting Productt in Step2 Launch Dimension */
            handleProdSelection: function (oEvent) {
                that.oSource.removeAllTokens();
                var selectedItem = oEvent.getParameters().selectedItems;
                selectedItem.forEach(function (oItem) {
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: oItem.getDescription(),
                            text: oItem.getTitle(),
                            editable: false
                        })
                    );
                });
            },
            /**On Press of step 3 */
            onStep3Phase: function () {
                that.combinedArray = [];
                var newObject = {}, locArray = [], prodArray = [];
                that.byId("idPhaseOutProd").setValue(that.selectedConfigProductOut);
                that.selectedItemsPhase.forEach(function (oItem) {
                    that.byId("idPhaseOutNew").addToken(
                        new sap.m.Token({
                            key: oItem.getTitle(),
                            text: oItem.getTitle(),
                            editable: false
                        })
                    );
                });
                var items = that.byId("idDimenTablePhase").getItems();
                var locItems = items[0].getCells()[1].getTokens();
                var prodItems = items[1].getCells()[1].getTokens();
                if (locItems.length > 0) {
                    for (var i = 0; i < locItems.length; i++) {
                        newObject = {
                            LOCATION_ID: locItems[i].getText(),
                            LOCATION_DESC: locItems[i].getKey(),
                            PHASE_IN: '',
                            PHASE_OUT: ''
                        }
                        locArray.push(newObject);
                    }
                }
                if (prodItems.length > 0) {
                    for (var i = 0; i < prodItems.length; i++) {
                        newObject = {
                            PROD_ID: prodItems[i].getText(),
                            PROD_DESC: prodItems[i].getKey()
                        }
                        prodArray.push(newObject);
                    }
                }
                if (locArray.length > 0 && prodArray.length > 0) {

                    locArray.forEach(item1 => {
                        prodArray.forEach(item2 => {
                            that.combinedArray.push({ ...item1, ...item2 });
                        });
                    });
                }
                that.locProdModel.setData({ PhaseOutList: that.combinedArray });
                that.byId("idPhaseOutTab").setModel(that.locProdModel);
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
                        if(oCell instanceof sap.m.Text){
                        if (oCell.getText().trim() === "") { // Check if the text content is empty
                            bIsEmpty = true;
                            return false; // Break out of inner loop
                        }
                    }
                    else if(oCell instanceof sap.m.DatePicker){
                        if(oCell.getDateValue() === null || oCell.getDateValue()===""){
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
                                PROJECT_ID : that.selectedProjectPhase,
                                REF_PRODID: that.selectedConfigProductOut,
                                CHAR_NUM: that.selectedItemsPhase[i].getBindingContext().getObject().CHAR_NUM,
                                CHAR_VALUE: that.selectedItemsPhase[i].getTitle(),
                                PHASE_OUT_START: aItems[j].getCells()[4].getDateValue(),
                                PHASE_OUT_END: aItems[j].getCells()[5].getDateValue(),
                                LOCATION_ID: aItems[j].getCells()[0].getText(),
                                PRODUCT_ID: aItems[j].getCells()[2].getText()
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
            clearAllData:function(){
                /**Clearing data in Step 1 */
                that.byId("idConfigTextPhase").setText();
                that.byId("idCharValuePhase").setTokens();

                /**Clearing data in Step 2 */
                that.byId("idConfigPhase").setText();
                that.byId("idOldDimenPhase").setTokens();
                that.listModePhase.setData({ dimenListPhase: [] });
                that.byId("idDimenTablePhase").setModel(that.listModePhase)

                 /**Clearing data in Step 3 */
                 that.byId("idPhaseOutProd").setValue();
                 that.byId("idPhaseOutNew").setTokens();
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
                                    new Filter("CHAR_NAME", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_DESC", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter(oFilters);
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
            handleWizardCancel: function () {
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
            }
        });
    });