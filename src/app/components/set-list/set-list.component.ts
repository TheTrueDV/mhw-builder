import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SortablejsOptions } from 'angular-sortablejs';
import * as _ from 'lodash';
import { SavedSetModel } from 'src/app/models/saved-set.model';
import { SetService } from 'src/app/services/set.service';
import { WeaponType } from 'src/app/types/weapon.type';

@Component({
	selector: 'mhw-builder-set-list',
	templateUrl: './set-list.component.html',
	styleUrls: ['./set-list.component.scss']
})
export class SetListComponent implements OnInit {
	sets: SavedSetModel[] = [];
	virtualItems: SavedSetModel[];
	filteredItems: SavedSetModel[];
	selectedSetIndex = -1;
	loading = 0;

	@ViewChild('saveBox') saveBox: ElementRef;

	eventOptions: SortablejsOptions = {};

	weaponTypeFilter?: WeaponType;
	hideFilterContainer = true;

	constructor(
		private setService: SetService
	) {
		this.eventOptions = {
			onUpdate: (event) => {
				if (this.selectedSetIndex == event.oldIndex) {
					this.selectedSetIndex = event.newIndex;
				}
			}
		};
		this.setService.setsUpdated$.subscribe(sets => {
			this.sets = sets;
			if (this.weaponTypeFilter) {
				this.filteredItems = _.reject(this.sets, item => item.weaponType != this.weaponTypeFilter);
			} else {
				this.filteredItems = this.sets;
			}
		});
	}

	ngOnInit() {
		this.setService.importSet();
		this.sets = this.setService.getSets();
		this.filteredItems = this.sets;
	}

	save(setName: string) {
		if (setName) {
			this.loading = 1;
			this.selectedSetIndex = this.setService.save(setName);
			setTimeout(() => {
				this.loading = 0;
			}, 500);
		}
	}

	saveSets() {
		this.loading = 2;
		this.setService.saveSets();
		setTimeout(() => {
			this.loading = 0;
		}, 500);
	}

	remove(index: number) {
		this.setService.remove(this.sets.indexOf(this.filteredItems[index]));
	}

	select(set: SavedSetModel, index: number = 0) {
		this.setService.select(set);
		this.selectedSetIndex = index;
		this.saveBox.nativeElement.value = set.setName;
	}

	weaponFilterClicked(weaponType?: WeaponType) {
		if (!this.weaponTypeFilter || this.weaponTypeFilter != weaponType) {
			this.weaponTypeFilter = weaponType;
			this.filteredItems = _.reject(this.sets, item => item.weaponType != this.weaponTypeFilter);
		} else if (this.weaponTypeFilter == weaponType) {
			this.weaponTypeFilter = null;
			this.filteredItems = this.sets;
		}
	}

	downloadHtmlFile() {
		const dateNow = new Date().toLocaleDateString('en-GB', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
		const fileName = `mhw-builder-save(${dateNow}).html`;
		const fileString = `
<!DOCTYPE html>

<html lang="en" xmlns="http://www.w3.org/1999/xhtml" ng-app="mhwApp">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>MHW-Builder SetList</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.7.7/angular.min.js"></script>
    <style>
        a {
            color: cornflowerblue;
        }
        .Fire {
            color: #ff6666;
        }
        .Water {
            color: #66ccff;
        }
        .Thunder {
            color: #ff9900;
        }
        .Ice {
            color: #0099ff;
        }
        .Dragon {
            color: #3cb05d;
        }
        .Poison {
            color: #cc44ff;
        }
        .Sleep {
            color: #9999ff;
        }
        .Paralysis {
            color: #e6cb00;
        }
        .Blast {
            color: #E6A400;
        }
    </style>
</head>
<body>
    <div class="container-fluid" ng-controller="SetListController">
        <div class="row">
            <div class="col-12">
                <h2>MHW-Builder</h2>
                <div class="input-group mb-2">
                    <select class="custom-select" id="weaponFilter" ng-model="weaponFilter">
                        <option value="" selected></option>
                        <option value="greatSword">GreatSword</option>
                        <option value="swordShield">SwordShield</option>
                        <option value="dualBlades">DualBlades</option>
                        <option value="longSword">LongSword</option>
                        <option value="hammer">Hammer</option>
                        <option value="huntingHorn">HuntingHorn</option>
                        <option value="lance">Lance</option>
                        <option value="gunlance">Gunlance</option>
                        <option value="switchAxe">SwitchAxe</option>
                        <option value="chargeBlade">ChargeBlade</option>
                        <option value="insectGlaive">InsectGlaive</option>
                        <option value="bow">Bow</option>
                        <option value="heavyBowGun">HBG</option>
                        <option value="lightBowGun">LBG</option>
                    </select>
                    <div class="input-group-append">
                        <label class="input-group-text" for="inputGroupSelect02">Weapon</label>
                    </div>
                </div>
                <div class="card-columns">
                    <div class="card" ng-repeat="(key,item) in sets | filter:(weaponFilter? {weaponType:weaponFilter}: '') track by $index" style="margin-bottom:.5rem;">
                        <div class="card-body" style="padding:6px;">
                            <h6 class="card-title" style="margin:0px;">
                                <a href="https://neftalimich.github.io/mhw-builder-page?{{item.hashString}}" class="text-decoration-none" target="_blank">
                                    {{item.setName}}
                                </a>
                                <span style="font-size:14px;">
                                    <a class="float-right ml-1 text-secondary" href="https://neftalimich.github.io/mhw-builder-page?{{item.hashString}}i{{item.setName}}"
										target="_blank" title="Import">
                                        <i class="fas fa-cloud-upload-alt fa-sm"></i>
                                    </a>
                                    <span class="float-right">
                                        <span>{{item.totalAttack}}</span>
                                        <span ng-show="item.element || item.ailment">
											(<span class="{{item.element}}" title="{{item.element}}">{{item.element ? item.elementAttack : ''}}</span><!--
											-->{{item.ailment && item.element ? '/' : ''}}<!--
											--><span class="{{item.ailment}}" title="{{item.ailment}}">{{item.ailment ? item.ailmentAttack : ''}}</span>)
                                        </span>
                                    </span>
                                </span>
                            </h6>
                            <p class="card-text">
                                <small class="text-muted text-capitalize">
                                    {{item.weaponType}}
                                </small>
                            </p>
                        </div>
                    </div>
                </div>
                <span class="text-muted float-right" style="font-size:11px">By Neftalí Michelet (neftalimich)</span>
            </div>
        </div>
    </div>
    <script>
        var json = ${JSON.stringify(this.sets)};
        var mhwApp = angular.module('mhwApp', []);
        mhwApp.controller('SetListController', [
            '$scope',
            function ($scope) {
                $scope.sets = json;
            }
        ]);
    </script>
</body>
</html>
		`;
		const blob = new Blob([fileString], { type: 'text/html' });
		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(blob, fileName);
		} else {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}

	downloadJsonFile() {
		const dateNow = new Date().toLocaleDateString('en-GB', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
		const fileName = `mhw-builder-data(${dateNow}).json`;
		const fileString = JSON.stringify(this.sets);
		const blob = new Blob([fileString], { type: 'application/json' });
		if (window.navigator && window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveOrOpenBlob(blob, fileName);
		} else {
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	}
}
