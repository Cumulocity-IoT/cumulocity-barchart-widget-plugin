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

            // Get datapoints
            this.configDatapoints = this.config.customwidgetdata.datapoints;
            if(this.configDatapoints === undefined || this.configDatapoints.length === 0) {
                throw new Error("Bar chart widget - Datapoints are not configured.");
            }
            let datapointsLength = this.configDatapoints.length;

            // Add labels to the array
            this.chart.data.labels = this.configDatapoints.map((dp) => {
                // Create sub-array by splitting by space to enable multi-line label.
                return dp.label.split(" ");
            });

            // Add colors to the array
            this.chart.data.colors = this.configDatapoints.map((dp) => {
                return dp.color;
            });

            // Add points to the array
            for(let i=0; i<datapointsLength; i++) {
                if(this.configDatapoints[i].valueType === "constant") {
                    if(this.configDatapoints[i].value === undefined || this.configDatapoints[i].value === "") {
                        console.log("Bar chart widget - Value is missing.");
                        this.chart.data.points.push(0);
                    } else {
                        this.chart.data.points.push(this.configDatapoints[i].value);
                    }
                } else if(this.configDatapoints[i].valueType === "measurement") {
                    if(this.configDatapoints[i].managedObjectId === undefined || this.configDatapoints[i].managedObjectId === ""){
                        console.log("Bar chart widget - Device/ Device group is missing.");
                        this.chart.data.points.push(0);
                    } else {
                        if(this.configDatapoints[i].value === undefined || this.configDatapoints[i].value === "") {
                            console.log("Bar chart widget - Fragment series is missing.");
                            this.chart.data.points.push(0);
                        } else {
                            let fragmentSeries: string[] = this.configDatapoints[i].value.split(".");
                            let measurementFilter = {
                                source: this.configDatapoints[i].managedObjectId,
                                dateFrom: '1980-01-01',
                                dateTo: formatDate(new Date(), 'yyyy-MM-dd', 'en'),
                                revert: true,
                                valueFragmentType: fragmentSeries[0],
                                valueFragmentSeries: fragmentSeries[1],
                                pageSize: 1
                            };
                            let resp = await this.measurementSvc.list(measurementFilter);
                            this.chart.data.points.push(resp.data[0][fragmentSeries[0]][fragmentSeries[1]].value);
                            
                            // Create realtime subscriptions
                            let subs = this.realtimeSvc.subscribe('/measurements/'+this.configDatapoints[i].managedObjectId, (resp) => {
                                if(resp.data.data[fragmentSeries[0]]) {
                                    if(resp.data.data[fragmentSeries[0]][fragmentSeries[1]]) {
                                        this.chart.data.points[i] = resp.data.data[fragmentSeries[0]][fragmentSeries[1]].value;
                                        this.chart.content.update();
                                    }
                                }
                            });
                            this.realtimeSubscriptions.push(subs);
                        }
                    }
                } else {
                    console.log("Bar chart widget - Invalid value type.");
                }
            }
            
            // Add icons to the array
            this.chart.data.icons = this.configDatapoints.map((dp) => {
                return dp.icon;
            });
            this.columnPercentage = (100 / this.configDatapoints.length) + '%';
        } catch(e) {
            console.log("Bar Chart Widget - "+e);
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
        return 'canvas-'+ this.creationTimestamp;
    }

    ngOnDestroy(): void {
        // unsubscribe from realtime subscriptions'
        try {
            this.realtimeSubscriptions.forEach((subs: object) => {
                this.realtimeSvc.unsubscribe(subs);
            });
            
        } catch (error) {
            console.log("Bar Chart Widget onsubscribe error - "+error);

        }

    }
}
