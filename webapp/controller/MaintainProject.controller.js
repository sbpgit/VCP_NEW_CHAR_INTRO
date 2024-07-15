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
                that.projDetModel = new JSONModel();
                that.projDetModel.setSizeLimit(1000);
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
                if (!this._valueHelpLinkProject) {
                    this._valueHelpLinkProject = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.OpenProjDet",
                        this
                    );
                    this.getView().addDependent(this._valueHelpLinkProject);
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
                                    oItem.STATE =false;
                                    oItem.SWITCH = true;
                                }
                                else {
                                    oItem.PROJ_STATUS = "InActive";
                                    oItem.STATE=true;
                                    oItem.SWITCH = false;
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
            // onhandlePressMPD:function(oEvent){
            //     var selectedProject = oEvent.getParameters().listItem.getCells()[2].getText();
            //     if(selectedProject === "Active"){
            //         that.byId("idEdit").setEnabled(false);
            //     }
            //     else{
            //         that.byId("idEdit").setEnabled(true);
            //     }
            // },
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
                    sap.ui.getCore().byId("idswtichbox").setVisible(true);

                    // if (objectItems.PROJ_STATUS === "Active") {
                    //     sap.ui.getCore().byId("idSwitchState").setState(true);
                    // }
                    // else {
                    //     sap.ui.getCore().byId("idSwitchState").setState(false);
                    // }
                    // if (objectItems.RELEASE_DATE) {
                    //     sap.ui.getCore().byId("idRelDate").setValue(objectItems.RELEASE_DATE.toLocaleDateString());
                    // }

                }
            },
             
            /**On click of save MultiProjectDetails */
            onProjSave: function (oEvent) {
                var object = {}, finalArray = [];
                var projID = sap.ui.getCore().byId("idProjID").getValue();
                var projDetails = sap.ui.getCore().byId("idProjDesc").getValue();
                var releaseDate = null;
                var projStatus = sap.ui.getCore().byId("idSwitchState").getState();
                // if (projStatus === true) {
                //     var releaseDate = new Date();
                // }
                // else {
                //     var releaseDate = null;
                // }

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
            /**On change of switch button in Maintain projects view */
            onStateChange: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var switchState = oEvent.getSource().getState();
                if (switchState === true) {
                    var object1 = {}, finalArray1 = [];
                    var projID = oEvent.getSource().getParent().getBindingContext().getObject().PROJECT_ID;
                    var projDetails = oEvent.getSource().getParent().getBindingContext().getObject().PROJECT_DET;
                    var projStatus = true;
                    var releaseDate = new Date();
    
                    object1 = {
                        PROJECT_ID: projID,
                        PROJECT_DET: projDetails,
                        PROJ_STATUS: projStatus,
                        RELEASE_DATE: releaseDate,
                    }
                    finalArray1.push(object1);
                    this.getOwnerComponent().getModel("BModel").callFunction("/saveProjDetails", {
                        method: "GET",
                        urlParameters: {
                            NEWPROJDET: JSON.stringify(finalArray1)
                        },
                        success: function (oData) {
                            MessageToast.show(oData.saveProjDetails);
                            // that.onProjCancel();
                            that.onAfterRendering();
                            sap.ui.core.BusyIndicator.hide();
                        },
                        error: function () {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("Failed to save project details");
                        },
                    });
                }
                
            },
            /**On Press of NPI */
            onNPIPress:function(){
                sap.ui.core.BusyIndicator.show();
                var tableSelectedItem = that.byId("idMPD").getSelectedItems();
                var tableItems = that.byId("idMPD").getItems();
                if(tableItems.length>0){
                if(tableSelectedItem.length>0){
                    that.oGModel.setProperty('/selectedProject',tableSelectedItem[0].getCells()[0].getText());
                }
                else{
                    that.oGModel.setProperty('/selectedProject','');
                }
            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
            oRouter.navTo("MaintainProject", {}, true);
                }
                else{
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("No Projects available yet. Please create a Project before moving forward.")
                }
            },
            /**On Search in table */
            oHomesearch:function(oEvent){
                var sQuery = oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                sId = oEvent.getParameter("id"),
                oFilters = [];
            // Check if search filter is to be applied
            sQuery = sQuery ? sQuery.trim() : "";
            if (sId.includes("newProjSearch")) {
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
            else if (sId.includes("newDetSearch")) {
                if (sQuery !== "") {
                    oFilters.push(
                        new Filter({
                            filters: [
                                new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                new Filter("CHAR_NAME", FilterOperator.Contains, sQuery),
                                new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery),
                                new Filter("REF_CHAR_VALUE", FilterOperator.Contains, sQuery)
                            ],
                            and: false,
                        })
                    );
                }
                sap.ui.getCore().byId("idProjDetails").getBinding("items").filter(oFilters);
            }
            },
            /**On Press of link in Table */
            onLinkPress:function(oEvent){
                sap.ui.core.BusyIndicator.show();
                that.selectedProjectDet;
                that.selectedProjectDet = oEvent.getSource().getText();
                this.getOwnerComponent().getModel("BModel").read("/getNPICharVal", {
                    method: "GET",
                    filters:[
                        new Filter("PROJECT_ID", FilterOperator.EQ,that.selectedProjectDet)
                    ],
                    success: function (oData) {
                        if (oData.results.length > 0) {                           
                            if (!that._valueHelpLinkProject) {
                                that._valueHelpLinkProject = sap.ui.xmlfragment(
                                    "vcpapp.vcpnpicharvalue.view.OpenProjDet",
                                    that
                                );
                                that.getView().addDependent(that._valueHelpLinkProject);
                            }
                            that.projDetModel.setData({basicProjDetails:oData.results});
                            sap.ui.getCore().byId("idProjDetails").setModel(that.projDetModel);
                            that._valueHelpLinkProject.open();
                        }
                        else{
                            that.projDetModel.setData({basicProjDetails:[]});
                            sap.ui.getCore().byId("idProjDetails").setModel(that.projDetModel);
                            that._valueHelpLinkProject.open();
                            MessageToast.show("No Details available for this project")
                        }
                        sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get project details");
                    },
                });
            },
            /**On close button in prohect details framgent */
            onButtonClose:function(){
                if (that._valueHelpLinkProject) {
                    that._valueHelpLinkProject.destroy(true);
                    that._valueHelpLinkProject = "";
                }
            },
            /**On Press of Add project in OpenProjdet fragment */
            onProjectAdd:function(){
                var selectedProject = that.selectedProjectDet;
                that.oGModel.setProperty('/selectedProject',selectedProject);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("MaintainProject", {}, true);
                that.onButtonClose();
            }
        });
    });