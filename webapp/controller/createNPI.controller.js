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
                that.selectedConfigProduct = that.oGModel.getProperty("/configProduct");
                that.selectedProject = that.oGModel.getProperty("/projectDetails");
                that.totalTabData = that.oGModel.getProperty("/charvalData");
                that.byId("idConfigText").setText(that.selectedConfigProduct);
                this.getOwnerComponent().getModel("BModel").read("/getCharType", {
                    filters: [
                        new Filter(
                            "PRODUCT_ID",
                            FilterOperator.EQ,
                            that.selectedConfigProduct
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
                        }
                        else {
                            MessageToast.show("No Characteristcs available for this product.")
                        }
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get characteristics");
                    }
                });
                this._oCore = sap.ui.getCore();
                if (!this._valueHelpDialogCharacter) {
                    this._valueHelpDialogCharacter = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.CharacteristicValues",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogCharacter);
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
                sap.ui.getCore().byId("idCharOldSelect").clearSelection();
                var selectedItem = oEvent.getParameters().selectedItem.getTitle();
                that.selectedClassNum = oEvent.getParameters().selectedItem.getBindingContext().getObject().CLASS_NUM;
                that.newcharSelected = selectedItem;
                that.newCharNumSelected = oEvent.getParameters().selectedItem.getBindingContext().getObject().CHAR_NUM;
                that.mewCharDescp = oEvent.getParameters().selectedItem.getDescription();
                that.newCharNum.setValue(selectedItem);
                that.byId("idCharValText").setText(that.mewCharDescp);
                that.oldCharVal.setEditable(true);
                // var selectedItemsCount = that.totalTabData.filter(item=>item.CHAR_VALUE === selectedItem);
                var selectedItemsCount = that.totalTabData.filter(item => item.CHAR_NUM === that.newCharNumSelected);
                if (selectedItemsCount.length > 0) {
                    var filteredItems1 = that.getUnqiueChars(that.allCharacterstics, selectedItemsCount, "CHAR_NUM", "CHAR_VALUE", "CHAR_NUM", "CHAR_VALUE");
                    filteredItems1 = filteredItems1.filter(item => item.CHAR_VALUE !== selectedItem && item.CHAR_NUM === that.newCharNumSelected && item.CLASS_NUM === that.selectedClassNum);
                    // filteredItems = that.getUnqiueChars(filteredItems, that.totalTabData, "CHAR_NUM", "CHAR_VALUE", "CHAR_NUM", "REF_CHAR_VALUE");
                    // function  removeObjects(array1, array2, prop1Array1, prop1Array2, prop2Array1, prop2Array2){
                    //     return array1.filter(obj1 => {
                    //         return !array2.some(obj2 => obj1[prop1Array1] === obj2[prop1Array2] && obj1[prop2Array1] === obj2[prop2Array2]);
                    //     });
                    // };

                    // // Remove objects from array1 where both name and age match any object in array2
                    // var filteredItems = removeObjects(filteredItems1, that.totalTabData, "CHAR_NUM", "CHAR_NUM", "CHAR_VALUE", "REF_CHAR_VALUE");
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

            },
            /**On Selection of chars in Old Char Value */
            handleOldCharSelection: function (oEvent) {
                that.charsSelected = [], that.intChars = {};
                that.oldCharVal.removeAllTokens();
                sap.ui.getCore().byId("idCharOldSelect").getBinding("items").filter([]);
                var selectedItems = oEvent.getParameters().selectedItems;
                var weightage = 100 / selectedItems.length;
                selectedItems.forEach(function (oItem) {
                    that.oldCharVal.addToken(
                        new sap.m.Token({
                            key: oItem.getTitle(),
                            text: oItem.getTitle(),
                            editable: false
                        })
                    );
                    that.intChars = {
                        CHAR_VALUE: oItem.getTitle(),
                        CHAR_NAME: oItem.getDescription(),
                        CHAR_DESC: oItem.getInfo(),
                        WEIGHT: weightage.toFixed(2),
                        STATUS: "Active"
                    }
                    that.charsSelected.push(that.intChars);
                });
                that.byId("idRefAssign").setValidated(true);
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
                else {
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
            /**On press of step 2 */
            onStep3Press: function () {
                that.byId("idNewValue").setValue(that.newcharSelected);
                that.byId("idste3Text").setText(that.mewCharDescp);
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
            /**On Edit pressed in step 3 */
            // onEditPressed: function () {
            //     var selectedItems = that.byId("idOldCharList").getSelectedItems();
            //     if (selectedItems.length === 1) {
            //         var selectedCharName = selectedItems[0].getCells()[0].getText();
            //         var selectedCHarDesc = selectedItems[0].getCells()[1].getText();
            //         var selectedWeight = selectedItems[0].getCells()[3].getText();
            //         var selectedValidFrom = selectedItems[0].getCells()[4].getText();
            //         var selectedValidTo = selectedItems[0].getCells()[5].getText();
            //         var selectedOffset = selectedItems[0].getCells()[6].getText();
            //         var selectedStatus = selectedItems[0].getCells()[7].getText();
            //         if (selectedStatus === "Active") {
            //             sap.ui.getCore().byId("idSwitchBtn").setState(true);
            //         }
            //         else {
            //             sap.ui.getCore().byId("idSwitchBtn").setState(false);
            //         }
            //         sap.ui.getCore().byId("idRefText").setValue(selectedCharName);
            //         sap.ui.getCore().byId("idRefDesc").setValue(selectedCHarDesc);
            //         sap.ui.getCore().byId("idWeight").setValue(selectedWeight);
            //         sap.ui.getCore().byId("idValidFrom").setValue(selectedValidFrom);
            //         sap.ui.getCore().byId("idValidTo").setValue(selectedValidTo);
            //         sap.ui.getCore().byId("idOffser").setValue(selectedOffset);
            //         sap.ui.getCore().byId("idOffser").setValueState("None");
            //         that._valueHelpDialogRefCharval.open();
            //     }
            //     else {
            //         MessageToast.show("Please select only one Item");
            //     }
            // },
            /**ON Press of Cancel in Ref CharValue Fragment */
            onRefCancel: function () {
                that._valueHelpDialogRefCharval.close();
            },
            /**On Press of Step2 */
            onStep2Press: function () {
                that.byId("idConfigText1").setText(that.selectedConfigProduct);
                that.byId("idCharValue1").setValue(that.newcharSelected);
                that.byId("idCharValText1").setText(that.mewCharDescp);

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
            /**On Press of Ok in RefCharVal Fragment */
            // onOkPress: function () {
            //     var selectedCHar = sap.ui.getCore().byId("idRefText").getValue();
            //     var selectedCHarNAME = sap.ui.getCore().byId("idRefDesc").getValue();
            //     var selectedWeight = sap.ui.getCore().byId("idWeight").getValue();
            //     var selectedFromDate = sap.ui.getCore().byId("idValidFrom").getValue();
            //     var selectedToDate = sap.ui.getCore().byId("idValidTo").getValue();
            //     var selectedOffSet = sap.ui.getCore().byId("idOffser").getValue();
            //     var selectedStatus = sap.ui.getCore().byId("idSwitchBtn").getState();
            //     if (selectedStatus === true) {
            //         var selectedNewStatus = "Active";
            //     }
            //     else {
            //         var selectedNewStatus = "Inactive";
            //     }
            //     if (selectedCHar && selectedCHarNAME && selectedWeight && selectedFromDate && selectedToDate && selectedOffSet && selectedNewStatus) {
            //         if (selectedOffSet > 0) {
            //             that.charsSelected = that.charsSelected.map(item => {
            //                 if (item.CHAR_VALUE === selectedCHar && item.CHAR_NAME === selectedCHarNAME) {
            //                     return {
            //                         ...item,
            //                         WEIGHT: selectedWeight,
            //                         VALIDFROM: selectedFromDate,
            //                         VALIDTO: selectedToDate,
            //                         OFFSETDAYS: selectedOffSet,
            //                         STATUS: selectedNewStatus
            //                     };
            //                 } else {
            //                     return item; // Keep the item unchanged
            //                 }
            //             });
            //             that.etModel.setData({ charList: that.charsSelected });
            //             that.byId("idOldCharList").setModel(that.etModel);
            //             that.byId("idOldCharList").removeSelections();
            //             sap.ui.getCore().byId("idWeight").setValue("100");
            //             sap.ui.getCore().byId("idValidFrom").setValue();
            //             sap.ui.getCore().byId("idValidTo").setValue();
            //             sap.ui.getCore().byId("idOffser").setValue();
            //             sap.ui.getCore().byId("idOffser").setValueState("None");
            //             sap.ui.getCore().byId("idSwitchBtn").setState(true);
            //             sap.ui.getCore().byId("idValidTo").setEnabled(false);
            //             that._valueHelpDialogRefCharval.close();
            //         }
            //         else {
            //             sap.ui.getCore().byId("idOffser").setValueState("Error");
            //             MessageToast.show("Offset of Days cannot be 0");
            //         }
            //     }
            //     else {
            //         MessageToast.show("Please fill in all required fields.");
            //     }
            // },
            /**On Press of Step 4 */
            onStep4Press: function () {
                // var object = { LAUNCH: [{ DIMENSIONS: 'LOCATION_ID' }, { DIMENSIONS: 'PRODUCT_ID' }], VALUE: '', ROW: 1 };
                var object = { LAUNCH: [{ DIMENSIONS: 'Location', VALUE: '', ROW: 1 }, { DIMENSIONS: 'Partial Product', VALUE: '', ROW: 2 }] };
                that.byId("idNewDimen").setValue(that.newcharSelected);
                that.byId("idLaunchText").setText(that.mewCharDescp);
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
                    this.getOwnerComponent().getModel("BModel").read("/getLocation", {
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
                            key: oItem.getDescription(),
                            text: oItem.getTitle(),
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
                            key: oItem.getDescription(),
                            text: oItem.getTitle(),
                            editable: false
                        })
                    );
                });
            },
            /**On Step 5 Press */
            onStep5Press: function () {
                sap.ui.core.BusyIndicator.show();
                that.combinedArray = [];
                var newObject = {}, locArray = [], prodArray = [];
                that.byId("idPhaseInChar").setValue(that.newcharSelected);
                that.byId("idPhaseInText").setText(that.mewCharDescp);
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
                var date = new Date();
                var previousDate = date.getDate() - 1;
                date = date.setDate(previousDate);
                var items = that.byId("idDimenTable").getItems();
                if(items[0].getCells()[1].getTokens().length>0 && items[1].getCells()[1].getTokens().length>0){
                var locItems = items[0].getCells()[1].getTokens();
                var prodItems = items[1].getCells()[1].getTokens();              
                if (locItems.length > 0) {
                    for (var i = 0; i < locItems.length; i++) {
                        newObject = {
                            LOCATION_ID: locItems[i].getText(),
                            LOCATION_DESC: locItems[i].getKey(),
                            HISTORY_CONSIDERATION: new Date(date),
                            PHASE_IN: ''
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
                that.step5Model.setData({ PhaseInList: that.combinedArray });
                that.byId("idPhaseInTab").setModel(that.step5Model);
                sap.ui.core.BusyIndicator.hide();
            }
            else if(items[0].getCells()[1].getTokens().length===0 && items[1].getCells()[1].getTokens().length===0){
                var newObject={},locArray=[],prodArray=[];
                that.combinedArray=[];
                this.getOwnerComponent().getModel("BModel").read("/getLocation", {
                    success: function (oData1) {
                        if (oData1.results.length > 0) {
                            that.locDetails1 = [];
                            that.locDetails1 = oData1.results;
                            
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
                            that.prods1 = [];
                            that.prods1 = oData1.results;
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
            /**ON press of add in step 4 table */
            // onAddPressed: function () {
            //     var tableData = that.byId("idDimenTable").getModel().getData().dimenList;
            //     var object = { LAUNCH: [{ DIMENSIONS: 'LOCATION_ID' }, { DIMENSIONS: 'PRODUCT_ID' }], VALUE: '', ROW: tableData.length + 1 };
            //     tableData.push(object);
            //     that.byId("idDimenTable").getModel().refresh();

            // },
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
                        if (that.newCharNum.getValue() !== "" && that.newCharNum.getValue() !== undefined) {
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/nextButtonVisible", true);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", false);
                        }
                        else {
                            MessageToast.show("Please select a Characteristic Value");
                        }
                        break;
                    case "Reference Assignments":
                        if (that.oldCharVal.getTokens().length > 0) {
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/nextButtonVisible", true);
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", false);
                        }
                        else {
                            MessageToast.show("Please select atleast one Reference Characteristic");
                        }
                        break;
                    case "Reference Details":
                        var oTable = this.byId("idOldCharList");
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
                                if (tabData[i].getCells()[3].getValue() > 0) {
                                    sumarray.push(Number(tabData[i].getCells()[3].getValue()));
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
                        var oTable = this.byId("idDimenTable");
                        var aItems = oTable.getItems();
                        var bIsEmpty = false;
                        for (var i = 0; i < aItems.length; i++) {
                            if (aItems[i].getCells()[1].getTokens().length === 0) {
                                bIsEmpty = true;
                                // return false
                                break;
                            }
                        }

                        // if (bIsEmpty) {
                        //     return MessageToast.show("Atleast one of the row's data is empty. Please fill in all the details.");
                        // } else {
                            that._oWizard.nextStep();
                            that._iNewSelectedIndex++
                            oModel.setProperty("/nextButtonVisible", false);
                            oModel.setProperty("/backButtonVisible", true);
                            oModel.setProperty("/reviewButtonVisible", false);
                            oModel.setProperty("/finishButtonVisible", true);
                            break;
                        // }
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
                        oModel.setProperty("/backButtonVisible", true);
                        oModel.setProperty("/finishButtonVisible", false);
                        that.tokens = [];
                        that.byId("idOldChar").removeAllTokens();
                        that.etModel.setData({ charList: [] });
                        that.byId("idOldCharList").setModel(that.etModel);
                        break;

                    case "Reference Assignments":
                        oModel.setProperty("/nextButtonVisible", true);
                        oModel.setProperty("/backButtonVisible", false);
                        oModel.setProperty("/finishButtonVisible", false);
                        that.prodModel.setData({ setCharacteristics: that.aDistinct })
                        sap.ui.getCore().byId("idCharSelect").setModel(that.prodModel);
                        break;

                    default: break;
                }
            },
            /**On Change of Date in From Field in RefCharVal Fragment */
            onFromDateChange: function (oEvent) {
                var selectedDate = oEvent.getSource().getDateValue();
                // sap.ui.getCore().byId("idValidTo").setMinDate(selectedDate);
                // sap.ui.getCore().byId("idValidTo").setEnabled(true);
                oEvent.getSource().getParent().getCells()[5].setEnabled(true);
                oEvent.getSource().getParent().getCells()[5].setMinDate(selectedDate);
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
                that.byId("idConfigText").setText();
                that.byId("idCharValText").setText();
                that.byId("idCharName").setValue();
                // that.prodModel.setData({ setCharacteristics: []})
                // sap.ui.getCore().byId("idCharSelect").setModel(that.prodModel);

                /**Clearing data in Step 2 */
                that.byId("idCharValue1").setValue();
                that.byId("idConfigText1").setText();
                that.byId("idCharValText1").setText();
                that.byId("idOldCharValue").removeAllTokens();
                that.TemplateModel.setData({ setOldCharacteristics: [] });
                sap.ui.getCore().byId("idCharOldSelect").setModel(that.TemplateModel);

                /**Clearing data in Step 3 */
                that.byId("idNewValue").setValue();
                that.byId("idste3Text").setText();
                that.byId("idOldChar").setTokens();
                that.etModel.setData({ charList: [] });
                that.byId("idOldCharList").setModel(that.etModel);
                sap.ui.getCore().byId("idOffser").setValueState("None");

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
                            CHAR_VALUE: that.newcharSelected,
                            REF_CHAR_VALUE: tableItemsStep3[j].getCells()[0].getText(),
                            WEIGHT: parseInt(tableItemsStep3[j].getCells()[3].getValue()),
                            VALID_FROM: tableItemsStep3[j].getCells()[4].getDateValue(),
                            VALID_TO: tableItemsStep3[j].getCells()[5].getDateValue(),
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
                var selectedNum = oEvent.getParameters().selectedItems[0].getDescription();
                that.allCharacterstics = [], that.aDistinct = [];
                that.allCharacterstics = that.newChars;
                var allChars = that.newChars.filter(a=>a.CHAR_NAME === selectedName && a.CHAR_NUM === selectedNum);
                // that.aDistinct = that.removeDuplicate(that.allCharacterstics, 'CHAR_NAME');
                that.aDistinct = that.totalTabData;
                that.aDistinct = that.getUnqiueChars(allChars, that.aDistinct, "CHAR_NUM", "CHAR_VALUE", "CHAR_NUM", "REF_CHAR_VALUE");
                that.aDistinct = that.aDistinct.filter(obj => !obj.hasOwnProperty("PROJECT_ID"));
                that.prodModel.setData({ setCharacteristics: that.aDistinct })
                sap.ui.getCore().byId("idCharSelect").setModel(that.prodModel);
                that.byId("idCharValue").setEnabled(true);
                that.byId("idCharValue").setValue();
                that.byId("idCharName").setValue(selectedName);

    },
    /**On press of delete in Table in step5 */
    onStep5delete:function(oEvent){
        var selectedIndex = oEvent.getParameter("listItem").getBindingContext().sPath.split("/")[2];
        var aData = that.step5Model.getData().PhaseInList;
        aData.splice(selectedIndex,1);
        that.step5Model.refresh();
    }
        });
    });