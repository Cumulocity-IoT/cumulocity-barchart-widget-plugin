/**
 * /*
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
 *
 * @format
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { MeasurementService, Realtime } from '@c8y/ngx-components/api';
import { formatDate } from '@angular/common';
import * as  ChartDataLabels from 'chartjs-plugin-datalabels';

interface CustomChart {
    position: string,
    content: any,
    type: string,
    data: {
        points: number[],
        labels: string[],
        icons: string[],
        colors: string[]
    }
}


@Component({
    selector: "lib-c8y-barchart-widget",
    templateUrl: "./c8y-barchart-widget.component.html",
    styleUrls: ["./c8y-barchart-widget.component.css"],
})
export class C8yBarchartWidget implements OnDestroy, OnInit {
    @Input() config;

    private configDatapoints = [];
    private creationTimestamp;
    private realtimeSubscriptions: object[] = [];

    public columnPercentage = '100%';
    public chart: CustomChart = {
        position: 'bottom',
        content: {},
        type: 'bar',
        data: {
            points: [],
            labels: [],
            icons: [],
            colors: []
        }
    };

    constructor(private measurementSvc: MeasurementService, private realtimeSvc: Realtime) {
    }

    async ngOnInit() {
        try {
            
            // Get creation timestamp
            this.creationTimestamp = this.config.customwidgetdata.creationTimestamp;

            // Get constant datapoints
            this.configDatapoints = this.config.customwidgetdata.datapoints;

            // Add points to the array
            if(this.configDatapoints && this.configDatapoints.length > 0){
                let datapointsLength = this.configDatapoints.length;
            for (let i = 0; i < datapointsLength; i++) {
                if (this.configDatapoints[i].valueType === "constant") {
                    this.chart.data.labels.push(this.configDatapoints[i].label);
                    this.chart.data.colors.push(this.configDatapoints[i].color);
                    this.chart.data.icons.push(this.configDatapoints[i].icon);
                    if (this.configDatapoints[i].value === undefined || this.configDatapoints[i].value === "") {
                        console.log("Bar chart widget - Value is missing.");
                        this.chart.data.points.push(0);
                    } else {
                        this.chart.data.points.push(this.configDatapoints[i].value);
                    }
                } 
                else {
                    console.log("Bar chart widget - Invalid value type.");
                }
            }
            }
            //configuring datapoints
            if(this.config.datapoints && this.config.datapoints.length > 0){
                    for(let i=0;i<this.config.datapoints.length;i++){
                    if(this.config.datapoints[i].__active=== true){
                        //pushing label name
                        this.chart.data.labels.push(this.config.datapoints[i].label);
                        //pushing color
                        this.chart.data.colors.push(this.config.datapoints[i].color);
                        //pushing icons if any
                        if(this.config.datapoints[i].icon){
                            this.chart.data.icons.push(this.config.datapoints[i].icon);
                        }
                        else{
                            this.chart.data.icons.push("");
                        }
                        //pushing measurement
                        let fragment=this.config.datapoints[i].fragment;
                        let series=this.config.datapoints[i].series;
                        let measurementFilter = {
                            source: this.config.datapoints[i].__target.id,
                            dateFrom: '1980-01-01',
                            dateTo: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
                            revert: true,
                            valueFragmentType: fragment,
                            valueFragmentSeries: series,
                            pageSize: 1
                        };
                        let resp = await this.measurementSvc.list(measurementFilter);
                        this.chart.data.points.push(resp.data[0][fragment][series].value);
                    
                        let subs = this.realtimeSvc.subscribe('/measurements/' + this.config.datapoints[i].__target.id, (resp) => {
                            if (resp.data.data[fragment]) {
                                if (resp.data.data[fragment][series]) {
                                    const ind=this.chart.data.labels.findIndex((ele)=> ele == this.config.datapoints[i].label);
                                    this.chart.data.points[ind] = resp.data.data[fragment][series].value;
                                    this.chart.content.update();
                                }
                            }
                        });
                        this.realtimeSubscriptions.push(subs);
                    }
                }
            }
            this.columnPercentage = (100 / this.chart.data.labels.length) + '%';
        } catch (e) {
            console.log("Bar Chart Widget - " + e);
        }

        // Show chart
        setTimeout(() => {
            this.showChart();
        }, 500);
    }

    private showChart(): void {
        this.chart.content = new Chart(this.getUniqueIdForChart(), {
            type: this.chart.type,
            plugins: [ChartDataLabels as any],
            data: {
                labels: this.chart.data.labels,
                datasets: [
                    {
                        data: this.chart.data.points,
                        backgroundColor: this.chart.data.colors
                    }
                ]
            },
            options: {
                legend: {
                    display: false
                },
                elements: {
                    point: {
                        radius: 1
                    }
                },
                tooltips: {
                    enabled: true
                },
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        display: true,
                        gridLines: {
                            display: false,
                        }
                    }],
                    yAxes: [{
                        display: false,
                        gridLines: {
                            display: false,
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                },
                layout: {
                    padding: {
                        top: 25
                    }
                },
                plugins: {
                    datalabels: {
                        color: this.chart.data.colors,
                        anchor: 'end',
                        align: 'top'
                    }
                }
            }
        });
    }

    // Getter Chart ID
    public getUniqueIdForChart(): string {
        return 'canvas-' + this.creationTimestamp;
    }

    ngOnDestroy(): void {
        // unsubscribe from realtime subscriptions'
        try {
            this.realtimeSubscriptions.forEach((subs: object) => {
                this.realtimeSvc.unsubscribe(subs);
            });

        } catch (error) {
            console.log("Bar Chart Widget onsubscribe error - " + error);

        }

    }
}
