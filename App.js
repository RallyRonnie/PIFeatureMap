// code to compress rows (rows of child projects with same iteration name)
// UNCOMMENT THIS  - WARNING - Can't get this to work...
//	Ext.define('Rally.ui.cardboard.row.RowFix', {
//		override: 'Rally.ui.cardboard.row.Row',
//	
//		isMatchingRecord: function(record) {
//			return this.callParent(arguments) ||
//				this.getValue().Name === (record.get('Iteration') && record.get('Iteration').Name);
//		}
//	});
//
Ext.define('FeatureMap', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'release',
    comboboxConfig: {
        fieldLabel: 'Select a PI:',
        labelWidth: 100,
        width: 300
    },
	requires: [
        'Rally.ui.cardboard.plugin.FixedHeader'
	],
    onScopeChange: function() {
		this._getLowPI();
	},
	_getLowPI: function() {
		if (!this.piType ) {
			Ext.create('Rally.data.WsapiDataStore', {
				autoLoad: true,
				remoteFilter: false,
				model: 'TypeDefinition',
				sorters: [{
				  property: 'Ordinal',
				  direction: 'Desc'
				}],
				filters: [{
				  property: 'Parent.Name',
				  operator: '=',
				  value: 'Portfolio Item'
				}, {
				  property: 'Creatable',
				  operator: '=',
				  value: 'true'
				}],
				listeners: {
					load: function (store, recs) {
						piTypes = {};				
						Ext.Array.each(recs, function (type) {
							// console.log('Found PI Type', type, type.get('Ordinal'), type.get('TypePath'));
							piTypes[type.get('Ordinal') + ''] = type.get('TypePath');
						});
					this.piType = piTypes['0'];
					this._DrawBoard();
				},
				scope: this
			}
		});
	} else this._DrawBoard();
},
_DrawBoard: function () {
		app = this;
		var hdrFontSize = app.getSetting('hdrFontSize');
		var smSize = +hdrFontSize-4;
		var smFontSize = smSize.toString();
		Ext.create('Rally.data.wsapi.Store', {
			model: this.piType,
			fetch: ['Name', 'ObjectID', 'Project', 'FormattedID', 'Rank', 'Parent', 'Release', 'DisplayColor', 'PreliminaryEstimateValue', 'PercentDoneByStoryPlanEstimate', 'LeafStoryPlanEstimateTotal'],
			limit: Infinity,
			filters: [this.getContext().getTimeboxScope().getQueryFilter()],
			sorters: [{
				property: app.getSetting('SortCol'),
				direction: 'ASC'
			}],
			autoLoad: true,
			listeners: {
				load: function (myStore, myData, mySuccess) {
					var columns = [{
						record: null,
						value: null,
						columnHeaderConfig: {
							headerData: {
								PIhdr: '<p style="color: Red; font-size: ' + hdrFontSize + 'px"; font-weight: bolder>No Parent</>'
							}
						}
					}];
					_.each(myData, function (record) {
// console.log(app.getSetting('useColor'));
						var fpiColor = (app.getSetting('useFColor')) ? record.get('DisplayColor') : 'Black';
						var ppiColor = (record.get('Parent') !== null ) ? (app.getSetting('usePColor') ? record.get('Parent').DisplayColor : 'Black' ) : 'Grey';
						var hdrStr = (app.getSetting('showParent') ?
							'<p style="color:' + ppiColor + '; font-size: ' + hdrFontSize + 'px; font-weight: bolder">' +
							(record.get('Parent') !== null ?  '<a href="https://rally1.rallydev.com/#/detail' +
							record.get('Parent')._ref + '" target = "_top">' +
							record.get('Parent').FormattedID +
							'</a> - ' +
							record.get('Parent').Name : ' (No Parent)') +
							'<hr size="2" />' : '') + 
							'<p style="color: ' + fpiColor + '; font-size: ' + hdrFontSize + 'px; font-weight: bolder"><a href="https://rally1.rallydev.com/#/detail' +
							record.get('_ref') + '" target = "_top">' +
							record.get('FormattedID') +
							'</a> - ' +
							record.get('_refObjectName') +
							(app.getSetting('showCounts') ?
							'<p style="color: grey; font-weight: normal; font-size: ' + smFontSize + 'px">(' + 
							(record.get('PreliminaryEstimateValue') !== null ? record.get('PreliminaryEstimateValue') : '0') + 
							' FP / ' + (record.get('LeafStoryPlanEstimateTotal') !== null ? record.get('LeafStoryPlanEstimateTotal')  : '0') + ' SP)'
							: '') +
							'</>';
// console.log(record);		
						columns.push({
//							tpl: Ext.create("Rally.ui.renderer.template.FormattedIDTemplate"),
							record: record,
							value: record.getRef().getRelativeUri(),
							columnHeaderConfig: {
								headerData: {
									PIhdr: hdrStr
								}
							}
						});
					});
					if (app.getSetting('showAddnew')) { app._addNewButton(); }
					app._addBoard(columns);
				},
				scope: this
			}
		});
	},
	// Add AddNew Button to container
	_addNewButton: function () {
		if (app.addButton) app.addButton.destroy();
		addNewConfig = {
			//	html:'<div><input type="button" style="text-align:right;float:right;" value="Update" onClick="window.location.reload()"/></div>',
			xtype: 'rallyaddnew',
			//	newButtonText: '+ New '+app.getSetting('PITypeField')+'/Story',
			recordTypes: ['User Story'],
			ignoredRequiredFields: ['Name', 'ScheduleState', 'Project', 'Owner'],
			listeners: {
				create: function (addNew, record) {
					//					Ext.Msg.alert('Add New', 'Added record named ' + record.get('Name'));
					// app.board.refresh();
					//					app.launch();
				}
			},
			showAddWithDetails: true
		};
		app.addButton = this.add(addNewConfig);
	},
	// add board to container
	_addBoard: function (columns) {
		if (this.down('#myBoard')) {
			this.remove('myBoard');
		}
		boardConfig = {
			xtype: 'rallycardboard',
			types: ['User Story'],
			storeConfig: {
				filters: app.getQueryFilter()
			},
			attribute: this.piType.split('/')[1],
			itemId: 'myBoard',
			context: this.getContext(),
			enableRanking: true,
			cardConfig: {
				fields: app.getSetting('cardFields').split(','),
				editable: true,
				showIconsAndHighlightBorder: true,
				showReadyIcon: true,
				showBlockedIcon: true,
				showColorIcon: true,
				showPlusIcon: true,
				showGearIcon: true
			},
			plugins: [{ptype:'rallyfixedheadercardboard'}],
			columnConfig: {
				columnHeaderConfig: {
					headerTpl: '{PIhdr}'
				},
				listeners: {
					scope: this,
					beforecarddroppedsave: function (column, card) {
						var rec = card.getRecord();
						rec.set('PortfolioItem', column.getValue());
					}
				}
			},
			rowConfig: {
				field: app.getSetting('Swimlane'),
				enableCrossRowDragging: true,
				sortDirection: 'ASC' // ASC | DESC
			},
			columns : columns
		};
//		console.log(boardConfig);
		app.board = this.add(boardConfig);
	},
	_showMask: function(msg) {
		if ( this.getEl() ) { 
			this.getEl().unmask();
			this.getEl().mask(msg);
		}
	},
	_hideMask: function() {
		this.getEl().unmask();
	},
	getSettingsFields: function () {
		var values = [
			{   // Card Field Picker
				xtype: 'rallyfieldpicker',
				name: 'cardFieldPicker',
				fieldLabel: 'Card Fields:',
				alwaysExpanded: false,
				autoExpand: true,
				alwaysSelectedValues: ["Name","Owner"],
				modelTypes: ['User Story'],
				boxLabelAlign: 'after',
				margin: '0 0 15 400',
				labelStyle: "width:200px;",
				handlesEvents: {
					myspecialevent2: function (field, model) {
						this.setField(field.raw.fieldDefinition);
					}
				},
				listeners: {
					select: function (field_picker, value, values) {
//						console.log("state_picker", state_picker, "records", records);
						this.fireEvent("field_selected", values);
					},
					deselect: function (field_picker, value, values) {
//						console.log("state_picker", state_picker, "records", records);
						this.fireEvent("field_selected", values);
					},
				},
				bubbleEvents: ['field_selected']
			},
			{
				name: 'cardFields',
				hidden: true,
				xtype: 'rallytextfield',
				handlesEvents: {
					field_selected: function (fields) {
//						console.log("fields_selected", this.getValue(), fields);
						var fieldStr = '';
						_.each(fields, function (field) {
							fieldStr += field.get("name") + ',';
						});
						this.setValue(fieldStr.slice(0,-1));
					}
				}
			},
			{
				xtype: 'rallycheckboxfield',
				margin: '0 0 15 0',
				labelWidth: 200,
				fieldLabel: 'Show Add New Story:',
				name: 'showAddnew'
			},
			{
				xtype: 'label',
				forId: 'myFieldId3',
				text: 'Column Settings:',
				margin: '0 0 0 0'
			},
			{
				xtype: 'rallytextfield',
				name: 'hdrFontSize',
				fieldLabel: 'Column Header Font Size:',
				maxLength: 2,
				labelWidth: 200,
				width: 250,
				margin: '0 0 0 20'
			},
			{
				xtype: 'rallycheckboxfield',
				margin: '0 0 0 20',
				labelWidth: 200,
				fieldLabel: 'Show Parent:',
				name: 'showParent'
			},
			{
				xtype: 'rallycheckboxfield',
				labelWidth: 200,
				margin: '0 0 0 20',
				fieldLabel: 'Color for Feature Title:',
				name: 'useFColor'
			},
			{
				xtype: 'rallycheckboxfield',
				labelWidth: 200,
				margin: '0 0 0 20',
				fieldLabel: 'Color for Parent Title:',
				name: 'usePColor'
			},
			{
				xtype: 'rallycheckboxfield',
				margin: '0 0 5 20',
				labelWidth: 200,
				fieldLabel: 'Show Counts:',
				name: 'showCounts'
			},
			{
				xtype: 'label',
				forId: 'myFieldId3',
				text: 'Sort by:',
				margin: '0 0 0 20'
			},
			{
				xtype: 'rallyradiofield',
				fieldLabel: 'Parent',
				margin: '0 0 0 40',
				name: 'SortCol',
				label: 'Swimlane',
				inputValue: 'Parent'
			},
			{
				xtype: 'rallyradiofield',
				margin: '0 0 15 40',
				fieldLabel: 'Rank',
				name: 'SortCol',
				inputValue: 'Rank'
			},
			{
				xtype: 'label',
				forId: 'myFieldId4',
				text: 'Swimlanes:',
				margin: '0 0 0 0'
			},
			{
				xtype: 'rallyradiofield',
				fieldLabel: 'Teams',
				margin: '0 0 0 20',
				name: 'Swimlane',
				inputValue: 'Project'
			},
			{
				xtype: 'rallyradiofield',
				fieldLabel: 'Iterations',
				margin: '0 0 0 20',
				name: 'Swimlane',
				inputValue: 'Iteration'
			},
			{
				xtype: 'rallyradiofield',
				margin: '0 0 15 20',
				fieldLabel: 'None',
				name: 'Swimlane',
				inputValue: ''
			},
			{
				type: 'query'
			}
		];
		return values;
	},
	config: {
		defaultSettings: {
			showAddnew: false,
			cardFields: "Name,Owner",
			SortCol: 'Rank',
			Swimlane: 'Project',
			hdrFontSize: '16',
			showParent: true,
			useFColor: false,
			usePColor: true,
			showCounts: true
		}
	},
	getQueryFilter: function () {
		var queries = [];
		if (app.getSetting('query')) {
			queries.push(Rally.data.QueryFilter.fromQueryString(app.getSetting('query')));
		}
		return queries;
	}
});