# Deprecation notice
This plugin is not further developed and it might break with upcoming Cumulocity releases. Use it at your own risk.
The repository is archived but feel free to fork & adapt it to your needs in a new repo.

# Bar Chart widget for Cumulocity [<img width="35" src="https://user-images.githubusercontent.com/32765455/211497905-561e9197-18b9-43d5-a023-071d3635f4eb.png"/>](https://github.com/Cumulcity-IoT/cumulocity-barchart-widget-plugin/releases/download/1.1.1/sag-ps-pkg-barchart-widget-1.1.1.zip)

The Bar Chart widget is the Cumulocity module federation plugin created using c8ycli. This plugin can be used in Application Builder or Cockpit. The Bar Chart widget allows you to define multiple datapoints as constant (fixed) values or actual measurement values in realtime from Device or Device Groups. In addition, you can add custom icon respective to each datapoint. 

### Please choose Bar Chart release based on Cumulocity/Application builder version:

|APPLICATION BUILDER&nbsp; | &nbsp; CUMULOCITY&nbsp; | &nbsp;BAR CHART WIDGET&nbsp; |
|--------------------|------------|------------------|
| 2.0.x              | >= 1016.x.x| 1.x.x            | 

![Preview](assets/img-preview.png)

## Prerequisite
   Cumulocity c8ycli >=1016.x.x
   
   
## Installation

### Runtime Widget Deployment?

* This widget support runtime deployment. Download [Runtime Binary](https://github.com/Cumulcity-IoT/cumulocity-barchart-widget-plugin/releases/download/1.1.1/sag-ps-pkg-barchart-widget-1.1.1.zip) and install via Administrations --> Ecosystems --> Applications --> Packages.


## QuickStart

  

This guide will teach you how to add widget in your existing or new dashboard.

  



1. Open you application from App Switcher

  

2. Add new dashboard or navigate to existing dashboard

  

3. Click `Add Widget`

  

4. Search for `Bar Chart`

  

5. Select `Target Assets or Devices`

  

7. Click `Save`

  

Congratulations! Bar Chart is configured.

## User Guide

### Configuration - to view the Bar Chart widget
1. Make sure you have successfully installed the widget.
2. Click on `Add widget`.
3. Choose `Bar chart` widget.
4. `Title` is the title of widget. Provide a relevant name. You may choose to hide this. Go to `Appearance` tab and choose `Hidden` under `Widget header style`.
5. `Delete datapoint` allows you to delete a datapoint.
6. `Label` is the name of the datapoint that will appear on the x-axis.
7. `Icon` is for the icon you want to show on the top of the datapoint.
8. `Value type` allows to you choose whether datapoint will have a `Constant` value or a `Measurement` value from a Device or a Device Group.
9. `Value type` is `Constant`.
    1. `Value` allows you provide a fixed value (numerical) for the datapoint.
10. `Value type` is `Measurement`.
    1. `Select device/ device group` allows you to choose a Device or Device Group.
    2. `Select fragment series` allows you to choose a `Fragment` and `Series` combined. It automatically gets populated based on the device or device group selected.
11. `Color` allows you choose a color specific for the bar.
12. `Add new datapoint` allows you to define additional datapoints.
13. Click `Save` to add the widget on the dashboard.
14. In case you see unexpected results on the widget, refer to browser console to see if there are error logs.

------------------------------

This widget is provided as-is and without warranty or support. They do not constitute part of the Cumulocity product suite. Users are free to use, fork and modify them, subject to the license agreement. While Cumulocity GmbH welcomes contributions, we cannot guarantee to include every contribution in the master project.

------------------------------

For more information you can ask a question in the [Tech community Forums](https://techcommunity.cumulocity.com).
  

