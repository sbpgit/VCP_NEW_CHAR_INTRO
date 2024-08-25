sap.ui.define(
    [
      "vcpapp/vcpnpicharvalue/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      "sap/m/MessageBox",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "sap/ui/Device",
    ],
    function (
      BaseController,
      JSONModel,
      MessageToast,
      MessageBox,
      Filter,
      FilterOperator,
      Device
    ) {
      "use strict";
      var that, oGModel;
  
      return BaseController.extend("vcpapp.vcpnpicharvalue.controller.Details", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         */
        onInit: function () {
          that = this;
          this.bus = sap.ui.getCore().getEventBus();
          this.bus.subscribe(
            "vcpapp.vcpnpicharvalue",
            "addBeginPage",
            this.addBeginPage,
            this
          );
          this.bus.subscribe(
            "vcpapp.vcpnpicharvalue",
            "addDetailPage",
            this.addDetailPage,
            this
          );
          this.bus.subscribe("nav", "toBeginPage", this.toBeginPage, this);
          this.bus.subscribe("nav", "toDetailPage", this.toDetailPage, this);
          this.bus.subscribe("nav", "backToBegin", this.backToBegin, this);
          this.bus.subscribe("nav", "expandBegin", this.expandBegin, this);

          this.bus.subscribe("data", "back", this.onNavback, this);
          this.bus.subscribe("flexible", "buttonVisible", this.buttonVisible, this);
  
          this.oFlexibleColumnLayout = this.byId("fcl");
          this.getRouter()
            .getRoute("Details")
            .attachPatternMatched(this._onPatternMatched.bind(this));
          if (Device.system.phone) {
            this.oFlexibleColumnLayout.setLayout(
              sap.f.LayoutType.MidColumnFullScreen
            );
          } else {
            this.oFlexibleColumnLayout.setLayout(
              sap.f.LayoutType.TwoColumnsBeginExpanded
            );
          }
          var oViewModel = new JSONModel({
            expanded: true,
            midExists: false,
            busy: true,
            delay: 0,
          });
  
          this.setModel(oViewModel, "appView");
  
          if (Device.support.touch) {
            Device.orientation.attachHandler(function (oEvt) {
              NotificationObj.onAfterRendering();
              NotificationObj.iconWidth = 0;
              NotificationObj.oldBeginColNoImgWidth = 0;
              NotificationObj.newMidColumnWidth = 0;
            });
          }
        },
        /**
         * This function is called when come back.
         */
        onExit: function () {
          this.bus.unsubscribe(
            "vcpapp.vcpnpicharvalue",
            "addBeginPage",
            this.addBeginPage,
            this
          );
          this.bus.unsubscribe(
            "vcpapp.vcpnpicharvalue",
            "addDetailPage",
            this.addDetailPage,
            this
          );
          this.bus.unsubscribe("nav", "toBeginPage", this.toBeginPage, this);
          this.bus.unsubscribe("nav", "toDetailPage", this.toDetailPage, this);
          this.bus.unsubscribe("nav", "backToBegin", this.backToBegin, this);
        },
  
        /**
         * Called after the view has been rendered.
         */
        onAfterRendering: function () {
          that = this;
          that.oGModel = this.getOwnerComponent().getModel("oGModel");
          that.proj = that.oGModel.getProperty("/selectedProject");
          // this.getView().byId("fcl").mAggregations._midColumnBackArrow.setVisible(false);
          // if(that.proj !== "" && that.proj !== undefined && that.proj !== null){


          that.byId("idDetailTitle").setText(that.proj + " - Temporary Unique ID Maintenance");

          
          var oViewModel = this.getModel("appView");
          /**  Removing the arrow button inbetween pages(ItemMaster and ItemDetail)*/
          if (this.getView().byId("fcl").mAggregations._beginColumnBackArrow !== undefined) {
            this.getView().byId("fcl").mAggregations._beginColumnBackArrow.setVisible(false);
          }
          //   this.getView().byId("fcl").mAggregations._midColumnNav.setVisible(false)
          /* Menu button option for Device and Desktop*/
          if (!Device.system.desktop) {
            this.byId("leftMenu").setVisible(true);
            this.getModel("appView").setProperty("/expanded", false);
          } else {
            oViewModel.setProperty("/sideMenuBurgerVisible", false);
            oViewModel.setProperty("/expanded", false);
          } 
        // } else {
        //   that.onNavback();
        // }
        },
  
        /**
         * To set the master page
         * @param {string} sChannel - Event channel
         * @param {string} sEvent - Event name
         * @param {object} oView - View to be displayed
         */
        addBeginPage: function (sChannel, sEvent, oView) {
          this.oFlexibleColumnLayout.addBeginColumnPage(oView);
        },
  
        /**
         * Lazy loader for the mid page - only on demand (when the user clicks)
         * @param {string} sChannel - Event channel
         * @param {string} sEvent - Event name
         * @param {object} oView - View to be displayed
         */
        addDetailPage: function (sChannel, sEvent, oView) {
          var aPages = this.oFlexibleColumnLayout.getMidColumnPages(),
            bFound = false;
          for (var i = 0; i < aPages.length; i++) {
            if (aPages[i].getProperty("viewName") === oView.getViewName()) {
              bFound = true;
              break;
            } else {
              bFound = false;
            }
          }
          if (!bFound) {
            this.oFlexibleColumnLayout.addMidColumnPage(oView);
          }
        },
  
        /**
         * To initialize master page
         * @param {string} sChannel - Event channel
         * @param {string} sEvent - Event name
         * @param {object} oView - View to be displayed
         */
        toBeginPage: function (sChannel, sEvent, oView) {
          var aPages = this.oFlexibleColumnLayout.getBeginColumnPages();
          for (var i = 0; i < aPages.length; i++) {
            if (aPages[i].getProperty("viewName") === oView.viewName) {
              this.oFlexibleColumnLayout.toBeginColumnPage(
                this.oFlexibleColumnLayout.getBeginColumnPages()[i]
              );
              break;
            }
          }
        },
  
        /**
         * To get the required detail page
         * @param {string} sChannel - Event channel
         * @param {string} sEvent - Event name
         * @param {object} oView - View to be displayed
         */
        toDetailPage: function (sChannel, sEvent, oView) {
          var aPages = this.oFlexibleColumnLayout.getMidColumnPages();
          for (var i = 0; i < aPages.length; i++) {
            if (aPages[i].getProperty("viewName") === oView.viewName) {
              this.oFlexibleColumnLayout.toMidColumnPage(
                this.oFlexibleColumnLayout.getMidColumnPages()[i]
              );
              break;
            }
          }
          this.oFlexibleColumnLayout.setLayout(
            sap.f.LayoutType.TwoColumnsBeginExpanded
          );
          /* Adding ItemDetail page */
          if (aPages.length < 1) {
            this.getOwnerComponent().runAsOwner(
              function () {
                this.detailView = sap.ui.view({
                  viewName: "vcpapp.vcpnpicharvalue.view.ItemDetail",
                  type: "XML",
                });
                this.oFlexibleColumnLayout.addMidColumnPage(this.detailView);
              }.bind(this)
            );
          } else {
            this.oFlexibleColumnLayout.addMidColumnPage(aPages[0]);
            aPages[0].onAfterRendering();
          }
        },
  
        /**
         * To show only the master page
         */
        backToBegin: function () {
          this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.OneColumn);
        },
  
        /**
         * Called when the URL matches pattern "Details"
         * @constructor
         */
        _onPatternMatched: function () {
          this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.OneColumn);
          var aPages = this.oFlexibleColumnLayout.getBeginColumnPages();
          /* If Begin page has already been added, navigate to it and call 'onAfterRendering' explicitly */
          if (aPages.length < 1) {
            this.getOwnerComponent().runAsOwner(
              function () {
                this.masterView = sap.ui.view({
                  viewName: "vcpapp.vcpnpicharvalue.view.ItemMaster",
                  type: "XML",
                });
                this.oFlexibleColumnLayout.addBeginColumnPage(this.masterView);
              }.bind(this)
            );
          } else {
            this.oFlexibleColumnLayout.toBeginColumnPage(aPages[0]);
            aPages[0].onAfterRendering();
          }
          // var params = that.getOwnerComponent().oComponentData.startupParameters;
          // that.oGModel = this.getOwnerComponent().getModel("oGModel");
          // if (params.PRODUCT_ID && params.PROJECT_ID) {
          //     that.oGModel.setProperty("/SelectedProducted",params.PRODUCT_ID[0]);
          //     that.oGModel.setProperty("/SelectedProjected",params.PROJECT_ID[0]);
          //     that.oGModel.setProperty("/SelectedFlag",params.Flag[0]);
          // }
        },
        onNavback:function(){
          that.bus.publish("data", "Destroy");
          var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
          oRouter.navTo("MaintainProject", {}, true);


        },
  
        expandBegin: function () {
          this.bus.publish("nav", "backToBegin");
          /* Handling Ment button when we are in Item Master page  */
          if (!Device.system.desktop) {
            this.byId("leftMenu").setVisible(false);
            this.getModel("appView").setProperty("/expanded", true);
          }
        },
        buttonVisible:function(){
          that.byId("fcl").mAggregations._beginColumnBackArrow.setVisible(true);
          that.byId("fcl").mAggregations._beginColumnBackArrow.setIcon("sap-icon://decline");
          // that.byId("fcl").mAggregations._midColumnForwardArrow.attachBrowserEvent("click", that.exitScreen.bind(that));
          that.byId("fcl").mAggregations._beginColumnBackArrow.attachPress("click", that.exitScreen.bind(that));
        },
        exitScreen:function(){
          that.byId("fcl").mAggregations._beginColumnBackArrow.setVisible(false);
          this.oFlexibleColumnLayout.setLayout(sap.f.LayoutType.OneColumn);
        
            
        }




      });
    }
  );
  