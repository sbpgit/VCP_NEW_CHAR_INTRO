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
        return Controller.extend("vcpapp.vcpnpicharvalue.controller.MaintainProject", {
            onInit: function () {
                that = this;
                // that.oGModel = this.getOwnerComponent().getModel("oGModel");
                that.projModel = new JSONModel();
                that.projModel.setSizeLimit(1000);
                this._oCore = sap.ui.getCore();
            },
            onAfterRendering:function(){
                that.oGModel = this.getOwnerComponent().getModel("oGModel");
                if (!this._valueHelpDialogProjectDet) {
                    this._valueHelpDialogProjectDet = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.MultiProjectDetails",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProjectDet);
                }
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
                            that.oGModel.setProperty("/ProjDetails",that.tabProjDe);
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
            /**On Press of create project */
            onPressCreate:function(){
                var projDetTable = that.byId("idMPD").getItems();
                that.projArray = [];
                if (projDetTable.length === 0) {
                    var projectID = "PROJ" + "000001";                       
                }
                else {
                    projDetTable.forEach(function (oItem) {
                        var item = oItem.getCells()[0].getText().slice(4)
                        that.projArray.push(item)
                    });
                    var maxNumber = that.maxNumber(that.projArray);
                    var incrementedNumber = that.incrmntNum(maxNumber);
                    var projectID = "PROJ" + incrementedNumber;
                }
                if (!this._valueHelpDialogProjectDet) {
                    this._valueHelpDialogProjectDet = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.MultiProjectDetails",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProjectDet);
                    sap.ui.getCore().byId("idProjID").setValue(projectID);
                    this._valueHelpDialogProjectDet.open();
                }
                else {
                    sap.ui.getCore().byId("idProjID").setValue(projectID);
                    this._valueHelpDialogProjectDet.open();
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
            /**On select of preoject details in table */
            onhandlePressMPD:function(oEvent){
                var selectedProject = oEvent.getParameters().listItem.getCells()[2].getText();
                if(selectedProject === "Active"){
                    that.byId("idEdit").setEnabled(false);
                }
                else{
                    that.byId("idEdit").setEnabled(true);
                }
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
            /**On change of switch button in MultiProjDetails fragment */
            onSwitchChange: function (oEvent) {
                var switchState = oEvent.getSource().getState();
                if (switchState === true) {
                    sap.ui.getCore().byId("idRelDate").setDateValue(new Date());
                }
                else {
                    sap.ui.getCore().byId("idRelDate").setDateValue();
                }
            },
            /**On Press of NPI */
            onNPIPress:function(){
                sap.ui.core.BusyIndicator.show();
                var tableSelectedItem = that.byId("idMPD").getSelectedItems();
                if(tableSelectedItem.length>0){
                    that.oGModel.setProperty('/selectedProject',tableSelectedItem[0].getCells()[0].getText());
                }
                else{
                    that.oGModel.setProperty('/selectedProject','');
                }
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("MaintainProject", {}, true);
            }
        });
    });