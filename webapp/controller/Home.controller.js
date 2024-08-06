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
    "sap/m/Dialog",
    'sap/ui/export/Spreadsheet',
    "sap/m/Button"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Device, Fragment, File, mobileLibrary, Dialog, Spreadsheet, Button) {
        "use strict";
        var that, oGModel;
        var ButtonType = mobileLibrary.ButtonType;
        var DialogType = mobileLibrary.DialogType;
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
                that.projModel1 = new JSONModel();
                that.projModel1.setSizeLimit(1000);
                that.partModel.setSizeLimit(1000);
                that.locModel.setSizeLimit(1000);
                that.prodModel1.setSizeLimit(1000);
                that.uniqModel.setSizeLimit(1000);
                that.custModel.setSizeLimit(1000);
                that.oNewModel.setSizeLimit(1000);
                that.phaseOutModel.setSizeLimit(1000);
                this._oCore = sap.ui.getCore();


            },
            onAfterRendering: function () {
                that.tabData = [];
                var oFilter = [];
                // sap.ui.core.BusyIndicator.show();
                
                that.byId("idConfProd").setValue();
                // that.byId("idProjDet").setValue();
                that.byId("idToggleButton").setPressed(false);
                that.byId("idToggleButton1").setPressed(false);
                var selectedProject = that.oGModel.getProperty("/selectedProject");
                var selectedProjectDesc = that.oGModel.getProperty("/selectedProjectDesc");
                // var selectedProduct = that.oGModel.getProperty("/selectedProduct");
                if(selectedProject === undefined || selectedProject === ""){
                    that.onBackToMPD();
                } else {
                that.byId("idprojTitle").setText(selectedProject + " - " + selectedProjectDesc);
                if (selectedProject) {
                    // that.byId("idProjDet").setValue(selectedProject);
                    oFilter.push(new Filter("PROJECT_ID", FilterOperator.EQ, selectedProject));
                }
                // if(selectedProduct){
                //     that.byId("idConfProd").setValue(selectedProduct);
                //     oFilter.push(new Filter("PROJECT_ID", FilterOperator.EQ, selectedProduct))  ;
                // }
                
                // that.byId("idToggleButton2").setPressed(false);
                if (!this._popOver) {
                    this._popOver = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.PopOver",
                        this
                    );
                    this.getView().addDependent(this._popOver);
                }

                if (!this._valueHelpDialogProd) {
                    this._valueHelpDialogProd = sap.ui.xmlfragment(
                        "vcpapp.vcpnpicharvalue.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProd);
                }
                // if (!this._valueHelpDialogProject) {
                //     this._valueHelpDialogProject = sap.ui.xmlfragment(
                //         "vcpapp.vcpnpicharvalue.view.ProjectDetails",
                //         this
                //     );
                //     this.getView().addDependent(this._valueHelpDialogProject);
                // }
                sap.ui.getCore().byId("idList").removeSelections();
                this.getOwnerComponent().getModel("BModel").read("/getProducts", {
                    method: "GET",
                    success: function (oData) {

                        that.prodModel1.setData({ configProdRes: oData.results });
                        sap.ui.getCore().byId("prodSlctListOD").setModel(that.prodModel1);
                        // sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        // sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get configurable products");
                    },
                });
                this.getOwnerComponent().getModel("BModel").read("/getNPICharVal", {
                    method: "GET",
                    filters: oFilter,
                    success: function (oData) {
                        if (oData.results.length > 0) {

                            that.tabData = oData.results;
                            that.tabData.forEach(function (oItem) {
                                if (oItem.ACTIVE === true) {
                                    oItem.ACTIVE = "Active";
                                }
                                else {
                                    oItem.ACTIVE = "InActive";
                                }

                            });
                            // that.oGModel.setProperty("/charvalData",that.tabData);
                            that.custModel.setData({ configProdResults: that.tabData });
                            that.byId("idOrderList").setModel(that.custModel);
                        } else {
                            that.tabData = oData.results;
                            that.custModel.setData({ configProdResults: that.tabData });
                            that.byId("idOrderList").setModel(that.custModel);
                        }
                        // sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        // sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get new characteristic value data");
                    },
                });
                this.getOwnerComponent().getModel("BModel").read("/getPhaseOutDet", {
                    method: "GET",
                    filters: oFilter,
                    success: function (oData) {
                        that.tabPhaseData = [];
                        if (oData.results.length > 0) {                            
                            that.tabPhaseData = oData.results;
                            // that.phaseOutModel.setData({ phaseOutDet: that.tabPhaseData });
                            // that.byId("idPhaseOutList").setModel(that.phaseOutModel);
                        } 
                        that.phaseOutModel.setData({ phaseOutDet: that.tabPhaseData });
                            that.byId("idPhaseOutList").setModel(that.phaseOutModel);
                        sap.ui.core.BusyIndicator.hide()
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("Failed to get phaseout details");
                    },
                });
                
                // var project = that.oGModel.getProperty("/ProjDetails");
                // that.projModel1.setData({ projDetails: project });
                // sap.ui.getCore().byId("idProjDetailsFrag").setModel(that.projModel1);
            
                
            }

            },

            handleValueHelp: function (oEvent) {
                var sId = oEvent.getParameter("id");
                // Prod Dialog
                if (sId.includes("ConfProd")) {
                    that._valueHelpDialogProd.open();
                }
                // else if (sId.includes("idProjDet")) {
                //     that._valueHelpDialogProject.open();
                // }
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
                // var selectedProduct = that.byId("idConfProd").getValue();
                var selectedProject = that.oGModel.getProperty("/selectedProject");
                this._popOver.close();
                sap.ui.getCore().byId("idList").removeSelections();
                that.byId("idToggleButton").setPressed(false);
                that.byId("idToggleButton1").setPressed(false);
                // that.byId("idToggleButton2").setPressed(false);
                if (selectedProject) {
                    if (this._valueHelpDialogProd) {
                        that._valueHelpDialogProd.destroy(true);
                        that._valueHelpDialogProd = "";
                    }
                    if (selectedTitle === "Characteristic Value Replacement") {
                        // sap.ui.core.BusyIndicator.show();
                        // if (that.tabData.length > 0) {
                        //     var tableProjectData = that.tabData.filter(item => item.PROJECT_ID === selectedProject);
                        // }
                        // else {
                        //     var tableProjectData = [];
                        // }
                        that.oGModel.setProperty("/charvalData", that.tabData);
                        // that.oGModel.setProperty("/configProduct", selectedProduct);
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
                        // if (this._valueHelpDialogProd) {
                        //     this._valueHelpDialogProd.destroy(true);
                        //     this._valueHelpDialogProd = "";
                        // }
                    }
                }
                else {
                    MessageToast.show("Please select a Project/Configurable Product");
                }
            },

            /**On Selection of config product in prod dialog */
            handleSelection: function (oEvent) {
                var selectedItem = oEvent.getParameters().selectedItems[0].getTitle();
                that.byId("idConfProd").setValue(selectedItem);
                sap.ui.getCore().byId("prodSlctListOD").getBinding("items").filter([]);
                sap.ui.getCore().byId("prodSlctListOD").clearSelection();

                that.onGetData();
            },

            /**On Press of Reset Button */

            onResetData: function () {
                that.byId("idConfProd").setValue("");
                // that.byId("idProjDet").setValue("");
                // that.byId("newProjSearch").setValue("");
                that.byId("newCharSearch").setValue("");
                that.byId("newPhaseSearch").setValue("");
                that.byId("idOrderList").getBinding("items").filter([]);
                that.custModel.setData({ configProdResults: that.tabData });
                that.byId("idOrderList").setModel(that.custModel);
                that.byId("idPhaseOutList").getBinding("items").filter([]);
                that.phaseOutModel.setData({ phaseOutDet: that.tabPhaseData });
                that.byId("idPhaseOutList").setModel(that.phaseOutModel);
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
                var selectedProd = that.byId("idConfProd").getValue();
                var selectedProject = that.oGModel.getProperty('/selectedProject');
                that.proDetails = [], that.phaseOutData = [];
                that.proDetails = that.tabData;
                that.phaseOutData = that.tabPhaseData;
                if (that.proDetails && that.proDetails.length > 0) {
                    that.proDetails = that.proDetails.filter(item => item.REF_PRODID === selectedProd && item.PROJECT_ID === selectedProject);
                    that.custModel.setData({ configProdResults: that.proDetails });
                    that.byId("idOrderList").setModel(that.custModel);
                    that.phaseOutData = that.phaseOutData.filter(item => item.REF_PRODID === selectedProd && item.PROJECT_ID === selectedProject);
                    that.phaseOutModel.setData({ phaseOutDet: that.phaseOutData });
                    that.byId("idPhaseOutList").setModel(that.phaseOutModel);
                }
                else {
                    MessageToast.show("No new characteristics for the selected product");
                }
            },
            // handleProjSelection: function (oEvent) {
            //     var selectedItemz = oEvent.getParameters().selectedItem.getTitle();
            //     that.byId("idProjDet").setValue(selectedItemz);
            //     sap.ui.getCore().byId("idProjDetailsFrag").getBinding("items").filter([]);
            //     sap.ui.getCore().byId("idProjDetailsFrag").clearSelection();
            // },
            /**Search in Projects dialog */
            handleCharSearch: function (oEvent) {
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
            },
            /**On Press of back navigation button */
            onBackToMPD: function () {
                if (this._valueHelpDialogProd) {
                    that._valueHelpDialogProd.destroy(true);
                    that._valueHelpDialogProd = "";
                }
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("RouteHome", {}, true);
            },
            /**On press of Generate unique ids */
            onGenerateUniqueIds: function () {
                that.selectProject = that.oGModel.getProperty('/selectedProject');
                that.selectProduct = that.byId("idConfProd").getValue();
                var tableItems = that.oTable.getModel().oData.configProdResults;
                if (that.selectProject && that.selectProduct) {
                    var filteredData = tableItems.filter(a => a.PROJECT_ID === that.selectProject && a.REF_PRODID === that.selectProduct);
                    if (filteredData.length > 0) {
                        this.getOwnerComponent().getModel("BModel").read("/getTmpUIDHeader", {
                            filters: [
                                new Filter(
                                    "PRODUCT_ID",
                                    FilterOperator.EQ,
                                    that.selectProduct
                                ),
                                new Filter(
                                    "PROJECT_ID",
                                    FilterOperator.EQ,
                                    that.selectProject
                                ),
                            ],
                            success: function (oData1) {
                                if (oData1.results.length > 0) {
                                    MessageBox.information("Temporary Unique ID's already exists for this combination. Old Temporary Unique ID's will be deleted on press of 'Yes'. Do you want to still generate Temporary Unique ID's?", {
                                        actions: ["Yes", MessageBox.Action.CLOSE],
                                        emphasizedAction: "Yes",
                                        onClose: function (sAction) {
                                            // MessageToast.show("Action selected: " + sAction);.
                                            if (sAction === "Yes") {
                                                that.flag = "X"
                                                that.generateUniqueIds();
                                            }
                                            else {

                                            }
                                        },
                                        dependentOn: that.getView()
                                    });
                                }
                                else {
                                    that.flag = "";
                                    that.generateUniqueIds();
                                    // MessageToast.show("No new characteristics values for the selected product & project.")
                                }
                            },
                            error: function () {
                                MessageToast.show("Failed to get temporary unique details");
                            }
                        });
                    }
                    else {
                        MessageToast.show("Selected Product & Project combination doesn't have any records. Please choose a different Product/Project combination");
                    }
                }
                else {
                    MessageToast.show("Please select configurable product");
                }
            },
            generateUniqueIds: function () {
                // Define the URL and request body
                const data = {
                    PRODUCT_ID: that.selectProduct,
                    PROJECT_ID: that.selectProject,
                    DELFLAG: that.flag
                };
                var aScheduleSEDT = {};
                // Get Job Schedule Start/End Date/Time
                aScheduleSEDT = that.getScheduleSEDT();
                var dCurrDateTime = new Date().getTime();
                var actionText = "/v2/catalog/generateTempUID";
                var JobName = "Temporary Unique ID generation" + dCurrDateTime;
                sap.ui.core.BusyIndicator.show();
                var finalList = {
                    name: JobName,
                    description: "Temporary Unique ID generation",
                    action: encodeURIComponent(actionText),
                    active: true,
                    httpMethod: "POST",
                    startTime: aScheduleSEDT.djSdate,
                    endTime: aScheduleSEDT.djEdate,
                    createdAt: aScheduleSEDT.djSdate,
                    schedules: [{
                        data: data,
                        cron: "",
                        time: aScheduleSEDT.oneTime,
                        active: true,
                        startTime: aScheduleSEDT.dsSDate,
                        endTime: aScheduleSEDT.dsEDate,
                    }]
                };
                this.getOwnerComponent().getModel("JModel").callFunction("/addMLJob", {
                    method: "GET",
                    urlParameters: {
                        jobDetails: JSON.stringify(finalList),
                    },
                    success: function (oData) {
                        // that.byId("idGenSeedOrder").setEnabled(false);
                        sap.m.MessageToast.show("Temporary Unique Id's creation started. Please wait for sometime to create combination Unique Id's" );

                        sap.ui.core.BusyIndicator.hide();
                        that.onResetData();

                    },
                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Service Connectivity Issue!");
                    },
                });
            },
            getScheduleSEDT: function () {
                var aScheduleSEDT = {};
                var dDate = new Date();
                // 07-09-2022-1                
                var idSchTime = dDate.setSeconds(dDate.getSeconds() + 20);
                // 07-09-2022-1
                var idSETime = dDate.setHours(dDate.getHours() + 2);
                idSchTime = new Date(idSchTime);
                idSETime = new Date(idSETime);
                //var onetime = idSchTime;
                var djSdate = new Date(),
                    djEdate = idSETime,
                    dsSDate = new Date(),
                    dsEDate = idSETime,
                    tjStime,
                    tjEtime,
                    tsStime,
                    tsEtime;

                djSdate = djSdate.toISOString().split("T");
                tjStime = djSdate[1].split(":");
                djEdate = djEdate.toISOString().split("T");
                tjEtime = djEdate[1].split(":");
                dsSDate = dsSDate.toISOString().split("T");
                tsStime = dsSDate[1].split(":");
                dsEDate = dsEDate.toISOString().split("T");
                tsEtime = dsEDate[1].split(":");

                var dDate = new Date().toLocaleString().split(" ");
                aScheduleSEDT.djSdate = djSdate[0] + " " + tjStime[0] + ":" + tjStime[1] + " " + "+0000";
                aScheduleSEDT.djEdate = djEdate[0] + " " + tjEtime[0] + ":" + tjEtime[1] + " " + "+0000";
                aScheduleSEDT.dsSDate = dsSDate[0] + " " + tsStime[0] + ":" + tsStime[1] + " " + "+0000";
                aScheduleSEDT.dsEDate = dsEDate[0] + " " + tsEtime[0] + ":" + tsEtime[1] + " " + "+0000";
                aScheduleSEDT.oneTime = idSchTime;

                return aScheduleSEDT;

            },
            /**On Press of show Unique Id's  in home view*/
            onShowUniqueIds:function(){
                var selectedProject = that.oGModel.getProperty('/selectedProject');
                // var seletedProduct = that.byId("idConfProd").getValue();
                if(selectedProject){
                    if (this._valueHelpDialogProd) {
                        that._valueHelpDialogProd.destroy(true);
                        that._valueHelpDialogProd = "";
                    }
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                    oRouter.navTo("Details", {}, true);
                }
            //     if(selectedProject && seletedProduct){

            //     MessageBox.information("Please create Unique Id's before going forward. If already created, please click on Continue", {
            //         actions: ["Continue", MessageBox.Action.CLOSE],
            //         emphasizedAction: "Continue",
            //         onClose: function (sAction) {
            //             // MessageToast.show("Action selected: " + sAction);.
            //             if (sAction === "Continue") {
            //                 var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService
            //                 && sap.ushell.Container.getService("CrossApplicationNavigation");  
            //                 var flag ="X"                          
            //                 var href = ( xnavservice && xnavservice.hrefForExternal({                            
            //                 target : { semanticObject : "TempIdCreate", action : "Display" },                            
            //                 params : { "PROJECT_ID" : selectedProject, "PRODUCT_ID" : seletedProduct, "Flag" : flag }                            
            //                 })) || "";
            //                 xnavservice.toExternal({
            //                     target: {
            //                     shellHash: href
            //                     }
            //                     });
            //                 // sap.m.URLHelper.redirect(window.location.href.split('#')[0] + href, true);
            //             }
                        
            //         },
            //         dependentOn: that.getView()
            //     });
            // }
            // else{
            //     MessageToast.show("Please select a Project/Product");
            // }
            }
        });
    });
