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
                reviewButton: false,
                backButtonVisible: false,
                finishButtonVisible: false,
                nextButtonVisible: true
            };
        return Controller.extend("vcpapp.vcpnpicharvalue.controller.createNPI", {
            onInit: function () {
                that = this;
                // Declaring JSON Model and size limit
                that.TemplateModel = new JSONModel();
                this.prodModel = new JSONModel();
                this.etModel = new JSONModel();
                that.locModel = new JSONModel();
                that.prodModel = new JSONModel();
                that.listMode = new JSONModel();
                that.prodModel1 = new JSONModel();
                that.step5Model = new JSONModel();
                that.step6Model = new JSONModel();
                that.oGModel = that.getOwnerComponent().getModel("oGModel");
                that.TemplateModel.setSizeLimit(1000);
                that.prodModel.setSizeLimit(1000);
                that.etModel.setSizeLimit(1000);
                that.locModel.setSizeLimit(1000);
                that.prodModel.setSizeLimit(1000);
                that.listMode.setSizeLimit(1000);
                that.step5Model.setSizeLimit(1000);
                that.step6Model.setSizeLimit(1000);
                that.charModel = new JSONModel();
                that.charModel.setSizeLimit(1000);
                // Declaring Value Help Dialogs and Template Dialog
                if (!this._valueHelpDialogPhaseInOut) {
                    this._valueHelpDialogPhaseInOut = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.PhaseInPhaseOut",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogPhaseInOut);
                }


            },

            onAfterRendering: function () {
                that.tokens;
                that.newCharNum = that.byId("idCharValue");
                that.oldCharVal = that.byId("idOldCharValue");
                that.selectedProject = that.oGModel.getProperty("/projectDetails");
                that.selectedProduct = that.oGModel.getProperty("/selectedProduct");
                that.phaseInMin = new Date();
                that.phaseInMax = new Date();
                this._oCore = sap.ui.getCore();
                if (!this._valueHelpDialogCharacter) {
                    this._valueHelpDialogCharacter = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.CharacteristicValues",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogCharacter);
                }

                if (!this._valueHelpDialogProd) {
                    this._valueHelpDialogProd = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProd);
                }
                if (!this._valueHelpDialogOldCharacter) {
                    this._valueHelpDialogOldCharacter = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.OldCharacteristicValues",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogOldCharacter);
                }
                if (!this._valueHelpDialogRefCharval) {
                    this._valueHelpDialogRefCharval = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.RefCharVal",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogRefCharval);
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
                if (!this._valueHelpCharName) {
                    this._valueHelpCharName = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.CharacteristicName",
                        this
                    );
                    this.getView().addDependent(this._valueHelpCharName);
                }
                if (that.selectedProject === undefined || that.selectedProject === "" || that.selectedProject === null) {
                    if (this._valueHelpDialogProd) {
                        that._valueHelpDialogProd.destroy(true);
                        that._valueHelpDialogProd = "";
                    }
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                    oRouter.navTo("RouteHome", {}, true);
                } else {
                    sap.ui.core.BusyIndicator.show();
                    this.getOwnerComponent().getModel("BModel").read("/getProducts", {
                        method: "GET",
                        success: function (oData) {
                            sap.ui.core.BusyIndicator.hide();
                            that.prodModel1.setData({ configProdRes: oData.results });
                            sap.ui.getCore().byId("prodSlctListOD").setModel(that.prodModel1);
                            if (that.selectedProduct) {
                                that.byId("ConfigProd").setValue(that.selectedProduct);

                                that.getOwnerComponent().getModel("BModel").read("/getCharType", {
                                    filters: [
                                        new Filter(
                                            "PRODUCT_ID",
                                            FilterOperator.EQ,
                                            that.selectedProduct
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
                                            that.charModel.setData({ setCharacteristicNames: charNames });
                                            sap.ui.getCore().byId("idCharNameSelect").setModel(that.charModel);
                                            that.byId("idCharName").setEnabled(true);
                                            sap.ui.core.BusyIndicator.hide()
                                        }
                                        else {
                                            sap.ui.core.BusyIndicator.hide()
                                            MessageToast.show("No Characteristcs available for this product.")
                                        }
                                    },
                                    error: function () {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageToast.show("Failed to get characteristics");
                                    }
                                });
                            }
                        },
                        error: function () {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to get configurable products");
                        },
                    });
                    var oModel = new JSONModel(),
                        oInitialModelState = Object.assign({}, oData);
                    oModel.setData(oInitialModelState);
                    this.getView().setModel(oModel);
                    that._oWizard = this.byId("CreateWizard");
                    that._oWizard._getProgressNavigator().ontap = function () { };
                    that._iSelectedStepIndex = 0;
                    that._iNewSelectedIndex = 0;
                    that.oGModel.setProperty("/setStep", "X");
                    that.handleButtonsVisibility();
                }

            },
            getUnqiueChars: function (arr1, arr2, prop1Arr1, prop2Arr1, prop1Arr2, prop2Arr2) {
                const valuesInArr2 = new Set(arr2.map(item => `${item[prop1Arr2]}_${item[prop2Arr2]}`));
                const filteredArray1 = arr1.filter(item => !valuesInArr2.has(`${item[prop1Arr1]}_${item[prop2Arr1]}`));
                const filteredArray2 = arr2.filter(item => !arr1.some(el => `${el[prop1Arr1]}_${el[prop2Arr1]}` === `${item[prop1Arr2]}_${item[prop2Arr2]}`));
                const uniqueObjects = [
                    ...filteredArray1,
                    ...filteredArray2.filter(item => !arr1.some(el => `${el[prop1Arr1]}_${el[prop2Arr1]}` === `${item[prop1Arr2]}_${item[prop2Arr2]}`))
                ];
                return uniqueObjects;
            },
            onBack: function () {
                that._oWizard.discardProgress(that._oWizard.getSteps()[0]);
                that.clearAllData();
                this.getView().getModel().setData(Object.assign({}, oData));
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("MaintainProject", {}, true);
                if (this._valueHelpDialogCharacter) {
                    that._valueHelpDialogCharacter.destroy(true);
                    that._valueHelpDialogCharacter = "";
                }
                if (this._valueHelpDialogOldCharacter) {
                    that._valueHelpDialogOldCharacter.destroy(true);
                    that._valueHelpDialogOldCharacter = "";
                }
                if (this._valueHelpDialogLocProd) {
                    that._valueHelpDialogLocProd.destroy(true);
                    that._valueHelpDialogLocProd = "";
                }
                if (this._valueHelpDialogProdLoc) {
                    that._valueHelpDialogProdLoc.destroy(true);
                    that._valueHelpDialogProdLoc = "";
                }

                if (this._valueHelpDialogProd) {
                    that._valueHelpDialogProd.destroy(true);
                    that._valueHelpDialogProd = "";
                }
                sap.ui.core.BusyIndicator.hide();
            },
            /**Remoing duplicates function */
            removeDuplicate: function (array, key) {
                var check = new Set();
                return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
            },
            /**On click of Value Helps */
            handleValueHelp: function (oEvent) {
                var sId = oEvent.getParameter("id");

                if (sId.includes("ConfigProd")) {
                    that._valueHelpDialogProd.open();
                }
                if (sId.includes("idCharName")) {
                    that._valueHelpCharName.open();
                }
                if (sId.includes("idCharValue")) {
                    that._valueHelpDialogCharacter.open();
                }
                else if (sId.includes("idOldCharValue")) {
                    that._valueHelpDialogOldCharacter.open();
                }
            },
            /**On Selection of chars in new Char Value */
            handleCharSelection: function (oEvent) {
                sap.ui.getCore().byId("idCharSelect").getBinding("items").filter([]);
                that.oldCharVal.removeAllTokens();
                that.TemplateModel.setData({ setOldCharacteristics: [] });
                sap.ui.getCore().byId("idCharOldSelect").setModel(that.TemplateModel);
                // sap.ui.getCore().byId("idCharOldSelect").clearSelection();
                var selectedItem = oEvent.getParameters().selectedItem.getDescription();
                that.newCharValueSelected = selectedItem;
                var selectedID = oEvent.getParameters().selectedItem.getTitle();
                that.selectedClassNum = oEvent.getParameters().selectedItem.getBindingContext().getObject().CLASS_NUM;
                that.newCharValDescSelected = selectedID;
                that.newCharNumSelected = oEvent.getParameters().selectedItem.getBindingContext().getObject().CHAR_NUM;
                that.mewCharDescp = oEvent.getParameters().selectedItem.getTitle();
                that.newCharNum.setValue(selectedID);
                that.byId("idCharValText").setText(that.mewCharDescp);
                that.oldCharVal.setEnabled(true);
                // var selectedItemsCount = that.totalTabData.filter(item=>item.CHAR_VALUE === selectedItem);
                var selectedItemsCount = that.totalTabData.filter(item => item.CHAR_NUM === that.newCharNumSelected);
                if (selectedItemsCount.length > 0) {
                    var filteredItems1 = that.getUnqiueChars(that.allCharacterstics, selectedItemsCount, "CHAR_NUM", "CHAR_VALUE", "CHAR_NUM", "CHAR_VALUE");
                    filteredItems1 = filteredItems1.filter(item => item.CHAR_VALUE !== selectedItem && item.CHAR_NUM === that.newCharNumSelected && item.CLASS_NUM === that.selectedClassNum);
                    for (var i = 0; i < selectedItemsCount.length; i++) {
                        for (var k = 0; k < filteredItems1.length; k++) {
                            if (selectedItemsCount[i].CHAR_VALUE === selectedItem && selectedItemsCount[i].REF_CHAR_VALUE === filteredItems1[k].CHAR_VALUE) {
                                delete filteredItems1[k];
                            }
                        }
                    }
                    var filteredItems = filteredItems1;
                }
                else {
                    var filteredItems = that.allCharacterstics.filter(item => item.CHAR_VALUE !== selectedItem && item.CHAR_NUM === that.newCharNumSelected && item.CLASS_NUM === that.selectedClassNum);
                }
                that.TemplateModel.setData({ setOldCharacteristics: filteredItems });
                sap.ui.getCore().byId("idCharOldSelect").setModel(that.TemplateModel);
                var selectedItemsTab = sap.ui.getCore().byId("idCharOldSelect").getItems();
                selectedItemsTab.forEach(function(oItems){
                    oItems.setSelected(false);
                });
            },

            /**On Selection of config product in prod dialog */
            handleSelection: function (oEvent) {
                that.byId("idCharName").setValue();
                var selectedDescp = oEvent.getParameters().selectedItems[0].getTitle();
                var selectedItem = oEvent.getParameters().selectedItems[0].getDescription();
                that.byId("ConfigProd").setValue(selectedDescp);
                that.byId("idCharName").setEnabled(true);
                that.byId("idCharValue").setEnabled(false);
                that.byId("idCharValue").setValue();
                that.byId("idOldCharValue").removeAllTokens();
                that.byId("idOldCharValue").setEnabled(false);
                that.selectedConfigProduct = selectedItem;
                sap.ui.getCore().byId("prodSlctListOD").getBinding("items").filter([]);
                var tableProjectData = that.oGModel.getProperty("/charvalData");
                if (tableProjectData.length > 0) {
                    that.totalTabData = tableProjectData.filter(item => item.REF_PRODID === selectedItem && item.PROJECT_ID === that.selectedProject);
                }
                else {
                    that.totalTabData = [];
                }
                sap.ui.core.BusyIndicator.show()
                this.getOwnerComponent().getModel("BModel").read("/getCharType", {
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
                            that.charModel.setData({ setCharacteristicNames: charNames });
                            sap.ui.getCore().byId("idCharNameSelect").setModel(that.charModel);
                            sap.ui.core.BusyIndicator.hide()
                        }
                        else {
                            sap.ui.core.BusyIndicator.hide()
                            MessageToast.show("No Characteristcs available for this product.")
                        }
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get characteristics");
                    }
                });

            },


            /**On Selection of chars in Old Char Value */
            handleOldCharSelection: function (oEvent) {
                that.charsSelected = [], that.intChars = {};
                that.oldCharVal.removeAllTokens();
                sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter([]);
                var selectedItems = oEvent.getParameters().selectedItems;
                var weightage = 100 / selectedItems.length;
                // selectedItems.forEach(function (oItem) {
                //     that.oldCharVal.addToken(
                //         new sap.m.Token({
                //             key: oItem.getTitle(),
                //             text: oItem.getTitle(),
                //             editable: false
                //         })
                //     );
                //     that.intChars = {
                //         CHAR_VALUE: oItem.getDescription(),
                //         CHARVAL_DESC: oItem.getTitle(),
                //         CHARVAL_NUM: oItem.getInfo(),
                //         WEIGHT: weightage.toFixed(2),
                //         STATUS: "Active"
                //     }
                //     that.charsSelected.push(that.intChars);
                // });
                selectedItems.forEach(function (oItem) {
                    that.oldCharVal.addToken(
                        new sap.m.Token({
                            key: oItem.getCells()[0].getTitle(),
                            text: oItem.getCells()[0].getText(),
                            editable: false
                        })
                    );
                    that.intChars = {
                        CHAR_VALUE:oItem.getCells()[0].getText(),
                        CHARVAL_DESC: oItem.getCells()[0].getTitle(),
                        CHARVAL_NUM: oItem.getCells()[1].getText(),
                        WEIGHT: weightage.toFixed(2),
                        STATUS: "Active"
                    }
                    that.charsSelected.push(that.intChars);
                });
            },
            /**Search in CHaracteristic Fragments */
            handleCharSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                if (sId.includes("idCharSelect")) {
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
                    sap.ui.getCore().byId("idCharSelect").getBinding("items").filter(oFilters);
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
                else {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("CHAR_NAME", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery),
                                    new Filter("CHARVAL_DESC", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter(oFilters);
                }
            },
            /**On press of step 2 */
            onStep3Press: function () {
                that.byId("idNewValue").setValue(that.newCharValDescSelected);
                that.byId("idste3Text").setText(that.selectedCharName);
                that.byId("ConfigProd2").setText(that.selectedConfigProduct);
                that.byId("STfromDate").setMinDate(new Date());
                that.byId("idDateRange").setMinDate(new Date());
                that.tokens = that.byId("idOldCharValue").getTokens();
                that.byId("idOldChar").removeAllTokens();
                that.tokens.forEach(function (oItem) {
                    that.byId("idOldChar").addToken(
                        new sap.m.Token({
                            key: oItem.getText(),
                            text: oItem.getText(),
                            editable: false
                        })
                    );
                });
                that.etModel.setData({ charList: that.charsSelected });
                that.byId("idOldCharList").setModel(that.etModel);
            },

            /**ON Press of Cancel in Ref CharValue Fragment */
            onRefCancel: function () {
                that._valueHelpDialogRefCharval.close();
            },
            /**On Press of multi select in Table step3 */
            onhandlePress: function (oEvent) {
                var selectedItems = that.byId("idOldCharList").getSelectedItems();
                if (selectedItems.length === 1) {
                    that.byId("idEditButton").setEnabled(true);
                }
                else {
                    that.byId("idEditButton").setEnabled(false);
                    // MessageToast.show("Please select only one Item");
                }
            },

            /**On Press of Step 4 */
            onStep4Press: function () {
                var object = { LAUNCH: [{ DIMENSIONS: 'Location', VALUE: '', ROW: 1 }, { DIMENSIONS: 'Partial Product', VALUE: '', ROW: 2 }] };
                that.byId("idNewDimen").setValue(that.newCharValDescSelected);
                that.byId("idLaunchText").setText(that.selectedCharName);
                that.byId("ConfigProd3").setText(that.selectedConfigProduct);
                that.tokens = that.byId("idOldCharValue").getTokens();
                that.byId("idOldDimen").removeAllTokens();
                that.tokens.forEach(function (oItem) {
                    that.byId("idOldDimen").addToken(
                        new sap.m.Token({
                            key: oItem.getText(),
                            text: oItem.getText(),
                            editable: false
                        })
                    );
                });
                that.listMode.setData({ dimenList: object.LAUNCH });
                that.byId("idDimenTable").setModel(that.listMode)

            },
            /**On select of value help in table in step4*/
            handleValueHelpTable: function (oEvent) {
                that.oSource = oEvent.getSource();
                var table = that.byId("idDimenTable");
                var selectedKey = oEvent.getSource().getEventingParent().getCells()[0].getText();
                if (selectedKey === "Location") {
                    sap.ui.getCore().byId("idLocSelect").setVisible(true);
                    sap.ui.getCore().byId("idProdSelect").setVisible(false);
                    this.getOwnerComponent().getModel("BModel").read("/getLocProd", {
                        filters: [
                            new Filter(
                                "PRODUCT_ID",
                                FilterOperator.EQ,
                                that.selectedConfigProduct
                            ),
                        ],
                        success: function (oData1) {
                            if (oData1.results.length > 0) {
                                that.locDetails = [];
                                that.locDetails = oData1.results;
                                that.locModel.setData({ setLocation: that.locDetails });
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
                                that.selectedConfigProduct
                            ),
                        ],
                        success: function (oData1) {
                            if (oData1.results.length > 0) {
                                that.prods = [];
                                that.prods = oData1.results;
                                that.prodModel.setData({ setProds: that.prods });
                                sap.ui.getCore().byId("idProdSelect").setModel(that.prodModel);
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
            /**On Selecting Productt in Step4 Launch Dimension */
            handleProdSelection: function (oEvent) {
                that.oSource.removeAllTokens();
                var selectedItem = oEvent.getParameters().selectedItems;
                selectedItem.forEach(function (oItem) {
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: oItem.getCells()[0].getText(),
                            text: oItem.getCells()[0].getTitle(),
                            editable: false
                        })
                    );
                });
            },
            /**On Selecting Location in Step4 Launch Dimension */
            handleLocSelection: function (oEvent) {
                that.oSource.removeAllTokens();
                var selectedItem = oEvent.getParameters().selectedItems;
                selectedItem.forEach(function (oItem) {
                    that.oSource.addToken(
                        new sap.m.Token({
                            key: oItem.getCells()[0].getText(),
                            text: oItem.getCells()[0].getTitle(),
                            editable: false
                        })
                    );
                });
            },
            /**On Step 5 Press */
            onStep5Press: function () {
                sap.ui.core.BusyIndicator.show();
                that.byId("ConfigProd4").setText(that.selectedConfigProduct);
                that.byId("idPhaseInChar").setValue(that.newCharValDescSelected);
                that.byId("idPhaseInText").setText(that.selectedCharName);
                that.byId("idPhaseinStart").setMinDate(new Date());
                that.byId("idPhaseInDate").setMinDate(new Date());
                that.tokens = that.byId("idOldCharValue").getTokens();
                that.byId("idPhaseinOldChar").removeAllTokens();
                that.tokens.forEach(function (oItem) {
                    that.byId("idPhaseinOldChar").addToken(
                        new sap.m.Token({
                            key: oItem.getText(),
                            text: oItem.getText(),
                            editable: false
                        })
                    );
                });

            },
            /**On Press of Edit button in Phase step 5/6 */
            onEditPhasePressed: function () {
                var selectedObject = that.byId("idPhaseInTab").getSelectedItems();
                sap.ui.getCore().byId("idLAunchText").setValue(selectedObject[0].getCells()[0].getText());
                sap.ui.getCore().byId("idLocDesc").setValue(selectedObject[0].getCells()[1].getText());
                sap.ui.getCore().byId("idProdId").setValue(selectedObject[0].getCells()[2].getText());
                sap.ui.getCore().byId("idProdDesc").setValue(selectedObject[0].getCells()[3].getText());
                that._valueHelpDialogPhaseInOut.open();
                sap.ui.getCore().byId("idPhaseinOut").setTitle("Phase-In Details");
                sap.ui.getCore().byId("idVBoxPhaseIn").setVisible(true);
            },
            onPhaseCancel: function () {
                that._valueHelpDialogPhaseInOut.close();
            },
            /**On Change of Table Item in Phase In */
            onPhaseInChange: function () {
                var selectedItems = that.byId("idPhaseInTab").getSelectedItems();
                if (selectedItems.length === 1) {
                    that.byId("idEditBtn").setEnabled(true);
                }
                else {
                    that.byId("idEditBtn").setEnabled(false);
                }
            },
            onPhaseOutFinish: function () {
                var selectedItems = that.byId("idPhaseOutTab").getSelectedItems();
                if (selectedItems.length === 1) {
                    that.byId("idEditOutBtn").setEnabled(true);
                }
                else {
                    that.byId("idEditOutBtn").setEnabled(false);
                }
            },
            /**On Press of delete in table in step 4 */
            onTabDel: function (oEvent) {
                var deletedObj = oEvent.getParameters().listItem.getBindingContext().getObject(),
                    filteredArr = oEvent.getSource().getModel().getData().dimenList.filter(a => a.ROW !== deletedObj.ROW);
                filteredArr.forEach((a, index) => {
                    a.ROW = index + 1;
                });
                that.listMode.setData({ dimenList: filteredArr });
                that.byId("idDimenTable").setModel(that.listMode);
            },
            handleButtonsVisibility: function () {
                var oModel = this.getView().getModel();
                switch (that._iSelectedStepIndex) {
                    case 0:
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/nextButtonEnabled", true);
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/reviewButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        break;
                    case "Characteristic Value Selection":
                        if (that.newCharNum.getValue() !== "" && that.newCharNum.getValue() !== undefined && that.byId("idOldCharValue").getTokens().length > 0) {
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", true);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", false);
                            that.byId("idDateRange").setMinDate(new Date());
                        }
                        else {
                            MessageToast.show("Please select all the required fields");
                        }
                        break;
                    // case "Reference Assignments":
                    //     if (that.oldCharVal.getTokens().length > 0) {
                    //         that._oWizard.nextStep();
                    //         that._iNewSelectedIndex++
                    //         oModel.setProperty("/nextButtonVisible", true);
                    //         oModel.setProperty("/backButtonVisible", true);
                    //         oModel.setProperty("/reviewButtonVisible", false);
                    //         oModel.setProperty("/finishButtonVisible", false);
                    //     }
                    //     else {
                    //         MessageToast.show("Please select atleast one Reference Characteristic");
                    //     }
                    //     break;
                    case "Reference Details":
                        var oTable = this.byId("idOldCharList");
                        var aItems = oTable.getItems();
                        var bIsEmpty = false;
                        aItems.forEach(function (oItem) {
                            var aCells = oItem.getCells();
                            aCells.forEach(function (oCell) {
                                // if (oCell instanceof sap.m.Text) {
                                //     if (oCell.getText().trim() === "") { // Check if the text content is empty
                                //         bIsEmpty = true;
                                //         return false; // Break out of inner loop
                                //     }
                                // }
                                // else 
                                if (oCell instanceof sap.m.DatePicker) {
                                    if (oCell.getDateValue() === null || oCell.getDateValue() === "") {
                                        bIsEmpty = true;
                                        return false;
                                    }
                                }
                                else if (oCell instanceof sap.m.Input) {
                                    if (oCell.getValue() === "" || oCell.getValue() === "0") {
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
                        } else {
                            var sumarray = [], sum = 0;
                            var tabData = that.byId("idOldCharList").getItems();
                            for (var i = 0; i < tabData.length; i++) {
                                if (tabData[i].getCells()[1].getValue() > 0) {
                                    sumarray.push(Number(tabData[i].getCells()[1].getValue()));
                                }
                                else {
                                    return MessageToast.show("One or More characteristics weights is zero");
                                }
                            }
                            sumarray.forEach(value => {
                                sum += value;
                            });
                            if (sum === 100 || sum === 99.99) {
                                that._oWizard.nextStep();
                                that._iNewSelectedIndex++
                                oModel.setProperty("/nextButtonVisible", true);
                                oModel.setProperty("/backButtonVisible", true);
                                oModel.setProperty("/reviewButtonVisible", false);
                                oModel.setProperty("/finishButtonVisible", false);
                            }
                            else {
                                return MessageToast.show("Sum of weights not equal to 100");
                            }
                        }
                        break;
                    case "Launch Dimension":
                        sap.ui.core.BusyIndicator.show();
                        that.combinedArray = [];
                        var newObject = {}, locArray = [], prodArray = [];
                        var oTable = this.byId("idDimenTable");
                        var aItems = oTable.getItems();
                        var date = new Date();
                        var previousDate = date.getDate() - 1;
                        date = date.setDate(previousDate);
                        var items = that.byId("idDimenTable").getItems();
                        if (items[0].getCells()[1].getTokens().length > 0 && items[1].getCells()[1].getTokens().length > 0) {
                            var locItems = items[0].getCells()[1].getTokens();
                            var prodItems = items[1].getCells()[1].getTokens();
                            if (locItems.length > 0) {
                                for (var i = 0; i < locItems.length; i++) {
                                    newObject = {
                                        LOCATION_ID: locItems[i].getKey(),
                                        LOCATION_DESC: locItems[i].getText(),
                                        HISTORY_CONSIDERATION: new Date(date),
                                        PHASE_IN: ''
                                    }
                                    locArray.push(newObject);
                                }
                            }
                            if (prodItems.length > 0) {
                                for (var i = 0; i < prodItems.length; i++) {
                                    newObject = {
                                        PROD_ID: prodItems[i].getKey(),
                                        PROD_DESC: prodItems[i].getText()
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
                            that.step5Model.setData({ PhaseInList: that.combinedArray });
                            that.byId("idPhaseInTab").setModel(that.step5Model);
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", true);
                            sap.ui.core.BusyIndicator.hide();
                        }
                        else if (items[0].getCells()[1].getTokens().length === 0 && items[1].getCells()[1].getTokens().length === 0) {
                            var newObject = {}, locArray = [], prodArray = [];
                            that.combinedArray = [];
                            this.getOwnerComponent().getModel("BModel").read("/getLocProd", {
                                filters: [
                                    new Filter(
                                        "PRODUCT_ID",
                                        FilterOperator.EQ,
                                        that.selectedConfigProduct
                                    ),
                                ],
                                success: function (oData1) {
                                    if (oData1.results.length > 0) {
                                        that.locDetails1 = [];
                                        that.locDetails1 = oData1.results;
                                        sap.ui.getCore().byId("idLocSelect").setVisible(false);
                                        sap.ui.getCore().byId("idProdSelect").setVisible(true);
                                        that.getOwnerComponent().getModel("BModel").read("/getPartialProd", {
                                            filters: [
                                                new Filter(
                                                    "REF_PRODID",
                                                    FilterOperator.EQ,
                                                    that.selectedConfigProduct
                                                ),
                                            ],
                                            success: function (oData2) {
                                                if (oData2.results.length > 0) {
                                                    that.prods1 = [];
                                                    that.prods1 = oData2.results;
                                                    for (var i = 0; i < that.locDetails1.length; i++) {
                                                        newObject = {
                                                            LOCATION_ID: that.locDetails1[i].LOCATION_ID,
                                                            LOCATION_DESC: that.locDetails1[i].LOCATION_DESC,
                                                            HISTORY_CONSIDERATION: new Date(date),
                                                            PHASE_IN: ''
                                                        }
                                                        locArray.push(newObject);
                                                    }

                                                    for (var i = 0; i < that.prods1.length; i++) {
                                                        newObject = {
                                                            PROD_ID: that.prods1[i].PRODUCT_ID,
                                                            PROD_DESC: that.prods1[i].PROD_DESC
                                                        }
                                                        prodArray.push(newObject);
                                                    }

                                                    if (locArray.length > 0 && prodArray.length > 0) {

                                                        locArray.forEach(item1 => {
                                                            prodArray.forEach(item2 => {
                                                                that.combinedArray.push({ ...item1, ...item2 });
                                                            });
                                                        });
                                                    }
                                                    that.step5Model.setData({ PhaseInList: that.combinedArray });
                                                    that.byId("idPhaseInTab").setModel(that.step5Model);
                                                    that._oWizard.nextStep();
                                                    that._iNewSelectedIndex++
                                                    oModel.setProperty("/nextButtonVisible", false);
                                                    oModel.setProperty("/backButtonVisible", true);
                                                    oModel.setProperty("/reviewButtonVisible", false);
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
                        break;
                    default: break;
                }
            },
            onDialogNextButton: function () {
                that._iSelectedStepIndex = that._oWizard.getSteps()[that._iNewSelectedIndex].getTitle();
                that.handleButtonsVisibility();
            },
            onDialogBackButton: function () {
                that._iSelectedStepIndex = that._oWizard.getSteps()[that._iNewSelectedIndex].getTitle()
                that._oWizard.previousStep();
                that._iNewSelectedIndex--;
                var oModel = this.getView().getModel();
                switch (that._iSelectedStepIndex) {

                    case "Phase-In Details New Characteristic Value":
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/backButtonVisible", true);
                        oModel.setProperty("/finishButtonVisible", false);
                        that.tokens = [];
                        that.step5Model.setData({ PhaseInList: [] });
                        that.byId("idPhaseInTab").setModel(that.step5Model);
                        that.byId("idPhaseInDate").setDateValue();
                        that.byId("idHistoryDate").setDateValue();                        
                        break;

                    case "Launch Dimension":
                        oModel.setProperty("/backButtonVisible", true);
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/finishButtonVisible", false);
                        that.tokens = [];
                        that.byId("idOldDimen").removeAllTokens();
                        that.listMode.setData({ dimenList: [] });
                        that.byId("idDimenTable").setModel(that.listMode);
                        sap.ui.getCore().byId("idLocSelect").clearSelection();
                        sap.ui.getCore().byId("idProdSelect").clearSelection();
                        sap.ui.getCore().byId("idProdSelect").getBinding("items").filter([]);
                        sap.ui.getCore().byId("idLocSelect").getBinding("items").filter([]);
                        break;

                    case "Reference Details":
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        that.tokens = [];
                        that.byId("idOldChar").removeAllTokens();
                        that.etModel.setData({ charList: [] });
                        that.byId("idOldCharList").setModel(that.etModel);
                        that.prodModel.setData({ setCharacteristics: that.aDistinct })
                        sap.ui.getCore().byId("idCharSelect").setModel(that.prodModel);
                        that.byId("idDateRange").setFrom();
                        that.byId("idDateRange").setTo();
                        break;

                    default: break;
                }
            },
            /**On Change of Date in From Field in RefCharVal Fragment */
            onFromDateChange: function (oEvent) {
                var selectedDate = oEvent.getSource().getDateValue();
                var Flag = that.oGModel.getProperty("/setDate");
                if(Flag === "X"){
                    var toDate = oEvent.getSource().getParent().getCells()[3].getDateValue();
                    if(selectedDate > toDate){
                        oEvent.getSource().getParent().getCells()[3].setMinDate(selectedDate);
                        oEvent.getSource().getParent().getCells()[3].setDateValue(); 
                    }
                    else{
                        oEvent.getSource().getParent().getCells()[3].setMinDate(selectedDate);                        
                    }
                    that.oGModel.setProperty("/setDate","");
                }
                else{
                if (oEvent.getParameters().id.includes("STfromDate")) {
                    oEvent.getSource().getParent().getCells()[3].setEnabled(true);
                    oEvent.getSource().getParent().getCells()[3].setMinDate(selectedDate);
                    if (that.phaseInMin === "") {
                        that.phaseInMin = new Date(selectedDate);
                    } else {
                        if (that.phaseInMin > new Date(selectedDate)) {
                            that.phaseInMin = new Date(selectedDate);
                        }
                    }
                } else {
                    if (that.phaseInMax === "") {
                        that.phaseInMax = new Date(selectedDate);
                    } else {
                        if (that.phaseInMax > new Date(selectedDate)) {
                            that.phaseInMax = new Date(selectedDate);
                        }
                    }
                }
            }
            },
            /**On Ok press in PhaseInPhaseout Fragment */
            onPhasePress: function () {
                var selectedLoc = sap.ui.getCore().byId("idLAunchText").getValue();
                var selectedLocDesc = sap.ui.getCore().byId("idLocDesc").getValue();
                var selectedProdId = sap.ui.getCore().byId("idProdId").getValue();
                var selectedProdDesc = sap.ui.getCore().byId("idProdDesc").getValue();
                var selectedPhaseInDate = sap.ui.getCore().byId("idPhaseInFrom").getValue();
                that.combinedArray = that.combinedArray.map(item => {
                    if (item.LOCATION_ID === selectedLoc && item.LOCATION_DESC === selectedLocDesc && item.PROD_ID === selectedProdId
                        && item.PROD_DESC === selectedProdDesc) {
                        return {
                            ...item,
                            LOCATION_ID: selectedLoc,
                            LOCATION_DESC: selectedLocDesc,
                            PROD_ID: selectedProdId,
                            PROD_DESC: selectedProdDesc,
                            PHASE_IN: selectedPhaseInDate
                        };
                    } else {
                        return item; // Keep the item unchanged
                    }
                });
                that.step5Model.setData({ PhaseInList: that.combinedArray });
                that.byId("idPhaseInTab").setModel(that.step5Model);
                that._valueHelpDialogPhaseInOut.close();

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
                that._oWizard.discardProgress(this.byId("idCharSelection"));
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
            /**For clearing all data in each steps when Cancel is pressed */
            clearAllData: function () {
                /**Clearing data in Step 1 */
                that.byId("idCharValue").setValue();
                that.byId("idCharValue").setEnabled(false);
                that.byId("idOldCharValue").setEnabled(false);
                that.byId("idOldCharValue").removeAllTokens();
                that.byId("ConfigProd").setValue();
                that.byId("idCharValText").setText();
                that.byId("idCharName").setValue();
                that.byId("idCharName").setEnabled(false);
                that.charModel.setData({ setCharacteristicNames: [] });
                sap.ui.getCore().byId("idCharNameSelect").setModel(that.charModel);
                that.prodModel.setData({ setCharacteristics: [] })
                sap.ui.getCore().byId("idCharSelect").setModel(that.prodModel);


                /**Clearing data in Step 2 */
                // that.byId("idCharValue1").setValue();
                // that.byId("ConfigProd1").setText();
                // that.byId("idCharValText1").setText();
                // that.byId("idOldCharValue").removeAllTokens();
                that.TemplateModel.setData({ setOldCharacteristics: [] });
                sap.ui.getCore().byId("idCharOldSelect").setModel(that.TemplateModel);

                /**Clearing data in Step 3 */
                that.byId("idNewValue").setValue();
                that.byId("idste3Text").setText();
                that.byId("idOldChar").setTokens();
                that.etModel.setData({ charList: [] });
                that.byId("idOldCharList").setModel(that.etModel);
                sap.ui.getCore().byId("idOffser").setValueState("None");
                that.byId("idDateRange").setFrom();
                that.byId("idDateRange").setTo();

                /**Clearing data in Step 4 */
                that.byId("idNewDimen").setValue();
                that.byId("idLaunchText").setText();
                that.byId("idOldDimen").setTokens();
                that.listMode.setData({ dimenList: [] });
                that.byId("idDimenTable").setModel(that.listMode);
                that.prodModel.setData({ setProds: [] });
                sap.ui.getCore().byId("idProdSelect").setModel(that.prodModel);
                sap.ui.getCore().byId("idProdSelect").clearSelection();
                that.locModel.setData({ setLocation: [] });
                sap.ui.getCore().byId("idLocSelect").setModel(that.locModel);
                sap.ui.getCore().byId("idLocSelect").clearSelection();

                /**Clearing data in Step 5 */
                that.byId("idPhaseInChar").setValue();
                that.byId("idPhaseInText").setText();
                that.byId("idPhaseinOldChar").setTokens();
                sap.ui.getCore().byId("idPhaseInFrom").setValue();
                that.step5Model.setData({ PhaseInList: [] });
                that.byId("idPhaseInTab").setModel(that.step5Model);
                that.byId("idPhaseInDate").setDateValue();
                        that.byId("idHistoryDate").setDateValue();
            },
            /**On Input Change in RefCharVal fragment to support only numerics */
            onInputChange: function (oEvent) {
                var oInput = oEvent.getSource();
                var sValue = oEvent.getParameter("value");
                var sNewValue = sValue.replace(/\D/g, ''); // Remove non-numeric characters
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
            /**On Press of Finish in Step 6 */
            handleWizardSubmit: function () {
                var oTable = this.byId("idPhaseInTab");
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
                            if (oCell.getDateValue() === "" || oCell.getDateValue() === null) { // Check if the text content is empty
                                bIsEmpty = true;
                                return false; // Break out of inner loop
                            }
                        }
                    });
                    if (bIsEmpty) {
                        return false; // Break out of outer loop
                    }
                });

                if (bIsEmpty) {
                    return MessageToast.show("At least one of the row's data is empty/ phase-in date is empty. Please fill in all the details.");
                }
                else {
                    var object = {}, finalArray = [], dimenObject = {}, dimeArray = [];
                    for (var i = 0; i < aItems.length; i++) {
                        dimenObject = {
                            LOCATION_ID: aItems[i].getCells()[0].getText(),
                            PRODUCT_ID: aItems[i].getCells()[2].getText(),
                            HISTORY_DATE: aItems[i].getCells()[4].getDateValue(),
                            PHASE_IN_START: aItems[i].getCells()[5].getDateValue()
                        }
                        dimeArray.push(dimenObject);
                    }
                    var tableItemsStep3 = that.byId("idOldCharList").getItems();
                    for (var j = 0; j < tableItemsStep3.length; j++) {
                        object = {
                            PROJECT_ID: that.selectedProject,
                            REF_PRODID: that.selectedConfigProduct,
                            CHAR_NUM: that.newCharNumSelected,
                            CHAR_VALUE: that.newCharValueSelected,
                            CHARVAL_DESC: that.newCharValDescSelected,
                            REF_CHAR_VALUE: tableItemsStep3[j].getCells()[0].getText(),
                            REF_CHARVALUE_DESC: tableItemsStep3[j].getCells()[0].getTitle(),
                            WEIGHT: parseInt(tableItemsStep3[j].getCells()[1].getValue()),
                            VALID_FROM: tableItemsStep3[j].getCells()[2].getDateValue(),
                            VALID_TO: tableItemsStep3[j].getCells()[3].getDateValue(),
                            DIMENSION: JSON.stringify(dimeArray)
                        }
                        finalArray.push(object);
                    }
                    console.log(JSON.stringify(finalArray));
                    this.getOwnerComponent().getModel("BModel").callFunction("/saveNPICharValDetails", {
                        method: "GET",
                        urlParameters: {
                            NEWCHARVALUEDATA: JSON.stringify(finalArray)
                        },
                        success: function (oData1) {
                            if (oData1.saveNPICharValDetails.includes("Successfully")) {
                                that.clearAllData();
                                that.onAfterRendering();
                                that.getView().getModel().setData(Object.assign({}, oData));
                                that.onBack();
                                setTimeout(function () { MessageToast.show(oData1.saveNPICharValDetails) }, 1000);
                            }
                            else {
                                MessageToast.show(oData1.saveNPICharValDetails);
                            }
                        },
                        error: function (error) {
                            MessageToast.show("Failed to save new characteristic");
                        }
                    });
                }
            },
            /**On Press of charnames in Characteristic Name Fragment */
            handleCharNameSelection: function (oEvent) {
                var selectedName = oEvent.getParameters().selectedItems[0].getTitle();
                that.selectedCharName = selectedName;
                var selectedNum = oEvent.getParameters().selectedItems[0].getDescription();
                that.allCharacterstics = [], that.aDistinct = [];
                that.allCharacterstics = that.newChars;
                var allChars = that.newChars.filter(a => a.CHAR_NAME === selectedName && a.CHAR_NUM === selectedNum);
                that.aDistinct = that.totalTabData;
                that.aDistinct = that.getUnqiueChars(allChars, that.aDistinct, "CHAR_NUM", "CHAR_VALUE", "CHAR_NUM", "REF_CHAR_VALUE");
                that.aDistinct = that.aDistinct.filter(obj => !obj.hasOwnProperty("PROJECT_ID"));
                that.prodModel.setData({ setCharacteristics: that.aDistinct })
                sap.ui.getCore().byId("idCharSelect").setModel(that.prodModel);
                that.byId("idCharValue").setEnabled(true);
                that.byId("idCharValue").setValue();
                that.byId("idOldCharValue").setEnabled(false);
                that.byId("idOldCharValue").removeAllTokens();
                that.byId("idCharName").setValue(selectedName);

            },
            /**On press of delete in Table in step5 */
            onStep5delete: function (oEvent) {
                var selectedIndex = oEvent.getParameter("listItem").getBindingContext().sPath.split("/")[2];
                var aData = that.step5Model.getData().PhaseInList;
                aData.splice(selectedIndex, 1);
                that.step5Model.refresh();
            },

            /**On Change of Date Range in Step Reference Details */
            onDateRangeSelection: function(oEvent){
                var FromDate = oEvent.getSource().getFrom();
                var ToDate = oEvent.getSource().getTo();
                var items = that.byId("idOldCharList").getItems();
                that.oGModel.setProperty("/setDate","X");
                for(var k=0;k<items.length;k++){
                items[k].getCells()[2].setDateValue(FromDate);
                items[k].getCells()[3].setMinDate(FromDate);
                items[k].getCells()[3].setDateValue(ToDate);
                items[k].getCells()[3].setEnabled(true);
                }
            },

            /**On Change of History Consideration/phase-in Date in Step4 */
            onDateChange:function(oEvent){
                var selectedDate = oEvent.getSource().getDateValue();
                var sID = oEvent.getSource().sId;
                var tabItems = that.byId("idPhaseInTab").getItems();
                if(sID.includes("HistoryDate")){                
                for(var s=0;s<tabItems.length;s++){
                    tabItems[s].getCells()[4].setDateValue(selectedDate); 
                }
            }
            else{
                for(var s=0;s<tabItems.length;s++){
                    tabItems[s].getCells()[5].setDateValue(selectedDate); 
                }
            }
            }
        });
    });