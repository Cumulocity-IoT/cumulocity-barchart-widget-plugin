/** @format */

//
// Helper classes and interfaces
//
import * as path from 'path';
/**
 * This class will contain all the bespoke config for the widget
 */
export class WidgetConfig {
    /**
     * Members for the config
     * widgetConfiguration.myValue
     */
    myValue: string;
    myImage: any;

    /**
     *  Create an instance of the config object
     */
    constructor() {
        this.myValue = "Default value in config";
        this.myImage = require("@widget-assets/img-preview.png");
    }
}
