/*
* Copyright (c) 2019 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FetchClient, InventoryService } from '@c8y/ngx-components/api';
import { DatapointAttributesFormConfig, DatapointSelectorModalOptions, KPIDetails } from '@c8y/ngx-components/datapoint-selector';
import * as _ from "lodash";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function singleDatapointValidation(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => { 
      const datapoints: any[] = control.value; 
      if (!datapoints || !datapoints.length) {  return null;  }  
      const activeDatapointsList = datapoints.filter(datapoint => datapoint.__active);  
      if (activeDatapointsList.length === 1) { 
        return null;  
      } 
      return { singleDataPointActive: true }; 
    };

  }

@Component({
    selector: "c8y-barchart-widget-config-component",
    templateUrl: "./c8y-barchart-widget.config.component.html",
    styleUrls: ["./c8y-barchart-widget.config.component.css"]
})
export class C8yBarchartWidgetConfig implements OnInit, OnDestroy {

    @Input() config: any = {};

    public managedObjectList = [];

    public widgetInfo = {
        creationTimestamp: Date.now(),
        datapoints: [
            {
                label: '',
                valueType: 'constant',
                managedObjectId: '',
                value: '',
                icon: '',
                supportedFragmentSeries: [],
                color: '#1b73b6'
            }
        ]
    };

    datapointSelectDefaultFormOptions: Partial<DatapointAttributesFormConfig> = {
        showRange: false,
        showChart: false,
      };
      datapointSelectionConfig: Partial<DatapointSelectorModalOptions> = {};
      formGroup: ReturnType<C8yBarchartWidgetConfig['createForm']>;

    private destroy$ = new Subject<void>();

    constructor(private invSvc: InventoryService, private fetchClient: FetchClient, private formBuilder: FormBuilder, private form: NgForm) { }

    ngOnInit(): void {
        this.getAllDevicesAndGroups();
        if (_.has(this.config, 'customwidgetdata')) {
            this.widgetInfo = _.get(this.config, 'customwidgetdata');
        } else { // Adding a new widget
            _.set(this.config, 'customwidgetdata', this.widgetInfo);
        }
        this.initForm();
        this.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        this.config.datapoints = [ ...value.datapoints ];
    });
    }

    public addNewDatapoint() {
        this.widgetInfo.datapoints.push(
            {
                label: '',
                valueType: 'constant',
                managedObjectId: '',
                value: '',
                icon: '',
                supportedFragmentSeries: [],
                color: '#1b73b6'
            }
        );
        this.updateConfig();
    }

    public deleteDatapoint(index: number) {
        this.widgetInfo.datapoints.splice(index, 1);
        this.updateConfig();
    }

    public updateConfig(): void {
        _.set(this.config, 'customwidgetdata', this.widgetInfo);console.log("onUpdate:",this.config);
    }

    public updateIconInConfig($event: Event, index: number) {
        const dpIcon = ($event.target as HTMLInputElement).files[0];
        const reader = new FileReader();
        reader.readAsDataURL(dpIcon);
        reader.onload = () => {
            this.widgetInfo.datapoints[index].icon = reader.result as string;
            _.set(this.config, 'customwidgetdata', this.widgetInfo);
        };
    }

    public datapointsIconChange($event: Event, index: number){
        const dpIcon = ($event.target as HTMLInputElement).files[0];
        const reader = new FileReader();
        reader.readAsDataURL(dpIcon);
        reader.onload = () => {
            this.config.datapoints[index].icon=reader.result as string;
        }
    }

    public valueTypeChanged(index: number): void {
        this.widgetInfo.datapoints[index].value = "";
        this.widgetInfo.datapoints[index].managedObjectId = "";
        this.updateConfig();
    }

    public managedObjectChanged(moId: string, index: number) {
        this.fetchMeasurements(moId, index);
        this.updateConfig();
    }

    private async fetchMeasurements(moId: string, index: number) {
        this.widgetInfo.datapoints[index].supportedFragmentSeries = [];
        this.fetchClient.fetch("/inventory/managedObjects/" + moId + "/supportedSeries").then((resp) => {
            resp.json().then((body) => {
                body.c8y_SupportedSeries.forEach((series) => {
                    this.widgetInfo.datapoints[index].supportedFragmentSeries.push(series);
                });
            });
        });
    }

    private getAllDevicesAndGroups() {
        const filter = {
            pageSize: 2000,
            withTotalPages: true,
            query: "(has(c8y_IsDevice) or has(c8y_IsDeviceGroup))",
        };
        this.invSvc.list(filter).then((resp) => {
            resp.data.forEach((mo) => {
                this.managedObjectList.push({
                    id: mo.id,
                    name: mo.name
                });
            });
        }, (err) => {
            console.log("Bar Chart widget Configuration: " + err);
        });
    }

    ngOnDestroy(): void {
        //unsubscribe from observables here
    }

    private initForm(): void {
        this.formGroup = this.createForm();
        this.form.form.addControl('config', this.formGroup);
        if (this.config?.datapoints) {
          this.formGroup.patchValue({ datapoints: this.config.datapoints });
        }
      }
    
    private createForm() {
        return this.formBuilder.group({
          datapoints: this.formBuilder.control(new Array<KPIDetails>(), [])
        });
      }

}