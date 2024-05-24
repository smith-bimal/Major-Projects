/*
 * This combined file was created by the DataTables downloader builder:
 *   https://datatables.net/download
 *
 * To rebuild or modify this file with the latest versions of the included
 * software please visit:
 *   https://datatables.net/download/#bs5/dt-2.0.5/e-2.3.2/r-3.0.2
 *
 * Included libraries:
 *   DataTables 2.0.5, Editor 2.3.2, Responsive 3.0.2
 */

/*! DataTables 2.0.5
 * © SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     2.0.5
 * @author      SpryMedia Ltd
 * @contact     www.datatables.net
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - https://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: https://www.datatables.net
 */

(function (factory) {
	"use strict";

	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		// jQuery's factory checks for a global window - if it isn't present then it
		// returns a factory function that expects the window object
		var jq = require('jquery');

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if (!root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if (!$) {
					$ = jq(root);
				}

				return factory($, root, root.document);
			};
		}
		else {
			module.exports = factory(jq, window, window.document);
		}
	}
	else {
		// Browser
		window.DataTable = factory(jQuery, window, document);
	}
}(function ($, window, document) {
	"use strict";


	var DataTable = function (selector, options) {
		// Check if called with a window or jQuery object for DOM less applications
		// This is for backwards compatibility
		if (DataTable.factory(selector, options)) {
			return DataTable;
		}

		// When creating with `new`, create a new DataTable, returning the API instance
		if (this instanceof DataTable) {
			return $(selector).DataTable(options);
		}
		else {
			// Argument switching
			options = selector;
		}

		var _that = this;
		var emptyInit = options === undefined;
		var len = this.length;

		if (emptyInit) {
			options = {};
		}

		// Method to get DT API instance from jQuery object
		this.api = function () {
			return new _Api(this);
		};

		this.each(function () {
			// For each initialisation we want to give it a clean initialisation
			// object that can be bashed around
			var o = {};
			var oInit = len > 1 ? // optimisation for single table case
				_fnExtend(o, options, true) :
				options;


			var i = 0, iLen;
			var sId = this.getAttribute('id');
			var bInitHandedOff = false;
			var defaults = DataTable.defaults;
			var $this = $(this);


			/* Sanity check */
			if (this.nodeName.toLowerCase() != 'table') {
				_fnLog(null, 0, 'Non-table node initialisation (' + this.nodeName + ')', 2);
				return;
			}

			$(this).trigger('options.dt', oInit);

			/* Backwards compatibility for the defaults */
			_fnCompatOpts(defaults);
			_fnCompatCols(defaults.column);

			/* Convert the camel-case defaults to Hungarian */
			_fnCamelToHungarian(defaults, defaults, true);
			_fnCamelToHungarian(defaults.column, defaults.column, true);

			/* Setting up the initialisation object */
			_fnCamelToHungarian(defaults, $.extend(oInit, $this.data()), true);



			/* Check to see if we are re-initialising a table */
			var allSettings = DataTable.settings;
			for (i = 0, iLen = allSettings.length; i < iLen; i++) {
				var s = allSettings[i];

				/* Base check on table node */
				if (
					s.nTable == this ||
					(s.nTHead && s.nTHead.parentNode == this) ||
					(s.nTFoot && s.nTFoot.parentNode == this)
				) {
					var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
					var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;

					if (emptyInit || bRetrieve) {
						return s.oInstance;
					}
					else if (bDestroy) {
						new DataTable.Api(s).destroy();
						break;
					}
					else {
						_fnLog(s, 0, 'Cannot reinitialise DataTable', 3);
						return;
					}
				}

				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if (s.sTableId == this.id) {
					allSettings.splice(i, 1);
					break;
				}
			}

			/* Ensure the table has an ID - required for accessibility */
			if (sId === null || sId === "") {
				sId = "DataTables_Table_" + (DataTable.ext._unique++);
				this.id = sId;
			}

			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend(true, {}, DataTable.models.oSettings, {
				"sDestroyWidth": $this[0].style.width,
				"sInstance": sId,
				"sTableId": sId,
				colgroup: $('<colgroup>').prependTo(this),
				fastData: function (row, column, type) {
					return _fnGetCellData(oSettings, row, column, type);
				}
			});
			oSettings.nTable = this;
			oSettings.oInit = oInit;

			allSettings.push(oSettings);

			// Make a single API instance available for internal handling
			oSettings.api = new _Api(oSettings);

			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length === 1) ? _that : $this.dataTable();

			// Backwards compatibility, before we apply all the defaults
			_fnCompatOpts(oInit);

			// If the length menu is given, but the init display length is not, use the length menu
			if (oInit.aLengthMenu && !oInit.iDisplayLength) {
				oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0])
					? oInit.aLengthMenu[0][0]
					: $.isPlainObject(oInit.aLengthMenu[0])
						? oInit.aLengthMenu[0].value
						: oInit.aLengthMenu[0];
			}

			// Apply the defaults and init options to make a single init object will all
			// options defined from defaults and instance options.
			oInit = _fnExtend($.extend(true, {}, defaults), oInit);


			// Map the initialisation options onto the settings object
			_fnMap(oSettings.oFeatures, oInit, [
				"bPaginate",
				"bLengthChange",
				"bFilter",
				"bSort",
				"bSortMulti",
				"bInfo",
				"bProcessing",
				"bAutoWidth",
				"bSortClasses",
				"bServerSide",
				"bDeferRender"
			]);
			_fnMap(oSettings, oInit, [
				"ajax",
				"fnFormatNumber",
				"sServerMethod",
				"aaSorting",
				"aaSortingFixed",
				"aLengthMenu",
				"sPaginationType",
				"iStateDuration",
				"bSortCellsTop",
				"iTabIndex",
				"sDom",
				"fnStateLoadCallback",
				"fnStateSaveCallback",
				"renderer",
				"searchDelay",
				"rowId",
				"caption",
				"layout",
				["iCookieDuration", "iStateDuration"], // backwards compat
				["oSearch", "oPreviousSearch"],
				["aoSearchCols", "aoPreSearchCols"],
				["iDisplayLength", "_iDisplayLength"]
			]);
			_fnMap(oSettings.oScroll, oInit, [
				["sScrollX", "sX"],
				["sScrollXInner", "sXInner"],
				["sScrollY", "sY"],
				["bScrollCollapse", "bCollapse"]
			]);
			_fnMap(oSettings.oLanguage, oInit, "fnInfoCallback");

			/* Callback functions which are array driven */
			_fnCallbackReg(oSettings, 'aoDrawCallback', oInit.fnDrawCallback);
			_fnCallbackReg(oSettings, 'aoStateSaveParams', oInit.fnStateSaveParams);
			_fnCallbackReg(oSettings, 'aoStateLoadParams', oInit.fnStateLoadParams);
			_fnCallbackReg(oSettings, 'aoStateLoaded', oInit.fnStateLoaded);
			_fnCallbackReg(oSettings, 'aoRowCallback', oInit.fnRowCallback);
			_fnCallbackReg(oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow);
			_fnCallbackReg(oSettings, 'aoHeaderCallback', oInit.fnHeaderCallback);
			_fnCallbackReg(oSettings, 'aoFooterCallback', oInit.fnFooterCallback);
			_fnCallbackReg(oSettings, 'aoInitComplete', oInit.fnInitComplete);
			_fnCallbackReg(oSettings, 'aoPreDrawCallback', oInit.fnPreDrawCallback);

			oSettings.rowIdFn = _fnGetObjectDataFn(oInit.rowId);

			/* Browser support detection */
			_fnBrowserDetect(oSettings);

			var oClasses = oSettings.oClasses;

			$.extend(oClasses, DataTable.ext.classes, oInit.oClasses);
			$this.addClass(oClasses.table);

			if (!oSettings.oFeatures.bPaginate) {
				oInit.iDisplayStart = 0;
			}

			if (oSettings.iInitDisplayStart === undefined) {
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}

			/* Language definitions */
			var oLanguage = oSettings.oLanguage;
			$.extend(true, oLanguage, oInit.oLanguage);

			if (oLanguage.sUrl) {
				/* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
				$.ajax({
					dataType: 'json',
					url: oLanguage.sUrl,
					success: function (json) {
						_fnCamelToHungarian(defaults.oLanguage, json);
						$.extend(true, oLanguage, json, oSettings.oInit.oLanguage);

						_fnCallbackFire(oSettings, null, 'i18n', [oSettings], true);
						_fnInitialise(oSettings);
					},
					error: function () {
						// Error occurred loading language file
						_fnLog(oSettings, 0, 'i18n file loading error', 21);

						// continue on as best we can
						_fnInitialise(oSettings);
					}
				});
				bInitHandedOff = true;
			}
			else {
				_fnCallbackFire(oSettings, null, 'i18n', [oSettings]);
			}

			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var columnsInit = [];
			var thead = this.getElementsByTagName('thead');
			var initHeaderLayout = _fnDetectHeader(oSettings, thead[0]);

			// If we don't have a columns array, then generate one with nulls
			if (oInit.aoColumns) {
				columnsInit = oInit.aoColumns;
			}
			else if (initHeaderLayout.length) {
				for (i = 0, iLen = initHeaderLayout[0].length; i < iLen; i++) {
					columnsInit.push(null);
				}
			}

			// Add the columns
			for (i = 0, iLen = columnsInit.length; i < iLen; i++) {
				_fnAddColumn(oSettings);
			}

			// Apply the column definitions
			_fnApplyColumnDefs(oSettings, oInit.aoColumnDefs, columnsInit, initHeaderLayout, function (iCol, oDef) {
				_fnColumnOptions(oSettings, iCol, oDef);
			});

			/* HTML5 attribute detection - build an mData object automatically if the
			 * attributes are found
			 */
			var rowOne = $this.children('tbody').find('tr').eq(0);

			if (rowOne.length) {
				var a = function (cell, name) {
					return cell.getAttribute('data-' + name) !== null ? name : null;
				};

				$(rowOne[0]).children('th, td').each(function (i, cell) {
					var col = oSettings.aoColumns[i];

					if (!col) {
						_fnLog(oSettings, 0, 'Incorrect column count', 18);
					}

					if (col.mData === i) {
						var sort = a(cell, 'sort') || a(cell, 'order');
						var filter = a(cell, 'filter') || a(cell, 'search');

						if (sort !== null || filter !== null) {
							col.mData = {
								_: i + '.display',
								sort: sort !== null ? i + '.@data-' + sort : undefined,
								type: sort !== null ? i + '.@data-' + sort : undefined,
								filter: filter !== null ? i + '.@data-' + filter : undefined
							};
							col._isArrayHost = true;

							_fnColumnOptions(oSettings, i);
						}
					}
				});
			}

			var features = oSettings.oFeatures;
			var loadedInit = function () {
				/*
				 * Sorting
				 * @todo For modularisation (1.11) this needs to do into a sort start up handler
				 */

				// If aaSorting is not defined, then we use the first indicator in asSorting
				// in case that has been altered, so the default sort reflects that option
				if (oInit.aaSorting === undefined) {
					var sorting = oSettings.aaSorting;
					for (i = 0, iLen = sorting.length; i < iLen; i++) {
						sorting[i][1] = oSettings.aoColumns[i].asSorting[0];
					}
				}

				/* Do a first pass on the sorting classes (allows any size changes to be taken into
				 * account, and also will apply sorting disabled classes if disabled
				 */
				_fnSortingClasses(oSettings);

				_fnCallbackReg(oSettings, 'aoDrawCallback', function () {
					if (oSettings.bSorted || _fnDataSource(oSettings) === 'ssp' || features.bDeferRender) {
						_fnSortingClasses(oSettings);
					}
				});


				/*
				 * Final init
				 * Cache the header, body and footer as required, creating them if needed
				 */
				var caption = $this.children('caption');

				if (oSettings.caption) {
					if (caption.length === 0) {
						caption = $('<caption/>').appendTo($this);
					}

					caption.html(oSettings.caption);
				}

				// Store the caption side, so we can remove the element from the document
				// when creating the element
				if (caption.length) {
					caption[0]._captionSide = caption.css('caption-side');
					oSettings.captionNode = caption[0];
				}

				if (thead.length === 0) {
					thead = $('<thead/>').appendTo($this);
				}
				oSettings.nTHead = thead[0];
				$('tr', thead).addClass(oClasses.thead.row);

				var tbody = $this.children('tbody');
				if (tbody.length === 0) {
					tbody = $('<tbody/>').insertAfter(thead);
				}
				oSettings.nTBody = tbody[0];

				var tfoot = $this.children('tfoot');
				if (tfoot.length === 0) {
					// If we are a scrolling table, and no footer has been given, then we need to create
					// a tfoot element for the caption element to be appended to
					tfoot = $('<tfoot/>').appendTo($this);
				}
				oSettings.nTFoot = tfoot[0];
				$('tr', tfoot).addClass(oClasses.tfoot.row);

				// Check if there is data passing into the constructor
				if (oInit.aaData) {
					for (i = 0; i < oInit.aaData.length; i++) {
						_fnAddData(oSettings, oInit.aaData[i]);
					}
				}
				else if (_fnDataSource(oSettings) == 'dom') {
					// Grab the data from the page
					_fnAddTr(oSettings, $(oSettings.nTBody).children('tr'));
				}

				/* Copy the data index array */
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

				/* Initialisation complete - table can be drawn */
				oSettings.bInitialised = true;

				/* Check if we need to initialise the table (it might not have been handed off to the
				 * language processor)
				 */
				if (bInitHandedOff === false) {
					_fnInitialise(oSettings);
				}
			};

			/* Must be done after everything which can be overridden by the state saving! */
			_fnCallbackReg(oSettings, 'aoDrawCallback', _fnSaveState);

			if (oInit.bStateSave) {
				features.bStateSave = true;
				_fnLoadState(oSettings, oInit, loadedInit);
			}
			else {
				loadedInit();
			}

		});
		_that = null;
		return this;
	};



	/**
	 * DataTables extensions
	 * 
	 * This namespace acts as a collection area for plug-ins that can be used to
	 * extend DataTables capabilities. Indeed many of the build in methods
	 * use this method to provide their own capabilities (sorting methods for
	 * example).
	 *
	 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
	 * reasons
	 *
	 *  @namespace
	 */
	DataTable.ext = _ext = {
		/**
		 * Buttons. For use with the Buttons extension for DataTables. This is
		 * defined here so other extensions can define buttons regardless of load
		 * order. It is _not_ used by DataTables core.
		 *
		 *  @type object
		 *  @default {}
		 */
		buttons: {},


		/**
		 * Element class names
		 *
		 *  @type object
		 *  @default {}
		 */
		classes: {},


		/**
		 * DataTables build type (expanded by the download builder)
		 *
		 *  @type string
		 */
		builder: "bs5/dt-2.0.5/e-2.3.2/r-3.0.2",


		/**
		 * Error reporting.
		 * 
		 * How should DataTables report an error. Can take the value 'alert',
		 * 'throw', 'none' or a function.
		 *
		 *  @type string|function
		 *  @default alert
		 */
		errMode: "alert",


		/**
		 * Legacy so v1 plug-ins don't throw js errors on load
		 */
		feature: [],

		/**
		 * Feature plug-ins.
		 * 
		 * This is an object of callbacks which provide the features for DataTables
		 * to be initialised via the `layout` option.
		 */
		features: {},


		/**
		 * Row searching.
		 * 
		 * This method of searching is complimentary to the default type based
		 * searching, and a lot more comprehensive as it allows you complete control
		 * over the searching logic. Each element in this array is a function
		 * (parameters described below) that is called for every row in the table,
		 * and your logic decides if it should be included in the searching data set
		 * or not.
		 *
		 * Searching functions have the following input parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{array|object}` Data for the row to be processed (same as the
		 *    original format that was passed in as the data source, or an array
		 *    from a DOM data source
		 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
		 *    can be useful to retrieve the `TR` element if you need DOM interaction.
		 *
		 * And the following return is expected:
		 *
		 * * {boolean} Include the row in the searched result set (true) or not
		 *   (false)
		 *
		 * Note that as with the main search ability in DataTables, technically this
		 * is "filtering", since it is subtractive. However, for consistency in
		 * naming we call it searching here.
		 *
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom search being applied to the
		 *    // fourth column (i.e. the data[3] index) based on two input values
		 *    // from the end-user, matching the data in a certain range.
		 *    $.fn.dataTable.ext.search.push(
		 *      function( settings, data, dataIndex ) {
		 *        var min = document.getElementById('min').value * 1;
		 *        var max = document.getElementById('max').value * 1;
		 *        var version = data[3] == "-" ? 0 : data[3]*1;
		 *
		 *        if ( min == "" && max == "" ) {
		 *          return true;
		 *        }
		 *        else if ( min == "" && version < max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && "" == max ) {
		 *          return true;
		 *        }
		 *        else if ( min < version && version < max ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		search: [],


		/**
		 * Selector extensions
		 *
		 * The `selector` option can be used to extend the options available for the
		 * selector modifier options (`selector-modifier` object data type) that
		 * each of the three built in selector types offer (row, column and cell +
		 * their plural counterparts). For example the Select extension uses this
		 * mechanism to provide an option to select only rows, columns and cells
		 * that have been marked as selected by the end user (`{selected: true}`),
		 * which can be used in conjunction with the existing built in selector
		 * options.
		 *
		 * Each property is an array to which functions can be pushed. The functions
		 * take three attributes:
		 *
		 * * Settings object for the host table
		 * * Options object (`selector-modifier` object type)
		 * * Array of selected item indexes
		 *
		 * The return is an array of the resulting item indexes after the custom
		 * selector has been applied.
		 *
		 *  @type object
		 */
		selector: {
			cell: [],
			column: [],
			row: []
		},


		/**
		 * Legacy configuration options. Enable and disable legacy options that
		 * are available in DataTables.
		 *
		 *  @type object
		 */
		legacy: {
			/**
			 * Enable / disable DataTables 1.9 compatible server-side processing
			 * requests
			 *
			 *  @type boolean
			 *  @default null
			 */
			ajax: null
		},


		/**
		 * Pagination plug-in methods.
		 * 
		 * Each entry in this object is a function and defines which buttons should
		 * be shown by the pagination rendering method that is used for the table:
		 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
		 * buttons are displayed in the document, while the functions here tell it
		 * what buttons to display. This is done by returning an array of button
		 * descriptions (what each button will do).
		 *
		 * Pagination types (the four built in options and any additional plug-in
		 * options defined here) can be used through the `paginationType`
		 * initialisation parameter.
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{int} page` The current page index
		 * 2. `{int} pages` The number of pages in the table
		 *
		 * Each function is expected to return an array where each element of the
		 * array can be one of:
		 *
		 * * `first` - Jump to first page when activated
		 * * `last` - Jump to last page when activated
		 * * `previous` - Show previous page when activated
		 * * `next` - Show next page when activated
		 * * `{int}` - Show page of the index given
		 * * `{array}` - A nested array containing the above elements to add a
		 *   containing 'DIV' element (might be useful for styling).
		 *
		 * Note that DataTables v1.9- used this object slightly differently whereby
		 * an object with two functions would be defined for each plug-in. That
		 * ability is still supported by DataTables 1.10+ to provide backwards
		 * compatibility, but this option of use is now decremented and no longer
		 * documented in DataTables 1.10+.
		 *
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Show previous, next and current page buttons only
		 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
		 *      return [ 'previous', page, 'next' ];
		 *    };
		 */
		pager: {},


		renderer: {
			pageButton: {},
			header: {}
		},


		/**
		 * Ordering plug-ins - custom data source
		 * 
		 * The extension options for ordering of data available here is complimentary
		 * to the default type based ordering that DataTables typically uses. It
		 * allows much greater control over the the data that is being used to
		 * order a column, but is necessarily therefore more complex.
		 * 
		 * This type of ordering is useful if you want to do ordering based on data
		 * live from the DOM (for example the contents of an 'input' element) rather
		 * than just the static string that DataTables knows of.
		 * 
		 * The way these plug-ins work is that you create an array of the values you
		 * wish to be ordering for the column in question and then return that
		 * array. The data in the array much be in the index order of the rows in
		 * the table (not the currently ordering order!). Which order data gathering
		 * function is run here depends on the `dt-init columns.orderDataType`
		 * parameter that is used for the column (if any).
		 *
		 * The functions defined take two parameters:
		 *
		 * 1. `{object}` DataTables settings object: see
		 *    {@link DataTable.models.oSettings}
		 * 2. `{int}` Target column index
		 *
		 * Each function is expected to return an array:
		 *
		 * * `{array}` Data for the column to be ordering upon
		 *
		 *  @type array
		 *
		 *  @example
		 *    // Ordering using `input` node values
		 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
		 *    {
		 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		 *        return $('input', td).val();
		 *      } );
		 *    }
		 */
		order: {},


		/**
		 * Type based plug-ins.
		 *
		 * Each column in DataTables has a type assigned to it, either by automatic
		 * detection or by direct assignment using the `type` option for the column.
		 * The type of a column will effect how it is ordering and search (plug-ins
		 * can also make use of the column type if required).
		 *
		 * @namespace
		 */
		type: {
			/**
			 * Automatic column class assignment
			 */
			className: {},

			/**
			 * Type detection functions.
			 *
			 * The functions defined in this object are used to automatically detect
			 * a column's type, making initialisation of DataTables super easy, even
			 * when complex data is in the table.
			 *
			 * The functions defined take two parameters:
			 *
			 *  1. `{*}` Data from the column cell to be analysed
			 *  2. `{settings}` DataTables settings object. This can be used to
			 *     perform context specific type detection - for example detection
			 *     based on language settings such as using a comma for a decimal
			 *     place. Generally speaking the options from the settings will not
			 *     be required
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Data type detected, or null if unknown (and thus
			 *   pass it on to the other type detection functions.
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Currency type detection plug-in:
			 *    $.fn.dataTable.ext.type.detect.push(
			 *      function ( data, settings ) {
			 *        // Check the numeric part
			 *        if ( ! data.substring(1).match(/[0-9]/) ) {
			 *          return null;
			 *        }
			 *
			 *        // Check prefixed by currency
			 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
			 *          return 'currency';
			 *        }
			 *        return null;
			 *      }
			 *    );
			 */
			detect: [],

			/**
			 * Automatic renderer assignment
			 */
			render: {},


			/**
			 * Type based search formatting.
			 *
			 * The type based searching functions can be used to pre-format the
			 * data to be search on. For example, it can be used to strip HTML
			 * tags or to de-format telephone numbers for numeric only searching.
			 *
			 * Note that is a search is not defined for a column of a given type,
			 * no search formatting will be performed.
			 * 
			 * Pre-processing of searching data plug-ins - When you assign the sType
			 * for a column (or have it automatically detected for you by DataTables
			 * or a type detection plug-in), you will typically be using this for
			 * custom sorting, but it can also be used to provide custom searching
			 * by allowing you to pre-processing the data and returning the data in
			 * the format that should be searched upon. This is done by adding
			 * functions this object with a parameter name which matches the sType
			 * for that target column. This is the corollary of <i>afnSortData</i>
			 * for searching data.
			 *
			 * The functions defined take a single parameter:
			 *
			 *  1. `{*}` Data from the column cell to be prepared for searching
			 *
			 * Each function is expected to return:
			 *
			 * * `{string|null}` Formatted string that will be used for the searching.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
			 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
			 *    }
			 */
			search: {},


			/**
			 * Type based ordering.
			 *
			 * The column type tells DataTables what ordering to apply to the table
			 * when a column is sorted upon. The order for each type that is defined,
			 * is defined by the functions available in this object.
			 *
			 * Each ordering option can be described by three properties added to
			 * this object:
			 *
			 * * `{type}-pre` - Pre-formatting function
			 * * `{type}-asc` - Ascending order function
			 * * `{type}-desc` - Descending order function
			 *
			 * All three can be used together, only `{type}-pre` or only
			 * `{type}-asc` and `{type}-desc` together. It is generally recommended
			 * that only `{type}-pre` is used, as this provides the optimal
			 * implementation in terms of speed, although the others are provided
			 * for compatibility with existing Javascript sort functions.
			 *
			 * `{type}-pre`: Functions defined take a single parameter:
			 *
			 *  1. `{*}` Data from the column cell to be prepared for ordering
			 *
			 * And return:
			 *
			 * * `{*}` Data to be sorted upon
			 *
			 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
			 * functions, taking two parameters:
			 *
			 *  1. `{*}` Data to compare to the second parameter
			 *  2. `{*}` Data to compare to the first parameter
			 *
			 * And returning:
			 *
			 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
			 *   than the second parameter, ===0 if the two parameters are equal and
			 *   >0 if the first parameter should be sorted height than the second
			 *   parameter.
			 * 
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Numeric ordering of formatted numbers with a pre-formatter
			 *    $.extend( $.fn.dataTable.ext.type.order, {
			 *      "string-pre": function(x) {
			 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
			 *        return parseFloat( a );
			 *      }
			 *    } );
			 *
			 *  @example
			 *    // Case-sensitive string ordering, with no pre-formatting method
			 *    $.extend( $.fn.dataTable.ext.order, {
			 *      "string-case-asc": function(x,y) {
			 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			 *      },
			 *      "string-case-desc": function(x,y) {
			 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			 *      }
			 *    } );
			 */
			order: {}
		},

		/**
		 * Unique DataTables instance counter
		 *
		 * @type int
		 * @private
		 */
		_unique: 0,


		//
		// Depreciated
		// The following properties are retained for backwards compatibility only.
		// The should not be used in new projects and will be removed in a future
		// version
		//

		/**
		 * Version check function.
		 *  @type function
		 *  @depreciated Since 1.10
		 */
		fnVersionCheck: DataTable.fnVersionCheck,


		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @deprecated Since v1.10
		 */
		iApiIndex: 0,


		/**
		 * Software version
		 *  @type string
		 *  @deprecated Since v1.10
		 */
		sVersion: DataTable.version
	};


	//
	// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
	//
	$.extend(_ext, {
		afnFiltering: _ext.search,
		aTypes: _ext.type.detect,
		ofnSearch: _ext.type.search,
		oSort: _ext.type.order,
		afnSortData: _ext.order,
		aoFeatures: _ext.feature,
		oStdClasses: _ext.classes,
		oPagination: _ext.pager
	});


	$.extend(DataTable.ext.classes, {
		container: 'dt-container',
		empty: {
			row: 'dt-empty'
		},
		info: {
			container: 'dt-info'
		},
		length: {
			container: 'dt-length',
			select: 'dt-input'
		},
		order: {
			canAsc: 'dt-orderable-asc',
			canDesc: 'dt-orderable-desc',
			isAsc: 'dt-ordering-asc',
			isDesc: 'dt-ordering-desc',
			none: 'dt-orderable-none',
			position: 'sorting_'
		},
		processing: {
			container: 'dt-processing'
		},
		scrolling: {
			body: 'dt-scroll-body',
			container: 'dt-scroll',
			footer: {
				self: 'dt-scroll-foot',
				inner: 'dt-scroll-footInner'
			},
			header: {
				self: 'dt-scroll-head',
				inner: 'dt-scroll-headInner'
			}
		},
		search: {
			container: 'dt-search',
			input: 'dt-input'
		},
		table: 'dataTable',
		tbody: {
			cell: '',
			row: ''
		},
		thead: {
			cell: '',
			row: ''
		},
		tfoot: {
			cell: '',
			row: ''
		},
		paging: {
			active: 'current',
			button: 'dt-paging-button',
			container: 'dt-paging',
			disabled: 'disabled'
		}
	});


	/*
	 * It is useful to have variables which are scoped locally so only the
	 * DataTables functions can access them and they don't leak into global space.
	 * At the same time these functions are often useful over multiple files in the
	 * core and API, so we list, or at least document, all variables which are used
	 * by DataTables as private variables here. This also ensures that there is no
	 * clashing of variable names and that they can easily referenced for reuse.
	 */


	// Defined else where
	//  _selector_run
	//  _selector_opts
	//  _selector_row_indexes

	var _ext; // DataTable.ext
	var _Api; // DataTable.Api
	var _api_register; // DataTable.Api.register
	var _api_registerPlural; // DataTable.Api.registerPlural

	var _re_dic = {};
	var _re_new_lines = /[\r\n\u2028]/g;
	var _re_html = /<([^>]*>)/g;
	var _max_str_len = Math.pow(2, 28);

	// This is not strict ISO8601 - Date.parse() is quite lax, although
	// implementations differ between browsers.
	var _re_date = /^\d{2,4}[./-]\d{1,2}[./-]\d{1,2}([T ]{1}\d{1,2}[:.]\d{2}([.:]\d{2})?)?$/;

	// Escape regular expression special characters
	var _re_escape_regex = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-'].join('|\\') + ')', 'g');

	// https://en.wikipedia.org/wiki/Foreign_exchange_market
	// - \u20BD - Russian ruble.
	// - \u20a9 - South Korean Won
	// - \u20BA - Turkish Lira
	// - \u20B9 - Indian Rupee
	// - R - Brazil (R$) and South Africa
	// - fr - Swiss Franc
	// - kr - Swedish krona, Norwegian krone and Danish krone
	// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
	// - Ƀ - Bitcoin
	// - Ξ - Ethereum
	//   standards as thousands separators.
	var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;


	var _empty = function (d) {
		return !d || d === true || d === '-' ? true : false;
	};


	var _intVal = function (s) {
		var integer = parseInt(s, 10);
		return !isNaN(integer) && isFinite(s) ? integer : null;
	};

	// Convert from a formatted number with characters other than `.` as the
	// decimal place, to a Javascript number
	var _numToDecimal = function (num, decimalPoint) {
		// Cache created regular expressions for speed as this function is called often
		if (!_re_dic[decimalPoint]) {
			_re_dic[decimalPoint] = new RegExp(_fnEscapeRegex(decimalPoint), 'g');
		}
		return typeof num === 'string' && decimalPoint !== '.' ?
			num.replace(/\./g, '').replace(_re_dic[decimalPoint], '.') :
			num;
	};


	var _isNumber = function (d, decimalPoint, formatted) {
		var type = typeof d;
		var strType = type === 'string';

		if (type === 'number' || type === 'bigint') {
			return true;
		}

		// If empty return immediately so there must be a number if it is a
		// formatted string (this stops the string "k", or "kr", etc being detected
		// as a formatted number for currency
		if (_empty(d)) {
			return true;
		}

		if (decimalPoint && strType) {
			d = _numToDecimal(d, decimalPoint);
		}

		if (formatted && strType) {
			d = d.replace(_re_formatted_numeric, '');
		}

		return !isNaN(parseFloat(d)) && isFinite(d);
	};


	// A string without HTML in it can be considered to be HTML still
	var _isHtml = function (d) {
		return _empty(d) || typeof d === 'string';
	};

	// Is a string a number surrounded by HTML?
	var _htmlNumeric = function (d, decimalPoint, formatted) {
		if (_empty(d)) {
			return true;
		}

		// input and select strings mean that this isn't just a number
		if (typeof d === 'string' && d.match(/<(input|select)/i)) {
			return null;
		}

		var html = _isHtml(d);
		return !html ?
			null :
			_isNumber(_stripHtml(d), decimalPoint, formatted) ?
				true :
				null;
	};


	var _pluck = function (a, prop, prop2) {
		var out = [];
		var i = 0, ien = a.length;

		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if (prop2 !== undefined) {
			for (; i < ien; i++) {
				if (a[i] && a[i][prop]) {
					out.push(a[i][prop][prop2]);
				}
			}
		}
		else {
			for (; i < ien; i++) {
				if (a[i]) {
					out.push(a[i][prop]);
				}
			}
		}

		return out;
	};


	// Basically the same as _pluck, but rather than looping over `a` we use `order`
	// as the indexes to pick from `a`
	var _pluck_order = function (a, order, prop, prop2) {
		var out = [];
		var i = 0, ien = order.length;

		// Could have the test in the loop for slightly smaller code, but speed
		// is essential here
		if (prop2 !== undefined) {
			for (; i < ien; i++) {
				if (a[order[i]][prop]) {
					out.push(a[order[i]][prop][prop2]);
				}
			}
		}
		else {
			for (; i < ien; i++) {
				if (a[order[i]]) {
					out.push(a[order[i]][prop]);
				}
			}
		}

		return out;
	};


	var _range = function (len, start) {
		var out = [];
		var end;

		if (start === undefined) {
			start = 0;
			end = len;
		}
		else {
			end = start;
			start = len;
		}

		for (var i = start; i < end; i++) {
			out.push(i);
		}

		return out;
	};


	var _removeEmpty = function (a) {
		var out = [];

		for (var i = 0, ien = a.length; i < ien; i++) {
			if (a[i]) { // careful - will remove all falsy values!
				out.push(a[i]);
			}
		}

		return out;
	};

	// Replaceable function in api.util
	var _stripHtml = function (input) {
		// Irrelevant check to workaround CodeQL's false positive on the regex
		if (input.length > _max_str_len) {
			throw new Error('Exceeded max str len');
		}

		var previous;

		input = input.replace(_re_html, ''); // Complete tags

		// Safety for incomplete script tag - use do / while to ensure that
		// we get all instances
		do {
			previous = input;
			input = input.replace(/<script/i, '');
		} while (input !== previous);

		return previous;
	};

	// Replaceable function in api.util
	var _escapeHtml = function (d) {
		if (Array.isArray(d)) {
			d = d.join(',');
		}

		return typeof d === 'string' ?
			d
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;') :
			d;
	};

	// Remove diacritics from a string by decomposing it and then removing
	// non-ascii characters
	var _normalize = function (str, both) {
		if (typeof str !== 'string') {
			return str;
		}

		// It is faster to just run `normalize` than it is to check if
		// we need to with a regex!
		var res = str.normalize("NFD");

		// Equally, here we check if a regex is needed or not
		return res.length !== str.length
			? (both === true ? str + ' ' : '') + res.replace(/[\u0300-\u036f]/g, "")
			: res;
	}

	/**
	 * Determine if all values in the array are unique. This means we can short
	 * cut the _unique method at the cost of a single loop. A sorted array is used
	 * to easily check the values.
	 *
	 * @param  {array} src Source array
	 * @return {boolean} true if all unique, false otherwise
	 * @ignore
	 */
	var _areAllUnique = function (src) {
		if (src.length < 2) {
			return true;
		}

		var sorted = src.slice().sort();
		var last = sorted[0];

		for (var i = 1, ien = sorted.length; i < ien; i++) {
			if (sorted[i] === last) {
				return false;
			}

			last = sorted[i];
		}

		return true;
	};


	/**
	 * Find the unique elements in a source array.
	 *
	 * @param  {array} src Source array
	 * @return {array} Array of unique items
	 * @ignore
	 */
	var _unique = function (src) {
		if (Array.from && Set) {
			return Array.from(new Set(src));
		}

		if (_areAllUnique(src)) {
			return src.slice();
		}

		// A faster unique method is to use object keys to identify used values,
		// but this doesn't work with arrays or objects, which we must also
		// consider. See jsperf.app/compare-array-unique-versions/4 for more
		// information.
		var
			out = [],
			val,
			i, ien = src.length,
			j, k = 0;

		again: for (i = 0; i < ien; i++) {
			val = src[i];

			for (j = 0; j < k; j++) {
				if (out[j] === val) {
					continue again;
				}
			}

			out.push(val);
			k++;
		}

		return out;
	};

	// Surprisingly this is faster than [].concat.apply
	// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
	var _flatten = function (out, val) {
		if (Array.isArray(val)) {
			for (var i = 0; i < val.length; i++) {
				_flatten(out, val[i]);
			}
		}
		else {
			out.push(val);
		}

		return out;
	}

	// Similar to jQuery's addClass, but use classList.add
	function _addClass(el, name) {
		if (name) {
			name.split(' ').forEach(function (n) {
				if (n) {
					// `add` does deduplication, so no need to check `contains`
					el.classList.add(n);
				}
			});
		}
	}

	/**
	 * DataTables utility methods
	 * 
	 * This namespace provides helper methods that DataTables uses internally to
	 * create a DataTable, but which are not exclusively used only for DataTables.
	 * These methods can be used by extension authors to save the duplication of
	 * code.
	 *
	 *  @namespace
	 */
	DataTable.util = {
		/**
		 * Return a string with diacritic characters decomposed
		 * @param {*} mixed Function or string to normalize
		 * @param {*} both Return original string and the normalized string
		 * @returns String or undefined
		 */
		diacritics: function (mixed, both) {
			var type = typeof mixed;

			if (type !== 'function') {
				return _normalize(mixed, both);
			}
			_normalize = mixed;
		},

		/**
		 * Debounce a function
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		debounce: function (fn, timeout) {
			var timer;

			return function () {
				var that = this;
				var args = arguments;

				clearTimeout(timer);

				timer = setTimeout(function () {
					fn.apply(that, args);
				}, timeout || 250);
			};
		},

		/**
		 * Throttle the calls to a function. Arguments and context are maintained
		 * for the throttled function.
		 *
		 * @param {function} fn Function to be called
		 * @param {integer} freq Call frequency in mS
		 * @return {function} Wrapped function
		 */
		throttle: function (fn, freq) {
			var
				frequency = freq !== undefined ? freq : 200,
				last,
				timer;

			return function () {
				var
					that = this,
					now = +new Date(),
					args = arguments;

				if (last && now < last + frequency) {
					clearTimeout(timer);

					timer = setTimeout(function () {
						last = undefined;
						fn.apply(that, args);
					}, frequency);
				}
				else {
					last = now;
					fn.apply(that, args);
				}
			};
		},

		/**
		 * Escape a string such that it can be used in a regular expression
		 *
		 *  @param {string} val string to escape
		 *  @returns {string} escaped string
		 */
		escapeRegex: function (val) {
			return val.replace(_re_escape_regex, '\\$1');
		},

		/**
		 * Create a function that will write to a nested object or array
		 * @param {*} source JSON notation string
		 * @returns Write function
		 */
		set: function (source) {
			if ($.isPlainObject(source)) {
				/* Unlike get, only the underscore (global) option is used for for
				 * setting data since we don't know the type here. This is why an object
				 * option is not documented for `mData` (which is read/write), but it is
				 * for `mRender` which is read only.
				 */
				return DataTable.util.set(source._);
			}
			else if (source === null) {
				// Nothing to do when the data source is null
				return function () { };
			}
			else if (typeof source === 'function') {
				return function (data, val, meta) {
					source(data, 'set', val, meta);
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
					source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				// Like the get, we need to get data from a nested object
				var setData = function (data, val, src) {
					var a = _fnSplitObjNotation(src), b;
					var aLast = a[a.length - 1];
					var arrayNotation, funcNotation, o, innerSrc;

					for (var i = 0, iLen = a.length - 1; i < iLen; i++) {
						// Protect against prototype pollution
						if (a[i] === '__proto__' || a[i] === 'constructor') {
							throw new Error('Cannot set prototype values');
						}

						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
						funcNotation = a[i].match(__reFn);

						if (arrayNotation) {
							a[i] = a[i].replace(__reArray, '');
							data[a[i]] = [];

							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice(0, i + 1);
							innerSrc = b.join('.');

							// Traverse each entry in the array setting the properties requested
							if (Array.isArray(val)) {
								for (var j = 0, jLen = val.length; j < jLen; j++) {
									o = {};
									setData(o, val[j], innerSrc);
									data[a[i]].push(o);
								}
							}
							else {
								// We've been asked to save data to an array, but it
								// isn't array data to be saved. Best that can be done
								// is to just save the value.
								data[a[i]] = val;
							}

							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
						else if (funcNotation) {
							// Function call
							a[i] = a[i].replace(__reFn, '');
							data = data[a[i]](val);
						}

						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if (data[a[i]] === null || data[a[i]] === undefined) {
							data[a[i]] = {};
						}
						data = data[a[i]];
					}

					// Last item in the input - i.e, the actual set
					if (aLast.match(__reFn)) {
						// Function call
						data = data[aLast.replace(__reFn, '')](val);
					}
					else {
						// If array notation is used, we just want to strip it and use the property name
						// and assign the value. If it isn't used, then we get the result we want anyway
						data[aLast.replace(__reArray, '')] = val;
					}
				};

				return function (data, val) { // meta is also passed in, but not used
					return setData(data, val, source);
				};
			}
			else {
				// Array or flat object mapping
				return function (data, val) { // meta is also passed in, but not used
					data[source] = val;
				};
			}
		},

		/**
		 * Create a function that will read nested objects from arrays, based on JSON notation
		 * @param {*} source JSON notation string
		 * @returns Value read
		 */
		get: function (source) {
			if ($.isPlainObject(source)) {
				// Build an object of get functions, and wrap them in a single call
				var o = {};
				$.each(source, function (key, val) {
					if (val) {
						o[key] = DataTable.util.get(val);
					}
				});

				return function (data, type, row, meta) {
					var t = o[type] || o._;
					return t !== undefined ?
						t(data, type, row, meta) :
						data;
				};
			}
			else if (source === null) {
				// Give an empty string for rendering / sorting etc
				return function (data) { // type, row and meta also passed, but not used
					return data;
				};
			}
			else if (typeof source === 'function') {
				return function (data, type, row, meta) {
					return source(data, type, row, meta);
				};
			}
			else if (
				typeof source === 'string' && (source.indexOf('.') !== -1 ||
					source.indexOf('[') !== -1 || source.indexOf('(') !== -1)
			) {
				/* If there is a . in the source string then the data source is in a
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var arrayNotation, funcNotation, out, innerSrc;

					if (src !== "") {
						var a = _fnSplitObjNotation(src);

						for (var i = 0, iLen = a.length; i < iLen; i++) {
							// Check if we are dealing with special notation
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);

							if (arrayNotation) {
								// Array notation
								a[i] = a[i].replace(__reArray, '');

								// Condition allows simply [] to be passed in
								if (a[i] !== "") {
									data = data[a[i]];
								}
								out = [];

								// Get the remainder of the nested object to get
								a.splice(0, i + 1);
								innerSrc = a.join('.');

								// Traverse each entry in the array getting the properties requested
								if (Array.isArray(data)) {
									for (var j = 0, jLen = data.length; j < jLen; j++) {
										out.push(fetchData(data[j], type, innerSrc));
									}
								}

								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length - 1);
								data = (join === "") ? out : out.join(join);

								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
							else if (funcNotation) {
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[a[i]]();
								continue;
							}

							if (data === null || data[a[i]] === null) {
								return null;
							}
							else if (data === undefined || data[a[i]] === undefined) {
								return undefined;
							}

							data = data[a[i]];
						}
					}

					return data;
				};

				return function (data, type) { // row and meta also passed, but not used
					return fetchData(data, type, source);
				};
			}
			else {
				// Array or flat object mapping
				return function (data) { // row and meta also passed, but not used
					return data[source];
				};
			}
		},

		stripHtml: function (mixed) {
			var type = typeof mixed;

			if (type === 'function') {
				_stripHtml = mixed;
				return;
			}
			else if (type === 'string') {
				return _stripHtml(mixed);
			}
			return mixed;
		},

		escapeHtml: function (mixed) {
			var type = typeof mixed;

			if (type === 'function') {
				_escapeHtml = mixed;
				return;
			}
			else if (type === 'string' || Array.isArray(mixed)) {
				return _escapeHtml(mixed);
			}
			return mixed;
		},

		unique: _unique
	};



	/**
	 * Create a mapping object that allows camel case parameters to be looked up
	 * for their Hungarian counterparts. The mapping is stored in a private
	 * parameter called `_hungarianMap` which can be accessed on the source object.
	 *  @param {object} o
	 *  @memberof DataTable#oApi
	 */
	function _fnHungarianMap(o) {
		var
			hungarian = 'a aa ai ao as b fn i m o s ',
			match,
			newKey,
			map = {};

		$.each(o, function (key) {
			match = key.match(/^([^A-Z]+?)([A-Z])/);

			if (match && hungarian.indexOf(match[1] + ' ') !== -1) {
				newKey = key.replace(match[0], match[2].toLowerCase());
				map[newKey] = key;

				if (match[1] === 'o') {
					_fnHungarianMap(o[key]);
				}
			}
		});

		o._hungarianMap = map;
	}


	/**
	 * Convert from camel case parameters to Hungarian, based on a Hungarian map
	 * created by _fnHungarianMap.
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 *  @memberof DataTable#oApi
	 */
	function _fnCamelToHungarian(src, user, force) {
		if (!src._hungarianMap) {
			_fnHungarianMap(src);
		}

		var hungarianKey;

		$.each(user, function (key) {
			hungarianKey = src._hungarianMap[key];

			if (hungarianKey !== undefined && (force || user[hungarianKey] === undefined)) {
				// For objects, we need to buzz down into the object to copy parameters
				if (hungarianKey.charAt(0) === 'o') {
					// Copy the camelCase options over to the hungarian
					if (!user[hungarianKey]) {
						user[hungarianKey] = {};
					}
					$.extend(true, user[hungarianKey], user[key]);

					_fnCamelToHungarian(src[hungarianKey], user[hungarianKey], force);
				}
				else {
					user[hungarianKey] = user[key];
				}
			}
		});
	}

	/**
	 * Map one parameter onto another
	 *  @param {object} o Object to map
	 *  @param {*} knew The new parameter name
	 *  @param {*} old The old parameter name
	 */
	var _fnCompatMap = function (o, knew, old) {
		if (o[knew] !== undefined) {
			o[old] = o[knew];
		}
	};


	/**
	 * Provide backwards compatibility for the main DT options. Note that the new
	 * options are mapped onto the old parameters, so this is an external interface
	 * change only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatOpts(init) {
		_fnCompatMap(init, 'ordering', 'bSort');
		_fnCompatMap(init, 'orderMulti', 'bSortMulti');
		_fnCompatMap(init, 'orderClasses', 'bSortClasses');
		_fnCompatMap(init, 'orderCellsTop', 'bSortCellsTop');
		_fnCompatMap(init, 'order', 'aaSorting');
		_fnCompatMap(init, 'orderFixed', 'aaSortingFixed');
		_fnCompatMap(init, 'paging', 'bPaginate');
		_fnCompatMap(init, 'pagingType', 'sPaginationType');
		_fnCompatMap(init, 'pageLength', 'iDisplayLength');
		_fnCompatMap(init, 'searching', 'bFilter');

		// Boolean initialisation of x-scrolling
		if (typeof init.sScrollX === 'boolean') {
			init.sScrollX = init.sScrollX ? '100%' : '';
		}
		if (typeof init.scrollX === 'boolean') {
			init.scrollX = init.scrollX ? '100%' : '';
		}

		// Column search objects are in an array, so it needs to be converted
		// element by element
		var searchCols = init.aoSearchCols;

		if (searchCols) {
			for (var i = 0, ien = searchCols.length; i < ien; i++) {
				if (searchCols[i]) {
					_fnCamelToHungarian(DataTable.models.oSearch, searchCols[i]);
				}
			}
		}

		// Enable search delay if server-side processing is enabled
		if (init.serverSide && !init.searchDelay) {
			init.searchDelay = 400;
		}
	}


	/**
	 * Provide backwards compatibility for column options. Note that the new options
	 * are mapped onto the old parameters, so this is an external interface change
	 * only.
	 *  @param {object} init Object to map
	 */
	function _fnCompatCols(init) {
		_fnCompatMap(init, 'orderable', 'bSortable');
		_fnCompatMap(init, 'orderData', 'aDataSort');
		_fnCompatMap(init, 'orderSequence', 'asSorting');
		_fnCompatMap(init, 'orderDataType', 'sortDataType');

		// orderData can be given as an integer
		var dataSort = init.aDataSort;
		if (typeof dataSort === 'number' && !Array.isArray(dataSort)) {
			init.aDataSort = [dataSort];
		}
	}


	/**
	 * Browser feature detection for capabilities, quirks
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBrowserDetect(settings) {
		// We don't need to do this every time DataTables is constructed, the values
		// calculated are specific to the browser and OS configuration which we
		// don't expect to change between initialisations
		if (!DataTable.__browser) {
			var browser = {};
			DataTable.__browser = browser;

			// Scrolling feature / quirks detection
			var n = $('<div/>')
				.css({
					position: 'fixed',
					top: 0,
					left: -1 * window.pageXOffset, // allow for scrolling
					height: 1,
					width: 1,
					overflow: 'hidden'
				})
				.append(
					$('<div/>')
						.css({
							position: 'absolute',
							top: 1,
							left: 1,
							width: 100,
							overflow: 'scroll'
						})
						.append(
							$('<div/>')
								.css({
									width: '100%',
									height: 10
								})
						)
				)
				.appendTo('body');

			var outer = n.children();
			var inner = outer.children();

			// Get scrollbar width
			browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;

			// In rtl text layout, some browsers (most, but not all) will place the
			// scrollbar on the left, rather than the right.
			browser.bScrollbarLeft = Math.round(inner.offset().left) !== 1;

			n.remove();
		}

		$.extend(settings.oBrowser, DataTable.__browser);
		settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
	}

	/**
	 * Add a column to the list used for the table with default values
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddColumn(oSettings) {
		// Add column to aoColumns array
		var oDefaults = DataTable.defaults.column;
		var iCol = oSettings.aoColumns.length;
		var oCol = $.extend({}, DataTable.models.oColumn, oDefaults, {
			"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
			"mData": oDefaults.mData ? oDefaults.mData : iCol,
			idx: iCol,
			searchFixed: {},
			colEl: $('<col>').attr('data-dt-column', iCol)
		});
		oSettings.aoColumns.push(oCol);

		// Add search object for column specific search. Note that the `searchCols[ iCol ]`
		// passed into extend can be undefined. This allows the user to give a default
		// with only some of the parameters defined, and also not give a default
		var searchCols = oSettings.aoPreSearchCols;
		searchCols[iCol] = $.extend({}, DataTable.models.oSearch, searchCols[iCol]);
	}


	/**
	 * Apply options for a column
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iCol column index to consider
	 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnOptions(oSettings, iCol, oOptions) {
		var oCol = oSettings.aoColumns[iCol];

		/* User specified column options */
		if (oOptions !== undefined && oOptions !== null) {
			// Backwards compatibility
			_fnCompatCols(oOptions);

			// Map camel case parameters to their Hungarian counterparts
			_fnCamelToHungarian(DataTable.defaults.column, oOptions, true);

			/* Backwards compatibility for mDataProp */
			if (oOptions.mDataProp !== undefined && !oOptions.mData) {
				oOptions.mData = oOptions.mDataProp;
			}

			if (oOptions.sType) {
				oCol._sManualType = oOptions.sType;
			}

			// `class` is a reserved word in Javascript, so we need to provide
			// the ability to use a valid name for the camel case input
			if (oOptions.className && !oOptions.sClass) {
				oOptions.sClass = oOptions.className;
			}

			var origClass = oCol.sClass;

			$.extend(oCol, oOptions);
			_fnMap(oCol, oOptions, "sWidth", "sWidthOrig");

			// Merge class from previously defined classes with this one, rather than just
			// overwriting it in the extend above
			if (origClass !== oCol.sClass) {
				oCol.sClass = origClass + ' ' + oCol.sClass;
			}

			/* iDataSort to be applied (backwards compatibility), but aDataSort will take
			 * priority if defined
			 */
			if (oOptions.iDataSort !== undefined) {
				oCol.aDataSort = [oOptions.iDataSort];
			}
			_fnMap(oCol, oOptions, "aDataSort");
		}

		/* Cache the data get and set functions for speed */
		var mDataSrc = oCol.mData;
		var mData = _fnGetObjectDataFn(mDataSrc);

		// The `render` option can be given as an array to access the helper rendering methods.
		// The first element is the rendering method to use, the rest are the parameters to pass
		if (oCol.mRender && Array.isArray(oCol.mRender)) {
			var copy = oCol.mRender.slice();
			var name = copy.shift();

			oCol.mRender = DataTable.render[name].apply(window, copy);
		}

		oCol._render = oCol.mRender ? _fnGetObjectDataFn(oCol.mRender) : null;

		var attrTest = function (src) {
			return typeof src === 'string' && src.indexOf('@') !== -1;
		};
		oCol._bAttrSrc = $.isPlainObject(mDataSrc) && (
			attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
		);
		oCol._setter = null;

		oCol.fnGetData = function (rowData, type, meta) {
			var innerData = mData(rowData, type, undefined, meta);

			return oCol._render && type ?
				oCol._render(innerData, type, rowData, meta) :
				innerData;
		};
		oCol.fnSetData = function (rowData, val, meta) {
			return _fnSetObjectDataFn(mDataSrc)(rowData, val, meta);
		};

		// Indicate if DataTables should read DOM data as an object or array
		// Used in _fnGetRowElements
		if (typeof mDataSrc !== 'number' && !oCol._isArrayHost) {
			oSettings._rowReadObject = true;
		}

		/* Feature sorting overrides column specific when off */
		if (!oSettings.oFeatures.bSort) {
			oCol.bSortable = false;
		}
	}


	/**
	 * Adjust the table column widths for new data. Note: you would probably want to
	 * do a redraw after calling this function!
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAdjustColumnSizing(settings) {
		_fnCalculateColumnWidths(settings);
		_fnColumnSizes(settings);

		var scroll = settings.oScroll;
		if (scroll.sY !== '' || scroll.sX !== '') {
			_fnScrollDraw(settings);
		}

		_fnCallbackFire(settings, null, 'column-sizing', [settings]);
	}

	/**
	 * Apply column sizes
	 *
	 * @param {*} settings DataTables settings object
	 */
	function _fnColumnSizes(settings) {
		var cols = settings.aoColumns;

		for (var i = 0; i < cols.length; i++) {
			var width = _fnColumnsSumWidth(settings, [i], false, false);

			cols[i].colEl.css('width', width);
		}
	}


	/**
	 * Convert the index of a visible column to the index in the data array (take account
	 * of hidden columns)
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iMatch Visible column index to lookup
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnVisibleToColumnIndex(oSettings, iMatch) {
		var aiVis = _fnGetColumns(oSettings, 'bVisible');

		return typeof aiVis[iMatch] === 'number' ?
			aiVis[iMatch] :
			null;
	}


	/**
	 * Convert the index of an index in the data array and convert it to the visible
	 *   column index (take account of hidden columns)
	 *  @param {int} iMatch Column index to lookup
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the data index
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnIndexToVisible(oSettings, iMatch) {
		var aiVis = _fnGetColumns(oSettings, 'bVisible');
		var iPos = aiVis.indexOf(iMatch);

		return iPos !== -1 ? iPos : null;
	}


	/**
	 * Get the number of visible columns
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {int} i the number of visible columns
	 *  @memberof DataTable#oApi
	 */
	function _fnVisbleColumns(settings) {
		var layout = settings.aoHeader;
		var columns = settings.aoColumns;
		var vis = 0;

		if (layout.length) {
			for (var i = 0, ien = layout[0].length; i < ien; i++) {
				if (columns[i].bVisible && $(layout[0][i].cell).css('display') !== 'none') {
					vis++;
				}
			}
		}

		return vis;
	}


	/**
	 * Get an array of column indexes that match a given property
	 *  @param {object} oSettings dataTables settings object
	 *  @param {string} sParam Parameter in aoColumns to look for - typically
	 *    bVisible or bSearchable
	 *  @returns {array} Array of indexes with matched properties
	 *  @memberof DataTable#oApi
	 */
	function _fnGetColumns(oSettings, sParam) {
		var a = [];

		oSettings.aoColumns.map(function (val, i) {
			if (val[sParam]) {
				a.push(i);
			}
		});

		return a;
	}


	/**
	 * Calculate the 'type' of a column
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnColumnTypes(settings) {
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var types = DataTable.ext.type.detect;
		var i, ien, j, jen, k, ken;
		var col, detectedType, cache;

		// For each column, spin over the 
		for (i = 0, ien = columns.length; i < ien; i++) {
			col = columns[i];
			cache = [];

			if (!col.sType && col._sManualType) {
				col.sType = col._sManualType;
			}
			else if (!col.sType) {
				for (j = 0, jen = types.length; j < jen; j++) {
					for (k = 0, ken = data.length; k < ken; k++) {

						if (!data[k]) {
							continue;
						}

						// Use a cache array so we only need to get the type data
						// from the formatter once (when using multiple detectors)
						if (cache[k] === undefined) {
							cache[k] = _fnGetCellData(settings, k, i, 'type');
						}

						detectedType = types[j](cache[k], settings);

						// If null, then this type can't apply to this column, so
						// rather than testing all cells, break out. There is an
						// exception for the last type which is `html`. We need to
						// scan all rows since it is possible to mix string and HTML
						// types
						if (!detectedType && j !== types.length - 2) {
							break;
						}

						// Only a single match is needed for html type since it is
						// bottom of the pile and very similar to string - but it
						// must not be empty
						if (detectedType === 'html' && !_empty(cache[k])) {
							break;
						}
					}

					// Type is valid for all data points in the column - use this
					// type
					if (detectedType) {
						col.sType = detectedType;
						break;
					}
				}

				// Fall back - if no type was detected, always use string
				if (!col.sType) {
					col.sType = 'string';
				}
			}

			// Set class names for header / footer for auto type classes
			var autoClass = _ext.type.className[col.sType];

			if (autoClass) {
				_columnAutoClass(settings.aoHeader, i, autoClass);
				_columnAutoClass(settings.aoFooter, i, autoClass);
			}

			var renderer = _ext.type.render[col.sType];

			// This can only happen once! There is no way to remover
			// a renderer. After the first time the renderer has
			// already been set so createTr will run the renderer itself.
			if (renderer && !col._render) {
				col._render = DataTable.util.get(renderer);

				_columnAutoRender(settings, i);
			}
		}
	}

	/**
	 * Apply an auto detected renderer to data which doesn't yet have
	 * a renderer
	 */
	function _columnAutoRender(settings, colIdx) {
		var data = settings.aoData;

		for (var i = 0; i < data.length; i++) {
			if (data[i].nTr) {
				// We have to update the display here since there is no
				// invalidation check for the data
				var display = _fnGetCellData(settings, i, colIdx, 'display');

				data[i].displayData[colIdx] = display;
				_fnWriteCell(data[i].anCells[colIdx], display);

				// No need to update sort / filter data since it has
				// been invalidated and will be re-read with the
				// renderer now applied
			}
		}
	}

	/**
	 * Apply a class name to a column's header cells
	 */
	function _columnAutoClass(container, colIdx, className) {
		container.forEach(function (row) {
			if (row[colIdx] && row[colIdx].unique) {
				_addClass(row[colIdx].cell, className);
			}
		});
	}

	/**
	 * Take the column definitions and static columns arrays and calculate how
	 * they relate to column indexes. The callback function will then apply the
	 * definition found for a column to a suitable configuration object.
	 *  @param {object} oSettings dataTables settings object
	 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
	 *  @param {array} aoCols The aoColumns array that defines columns individually
	 *  @param {array} headerLayout Layout for header as it was loaded
	 *  @param {function} fn Callback function - takes two parameters, the calculated
	 *    column index and the definition for that column.
	 *  @memberof DataTable#oApi
	 */
	function _fnApplyColumnDefs(oSettings, aoColDefs, aoCols, headerLayout, fn) {
		var i, iLen, j, jLen, k, kLen, def;
		var columns = oSettings.aoColumns;

		if (aoCols) {
			for (i = 0, iLen = aoCols.length; i < iLen; i++) {
				if (aoCols[i] && aoCols[i].name) {
					columns[i].sName = aoCols[i].name;
				}
			}
		}

		// Column definitions with aTargets
		if (aoColDefs) {
			/* Loop over the definitions array - loop in reverse so first instance has priority */
			for (i = aoColDefs.length - 1; i >= 0; i--) {
				def = aoColDefs[i];

				/* Each definition can target multiple columns, as it is an array */
				var aTargets = def.target !== undefined
					? def.target
					: def.targets !== undefined
						? def.targets
						: def.aTargets;

				if (!Array.isArray(aTargets)) {
					aTargets = [aTargets];
				}

				for (j = 0, jLen = aTargets.length; j < jLen; j++) {
					var target = aTargets[j];

					if (typeof target === 'number' && target >= 0) {
						/* Add columns that we don't yet know about */
						while (columns.length <= target) {
							_fnAddColumn(oSettings);
						}

						/* Integer, basic index */
						fn(target, def);
					}
					else if (typeof target === 'number' && target < 0) {
						/* Negative integer, right to left column counting */
						fn(columns.length + target, def);
					}
					else if (typeof target === 'string') {
						for (k = 0, kLen = columns.length; k < kLen; k++) {
							if (target === '_all') {
								// Apply to all columns
								fn(k, def);
							}
							else if (target.indexOf(':name') !== -1) {
								// Column selector
								if (columns[k].sName === target.replace(':name', '')) {
									fn(k, def);
								}
							}
							else {
								// Cell selector
								headerLayout.forEach(function (row) {
									if (row[k]) {
										var cell = $(row[k].cell);

										// Legacy support. Note that it means that we don't support
										// an element name selector only, since they are treated as
										// class names for 1.x compat.
										if (target.match(/^[a-z][\w-]*$/i)) {
											target = '.' + target;
										}

										if (cell.is(target)) {
											fn(k, def);
										}
									}
								});
							}
						}
					}
				}
			}
		}

		// Statically defined columns array
		if (aoCols) {
			for (i = 0, iLen = aoCols.length; i < iLen; i++) {
				fn(i, aoCols[i]);
			}
		}
	}


	/**
	 * Get the width for a given set of columns
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} targets Columns - comma separated string or array of numbers
	 * @param {*} original Use the original width (true) or calculated (false)
	 * @param {*} incVisible Include visible columns (true) or not (false)
	 * @returns Combined CSS value
	 */
	function _fnColumnsSumWidth(settings, targets, original, incVisible) {
		if (!Array.isArray(targets)) {
			targets = _fnColumnsFromHeader(targets);
		}

		var sum = 0;
		var unit;
		var columns = settings.aoColumns;

		for (var i = 0, ien = targets.length; i < ien; i++) {
			var column = columns[targets[i]];
			var definedWidth = original ?
				column.sWidthOrig :
				column.sWidth;

			if (!incVisible && column.bVisible === false) {
				continue;
			}

			if (definedWidth === null || definedWidth === undefined) {
				return null; // can't determine a defined width - browser defined
			}
			else if (typeof definedWidth === 'number') {
				unit = 'px';
				sum += definedWidth;
			}
			else {
				var matched = definedWidth.match(/([\d\.]+)([^\d]*)/);

				if (matched) {
					sum += matched[1] * 1;
					unit = matched.length === 3 ?
						matched[2] :
						'px';
				}
			}
		}

		return sum + unit;
	}

	function _fnColumnsFromHeader(cell) {
		var attr = $(cell).closest('[data-dt-column]').attr('data-dt-column');

		if (!attr) {
			return [];
		}

		return attr.split(',').map(function (val) {
			return val * 1;
		});
	}
	/**
	 * Add a data array to the table, creating DOM node etc. This is the parallel to
	 * _fnGatherData, but for adding rows from a Javascript source, rather than a
	 * DOM source.
	 *  @param {object} settings dataTables settings object
	 *  @param {array} data data array to be added
	 *  @param {node} [tr] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [tds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
	 *  @memberof DataTable#oApi
	 */
	function _fnAddData(settings, dataIn, tr, tds) {
		/* Create the object for storing information about this new row */
		var rowIdx = settings.aoData.length;
		var rowModel = $.extend(true, {}, DataTable.models.oRow, {
			src: tr ? 'dom' : 'data',
			idx: rowIdx
		});

		rowModel._aData = dataIn;
		settings.aoData.push(rowModel);

		var columns = settings.aoColumns;

		for (var i = 0, iLen = columns.length; i < iLen; i++) {
			// Invalidate the column types as the new data needs to be revalidated
			columns[i].sType = null;
		}

		/* Add to the display array */
		settings.aiDisplayMaster.push(rowIdx);

		var id = settings.rowIdFn(dataIn);
		if (id !== undefined) {
			settings.aIds[id] = rowModel;
		}

		/* Create the DOM information, or register it if already present */
		if (tr || !settings.oFeatures.bDeferRender) {
			_fnCreateTr(settings, rowIdx, tr, tds);
		}

		return rowIdx;
	}


	/**
	 * Add one or more TR elements to the table. Generally we'd expect to
	 * use this for reading data from a DOM sourced table, but it could be
	 * used for an TR element. Note that if a TR is given, it is used (i.e.
	 * it is not cloned).
	 *  @param {object} settings dataTables settings object
	 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
	 *  @returns {array} Array of indexes for the added rows
	 *  @memberof DataTable#oApi
	 */
	function _fnAddTr(settings, trs) {
		var row;

		// Allow an individual node to be passed in
		if (!(trs instanceof $)) {
			trs = $(trs);
		}

		return trs.map(function (i, el) {
			row = _fnGetRowElements(settings, el);
			return _fnAddData(settings, row.data, el, row.cells);
		});
	}


	/**
	 * Get the data for a given cell from the internal cache, taking into account data mapping
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {string} type data get type ('display', 'type' 'filter|search' 'sort|order')
	 *  @returns {*} Cell data
	 *  @memberof DataTable#oApi
	 */
	function _fnGetCellData(settings, rowIdx, colIdx, type) {
		if (type === 'search') {
			type = 'filter';
		}
		else if (type === 'order') {
			type = 'sort';
		}

		var row = settings.aoData[rowIdx];

		if (!row) {
			return undefined;
		}

		var draw = settings.iDraw;
		var col = settings.aoColumns[colIdx];
		var rowData = row._aData;
		var defaultContent = col.sDefaultContent;
		var cellData = col.fnGetData(rowData, type, {
			settings: settings,
			row: rowIdx,
			col: colIdx
		});

		// Allow for a node being returned for non-display types
		if (type !== 'display' && cellData && typeof cellData === 'object' && cellData.nodeName) {
			cellData = cellData.innerHTML;
		}

		if (cellData === undefined) {
			if (settings.iDrawError != draw && defaultContent === null) {
				_fnLog(settings, 0, "Requested unknown parameter " +
					(typeof col.mData == 'function' ? '{function}' : "'" + col.mData + "'") +
					" for row " + rowIdx + ", column " + colIdx, 4);
				settings.iDrawError = draw;
			}
			return defaultContent;
		}

		// When the data source is null and a specific data type is requested (i.e.
		// not the original data), we can use default column data
		if ((cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined) {
			cellData = defaultContent;
		}
		else if (typeof cellData === 'function') {
			// If the data source is a function, then we run it and use the return,
			// executing in the scope of the data object (for instances)
			return cellData.call(rowData);
		}

		if (cellData === null && type === 'display') {
			return '';
		}

		if (type === 'filter') {
			var fomatters = DataTable.ext.type.search;

			if (fomatters[col.sType]) {
				cellData = fomatters[col.sType](cellData);
			}
		}

		return cellData;
	}


	/**
	 * Set the value for a specific cell, into the internal data cache
	 *  @param {object} settings dataTables settings object
	 *  @param {int} rowIdx aoData row id
	 *  @param {int} colIdx Column index
	 *  @param {*} val Value to set
	 *  @memberof DataTable#oApi
	 */
	function _fnSetCellData(settings, rowIdx, colIdx, val) {
		var col = settings.aoColumns[colIdx];
		var rowData = settings.aoData[rowIdx]._aData;

		col.fnSetData(rowData, val, {
			settings: settings,
			row: rowIdx,
			col: colIdx
		});
	}

	/**
	 * Write a value to a cell
	 * @param {*} td Cell
	 * @param {*} val Value
	 */
	function _fnWriteCell(td, val) {
		if (val && typeof val === 'object' && val.nodeName) {
			$(td)
				.empty()
				.append(val);
		}
		else {
			td.innerHTML = val;
		}
	}


	// Private variable that is used to match action syntax in the data property object
	var __reArray = /\[.*?\]$/;
	var __reFn = /\(\)$/;

	/**
	 * Split string on periods, taking into account escaped periods
	 * @param  {string} str String to split
	 * @return {array} Split string
	 */
	function _fnSplitObjNotation(str) {
		var parts = str.match(/(\\.|[^.])+/g) || [''];

		return parts.map(function (s) {
			return s.replace(/\\\./g, '.');
		});
	}


	/**
	 * Return a function that can be used to get data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data get function
	 *  @memberof DataTable#oApi
	 */
	var _fnGetObjectDataFn = DataTable.util.get;


	/**
	 * Return a function that can be used to set data from a source object, taking
	 * into account the ability to use nested objects as a source
	 *  @param {string|int|function} mSource The data source for the object
	 *  @returns {function} Data set function
	 *  @memberof DataTable#oApi
	 */
	var _fnSetObjectDataFn = DataTable.util.set;


	/**
	 * Return an array with the full table data
	 *  @param {object} oSettings dataTables settings object
	 *  @returns array {array} aData Master data array
	 *  @memberof DataTable#oApi
	 */
	function _fnGetDataMaster(settings) {
		return _pluck(settings.aoData, '_aData');
	}


	/**
	 * Nuke the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnClearTable(settings) {
		settings.aoData.length = 0;
		settings.aiDisplayMaster.length = 0;
		settings.aiDisplay.length = 0;
		settings.aIds = {};
	}


	/**
	 * Mark cached data as invalid such that a re-read of the data will occur when
	 * the cached data is next requested. Also update from the data source object.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {int}    rowIdx   Row index to invalidate
	 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
	 *     or 'data'
	 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
	 *     row will be invalidated
	 * @memberof DataTable#oApi
	 *
	 * @todo For the modularisation of v1.11 this will need to become a callback, so
	 *   the sort and filter methods can subscribe to it. That will required
	 *   initialisation options for sorting, which is why it is not already baked in
	 */
	function _fnInvalidate(settings, rowIdx, src, colIdx) {
		var row = settings.aoData[rowIdx];
		var i, ien;

		// Remove the cached data for the row
		row._aSortData = null;
		row._aFilterData = null;
		row.displayData = null;

		// Are we reading last data from DOM or the data object?
		if (src === 'dom' || ((!src || src === 'auto') && row.src === 'dom')) {
			// Read the data from the DOM
			row._aData = _fnGetRowElements(
				settings, row, colIdx, colIdx === undefined ? undefined : row._aData
			)
				.data;
		}
		else {
			// Reading from data object, update the DOM
			var cells = row.anCells;
			var display = _fnGetRowDisplay(settings, rowIdx);

			if (cells) {
				if (colIdx !== undefined) {
					_fnWriteCell(cells[colIdx], display[colIdx]);
				}
				else {
					for (i = 0, ien = cells.length; i < ien; i++) {
						_fnWriteCell(cells[i], display[i]);
					}
				}
			}
		}

		// Column specific invalidation
		var cols = settings.aoColumns;
		if (colIdx !== undefined) {
			// Type - the data might have changed
			cols[colIdx].sType = null;

			// Max length string. Its a fairly cheep recalculation, so not worth
			// something more complicated
			cols[colIdx].maxLenString = null;
		}
		else {
			for (i = 0, ien = cols.length; i < ien; i++) {
				cols[i].sType = null;
				cols[i].maxLenString = null;
			}

			// Update DataTables special `DT_*` attributes for the row
			_fnRowAttributes(settings, row);
		}
	}


	/**
	 * Build a data source object from an HTML row, reading the contents of the
	 * cells that are in the row.
	 *
	 * @param {object} settings DataTables settings object
	 * @param {node|object} TR element from which to read data or existing row
	 *   object from which to re-read the data from the cells
	 * @param {int} [colIdx] Optional column index
	 * @param {array|object} [d] Data source object. If `colIdx` is given then this
	 *   parameter should also be given and will be used to write the data into.
	 *   Only the column in question will be written
	 * @returns {object} Object with two parameters: `data` the data read, in
	 *   document order, and `cells` and array of nodes (they can be useful to the
	 *   caller, so rather than needing a second traversal to get them, just return
	 *   them from here).
	 * @memberof DataTable#oApi
	 */
	function _fnGetRowElements(settings, row, colIdx, d) {
		var
			tds = [],
			td = row.firstChild,
			name, col, i = 0, contents,
			columns = settings.aoColumns,
			objectRead = settings._rowReadObject;

		// Allow the data object to be passed in, or construct
		d = d !== undefined ?
			d :
			objectRead ?
				{} :
				[];

		var attr = function (str, td) {
			if (typeof str === 'string') {
				var idx = str.indexOf('@');

				if (idx !== -1) {
					var attr = str.substring(idx + 1);
					var setter = _fnSetObjectDataFn(str);
					setter(d, td.getAttribute(attr));
				}
			}
		};

		// Read data from a cell and store into the data object
		var cellProcess = function (cell) {
			if (colIdx === undefined || colIdx === i) {
				col = columns[i];
				contents = (cell.innerHTML).trim();

				if (col && col._bAttrSrc) {
					var setter = _fnSetObjectDataFn(col.mData._);
					setter(d, contents);

					attr(col.mData.sort, cell);
					attr(col.mData.type, cell);
					attr(col.mData.filter, cell);
				}
				else {
					// Depending on the `data` option for the columns the data can
					// be read to either an object or an array.
					if (objectRead) {
						if (!col._setter) {
							// Cache the setter function
							col._setter = _fnSetObjectDataFn(col.mData);
						}
						col._setter(d, contents);
					}
					else {
						d[i] = contents;
					}
				}
			}

			i++;
		};

		if (td) {
			// `tr` element was passed in
			while (td) {
				name = td.nodeName.toUpperCase();

				if (name == "TD" || name == "TH") {
					cellProcess(td);
					tds.push(td);
				}

				td = td.nextSibling;
			}
		}
		else {
			// Existing row object passed in
			tds = row.anCells;

			for (var j = 0, jen = tds.length; j < jen; j++) {
				cellProcess(tds[j]);
			}
		}

		// Read the ID from the DOM if present
		var rowNode = row.firstChild ? row : row.nTr;

		if (rowNode) {
			var id = rowNode.getAttribute('id');

			if (id) {
				_fnSetObjectDataFn(settings.rowId)(d, id);
			}
		}

		return {
			data: d,
			cells: tds
		};
	}

	/**
	 * Render and cache a row's display data for the columns, if required
	 * @returns 
	 */
	function _fnGetRowDisplay(settings, rowIdx) {
		let rowModal = settings.aoData[rowIdx];
		let columns = settings.aoColumns;

		if (!rowModal.displayData) {
			// Need to render and cache
			rowModal.displayData = [];

			for (var colIdx = 0, len = columns.length; colIdx < len; colIdx++) {
				rowModal.displayData.push(
					_fnGetCellData(settings, rowIdx, colIdx, 'display')
				);
			}
		}

		return rowModal.displayData;
	}

	/**
	 * Create a new TR element (and it's TD children) for a row
	 *  @param {object} oSettings dataTables settings object
	 *  @param {int} iRow Row to consider
	 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
	 *    DataTables will create a row automatically
	 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
	 *    if nTr is.
	 *  @memberof DataTable#oApi
	 */
	function _fnCreateTr(oSettings, iRow, nTrIn, anTds) {
		var
			row = oSettings.aoData[iRow],
			rowData = row._aData,
			cells = [],
			nTr, nTd, oCol,
			i, iLen, create,
			trClass = oSettings.oClasses.tbody.row;

		if (row.nTr === null) {
			nTr = nTrIn || document.createElement('tr');

			row.nTr = nTr;
			row.anCells = cells;

			_addClass(nTr, trClass);

			/* Use a private property on the node to allow reserve mapping from the node
			 * to the aoData array for fast look up
			 */
			nTr._DT_RowIndex = iRow;

			/* Special parameters can be given by the data source to be used on the row */
			_fnRowAttributes(oSettings, row);

			/* Process each column */
			for (i = 0, iLen = oSettings.aoColumns.length; i < iLen; i++) {
				oCol = oSettings.aoColumns[i];
				create = nTrIn && anTds[i] ? false : true;

				nTd = create ? document.createElement(oCol.sCellType) : anTds[i];

				if (!nTd) {
					_fnLog(oSettings, 0, 'Incorrect column count', 18);
				}

				nTd._DT_CellIndex = {
					row: iRow,
					column: i
				};

				cells.push(nTd);

				var display = _fnGetRowDisplay(oSettings, iRow);

				// Need to create the HTML if new, or if a rendering function is defined
				if (
					create ||
					(
						(oCol.mRender || oCol.mData !== i) &&
						(!$.isPlainObject(oCol.mData) || oCol.mData._ !== i + '.display')
					)
				) {
					_fnWriteCell(nTd, display[i]);
				}

				// Visibility - add or remove as required
				if (oCol.bVisible && create) {
					nTr.appendChild(nTd);
				}
				else if (!oCol.bVisible && !create) {
					nTd.parentNode.removeChild(nTd);
				}

				if (oCol.fnCreatedCell) {
					oCol.fnCreatedCell.call(oSettings.oInstance,
						nTd, _fnGetCellData(oSettings, iRow, i), rowData, iRow, i
					);
				}
			}

			_fnCallbackFire(oSettings, 'aoRowCreatedCallback', 'row-created', [nTr, rowData, iRow, cells]);
		}
		else {
			_addClass(row.nTr, trClass);
		}
	}


	/**
	 * Add attributes to a row based on the special `DT_*` parameters in a data
	 * source object.
	 *  @param {object} settings DataTables settings object
	 *  @param {object} DataTables row object for the row to be modified
	 *  @memberof DataTable#oApi
	 */
	function _fnRowAttributes(settings, row) {
		var tr = row.nTr;
		var data = row._aData;

		if (tr) {
			var id = settings.rowIdFn(data);

			if (id) {
				tr.id = id;
			}

			if (data.DT_RowClass) {
				// Remove any classes added by DT_RowClass before
				var a = data.DT_RowClass.split(' ');
				row.__rowc = row.__rowc ?
					_unique(row.__rowc.concat(a)) :
					a;

				$(tr)
					.removeClass(row.__rowc.join(' '))
					.addClass(data.DT_RowClass);
			}

			if (data.DT_RowAttr) {
				$(tr).attr(data.DT_RowAttr);
			}

			if (data.DT_RowData) {
				$(tr).data(data.DT_RowData);
			}
		}
	}


	/**
	 * Create the HTML header for the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnBuildHead(settings, side) {
		var classes = settings.oClasses;
		var columns = settings.aoColumns;
		var i, ien, row;
		var target = side === 'header'
			? settings.nTHead
			: settings.nTFoot;
		var titleProp = side === 'header' ? 'sTitle' : side;

		// Footer might be defined
		if (!target) {
			return;
		}

		// If no cells yet and we have content for them, then create
		if (side === 'header' || _pluck(settings.aoColumns, titleProp).join('')) {
			row = $('tr', target);

			// Add a row if needed
			if (!row.length) {
				row = $('<tr/>').appendTo(target)
			}

			// Add the number of cells needed to make up to the number of columns
			if (row.length === 1) {
				var cells = $('td, th', row);

				for (i = cells.length, ien = columns.length; i < ien; i++) {
					$('<th/>')
						.html(columns[i][titleProp] || '')
						.appendTo(row);
				}
			}
		}

		var detected = _fnDetectHeader(settings, target, true);

		if (side === 'header') {
			settings.aoHeader = detected;
		}
		else {
			settings.aoFooter = detected;
		}

		// ARIA role for the rows
		$(target).children('tr').attr('role', 'row');

		// Every cell needs to be passed through the renderer
		$(target).children('tr').children('th, td')
			.each(function () {
				_fnRenderer(settings, side)(
					settings, $(this), classes
				);
			});
	}

	/**
	 * Build a layout structure for a header or footer
	 *
	 * @param {*} settings DataTables settings
	 * @param {*} source Source layout array
	 * @param {*} incColumns What columns should be included
	 * @returns Layout array
	 */
	function _fnHeaderLayout(settings, source, incColumns) {
		var row, column, cell;
		var local = [];
		var structure = [];
		var columns = settings.aoColumns;
		var columnCount = columns.length;
		var rowspan, colspan;

		if (!source) {
			return;
		}

		// Default is to work on only visible columns
		if (!incColumns) {
			incColumns = _range(columnCount)
				.filter(function (idx) {
					return columns[idx].bVisible;
				});
		}

		// Make a copy of the master layout array, but with only the columns we want
		for (row = 0; row < source.length; row++) {
			// Remove any columns we haven't selected
			local[row] = source[row].slice().filter(function (cell, i) {
				return incColumns.includes(i);
			});

			// Prep the structure array - it needs an element for each row
			structure.push([]);
		}

		for (row = 0; row < local.length; row++) {
			for (column = 0; column < local[row].length; column++) {
				rowspan = 1;
				colspan = 1;

				// Check to see if there is already a cell (row/colspan) covering our target
				// insert point. If there is, then there is nothing to do.
				if (structure[row][column] === undefined) {
					cell = local[row][column].cell;

					// Expand for rowspan
					while (
						local[row + rowspan] !== undefined &&
						local[row][column].cell == local[row + rowspan][column].cell
					) {
						structure[row + rowspan][column] = null;
						rowspan++;
					}

					// And for colspan
					while (
						local[row][column + colspan] !== undefined &&
						local[row][column].cell == local[row][column + colspan].cell
					) {
						// Which also needs to go over rows
						for (var k = 0; k < rowspan; k++) {
							structure[row + k][column + colspan] = null;
						}

						colspan++;
					}

					var titleSpan = $('span.dt-column-title', cell);

					structure[row][column] = {
						cell: cell,
						colspan: colspan,
						rowspan: rowspan,
						title: titleSpan.length
							? titleSpan.html()
							: $(cell).html()
					};
				}
			}
		}

		return structure;
	}


	/**
	 * Draw the header (or footer) element based on the column visibility states.
	 *
	 *  @param object oSettings dataTables settings object
	 *  @param array aoSource Layout array from _fnDetectHeader
	 *  @memberof DataTable#oApi
	 */
	function _fnDrawHead(settings, source) {
		var layout = _fnHeaderLayout(settings, source);
		var tr, n;

		for (var row = 0; row < source.length; row++) {
			tr = source[row].row;

			// All cells are going to be replaced, so empty out the row
			// Can't use $().empty() as that kills event handlers
			if (tr) {
				while ((n = tr.firstChild)) {
					tr.removeChild(n);
				}
			}

			for (var column = 0; column < layout[row].length; column++) {
				var point = layout[row][column];

				if (point) {
					$(point.cell)
						.appendTo(tr)
						.attr('rowspan', point.rowspan)
						.attr('colspan', point.colspan);
				}
			}
		}
	}


	/**
	 * Insert the required TR nodes into the table for display
	 *  @param {object} oSettings dataTables settings object
	 *  @param ajaxComplete true after ajax call to complete rendering
	 *  @memberof DataTable#oApi
	 */
	function _fnDraw(oSettings, ajaxComplete) {
		// Allow for state saving and a custom start position
		_fnStart(oSettings);

		/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
		var aPreDraw = _fnCallbackFire(oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings]);
		if (aPreDraw.indexOf(false) !== -1) {
			_fnProcessingDisplay(oSettings, false);
			return;
		}

		var anRows = [];
		var iRowCount = 0;
		var bServerSide = _fnDataSource(oSettings) == 'ssp';
		var aiDisplay = oSettings.aiDisplay;
		var iDisplayStart = oSettings._iDisplayStart;
		var iDisplayEnd = oSettings.fnDisplayEnd();
		var columns = oSettings.aoColumns;
		var body = $(oSettings.nTBody);

		oSettings.bDrawing = true;

		/* Server-side processing draw intercept */
		if (!bServerSide) {
			oSettings.iDraw++;
		}
		else if (!oSettings.bDestroying && !ajaxComplete) {
			// Show loading message for server-side processing
			if (oSettings.iDraw === 0) {
				body.empty().append(_emptyRow(oSettings));
			}

			_fnAjaxUpdate(oSettings);
			return;
		}

		if (aiDisplay.length !== 0) {
			var iStart = bServerSide ? 0 : iDisplayStart;
			var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;

			for (var j = iStart; j < iEnd; j++) {
				var iDataIndex = aiDisplay[j];
				var aoData = oSettings.aoData[iDataIndex];
				if (aoData.nTr === null) {
					_fnCreateTr(oSettings, iDataIndex);
				}

				var nRow = aoData.nTr;

				// Add various classes as needed
				for (var i = 0; i < columns.length; i++) {
					var col = columns[i];
					var td = aoData.anCells[i];

					_addClass(td, _ext.type.className[col.sType]); // auto class
					_addClass(td, col.sClass); // column class
					_addClass(td, oSettings.oClasses.tbody.cell); // all cells
				}

				// Row callback functions - might want to manipulate the row
				// iRowCount and j are not currently documented. Are they at all
				// useful?
				_fnCallbackFire(oSettings, 'aoRowCallback', null,
					[nRow, aoData._aData, iRowCount, j, iDataIndex]);

				anRows.push(nRow);
				iRowCount++;
			}
		}
		else {
			anRows[0] = _emptyRow(oSettings);
		}

		/* Header and footer callbacks */
		_fnCallbackFire(oSettings, 'aoHeaderCallback', 'header', [$(oSettings.nTHead).children('tr')[0],
		_fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);

		_fnCallbackFire(oSettings, 'aoFooterCallback', 'footer', [$(oSettings.nTFoot).children('tr')[0],
		_fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);

		// replaceChildren is faster, but only became widespread in 2020,
		// so a fall back in jQuery is provided for older browsers.
		if (body[0].replaceChildren) {
			body[0].replaceChildren.apply(body[0], anRows);
		}
		else {
			body.children().detach();
			body.append($(anRows));
		}

		// Empty table needs a specific class
		$(oSettings.nTableWrapper).toggleClass('dt-empty-footer', $('tr', oSettings.nTFoot).length === 0);

		/* Call all required callback functions for the end of a draw */
		_fnCallbackFire(oSettings, 'aoDrawCallback', 'draw', [oSettings], true);

		/* Draw is complete, sorting and filtering must be as well */
		oSettings.bSorted = false;
		oSettings.bFiltered = false;
		oSettings.bDrawing = false;
	}


	/**
	 * Redraw the table - taking account of the various features which are enabled
	 *  @param {object} oSettings dataTables settings object
	 *  @param {boolean} [holdPosition] Keep the current paging position. By default
	 *    the paging is reset to the first page
	 *  @memberof DataTable#oApi
	 */
	function _fnReDraw(settings, holdPosition, recompute) {
		var
			features = settings.oFeatures,
			sort = features.bSort,
			filter = features.bFilter;

		if (recompute === undefined || recompute === true) {
			if (sort) {
				_fnSort(settings);
			}

			if (filter) {
				_fnFilterComplete(settings, settings.oPreviousSearch);
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}
		}

		if (holdPosition !== true) {
			settings._iDisplayStart = 0;
		}

		// Let any modules know about the draw hold position state (used by
		// scrolling internally)
		settings._drawHold = holdPosition;

		_fnDraw(settings);

		settings._drawHold = false;
	}


	/*
	 * Table is empty - create a row with an empty message in it
	 */
	function _emptyRow(settings) {
		var oLang = settings.oLanguage;
		var zero = oLang.sZeroRecords;
		var dataSrc = _fnDataSource(settings);

		if (
			(settings.iDraw < 1 && dataSrc === 'ssp') ||
			(settings.iDraw <= 1 && dataSrc === 'ajax')
		) {
			zero = oLang.sLoadingRecords;
		}
		else if (oLang.sEmptyTable && settings.fnRecordsTotal() === 0) {
			zero = oLang.sEmptyTable;
		}

		return $('<tr/>')
			.append($('<td />', {
				'colSpan': _fnVisbleColumns(settings),
				'class': settings.oClasses.empty.row
			}).html(zero))[0];
	}


	/**
	 * Convert a `layout` object given by a user to the object structure needed
	 * for the renderer. This is done twice, once for above and once for below
	 * the table. Ordering must also be considered.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} layout Layout object to convert
	 * @param {string} side `top` or `bottom`
	 * @returns Converted array structure - one item for each row.
	 */
	function _layoutArray(settings, layout, side) {
		var groups = {};

		// Combine into like groups (e.g. `top`, `top2`, etc)
		$.each(layout, function (pos, val) {
			if (val === null) {
				return;
			}

			var splitPos = pos.replace(/([A-Z])/g, ' $1').split(' ');

			if (!groups[splitPos[0]]) {
				groups[splitPos[0]] = {};
			}

			var align = splitPos.length === 1 ?
				'full' :
				splitPos[1].toLowerCase();
			var group = groups[splitPos[0]];
			var groupRun = function (contents, innerVal) {
				// If it is an object, then there can be multiple features contained in it
				if ($.isPlainObject(innerVal)) {
					Object.keys(innerVal).map(function (key) {
						contents.push({
							feature: key,
							opts: innerVal[key]
						});
					});
				}
				else {
					contents.push(innerVal);
				}
			}

			// Transform to an object with a contents property
			if (!group[align] || !group[align].contents) {
				group[align] = { contents: [] };
			}

			// Allow for an array or just a single object
			if (Array.isArray(val)) {
				for (var i = 0; i < val.length; i++) {
					groupRun(group[align].contents, val[i]);
				}
			}
			else {
				groupRun(group[align].contents, val);
			}

			// And make contents an array
			if (!Array.isArray(group[align].contents)) {
				group[align].contents = [group[align].contents];
			}
		});

		var filtered = Object.keys(groups)
			.map(function (pos) {
				// Filter to only the side we need
				if (pos.indexOf(side) !== 0) {
					return null;
				}

				return {
					name: pos,
					val: groups[pos]
				};
			})
			.filter(function (item) {
				return item !== null;
			});

		// Order by item identifier
		filtered.sort(function (a, b) {
			var order1 = a.name.replace(/[^0-9]/g, '') * 1;
			var order2 = b.name.replace(/[^0-9]/g, '') * 1;

			return order2 - order1;
		});

		if (side === 'bottom') {
			filtered.reverse();
		}

		// Split into rows
		var rows = [];
		for (var i = 0, ien = filtered.length; i < ien; i++) {
			if (filtered[i].val.full) {
				rows.push({ full: filtered[i].val.full });
				_layoutResolve(settings, rows[rows.length - 1]);

				delete filtered[i].val.full;
			}

			if (Object.keys(filtered[i].val).length) {
				rows.push(filtered[i].val);
				_layoutResolve(settings, rows[rows.length - 1]);
			}
		}

		return rows;
	}


	/**
	 * Convert the contents of a row's layout object to nodes that can be inserted
	 * into the document by a renderer. Execute functions, look up plug-ins, etc.
	 *
	 * @param {*} settings DataTables settings object
	 * @param {*} row Layout object for this row
	 */
	function _layoutResolve(settings, row) {
		var getFeature = function (feature, opts) {
			if (!_ext.features[feature]) {
				_fnLog(settings, 0, 'Unknown feature: ' + feature);
			}

			return _ext.features[feature].apply(this, [settings, opts]);
		};

		var resolve = function (item) {
			var line = row[item].contents;

			for (var i = 0, ien = line.length; i < ien; i++) {
				if (!line[i]) {
					continue;
				}
				else if (typeof line[i] === 'string') {
					line[i] = getFeature(line[i], null);
				}
				else if ($.isPlainObject(line[i])) {
					// If it's an object, it just has feature and opts properties from
					// the transform in _layoutArray
					line[i] = getFeature(line[i].feature, line[i].opts);
				}
				else if (typeof line[i].node === 'function') {
					line[i] = line[i].node(settings);
				}
				else if (typeof line[i] === 'function') {
					var inst = line[i](settings);

					line[i] = typeof inst.node === 'function' ?
						inst.node() :
						inst;
				}
			}
		};

		$.each(row, function (key) {
			resolve(key);
		});
	}


	/**
	 * Add the options to the page HTML for the table
	 *  @param {object} settings DataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnAddOptionsHtml(settings) {
		var classes = settings.oClasses;
		var table = $(settings.nTable);

		// Wrapper div around everything DataTables controls
		var insert = $('<div/>')
			.attr({
				id: settings.sTableId + '_wrapper',
				'class': classes.container
			})
			.insertBefore(table);

		settings.nTableWrapper = insert[0];

		if (settings.sDom) {
			// Legacy
			_fnLayoutDom(settings, settings.sDom, insert);
		}
		else {
			var top = _layoutArray(settings, settings.layout, 'top');
			var bottom = _layoutArray(settings, settings.layout, 'bottom');
			var renderer = _fnRenderer(settings, 'layout');

			// Everything above - the renderer will actually insert the contents into the document
			top.forEach(function (item) {
				renderer(settings, insert, item);
			});

			// The table - always the center of attention
			renderer(settings, insert, {
				full: {
					table: true,
					contents: [_fnFeatureHtmlTable(settings)]
				}
			});

			// Everything below
			bottom.forEach(function (item) {
				renderer(settings, insert, item);
			});
		}

		// Processing floats on top, so it isn't an inserted feature
		_processingHtml(settings);
	}

	/**
	 * Draw the table with the legacy DOM property
	 * @param {*} settings DT settings object
	 * @param {*} dom DOM string
	 * @param {*} insert Insert point
	 */
	function _fnLayoutDom(settings, dom, insert) {
		var parts = dom.match(/(".*?")|('.*?')|./g);
		var featureNode, option, newNode, next, attr;

		for (var i = 0; i < parts.length; i++) {
			featureNode = null;
			option = parts[i];

			if (option == '<') {
				// New container div
				newNode = $('<div/>');

				// Check to see if we should append an id and/or a class name to the container
				next = parts[i + 1];

				if (next[0] == "'" || next[0] == '"') {
					attr = next.replace(/['"]/g, '');

					var id = '', className;

					/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
					 * breaks the string into parts and applies them as needed
					 */
					if (attr.indexOf('.') != -1) {
						var split = attr.split('.');

						id = split[0];
						className = split[1];
					}
					else if (attr[0] == "#") {
						id = attr;
					}
					else {
						className = attr;
					}

					newNode
						.attr('id', id.substring(1))
						.addClass(className);

					i++; // Move along the position array
				}

				insert.append(newNode);
				insert = newNode;
			}
			else if (option == '>') {
				// End container div
				insert = insert.parent();
			}
			else if (option == 't') {
				// Table
				featureNode = _fnFeatureHtmlTable(settings);
			}
			else {
				DataTable.ext.feature.forEach(function (feature) {
					if (option == feature.cFeature) {
						featureNode = feature.fnInit(settings);
					}
				});
			}

			// Add to the display
			if (featureNode) {
				insert.append(featureNode);
			}
		}
	}


	/**
	 * Use the DOM source to create up an array of header cells. The idea here is to
	 * create a layout grid (array) of rows x columns, which contains a reference
	 * to the cell that that point in the grid (regardless of col/rowspan), such that
	 * any column / row could be removed and the new grid constructed
	 *  @param {node} thead The header/footer element for the table
	 *  @returns {array} Calculated layout array
	 *  @memberof DataTable#oApi
	 */
	function _fnDetectHeader(settings, thead, write) {
		var columns = settings.aoColumns;
		var rows = $(thead).children('tr');
		var row, cell;
		var i, k, l, iLen, shifted, column, colspan, rowspan;
		var isHeader = thead && thead.nodeName.toLowerCase() === 'thead';
		var layout = [];
		var unique;
		var shift = function (a, i, j) {
			var k = a[i];
			while (k[j]) {
				j++;
			}
			return j;
		};

		// We know how many rows there are in the layout - so prep it
		for (i = 0, iLen = rows.length; i < iLen; i++) {
			layout.push([]);
		}

		for (i = 0, iLen = rows.length; i < iLen; i++) {
			row = rows[i];
			column = 0;

			// For every cell in the row..
			cell = row.firstChild;
			while (cell) {
				if (
					cell.nodeName.toUpperCase() == 'TD' ||
					cell.nodeName.toUpperCase() == 'TH'
				) {
					var cols = [];

					// Get the col and rowspan attributes from the DOM and sanitise them
					colspan = cell.getAttribute('colspan') * 1;
					rowspan = cell.getAttribute('rowspan') * 1;
					colspan = (!colspan || colspan === 0 || colspan === 1) ? 1 : colspan;
					rowspan = (!rowspan || rowspan === 0 || rowspan === 1) ? 1 : rowspan;

					// There might be colspan cells already in this row, so shift our target
					// accordingly
					shifted = shift(layout, i, column);

					// Cache calculation for unique columns
					unique = colspan === 1 ?
						true :
						false;

					// Perform header setup
					if (write) {
						if (unique) {
							// Allow column options to be set from HTML attributes
							_fnColumnOptions(settings, shifted, $(cell).data());

							// Get the width for the column. This can be defined from the
							// width attribute, style attribute or `columns.width` option
							var columnDef = columns[shifted];
							var width = cell.getAttribute('width') || null;
							var t = cell.style.width.match(/width:\s*(\d+[pxem%]+)/);
							if (t) {
								width = t[1];
							}

							columnDef.sWidthOrig = columnDef.sWidth || width;

							if (isHeader) {
								// Column title handling - can be user set, or read from the DOM
								// This happens before the render, so the original is still in place
								if (columnDef.sTitle !== null && !columnDef.autoTitle) {
									cell.innerHTML = columnDef.sTitle;
								}

								if (!columnDef.sTitle && unique) {
									columnDef.sTitle = _stripHtml(cell.innerHTML);
									columnDef.autoTitle = true;
								}
							}
							else {
								// Footer specific operations
								if (columnDef.footer) {
									cell.innerHTML = columnDef.footer;
								}
							}

							// Fall back to the aria-label attribute on the table header if no ariaTitle is
							// provided.
							if (!columnDef.ariaTitle) {
								columnDef.ariaTitle = $(cell).attr("aria-label") || columnDef.sTitle;
							}

							// Column specific class names
							if (columnDef.className) {
								$(cell).addClass(columnDef.className);
							}
						}

						// Wrap the column title so we can write to it in future
						if ($('span.dt-column-title', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-title')
								.append(cell.childNodes)
								.appendTo(cell);
						}

						if (isHeader && $('span.dt-column-order', cell).length === 0) {
							$('<span>')
								.addClass('dt-column-order')
								.appendTo(cell);
						}
					}

					// If there is col / rowspan, copy the information into the layout grid
					for (l = 0; l < colspan; l++) {
						for (k = 0; k < rowspan; k++) {
							layout[i + k][shifted + l] = {
								cell: cell,
								unique: unique
							};

							layout[i + k].row = row;
						}

						cols.push(shifted + l);
					}

					// Assign an attribute so spanning cells can still be identified
					// as belonging to a column
					cell.setAttribute('data-dt-column', _unique(cols).join(','));
				}

				cell = cell.nextSibling;
			}
		}

		return layout;
	}

	/**
	 * Set the start position for draw
	 *  @param {object} oSettings dataTables settings object
	 */
	function _fnStart(oSettings) {
		var bServerSide = _fnDataSource(oSettings) == 'ssp';
		var iInitDisplayStart = oSettings.iInitDisplayStart;

		// Check and see if we have an initial draw position from state saving
		if (iInitDisplayStart !== undefined && iInitDisplayStart !== -1) {
			oSettings._iDisplayStart = bServerSide ?
				iInitDisplayStart :
				iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
					0 :
					iInitDisplayStart;

			oSettings.iInitDisplayStart = -1;
		}
	}

	/**
	 * Create an Ajax call based on the table's settings, taking into account that
	 * parameters can have multiple forms, and backwards compatibility.
	 *
	 * @param {object} oSettings dataTables settings object
	 * @param {array} data Data to send to the server, required by
	 *     DataTables - may be augmented by developer callbacks
	 * @param {function} fn Callback function to run when data is obtained
	 */
	function _fnBuildAjax(oSettings, data, fn) {
		var ajaxData;
		var ajax = oSettings.ajax;
		var instance = oSettings.oInstance;
		var callback = function (json) {
			var status = oSettings.jqXHR
				? oSettings.jqXHR.status
				: null;

			if (json === null || (typeof status === 'number' && status == 204)) {
				json = {};
				_fnAjaxDataSrc(oSettings, json, []);
			}

			var error = json.error || json.sError;
			if (error) {
				_fnLog(oSettings, 0, error);
			}

			oSettings.json = json;

			_fnCallbackFire(oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR], true);
			fn(json);
		};

		if ($.isPlainObject(ajax) && ajax.data) {
			ajaxData = ajax.data;

			var newData = typeof ajaxData === 'function' ?
				ajaxData(data, oSettings) :  // fn can manipulate data or return
				ajaxData;                      // an object object or array to merge

			// If the function returned something, use that alone
			data = typeof ajaxData === 'function' && newData ?
				newData :
				$.extend(true, data, newData);

			// Remove the data property as we've resolved it already and don't want
			// jQuery to do it again (it is restored at the end of the function)
			delete ajax.data;
		}

		var baseAjax = {
			"url": typeof ajax === 'string' ?
				ajax :
				'',
			"data": data,
			"success": callback,
			"dataType": "json",
			"cache": false,
			"type": oSettings.sServerMethod,
			"error": function (xhr, error) {
				var ret = _fnCallbackFire(oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR], true);

				if (ret.indexOf(true) === -1) {
					if (error == "parsererror") {
						_fnLog(oSettings, 0, 'Invalid JSON response', 1);
					}
					else if (xhr.readyState === 4) {
						_fnLog(oSettings, 0, 'Ajax error', 7);
					}
				}

				_fnProcessingDisplay(oSettings, false);
			}
		};

		// If `ajax` option is an object, extend and override our default base
		if ($.isPlainObject(ajax)) {
			$.extend(baseAjax, ajax)
		}

		// Store the data submitted for the API
		oSettings.oAjaxData = data;

		// Allow plug-ins and external processes to modify the data
		_fnCallbackFire(oSettings, null, 'preXhr', [oSettings, data, baseAjax], true);

		if (typeof ajax === 'function') {
			// Is a function - let the caller define what needs to be done
			oSettings.jqXHR = ajax.call(instance, data, callback, oSettings);
		}
		else if (ajax.url === '') {
			// No url, so don't load any data. Just apply an empty data array
			// to the object for the callback.
			var empty = {};

			DataTable.util.set(ajax.dataSrc)(empty, []);
			callback(empty);
		}
		else {
			// Object to extend the base settings
			oSettings.jqXHR = $.ajax(baseAjax);

			// Restore for next time around
			if (ajaxData) {
				ajax.data = ajaxData;
			}
		}
	}


	/**
	 * Update the table using an Ajax call
	 *  @param {object} settings dataTables settings object
	 *  @returns {boolean} Block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdate(settings) {
		settings.iDraw++;
		_fnProcessingDisplay(settings, true);

		_fnBuildAjax(
			settings,
			_fnAjaxParameters(settings),
			function (json) {
				_fnAjaxUpdateDraw(settings, json);
			}
		);
	}


	/**
	 * Build up the parameters in an object needed for a server-side processing
	 * request.
	 *  @param {object} oSettings dataTables settings object
	 *  @returns {bool} block the table drawing or not
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxParameters(settings) {
		var
			columns = settings.aoColumns,
			features = settings.oFeatures,
			preSearch = settings.oPreviousSearch,
			preColSearch = settings.aoPreSearchCols,
			colData = function (idx, prop) {
				return typeof columns[idx][prop] === 'function' ?
					'function' :
					columns[idx][prop];
			};

		return {
			draw: settings.iDraw,
			columns: columns.map(function (column, i) {
				return {
					data: colData(i, 'mData'),
					name: column.sName,
					searchable: column.bSearchable,
					orderable: column.bSortable,
					search: {
						value: preColSearch[i].search,
						regex: preColSearch[i].regex,
						fixed: Object.keys(column.searchFixed).map(function (name) {
							return {
								name: name,
								term: column.searchFixed[name].toString()
							}
						})
					}
				};
			}),
			order: _fnSortFlatten(settings).map(function (val) {
				return {
					column: val.col,
					dir: val.dir,
					name: colData(val.col, 'sName')
				};
			}),
			start: settings._iDisplayStart,
			length: features.bPaginate ?
				settings._iDisplayLength :
				-1,
			search: {
				value: preSearch.search,
				regex: preSearch.regex,
				fixed: Object.keys(settings.searchFixed).map(function (name) {
					return {
						name: name,
						term: settings.searchFixed[name].toString()
					}
				})
			}
		};
	}


	/**
	 * Data the data from the server (nuking the old) and redraw the table
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} json json data return from the server.
	 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
	 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
	 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
	 *  @param {array} json.aaData The data to display on this page
	 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
	 *  @memberof DataTable#oApi
	 */
	function _fnAjaxUpdateDraw(settings, json) {
		var data = _fnAjaxDataSrc(settings, json);
		var draw = _fnAjaxDataSrcParam(settings, 'draw', json);
		var recordsTotal = _fnAjaxDataSrcParam(settings, 'recordsTotal', json);
		var recordsFiltered = _fnAjaxDataSrcParam(settings, 'recordsFiltered', json);

		if (draw !== undefined) {
			// Protect against out of sequence returns
			if (draw * 1 < settings.iDraw) {
				return;
			}
			settings.iDraw = draw * 1;
		}

		// No data in returned object, so rather than an array, we show an empty table
		if (!data) {
			data = [];
		}

		_fnClearTable(settings);
		settings._iRecordsTotal = parseInt(recordsTotal, 10);
		settings._iRecordsDisplay = parseInt(recordsFiltered, 10);

		for (var i = 0, ien = data.length; i < ien; i++) {
			_fnAddData(settings, data[i]);
		}
		settings.aiDisplay = settings.aiDisplayMaster.slice();

		_fnDraw(settings, true);
		_fnInitComplete(settings);
		_fnProcessingDisplay(settings, false);
	}


	/**
	 * Get the data from the JSON data source to use for drawing a table. Using
	 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
	 * source object, or from a processing function.
	 *  @param {object} settings dataTables settings object
	 *  @param  {object} json Data source object / array from the server
	 *  @return {array} Array of data to use
	 */
	function _fnAjaxDataSrc(settings, json, write) {
		var dataProp = 'data';

		if ($.isPlainObject(settings.ajax) && settings.ajax.dataSrc !== undefined) {
			// Could in inside a `dataSrc` object, or not!
			var dataSrc = settings.ajax.dataSrc;

			// string, function and object are valid types
			if (typeof dataSrc === 'string' || typeof dataSrc === 'function') {
				dataProp = dataSrc;
			}
			else if (dataSrc.data !== undefined) {
				dataProp = dataSrc.data;
			}
		}

		if (!write) {
			if (dataProp === 'data') {
				// If the default, then we still want to support the old style, and safely ignore
				// it if possible
				return json.aaData || json[dataProp];
			}

			return dataProp !== "" ?
				_fnGetObjectDataFn(dataProp)(json) :
				json;
		}

		// set
		_fnSetObjectDataFn(dataProp)(json, write);
	}

	/**
	 * Very similar to _fnAjaxDataSrc, but for the other SSP properties
	 * @param {*} settings DataTables settings object
	 * @param {*} param Target parameter
	 * @param {*} json JSON data
	 * @returns Resolved value
	 */
	function _fnAjaxDataSrcParam(settings, param, json) {
		var dataSrc = $.isPlainObject(settings.ajax)
			? settings.ajax.dataSrc
			: null;

		if (dataSrc && dataSrc[param]) {
			// Get from custom location
			return _fnGetObjectDataFn(dataSrc[param])(json);
		}

		// else - Default behaviour
		var old = '';

		// Legacy support
		if (param === 'draw') {
			old = 'sEcho';
		}
		else if (param === 'recordsTotal') {
			old = 'iTotalRecords';
		}
		else if (param === 'recordsFiltered') {
			old = 'iTotalDisplayRecords';
		}

		return json[old] !== undefined
			? json[old]
			: json[param];
	}


	/**
	 * Filter the table using both the global filter and column based filtering
	 *  @param {object} settings dataTables settings object
	 *  @param {object} input search information
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterComplete(settings, input) {
		var columnsSearch = settings.aoPreSearchCols;

		// Resolve any column types that are unknown due to addition or invalidation
		// @todo As per sort - can this be moved into an event handler?
		_fnColumnTypes(settings);

		// In server-side processing all filtering is done by the server, so no point hanging around here
		if (_fnDataSource(settings) != 'ssp') {
			// Check if any of the rows were invalidated
			_fnFilterData(settings);

			// Start from the full data set
			settings.aiDisplay = settings.aiDisplayMaster.slice();

			// Global filter first
			_fnFilter(settings.aiDisplay, settings, input.search, input);

			$.each(settings.searchFixed, function (name, term) {
				_fnFilter(settings.aiDisplay, settings, term, {});
			});

			// Then individual column filters
			for (var i = 0; i < columnsSearch.length; i++) {
				var col = columnsSearch[i];

				_fnFilter(
					settings.aiDisplay,
					settings,
					col.search,
					col,
					i
				);

				$.each(settings.aoColumns[i].searchFixed, function (name, term) {
					_fnFilter(settings.aiDisplay, settings, term, {}, i);
				});
			}

			// And finally global filtering
			_fnFilterCustom(settings);
		}

		// Tell the draw function we have been filtering
		settings.bFiltered = true;

		_fnCallbackFire(settings, null, 'search', [settings]);
	}


	/**
	 * Apply custom filtering functions
	 * 
	 * This is legacy now that we have named functions, but it is widely used
	 * from 1.x, so it is not yet deprecated.
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCustom(settings) {
		var filters = DataTable.ext.search;
		var displayRows = settings.aiDisplay;
		var row, rowIdx;

		for (var i = 0, ien = filters.length; i < ien; i++) {
			var rows = [];

			// Loop over each row and see if it should be included
			for (var j = 0, jen = displayRows.length; j < jen; j++) {
				rowIdx = displayRows[j];
				row = settings.aoData[rowIdx];

				if (filters[i](settings, row._aFilterData, rowIdx, row._aData, j)) {
					rows.push(rowIdx);
				}
			}

			// So the array reference doesn't break set the results into the
			// existing array
			displayRows.length = 0;
			displayRows.push.apply(displayRows, rows);
		}
	}


	/**
	 * Filter the data table based on user input and draw the table
	 */
	function _fnFilter(searchRows, settings, input, options, column) {
		if (input === '') {
			return;
		}

		var i = 0;

		// Search term can be a function, regex or string - if a string we apply our
		// smart filtering regex (assuming the options require that)
		var searchFunc = typeof input === 'function' ? input : null;
		var rpSearch = input instanceof RegExp
			? input
			: searchFunc
				? null
				: _fnFilterCreateSearch(input, options);

		// Then for each row, does the test pass. If not, lop the row from the array
		while (i < searchRows.length) {
			var row = settings.aoData[searchRows[i]];
			var data = column === undefined
				? row._sFilterRow
				: row._aFilterData[column];

			if ((searchFunc && !searchFunc(data, row._aData, searchRows[i], column)) || (rpSearch && !rpSearch.test(data))) {
				searchRows.splice(i, 1);
				i--;
			}

			i++;
		}
	}


	/**
	 * Build a regular expression object suitable for searching a table
	 *  @param {string} sSearch string to search for
	 *  @param {bool} bRegex treat as a regular expression or not
	 *  @param {bool} bSmart perform smart filtering or not
	 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
	 *  @returns {RegExp} constructed object
	 *  @memberof DataTable#oApi
	 */
	function _fnFilterCreateSearch(search, inOpts) {
		var not = [];
		var options = $.extend({}, {
			boundary: false,
			caseInsensitive: true,
			exact: false,
			regex: false,
			smart: true
		}, inOpts);

		if (typeof search !== 'string') {
			search = search.toString();
		}

		// Remove diacritics if normalize is set up to do so
		search = _normalize(search);

		if (options.exact) {
			return new RegExp(
				'^' + _fnEscapeRegex(search) + '$',
				options.caseInsensitive ? 'i' : ''
			);
		}

		search = options.regex ?
			search :
			_fnEscapeRegex(search);

		if (options.smart) {
			/* For smart filtering we want to allow the search to work regardless of
			 * word order. We also want double quoted text to be preserved, so word
			 * order is important - a la google. And a negative look around for
			 * finding rows which don't contain a given string.
			 * 
			 * So this is the sort of thing we want to generate:
			 * 
			 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
			 */
			var parts = search.match(/!?["\u201C][^"\u201D]+["\u201D]|[^ ]+/g) || [''];
			var a = parts.map(function (word) {
				var negative = false;
				var m;

				// Determine if it is a "does not include"
				if (word.charAt(0) === '!') {
					negative = true;
					word = word.substring(1);
				}

				// Strip the quotes from around matched phrases
				if (word.charAt(0) === '"') {
					m = word.match(/^"(.*)"$/);
					word = m ? m[1] : word;
				}
				else if (word.charAt(0) === '\u201C') {
					// Smart quote match (iPhone users)
					m = word.match(/^\u201C(.*)\u201D$/);
					word = m ? m[1] : word;
				}

				// For our "not" case, we need to modify the string that is
				// allowed to match at the end of the expression.
				if (negative) {
					if (word.length > 1) {
						not.push('(?!' + word + ')');
					}

					word = '';
				}

				return word.replace(/"/g, '');
			});

			var match = not.length
				? not.join('')
				: '';

			var boundary = options.boundary
				? '\\b'
				: '';

			search = '^(?=.*?' + boundary + a.join(')(?=.*?' + boundary) + ')(' + match + '.)*$';
		}

		return new RegExp(search, options.caseInsensitive ? 'i' : '');
	}


	/**
	 * Escape a string such that it can be used in a regular expression
	 *  @param {string} sVal string to escape
	 *  @returns {string} escaped string
	 *  @memberof DataTable#oApi
	 */
	var _fnEscapeRegex = DataTable.util.escapeRegex;

	var __filter_div = $('<div>')[0];
	var __filter_div_textContent = __filter_div.textContent !== undefined;

	// Update the filtering data for each row if needed (by invalidation or first run)
	function _fnFilterData(settings) {
		var columns = settings.aoColumns;
		var data = settings.aoData;
		var column;
		var j, jen, filterData, cellData, row;
		var wasInvalidated = false;

		for (var rowIdx = 0; rowIdx < data.length; rowIdx++) {
			if (!data[rowIdx]) {
				continue;
			}

			row = data[rowIdx];

			if (!row._aFilterData) {
				filterData = [];

				for (j = 0, jen = columns.length; j < jen; j++) {
					column = columns[j];

					if (column.bSearchable) {
						cellData = _fnGetCellData(settings, rowIdx, j, 'filter');

						// Search in DataTables is string based
						if (cellData === null) {
							cellData = '';
						}

						if (typeof cellData !== 'string' && cellData.toString) {
							cellData = cellData.toString();
						}
					}
					else {
						cellData = '';
					}

					// If it looks like there is an HTML entity in the string,
					// attempt to decode it so sorting works as expected. Note that
					// we could use a single line of jQuery to do this, but the DOM
					// method used here is much faster https://jsperf.com/html-decode
					if (cellData.indexOf && cellData.indexOf('&') !== -1) {
						__filter_div.innerHTML = cellData;
						cellData = __filter_div_textContent ?
							__filter_div.textContent :
							__filter_div.innerText;
					}

					if (cellData.replace) {
						cellData = cellData.replace(/[\r\n\u2028]/g, '');
					}

					filterData.push(cellData);
				}

				row._aFilterData = filterData;
				row._sFilterRow = filterData.join('  ');
				wasInvalidated = true;
			}
		}

		return wasInvalidated;
	}


	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitialise(settings) {
		var i, iAjaxStart = settings.iInitDisplayStart;

		/* Ensure that the table data is fully initialised */
		if (!settings.bInitialised) {
			setTimeout(function () { _fnInitialise(settings); }, 200);
			return;
		}

		/* Build and draw the header / footer for the table */
		_fnBuildHead(settings, 'header');
		_fnBuildHead(settings, 'footer');
		_fnDrawHead(settings, settings.aoHeader);
		_fnDrawHead(settings, settings.aoFooter);

		// Enable features
		_fnAddOptionsHtml(settings);
		_fnSortInit(settings);

		_colGroup(settings);

		/* Okay to show that something is going on now */
		_fnProcessingDisplay(settings, true);

		_fnCallbackFire(settings, null, 'preInit', [settings], true);

		// If there is default sorting required - let's do it. The sort function
		// will do the drawing for us. Otherwise we draw the table regardless of the
		// Ajax source - this allows the table to look initialised for Ajax sourcing
		// data (show 'loading' message possibly)
		_fnReDraw(settings);

		var dataSrc = _fnDataSource(settings);

		// Server-side processing init complete is done by _fnAjaxUpdateDraw
		if (dataSrc != 'ssp') {
			// if there is an ajax source load the data
			if (dataSrc == 'ajax') {
				_fnBuildAjax(settings, {}, function (json) {
					var aData = _fnAjaxDataSrc(settings, json);

					// Got the data - add it to the table
					for (i = 0; i < aData.length; i++) {
						_fnAddData(settings, aData[i]);
					}

					// Reset the init display for cookie saving. We've already done
					// a filter, and therefore cleared it before. So we need to make
					// it appear 'fresh'
					settings.iInitDisplayStart = iAjaxStart;

					_fnReDraw(settings);
					_fnProcessingDisplay(settings, false);
					_fnInitComplete(settings);
				}, settings);
			}
			else {
				_fnInitComplete(settings);
				_fnProcessingDisplay(settings, false);
			}
		}
	}


	/**
	 * Draw the table for the first time, adding all required features
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnInitComplete(settings) {
		if (settings._bInitComplete) {
			return;
		}

		var args = [settings, settings.json];

		settings._bInitComplete = true;

		// Table is fully set up and we have data, so calculate the
		// column widths
		_fnAdjustColumnSizing(settings);

		_fnCallbackFire(settings, null, 'plugin-init', args, true);
		_fnCallbackFire(settings, 'aoInitComplete', 'init', args, true);
	}

	function _fnLengthChange(settings, val) {
		var len = parseInt(val, 10);
		settings._iDisplayLength = len;

		_fnLengthOverflow(settings);

		// Fire length change event
		_fnCallbackFire(settings, null, 'length', [settings, len]);
	}

	/**
	 * Alter the display settings to change the page
	 *  @param {object} settings DataTables settings object
	 *  @param {string|int} action Paging action to take: "first", "previous",
	 *    "next" or "last" or page number to jump to (integer)
	 *  @param [bool] redraw Automatically draw the update or not
	 *  @returns {bool} true page has changed, false - no change
	 *  @memberof DataTable#oApi
	 */
	function _fnPageChange(settings, action, redraw) {
		var
			start = settings._iDisplayStart,
			len = settings._iDisplayLength,
			records = settings.fnRecordsDisplay();

		if (records === 0 || len === -1) {
			start = 0;
		}
		else if (typeof action === "number") {
			start = action * len;

			if (start > records) {
				start = 0;
			}
		}
		else if (action == "first") {
			start = 0;
		}
		else if (action == "previous") {
			start = len >= 0 ?
				start - len :
				0;

			if (start < 0) {
				start = 0;
			}
		}
		else if (action == "next") {
			if (start + len < records) {
				start += len;
			}
		}
		else if (action == "last") {
			start = Math.floor((records - 1) / len) * len;
		}
		else if (action === 'ellipsis') {
			return;
		}
		else {
			_fnLog(settings, 0, "Unknown paging action: " + action, 5);
		}

		var changed = settings._iDisplayStart !== start;
		settings._iDisplayStart = start;

		_fnCallbackFire(settings, null, changed ? 'page' : 'page-nc', [settings]);

		if (changed && redraw) {
			_fnDraw(settings);
		}

		return changed;
	}


	/**
	 * Generate the node required for the processing node
	 *  @param {object} settings DataTables settings object
	 */
	function _processingHtml(settings) {
		var table = settings.nTable;

		if (settings.oFeatures.bProcessing) {
			var n = $('<div/>', {
				'id': settings.sTableId + '_processing',
				'class': settings.oClasses.processing.container,
				'role': 'status'
			})
				.html(settings.oLanguage.sProcessing)
				.append('<div><div></div><div></div><div></div><div></div></div>')
				.insertBefore(table);

			$(table).on('processing.dt.DT', function (e, s, show) {
				n.css('display', show ? 'block' : 'none');
			});
		}
	}


	/**
	 * Display or hide the processing indicator
	 *  @param {object} settings DataTables settings object
	 *  @param {bool} show Show the processing indicator (true) or not (false)
	 */
	function _fnProcessingDisplay(settings, show) {
		_fnCallbackFire(settings, null, 'processing', [settings, show]);
	}
	/**
	 * Add any control elements for the table - specifically scrolling
	 *  @param {object} settings dataTables settings object
	 *  @returns {node} Node to add to the DOM
	 *  @memberof DataTable#oApi
	 */
	function _fnFeatureHtmlTable(settings) {
		var table = $(settings.nTable);

		// Scrolling from here on in
		var scroll = settings.oScroll;

		if (scroll.sX === '' && scroll.sY === '') {
			return settings.nTable;
		}

		var scrollX = scroll.sX;
		var scrollY = scroll.sY;
		var classes = settings.oClasses.scrolling;
		var caption = settings.captionNode;
		var captionSide = caption ? caption._captionSide : null;
		var headerClone = $(table[0].cloneNode(false));
		var footerClone = $(table[0].cloneNode(false));
		var footer = table.children('tfoot');
		var _div = '<div/>';
		var size = function (s) {
			return !s ? null : _fnStringToCss(s);
		};

		if (!footer.length) {
			footer = null;
		}

		/*
		 * The HTML structure that we want to generate in this function is:
		 *  div - scroller
		 *    div - scroll head
		 *      div - scroll head inner
		 *        table - scroll head table
		 *          thead - thead
		 *    div - scroll body
		 *      table - table (master table)
		 *        thead - thead clone for sizing
		 *        tbody - tbody
		 *    div - scroll foot
		 *      div - scroll foot inner
		 *        table - scroll foot table
		 *          tfoot - tfoot
		 */
		var scroller = $(_div, { 'class': classes.container })
			.append(
				$(_div, { 'class': classes.header.self })
					.css({
						overflow: 'hidden',
						position: 'relative',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					})
					.append(
						$(_div, { 'class': classes.header.inner })
							.css({
								'box-sizing': 'content-box',
								width: scroll.sXInner || '100%'
							})
							.append(
								headerClone
									.removeAttr('id')
									.css('margin-left', 0)
									.append(captionSide === 'top' ? caption : null)
									.append(
										table.children('thead')
									)
							)
					)
			)
			.append(
				$(_div, { 'class': classes.body })
					.css({
						position: 'relative',
						overflow: 'hidden',
						width: size(scrollX)
					})
					.append(table)
			);

		if (footer) {
			scroller.append(
				$(_div, { 'class': classes.footer.self })
					.css({
						overflow: 'hidden',
						border: 0,
						width: scrollX ? size(scrollX) : '100%'
					})
					.append(
						$(_div, { 'class': classes.footer.inner })
							.append(
								footerClone
									.removeAttr('id')
									.css('margin-left', 0)
									.append(captionSide === 'bottom' ? caption : null)
									.append(
										table.children('tfoot')
									)
							)
					)
			);
		}

		var children = scroller.children();
		var scrollHead = children[0];
		var scrollBody = children[1];
		var scrollFoot = footer ? children[2] : null;

		// When the body is scrolled, then we also want to scroll the headers
		$(scrollBody).on('scroll.DT', function () {
			var scrollLeft = this.scrollLeft;

			scrollHead.scrollLeft = scrollLeft;

			if (footer) {
				scrollFoot.scrollLeft = scrollLeft;
			}
		});

		// When focus is put on the header cells, we might need to scroll the body
		$('th, td', scrollHead).on('focus', function () {
			var scrollLeft = scrollHead.scrollLeft;

			scrollBody.scrollLeft = scrollLeft;

			if (footer) {
				scrollBody.scrollLeft = scrollLeft;
			}
		});

		$(scrollBody).css('max-height', scrollY);
		if (!scroll.bCollapse) {
			$(scrollBody).css('height', scrollY);
		}

		settings.nScrollHead = scrollHead;
		settings.nScrollBody = scrollBody;
		settings.nScrollFoot = scrollFoot;

		// On redraw - align columns
		settings.aoDrawCallback.push(_fnScrollDraw);

		return scroller[0];
	}



	/**
	 * Update the header, footer and body tables for resizing - i.e. column
	 * alignment.
	 *
	 * Welcome to the most horrible function DataTables. The process that this
	 * function follows is basically:
	 *   1. Re-create the table inside the scrolling div
	 *   2. Correct colgroup > col values if needed
	 *   3. Copy colgroup > col over to header and footer
	 *   4. Clean up
	 *
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnScrollDraw(settings) {
		// Given that this is such a monster function, a lot of variables are use
		// to try and keep the minimised size as small as possible
		var
			scroll = settings.oScroll,
			barWidth = scroll.iBarWidth,
			divHeader = $(settings.nScrollHead),
			divHeaderInner = divHeader.children('div'),
			divHeaderTable = divHeaderInner.children('table'),
			divBodyEl = settings.nScrollBody,
			divBody = $(divBodyEl),
			divFooter = $(settings.nScrollFoot),
			divFooterInner = divFooter.children('div'),
			divFooterTable = divFooterInner.children('table'),
			header = $(settings.nTHead),
			table = $(settings.nTable),
			footer = settings.nTFoot && $('th, td', settings.nTFoot).length ? $(settings.nTFoot) : null,
			browser = settings.oBrowser,
			headerCopy, footerCopy;

		// If the scrollbar visibility has changed from the last draw, we need to
		// adjust the column sizes as the table width will have changed to account
		// for the scrollbar
		var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;

		if (settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined) {
			settings.scrollBarVis = scrollBarVis;
			_fnAdjustColumnSizing(settings);
			return; // adjust column sizing will call this function again
		}
		else {
			settings.scrollBarVis = scrollBarVis;
		}

		// 1. Re-create the table inside the scrolling div
		// Remove the old minimised thead and tfoot elements in the inner table
		table.children('thead, tfoot').remove();

		// Clone the current header and footer elements and then place it into the inner table
		headerCopy = header.clone().prependTo(table);
		headerCopy.find('th, td').removeAttr('tabindex');
		headerCopy.find('[id]').removeAttr('id');

		if (footer) {
			footerCopy = footer.clone().prependTo(table);
			footerCopy.find('[id]').removeAttr('id');
		}

		// 2. Correct colgroup > col values if needed
		// It is possible that the cell sizes are smaller than the content, so we need to
		// correct colgroup>col for such cases. This can happen if the auto width detection
		// uses a cell which has a longer string, but isn't the widest! For example 
		// "Chief Executive Officer (CEO)" is the longest string in the demo, but
		// "Systems Administrator" is actually the widest string since it doesn't collapse.
		// Note the use of translating into a column index to get the `col` element. This
		// is because of Responsive which might remove `col` elements, knocking the alignment
		// of the indexes out.
		if (settings.aiDisplay.length) {
			// Get the column sizes from the first row in the table
			var colSizes = table.find('tbody tr').eq(0).find('th, td').map(function (vis) {
				return {
					idx: _fnVisibleToColumnIndex(settings, vis),
					width: $(this).outerWidth()
				}
			});

			// Check against what the colgroup > col is set to and correct if needed
			for (var i = 0; i < colSizes.length; i++) {
				var colEl = settings.aoColumns[colSizes[i].idx].colEl[0];
				var colWidth = colEl.style.width.replace('px', '');

				if (colWidth !== colSizes[i].width) {
					colEl.style.width = colSizes[i].width + 'px';
				}
			}
		}

		// 3. Copy the colgroup over to the header and footer
		divHeaderTable
			.find('colgroup')
			.remove();

		divHeaderTable.append(settings.colgroup.clone());

		if (footer) {
			divFooterTable
				.find('colgroup')
				.remove();

			divFooterTable.append(settings.colgroup.clone());
		}

		// "Hide" the header and footer that we used for the sizing. We need to keep
		// the content of the cell so that the width applied to the header and body
		// both match, but we want to hide it completely.
		$('th, td', headerCopy).each(function () {
			$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
		});

		if (footer) {
			$('th, td', footerCopy).each(function () {
				$(this.childNodes).wrapAll('<div class="dt-scroll-sizing">');
			});
		}

		// 4. Clean up
		// Figure out if there are scrollbar present - if so then we need a the header and footer to
		// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
		var isScrolling = Math.floor(table.height()) > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
		var paddingSide = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right');

		// Set the width's of the header and footer tables
		var outerWidth = table.outerWidth();

		divHeaderTable.css('width', _fnStringToCss(outerWidth));
		divHeaderInner
			.css('width', _fnStringToCss(outerWidth))
			.css(paddingSide, isScrolling ? barWidth + "px" : "0px");

		if (footer) {
			divFooterTable.css('width', _fnStringToCss(outerWidth));
			divFooterInner
				.css('width', _fnStringToCss(outerWidth))
				.css(paddingSide, isScrolling ? barWidth + "px" : "0px");
		}

		// Correct DOM ordering for colgroup - comes before the thead
		table.children('colgroup').prependTo(table);

		// Adjust the position of the header in case we loose the y-scrollbar
		divBody.trigger('scroll');

		// If sorting or filtering has occurred, jump the scrolling back to the top
		// only if we aren't holding the position
		if ((settings.bSorted || settings.bFiltered) && !settings._drawHold) {
			divBodyEl.scrollTop = 0;
		}
	}

	/**
	 * Calculate the width of columns for the table
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnCalculateColumnWidths(settings) {
		// Not interested in doing column width calculation if auto-width is disabled
		if (!settings.oFeatures.bAutoWidth) {
			return;
		}

		var
			table = settings.nTable,
			columns = settings.aoColumns,
			scroll = settings.oScroll,
			scrollY = scroll.sY,
			scrollX = scroll.sX,
			scrollXInner = scroll.sXInner,
			visibleColumns = _fnGetColumns(settings, 'bVisible'),
			tableWidthAttr = table.getAttribute('width'), // from DOM element
			tableContainer = table.parentNode,
			i, column, columnIdx;

		var styleWidth = table.style.width;
		if (styleWidth && styleWidth.indexOf('%') !== -1) {
			tableWidthAttr = styleWidth;
		}

		// Let plug-ins know that we are doing a recalc, in case they have changed any of the
		// visible columns their own way (e.g. Responsive uses display:none).
		_fnCallbackFire(
			settings,
			null,
			'column-calc',
			{ visible: visibleColumns },
			false
		);

		// Construct a single row, worst case, table with the widest
		// node in the data, assign any user defined widths, then insert it into
		// the DOM and allow the browser to do all the hard work of calculating
		// table widths
		var tmpTable = $(table.cloneNode())
			.css('visibility', 'hidden')
			.removeAttr('id');

		// Clean up the table body
		tmpTable.append('<tbody>')
		var tr = $('<tr/>').appendTo(tmpTable.find('tbody'));

		// Clone the table header and footer - we can't use the header / footer
		// from the cloned table, since if scrolling is active, the table's
		// real header and footer are contained in different table tags
		tmpTable
			.append($(settings.nTHead).clone())
			.append($(settings.nTFoot).clone());

		// Remove any assigned widths from the footer (from scrolling)
		tmpTable.find('tfoot th, tfoot td').css('width', '');

		// Apply custom sizing to the cloned header
		tmpTable.find('thead th, thead td').each(function () {
			// Get the `width` from the header layout
			var width = _fnColumnsSumWidth(settings, this, true, false);

			if (width) {
				this.style.width = width;

				// For scrollX we need to force the column width otherwise the
				// browser will collapse it. If this width is smaller than the
				// width the column requires, then it will have no effect
				if (scrollX) {
					$(this).append($('<div/>').css({
						width: width,
						margin: 0,
						padding: 0,
						border: 0,
						height: 1
					}));
				}
			}
			else {
				this.style.width = '';
			}
		});

		// Find the widest piece of data for each column and put it into the table
		for (i = 0; i < visibleColumns.length; i++) {
			columnIdx = visibleColumns[i];
			column = columns[columnIdx];

			var longest = _fnGetMaxLenString(settings, columnIdx);
			var autoClass = _ext.type.className[column.sType];
			var text = longest + column.sContentPadding;
			var insert = longest.indexOf('<') === -1
				? document.createTextNode(text)
				: text

			$('<td/>')
				.addClass(autoClass)
				.addClass(column.sClass)
				.append(insert)
				.appendTo(tr);
		}

		// Tidy the temporary table - remove name attributes so there aren't
		// duplicated in the dom (radio elements for example)
		$('[name]', tmpTable).removeAttr('name');

		// Table has been built, attach to the document so we can work with it.
		// A holding element is used, positioned at the top of the container
		// with minimal height, so it has no effect on if the container scrolls
		// or not. Otherwise it might trigger scrolling when it actually isn't
		// needed
		var holder = $('<div/>').css(scrollX || scrollY ?
			{
				position: 'absolute',
				top: 0,
				left: 0,
				height: 1,
				right: 0,
				overflow: 'hidden'
			} :
			{}
		)
			.append(tmpTable)
			.appendTo(tableContainer);

		// When scrolling (X or Y) we want to set the width of the table as 
		// appropriate. However, when not scrolling leave the table width as it
		// is. This results in slightly different, but I think correct behaviour
		if (scrollX && scrollXInner) {
			tmpTable.width(scrollXInner);
		}
		else if (scrollX) {
			tmpTable.css('width', 'auto');
			tmpTable.removeAttr('width');

			// If there is no width attribute or style, then allow the table to
			// collapse
			if (tmpTable.width() < tableContainer.clientWidth && tableWidthAttr) {
				tmpTable.width(tableContainer.clientWidth);
			}
		}
		else if (scrollY) {
			tmpTable.width(tableContainer.clientWidth);
		}
		else if (tableWidthAttr) {
			tmpTable.width(tableWidthAttr);
		}

		// Get the width of each column in the constructed table
		var total = 0;
		var bodyCells = tmpTable.find('tbody tr').eq(0).children();

		for (i = 0; i < visibleColumns.length; i++) {
			// Use getBounding for sub-pixel accuracy, which we then want to round up!
			var bounding = bodyCells[i].getBoundingClientRect().width;

			// Total is tracked to remove any sub-pixel errors as the outerWidth
			// of the table might not equal the total given here
			total += bounding;

			// Width for each column to use
			columns[visibleColumns[i]].sWidth = _fnStringToCss(bounding);
		}

		table.style.width = _fnStringToCss(total);

		// Finished with the table - ditch it
		holder.remove();

		// If there is a width attr, we want to attach an event listener which
		// allows the table sizing to automatically adjust when the window is
		// resized. Use the width attr rather than CSS, since we can't know if the
		// CSS is a relative value or absolute - DOM read is always px.
		if (tableWidthAttr) {
			table.style.width = _fnStringToCss(tableWidthAttr);
		}

		if ((tableWidthAttr || scrollX) && !settings._reszEvt) {
			var bindResize = function () {
				$(window).on('resize.DT-' + settings.sInstance, DataTable.util.throttle(function () {
					if (!settings.bDestroying) {
						_fnAdjustColumnSizing(settings);
					}
				}));
			};

			bindResize();

			settings._reszEvt = true;
		}
	}


	/**
	 * Get the maximum strlen for each data column
	 *  @param {object} settings dataTables settings object
	 *  @param {int} colIdx column of interest
	 *  @returns {string} string of the max length
	 *  @memberof DataTable#oApi
	 */
	function _fnGetMaxLenString(settings, colIdx) {
		var column = settings.aoColumns[colIdx];

		if (!column.maxLenString) {
			var s, max = '', maxLen = -1;

			for (var i = 0, ien = settings.aiDisplayMaster.length; i < ien; i++) {
				var rowIdx = settings.aiDisplayMaster[i];
				var data = _fnGetRowDisplay(settings, rowIdx)[colIdx];

				var cellString = data && typeof data === 'object' && data.nodeType
					? data.innerHTML
					: data + '';

				// Remove id / name attributes from elements so they
				// don't interfere with existing elements
				cellString = cellString
					.replace(/id=".*?"/g, '')
					.replace(/name=".*?"/g, '');

				s = _stripHtml(cellString)
					.replace(/&nbsp;/g, ' ');

				if (s.length > maxLen) {
					// We want the HTML in the string, but the length that
					// is important is the stripped string
					max = cellString;
					maxLen = s.length;
				}
			}

			column.maxLenString = max;
		}

		return column.maxLenString;
	}


	/**
	 * Append a CSS unit (only if required) to a string
	 *  @param {string} value to css-ify
	 *  @returns {string} value with css unit
	 *  @memberof DataTable#oApi
	 */
	function _fnStringToCss(s) {
		if (s === null) {
			return '0px';
		}

		if (typeof s == 'number') {
			return s < 0 ?
				'0px' :
				s + 'px';
		}

		// Check it has a unit character already
		return s.match(/\d$/) ?
			s + 'px' :
			s;
	}

	/**
	 * Re-insert the `col` elements for current visibility
	 *
	 * @param {*} settings DT settings
	 */
	function _colGroup(settings) {
		var cols = settings.aoColumns;

		settings.colgroup.empty();

		for (i = 0; i < cols.length; i++) {
			if (cols[i].bVisible) {
				settings.colgroup.append(cols[i].colEl);
			}
		}
	}


	function _fnSortInit(settings) {
		var target = settings.nTHead;
		var headerRows = target.querySelectorAll('tr');
		var legacyTop = settings.bSortCellsTop;
		var notSelector = ':not([data-dt-order="disable"]):not([data-dt-order="icon-only"])';

		// Legacy support for `orderCellsTop`
		if (legacyTop === true) {
			target = headerRows[0];
		}
		else if (legacyTop === false) {
			target = headerRows[headerRows.length - 1];
		}

		_fnSortAttachListener(
			settings,
			target,
			target === settings.nTHead
				? 'tr' + notSelector + ' th' + notSelector + ', tr' + notSelector + ' td' + notSelector
				: 'th' + notSelector + ', td' + notSelector
		);

		// Need to resolve the user input array into our internal structure
		var order = [];
		_fnSortResolve(settings, order, settings.aaSorting);

		settings.aaSorting = order;
	}


	function _fnSortAttachListener(settings, node, selector, column, callback) {
		_fnBindAction(node, selector, function (e) {
			var run = false;
			var columns = column === undefined
				? _fnColumnsFromHeader(e.target)
				: [column];

			if (columns.length) {
				for (var i = 0, ien = columns.length; i < ien; i++) {
					var ret = _fnSortAdd(settings, columns[i], i, e.shiftKey);

					if (ret !== false) {
						run = true;
					}

					// If the first entry is no sort, then subsequent
					// sort columns are ignored
					if (settings.aaSorting.length === 1 && settings.aaSorting[0][1] === '') {
						break;
					}
				}

				if (run) {
					_fnProcessingDisplay(settings, true);

					// Allow the processing display to show
					setTimeout(function () {
						_fnSort(settings);
						_fnSortDisplay(settings, settings.aiDisplay);

						// Sort processing done - redraw has its own processing display
						_fnProcessingDisplay(settings, false);

						_fnReDraw(settings, false, false);

						if (callback) {
							callback();
						}
					}, 0);
				}
			}
		});
	}

	/**
	 * Sort the display array to match the master's order
	 * @param {*} settings
	 */
	function _fnSortDisplay(settings, display) {
		var master = settings.aiDisplayMaster;
		var masterMap = {};
		var map = {};
		var i;

		// Rather than needing an `indexOf` on master array, we can create a map
		for (i = 0; i < master.length; i++) {
			masterMap[master[i]] = i;
		}

		// And then cache what would be the indexOf fom the display
		for (i = 0; i < display.length; i++) {
			map[display[i]] = masterMap[display[i]];
		}

		display.sort(function (a, b) {
			// Short version of this function is simply `master.indexOf(a) - master.indexOf(b);`
			return map[a] - map[b];
		});
	}


	function _fnSortResolve(settings, nestedSort, sort) {
		var push = function (a) {
			if ($.isPlainObject(a)) {
				if (a.idx !== undefined) {
					// Index based ordering
					nestedSort.push([a.idx, a.dir]);
				}
				else if (a.name) {
					// Name based ordering
					var cols = _pluck(settings.aoColumns, 'sName');
					var idx = cols.indexOf(a.name);

					if (idx !== -1) {
						nestedSort.push([idx, a.dir]);
					}
				}
			}
			else {
				// Plain column index and direction pair
				nestedSort.push(a);
			}
		};

		if ($.isPlainObject(sort)) {
			// Object
			push(sort);
		}
		else if (sort.length && typeof sort[0] === 'number') {
			// 1D array
			push(sort);
		}
		else if (sort.length) {
			// 2D array
			for (var z = 0; z < sort.length; z++) {
				push(sort[z]); // Object or array
			}
		}
	}


	function _fnSortFlatten(settings) {
		var
			i, k, kLen,
			aSort = [],
			extSort = DataTable.ext.type.order,
			aoColumns = settings.aoColumns,
			aDataSort, iCol, sType, srcCol,
			fixed = settings.aaSortingFixed,
			fixedObj = $.isPlainObject(fixed),
			nestedSort = [];

		if (!settings.oFeatures.bSort) {
			return aSort;
		}

		// Build the sort array, with pre-fix and post-fix options if they have been
		// specified
		if (Array.isArray(fixed)) {
			_fnSortResolve(settings, nestedSort, fixed);
		}

		if (fixedObj && fixed.pre) {
			_fnSortResolve(settings, nestedSort, fixed.pre);
		}

		_fnSortResolve(settings, nestedSort, settings.aaSorting);

		if (fixedObj && fixed.post) {
			_fnSortResolve(settings, nestedSort, fixed.post);
		}

		for (i = 0; i < nestedSort.length; i++) {
			srcCol = nestedSort[i][0];

			if (aoColumns[srcCol]) {
				aDataSort = aoColumns[srcCol].aDataSort;

				for (k = 0, kLen = aDataSort.length; k < kLen; k++) {
					iCol = aDataSort[k];
					sType = aoColumns[iCol].sType || 'string';

					if (nestedSort[i]._idx === undefined) {
						nestedSort[i]._idx = aoColumns[iCol].asSorting.indexOf(nestedSort[i][1]);
					}

					if (nestedSort[i][1]) {
						aSort.push({
							src: srcCol,
							col: iCol,
							dir: nestedSort[i][1],
							index: nestedSort[i]._idx,
							type: sType,
							formatter: extSort[sType + "-pre"],
							sorter: extSort[sType + "-" + nestedSort[i][1]]
						});
					}
				}
			}
		}

		return aSort;
	}

	/**
	 * Change the order of the table
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSort(oSettings, col, dir) {
		var
			i, ien, iLen,
			aiOrig = [],
			extSort = DataTable.ext.type.order,
			aoData = oSettings.aoData,
			sortCol,
			displayMaster = oSettings.aiDisplayMaster,
			aSort;

		// Resolve any column types that are unknown due to addition or invalidation
		// @todo Can this be moved into a 'data-ready' handler which is called when
		//   data is going to be used in the table?
		_fnColumnTypes(oSettings);

		// Allow a specific column to be sorted, which will _not_ alter the display
		// master
		if (col !== undefined) {
			var srcCol = oSettings.aoColumns[col];
			aSort = [{
				src: col,
				col: col,
				dir: dir,
				index: 0,
				type: srcCol.sType,
				formatter: extSort[srcCol.sType + "-pre"],
				sorter: extSort[srcCol.sType + "-" + dir]
			}];
			displayMaster = displayMaster.slice();
		}
		else {
			aSort = _fnSortFlatten(oSettings);
		}

		for (i = 0, ien = aSort.length; i < ien; i++) {
			sortCol = aSort[i];

			// Load the data needed for the sort, for each cell
			_fnSortData(oSettings, sortCol.col);
		}

		/* No sorting required if server-side or no sorting array */
		if (_fnDataSource(oSettings) != 'ssp' && aSort.length !== 0) {
			// Reset the initial positions on each pass so we get a stable sort
			for (i = 0, iLen = displayMaster.length; i < iLen; i++) {
				aiOrig[i] = i;
			}

			// If the first sort is desc, then reverse the array to preserve original
			// order, just in reverse
			if (aSort.length && aSort[0].dir === 'desc') {
				aiOrig.reverse();
			}

			/* Do the sort - here we want multi-column sorting based on a given data source (column)
			 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
			 * follow on it's own, but this is what we want (example two column sorting):
			 *  fnLocalSorting = function(a,b){
			 *    var test;
			 *    test = oSort['string-asc']('data11', 'data12');
			 *      if (test !== 0)
			 *        return test;
			 *    test = oSort['numeric-desc']('data21', 'data22');
			 *    if (test !== 0)
			 *      return test;
			 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
			 *  }
			 * Basically we have a test for each sorting column, if the data in that column is equal,
			 * test the next column. If all columns match, then we use a numeric sort on the row
			 * positions in the original data array to provide a stable sort.
			 */
			displayMaster.sort(function (a, b) {
				var
					x, y, k, test, sort,
					len = aSort.length,
					dataA = aoData[a]._aSortData,
					dataB = aoData[b]._aSortData;

				for (k = 0; k < len; k++) {
					sort = aSort[k];

					// Data, which may have already been through a `-pre` function
					x = dataA[sort.col];
					y = dataB[sort.col];

					if (sort.sorter) {
						// If there is a custom sorter (`-asc` or `-desc`) for this
						// data type, use it
						test = sort.sorter(x, y);

						if (test !== 0) {
							return test;
						}
					}
					else {
						// Otherwise, use generic sorting
						test = x < y ? -1 : x > y ? 1 : 0;

						if (test !== 0) {
							return sort.dir === 'asc' ? test : -test;
						}
					}
				}

				x = aiOrig[a];
				y = aiOrig[b];

				return x < y ? -1 : x > y ? 1 : 0;
			});
		}
		else if (aSort.length === 0) {
			// Apply index order
			displayMaster.sort(function (x, y) {
				return x < y ? -1 : x > y ? 1 : 0;
			});
		}

		if (col === undefined) {
			// Tell the draw function that we have sorted the data
			oSettings.bSorted = true;

			_fnCallbackFire(oSettings, null, 'order', [oSettings, aSort]);
		}

		return displayMaster;
	}


	/**
	 * Function to run on user sort request
	 *  @param {object} settings dataTables settings object
	 *  @param {node} attachTo node to attach the handler to
	 *  @param {int} colIdx column sorting index
	 *  @param {int} addIndex Counter
	 *  @param {boolean} [shift=false] Shift click add
	 *  @param {function} [callback] callback function
	 *  @memberof DataTable#oApi
	 */
	function _fnSortAdd(settings, colIdx, addIndex, shift) {
		var col = settings.aoColumns[colIdx];
		var sorting = settings.aaSorting;
		var asSorting = col.asSorting;
		var nextSortIdx;
		var next = function (a, overflow) {
			var idx = a._idx;
			if (idx === undefined) {
				idx = asSorting.indexOf(a[1]);
			}

			return idx + 1 < asSorting.length ?
				idx + 1 :
				overflow ?
					null :
					0;
		};

		if (!col.bSortable) {
			return false;
		}

		// Convert to 2D array if needed
		if (typeof sorting[0] === 'number') {
			sorting = settings.aaSorting = [sorting];
		}

		// If appending the sort then we are multi-column sorting
		if ((shift || addIndex) && settings.oFeatures.bSortMulti) {
			// Are we already doing some kind of sort on this column?
			var sortIdx = _pluck(sorting, '0').indexOf(colIdx);

			if (sortIdx !== -1) {
				// Yes, modify the sort
				nextSortIdx = next(sorting[sortIdx], true);

				if (nextSortIdx === null && sorting.length === 1) {
					nextSortIdx = 0; // can't remove sorting completely
				}

				if (nextSortIdx === null) {
					sorting.splice(sortIdx, 1);
				}
				else {
					sorting[sortIdx][1] = asSorting[nextSortIdx];
					sorting[sortIdx]._idx = nextSortIdx;
				}
			}
			else if (shift) {
				// No sort on this column yet, being added by shift click
				// add it as itself
				sorting.push([colIdx, asSorting[0], 0]);
				sorting[sorting.length - 1]._idx = 0;
			}
			else {
				// No sort on this column yet, being added from a colspan
				// so add with same direction as first column
				sorting.push([colIdx, sorting[0][1], 0]);
				sorting[sorting.length - 1]._idx = 0;
			}
		}
		else if (sorting.length && sorting[0][0] == colIdx) {
			// Single column - already sorting on this column, modify the sort
			nextSortIdx = next(sorting[0]);

			sorting.length = 1;
			sorting[0][1] = asSorting[nextSortIdx];
			sorting[0]._idx = nextSortIdx;
		}
		else {
			// Single column - sort only on this column
			sorting.length = 0;
			sorting.push([colIdx, asSorting[0]]);
			sorting[0]._idx = 0;
		}
	}


	/**
	 * Set the sorting classes on table's body, Note: it is safe to call this function
	 * when bSort and bSortClasses are false
	 *  @param {object} oSettings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnSortingClasses(settings) {
		var oldSort = settings.aLastSort;
		var sortClass = settings.oClasses.order.position;
		var sort = _fnSortFlatten(settings);
		var features = settings.oFeatures;
		var i, ien, colIdx;

		if (features.bSort && features.bSortClasses) {
			// Remove old sorting classes
			for (i = 0, ien = oldSort.length; i < ien; i++) {
				colIdx = oldSort[i].src;

				// Remove column sorting
				$(_pluck(settings.aoData, 'anCells', colIdx))
					.removeClass(sortClass + (i < 2 ? i + 1 : 3));
			}

			// Add new column sorting
			for (i = 0, ien = sort.length; i < ien; i++) {
				colIdx = sort[i].src;

				$(_pluck(settings.aoData, 'anCells', colIdx))
					.addClass(sortClass + (i < 2 ? i + 1 : 3));
			}
		}

		settings.aLastSort = sort;
	}


	// Get the data to sort a column, be it from cache, fresh (populating the
	// cache), or from a sort formatter
	function _fnSortData(settings, colIdx) {
		// Custom sorting function - provided by the sort data type
		var column = settings.aoColumns[colIdx];
		var customSort = DataTable.ext.order[column.sSortDataType];
		var customData;

		if (customSort) {
			customData = customSort.call(settings.oInstance, settings, colIdx,
				_fnColumnIndexToVisible(settings, colIdx)
			);
		}

		// Use / populate cache
		var row, cellData;
		var formatter = DataTable.ext.type.order[column.sType + "-pre"];
		var data = settings.aoData;

		for (var rowIdx = 0; rowIdx < data.length; rowIdx++) {
			// Sparse array
			if (!data[rowIdx]) {
				continue;
			}

			row = data[rowIdx];

			if (!row._aSortData) {
				row._aSortData = [];
			}

			if (!row._aSortData[colIdx] || customSort) {
				cellData = customSort ?
					customData[rowIdx] : // If there was a custom sort function, use data from there
					_fnGetCellData(settings, rowIdx, colIdx, 'sort');

				row._aSortData[colIdx] = formatter ?
					formatter(cellData, settings) :
					cellData;
			}
		}
	}


	/**
	 * State information for a table
	 *
	 * @param {*} settings
	 * @returns State object
	 */
	function _fnSaveState(settings) {
		if (settings._bLoadingState) {
			return;
		}

		/* Store the interesting variables */
		var state = {
			time: +new Date(),
			start: settings._iDisplayStart,
			length: settings._iDisplayLength,
			order: $.extend(true, [], settings.aaSorting),
			search: $.extend({}, settings.oPreviousSearch),
			columns: settings.aoColumns.map(function (col, i) {
				return {
					visible: col.bVisible,
					search: $.extend({}, settings.aoPreSearchCols[i])
				};
			})
		};

		settings.oSavedState = state;
		_fnCallbackFire(settings, "aoStateSaveParams", 'stateSaveParams', [settings, state]);

		if (settings.oFeatures.bStateSave && !settings.bDestroying) {
			settings.fnStateSaveCallback.call(settings.oInstance, settings, state);
		}
	}


	/**
	 * Attempt to load a saved table state
	 *  @param {object} oSettings dataTables settings object
	 *  @param {object} oInit DataTables init object so we can override settings
	 *  @param {function} callback Callback to execute when the state has been loaded
	 *  @memberof DataTable#oApi
	 */
	function _fnLoadState(settings, init, callback) {
		if (!settings.oFeatures.bStateSave) {
			callback();
			return;
		}

		var loaded = function (state) {
			_fnImplementState(settings, state, callback);
		}

		var state = settings.fnStateLoadCallback.call(settings.oInstance, settings, loaded);

		if (state !== undefined) {
			_fnImplementState(settings, state, callback);
		}
		// otherwise, wait for the loaded callback to be executed

		return true;
	}

	function _fnImplementState(settings, s, callback) {
		var i, ien;
		var columns = settings.aoColumns;
		settings._bLoadingState = true;

		// When StateRestore was introduced the state could now be implemented at any time
		// Not just initialisation. To do this an api instance is required in some places
		var api = settings._bInitComplete ? new DataTable.Api(settings) : null;

		if (!s || !s.time) {
			settings._bLoadingState = false;
			callback();
			return;
		}

		// Reject old data
		var duration = settings.iStateDuration;
		if (duration > 0 && s.time < +new Date() - (duration * 1000)) {
			settings._bLoadingState = false;
			callback();
			return;
		}

		// Allow custom and plug-in manipulation functions to alter the saved data set and
		// cancelling of loading by returning false
		var abStateLoad = _fnCallbackFire(settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s]);
		if (abStateLoad.indexOf(false) !== -1) {
			settings._bLoadingState = false;
			callback();
			return;
		}

		// Number of columns have changed - all bets are off, no restore of settings
		if (s.columns && columns.length !== s.columns.length) {
			settings._bLoadingState = false;
			callback();
			return;
		}

		// Store the saved state so it might be accessed at any time
		settings.oLoadedState = $.extend(true, {}, s);

		// This is needed for ColReorder, which has to happen first to allow all
		// the stored indexes to be usable. It is not publicly documented.
		_fnCallbackFire(settings, null, 'stateLoadInit', [settings, s], true);

		// Page Length
		if (s.length !== undefined) {
			// If already initialised just set the value directly so that the select element is also updated
			if (api) {
				api.page.len(s.length)
			}
			else {
				settings._iDisplayLength = s.length;
			}
		}

		// Restore key features - todo - for 1.11 this needs to be done by
		// subscribed events
		if (s.start !== undefined) {
			if (api === null) {
				settings._iDisplayStart = s.start;
				settings.iInitDisplayStart = s.start;
			}
			else {
				_fnPageChange(settings, s.start / settings._iDisplayLength);
			}
		}

		// Order
		if (s.order !== undefined) {
			settings.aaSorting = [];
			$.each(s.order, function (i, col) {
				settings.aaSorting.push(col[0] >= columns.length ?
					[0, col[1]] :
					col
				);
			});
		}

		// Search
		if (s.search !== undefined) {
			$.extend(settings.oPreviousSearch, s.search);
		}

		// Columns
		if (s.columns) {
			for (i = 0, ien = s.columns.length; i < ien; i++) {
				var col = s.columns[i];

				// Visibility
				if (col.visible !== undefined) {
					// If the api is defined, the table has been initialised so we need to use it rather than internal settings
					if (api) {
						// Don't redraw the columns on every iteration of this loop, we will do this at the end instead
						api.column(i).visible(col.visible, false);
					}
					else {
						columns[i].bVisible = col.visible;
					}
				}

				// Search
				if (col.search !== undefined) {
					$.extend(settings.aoPreSearchCols[i], col.search);
				}
			}

			// If the api is defined then we need to adjust the columns once the visibility has been changed
			if (api) {
				api.columns.adjust();
			}
		}

		settings._bLoadingState = false;
		_fnCallbackFire(settings, 'aoStateLoaded', 'stateLoaded', [settings, s]);
		callback();
	}

	/**
	 * Log an error message
	 *  @param {object} settings dataTables settings object
	 *  @param {int} level log error messages, or display them to the user
	 *  @param {string} msg error message
	 *  @param {int} tn Technical note id to get more information about the error.
	 *  @memberof DataTable#oApi
	 */
	function _fnLog(settings, level, msg, tn) {
		msg = 'DataTables warning: ' +
			(settings ? 'table id=' + settings.sTableId + ' - ' : '') + msg;

		if (tn) {
			msg += '. For more information about this error, please see ' +
				'https://datatables.net/tn/' + tn;
		}

		if (!level) {
			// Backwards compatibility pre 1.10
			var ext = DataTable.ext;
			var type = ext.sErrMode || ext.errMode;

			if (settings) {
				_fnCallbackFire(settings, null, 'dt-error', [settings, tn, msg], true);
			}

			if (type == 'alert') {
				alert(msg);
			}
			else if (type == 'throw') {
				throw new Error(msg);
			}
			else if (typeof type == 'function') {
				type(settings, tn, msg);
			}
		}
		else if (window.console && console.log) {
			console.log(msg);
		}
	}


	/**
	 * See if a property is defined on one object, if so assign it to the other object
	 *  @param {object} ret target object
	 *  @param {object} src source object
	 *  @param {string} name property
	 *  @param {string} [mappedName] name to map too - optional, name used if not given
	 *  @memberof DataTable#oApi
	 */
	function _fnMap(ret, src, name, mappedName) {
		if (Array.isArray(name)) {
			$.each(name, function (i, val) {
				if (Array.isArray(val)) {
					_fnMap(ret, src, val[0], val[1]);
				}
				else {
					_fnMap(ret, src, val);
				}
			});

			return;
		}

		if (mappedName === undefined) {
			mappedName = name;
		}

		if (src[name] !== undefined) {
			ret[mappedName] = src[name];
		}
	}


	/**
	 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
	 * shallow copy arrays. The reason we need to do this, is that we don't want to
	 * deep copy array init values (such as aaSorting) since the dev wouldn't be
	 * able to override them, but we do want to deep copy arrays.
	 *  @param {object} out Object to extend
	 *  @param {object} extender Object from which the properties will be applied to
	 *      out
	 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
	 *      independent copy with the exception of the `data` or `aaData` parameters
	 *      if they are present. This is so you can pass in a collection to
	 *      DataTables and have that used as your data source without breaking the
	 *      references
	 *  @returns {object} out Reference, just for convenience - out === the return.
	 *  @memberof DataTable#oApi
	 *  @todo This doesn't take account of arrays inside the deep copied objects.
	 */
	function _fnExtend(out, extender, breakRefs) {
		var val;

		for (var prop in extender) {
			if (Object.prototype.hasOwnProperty.call(extender, prop)) {
				val = extender[prop];

				if ($.isPlainObject(val)) {
					if (!$.isPlainObject(out[prop])) {
						out[prop] = {};
					}
					$.extend(true, out[prop], val);
				}
				else if (breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val)) {
					out[prop] = val.slice();
				}
				else {
					out[prop] = val;
				}
			}
		}

		return out;
	}


	/**
	 * Bind an event handers to allow a click or return key to activate the callback.
	 * This is good for accessibility since a return on the keyboard will have the
	 * same effect as a click, if the element has focus.
	 *  @param {element} n Element to bind the action to
	 *  @param {object|string} selector Selector (for delegated events) or data object
	 *   to pass to the triggered function
	 *  @param {function} fn Callback function for when the event is triggered
	 *  @memberof DataTable#oApi
	 */
	function _fnBindAction(n, selector, fn) {
		$(n)
			.on('click.DT', selector, function (e) {
				fn(e);
			})
			.on('keypress.DT', selector, function (e) {
				if (e.which === 13) {
					e.preventDefault();
					fn(e);
				}
			})
			.on('selectstart.DT', selector, function () {
				// Don't want a double click resulting in text selection
				return false;
			});
	}


	/**
	 * Register a callback function. Easily allows a callback function to be added to
	 * an array store of callback functions that can then all be called together.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} store Name of the array storage for the callbacks in oSettings
	 *  @param {function} fn Function to be called back
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackReg(settings, store, fn) {
		if (fn) {
			settings[store].push(fn);
		}
	}


	/**
	 * Fire callback functions and trigger events. Note that the loop over the
	 * callback array store is done backwards! Further note that you do not want to
	 * fire off triggers in time sensitive applications (for example cell creation)
	 * as its slow.
	 *  @param {object} settings dataTables settings object
	 *  @param {string} callbackArr Name of the array storage for the callbacks in
	 *      oSettings
	 *  @param {string} eventName Name of the jQuery custom event to trigger. If
	 *      null no trigger is fired
	 *  @param {array} args Array of arguments to pass to the callback function /
	 *      trigger
	 *  @param {boolean} [bubbles] True if the event should bubble
	 *  @memberof DataTable#oApi
	 */
	function _fnCallbackFire(settings, callbackArr, eventName, args, bubbles) {
		var ret = [];

		if (callbackArr) {
			ret = settings[callbackArr].slice().reverse().map(function (val) {
				return val.apply(settings.oInstance, args);
			});
		}

		if (eventName !== null) {
			var e = $.Event(eventName + '.dt');
			var table = $(settings.nTable);

			// Expose the DataTables API on the event object for easy access
			e.dt = settings.api;

			table[bubbles ? 'trigger' : 'triggerHandler'](e, args);

			// If not yet attached to the document, trigger the event
			// on the body directly to sort of simulate the bubble
			if (bubbles && table.parents('body').length === 0) {
				$('body').trigger(e, args);
			}

			ret.push(e.result);
		}

		return ret;
	}


	function _fnLengthOverflow(settings) {
		var
			start = settings._iDisplayStart,
			end = settings.fnDisplayEnd(),
			len = settings._iDisplayLength;

		/* If we have space to show extra rows (backing up from the end point - then do so */
		if (start >= end) {
			start = end - len;
		}

		// Keep the start record on the current page
		start -= (start % len);

		if (len === -1 || start < 0) {
			start = 0;
		}

		settings._iDisplayStart = start;
	}


	function _fnRenderer(settings, type) {
		var renderer = settings.renderer;
		var host = DataTable.ext.renderer[type];

		if ($.isPlainObject(renderer) && renderer[type]) {
			// Specific renderer for this type. If available use it, otherwise use
			// the default.
			return host[renderer[type]] || host._;
		}
		else if (typeof renderer === 'string') {
			// Common renderer - if there is one available for this type use it,
			// otherwise use the default
			return host[renderer] || host._;
		}

		// Use the default
		return host._;
	}


	/**
	 * Detect the data source being used for the table. Used to simplify the code
	 * a little (ajax) and to make it compress a little smaller.
	 *
	 *  @param {object} settings dataTables settings object
	 *  @returns {string} Data source
	 *  @memberof DataTable#oApi
	 */
	function _fnDataSource(settings) {
		if (settings.oFeatures.bServerSide) {
			return 'ssp';
		}
		else if (settings.ajax) {
			return 'ajax';
		}
		return 'dom';
	}

	/**
	 * Common replacement for language strings
	 *
	 * @param {*} settings DT settings object
	 * @param {*} str String with values to replace
	 * @param {*} entries Plural number for _ENTRIES_ - can be undefined
	 * @returns String
	 */
	function _fnMacros(settings, str, entries) {
		// When infinite scrolling, we are always starting at 1. _iDisplayStart is
		// used only internally
		var
			formatter = settings.fnFormatNumber,
			start = settings._iDisplayStart + 1,
			len = settings._iDisplayLength,
			vis = settings.fnRecordsDisplay(),
			max = settings.fnRecordsTotal(),
			all = len === -1;

		return str.
			replace(/_START_/g, formatter.call(settings, start)).
			replace(/_END_/g, formatter.call(settings, settings.fnDisplayEnd())).
			replace(/_MAX_/g, formatter.call(settings, max)).
			replace(/_TOTAL_/g, formatter.call(settings, vis)).
			replace(/_PAGE_/g, formatter.call(settings, all ? 1 : Math.ceil(start / len))).
			replace(/_PAGES_/g, formatter.call(settings, all ? 1 : Math.ceil(vis / len))).
			replace(/_ENTRIES_/g, settings.api.i18n('entries', '', entries)).
			replace(/_ENTRIES-MAX_/g, settings.api.i18n('entries', '', max)).
			replace(/_ENTRIES-TOTAL_/g, settings.api.i18n('entries', '', vis));
	}



	/**
	 * Computed structure of the DataTables API, defined by the options passed to
	 * `DataTable.Api.register()` when building the API.
	 *
	 * The structure is built in order to speed creation and extension of the Api
	 * objects since the extensions are effectively pre-parsed.
	 *
	 * The array is an array of objects with the following structure, where this
	 * base array represents the Api prototype base:
	 *
	 *     [
	 *       {
	 *         name:      'data'                -- string   - Property name
	 *         val:       function () {},       -- function - Api method (or undefined if just an object
	 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	 *       },
	 *       {
	 *         name:     'row'
	 *         val:       {},
	 *         methodExt: [ ... ],
	 *         propExt:   [
	 *           {
	 *             name:      'data'
	 *             val:       function () {},
	 *             methodExt: [ ... ],
	 *             propExt:   [ ... ]
	 *           },
	 *           ...
	 *         ]
	 *       }
	 *     ]
	 *
	 * @type {Array}
	 * @ignore
	 */
	var __apiStruct = [];


	/**
	 * `Array.prototype` reference.
	 *
	 * @type object
	 * @ignore
	 */
	var __arrayProto = Array.prototype;


	/**
	 * Abstraction for `context` parameter of the `Api` constructor to allow it to
	 * take several different forms for ease of use.
	 *
	 * Each of the input parameter types will be converted to a DataTables settings
	 * object where possible.
	 *
	 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
	 *   of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 *   * `DataTables.Api` - API instance
	 * @return {array|null} Matching DataTables settings objects. `null` or
	 *   `undefined` is returned if no matching DataTable is found.
	 * @ignore
	 */
	var _toSettings = function (mixed) {
		var idx, jq;
		var settings = DataTable.settings;
		var tables = _pluck(settings, 'nTable');

		if (!mixed) {
			return [];
		}
		else if (mixed.nTable && mixed.oFeatures) {
			// DataTables settings object
			return [mixed];
		}
		else if (mixed.nodeName && mixed.nodeName.toLowerCase() === 'table') {
			// Table node
			idx = tables.indexOf(mixed);
			return idx !== -1 ? [settings[idx]] : null;
		}
		else if (mixed && typeof mixed.settings === 'function') {
			return mixed.settings().toArray();
		}
		else if (typeof mixed === 'string') {
			// jQuery selector
			jq = $(mixed).get();
		}
		else if (mixed instanceof $) {
			// jQuery object (also DataTables instance)
			jq = mixed.get();
		}

		if (jq) {
			return settings.filter(function (v, idx) {
				return jq.includes(tables[idx]);
			});
		}
	};


	/**
	 * DataTables API class - used to control and interface with  one or more
	 * DataTables enhanced tables.
	 *
	 * The API class is heavily based on jQuery, presenting a chainable interface
	 * that you can use to interact with tables. Each instance of the API class has
	 * a "context" - i.e. the tables that it will operate on. This could be a single
	 * table, all tables on a page or a sub-set thereof.
	 *
	 * Additionally the API is designed to allow you to easily work with the data in
	 * the tables, retrieving and manipulating it as required. This is done by
	 * presenting the API class as an array like interface. The contents of the
	 * array depend upon the actions requested by each method (for example
	 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
	 * return an array of objects or arrays depending upon your table's
	 * configuration). The API object has a number of array like methods (`push`,
	 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
	 * `unique` etc) to assist your working with the data held in a table.
	 *
	 * Most methods (those which return an Api instance) are chainable, which means
	 * the return from a method call also has all of the methods available that the
	 * top level object had. For example, these two calls are equivalent:
	 *
	 *     // Not chained
	 *     api.row.add( {...} );
	 *     api.draw();
	 *
	 *     // Chained
	 *     api.row.add( {...} ).draw();
	 *
	 * @class DataTable.Api
	 * @param {array|object|string|jQuery} context DataTable identifier. This is
	 *   used to define which DataTables enhanced tables this API will operate on.
	 *   Can be one of:
	 *
	 *   * `string` - jQuery selector. Any DataTables' matching the given selector
	 *     with be found and used.
	 *   * `node` - `TABLE` node which has already been formed into a DataTable.
	 *   * `jQuery` - A jQuery object of `TABLE` nodes.
	 *   * `object` - DataTables settings object
	 * @param {array} [data] Data to initialise the Api instance with.
	 *
	 * @example
	 *   // Direct initialisation during DataTables construction
	 *   var api = $('#example').DataTable();
	 *
	 * @example
	 *   // Initialisation using a DataTables jQuery object
	 *   var api = $('#example').dataTable().api();
	 *
	 * @example
	 *   // Initialisation as a constructor
	 *   var api = new DataTable.Api( 'table.dataTable' );
	 */
	_Api = function (context, data) {
		if (!(this instanceof _Api)) {
			return new _Api(context, data);
		}

		var settings = [];
		var ctxSettings = function (o) {
			var a = _toSettings(o);
			if (a) {
				settings.push.apply(settings, a);
			}
		};

		if (Array.isArray(context)) {
			for (var i = 0, ien = context.length; i < ien; i++) {
				ctxSettings(context[i]);
			}
		}
		else {
			ctxSettings(context);
		}

		// Remove duplicates
		this.context = settings.length > 1
			? _unique(settings)
			: settings;

		// Initial data
		if (data) {
			this.push.apply(this, data);
		}

		// selector
		this.selector = {
			rows: null,
			cols: null,
			opts: null
		};

		_Api.extend(this, this, __apiStruct);
	};

	DataTable.Api = _Api;

	// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
	// isPlainObject.
	$.extend(_Api.prototype, {
		any: function () {
			return this.count() !== 0;
		},

		context: [], // array of table settings objects

		count: function () {
			return this.flatten().length;
		},

		each: function (fn) {
			for (var i = 0, ien = this.length; i < ien; i++) {
				fn.call(this, this[i], i, this);
			}

			return this;
		},

		eq: function (idx) {
			var ctx = this.context;

			return ctx.length > idx ?
				new _Api(ctx[idx], this[idx]) :
				null;
		},

		filter: function (fn) {
			var a = __arrayProto.filter.call(this, fn, this);

			return new _Api(this.context, a);
		},

		flatten: function () {
			var a = [];

			return new _Api(this.context, a.concat.apply(a, this.toArray()));
		},

		get: function (idx) {
			return this[idx];
		},

		join: __arrayProto.join,

		includes: function (find) {
			return this.indexOf(find) === -1 ? false : true;
		},

		indexOf: __arrayProto.indexOf,

		iterator: function (flatten, type, fn, alwaysNew) {
			var
				a = [], ret,
				i, ien, j, jen,
				context = this.context,
				rows, items, item,
				selector = this.selector;

			// Argument shifting
			if (typeof flatten === 'string') {
				alwaysNew = fn;
				fn = type;
				type = flatten;
				flatten = false;
			}

			for (i = 0, ien = context.length; i < ien; i++) {
				var apiInst = new _Api(context[i]);

				if (type === 'table') {
					ret = fn.call(apiInst, context[i], i);

					if (ret !== undefined) {
						a.push(ret);
					}
				}
				else if (type === 'columns' || type === 'rows') {
					// this has same length as context - one entry for each table
					ret = fn.call(apiInst, context[i], this[i], i);

					if (ret !== undefined) {
						a.push(ret);
					}
				}
				else if (type === 'every' || type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell') {
					// columns and rows share the same structure.
					// 'this' is an array of column indexes for each context
					items = this[i];

					if (type === 'column-rows') {
						rows = _selector_row_indexes(context[i], selector.opts);
					}

					for (j = 0, jen = items.length; j < jen; j++) {
						item = items[j];

						if (type === 'cell') {
							ret = fn.call(apiInst, context[i], item.row, item.column, i, j);
						}
						else {
							ret = fn.call(apiInst, context[i], item, i, j, rows);
						}

						if (ret !== undefined) {
							a.push(ret);
						}
					}
				}
			}

			if (a.length || alwaysNew) {
				var api = new _Api(context, flatten ? a.concat.apply([], a) : a);
				var apiSelector = api.selector;
				apiSelector.rows = selector.rows;
				apiSelector.cols = selector.cols;
				apiSelector.opts = selector.opts;
				return api;
			}
			return this;
		},

		lastIndexOf: __arrayProto.lastIndexOf,

		length: 0,

		map: function (fn) {
			var a = __arrayProto.map.call(this, fn, this);

			return new _Api(this.context, a);
		},

		pluck: function (prop) {
			var fn = DataTable.util.get(prop);

			return this.map(function (el) {
				return fn(el);
			});
		},

		pop: __arrayProto.pop,

		push: __arrayProto.push,

		reduce: __arrayProto.reduce,

		reduceRight: __arrayProto.reduceRight,

		reverse: __arrayProto.reverse,

		// Object with rows, columns and opts
		selector: null,

		shift: __arrayProto.shift,

		slice: function () {
			return new _Api(this.context, this);
		},

		sort: __arrayProto.sort,

		splice: __arrayProto.splice,

		toArray: function () {
			return __arrayProto.slice.call(this);
		},

		to$: function () {
			return $(this);
		},

		toJQuery: function () {
			return $(this);
		},

		unique: function () {
			return new _Api(this.context, _unique(this.toArray()));
		},

		unshift: __arrayProto.unshift
	});


	function _api_scope(scope, fn, struc) {
		return function () {
			var ret = fn.apply(scope || this, arguments);

			// Method extension
			_Api.extend(ret, ret, struc.methodExt);
			return ret;
		};
	}

	function _api_find(src, name) {
		for (var i = 0, ien = src.length; i < ien; i++) {
			if (src[i].name === name) {
				return src[i];
			}
		}
		return null;
	}

	window.__apiStruct = __apiStruct;

	_Api.extend = function (scope, obj, ext) {
		// Only extend API instances and static properties of the API
		if (!ext.length || !obj || (!(obj instanceof _Api) && !obj.__dt_wrapper)) {
			return;
		}

		var
			i, ien,
			struct;

		for (i = 0, ien = ext.length; i < ien; i++) {
			struct = ext[i];

			if (struct.name === '__proto__') {
				continue;
			}

			// Value
			obj[struct.name] = struct.type === 'function' ?
				_api_scope(scope, struct.val, struct) :
				struct.type === 'object' ?
					{} :
					struct.val;

			obj[struct.name].__dt_wrapper = true;

			// Property extension
			_Api.extend(scope, obj[struct.name], struct.propExt);
		}
	};

	//     [
	//       {
	//         name:      'data'                -- string   - Property name
	//         val:       function () {},       -- function - Api method (or undefined if just an object
	//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
	//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
	//       },
	//       {
	//         name:     'row'
	//         val:       {},
	//         methodExt: [ ... ],
	//         propExt:   [
	//           {
	//             name:      'data'
	//             val:       function () {},
	//             methodExt: [ ... ],
	//             propExt:   [ ... ]
	//           },
	//           ...
	//         ]
	//       }
	//     ]


	_Api.register = _api_register = function (name, val) {
		if (Array.isArray(name)) {
			for (var j = 0, jen = name.length; j < jen; j++) {
				_Api.register(name[j], val);
			}
			return;
		}

		var
			i, ien,
			heir = name.split('.'),
			struct = __apiStruct,
			key, method;

		for (i = 0, ien = heir.length; i < ien; i++) {
			method = heir[i].indexOf('()') !== -1;
			key = method ?
				heir[i].replace('()', '') :
				heir[i];

			var src = _api_find(struct, key);
			if (!src) {
				src = {
					name: key,
					val: {},
					methodExt: [],
					propExt: [],
					type: 'object'
				};
				struct.push(src);
			}

			if (i === ien - 1) {
				src.val = val;
				src.type = typeof val === 'function' ?
					'function' :
					$.isPlainObject(val) ?
						'object' :
						'other';
			}
			else {
				struct = method ?
					src.methodExt :
					src.propExt;
			}
		}
	};

	_Api.registerPlural = _api_registerPlural = function (pluralName, singularName, val) {
		_Api.register(pluralName, val);

		_Api.register(singularName, function () {
			var ret = val.apply(this, arguments);

			if (ret === this) {
				// Returned item is the API instance that was passed in, return it
				return this;
			}
			else if (ret instanceof _Api) {
				// New API instance returned, want the value from the first item
				// in the returned array for the singular result.
				return ret.length ?
					Array.isArray(ret[0]) ?
						new _Api(ret.context, ret[0]) : // Array results are 'enhanced'
						ret[0] :
					undefined;
			}

			// Non-API return - just fire it back
			return ret;
		});
	};


	/**
	 * Selector for HTML tables. Apply the given selector to the give array of
	 * DataTables settings objects.
	 *
	 * @param {string|integer} [selector] jQuery selector string or integer
	 * @param  {array} Array of DataTables settings objects to be filtered
	 * @return {array}
	 * @ignore
	 */
	var __table_selector = function (selector, a) {
		if (Array.isArray(selector)) {
			var result = [];

			selector.forEach(function (sel) {
				var inner = __table_selector(sel, a);

				result.push.apply(result, inner);
			});

			return result.filter(function (item) {
				return item;
			});
		}

		// Integer is used to pick out a table by index
		if (typeof selector === 'number') {
			return [a[selector]];
		}

		// Perform a jQuery selector on the table nodes
		var nodes = a.map(function (el) {
			return el.nTable;
		});

		return $(nodes)
			.filter(selector)
			.map(function () {
				// Need to translate back from the table node to the settings
				var idx = nodes.indexOf(this);
				return a[idx];
			})
			.toArray();
	};



	/**
	 * Context selector for the API's context (i.e. the tables the API instance
	 * refers to.
	 *
	 * @name    DataTable.Api#tables
	 * @param {string|integer} [selector] Selector to pick which tables the iterator
	 *   should operate on. If not given, all tables in the current context are
	 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
	 *   select multiple tables or as an integer to select a single table.
	 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
	 */
	_api_register('tables()', function (selector) {
		// A new instance is created if there was a selector specified
		return selector !== undefined && selector !== null ?
			new _Api(__table_selector(selector, this.context)) :
			this;
	});


	_api_register('table()', function (selector) {
		var tables = this.tables(selector);
		var ctx = tables.context;

		// Truncate to the first matched table
		return ctx.length ?
			new _Api(ctx[0]) :
			tables;
	});

	// Common methods, combined to reduce size
	[
		['nodes', 'node', 'nTable'],
		['body', 'body', 'nTBody'],
		['header', 'header', 'nTHead'],
		['footer', 'footer', 'nTFoot'],
	].forEach(function (item) {
		_api_registerPlural(
			'tables().' + item[0] + '()',
			'table().' + item[1] + '()',
			function () {
				return this.iterator('table', function (ctx) {
					return ctx[item[2]];
				}, 1);
			}
		);
	});

	// Structure methods
	[
		['header', 'aoHeader'],
		['footer', 'aoFooter'],
	].forEach(function (item) {
		_api_register('table().' + item[0] + '.structure()', function (selector) {
			var indexes = this.columns(selector).indexes().flatten();
			var ctx = this.context[0];

			return _fnHeaderLayout(ctx, ctx[item[1]], indexes);
		});
	})


	_api_registerPlural('tables().containers()', 'table().container()', function () {
		return this.iterator('table', function (ctx) {
			return ctx.nTableWrapper;
		}, 1);
	});

	_api_register('tables().every()', function (fn) {
		var that = this;

		return this.iterator('table', function (s, i) {
			fn.call(that.table(i), i);
		});
	});

	_api_register('caption()', function (value, side) {
		var context = this.context;

		// Getter - return existing node's content
		if (value === undefined) {
			var caption = context[0].captionNode;

			return caption && context.length ?
				caption.innerHTML :
				null;
		}

		return this.iterator('table', function (ctx) {
			var table = $(ctx.nTable);
			var caption = $(ctx.captionNode);
			var container = $(ctx.nTableWrapper);

			// Create the node if it doesn't exist yet
			if (!caption.length) {
				caption = $('<caption/>').html(value);
				ctx.captionNode = caption[0];

				// If side isn't set, we need to insert into the document to let the
				// CSS decide so we can read it back, otherwise there is no way to
				// know if the CSS would put it top or bottom for scrolling
				if (!side) {
					table.prepend(caption);

					side = caption.css('caption-side');
				}
			}

			caption.html(value);

			if (side) {
				caption.css('caption-side', side);
				caption[0]._captionSide = side;
			}

			if (container.find('div.dataTables_scroll').length) {
				var selector = (side === 'top' ? 'Head' : 'Foot');

				container.find('div.dataTables_scroll' + selector + ' table').prepend(caption);
			}
			else {
				table.prepend(caption);
			}
		}, 1);
	});

	_api_register('caption.node()', function () {
		var ctx = this.context;

		return ctx.length ? ctx[0].captionNode : null;
	});


	/**
	 * Redraw the tables in the current context.
	 */
	_api_register('draw()', function (paging) {
		return this.iterator('table', function (settings) {
			if (paging === 'page') {
				_fnDraw(settings);
			}
			else {
				if (typeof paging === 'string') {
					paging = paging === 'full-hold' ?
						false :
						true;
				}

				_fnReDraw(settings, paging === false);
			}
		});
	});



	/**
	 * Get the current page index.
	 *
	 * @return {integer} Current page index (zero based)
	 *//**
	* Set the current page.
	*
	* Note that if you attempt to show a page which does not exist, DataTables will
	* not throw an error, but rather reset the paging.
	*
	* @param {integer|string} action The paging action to take. This can be one of:
	*  * `integer` - The page index to jump to
	*  * `string` - An action to take:
	*    * `first` - Jump to first page.
	*    * `next` - Jump to the next page
	*    * `previous` - Jump to previous page
	*    * `last` - Jump to the last page.
	* @returns {DataTables.Api} this
	*/
	_api_register('page()', function (action) {
		if (action === undefined) {
			return this.page.info().page; // not an expensive call
		}

		// else, have an action to take on all tables
		return this.iterator('table', function (settings) {
			_fnPageChange(settings, action);
		});
	});


	/**
	 * Paging information for the first table in the current context.
	 *
	 * If you require paging information for another table, use the `table()` method
	 * with a suitable selector.
	 *
	 * @return {object} Object with the following properties set:
	 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
	 *  * `pages` - Total number of pages
	 *  * `start` - Display index for the first record shown on the current page
	 *  * `end` - Display index for the last record shown on the current page
	 *  * `length` - Display length (number of records). Note that generally `start
	 *    + length = end`, but this is not always true, for example if there are
	 *    only 2 records to show on the final page, with a length of 10.
	 *  * `recordsTotal` - Full data set length
	 *  * `recordsDisplay` - Data set length once the current filtering criterion
	 *    are applied.
	 */
	_api_register('page.info()', function () {
		if (this.context.length === 0) {
			return undefined;
		}

		var
			settings = this.context[0],
			start = settings._iDisplayStart,
			len = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
			visRecords = settings.fnRecordsDisplay(),
			all = len === -1;

		return {
			"page": all ? 0 : Math.floor(start / len),
			"pages": all ? 1 : Math.ceil(visRecords / len),
			"start": start,
			"end": settings.fnDisplayEnd(),
			"length": len,
			"recordsTotal": settings.fnRecordsTotal(),
			"recordsDisplay": visRecords,
			"serverSide": _fnDataSource(settings) === 'ssp'
		};
	});


	/**
	 * Get the current page length.
	 *
	 * @return {integer} Current page length. Note `-1` indicates that all records
	 *   are to be shown.
	 *//**
	* Set the current page length.
	*
	* @param {integer} Page length to set. Use `-1` to show all records.
	* @returns {DataTables.Api} this
	*/
	_api_register('page.len()', function (len) {
		// Note that we can't call this function 'length()' because `length`
		// is a Javascript property of functions which defines how many arguments
		// the function expects.
		if (len === undefined) {
			return this.context.length !== 0 ?
				this.context[0]._iDisplayLength :
				undefined;
		}

		// else, set the page length
		return this.iterator('table', function (settings) {
			_fnLengthChange(settings, len);
		});
	});



	var __reload = function (settings, holdPosition, callback) {
		// Use the draw event to trigger a callback
		if (callback) {
			var api = new _Api(settings);

			api.one('draw', function () {
				callback(api.ajax.json());
			});
		}

		if (_fnDataSource(settings) == 'ssp') {
			_fnReDraw(settings, holdPosition);
		}
		else {
			_fnProcessingDisplay(settings, true);

			// Cancel an existing request
			var xhr = settings.jqXHR;
			if (xhr && xhr.readyState !== 4) {
				xhr.abort();
			}

			// Trigger xhr
			_fnBuildAjax(settings, {}, function (json) {
				_fnClearTable(settings);

				var data = _fnAjaxDataSrc(settings, json);
				for (var i = 0, ien = data.length; i < ien; i++) {
					_fnAddData(settings, data[i]);
				}

				_fnReDraw(settings, holdPosition);
				_fnInitComplete(settings);
				_fnProcessingDisplay(settings, false);
			});
		}
	};


	/**
	 * Get the JSON response from the last Ajax request that DataTables made to the
	 * server. Note that this returns the JSON from the first table in the current
	 * context.
	 *
	 * @return {object} JSON received from the server.
	 */
	_api_register('ajax.json()', function () {
		var ctx = this.context;

		if (ctx.length > 0) {
			return ctx[0].json;
		}

		// else return undefined;
	});


	/**
	 * Get the data submitted in the last Ajax request
	 */
	_api_register('ajax.params()', function () {
		var ctx = this.context;

		if (ctx.length > 0) {
			return ctx[0].oAjaxData;
		}

		// else return undefined;
	});


	/**
	 * Reload tables from the Ajax data source. Note that this function will
	 * automatically re-draw the table when the remote data has been loaded.
	 *
	 * @param {boolean} [reset=true] Reset (default) or hold the current paging
	 *   position. A full re-sort and re-filter is performed when this method is
	 *   called, which is why the pagination reset is the default action.
	 * @returns {DataTables.Api} this
	 */
	_api_register('ajax.reload()', function (callback, resetPaging) {
		return this.iterator('table', function (settings) {
			__reload(settings, resetPaging === false, callback);
		});
	});


	/**
	 * Get the current Ajax URL. Note that this returns the URL from the first
	 * table in the current context.
	 *
	 * @return {string} Current Ajax source URL
	 *//**
	* Set the Ajax URL. Note that this will set the URL for all tables in the
	* current context.
	*
	* @param {string} url URL to set.
	* @returns {DataTables.Api} this
	*/
	_api_register('ajax.url()', function (url) {
		var ctx = this.context;

		if (url === undefined) {
			// get
			if (ctx.length === 0) {
				return undefined;
			}
			ctx = ctx[0];

			return $.isPlainObject(ctx.ajax) ?
				ctx.ajax.url :
				ctx.ajax;
		}

		// set
		return this.iterator('table', function (settings) {
			if ($.isPlainObject(settings.ajax)) {
				settings.ajax.url = url;
			}
			else {
				settings.ajax = url;
			}
		});
	});


	/**
	 * Load data from the newly set Ajax URL. Note that this method is only
	 * available when `ajax.url()` is used to set a URL. Additionally, this method
	 * has the same effect as calling `ajax.reload()` but is provided for
	 * convenience when setting a new URL. Like `ajax.reload()` it will
	 * automatically redraw the table once the remote data has been loaded.
	 *
	 * @returns {DataTables.Api} this
	 */
	_api_register('ajax.url().load()', function (callback, resetPaging) {
		// Same as a reload, but makes sense to present it for easy access after a
		// url change
		return this.iterator('table', function (ctx) {
			__reload(ctx, resetPaging === false, callback);
		});
	});




	var _selector_run = function (type, selector, selectFn, settings, opts) {
		var
			out = [], res,
			a, i, ien, j, jen,
			selectorType = typeof selector;

		// Can't just check for isArray here, as an API or jQuery instance might be
		// given with their array like look
		if (!selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined) {
			selector = [selector];
		}

		for (i = 0, ien = selector.length; i < ien; i++) {
			// Only split on simple strings - complex expressions will be jQuery selectors
			a = selector[i] && selector[i].split && !selector[i].match(/[[(:]/) ?
				selector[i].split(',') :
				[selector[i]];

			for (j = 0, jen = a.length; j < jen; j++) {
				res = selectFn(typeof a[j] === 'string' ? (a[j]).trim() : a[j]);

				// Remove empty items
				res = res.filter(function (item) {
					return item !== null && item !== undefined;
				});

				if (res && res.length) {
					out = out.concat(res);
				}
			}
		}

		// selector extensions
		var ext = _ext.selector[type];
		if (ext.length) {
			for (i = 0, ien = ext.length; i < ien; i++) {
				out = ext[i](settings, opts, out);
			}
		}

		return _unique(out);
	};


	var _selector_opts = function (opts) {
		if (!opts) {
			opts = {};
		}

		// Backwards compatibility for 1.9- which used the terminology filter rather
		// than search
		if (opts.filter && opts.search === undefined) {
			opts.search = opts.filter;
		}

		return $.extend({
			search: 'none',
			order: 'current',
			page: 'all'
		}, opts);
	};


	// Reduce the API instance to the first item found
	var _selector_first = function (old) {
		let inst = new _Api(old.context[0]);

		// Use a push rather than passing to the constructor, since it will
		// merge arrays down automatically, which isn't what is wanted here
		if (old.length) {
			inst.push(old[0]);
		}

		inst.selector = old.selector;

		// Limit to a single row / column / cell
		if (inst.length && inst[0].length > 1) {
			inst[0].splice(1);
		}

		return inst;
	};


	var _selector_row_indexes = function (settings, opts) {
		var
			i, ien, tmp, a = [],
			displayFiltered = settings.aiDisplay,
			displayMaster = settings.aiDisplayMaster;

		var
			search = opts.search,  // none, applied, removed
			order = opts.order,   // applied, current, index (original - compatibility with 1.9)
			page = opts.page;    // all, current

		if (page == 'current') {
			// Current page implies that order=current and filter=applied, since it is
			// fairly senseless otherwise, regardless of what order and search actually
			// are
			for (i = settings._iDisplayStart, ien = settings.fnDisplayEnd(); i < ien; i++) {
				a.push(displayFiltered[i]);
			}
		}
		else if (order == 'current' || order == 'applied') {
			if (search == 'none') {
				a = displayMaster.slice();
			}
			else if (search == 'applied') {
				a = displayFiltered.slice();
			}
			else if (search == 'removed') {
				// O(n+m) solution by creating a hash map
				var displayFilteredMap = {};

				for (i = 0, ien = displayFiltered.length; i < ien; i++) {
					displayFilteredMap[displayFiltered[i]] = null;
				}

				displayMaster.forEach(function (item) {
					if (!Object.prototype.hasOwnProperty.call(displayFilteredMap, item)) {
						a.push(item);
					}
				});
			}
		}
		else if (order == 'index' || order == 'original') {
			for (i = 0, ien = settings.aoData.length; i < ien; i++) {
				if (!settings.aoData[i]) {
					continue;
				}

				if (search == 'none') {
					a.push(i);
				}
				else { // applied | removed
					tmp = displayFiltered.indexOf(i);

					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0 && search == 'applied')) {
						a.push(i);
					}
				}
			}
		}
		else if (typeof order === 'number') {
			// Order the rows by the given column
			var ordered = _fnSort(settings, order, 'asc');

			if (search === 'none') {
				a = ordered;
			}
			else { // applied | removed
				for (i = 0; i < ordered.length; i++) {
					tmp = displayFiltered.indexOf(ordered[i]);

					if ((tmp === -1 && search == 'removed') ||
						(tmp >= 0 && search == 'applied')) {
						a.push(ordered[i]);
					}
				}
			}
		}

		return a;
	};


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Rows
	 *
	 * {}          - no selector - use all available rows
	 * {integer}   - row aoData index
	 * {node}      - TR node
	 * {string}    - jQuery selector to apply to the TR elements
	 * {array}     - jQuery array of nodes, or simply an array of TR nodes
	 *
	 */
	var __row_selector = function (settings, selector, opts) {
		var rows;
		var run = function (sel) {
			var selInt = _intVal(sel);
			var aoData = settings.aoData;

			// Short cut - selector is a number and no options provided (default is
			// all records, so no need to check if the index is in there, since it
			// must be - dev error if the index doesn't exist).
			if (selInt !== null && !opts) {
				return [selInt];
			}

			if (!rows) {
				rows = _selector_row_indexes(settings, opts);
			}

			if (selInt !== null && rows.indexOf(selInt) !== -1) {
				// Selector - integer
				return [selInt];
			}
			else if (sel === null || sel === undefined || sel === '') {
				// Selector - none
				return rows;
			}

			// Selector - function
			if (typeof sel === 'function') {
				return rows.map(function (idx) {
					var row = aoData[idx];
					return sel(idx, row._aData, row.nTr) ? idx : null;
				});
			}

			// Selector - node
			if (sel.nodeName) {
				var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
				var cellIdx = sel._DT_CellIndex;

				if (rowIdx !== undefined) {
					// Make sure that the row is actually still present in the table
					return aoData[rowIdx] && aoData[rowIdx].nTr === sel ?
						[rowIdx] :
						[];
				}
				else if (cellIdx) {
					return aoData[cellIdx.row] && aoData[cellIdx.row].nTr === sel.parentNode ?
						[cellIdx.row] :
						[];
				}
				else {
					var host = $(sel).closest('*[data-dt-row]');
					return host.length ?
						[host.data('dt-row')] :
						[];
				}
			}

			// ID selector. Want to always be able to select rows by id, regardless
			// of if the tr element has been created or not, so can't rely upon
			// jQuery here - hence a custom implementation. This does not match
			// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
			// but to select it using a CSS selector engine (like Sizzle or
			// querySelect) it would need to need to be escaped for some characters.
			// DataTables simplifies this for row selectors since you can select
			// only a row. A # indicates an id any anything that follows is the id -
			// unescaped.
			if (typeof sel === 'string' && sel.charAt(0) === '#') {
				// get row index from id
				var rowObj = settings.aIds[sel.replace(/^#/, '')];
				if (rowObj !== undefined) {
					return [rowObj.idx];
				}

				// need to fall through to jQuery in case there is DOM id that
				// matches
			}

			// Get nodes in the order from the `rows` array with null values removed
			var nodes = _removeEmpty(
				_pluck_order(settings.aoData, rows, 'nTr')
			);

			// Selector - jQuery selector string, array of nodes or jQuery object/
			// As jQuery's .filter() allows jQuery objects to be passed in filter,
			// it also allows arrays, so this will cope with all three options
			return $(nodes)
				.filter(sel)
				.map(function () {
					return this._DT_RowIndex;
				})
				.toArray();
		};

		var matched = _selector_run('row', selector, run, settings, opts);

		if (opts.order === 'current' || opts.order === 'applied') {
			_fnSortDisplay(settings, matched);
		}

		return matched;
	};


	_api_register('rows()', function (selector, opts) {
		// argument shifting
		if (selector === undefined) {
			selector = '';
		}
		else if ($.isPlainObject(selector)) {
			opts = selector;
			selector = '';
		}

		opts = _selector_opts(opts);

		var inst = this.iterator('table', function (settings) {
			return __row_selector(settings, selector, opts);
		}, 1);

		// Want argument shifting here and in __row_selector?
		inst.selector.rows = selector;
		inst.selector.opts = opts;

		return inst;
	});

	_api_register('rows().nodes()', function () {
		return this.iterator('row', function (settings, row) {
			return settings.aoData[row].nTr || undefined;
		}, 1);
	});

	_api_register('rows().data()', function () {
		return this.iterator(true, 'rows', function (settings, rows) {
			return _pluck_order(settings.aoData, rows, '_aData');
		}, 1);
	});

	_api_registerPlural('rows().cache()', 'row().cache()', function (type) {
		return this.iterator('row', function (settings, row) {
			var r = settings.aoData[row];
			return type === 'search' ? r._aFilterData : r._aSortData;
		}, 1);
	});

	_api_registerPlural('rows().invalidate()', 'row().invalidate()', function (src) {
		return this.iterator('row', function (settings, row) {
			_fnInvalidate(settings, row, src);
		});
	});

	_api_registerPlural('rows().indexes()', 'row().index()', function () {
		return this.iterator('row', function (settings, row) {
			return row;
		}, 1);
	});

	_api_registerPlural('rows().ids()', 'row().id()', function (hash) {
		var a = [];
		var context = this.context;

		// `iterator` will drop undefined values, but in this case we want them
		for (var i = 0, ien = context.length; i < ien; i++) {
			for (var j = 0, jen = this[i].length; j < jen; j++) {
				var id = context[i].rowIdFn(context[i].aoData[this[i][j]]._aData);
				a.push((hash === true ? '#' : '') + id);
			}
		}

		return new _Api(context, a);
	});

	_api_registerPlural('rows().remove()', 'row().remove()', function () {
		this.iterator('row', function (settings, row) {
			var data = settings.aoData;
			var rowData = data[row];

			// Delete from the display arrays
			var idx = settings.aiDisplayMaster.indexOf(row);
			if (idx !== -1) {
				settings.aiDisplayMaster.splice(idx, 1);
			}

			// For server-side processing tables - subtract the deleted row from the count
			if (settings._iRecordsDisplay > 0) {
				settings._iRecordsDisplay--;
			}

			// Check for an 'overflow' they case for displaying the table
			_fnLengthOverflow(settings);

			// Remove the row's ID reference if there is one
			var id = settings.rowIdFn(rowData._aData);
			if (id !== undefined) {
				delete settings.aIds[id];
			}

			data[row] = null;
		});

		return this;
	});


	_api_register('rows.add()', function (rows) {
		var newRows = this.iterator('table', function (settings) {
			var row, i, ien;
			var out = [];

			for (i = 0, ien = rows.length; i < ien; i++) {
				row = rows[i];

				if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
					out.push(_fnAddTr(settings, row)[0]);
				}
				else {
					out.push(_fnAddData(settings, row));
				}
			}

			return out;
		}, 1);

		// Return an Api.rows() extended instance, so rows().nodes() etc can be used
		var modRows = this.rows(-1);
		modRows.pop();
		modRows.push.apply(modRows, newRows);

		return modRows;
	});





	/**
	 *
	 */
	_api_register('row()', function (selector, opts) {
		return _selector_first(this.rows(selector, opts));
	});


	_api_register('row().data()', function (data) {
		var ctx = this.context;

		if (data === undefined) {
			// Get
			return ctx.length && this.length && this[0].length ?
				ctx[0].aoData[this[0]]._aData :
				undefined;
		}

		// Set
		var row = ctx[0].aoData[this[0]];
		row._aData = data;

		// If the DOM has an id, and the data source is an array
		if (Array.isArray(data) && row.nTr && row.nTr.id) {
			_fnSetObjectDataFn(ctx[0].rowId)(data, row.nTr.id);
		}

		// Automatically invalidate
		_fnInvalidate(ctx[0], this[0], 'data');

		return this;
	});


	_api_register('row().node()', function () {
		var ctx = this.context;

		return ctx.length && this.length && this[0].length ?
			ctx[0].aoData[this[0]].nTr || null :
			null;
	});


	_api_register('row.add()', function (row) {
		// Allow a jQuery object to be passed in - only a single row is added from
		// it though - the first element in the set
		if (row instanceof $ && row.length) {
			row = row[0];
		}

		var rows = this.iterator('table', function (settings) {
			if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
				return _fnAddTr(settings, row)[0];
			}
			return _fnAddData(settings, row);
		});

		// Return an Api.rows() extended instance, with the newly added row selected
		return this.row(rows[0]);
	});


	$(document).on('plugin-init.dt', function (e, context) {
		var api = new _Api(context);

		api.on('stateSaveParams.DT', function (e, settings, d) {
			// This could be more compact with the API, but it is a lot faster as a simple
			// internal loop
			var idFn = settings.rowIdFn;
			var rows = settings.aiDisplayMaster;
			var ids = [];

			for (var i = 0; i < rows.length; i++) {
				var rowIdx = rows[i];
				var data = settings.aoData[rowIdx];

				if (data._detailsShow) {
					ids.push('#' + idFn(data._aData));
				}
			}

			d.childRows = ids;
		});

		// For future state loads (e.g. with StateRestore)
		api.on('stateLoaded.DT', function (e, settings, state) {
			__details_state_load(api, state);
		});

		// And the initial load state
		__details_state_load(api, api.state.loaded());
	});

	var __details_state_load = function (api, state) {
		if (state && state.childRows) {
			api
				.rows(state.childRows.map(function (id) {
					// Escape any `:` characters from the row id, unless previously escaped
					return id.replace(/(?<!\\):/g, '\\:');
				}))
				.every(function () {
					_fnCallbackFire(api.settings()[0], null, 'requestChild', [this])
				});
		}
	}

	var __details_add = function (ctx, row, data, klass) {
		// Convert to array of TR elements
		var rows = [];
		var addRow = function (r, k) {
			// Recursion to allow for arrays of jQuery objects
			if (Array.isArray(r) || r instanceof $) {
				for (var i = 0, ien = r.length; i < ien; i++) {
					addRow(r[i], k);
				}
				return;
			}

			// If we get a TR element, then just add it directly - up to the dev
			// to add the correct number of columns etc
			if (r.nodeName && r.nodeName.toLowerCase() === 'tr') {
				r.setAttribute('data-dt-row', row.idx);
				rows.push(r);
			}
			else {
				// Otherwise create a row with a wrapper
				var created = $('<tr><td></td></tr>')
					.attr('data-dt-row', row.idx)
					.addClass(k);

				$('td', created)
					.addClass(k)
					.html(r)[0].colSpan = _fnVisbleColumns(ctx);

				rows.push(created[0]);
			}
		};

		addRow(data, klass);

		if (row._details) {
			row._details.detach();
		}

		row._details = $(rows);

		// If the children were already shown, that state should be retained
		if (row._detailsShow) {
			row._details.insertAfter(row.nTr);
		}
	};


	// Make state saving of child row details async to allow them to be batch processed
	var __details_state = DataTable.util.throttle(
		function (ctx) {
			_fnSaveState(ctx[0])
		},
		500
	);


	var __details_remove = function (api, idx) {
		var ctx = api.context;

		if (ctx.length) {
			var row = ctx[0].aoData[idx !== undefined ? idx : api[0]];

			if (row && row._details) {
				row._details.remove();

				row._detailsShow = undefined;
				row._details = undefined;
				$(row.nTr).removeClass('dt-hasChild');
				__details_state(ctx);
			}
		}
	};


	var __details_display = function (api, show) {
		var ctx = api.context;

		if (ctx.length && api.length) {
			var row = ctx[0].aoData[api[0]];

			if (row._details) {
				row._detailsShow = show;

				if (show) {
					row._details.insertAfter(row.nTr);
					$(row.nTr).addClass('dt-hasChild');
				}
				else {
					row._details.detach();
					$(row.nTr).removeClass('dt-hasChild');
				}

				_fnCallbackFire(ctx[0], null, 'childRow', [show, api.row(api[0])])

				__details_events(ctx[0]);
				__details_state(ctx);
			}
		}
	};


	var __details_events = function (settings) {
		var api = new _Api(settings);
		var namespace = '.dt.DT_details';
		var drawEvent = 'draw' + namespace;
		var colvisEvent = 'column-sizing' + namespace;
		var destroyEvent = 'destroy' + namespace;
		var data = settings.aoData;

		api.off(drawEvent + ' ' + colvisEvent + ' ' + destroyEvent);

		if (_pluck(data, '_details').length > 0) {
			// On each draw, insert the required elements into the document
			api.on(drawEvent, function (e, ctx) {
				if (settings !== ctx) {
					return;
				}

				api.rows({ page: 'current' }).eq(0).each(function (idx) {
					// Internal data grab
					var row = data[idx];

					if (row._detailsShow) {
						row._details.insertAfter(row.nTr);
					}
				});
			});

			// Column visibility change - update the colspan
			api.on(colvisEvent, function (e, ctx) {
				if (settings !== ctx) {
					return;
				}

				// Update the colspan for the details rows (note, only if it already has
				// a colspan)
				var row, visible = _fnVisbleColumns(ctx);

				for (var i = 0, ien = data.length; i < ien; i++) {
					row = data[i];

					if (row && row._details) {
						row._details.each(function () {
							var el = $(this).children('td');

							if (el.length == 1) {
								el.attr('colspan', visible);
							}
						});
					}
				}
			});

			// Table destroyed - nuke any child rows
			api.on(destroyEvent, function (e, ctx) {
				if (settings !== ctx) {
					return;
				}

				for (var i = 0, ien = data.length; i < ien; i++) {
					if (data[i] && data[i]._details) {
						__details_remove(api, i);
					}
				}
			});
		}
	};

	// Strings for the method names to help minification
	var _emp = '';
	var _child_obj = _emp + 'row().child';
	var _child_mth = _child_obj + '()';

	// data can be:
	//  tr
	//  string
	//  jQuery or array of any of the above
	_api_register(_child_mth, function (data, klass) {
		var ctx = this.context;

		if (data === undefined) {
			// get
			return ctx.length && this.length && ctx[0].aoData[this[0]]
				? ctx[0].aoData[this[0]]._details
				: undefined;
		}
		else if (data === true) {
			// show
			this.child.show();
		}
		else if (data === false) {
			// remove
			__details_remove(this);
		}
		else if (ctx.length && this.length) {
			// set
			__details_add(ctx[0], ctx[0].aoData[this[0]], data, klass);
		}

		return this;
	});


	_api_register([
		_child_obj + '.show()',
		_child_mth + '.show()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display(this, true);
		return this;
	});


	_api_register([
		_child_obj + '.hide()',
		_child_mth + '.hide()' // only when `child()` was called with parameters (without
	], function () {         // it returns an object and this method is not executed)
		__details_display(this, false);
		return this;
	});


	_api_register([
		_child_obj + '.remove()',
		_child_mth + '.remove()' // only when `child()` was called with parameters (without
	], function () {           // it returns an object and this method is not executed)
		__details_remove(this);
		return this;
	});


	_api_register(_child_obj + '.isShown()', function () {
		var ctx = this.context;

		if (ctx.length && this.length) {
			// _detailsShown as false or undefined will fall through to return false
			return ctx[0].aoData[this[0]]._detailsShow || false;
		}
		return false;
	});



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Columns
	 *
	 * {integer}           - column index (>=0 count from left, <0 count from right)
	 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
	 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
	 * "{string}:name"     - column name
	 * "{string}"          - jQuery selector on column header nodes
	 *
	 */

	// can be an array of these items, comma separated list, or an array of comma
	// separated lists

	var __re_column_selector = /^([^:]+):(name|title|visIdx|visible)$/;


	// r1 and r2 are redundant - but it means that the parameters match for the
	// iterator callback in columns().data()
	var __columnData = function (settings, column, r1, r2, rows, type) {
		var a = [];
		for (var row = 0, ien = rows.length; row < ien; row++) {
			a.push(_fnGetCellData(settings, rows[row], column, type));
		}
		return a;
	};


	var __column_header = function (settings, column, row) {
		var header = settings.aoHeader;
		var target = row !== undefined
			? row
			: settings.bSortCellsTop // legacy support
				? 0
				: header.length - 1;

		return header[target][column].cell;
	};

	var __column_selector = function (settings, selector, opts) {
		var
			columns = settings.aoColumns,
			names = _pluck(columns, 'sName'),
			titles = _pluck(columns, 'sTitle'),
			cells = DataTable.util.get('[].[].cell')(settings.aoHeader),
			nodes = _unique(_flatten([], cells));

		var run = function (s) {
			var selInt = _intVal(s);

			// Selector - all
			if (s === '') {
				return _range(columns.length);
			}

			// Selector - index
			if (selInt !== null) {
				return [selInt >= 0 ?
					selInt : // Count from left
					columns.length + selInt // Count from right (+ because its a negative value)
				];
			}

			// Selector = function
			if (typeof s === 'function') {
				var rows = _selector_row_indexes(settings, opts);

				return columns.map(function (col, idx) {
					return s(
						idx,
						__columnData(settings, idx, 0, 0, rows),
						__column_header(settings, idx)
					) ? idx : null;
				});
			}

			// jQuery or string selector
			var match = typeof s === 'string' ?
				s.match(__re_column_selector) :
				'';

			if (match) {
				switch (match[2]) {
					case 'visIdx':
					case 'visible':
						var idx = parseInt(match[1], 10);
						// Visible index given, convert to column index
						if (idx < 0) {
							// Counting from the right
							var visColumns = columns.map(function (col, i) {
								return col.bVisible ? i : null;
							});
							return [visColumns[visColumns.length + idx]];
						}
						// Counting from the left
						return [_fnVisibleToColumnIndex(settings, idx)];

					case 'name':
						// match by name. `names` is column index complete and in order
						return names.map(function (name, i) {
							return name === match[1] ? i : null;
						});

					case 'title':
						// match by column title
						return titles.map(function (title, i) {
							return title === match[1] ? i : null;
						});

					default:
						return [];
				}
			}

			// Cell in the table body
			if (s.nodeName && s._DT_CellIndex) {
				return [s._DT_CellIndex.column];
			}

			// jQuery selector on the TH elements for the columns
			var jqResult = $(nodes)
				.filter(s)
				.map(function () {
					return _fnColumnsFromHeader(this); // `nodes` is column index complete and in order
				})
				.toArray();

			if (jqResult.length || !s.nodeName) {
				return jqResult;
			}

			// Otherwise a node which might have a `dt-column` data attribute, or be
			// a child or such an element
			var host = $(s).closest('*[data-dt-column]');
			return host.length ?
				[host.data('dt-column')] :
				[];
		};

		return _selector_run('column', selector, run, settings, opts);
	};


	var __setColumnVis = function (settings, column, vis) {
		var
			cols = settings.aoColumns,
			col = cols[column],
			data = settings.aoData,
			cells, i, ien, tr;

		// Get
		if (vis === undefined) {
			return col.bVisible;
		}

		// Set
		// No change
		if (col.bVisible === vis) {
			return false;
		}

		if (vis) {
			// Insert column
			// Need to decide if we should use appendChild or insertBefore
			var insertBefore = _pluck(cols, 'bVisible').indexOf(true, column + 1);

			for (i = 0, ien = data.length; i < ien; i++) {
				if (data[i]) {
					tr = data[i].nTr;
					cells = data[i].anCells;

					if (tr) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore(cells[column], cells[insertBefore] || null);
					}
				}
			}
		}
		else {
			// Remove column
			$(_pluck(settings.aoData, 'anCells', column)).detach();
		}

		// Common actions
		col.bVisible = vis;

		_colGroup(settings);

		return true;
	};


	_api_register('columns()', function (selector, opts) {
		// argument shifting
		if (selector === undefined) {
			selector = '';
		}
		else if ($.isPlainObject(selector)) {
			opts = selector;
			selector = '';
		}

		opts = _selector_opts(opts);

		var inst = this.iterator('table', function (settings) {
			return __column_selector(settings, selector, opts);
		}, 1);

		// Want argument shifting here and in _row_selector?
		inst.selector.cols = selector;
		inst.selector.opts = opts;

		return inst;
	});

	_api_registerPlural('columns().header()', 'column().header()', function (row) {
		return this.iterator('column', function (settings, column) {
			return __column_header(settings, column, row);
		}, 1);
	});

	_api_registerPlural('columns().footer()', 'column().footer()', function (row) {
		return this.iterator('column', function (settings, column) {
			var footer = settings.aoFooter;

			if (!footer.length) {
				return null;
			}

			return settings.aoFooter[row !== undefined ? row : 0][column].cell;
		}, 1);
	});

	_api_registerPlural('columns().data()', 'column().data()', function () {
		return this.iterator('column-rows', __columnData, 1);
	});

	_api_registerPlural('columns().render()', 'column().render()', function (type) {
		return this.iterator('column-rows', function (settings, column, i, j, rows) {
			return __columnData(settings, column, i, j, rows, type);
		}, 1);
	});

	_api_registerPlural('columns().dataSrc()', 'column().dataSrc()', function () {
		return this.iterator('column', function (settings, column) {
			return settings.aoColumns[column].mData;
		}, 1);
	});

	_api_registerPlural('columns().cache()', 'column().cache()', function (type) {
		return this.iterator('column-rows', function (settings, column, i, j, rows) {
			return _pluck_order(settings.aoData, rows,
				type === 'search' ? '_aFilterData' : '_aSortData', column
			);
		}, 1);
	});

	_api_registerPlural('columns().init()', 'column().init()', function () {
		return this.iterator('column', function (settings, column) {
			return settings.aoColumns[column];
		}, 1);
	});

	_api_registerPlural('columns().nodes()', 'column().nodes()', function () {
		return this.iterator('column-rows', function (settings, column, i, j, rows) {
			return _pluck_order(settings.aoData, rows, 'anCells', column);
		}, 1);
	});

	_api_registerPlural('columns().titles()', 'column().title()', function (title, row) {
		return this.iterator('column', function (settings, column) {
			// Argument shifting
			if (typeof title === 'number') {
				row = title;
				title = undefined;
			}

			var span = $('span.dt-column-title', this.column(column).header(row));

			if (title !== undefined) {
				span.html(title);
				return this;
			}

			return span.html();
		}, 1);
	});

	_api_registerPlural('columns().types()', 'column().type()', function () {
		return this.iterator('column', function (settings, column) {
			var type = settings.aoColumns[column].sType;

			// If the type was invalidated, then resolve it. This actually does
			// all columns at the moment. Would only happen once if getting all
			// column's data types.
			if (!type) {
				_fnColumnTypes(settings);
			}

			return type;
		}, 1);
	});

	_api_registerPlural('columns().visible()', 'column().visible()', function (vis, calc) {
		var that = this;
		var changed = [];
		var ret = this.iterator('column', function (settings, column) {
			if (vis === undefined) {
				return settings.aoColumns[column].bVisible;
			} // else

			if (__setColumnVis(settings, column, vis)) {
				changed.push(column);
			}
		});

		// Group the column visibility changes
		if (vis !== undefined) {
			this.iterator('table', function (settings) {
				// Redraw the header after changes
				_fnDrawHead(settings, settings.aoHeader);
				_fnDrawHead(settings, settings.aoFooter);

				// Update colspan for no records display. Child rows and extensions will use their own
				// listeners to do this - only need to update the empty table item here
				if (!settings.aiDisplay.length) {
					$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
				}

				_fnSaveState(settings);

				// Second loop once the first is done for events
				that.iterator('column', function (settings, column) {
					if (changed.includes(column)) {
						_fnCallbackFire(settings, null, 'column-visibility', [settings, column, vis, calc]);
					}
				});

				if (changed.length && (calc === undefined || calc)) {
					that.columns.adjust();
				}
			});
		}

		return ret;
	});

	_api_registerPlural('columns().widths()', 'column().width()', function () {
		// Injects a fake row into the table for just a moment so the widths can
		// be read, regardless of colspan in the header and rows being present in
		// the body
		var columns = this.columns(':visible').count();
		var row = $('<tr>').html('<td>' + Array(columns).join('</td><td>') + '</td>');

		$(this.table().body()).append(row);

		var widths = row.children().map(function () {
			return $(this).outerWidth();
		});

		row.remove();

		return this.iterator('column', function (settings, column) {
			var visIdx = _fnColumnIndexToVisible(settings, column);

			return visIdx !== null ? widths[visIdx] : 0;
		}, 1);
	});

	_api_registerPlural('columns().indexes()', 'column().index()', function (type) {
		return this.iterator('column', function (settings, column) {
			return type === 'visible' ?
				_fnColumnIndexToVisible(settings, column) :
				column;
		}, 1);
	});

	_api_register('columns.adjust()', function () {
		return this.iterator('table', function (settings) {
			_fnAdjustColumnSizing(settings);
		}, 1);
	});

	_api_register('column.index()', function (type, idx) {
		if (this.context.length !== 0) {
			var ctx = this.context[0];

			if (type === 'fromVisible' || type === 'toData') {
				return _fnVisibleToColumnIndex(ctx, idx);
			}
			else if (type === 'fromData' || type === 'toVisible') {
				return _fnColumnIndexToVisible(ctx, idx);
			}
		}
	});

	_api_register('column()', function (selector, opts) {
		return _selector_first(this.columns(selector, opts));
	});

	var __cell_selector = function (settings, selector, opts) {
		var data = settings.aoData;
		var rows = _selector_row_indexes(settings, opts);
		var cells = _removeEmpty(_pluck_order(data, rows, 'anCells'));
		var allCells = $(_flatten([], cells));
		var row;
		var columns = settings.aoColumns.length;
		var a, i, ien, j, o, host;

		var run = function (s) {
			var fnSelector = typeof s === 'function';

			if (s === null || s === undefined || fnSelector) {
				// All cells and function selectors
				a = [];

				for (i = 0, ien = rows.length; i < ien; i++) {
					row = rows[i];

					for (j = 0; j < columns; j++) {
						o = {
							row: row,
							column: j
						};

						if (fnSelector) {
							// Selector - function
							host = data[row];

							if (s(o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null)) {
								a.push(o);
							}
						}
						else {
							// Selector - all
							a.push(o);
						}
					}
				}

				return a;
			}

			// Selector - index
			if ($.isPlainObject(s)) {
				// Valid cell index and its in the array of selectable rows
				return s.column !== undefined && s.row !== undefined && rows.indexOf(s.row) !== -1 ?
					[s] :
					[];
			}

			// Selector - jQuery filtered cells
			var jqResult = allCells
				.filter(s)
				.map(function (i, el) {
					return { // use a new object, in case someone changes the values
						row: el._DT_CellIndex.row,
						column: el._DT_CellIndex.column
					};
				})
				.toArray();

			if (jqResult.length || !s.nodeName) {
				return jqResult;
			}

			// Otherwise the selector is a node, and there is one last option - the
			// element might be a child of an element which has dt-row and dt-column
			// data attributes
			host = $(s).closest('*[data-dt-row]');
			return host.length ?
				[{
					row: host.data('dt-row'),
					column: host.data('dt-column')
				}] :
				[];
		};

		return _selector_run('cell', selector, run, settings, opts);
	};




	_api_register('cells()', function (rowSelector, columnSelector, opts) {
		// Argument shifting
		if ($.isPlainObject(rowSelector)) {
			// Indexes
			if (rowSelector.row === undefined) {
				// Selector options in first parameter
				opts = rowSelector;
				rowSelector = null;
			}
			else {
				// Cell index objects in first parameter
				opts = columnSelector;
				columnSelector = null;
			}
		}
		if ($.isPlainObject(columnSelector)) {
			opts = columnSelector;
			columnSelector = null;
		}

		// Cell selector
		if (columnSelector === null || columnSelector === undefined) {
			return this.iterator('table', function (settings) {
				return __cell_selector(settings, rowSelector, _selector_opts(opts));
			});
		}

		// The default built in options need to apply to row and columns
		var internalOpts = opts ? {
			page: opts.page,
			order: opts.order,
			search: opts.search
		} : {};

		// Row + column selector
		var columns = this.columns(columnSelector, internalOpts);
		var rows = this.rows(rowSelector, internalOpts);
		var i, ien, j, jen;

		var cellsNoOpts = this.iterator('table', function (settings, idx) {
			var a = [];

			for (i = 0, ien = rows[idx].length; i < ien; i++) {
				for (j = 0, jen = columns[idx].length; j < jen; j++) {
					a.push({
						row: rows[idx][i],
						column: columns[idx][j]
					});
				}
			}

			return a;
		}, 1);

		// There is currently only one extension which uses a cell selector extension
		// It is a _major_ performance drag to run this if it isn't needed, so this is
		// an extension specific check at the moment
		var cells = opts && opts.selected ?
			this.cells(cellsNoOpts, opts) :
			cellsNoOpts;

		$.extend(cells.selector, {
			cols: columnSelector,
			rows: rowSelector,
			opts: opts
		});

		return cells;
	});


	_api_registerPlural('cells().nodes()', 'cell().node()', function () {
		return this.iterator('cell', function (settings, row, column) {
			var data = settings.aoData[row];

			return data && data.anCells ?
				data.anCells[column] :
				undefined;
		}, 1);
	});


	_api_register('cells().data()', function () {
		return this.iterator('cell', function (settings, row, column) {
			return _fnGetCellData(settings, row, column);
		}, 1);
	});


	_api_registerPlural('cells().cache()', 'cell().cache()', function (type) {
		type = type === 'search' ? '_aFilterData' : '_aSortData';

		return this.iterator('cell', function (settings, row, column) {
			return settings.aoData[row][type][column];
		}, 1);
	});


	_api_registerPlural('cells().render()', 'cell().render()', function (type) {
		return this.iterator('cell', function (settings, row, column) {
			return _fnGetCellData(settings, row, column, type);
		}, 1);
	});


	_api_registerPlural('cells().indexes()', 'cell().index()', function () {
		return this.iterator('cell', function (settings, row, column) {
			return {
				row: row,
				column: column,
				columnVisible: _fnColumnIndexToVisible(settings, column)
			};
		}, 1);
	});


	_api_registerPlural('cells().invalidate()', 'cell().invalidate()', function (src) {
		return this.iterator('cell', function (settings, row, column) {
			_fnInvalidate(settings, row, src, column);
		});
	});



	_api_register('cell()', function (rowSelector, columnSelector, opts) {
		return _selector_first(this.cells(rowSelector, columnSelector, opts));
	});


	_api_register('cell().data()', function (data) {
		var ctx = this.context;
		var cell = this[0];

		if (data === undefined) {
			// Get
			return ctx.length && cell.length ?
				_fnGetCellData(ctx[0], cell[0].row, cell[0].column) :
				undefined;
		}

		// Set
		_fnSetCellData(ctx[0], cell[0].row, cell[0].column, data);
		_fnInvalidate(ctx[0], cell[0].row, 'data', cell[0].column);

		return this;
	});



	/**
	 * Get current ordering (sorting) that has been applied to the table.
	 *
	 * @returns {array} 2D array containing the sorting information for the first
	 *   table in the current context. Each element in the parent array represents
	 *   a column being sorted upon (i.e. multi-sorting with two columns would have
	 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
	 *   the column index that the sorting condition applies to, the second is the
	 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
	 *   index of the sorting order from the `column.sorting` initialisation array.
	 *//**
	* Set the ordering for the table.
	*
	* @param {integer} order Column index to sort upon.
	* @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
	* @returns {DataTables.Api} this
	*//**
	* Set the ordering for the table.
	*
	* @param {array} order 1D array of sorting information to be applied.
	* @param {array} [...] Optional additional sorting conditions
	* @returns {DataTables.Api} this
	*//**
	* Set the ordering for the table.
	*
	* @param {array} order 2D array of sorting information to be applied.
	* @returns {DataTables.Api} this
	*/
	_api_register('order()', function (order, dir) {
		var ctx = this.context;
		var args = Array.prototype.slice.call(arguments);

		if (order === undefined) {
			// get
			return ctx.length !== 0 ?
				ctx[0].aaSorting :
				undefined;
		}

		// set
		if (typeof order === 'number') {
			// Simple column / direction passed in
			order = [[order, dir]];
		}
		else if (args.length > 1) {
			// Arguments passed in (list of 1D arrays)
			order = args;
		}
		// otherwise a 2D array was passed in

		return this.iterator('table', function (settings) {
			settings.aaSorting = Array.isArray(order) ? order.slice() : order;
		});
	});


	/**
	 * Attach a sort listener to an element for a given column
	 *
	 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
	 *   listener to. This can take the form of a single DOM node, a jQuery
	 *   collection of nodes or a jQuery selector which will identify the node(s).
	 * @param {integer} column the column that a click on this node will sort on
	 * @param {function} [callback] callback function when sort is run
	 * @returns {DataTables.Api} this
	 */
	_api_register('order.listener()', function (node, column, callback) {
		return this.iterator('table', function (settings) {
			_fnSortAttachListener(settings, node, {}, column, callback);
		});
	});


	_api_register('order.fixed()', function (set) {
		if (!set) {
			var ctx = this.context;
			var fixed = ctx.length ?
				ctx[0].aaSortingFixed :
				undefined;

			return Array.isArray(fixed) ?
				{ pre: fixed } :
				fixed;
		}

		return this.iterator('table', function (settings) {
			settings.aaSortingFixed = $.extend(true, {}, set);
		});
	});


	// Order by the selected column(s)
	_api_register([
		'columns().order()',
		'column().order()'
	], function (dir) {
		var that = this;

		if (!dir) {
			return this.iterator('column', function (settings, idx) {
				var sort = _fnSortFlatten(settings);

				for (var i = 0, ien = sort.length; i < ien; i++) {
					if (sort[i].col === idx) {
						return sort[i].dir;
					}
				}

				return null;
			}, 1);
		}
		else {
			return this.iterator('table', function (settings, i) {
				settings.aaSorting = that[i].map(function (col) {
					return [col, dir];
				});
			});
		}
	});

	_api_registerPlural('columns().orderable()', 'column().orderable()', function (directions) {
		return this.iterator('column', function (settings, idx) {
			var col = settings.aoColumns[idx];

			return directions ?
				col.asSorting :
				col.bSortable;
		}, 1);
	});


	_api_register('processing()', function (show) {
		return this.iterator('table', function (ctx) {
			_fnProcessingDisplay(ctx, show);
		});
	});


	_api_register('search()', function (input, regex, smart, caseInsen) {
		var ctx = this.context;

		if (input === undefined) {
			// get
			return ctx.length !== 0 ?
				ctx[0].oPreviousSearch.search :
				undefined;
		}

		// set
		return this.iterator('table', function (settings) {
			if (!settings.oFeatures.bFilter) {
				return;
			}

			if (typeof regex === 'object') {
				// New style options to pass to the search builder
				_fnFilterComplete(settings, $.extend(settings.oPreviousSearch, regex, {
					search: input
				}));
			}
			else {
				// Compat for the old options
				_fnFilterComplete(settings, $.extend(settings.oPreviousSearch, {
					search: input,
					regex: regex === null ? false : regex,
					smart: smart === null ? true : smart,
					caseInsensitive: caseInsen === null ? true : caseInsen
				}));
			}
		});
	});

	_api_register('search.fixed()', function (name, search) {
		var ret = this.iterator(true, 'table', function (settings) {
			var fixed = settings.searchFixed;

			if (!name) {
				return Object.keys(fixed)
			}
			else if (search === undefined) {
				return fixed[name];
			}
			else if (search === null) {
				delete fixed[name];
			}
			else {
				fixed[name] = search;
			}

			return this;
		});

		return name !== undefined && search === undefined
			? ret[0]
			: ret;
	});

	_api_registerPlural(
		'columns().search()',
		'column().search()',
		function (input, regex, smart, caseInsen) {
			return this.iterator('column', function (settings, column) {
				var preSearch = settings.aoPreSearchCols;

				if (input === undefined) {
					// get
					return preSearch[column].search;
				}

				// set
				if (!settings.oFeatures.bFilter) {
					return;
				}

				if (typeof regex === 'object') {
					// New style options to pass to the search builder
					$.extend(preSearch[column], regex, {
						search: input
					});
				}
				else {
					// Old style (with not all options available)
					$.extend(preSearch[column], {
						search: input,
						regex: regex === null ? false : regex,
						smart: smart === null ? true : smart,
						caseInsensitive: caseInsen === null ? true : caseInsen
					});
				}

				_fnFilterComplete(settings, settings.oPreviousSearch);
			});
		}
	);

	_api_register([
		'columns().search.fixed()',
		'column().search.fixed()'
	],
		function (name, search) {
			var ret = this.iterator(true, 'column', function (settings, colIdx) {
				var fixed = settings.aoColumns[colIdx].searchFixed;

				if (!name) {
					return Object.keys(fixed)
				}
				else if (search === undefined) {
					return fixed[name];
				}
				else if (search === null) {
					delete fixed[name];
				}
				else {
					fixed[name] = search;
				}

				return this;
			});

			return name !== undefined && search === undefined
				? ret[0]
				: ret;
		}
	);
	/*
	 * State API methods
	 */

	_api_register('state()', function (set, ignoreTime) {
		// getter
		if (!set) {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		}

		var setMutate = $.extend(true, {}, set);

		// setter
		return this.iterator('table', function (settings) {
			if (ignoreTime !== false) {
				setMutate.time = +new Date() + 100;
			}

			_fnImplementState(settings, setMutate, function () { });
		});
	});


	_api_register('state.clear()', function () {
		return this.iterator('table', function (settings) {
			// Save an empty object
			settings.fnStateSaveCallback.call(settings.oInstance, settings, {});
		});
	});


	_api_register('state.loaded()', function () {
		return this.context.length ?
			this.context[0].oLoadedState :
			null;
	});


	_api_register('state.save()', function () {
		return this.iterator('table', function (settings) {
			_fnSaveState(settings);
		});
	});

	/**
	 * Set the jQuery or window object to be used by DataTables
	 *
	 * @param {*} module Library / container object
	 * @param {string} [type] Library or container type `lib`, `win` or `datetime`.
	 *   If not provided, automatic detection is attempted.
	 */
	DataTable.use = function (module, type) {
		if (type === 'lib' || module.fn) {
			$ = module;
		}
		else if (type == 'win' || module.document) {
			window = module;
			document = module.document;
		}
		else if (type === 'datetime' || module.type === 'DateTime') {
			DataTable.DateTime = module;
		}
	}

	/**
	 * CommonJS factory function pass through. This will check if the arguments
	 * given are a window object or a jQuery object. If so they are set
	 * accordingly.
	 * @param {*} root Window
	 * @param {*} jq jQUery
	 * @returns {boolean} Indicator
	 */
	DataTable.factory = function (root, jq) {
		var is = false;

		// Test if the first parameter is a window object
		if (root && root.document) {
			window = root;
			document = root.document;
		}

		// Test if the second parameter is a jQuery object
		if (jq && jq.fn && jq.fn.jquery) {
			$ = jq;
			is = true;
		}

		return is;
	}

	/**
	 * Provide a common method for plug-ins to check the version of DataTables being
	 * used, in order to ensure compatibility.
	 *
	 *  @param {string} version Version string to check for, in the format "X.Y.Z".
	 *    Note that the formats "X" and "X.Y" are also acceptable.
	 *  @param {string} [version2=current DataTables version] As above, but optional.
	 *   If not given the current DataTables version will be used.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to
	 *    the required version, or false if this version of DataTales is not
	 *    suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
	 */
	DataTable.versionCheck = function (version, version2) {
		var aThis = version2 ?
			version2.split('.') :
			DataTable.version.split('.');
		var aThat = version.split('.');
		var iThis, iThat;

		for (var i = 0, iLen = aThat.length; i < iLen; i++) {
			iThis = parseInt(aThis[i], 10) || 0;
			iThat = parseInt(aThat[i], 10) || 0;

			// Parts are the same, keep comparing
			if (iThis === iThat) {
				continue;
			}

			// Parts are different, return immediately
			return iThis > iThat;
		}

		return true;
	};


	/**
	 * Check if a `<table>` node is a DataTable table already or not.
	 *
	 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
	 *      selector for the table to test. Note that if more than more than one
	 *      table is passed on, only the first will be checked
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
	 *      $('#example').dataTable();
	 *    }
	 */
	DataTable.isDataTable = function (table) {
		var t = $(table).get(0);
		var is = false;

		if (table instanceof DataTable.Api) {
			return true;
		}

		$.each(DataTable.settings, function (i, o) {
			var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
			var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;

			if (o.nTable === t || head === t || foot === t) {
				is = true;
			}
		});

		return is;
	};


	/**
	 * Get all DataTable tables that have been initialised - optionally you can
	 * select to get only currently visible tables.
	 *
	 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
	 *    or visible tables only.
	 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
	 *    DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    $.each( $.fn.dataTable.tables(true), function () {
	 *      $(table).DataTable().columns.adjust();
	 *    } );
	 */
	DataTable.tables = function (visible) {
		var api = false;

		if ($.isPlainObject(visible)) {
			api = visible.api;
			visible = visible.visible;
		}

		var a = DataTable.settings
			.filter(function (o) {
				return !visible || (visible && $(o.nTable).is(':visible'))
					? true
					: false;
			})
			.map(function (o) {
				return o.nTable;
			});

		return api ?
			new _Api(a) :
			a;
	};


	/**
	 * Convert from camel case parameters to Hungarian notation. This is made public
	 * for the extensions to provide the same ability as DataTables core to accept
	 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
	 * parameters.
	 *
	 *  @param {object} src The model object which holds all parameters that can be
	 *    mapped.
	 *  @param {object} user The object to convert from camel case to Hungarian.
	 *  @param {boolean} force When set to `true`, properties which already have a
	 *    Hungarian value in the `user` object will be overwritten. Otherwise they
	 *    won't be.
	 */
	DataTable.camelToHungarian = _fnCamelToHungarian;



	/**
	 *
	 */
	_api_register('$()', function (selector, opts) {
		var
			rows = this.rows(opts).nodes(), // Get all rows
			jqRows = $(rows);

		return $([].concat(
			jqRows.filter(selector).toArray(),
			jqRows.find(selector).toArray()
		));
	});


	// jQuery functions to operate on the tables
	$.each(['on', 'one', 'off'], function (i, key) {
		_api_register(key + '()', function ( /* event, handler */) {
			var args = Array.prototype.slice.call(arguments);

			// Add the `dt` namespace automatically if it isn't already present
			args[0] = args[0].split(/\s/).map(function (e) {
				return !e.match(/\.dt\b/) ?
					e + '.dt' :
					e;
			}).join(' ');

			var inst = $(this.tables().nodes());
			inst[key].apply(inst, args);
			return this;
		});
	});


	_api_register('clear()', function () {
		return this.iterator('table', function (settings) {
			_fnClearTable(settings);
		});
	});


	_api_register('error()', function (msg) {
		return this.iterator('table', function (settings) {
			_fnLog(settings, 0, msg);
		});
	});


	_api_register('settings()', function () {
		return new _Api(this.context, this.context);
	});


	_api_register('init()', function () {
		var ctx = this.context;
		return ctx.length ? ctx[0].oInit : null;
	});


	_api_register('data()', function () {
		return this.iterator('table', function (settings) {
			return _pluck(settings.aoData, '_aData');
		}).flatten();
	});


	_api_register('trigger()', function (name, args, bubbles) {
		return this.iterator('table', function (settings) {
			return _fnCallbackFire(settings, null, name, args, bubbles);
		}).flatten();
	});


	_api_register('ready()', function (fn) {
		var ctx = this.context;

		// Get status of first table
		if (!fn) {
			return ctx.length
				? (ctx[0]._bInitComplete || false)
				: null;
		}

		// Function to run either once the table becomes ready or
		// immediately if it is already ready.
		return this.tables().every(function () {
			if (this.context[0]._bInitComplete) {
				fn.call(this);
			}
			else {
				this.on('init', function () {
					fn.call(this);
				});
			}
		});
	});


	_api_register('destroy()', function (remove) {
		remove = remove || false;

		return this.iterator('table', function (settings) {
			var classes = settings.oClasses;
			var table = settings.nTable;
			var tbody = settings.nTBody;
			var thead = settings.nTHead;
			var tfoot = settings.nTFoot;
			var jqTable = $(table);
			var jqTbody = $(tbody);
			var jqWrapper = $(settings.nTableWrapper);
			var rows = settings.aoData.map(function (r) { return r ? r.nTr : null; });
			var orderClasses = classes.order;

			// Flag to note that the table is currently being destroyed - no action
			// should be taken
			settings.bDestroying = true;

			// Fire off the destroy callbacks for plug-ins etc
			_fnCallbackFire(settings, "aoDestroyCallback", "destroy", [settings], true);

			// If not being removed from the document, make all columns visible
			if (!remove) {
				new _Api(settings).columns().visible(true);
			}

			// Blitz all `DT` namespaced events (these are internal events, the
			// lowercase, `dt` events are user subscribed and they are responsible
			// for removing them
			jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
			$(window).off('.DT-' + settings.sInstance);

			// When scrolling we had to break the table up - restore it
			if (table != thead.parentNode) {
				jqTable.children('thead').detach();
				jqTable.append(thead);
			}

			if (tfoot && table != tfoot.parentNode) {
				jqTable.children('tfoot').detach();
				jqTable.append(tfoot);
			}

			settings.colgroup.remove();

			settings.aaSorting = [];
			settings.aaSortingFixed = [];
			_fnSortingClasses(settings);

			$('th, td', thead)
				.removeClass(
					orderClasses.canAsc + ' ' +
					orderClasses.canDesc + ' ' +
					orderClasses.isAsc + ' ' +
					orderClasses.isDesc
				)
				.css('width', '');

			// Add the TR elements back into the table in their original order
			jqTbody.children().detach();
			jqTbody.append(rows);

			var orig = settings.nTableWrapper.parentNode;
			var insertBefore = settings.nTableWrapper.nextSibling;

			// Remove the DataTables generated nodes, events and classes
			var removedMethod = remove ? 'remove' : 'detach';
			jqTable[removedMethod]();
			jqWrapper[removedMethod]();

			// If we need to reattach the table to the document
			if (!remove && orig) {
				// insertBefore acts like appendChild if !arg[1]
				orig.insertBefore(table, insertBefore);

				// Restore the width of the original table - was read from the style property,
				// so we can restore directly to that
				jqTable
					.css('width', settings.sDestroyWidth)
					.removeClass(classes.table);
			}

			/* Remove the settings object from the settings array */
			var idx = DataTable.settings.indexOf(settings);
			if (idx !== -1) {
				DataTable.settings.splice(idx, 1);
			}
		});
	});


	// Add the `every()` method for rows, columns and cells in a compact form
	$.each(['column', 'row', 'cell'], function (i, type) {
		_api_register(type + 's().every()', function (fn) {
			var opts = this.selector.opts;
			var api = this;
			var inst;
			var counter = 0;

			return this.iterator('every', function (settings, selectedIdx, tableIdx) {
				inst = api[type](selectedIdx, opts);

				if (type === 'cell') {
					fn.call(inst, inst[0][0].row, inst[0][0].column, tableIdx, counter);
				}
				else {
					fn.call(inst, selectedIdx, tableIdx, counter);
				}

				counter++;
			});
		});
	});


	// i18n method for extensions to be able to use the language object from the
	// DataTable
	_api_register('i18n()', function (token, def, plural) {
		var ctx = this.context[0];
		var resolved = _fnGetObjectDataFn(token)(ctx.oLanguage);

		if (resolved === undefined) {
			resolved = def;
		}

		if ($.isPlainObject(resolved)) {
			resolved = plural !== undefined && resolved[plural] !== undefined ?
				resolved[plural] :
				resolved._;
		}

		return typeof resolved === 'string'
			? resolved.replace('%d', plural) // nb: plural might be undefined,
			: resolved;
	});

	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
	 * only for non-release builds. See https://semver.org/ for more information.
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "2.0.5";

	/**
	 * Private data store, containing all of the settings objects that are
	 * created for the tables on a given page.
	 *
	 * Note that the `DataTable.settings` object is aliased to
	 * `jQuery.fn.dataTableExt` through which it may be accessed and
	 * manipulated, or `jQuery.fn.dataTable.settings`.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];

	/**
	 * Object models container, for the various models that DataTables has
	 * available to it. These models define the objects that are used to hold
	 * the active state and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};



	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 */
		"caseInsensitive": true,

		/**
		 * Applied search term
		 */
		"search": "",

		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 */
		"regex": false,

		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 */
		"smart": true,

		/**
		 * Flag to indicate if DataTables should only trigger a search when
		 * the return key is pressed.
		 */
		"return": false
	};




	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 */
		"nTr": null,

		/**
		 * Array of TD elements for each row. This is null until the row has been
		 * created.
		 */
		"anCells": null,

		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data
		 * source.
		 */
		"_aData": [],

		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 */
		"_aSortData": null,

		/**
		 * Per cell filtering data cache. As per the sort data cache, used to
		 * increase the performance of the filtering in DataTables
		 */
		"_aFilterData": null,

		/**
		 * Filtering data cache. This is the same as the cell filtering cache, but
		 * in this case a string rather than an array. This is easily computed with
		 * a join on `_aFilterData`, but is provided as a cache so the join isn't
		 * needed on every search (memory traded for performance)
		 */
		"_sFilterRow": null,

		/**
		 * Denote if the original data source was from the DOM, or the data source
		 * object. This is used for invalidating data, so DataTables can
		 * automatically read data from the original source, unless uninstructed
		 * otherwise.
		 */
		"src": null,

		/**
		 * Index in the aoData array. This saves an indexOf lookup when we have the
		 * object, but want to know the index
		 */
		"idx": -1,

		/**
		 * Cached display value
		 */
		displayData: null
	};


	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 *
	 * Note that this object is related to {@link DataTable.defaults.column}
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * Column index.
		 */
		"idx": null,

		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 */
		"aDataSort": null,

		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 */
		"asSorting": null,

		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 */
		"bSearchable": null,

		/**
		 * Flag to indicate if the column is sortable or not.
		 */
		"bSortable": null,

		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 */
		"bVisible": null,

		/**
		 * Store for manual type assignment using the `column.type` option. This
		 * is held in store so we can manipulate the column's `sType` property.
		 */
		"_sManualType": null,

		/**
		 * Flag to indicate if HTML5 data attributes should be used as the data
		 * source for filtering or sorting. True is either are.
		 */
		"_bAttrSrc": false,

		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,

		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column
		 * initialisation method
		 */
		"fnGetData": null,

		/**
		 * Function to set data for a cell in the column. You should <b>never</b>
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 */
		"fnSetData": null,

		/**
		 * Property to read the value for the cells in the column from the data
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 */
		"mData": null,

		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 */
		"mRender": null,

		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 */
		"sClass": null,

		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 */
		"sContentPadding": null,

		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,

		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 */
		"sName": null,

		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 */
		"sSortDataType": 'std',

		/**
		 * Class to be applied to the header element when sorting on this column
		 */
		"sSortingClass": null,

		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 */
		"sTitle": null,

		/**
		 * Column sorting and filtering type
		 */
		"sType": null,

		/**
		 * Width of the column
		 */
		"sWidth": null,

		/**
		 * Width of the column when it was first "encountered"
		 */
		"sWidthOrig": null,

		/** Cached string which is the longest in the column */
		maxLenString: null,

		/**
		 * Store for named searches
		 */
		searchFixed: null
	};


	/*
	 * Developer note: The properties of the object below are given in Hungarian
	 * notation, that was used as the interface for DataTables prior to v1.10, however
	 * from v1.10 onwards the primary interface is camel case. In order to avoid
	 * breaking backwards compatibility utterly with this change, the Hungarian
	 * version is still, internally the primary interface, but is is not documented
	 * - hence the @name tags in each doc comment. This allows a Javascript function
	 * to create a map from Hungarian notation to camel case (going the other direction
	 * would require each property to be listed, which would add around 3K to the size
	 * of DataTables, while this method is about a 0.5K hit).
	 *
	 * Ultimately this does pave the way for Hungarian notation to be dropped
	 * completely, but that is a massive amount of work and will break current
	 * installs (therefore is on-hold until v2).
	 */

	/**
	 * Initialisation options that can be given to DataTables at initialisation
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 */
		"aaData": null,


		/**
		 * If ordering is enabled, then DataTables will perform a first pass sort on
		 * initialisation. You can define which column(s) the sort is performed
		 * upon, and the sorting direction, with this variable. The `sorting` array
		 * should contain an array for each column to be sorted initially containing
		 * the column's index and a direction string ('asc' or 'desc').
		 */
		"aaSorting": [[0, 'asc']],


		/**
		 * This parameter is basically identical to the `sorting` parameter, but
		 * cannot be overridden by user interaction with the table. What this means
		 * is that you could have a column (visible or hidden) which the sorting
		 * will always be forced on first - any sorting after that (from the user)
		 * will then be performed as required. This can be useful for grouping rows
		 * together.
		 */
		"aaSortingFixed": [],


		/**
		 * DataTables can be instructed to load data to display in the table from a
		 * Ajax source. This option defines how that Ajax call is made and where to.
		 *
		 * The `ajax` property has three different modes of operation, depending on
		 * how it is defined. These are:
		 *
		 * * `string` - Set the URL from where the data should be loaded from.
		 * * `object` - Define properties for `jQuery.ajax`.
		 * * `function` - Custom data get function
		 *
		 * `string`
		 * --------
		 *
		 * As a string, the `ajax` property simply defines the URL from which
		 * DataTables will load data.
		 *
		 * `object`
		 * --------
		 *
		 * As an object, the parameters in the object are passed to
		 * [jQuery.ajax](https://api.jquery.com/jQuery.ajax/) allowing fine control
		 * of the Ajax request. DataTables has a number of default parameters which
		 * you can override using this option. Please refer to the jQuery
		 * documentation for a full description of the options available, although
		 * the following parameters provide additional options in DataTables or
		 * require special consideration:
		 *
		 * * `data` - As with jQuery, `data` can be provided as an object, but it
		 *   can also be used as a function to manipulate the data DataTables sends
		 *   to the server. The function takes a single parameter, an object of
		 *   parameters with the values that DataTables has readied for sending. An
		 *   object may be returned which will be merged into the DataTables
		 *   defaults, or you can add the items to the object that was passed in and
		 *   not return anything from the function. This supersedes `fnServerParams`
		 *   from DataTables 1.9-.
		 *
		 * * `dataSrc` - By default DataTables will look for the property `data` (or
		 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
		 *   from an Ajax source or for server-side processing - this parameter
		 *   allows that property to be changed. You can use Javascript dotted
		 *   object notation to get a data source for multiple levels of nesting, or
		 *   it my be used as a function. As a function it takes a single parameter,
		 *   the JSON returned from the server, which can be manipulated as
		 *   required, with the returned value being that used by DataTables as the
		 *   data source for the table.
		 *
		 * * `success` - Should not be overridden it is used internally in
		 *   DataTables. To manipulate / transform the data returned by the server
		 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
		 *
		 * `function`
		 * ----------
		 *
		 * As a function, making the Ajax call is left up to yourself allowing
		 * complete control of the Ajax request. Indeed, if desired, a method other
		 * than Ajax could be used to obtain the required data, such as Web storage
		 * or an AIR database.
		 *
		 * The function is given four parameters and no return is required. The
		 * parameters are:
		 *
		 * 1. _object_ - Data to send to the server
		 * 2. _function_ - Callback function that must be executed when the required
		 *    data has been obtained. That data should be passed into the callback
		 *    as the only parameter
		 * 3. _object_ - DataTables settings object for the table
		 */
		"ajax": null,


		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be
		 * either a 1D array of options which will be used for both the displayed
		 * option and the value, or a 2D array which will use the array in the first
		 * position as the value, and the array in the second position as the
		 * displayed options (useful for language strings such as 'All').
		 *
		 * Note that the `pageLength` property will be automatically set to the
		 * first value given in this array, unless `pageLength` is also provided.
		 */
		"aLengthMenu": [10, 25, 50, 100],


		/**
		 * The `columns` option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see
		 * {@link DataTable.defaults.column}. Note that if you use `columns` to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 */
		"aoColumns": null,

		/**
		 * Very similar to `columns`, `columnDefs` allows you to target a specific
		 * column, multiple columns, or all columns, using the `targets` property of
		 * each object in the array. This allows great flexibility when creating
		 * tables, as the `columnDefs` arrays can be of any length, targeting the
		 * columns you specifically want. `columnDefs` may use any of the column
		 * options available: {@link DataTable.defaults.column}, but it _must_
		 * have `targets` defined in each object in the array. Values in the `targets`
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 */
		"aoColumnDefs": null,


		/**
		 * Basically the same as `search`, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size
		 * as the number of columns, and each element be an object with the parameters
		 * `search` and `escapeRegex` (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 */
		"aoSearchCols": [],


		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using `columns`.
		 */
		"bAutoWidth": true,


		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 */
		"bDeferRender": true,


		/**
		 * Replace a DataTable which matches the given selector and replace it with
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 */
		"bDestroy": false,


		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.dom}.
		 */
		"bFilter": true,

		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bInfo": true,

		/**
		 * Used only for compatiblity with DT1
		 * @deprecated
		 */
		"bLengthChange": true,

		/**
		 * Enable or disable pagination.
		 */
		"bPaginate": true,


		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 */
		"bProcessing": false,


		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). `destroy` can be used to reinitialise a table if
		 * you need.
		 */
		"bRetrieve": false,


		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 */
		"bScrollCollapse": false,


		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * `ajax` parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 */
		"bServerSide": false,


		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the `sortable` option for each column.
		 */
		"bSort": true,


		/**
		 * Enable or display DataTables' ability to sort multiple columns at the
		 * same time (activated by shift-click by the user).
		 */
		"bSortMulti": true,


		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 */
		"bSortCellsTop": null,


		/**
		 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
		 * `sorting\_3` to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 */
		"bSortClasses": true,


		/**
		 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
		 * used to save table display information such as pagination information,
		 * display length, filtering and sorting. As such when the end user reloads
		 * the page the display display will match what thy had previously set up.
		 */
		"bStateSave": false,


		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 */
		"fnCreatedRow": null,


		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 */
		"fnDrawCallback": null,


		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' event.
		 */
		"fnFooterCallback": null,


		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 */
		"fnFormatNumber": function (toFormat) {
			return toFormat.toString().replace(
				/\B(?=(\d{3})+(?!\d))/g,
				this.oLanguage.sThousands
			);
		},


		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 */
		"fnHeaderCallback": null,


		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 */
		"fnInfoCallback": null,


		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 */
		"fnInitComplete": null,


		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 */
		"fnPreDrawCallback": null,


		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 */
		"fnRowCallback": null,


		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateLoadCallback": function (settings) {
			try {
				return JSON.parse(
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
						'DataTables_' + settings.sInstance + '_' + location.pathname
					)
				);
			} catch (e) {
				return {};
			}
		},


		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for
		 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
		 * a plug-in.
		 */
		"fnStateLoadParams": null,


		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 */
		"fnStateLoaded": null,


		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored By default DataTables will use `localStorage`
		 * but you might wish to use a server-side database or cookies.
		 */
		"fnStateSaveCallback": function (settings, data) {
			try {
				(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
					'DataTables_' + settings.sInstance + '_' + location.pathname,
					JSON.stringify(data)
				);
			} catch (e) {
				// noop
			}
		},


		/**
		 * Callback which allows modification of the state to be saved. Called when the table
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or
		 * other state properties or modification. Note that for plug-in authors, you should
		 * use the `stateSaveParams` event to save parameters for a plug-in.
		 */
		"fnStateSaveParams": null,


		/**
		 * Duration for which the saved state information is considered valid. After this period
		 * has elapsed the state will be returned to the default.
		 * Value is given in seconds.
		 */
		"iStateDuration": 7200,


		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (`lengthChange`) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 */
		"iDisplayLength": 10,


		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 */
		"iDisplayStart": 0,


		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a `tabindex` attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 */
		"iTabIndex": 0,


		/**
		 * Classes that DataTables assigns to the various components and features
		 * that it adds to the HTML table. This allows classes to be configured
		 * during initialisation in addition to through the static
		 * {@link DataTable.ext.oStdClasses} object).
		 */
		"oClasses": {},


		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be sorted
				 */
				"orderable": ": Activate to sort",

				/**
				 * ARIA label that is added to the table headers when the column is currently being sorted
				 */
				"orderableReverse": ": Activate to invert sorting",

				/**
				 * ARIA label that is added to the table headers when the column is currently being 
				 * sorted and next step is to remove sorting
				 */
				"orderableRemove": ": Activate to remove sorting",

				paginate: {
					first: 'First',
					last: 'Last',
					next: 'Next',
					previous: 'Previous'
				}
			},

			/**
			 * Pagination string used by DataTables for the built-in pagination
			 * control types.
			 */
			"oPaginate": {
				/**
				 * Label and character for first page button («)
				 */
				"sFirst": "\u00AB",

				/**
				 * Last page button (»)
				 */
				"sLast": "\u00BB",

				/**
				 * Next page button (›)
				 */
				"sNext": "\u203A",

				/**
				 * Previous page button (‹)
				 */
				"sPrevious": "\u2039",
			},

			/**
			 * Plural object for the data type the table is showing
			 */
			entries: {
				_: "entries",
				1: "entry"
			},

			/**
			 * This string is shown in preference to `zeroRecords` when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of `zeroRecords` will be used
			 * instead (either the default or given value).
			 */
			"sEmptyTable": "No data available in table",


			/**
			 * This string gives information to the end user about the information
			 * that is current on display on the page. The following tokens can be
			 * used in the string and will be dynamically replaced as the table
			 * display updates. This tokens can be placed anywhere in the string, or
			 * removed as needed by the language requires:
			 *
			 * * `\_START\_` - Display index of the first record on the current page
			 * * `\_END\_` - Display index of the last record on the current page
			 * * `\_TOTAL\_` - Number of records in the table after filtering
			 * * `\_MAX\_` - Number of records in the table without filtering
			 * * `\_PAGE\_` - Current page number
			 * * `\_PAGES\_` - Total number of pages of data in the table
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ _ENTRIES-TOTAL_",


			/**
			 * Display information string for when the table is empty. Typically the
			 * format of this string should match `info`.
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 _ENTRIES-TOTAL_",


			/**
			 * When a user filters the information in a table, this string is appended
			 * to the information (`info`) to give an idea of how strong the filtering
			 * is. The variable _MAX_ is dynamically updated.
			 */
			"sInfoFiltered": "(filtered from _MAX_ total _ENTRIES-MAX_)",


			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
			 * being used) at all times.
			 */
			"sInfoPostFix": "",


			/**
			 * This decimal place operator is a little different from the other
			 * language options since DataTables doesn't output floating point
			 * numbers, so it won't ever use this for display of a number. Rather,
			 * what this parameter does is modify the sort methods of the table so
			 * that numbers which are in a format which has a character other than
			 * a period (`.`) as a decimal place will be sorted numerically.
			 *
			 * Note that numbers with different decimal places cannot be shown in
			 * the same table and still be sortable, the table must be consistent.
			 * However, multiple different tables on the page can use different
			 * decimal place characters.
			 */
			"sDecimal": "",


			/**
			 * DataTables has a build in number formatter (`formatNumber`) which is
			 * used to format large numbers that are used in the table information.
			 * By default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 */
			"sThousands": ",",


			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 */
			"sLengthMenu": "_MENU_ _ENTRIES_ per page",


			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 */
			"sLoadingRecords": "Loading...",


			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 */
			"sProcessing": "",


			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 */
			"sSearch": "Search:",


			/**
			 * Assign a `placeholder` attribute to the search `input` element
			 *  @type string
			 *  @default 
			 *
			 *  @dtopt Language
			 *  @name DataTable.defaults.language.searchPlaceholder
			 */
			"sSearchPlaceholder": "",


			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 */
			"sUrl": "",


			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. `emptyTable` is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 */
			"sZeroRecords": "No matching records found"
		},


		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the `search` parameter must be
		 * defined, but all other parameters are optional. When `regex` is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When `smart`
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 */
		"oSearch": $.extend({}, DataTable.models.oSearch),


		/**
		 * Table and control layout. This replaces the legacy `dom` option.
		 */
		layout: {
			topStart: 'pageLength',
			topEnd: 'search',
			bottomStart: 'info',
			bottomEnd: 'paging'
		},


		/**
		 * Legacy DOM layout option
		 */
		"sDom": null,


		/**
		 * Search delay option. This will throttle full table searches that use the
		 * DataTables provided search input element (it does not effect calls to
		 * `dt-api search()`, providing a delay before the search is made.
		 */
		"searchDelay": null,


		/**
		 * DataTables features six different built-in options for the buttons to
		 * display for pagination control:
		 *
		 * * `numbers` - Page number buttons only
		 * * `simple` - 'Previous' and 'Next' buttons only
		 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
		 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
		 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
		 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
		 */
		"sPaginationType": "full_numbers",


		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a
		 * certain layout, or you have a large number of columns in the table, you
		 * can enable x-scrolling to show the table in a viewport, which can be
		 * scrolled. This property can be `true` which will allow the table to
		 * scroll horizontally when needed, or any CSS unit, or a number (in which
		 * case it will be treated as a pixel measurement). Setting as simply `true`
		 * is recommended.
		 */
		"sScrollX": "",


		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 */
		"sScrollXInner": "",


		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 */
		"sScrollY": "",


		/**
		 * __Deprecated__ The functionality provided by this parameter has now been
		 * superseded by that provided through `ajax`, which should be used instead.
		 *
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 */
		"sServerMethod": "GET",


		/**
		 * DataTables makes use of renderers when displaying HTML elements for
		 * a table. These renderers can be added or modified by plug-ins to
		 * generate suitable mark-up for a site. For example the Bootstrap
		 * integration plug-in for DataTables uses a paging button renderer to
		 * display pagination buttons in the mark-up required by Bootstrap.
		 *
		 * For further information about the renderers available see
		 * DataTable.ext.renderer
		 */
		"renderer": null,


		/**
		 * Set the data property name that DataTables should use to get a row's id
		 * to set as the `id` property in the node.
		 */
		"rowId": "DT_RowId",


		/**
		 * Caption value
		 */
		"caption": null
	};

	_fnHungarianMap(DataTable.defaults);



	/*
	 * Developer note - See note in model.defaults.js about the use of Hungarian
	 * notation and camel case.
	 */

	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.column = {
		/**
		 * Define which column(s) an order will occur on for this column. This
		 * allows a column's ordering to take multiple columns into account when
		 * doing a sort or use the data from a different column. For example first
		 * name / last name columns make sense to do a multi-column sort over the
		 * two columns.
		 */
		"aDataSort": null,
		"iDataSort": -1,

		ariaTitle: '',


		/**
		 * You can control the default ordering direction, and even alter the
		 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
		 * using this parameter.
		 */
		"asSorting": ['asc', 'desc', ''],


		/**
		 * Enable or disable filtering on the data in this column.
		 */
		"bSearchable": true,


		/**
		 * Enable or disable ordering on this column.
		 */
		"bSortable": true,


		/**
		 * Enable or disable the display of this column.
		 */
		"bVisible": true,


		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 */
		"fnCreatedCell": null,


		/**
		 * This property can be used to read data from any data source property,
		 * including deeply nested objects / properties. `data` can be given in a
		 * number of different ways which effect its behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object. Note that
		 *      function notation is recommended for use in `render` rather than
		 *      `data` as it is much simpler to use as a renderer.
		 * * `null` - use the original data source for the row rather than plucking
		 *   data directly from it. This action has effects on two other
		 *   initialisation options:
		 *    * `defaultContent` - When null is given as the `data` option and
		 *      `defaultContent` is specified for the column, the value defined by
		 *      `defaultContent` will be used for the cell.
		 *    * `render` - When null is used for the `data` option and the `render`
		 *      option is specified for the column, the whole data source for the
		 *      row is used for the renderer.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * `{array|object}` The data source for the row
		 *      * `{string}` The type call data requested - this will be 'set' when
		 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
		 *        when gathering data. Note that when `undefined` is given for the
		 *        type DataTables expects to get the raw data for the object back<
		 *      * `{*}` Data to set when the second parameter is 'set'.
		 *    * Return:
		 *      * The return value from the function is not required when 'set' is
		 *        the type of call, but otherwise the return is what will be used
		 *        for the data requested.
		 *
		 * Note that `data` is a getter and setter option. If you just require
		 * formatting of data for output, you will likely want to use `render` which
		 * is simply a getter and thus simpler to use.
		 *
		 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
		 * name change reflects the flexibility of this property and is consistent
		 * with the naming of mRender. If 'mDataProp' is given, then it will still
		 * be used by DataTables, as it automatically maps the old name to the new
		 * if required.
		 */
		"mData": null,


		/**
		 * This property is the rendering partner to `data` and it is suggested that
		 * when you want to manipulate data for display (including filtering,
		 * sorting etc) without altering the underlying data for the table, use this
		 * property. `render` can be considered to be the the read only companion to
		 * `data` which is read / write (then as such more complex). Like `data`
		 * this option can be given in a number of different ways to effect its
		 * behaviour:
		 *
		 * * `integer` - treated as an array index for the data source. This is the
		 *   default that DataTables uses (incrementally increased for each column).
		 * * `string` - read an object property from the data source. There are
		 *   three 'special' options that can be used in the string to alter how
		 *   DataTables reads the data from the source object:
		 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
		 *      Javascript to read from nested objects, so to can the options
		 *      specified in `data`. For example: `browser.version` or
		 *      `browser.name`. If your object parameter name contains a period, use
		 *      `\\` to escape it - i.e. `first\\.name`.
		 *    * `[]` - Array notation. DataTables can automatically combine data
		 *      from and array source, joining the data with the characters provided
		 *      between the two brackets. For example: `name[, ]` would provide a
		 *      comma-space separated list from the source array. If no characters
		 *      are provided between the brackets, the original array source is
		 *      returned.
		 *    * `()` - Function notation. Adding `()` to the end of a parameter will
		 *      execute a function of the name given. For example: `browser()` for a
		 *      simple function on the data source, `browser.version()` for a
		 *      function in a nested property or even `browser().version` to get an
		 *      object property if the function called returns an object.
		 * * `object` - use different data for the different data types requested by
		 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
		 *   of the object is the data type the property refers to and the value can
		 *   defined using an integer, string or function using the same rules as
		 *   `render` normally does. Note that an `_` option _must_ be specified.
		 *   This is the default value to use if you haven't specified a value for
		 *   the data type requested by DataTables.
		 * * `function` - the function given will be executed whenever DataTables
		 *   needs to set or get the data for a cell in the column. The function
		 *   takes three parameters:
		 *    * Parameters:
		 *      * {array|object} The data source for the row (based on `data`)
		 *      * {string} The type call data requested - this will be 'filter',
		 *        'display', 'type' or 'sort'.
		 *      * {array|object} The full data source for the row (not based on
		 *        `data`)
		 *    * Return:
		 *      * The return value from the function is what will be used for the
		 *        data requested.
		 */
		"mRender": null,


		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 */
		"sCellType": "td",


		/**
		 * Class to give to each cell in this column.
		 */
		"sClass": "",

		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this!
		 */
		"sContentPadding": "",


		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because `data`
		 * is set to null, or because the data source itself is null).
		 */
		"sDefaultContent": null,


		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 */
		"sName": "",


		/**
		 * Defines a data source type for the ordering which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to ordering. This allows ordering to occur on user
		 * editable elements such as form inputs.
		 */
		"sSortDataType": "std",


		/**
		 * The title of this column.
		 */
		"sTitle": null,


		/**
		 * The type allows you to specify how the data for this column will be
		 * ordered. Four types (string, numeric, date and html (which will strip
		 * HTML tags before ordering)) are currently available. Note that only date
		 * formats understood by Javascript's Date() object will be accepted as type
		 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
		 * 'numeric', 'date' or 'html' (by default). Further types can be adding
		 * through plug-ins.
		 */
		"sType": null,


		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 */
		"sWidth": null
	};

	_fnHungarianMap(DataTable.defaults.column);



	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 *
	 * Note that this object is related to {@link DataTable.defaults} but this
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 */
		"oFeatures": {

			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bAutoWidth": null,

			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all for DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bDeferRender": null,

			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bFilter": null,

			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bInfo": true,

			/**
			 * Used only for compatiblity with DT1
			 * @deprecated
			 */
			"bLengthChange": true,

			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bPaginate": null,

			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bProcessing": null,

			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bServerSide": null,

			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSort": null,

			/**
			 * Multi-column sorting
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortMulti": null,

			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bSortClasses": null,

			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bStateSave": null
		},


		/**
		 * Scrolling settings for a table.
		 */
		"oScroll": {
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"bCollapse": null,

			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 */
			"iBarWidth": 0,

			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sX": null,

			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @deprecated
			 */
			"sXInner": null,

			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 */
			"sY": null
		},

		/**
		 * Language information for the table.
		 */
		"oLanguage": {
			/**
			 * Information callback function. See
			 * {@link DataTable.defaults.fnInfoCallback}
			 */
			"fnInfoCallback": null
		},

		/**
		 * Browser support parameters
		 */
		"oBrowser": {
			/**
			 * Determine if the vertical scrollbar is on the right or left of the
			 * scrolling container - needed for rtl language layout, although not
			 * all browsers move the scrollbar (Safari).
			 */
			"bScrollbarLeft": false,

			/**
			 * Browser scrollbar width
			 */
			"barWidth": 0
		},


		"ajax": null,


		/**
		 * Array referencing the nodes which are used for the features. The
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 */
		"aanFeatures": [],

		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 */
		"aoData": [],

		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 */
		"aiDisplay": [],

		/**
		 * Array of indexes for display - no filtering
		 */
		"aiDisplayMaster": [],

		/**
		 * Map of row ids to data indexes
		 */
		"aIds": {},

		/**
		 * Store information about each column that is in use
		 */
		"aoColumns": [],

		/**
		 * Store information about the table's header
		 */
		"aoHeader": [],

		/**
		 * Store information about the table's footer
		 */
		"aoFooter": [],

		/**
		 * Store the applied global search information in case we want to force a
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"oPreviousSearch": {},

		/**
		 * Store for named searches
		 */
		searchFixed: {},

		/**
		 * Store the applied search for each column - see
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 */
		"aoPreSearchCols": [],

		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSorting": null,

		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aaSortingFixed": [],

		/**
		 * If restoring a table - we should restore its width
		 */
		"sDestroyWidth": 0,

		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 */
		"aoRowCallback": [],

		/**
		 * Callback functions for the header on each draw.
		 */
		"aoHeaderCallback": [],

		/**
		 * Callback function for the footer on each draw.
		 */
		"aoFooterCallback": [],

		/**
		 * Array of callback functions for draw callback functions
		 */
		"aoDrawCallback": [],

		/**
		 * Array of callback functions for row created function
		 */
		"aoRowCreatedCallback": [],

		/**
		 * Callback functions for just before the table is redrawn. A return of
		 * false will be used to cancel the draw.
		 */
		"aoPreDrawCallback": [],

		/**
		 * Callback functions for when the table has been initialised.
		 */
		"aoInitComplete": [],


		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 */
		"aoStateSaveParams": [],

		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 */
		"aoStateLoadParams": [],

		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 */
		"aoStateLoaded": [],

		/**
		 * Cache the table ID for quick access
		 */
		"sTableId": "",

		/**
		 * The TABLE node for the main table
		 */
		"nTable": null,

		/**
		 * Permanent ref to the thead element
		 */
		"nTHead": null,

		/**
		 * Permanent ref to the tfoot element - if it exists
		 */
		"nTFoot": null,

		/**
		 * Permanent ref to the tbody element
		 */
		"nTBody": null,

		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 */
		"nTableWrapper": null,

		/**
		 * Indicate if all required information has been read in
		 */
		"bInitialised": false,

		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 */
		"aoOpenRows": [],

		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sDom": null,

		/**
		 * Search delay (in mS)
		 */
		"searchDelay": null,

		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sPaginationType": "two_button",

		/**
		 * Number of paging controls on the page. Only used for backwards compatibility
		 */
		pagingControls: 0,

		/**
		 * The state duration (for `stateSave`) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"iStateDuration": 0,

		/**
		 * Array of callback functions for state saving. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateSave": [],

		/**
		 * Array of callback functions for state loading. Each array element is an
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 */
		"aoStateLoad": [],

		/**
		 * State that was saved. Useful for back reference
		 */
		"oSavedState": null,

		/**
		 * State that was loaded. Useful for back reference
		 */
		"oLoadedState": null,

		/**
		 * Note if draw should be blocked while getting data
		 */
		"bAjaxDataGet": true,

		/**
		 * The last jQuery XHR object that was used for server-side data gathering.
		 * This can be used for working with the XHR information in one of the
		 * callbacks
		 */
		"jqXHR": null,

		/**
		 * JSON returned from the server in the last Ajax request
		 */
		"json": undefined,

		/**
		 * Data submitted as part of the last Ajax request
		 */
		"oAjaxData": undefined,

		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"sServerMethod": null,

		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"fnFormatNumber": null,

		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"aLengthMenu": null,

		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 */
		"iDraw": 0,

		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 */
		"bDrawing": false,

		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 */
		"iDrawError": -1,

		/**
		 * Paging display length
		 */
		"_iDisplayLength": 10,

		/**
		 * Paging start point - aiDisplay index
		 */
		"_iDisplayStart": 0,

		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsTotal": 0,

		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 */
		"_iRecordsDisplay": 0,

		/**
		 * The classes to use for the table
		 */
		"oClasses": {},

		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bFiltered": false,

		/**
		 * Flag attached to the settings object so you can check in the draw
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @deprecated
		 */
		"bSorted": false,

		/**
		 * Indicate that if multiple rows are in the header and there is more than
		 * one unique cell per column, if the top one (true) or bottom one (false)
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 */
		"bSortCellsTop": null,

		/**
		 * Initialisation object that is used for the table
		 */
		"oInit": null,

		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 */
		"aoDestroyCallback": [],


		/**
		 * Get the number of records in the current record set, before filtering
		 */
		"fnRecordsTotal": function () {
			return _fnDataSource(this) == 'ssp' ?
				this._iRecordsTotal * 1 :
				this.aiDisplayMaster.length;
		},

		/**
		 * Get the number of records in the current record set, after filtering
		 */
		"fnRecordsDisplay": function () {
			return _fnDataSource(this) == 'ssp' ?
				this._iRecordsDisplay * 1 :
				this.aiDisplay.length;
		},

		/**
		 * Get the display end point - aiDisplay index
		 */
		"fnDisplayEnd": function () {
			var
				len = this._iDisplayLength,
				start = this._iDisplayStart,
				calc = start + len,
				records = this.aiDisplay.length,
				features = this.oFeatures,
				paginate = features.bPaginate;

			if (features.bServerSide) {
				return paginate === false || len === -1 ?
					start + records :
					Math.min(start + len, this._iRecordsDisplay);
			}
			else {
				return !paginate || calc > records || len === -1 ?
					records :
					calc;
			}
		},

		/**
		 * The DataTables object for this table
		 */
		"oInstance": null,

		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 */
		"sInstance": null,

		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,

		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,

		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null,

		/**
		 * Last applied sort
		 */
		"aLastSort": [],

		/**
		 * Stored plug-in instances
		 */
		"oPlugins": {},

		/**
		 * Function used to get a row's id from the row's data
		 */
		"rowIdFn": null,

		/**
		 * Data location where to store a row's id
		 */
		"rowId": null,

		caption: '',

		captionNode: null,

		colgroup: null
	};

	/**
	 * Extension object for DataTables that is used to provide all extension
	 * options.
	 *
	 * Note that the `DataTable.ext` object is available through
	 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
	 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */


	var extPagination = DataTable.ext.pager;

	// Paging buttons configuration
	$.extend(extPagination, {
		simple: function () {
			return ['previous', 'next'];
		},

		full: function () {
			return ['first', 'previous', 'next', 'last'];
		},

		numbers: function () {
			return ['numbers'];
		},

		simple_numbers: function () {
			return ['previous', 'numbers', 'next'];
		},

		full_numbers: function () {
			return ['first', 'previous', 'numbers', 'next', 'last'];
		},

		first_last: function () {
			return ['first', 'last'];
		},

		first_last_numbers: function () {
			return ['first', 'numbers', 'last'];
		},

		// For testing and plug-ins to use
		_numbers: _pagingNumbers,

		// Number of number buttons - legacy, use `numbers` option for paging feature
		numbers_length: 7
	});


	$.extend(true, DataTable.ext.renderer, {
		pagingButton: {
			_: function (settings, buttonType, content, active, disabled) {
				var classes = settings.oClasses.paging;
				var btnClasses = [classes.button];
				var btn;

				if (active) {
					btnClasses.push(classes.active);
				}

				if (disabled) {
					btnClasses.push(classes.disabled)
				}

				if (buttonType === 'ellipsis') {
					btn = $('<span class="ellipsis"></span>').html(content)[0];
				}
				else {
					btn = $('<button>', {
						class: btnClasses.join(' '),
						role: 'link',
						type: 'button'
					}).html(content);
				}

				return {
					display: btn,
					clicker: btn
				}
			}
		},

		pagingContainer: {
			_: function (settings, buttons) {
				// No wrapping element - just append directly to the host
				return buttons;
			}
		}
	});

	// Common function to remove new lines, strip HTML and diacritic control
	var _filterString = function (stripHtml, normalize) {
		return function (str) {
			if (_empty(str) || typeof str !== 'string') {
				return str;
			}

			str = str.replace(_re_new_lines, " ");

			if (stripHtml) {
				str = _stripHtml(str);
			}

			if (normalize) {
				str = _normalize(str, false);
			}

			return str;
		};
	}

	/*
	 * Public helper functions. These aren't used internally by DataTables, or
	 * called by any of the options passed into DataTables, but they can be used
	 * externally by developers working with DataTables. They are helper functions
	 * to make working with DataTables a little bit easier.
	 */

	function __mldFnName(name) {
		return name.replace(/[\W]/g, '_')
	}

	// Common logic for moment, luxon or a date action
	function __mld(dt, momentFn, luxonFn, dateFn, arg1) {
		if (window.moment) {
			return dt[momentFn](arg1);
		}
		else if (window.luxon) {
			return dt[luxonFn](arg1);
		}

		return dateFn ? dt[dateFn](arg1) : dt;
	}


	var __mlWarning = false;
	function __mldObj(d, format, locale) {
		var dt;

		if (window.moment) {
			dt = window.moment.utc(d, format, locale, true);

			if (!dt.isValid()) {
				return null;
			}
		}
		else if (window.luxon) {
			dt = format && typeof d === 'string'
				? window.luxon.DateTime.fromFormat(d, format)
				: window.luxon.DateTime.fromISO(d);

			if (!dt.isValid) {
				return null;
			}

			dt.setLocale(locale);
		}
		else if (!format) {
			// No format given, must be ISO
			dt = new Date(d);
		}
		else {
			if (!__mlWarning) {
				alert('DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17');
			}

			__mlWarning = true;
		}

		return dt;
	}

	// Wrapper for date, datetime and time which all operate the same way with the exception of
	// the output string for auto locale support
	function __mlHelper(localeString) {
		return function (from, to, locale, def) {
			// Luxon and Moment support
			// Argument shifting
			if (arguments.length === 0) {
				locale = 'en';
				to = null; // means toLocaleString
				from = null; // means iso8601
			}
			else if (arguments.length === 1) {
				locale = 'en';
				to = from;
				from = null;
			}
			else if (arguments.length === 2) {
				locale = to;
				to = from;
				from = null;
			}

			var typeName = 'datetime' + (to ? '-' + __mldFnName(to) : '');

			// Add type detection and sorting specific to this date format - we need to be able to identify
			// date type columns as such, rather than as numbers in extensions. Hence the need for this.
			if (!DataTable.ext.type.order[typeName]) {
				DataTable.type(typeName, {
					detect: function (d) {
						// The renderer will give the value to type detect as the type!
						return d === typeName ? typeName : false;
					},
					order: {
						pre: function (d) {
							// The renderer gives us Moment, Luxon or Date obects for the sorting, all of which have a
							// `valueOf` which gives milliseconds epoch
							return d.valueOf();
						}
					},
					className: 'dt-right'
				});
			}

			return function (d, type) {
				// Allow for a default value
				if (d === null || d === undefined) {
					if (def === '--now') {
						// We treat everything as UTC further down, so no changes are
						// made, as such need to get the local date / time as if it were
						// UTC
						var local = new Date();
						d = new Date(Date.UTC(
							local.getFullYear(), local.getMonth(), local.getDate(),
							local.getHours(), local.getMinutes(), local.getSeconds()
						));
					}
					else {
						d = '';
					}
				}

				if (type === 'type') {
					// Typing uses the type name for fast matching
					return typeName;
				}

				if (d === '') {
					return type !== 'sort'
						? ''
						: __mldObj('0000-01-01 00:00:00', null, locale);
				}

				// Shortcut. If `from` and `to` are the same, we are using the renderer to
				// format for ordering, not display - its already in the display format.
				if (to !== null && from === to && type !== 'sort' && type !== 'type' && !(d instanceof Date)) {
					return d;
				}

				var dt = __mldObj(d, from, locale);

				if (dt === null) {
					return d;
				}

				if (type === 'sort') {
					return dt;
				}

				var formatted = to === null
					? __mld(dt, 'toDate', 'toJSDate', '')[localeString]()
					: __mld(dt, 'format', 'toFormat', 'toISOString', to);

				// XSS protection
				return type === 'display' ?
					_escapeHtml(formatted) :
					formatted;
			};
		}
	}

	// Based on locale, determine standard number formatting
	// Fallback for legacy browsers is US English
	var __thousands = ',';
	var __decimal = '.';

	if (window.Intl !== undefined) {
		try {
			var num = new Intl.NumberFormat().formatToParts(100000.1);

			for (var i = 0; i < num.length; i++) {
				if (num[i].type === 'group') {
					__thousands = num[i].value;
				}
				else if (num[i].type === 'decimal') {
					__decimal = num[i].value;
				}
			}
		}
		catch (e) {
			// noop
		}
	}

	// Formatted date time detection - use by declaring the formats you are going to use
	DataTable.datetime = function (format, locale) {
		var typeName = 'datetime-detect-' + __mldFnName(format);

		if (!locale) {
			locale = 'en';
		}

		if (!DataTable.ext.type.order[typeName]) {
			DataTable.type(typeName, {
				detect: function (d) {
					var dt = __mldObj(d, format, locale);
					return d === '' || dt ? typeName : false;
				},
				order: {
					pre: function (d) {
						return __mldObj(d, format, locale) || 0;
					}
				},
				className: 'dt-right'
			});
		}
	}

	/**
	 * Helpers for `columns.render`.
	 *
	 * The options defined here can be used with the `columns.render` initialisation
	 * option to provide a display renderer. The following functions are defined:
	 *
	 * * `moment` - Uses the MomentJS library to convert from a given format into another.
	 * This renderer has three overloads:
	 *   * 1 parameter:
	 *     * `string` - Format to convert to (assumes input is ISO8601 and locale is `en`)
	 *   * 2 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to. Assumes `en` locale
	 *   * 3 parameters:
	 *     * `string` - Format to convert from
	 *     * `string` - Format to convert to
	 *     * `string` - Locale
	 * * `number` - Will format numeric data (defined by `columns.data`) for
	 *   display, retaining the original unformatted data for sorting and filtering.
	 *   It takes 5 parameters:
	 *   * `string` - Thousands grouping separator
	 *   * `string` - Decimal point indicator
	 *   * `integer` - Number of decimal points to show
	 *   * `string` (optional) - Prefix.
	 *   * `string` (optional) - Postfix (/suffix).
	 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
	 *   parameters.
	 *
	 * @example
	 *   // Column definition using the number renderer
	 *   {
	 *     data: "salary",
	 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
	 *   }
	 *
	 * @namespace
	 */
	DataTable.render = {
		date: __mlHelper('toLocaleDateString'),
		datetime: __mlHelper('toLocaleString'),
		time: __mlHelper('toLocaleTimeString'),
		number: function (thousands, decimal, precision, prefix, postfix) {
			// Auto locale detection
			if (thousands === null || thousands === undefined) {
				thousands = __thousands;
			}

			if (decimal === null || decimal === undefined) {
				decimal = __decimal;
			}

			return {
				display: function (d) {
					if (typeof d !== 'number' && typeof d !== 'string') {
						return d;
					}

					if (d === '' || d === null) {
						return d;
					}

					var negative = d < 0 ? '-' : '';
					var flo = parseFloat(d);
					var abs = Math.abs(flo);

					// Scientific notation for large and small numbers
					if (abs >= 100000000000 || (abs < 0.0001 && abs !== 0)) {
						var exp = flo.toExponential(precision).split(/e\+?/);
						return exp[0] + ' x 10<sup>' + exp[1] + '</sup>';
					}

					// If NaN then there isn't much formatting that we can do - just
					// return immediately, escaping any HTML (this was supposed to
					// be a number after all)
					if (isNaN(flo)) {
						return _escapeHtml(d);
					}

					flo = flo.toFixed(precision);
					d = Math.abs(flo);

					var intPart = parseInt(d, 10);
					var floatPart = precision ?
						decimal + (d - intPart).toFixed(precision).substring(2) :
						'';

					// If zero, then can't have a negative prefix
					if (intPart === 0 && parseFloat(floatPart) === 0) {
						negative = '';
					}

					return negative + (prefix || '') +
						intPart.toString().replace(
							/\B(?=(\d{3})+(?!\d))/g, thousands
						) +
						floatPart +
						(postfix || '');
				}
			};
		},

		text: function () {
			return {
				display: _escapeHtml,
				filter: _escapeHtml
			};
		}
	};


	var _extTypes = DataTable.ext.type;

	// Get / set type
	DataTable.type = function (name, prop, val) {
		if (!prop) {
			return {
				className: _extTypes.className[name],
				detect: _extTypes.detect.find(function (fn) {
					return fn.name === name;
				}),
				order: {
					pre: _extTypes.order[name + '-pre'],
					asc: _extTypes.order[name + '-asc'],
					desc: _extTypes.order[name + '-desc']
				},
				render: _extTypes.render[name],
				search: _extTypes.search[name]
			};
		}

		var setProp = function (prop, propVal) {
			_extTypes[prop][name] = propVal;
		};
		var setDetect = function (fn) {
			// Wrap to allow the function to return `true` rather than
			// specifying the type name.
			var cb = function (d, s) {
				var ret = fn(d, s);

				return ret === true
					? name
					: ret;
			};
			Object.defineProperty(cb, "name", { value: name });

			var idx = _extTypes.detect.findIndex(function (fn) {
				return fn.name === name;
			});

			if (idx === -1) {
				_extTypes.detect.unshift(cb);
			}
			else {
				_extTypes.detect.splice(idx, 1, cb);
			}
		};
		var setOrder = function (obj) {
			_extTypes.order[name + '-pre'] = obj.pre; // can be undefined
			_extTypes.order[name + '-asc'] = obj.asc; // can be undefined
			_extTypes.order[name + '-desc'] = obj.desc; // can be undefined
		};

		// prop is optional
		if (val === undefined) {
			val = prop;
			prop = null;
		}

		if (prop === 'className') {
			setProp('className', val);
		}
		else if (prop === 'detect') {
			setDetect(val);
		}
		else if (prop === 'order') {
			setOrder(val);
		}
		else if (prop === 'render') {
			setProp('render', val);
		}
		else if (prop === 'search') {
			setProp('search', val);
		}
		else if (!prop) {
			if (val.className) {
				setProp('className', val.className);
			}

			if (val.detect !== undefined) {
				setDetect(val.detect);
			}

			if (val.order) {
				setOrder(val.order);
			}

			if (val.render !== undefined) {
				setProp('render', val.render);
			}

			if (val.search !== undefined) {
				setProp('search', val.search);
			}
		}
	}

	// Get a list of types
	DataTable.types = function () {
		return _extTypes.detect.map(function (fn) {
			return fn.name;
		});
	};

	//
	// Built in data types
	//

	DataTable.type('string', {
		detect: function () {
			return 'string';
		},
		order: {
			pre: function (a) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						!a.toString ?
							'' :
							a.toString();
			}
		},
		search: _filterString(false, true)
	});


	DataTable.type('html', {
		detect: function (d) {
			return _empty(d) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
				'html' : null;
		},
		order: {
			pre: function (a) {
				return _empty(a) ?
					'' :
					a.replace ?
						_stripHtml(a).trim().toLowerCase() :
						a + '';
			}
		},
		search: _filterString(true, true)
	});


	DataTable.type('date', {
		className: 'dt-type-date',
		detect: function (d) {
			// V8 tries _very_ hard to make a string passed into `Date.parse()`
			// valid, so we need to use a regex to restrict date formats. Use a
			// plug-in for anything other than ISO8601 style strings
			if (d && !(d instanceof Date) && !_re_date.test(d)) {
				return null;
			}
			var parsed = Date.parse(d);
			return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
		},
		order: {
			pre: function (d) {
				var ts = Date.parse(d);
				return isNaN(ts) ? -Infinity : ts;
			}
		}
	});


	DataTable.type('html-num-fmt', {
		className: 'dt-type-numeric',
		detect: function (d, settings) {
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric(d, decimal, true) ? 'html-num-fmt' : null;
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace(d, dp, _re_html, _re_formatted_numeric);
			}
		},
		search: _filterString(true, true)
	});


	DataTable.type('html-num', {
		className: 'dt-type-numeric',
		detect: function (d, settings) {
			var decimal = settings.oLanguage.sDecimal;
			return _htmlNumeric(d, decimal) ? 'html-num' : null;
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace(d, dp, _re_html);
			}
		},
		search: _filterString(true, true)
	});


	DataTable.type('num-fmt', {
		className: 'dt-type-numeric',
		detect: function (d, settings) {
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber(d, decimal, true) ? 'num-fmt' : null;
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace(d, dp, _re_formatted_numeric);
			}
		}
	});


	DataTable.type('num', {
		className: 'dt-type-numeric',
		detect: function (d, settings) {
			var decimal = settings.oLanguage.sDecimal;
			return _isNumber(d, decimal) ? 'num' : null;
		},
		order: {
			pre: function (d, s) {
				var dp = s.oLanguage.sDecimal;
				return __numericReplace(d, dp);
			}
		}
	});




	var __numericReplace = function (d, decimalPlace, re1, re2) {
		if (d !== 0 && (!d || d === '-')) {
			return -Infinity;
		}

		var type = typeof d;

		if (type === 'number' || type === 'bigint') {
			return d;
		}

		// If a decimal place other than `.` is used, it needs to be given to the
		// function so we can detect it and replace with a `.` which is the only
		// decimal place Javascript recognises - it is not locale aware.
		if (decimalPlace) {
			d = _numToDecimal(d, decimalPlace);
		}

		if (d.replace) {
			if (re1) {
				d = d.replace(re1, '');
			}

			if (re2) {
				d = d.replace(re2, '');
			}
		}

		return d * 1;
	};


	$.extend(true, DataTable.ext.renderer, {
		footer: {
			_: function (settings, cell, classes) {
				cell.addClass(classes.tfoot.cell);
			}
		},

		header: {
			_: function (settings, cell, classes) {
				cell.addClass(classes.thead.cell);

				if (!settings.oFeatures.bSort) {
					cell.addClass(classes.order.none);
				}

				var legacyTop = settings.bSortCellsTop;
				var headerRows = cell.closest('thead').find('tr');
				var rowIdx = cell.parent().index();

				// Conditions to not apply the ordering icons
				if (
					// Cells and rows which have the attribute to disable the icons
					cell.attr('data-dt-order') === 'disable' ||
					cell.parent().attr('data-dt-order') === 'disable' ||

					// Legacy support for `orderCellsTop`. If it is set, then cells
					// which are not in the top or bottom row of the header (depending
					// on the value) do not get the sorting classes applied to them
					(legacyTop === true && rowIdx !== 0) ||
					(legacyTop === false && rowIdx !== headerRows.length - 1)
				) {
					return;
				}

				// No additional mark-up required
				// Attach a sort listener to update on sort - note that using the
				// `DT` namespace will allow the event to be removed automatically
				// on destroy, while the `dt` namespaced event is the one we are
				// listening for
				$(settings.nTable).on('order.dt.DT', function (e, ctx, sorting) {
					if (settings !== ctx) { // need to check this this is the host
						return;               // table, not a nested one
					}

					var orderClasses = classes.order;
					var columns = ctx.api.columns(cell);
					var col = settings.aoColumns[columns.flatten()[0]];
					var orderable = columns.orderable().includes(true);
					var ariaType = '';
					var indexes = columns.indexes();
					var sortDirs = columns.orderable(true).flatten();
					var orderedColumns = ',' + sorting.map(function (val) {
						return val.col;
					}).join(',') + ',';

					cell
						.removeClass(
							orderClasses.isAsc + ' ' +
							orderClasses.isDesc
						)
						.toggleClass(orderClasses.none, !orderable)
						.toggleClass(orderClasses.canAsc, orderable && sortDirs.includes('asc'))
						.toggleClass(orderClasses.canDesc, orderable && sortDirs.includes('desc'));

					var sortIdx = orderedColumns.indexOf(',' + indexes.toArray().join(',') + ',');

					if (sortIdx !== -1) {
						// Get the ordering direction for the columns under this cell
						// Note that it is possible for a cell to be asc and desc sorting
						// (column spanning cells)
						var orderDirs = columns.order();

						cell.addClass(
							orderDirs.includes('asc') ? orderClasses.isAsc : '' +
								orderDirs.includes('desc') ? orderClasses.isDesc : ''
						);
					}

					// The ARIA spec says that only one column should be marked with aria-sort
					if (sortIdx === 0) {
						var firstSort = sorting[0];
						var sortOrder = col.asSorting;

						cell.attr('aria-sort', firstSort.dir === 'asc' ? 'ascending' : 'descending');

						// Determine if the next click will remove sorting or change the sort
						ariaType = !sortOrder[firstSort.index + 1] ? 'Remove' : 'Reverse';
					}
					else {
						cell.removeAttr('aria-sort');
					}

					cell.attr('aria-label', orderable
						? col.ariaTitle + ctx.api.i18n('oAria.orderable' + ariaType)
						: col.ariaTitle
					);

					if (orderable) {
						cell.find('.dt-column-title').attr('role', 'button');
						cell.attr('tabindex', 0)
					}
				});
			}
		},

		layout: {
			_: function (settings, container, items) {
				var row = $('<div/>')
					.addClass('dt-layout-row')
					.appendTo(container);

				$.each(items, function (key, val) {
					var klass = !val.table ?
						'dt-' + key + ' ' :
						'';

					if (val.table) {
						row.addClass('dt-layout-table');
					}

					$('<div/>')
						.attr({
							id: val.id || null,
							"class": 'dt-layout-cell ' + klass + (val.className || '')
						})
						.append(val.contents)
						.appendTo(row);
				});
			}
		}
	});


	DataTable.feature = {};

	// Third parameter is internal only!
	DataTable.feature.register = function (name, cb, legacy) {
		DataTable.ext.features[name] = cb;

		if (legacy) {
			_ext.feature.push({
				cFeature: legacy,
				fnInit: cb
			});
		}
	};

	DataTable.feature.register('info', function (settings, opts) {
		// For compatibility with the legacy `info` top level option
		if (!settings.oFeatures.bInfo) {
			return null;
		}

		var
			lang = settings.oLanguage,
			tid = settings.sTableId,
			n = $('<div/>', {
				'class': settings.oClasses.info.container,
			});

		opts = $.extend({
			callback: lang.fnInfoCallback,
			empty: lang.sInfoEmpty,
			postfix: lang.sInfoPostFix,
			search: lang.sInfoFiltered,
			text: lang.sInfo,
		}, opts);


		// Update display on each draw
		settings.aoDrawCallback.push(function (s) {
			_fnUpdateInfo(s, opts, n);
		});

		// For the first info display in the table, we add a callback and aria information.
		if (!settings._infoEl) {
			n.attr({
				'aria-live': 'polite',
				id: tid + '_info',
				role: 'status'
			});

			// Table is described by our info div
			$(settings.nTable).attr('aria-describedby', tid + '_info');

			settings._infoEl = n;
		}

		return n;
	}, 'i');

	/**
	 * Update the information elements in the display
	 *  @param {object} settings dataTables settings object
	 *  @memberof DataTable#oApi
	 */
	function _fnUpdateInfo(settings, opts, node) {
		var
			start = settings._iDisplayStart + 1,
			end = settings.fnDisplayEnd(),
			max = settings.fnRecordsTotal(),
			total = settings.fnRecordsDisplay(),
			out = total
				? opts.text
				: opts.empty;

		if (total !== max) {
			// Record set after filtering
			out += ' ' + opts.search;
		}

		// Convert the macros
		out += opts.postfix;
		out = _fnMacros(settings, out);

		if (opts.callback) {
			out = opts.callback.call(settings.oInstance,
				settings, start, end, max, total, out
			);
		}

		node.html(out);

		_fnCallbackFire(settings, null, 'info', [settings, node[0], out]);
	}

	var __searchCounter = 0;

	// opts
	// - text
	// - placeholder
	DataTable.feature.register('search', function (settings, opts) {
		// Don't show the input if filtering isn't available on the table
		if (!settings.oFeatures.bFilter) {
			return null;
		}

		var classes = settings.oClasses.search;
		var tableId = settings.sTableId;
		var language = settings.oLanguage;
		var previousSearch = settings.oPreviousSearch;
		var input = '<input type="search" class="' + classes.input + '"/>';

		opts = $.extend({
			placeholder: language.sSearchPlaceholder,
			text: language.sSearch
		}, opts);

		// The _INPUT_ is optional - is appended if not present
		if (opts.text.indexOf('_INPUT_') === -1) {
			opts.text += '_INPUT_';
		}

		opts.text = _fnMacros(settings, opts.text);

		// We can put the <input> outside of the label if it is at the start or end
		// which helps improve accessability (not all screen readers like implicit
		// for elements).
		var end = opts.text.match(/_INPUT_$/);
		var start = opts.text.match(/^_INPUT_/);
		var removed = opts.text.replace(/_INPUT_/, '');
		var str = '<label>' + opts.text + '</label>';

		if (start) {
			str = '_INPUT_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_INPUT_';
		}

		var filter = $('<div>')
			.addClass(classes.container)
			.append(str.replace(/_INPUT_/, input));

		// add for and id to label and input
		filter.find('label').attr('for', 'dt-search-' + __searchCounter);
		filter.find('input').attr('id', 'dt-search-' + __searchCounter);
		__searchCounter++;

		var searchFn = function (event) {
			var val = this.value;

			if (previousSearch.return && event.key !== "Enter") {
				return;
			}

			/* Now do the filter */
			if (val != previousSearch.search) {
				previousSearch.search = val;

				_fnFilterComplete(settings, previousSearch);

				// Need to redraw, without resorting
				settings._iDisplayStart = 0;
				_fnDraw(settings);
			}
		};

		var searchDelay = settings.searchDelay !== null ?
			settings.searchDelay :
			0;

		var jqFilter = $('input', filter)
			.val(previousSearch.search)
			.attr('placeholder', opts.placeholder)
			.on(
				'keyup.DT search.DT input.DT paste.DT cut.DT',
				searchDelay ?
					DataTable.util.debounce(searchFn, searchDelay) :
					searchFn
			)
			.on('mouseup.DT', function (e) {
				// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
				// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
				// checks the value to see if it has changed. In other browsers it won't have.
				setTimeout(function () {
					searchFn.call(jqFilter[0], e);
				}, 10);
			})
			.on('keypress.DT', function (e) {
				/* Prevent form submission */
				if (e.keyCode == 13) {
					return false;
				}
			})
			.attr('aria-controls', tableId);

		// Update the input elements whenever the table is filtered
		$(settings.nTable).on('search.dt.DT', function (ev, s) {
			if (settings === s && jqFilter[0] !== document.activeElement) {
				jqFilter.val(typeof previousSearch.search !== 'function'
					? previousSearch.search
					: ''
				);
			}
		});

		return filter;
	}, 'f');

	// opts
	// - type - button configuration
	// - buttons - number of buttons to show - must be odd
	DataTable.feature.register('paging', function (settings, opts) {
		// Don't show the paging input if the table doesn't have paging enabled
		if (!settings.oFeatures.bPaginate) {
			return null;
		}

		opts = $.extend({
			buttons: DataTable.ext.pager.numbers_length,
			type: settings.sPaginationType,
			boundaryNumbers: true
		}, opts);

		// To be removed in 2.1
		if (opts.numbers) {
			opts.buttons = opts.numbers;
		}

		var host = $('<div/>').addClass(settings.oClasses.paging.container + ' paging_' + opts.type);
		var draw = function () {
			_pagingDraw(settings, host, opts);
		};

		settings.aoDrawCallback.push(draw);

		// Responsive redraw of paging control
		$(settings.nTable).on('column-sizing.dt.DT', draw);

		return host;
	}, 'p');

	function _pagingDraw(settings, host, opts) {
		if (!settings._bInitComplete) {
			return;
		}

		var
			plugin = DataTable.ext.pager[opts.type],
			aria = settings.oLanguage.oAria.paginate || {},
			start = settings._iDisplayStart,
			len = settings._iDisplayLength,
			visRecords = settings.fnRecordsDisplay(),
			all = len === -1,
			page = all ? 0 : Math.ceil(start / len),
			pages = all ? 1 : Math.ceil(visRecords / len),
			buttons = plugin()
				.map(function (val) {
					return val === 'numbers'
						? _pagingNumbers(page, pages, opts.buttons, opts.boundaryNumbers)
						: val;
				})
				.flat();

		var buttonEls = [];

		for (var i = 0; i < buttons.length; i++) {
			var button = buttons[i];

			var btnInfo = _pagingButtonInfo(settings, button, page, pages);
			var btn = _fnRenderer(settings, 'pagingButton')(
				settings,
				button,
				btnInfo.display,
				btnInfo.active,
				btnInfo.disabled
			);

			// Common attributes
			$(btn.clicker).attr({
				'aria-controls': settings.sTableId,
				'aria-disabled': btnInfo.disabled ? 'true' : null,
				'aria-current': btnInfo.active ? 'page' : null,
				'aria-label': aria[button],
				'data-dt-idx': button,
				'tabIndex': btnInfo.disabled ? -1 : settings.iTabIndex,
			});

			if (typeof button !== 'number') {
				$(btn.clicker).addClass(button);
			}

			_fnBindAction(
				btn.clicker, { action: button }, function (e) {
					e.preventDefault();

					_fnPageChange(settings, e.data.action, true);
				}
			);

			buttonEls.push(btn.display);
		}

		var wrapped = _fnRenderer(settings, 'pagingContainer')(
			settings, buttonEls
		);

		var activeEl = host.find(document.activeElement).data('dt-idx');

		host.empty().append(wrapped);

		if (activeEl !== undefined) {
			host.find('[data-dt-idx=' + activeEl + ']').trigger('focus');
		}

		// Responsive - check if the buttons are over two lines based on the
		// height of the buttons and the container.
		if (
			buttonEls.length && // any buttons
			opts.numbers > 1 && // prevent infinite
			$(host).height() >= ($(buttonEls[0]).outerHeight() * 2) - 10
		) {
			_pagingDraw(settings, host, $.extend({}, opts, { numbers: opts.numbers - 2 }));
		}
	}

	/**
	 * Get properties for a button based on the current paging state of the table
	 *
	 * @param {*} settings DT settings object
	 * @param {*} button The button type in question
	 * @param {*} page Table's current page
	 * @param {*} pages Number of pages
	 * @returns Info object
	 */
	function _pagingButtonInfo(settings, button, page, pages) {
		var lang = settings.oLanguage.oPaginate;
		var o = {
			display: '',
			active: false,
			disabled: false
		};

		switch (button) {
			case 'ellipsis':
				o.display = '&#x2026;';
				o.disabled = true;
				break;

			case 'first':
				o.display = lang.sFirst;

				if (page === 0) {
					o.disabled = true;
				}
				break;

			case 'previous':
				o.display = lang.sPrevious;

				if (page === 0) {
					o.disabled = true;
				}
				break;

			case 'next':
				o.display = lang.sNext;

				if (pages === 0 || page === pages - 1) {
					o.disabled = true;
				}
				break;

			case 'last':
				o.display = lang.sLast;

				if (pages === 0 || page === pages - 1) {
					o.disabled = true;
				}
				break;

			default:
				if (typeof button === 'number') {
					o.display = settings.fnFormatNumber(button + 1);

					if (page === button) {
						o.active = true;
					}
				}
				break;
		}

		return o;
	}

	/**
	 * Compute what number buttons to show in the paging control
	 *
	 * @param {*} page Current page
	 * @param {*} pages Total number of pages
	 * @param {*} buttons Target number of number buttons
	 * @param {boolean} addFirstLast Indicate if page 1 and end should be included
	 * @returns Buttons to show
	 */
	function _pagingNumbers(page, pages, buttons, addFirstLast) {
		var
			numbers = [],
			half = Math.floor(buttons / 2),
			before = addFirstLast ? 2 : 1,
			after = addFirstLast ? 1 : 0;

		if (pages <= buttons) {
			numbers = _range(0, pages);
		}
		else if (buttons === 1) {
			// Single button - current page only
			numbers = [page];
		}
		else if (buttons === 3) {
			// Special logic for just three buttons
			if (page <= 1) {
				numbers = [0, 1, 'ellipsis'];
			}
			else if (page >= pages - 2) {
				numbers = _range(pages - 2, pages);
				numbers.unshift('ellipsis');
			}
			else {
				numbers = ['ellipsis', page, 'ellipsis'];
			}
		}
		else if (page <= half) {
			numbers = _range(0, buttons - before);
			numbers.push('ellipsis');

			if (addFirstLast) {
				numbers.push(pages - 1);
			}
		}
		else if (page >= pages - 1 - half) {
			numbers = _range(pages - (buttons - before), pages);
			numbers.unshift('ellipsis');

			if (addFirstLast) {
				numbers.unshift(0);
			}
		}
		else {
			numbers = _range(page - half + before, page + half - after);
			numbers.push('ellipsis');
			numbers.unshift('ellipsis');

			if (addFirstLast) {
				numbers.push(pages - 1);
				numbers.unshift(0);
			}
		}

		return numbers;
	}

	var __lengthCounter = 0;

	// opts
	// - menu
	// - text
	DataTable.feature.register('pageLength', function (settings, opts) {
		var features = settings.oFeatures;

		// For compatibility with the legacy `pageLength` top level option
		if (!features.bPaginate || !features.bLengthChange) {
			return null;
		}

		opts = $.extend({
			menu: settings.aLengthMenu,
			text: settings.oLanguage.sLengthMenu
		}, opts);

		var
			classes = settings.oClasses.length,
			tableId = settings.sTableId,
			menu = opts.menu,
			lengths = [],
			language = [],
			i;

		// Options can be given in a number of ways
		if (Array.isArray(menu[0])) {
			// Old 1.x style - 2D array
			lengths = menu[0];
			language = menu[1];
		}
		else {
			for (i = 0; i < menu.length; i++) {
				// An object with different label and value
				if ($.isPlainObject(menu[i])) {
					lengths.push(menu[i].value);
					language.push(menu[i].label);
				}
				else {
					// Or just a number to display and use
					lengths.push(menu[i]);
					language.push(menu[i]);
				}
			}
		}

		// We can put the <select> outside of the label if it is at the start or
		// end which helps improve accessability (not all screen readers like
		// implicit for elements).
		var end = opts.text.match(/_MENU_$/);
		var start = opts.text.match(/^_MENU_/);
		var removed = opts.text.replace(/_MENU_/, '');
		var str = '<label>' + opts.text + '</label>';

		if (start) {
			str = '_MENU_<label>' + removed + '</label>';
		}
		else if (end) {
			str = '<label>' + removed + '</label>_MENU_';
		}

		// Wrapper element - use a span as a holder for where the select will go
		var div = $('<div/>')
			.addClass(classes.container)
			.append(
				str.replace('_MENU_', '<span></span>')
			);

		// Save text node content for macro updating
		var textNodes = [];
		div.find('label')[0].childNodes.forEach(function (el) {
			if (el.nodeType === Node.TEXT_NODE) {
				textNodes.push({
					el: el,
					text: el.textContent
				});
			}
		})

		// Update the label text in case it has an entries value
		var updateEntries = function (len) {
			textNodes.forEach(function (node) {
				node.el.textContent = _fnMacros(settings, node.text, len);
			});
		}

		// Next, the select itself, along with the options
		var select = $('<select/>', {
			'name': tableId + '_length',
			'aria-controls': tableId,
			'class': classes.select
		});

		for (i = 0; i < lengths.length; i++) {
			select[0][i] = new Option(
				typeof language[i] === 'number' ?
					settings.fnFormatNumber(language[i]) :
					language[i],
				lengths[i]
			);
		}

		// add for and id to label and input
		div.find('label').attr('for', 'dt-length-' + __lengthCounter);
		select.attr('id', 'dt-length-' + __lengthCounter);
		__lengthCounter++;

		// Swap in the select list
		div.find('span').replaceWith(select);

		// Can't use `select` variable as user might provide their own and the
		// reference is broken by the use of outerHTML
		$('select', div)
			.val(settings._iDisplayLength)
			.on('change.DT', function () {
				_fnLengthChange(settings, $(this).val());
				_fnDraw(settings);
			});

		// Update node value whenever anything changes the table's length
		$(settings.nTable).on('length.dt.DT', function (e, s, len) {
			if (settings === s) {
				$('select', div).val(len);

				// Resolve plurals in the text for the new length
				updateEntries(len);
			}
		});

		updateEntries(settings._iDisplayLength);

		return div;
	}, 'l');

	// jQuery access
	$.fn.dataTable = DataTable;

	// Provide access to the host jQuery object (circular reference)
	DataTable.$ = $;

	// Legacy aliases
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;

	// With a capital `D` we return a DataTables API instance rather than a
	// jQuery object
	$.fn.DataTable = function (opts) {
		return $(this).dataTable(opts).api();
	};

	// All properties that are available to $.fn.dataTable should also be
	// available on $.fn.DataTable
	$.each(DataTable, function (prop, val) {
		$.fn.DataTable[prop] = val;
	});

	return DataTable;
}));


/*! DataTables Bootstrap 5 integration
 * © SpryMedia Ltd - datatables.net/license
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if (!$.fn.dataTable) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if (!root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if (!$) {
					$ = jq(root);
				}

				cjsRequires(root, $);
				return factory($, root, root.document);
			};
		}
		else {
			cjsRequires(window, jq);
			module.exports = factory(jq, window, window.document);
		}
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document) {
	'use strict';
	var DataTable = $.fn.dataTable;



	/**
	 * DataTables integration for Bootstrap 5.
	 *
	 * This file sets the defaults and adds options to DataTables to style its
	 * controls using Bootstrap. See https://datatables.net/manual/styling/bootstrap
	 * for further information.
	 */

	/* Set the defaults for DataTables initialisation */
	$.extend(true, DataTable.defaults, {
		renderer: 'bootstrap'
	});


	/* Default class modification */
	$.extend(true, DataTable.ext.classes, {
		container: "dt-container dt-bootstrap5",
		search: {
			input: "form-control form-control-sm"
		},
		length: {
			select: "form-select form-select-sm"
		},
		processing: {
			container: "dt-processing card"
		}
	});


	/* Bootstrap paging button renderer */
	DataTable.ext.renderer.pagingButton.bootstrap = function (settings, buttonType, content, active, disabled) {
		var btnClasses = ['dt-paging-button', 'page-item'];

		if (active) {
			btnClasses.push('active');
		}

		if (disabled) {
			btnClasses.push('disabled')
		}

		var li = $('<li>').addClass(btnClasses.join(' '));
		var a = $('<a>', {
			'href': disabled ? null : '#',
			'class': 'page-link'
		})
			.html(content)
			.appendTo(li);

		return {
			display: li,
			clicker: a
		};
	};

	DataTable.ext.renderer.pagingContainer.bootstrap = function (settings, buttonEls) {
		return $('<ul/>').addClass('pagination').append(buttonEls);
	};

	DataTable.ext.renderer.layout.bootstrap = function (settings, container, items) {
		var row = $('<div/>', {
			"class": items.full ?
				'row mt-2 justify-content-md-center' :
				'row mt-2 justify-content-between'
		})
			.appendTo(container);

		$.each(items, function (key, val) {
			var klass;

			// Apply start / end (left / right when ltr) margins
			if (val.table) {
				klass = 'col-12';
			}
			else if (key === 'start') {
				klass = 'col-md-auto me-auto';
			}
			else if (key === 'end') {
				klass = 'col-md-auto ms-auto';
			}
			else {
				klass = 'col-md';
			}

			$('<div/>', {
				id: val.id || null,
				"class": klass + ' ' + (val.className || '')
			})
				.append(val.contents)
				.appendTo(row);
		});
	};


	return DataTable;
}));


/*!
 * Version:     2.3.2
 * Author:      SpryMedia (www.sprymedia.co.uk)
 * Info:        http://editor.datatables.net
 * 
 * Copyright 2012-2024 SpryMedia Limited, all rights reserved.
 * License: DataTables Editor - http://editor.datatables.net/license
 */

// Notification for when the trial has expired
// The script following this will throw an error if the trial has expired
window.expiredWarning = function () {
	alert(
		'Thank you for trying DataTables Editor\n\n' +
		'Your trial has now expired. To purchase a license ' +
		'for Editor, please see https://editor.datatables.net/purchase'
	);
};

(function () { a6N60[413048] = (function () { var R = 2; for (; R !== 9;) { switch (R) { case 2: R = typeof globalThis === '\u006f\x62\u006a\u0065\u0063\u0074' ? 1 : 5; break; case 1: return globalThis; break; case 5: var L; try { var H = 2; for (; H !== 6;) { switch (H) { case 4: H = typeof GF5N1 === '\u0075\u006e\u0064\u0065\u0066\u0069\u006e\x65\x64' ? 3 : 9; break; case 9: delete L['\u0047\u0046\x35\u004e\u0031']; var D = Object['\u0070\u0072\u006f\x74\u006f\u0074\x79\x70\u0065']; delete D['\u0063\u0072\u004c\x44\u0054']; H = 6; break; case 2: Object['\u0064\x65\x66\x69\u006e\u0065\x50\u0072\x6f\u0070\x65\x72\x74\u0079'](Object['\x70\x72\u006f\u0074\x6f\x74\x79\u0070\u0065'], '\x63\x72\u004c\u0044\u0054', { '\x67\x65\x74': function () { return this; }, '\x63\x6f\x6e\x66\x69\x67\x75\x72\x61\x62\x6c\x65': true }); L = crLDT; L['\x47\u0046\u0035\u004e\u0031'] = L; H = 4; break; case 3: throw ""; H = 9; break; } } } catch (C) { L = window; } return L; break; } } })(); y$CLk8(a6N60[413048]); a6N60[83715] = "b"; a6N60.N2 = function () { return typeof a6N60[445637].m1qS1fu === 'function' ? a6N60[445637].m1qS1fu.apply(a6N60[445637], arguments) : a6N60[445637].m1qS1fu; }; a6N60[406894] = "j"; a6N60[280451] = 'function'; a6N60.V56 = "er"; a6N60[273010] = "qu"; a6N60.x3N = "dataTable"; function y$CLk8(k$b) { function M$g(n$2) { var k7I = 2; for (; k7I !== 5;) { switch (k7I) { case 2: var X69 = [arguments]; return X69[0][0].Function; break; } } } function P9O(L1m) { var g2G = 2; for (; g2G !== 5;) { switch (g2G) { case 2: var r01 = [arguments]; return r01[0][0]; break; } } } function i3j(P_f) { var B4j = 2; for (; B4j !== 5;) { switch (B4j) { case 2: var d3H = [arguments]; return d3H[0][0].Array; break; } } } function t58(E$M) { var i$x = 2; for (; i$x !== 5;) { switch (i$x) { case 2: var n9F = [arguments]; return n9F[0][0].RegExp; break; } } } var t_c = 2; for (; t_c !== 92;) { switch (t_c) { case 15: Q9w[68] = ""; Q9w[88] = "59w"; Q9w[68] = "ual"; Q9w[49] = ""; Q9w[49] = "d"; t_c = 23; break; case 69: Q9w[11] += Q9w[86]; Q9w[11] += Q9w[91]; Q9w[67] = Q9w[80]; Q9w[67] += Q9w[29]; t_c = 90; break; case 19: Q9w[4] = ""; Q9w[4] = ""; Q9w[4] = "F"; Q9w[94] = "P"; t_c = 15; break; case 86: Q9w[36] = Q9w[94]; Q9w[36] += Q9w[88]; Q9w[36] += Q9w[4]; Q9w[28] = Q9w[3]; Q9w[28] += Q9w[6]; Q9w[28] += Q9w[8]; Q9w[15] = Q9w[2]; t_c = 79; break; case 62: Q9w[76] = 1; Q9w[64] = 8; Q9w[64] = 0; Q9w[18] = Q9w[84]; t_c = 58; break; case 99: E0l(i3j, "map", Q9w[76], Q9w[15]); t_c = 98; break; case 97: E0l(i3j, "push", Q9w[76], Q9w[36]); t_c = 96; break; case 58: Q9w[18] += Q9w[52]; Q9w[18] += Q9w[96]; Q9w[81] = Q9w[45]; Q9w[81] += Q9w[53]; Q9w[81] += Q9w[46]; t_c = 76; break; case 12: Q9w[6] = "t"; Q9w[3] = ""; Q9w[3] = ""; Q9w[3] = "H9"; t_c = 19; break; case 45: Q9w[84] = ""; Q9w[84] = ""; Q9w[84] = "h"; Q9w[76] = 5; t_c = 62; break; case 7: Q9w[7] = "1"; Q9w[6] = ""; Q9w[1] = "T0F"; Q9w[5] = "yV"; t_c = 12; break; case 96: E0l(P9O, Q9w[32], Q9w[64], Q9w[67]); t_c = 95; break; case 90: Q9w[67] += Q9w[57]; Q9w[32] = Q9w[40]; Q9w[32] += Q9w[49]; Q9w[32] += Q9w[68]; t_c = 86; break; case 2: var Q9w = [arguments]; Q9w[9] = ""; Q9w[9] = "9"; Q9w[2] = ""; Q9w[2] = "i8"; Q9w[8] = ""; Q9w[8] = "qr"; t_c = 7; break; case 93: E0l(P9O, Q9w[81], Q9w[64], Q9w[18]); t_c = 92; break; case 76: Q9w[44] = Q9w[14]; Q9w[44] += Q9w[17]; Q9w[44] += Q9w[13]; Q9w[65] = Q9w[80]; Q9w[65] += Q9w[33]; Q9w[65] += Q9w[69]; Q9w[11] = Q9w[79]; t_c = 69; break; case 100: E0l(p5Z, "replace", Q9w[76], Q9w[41]); t_c = 99; break; case 34: Q9w[29] = "9z3"; Q9w[57] = "0D"; Q9w[91] = ""; Q9w[91] = "ptimize"; Q9w[86] = ""; Q9w[86] = "o"; t_c = 28; break; case 23: Q9w[40] = ""; Q9w[40] = "__resi"; Q9w[29] = ""; Q9w[29] = ""; t_c = 34; break; case 50: Q9w[96] = "dhRc"; Q9w[53] = "ra"; Q9w[52] = ""; Q9w[52] = ""; Q9w[52] = "7"; t_c = 45; break; case 28: Q9w[69] = ""; Q9w[69] = "Di"; Q9w[33] = ""; Q9w[33] = "8aB"; Q9w[80] = ""; Q9w[79] = "__"; Q9w[80] = "N"; t_c = 38; break; case 94: E0l(M$g, "apply", Q9w[76], Q9w[44]); t_c = 93; break; case 101: var E0l = function (D8t, P7t, H1W, d18) { var a67 = 2; for (; a67 !== 5;) { switch (a67) { case 2: var W1X = [arguments]; K9M(Q9w[0][0], W1X[0][0], W1X[0][1], W1X[0][2], W1X[0][3]); a67 = 5; break; } } }; t_c = 100; break; case 38: Q9w[13] = ""; Q9w[13] = "A"; Q9w[17] = ""; Q9w[17] = "jb5"; Q9w[14] = "C1"; Q9w[46] = "ct"; Q9w[45] = "__abst"; t_c = 50; break; case 98: E0l(t58, "test", Q9w[76], Q9w[28]); t_c = 97; break; case 79: Q9w[15] += Q9w[5]; Q9w[15] += Q9w[9]; Q9w[41] = Q9w[1]; Q9w[41] += Q9w[6]; Q9w[41] += Q9w[7]; t_c = 101; break; case 95: E0l(P9O, Q9w[11], Q9w[64], Q9w[65]); t_c = 94; break; } } function p5Z(c7u) { var s4m = 2; for (; s4m !== 5;) { switch (s4m) { case 1: return q5l[0][0].String; break; case 2: var q5l = [arguments]; s4m = 1; break; } } } function K9M(C6j, A9w, l1u, S0Q, p_T) { var p7K = 2; for (; p7K !== 7;) { switch (p7K) { case 2: var e85 = [arguments]; e85[1] = "rty"; e85[4] = ""; e85[4] = "finePrope"; p7K = 3; break; case 3: e85[3] = "de"; e85[6] = false; try { var Y7v = 2; for (; Y7v !== 13;) { switch (Y7v) { case 9: e85[7][e85[0][4]] = e85[7][e85[0][2]]; e85[9].set = function (P77) { var L$L = 2; for (; L$L !== 5;) { switch (L$L) { case 2: var j45 = [arguments]; e85[7][e85[0][2]] = j45[0][0]; L$L = 5; break; } } }; e85[9].get = function () { var k14 = 2; for (; k14 !== 13;) { switch (k14) { case 3: H8C[8] = ""; H8C[8] = "un"; H8C[5] = H8C[8]; H8C[5] += H8C[6]; H8C[5] += H8C[4]; return typeof e85[7][e85[0][2]] == H8C[5] ? undefined : e85[7][e85[0][2]]; break; case 2: var H8C = [arguments]; H8C[4] = "ned"; H8C[6] = ""; H8C[6] = "defi"; k14 = 3; break; } } }; e85[9].enumerable = e85[6]; try { var X8I = 2; for (; X8I !== 3;) { switch (X8I) { case 2: e85[5] = e85[3]; e85[5] += e85[4]; e85[5] += e85[1]; e85[0][0].Object[e85[5]](e85[7], e85[0][4], e85[9]); X8I = 3; break; } } } catch (y6y) { } Y7v = 13; break; case 4: Y7v = e85[7].hasOwnProperty(e85[0][4]) && e85[7][e85[0][4]] === e85[7][e85[0][2]] ? 3 : 9; break; case 3: return; break; case 2: e85[9] = {}; e85[8] = (1, e85[0][1])(e85[0][0]); e85[7] = [e85[8], e85[8].prototype][e85[0][3]]; Y7v = 4; break; } } } catch (x2t) { } p7K = 7; break; } } } } function a6N60() { } a6N60[549383] = "ect"; a6N60.L6 = function () { return typeof a6N60[445637].m1qS1fu === 'function' ? a6N60[445637].m1qS1fu.apply(a6N60[445637], arguments) : a6N60[445637].m1qS1fu; }; a6N60[204096] = "o"; a6N60.j_z = "fn"; a6N60.E4C = "u"; a6N60.L1o = 'undefined'; a6N60.P01 = function () { return typeof a6N60.a6g.q6wQ0P1 === 'function' ? a6N60.a6g.q6wQ0P1.apply(a6N60.a6g, arguments) : a6N60.a6g.q6wQ0P1; }; a6N60.G10 = "ment"; a6N60.w1W = "f"; a6N60.a6g = (function () { var y_g = 2; for (; y_g !== 9;) { switch (y_g) { case 2: var z_2 = [arguments]; z_2[2] = undefined; z_2[8] = {}; z_2[8].q6wQ0P1 = function () { var T4Z = 2; for (; T4Z !== 145;) { switch (T4Z) { case 102: Y5M[51] = {}; Y5M[51].K1p = ['X72']; Y5M[51].p1Y = function () { var d1c = function () { return unescape('%3D'); }; var Z1d = (/\075/).H9tqr(d1c + []); return Z1d; }; Y5M[19] = Y5M[51]; Y5M[2].P59wF(Y5M[82]); Y5M[2].P59wF(Y5M[39]); Y5M[2].P59wF(Y5M[49]); T4Z = 95; break; case 70: Y5M[69] = {}; Y5M[69].K1p = ['L3i', 's$N']; Y5M[69].p1Y = function () { var Y7b = function (A5I) { return A5I && A5I['b']; }; var O5y = (/\056/).H9tqr(Y7b + []); return O5y; }; Y5M[74] = Y5M[69]; Y5M[68] = {}; T4Z = 90; break; case 20: Y5M[7].p1Y = function () { var P86 = function (b8x, v8J) { if (b8x) { return b8x; } return v8J; }; var C4B = (/\u003f/).H9tqr(P86 + []); return C4B; }; Y5M[3] = Y5M[7]; Y5M[1] = {}; T4Z = 17; break; case 114: Y5M[2].P59wF(Y5M[65]); Y5M[2].P59wF(Y5M[97]); Y5M[2].P59wF(Y5M[28]); Y5M[2].P59wF(Y5M[12]); Y5M[2].P59wF(Y5M[25]); T4Z = 109; break; case 128: Y5M[20] = 0; T4Z = 127; break; case 47: Y5M[49] = Y5M[63]; T4Z = 46; break; case 91: Y5M[2].P59wF(Y5M[19]); Y5M[2].P59wF(Y5M[74]); T4Z = 118; break; case 54: Y5M[66] = {}; Y5M[66].K1p = ['L3i', 'X72']; Y5M[66].p1Y = function () { var V0g = function () { return (![] + [])[+!+[]]; }; var v4w = (/\141/).H9tqr(V0g + []); return v4w; }; Y5M[97] = Y5M[66]; Y5M[63] = {}; Y5M[63].K1p = ['X72']; Y5M[63].p1Y = function () { var t5q = function () { return ('c').indexOf('c'); }; var q$2 = !(/[\u0022\u0027]/).H9tqr(t5q + []); return q$2; }; T4Z = 47; break; case 4: Y5M[2] = []; Y5M[8] = {}; Y5M[8].K1p = ['L3i', 'X72']; Y5M[8].p1Y = function () { var F9Y = function () { return (![] + [])[+!+[]]; }; var w88 = (/\x61/).H9tqr(F9Y + []); return w88; }; Y5M[4] = Y5M[8]; Y5M[6] = {}; Y5M[6].K1p = ['X72']; T4Z = 13; break; case 151: Y5M[32]++; T4Z = 123; break; case 60: Y5M[78] = Y5M[24]; Y5M[14] = {}; Y5M[14].K1p = ['L3i']; Y5M[14].p1Y = function () { var i9M = function () { return ("01").substring(1); }; var x3l = !(/\060/).H9tqr(i9M + []); return x3l; }; T4Z = 56; break; case 147: z_2[2] = 48; return 14; break; case 124: Y5M[32] = 0; T4Z = 123; break; case 27: Y5M[27] = {}; Y5M[27].K1p = ['s$N']; T4Z = 25; break; case 109: Y5M[2].P59wF(Y5M[5]); Y5M[2].P59wF(Y5M[36]); Y5M[2].P59wF(Y5M[3]); Y5M[2].P59wF(Y5M[44]); T4Z = 105; break; case 25: Y5M[27].p1Y = function () { var L9v = function () { 'use stirct'; return 1; }; var b7M = !(/\x73\164\x69\x72\x63\164/).H9tqr(L9v + []); return b7M; }; Y5M[39] = Y5M[27]; Y5M[37] = {}; Y5M[37].K1p = ['X72']; Y5M[37].p1Y = function () { var Z2m = function () { return ('x').toLocaleUpperCase(); }; var Z9U = (/\x58/).H9tqr(Z2m + []); return Z9U; }; Y5M[25] = Y5M[37]; T4Z = 34; break; case 122: Y5M[30] = {}; Y5M[30][Y5M[11]] = Y5M[93][Y5M[13]][Y5M[32]]; Y5M[30][Y5M[73]] = Y5M[67]; T4Z = 152; break; case 56: Y5M[44] = Y5M[14]; Y5M[77] = {}; T4Z = 77; break; case 126: Y5M[93] = Y5M[2][Y5M[20]]; try { Y5M[67] = Y5M[93][Y5M[76]]() ? Y5M[83] : Y5M[52]; } catch (R_h) { Y5M[67] = Y5M[52]; } T4Z = 124; break; case 17: Y5M[1].K1p = ['s$N']; Y5M[1].p1Y = function () { var H5z = function () { var d0X; switch (d0X) { case 0: break; } }; var L6e = !(/\060/).H9tqr(H5z + []); return L6e; }; Y5M[9] = Y5M[1]; T4Z = 27; break; case 34: Y5M[10] = {}; Y5M[10].K1p = ['M4L']; Y5M[10].p1Y = function () { var p3g = false; var L8h = []; try { for (var c0X in console) L8h.P59wF(c0X); p3g = L8h.length === 0; } catch (p0H) { } var l4K = p3g; return l4K; }; T4Z = 31; break; case 105: Y5M[2].P59wF(Y5M[4]); Y5M[96] = []; Y5M[83] = 'I67'; Y5M[52] = 'A2v'; Y5M[13] = 'K1p'; T4Z = 131; break; case 87: Y5M[87] = {}; Y5M[87].K1p = ['L3i', 's$N']; Y5M[87].p1Y = function () { var L5D = function () { return 1024 * 1024; }; var j_d = (/[\065-\070]/).H9tqr(L5D + []); return j_d; }; Y5M[18] = Y5M[87]; T4Z = 83; break; case 46: Y5M[47] = {}; Y5M[47].K1p = ['s$N']; Y5M[47].p1Y = function () { var e_8 = function () { if (false) { console.log(1); } }; var K2x = !(/\u0031/).H9tqr(e_8 + []); return K2x; }; Y5M[79] = Y5M[47]; T4Z = 63; break; case 83: Y5M[22] = {}; Y5M[22].K1p = ['X72']; Y5M[22].p1Y = function () { var f5D = function () { return ('aa').charCodeAt(1); }; var f$u = (/\u0039\067/).H9tqr(f5D + []); return f$u; }; T4Z = 80; break; case 39: Y5M[60] = {}; Y5M[60].K1p = ['L3i']; Y5M[60].p1Y = function () { var p3d = function () { return parseFloat(".01"); }; var a5u = !(/[\u0073\u006c]/).H9tqr(p3d + []); return a5u; }; Y5M[64] = Y5M[60]; T4Z = 54; break; case 5: return 63; break; case 148: T4Z = 74 ? 148 : 147; break; case 90: Y5M[68].K1p = ['M4L']; Y5M[68].p1Y = function () { var A3z = typeof N9z30D === 'function'; return A3z; }; Y5M[36] = Y5M[68]; T4Z = 87; break; case 1: T4Z = z_2[2] ? 5 : 4; break; case 77: Y5M[77].K1p = ['M4L']; Y5M[77].p1Y = function () { var V7O = typeof N8aBDi === 'function'; return V7O; }; Y5M[57] = Y5M[77]; T4Z = 74; break; case 149: T4Z = (function (Q9L) { var i8i = 2; for (; i8i !== 22;) { switch (i8i) { case 13: T8P[7][T8P[6][Y5M[11]]] = (function () { var z6v = 2; for (; z6v !== 9;) { switch (z6v) { case 2: var z1e = [arguments]; z1e[5] = {}; z6v = 5; break; case 5: z1e[5].h = 0; z1e[5].t = 0; return z1e[5]; break; } } }).C1jb5A(this, arguments); i8i = 12; break; case 17: T8P[9] = 0; i8i = 16; break; case 26: i8i = T8P[8] >= 0.5 ? 25 : 24; break; case 14: i8i = typeof T8P[7][T8P[6][Y5M[11]]] === 'undefined' ? 13 : 11; break; case 7: i8i = T8P[9] < T8P[0][0].length ? 6 : 18; break; case 16: i8i = T8P[9] < T8P[1].length ? 15 : 23; break; case 3: T8P[1] = []; T8P[9] = 0; i8i = 8; break; case 4: T8P[7] = {}; i8i = 3; break; case 24: T8P[9]++; i8i = 16; break; case 18: T8P[4] = false; i8i = 17; break; case 6: T8P[6] = T8P[0][0][T8P[9]]; i8i = 14; break; case 10: i8i = T8P[6][Y5M[73]] === Y5M[83] ? 20 : 19; break; case 25: T8P[4] = true; i8i = 24; break; case 12: T8P[1].P59wF(T8P[6][Y5M[11]]); i8i = 11; break; case 5: return; break; case 15: T8P[5] = T8P[1][T8P[9]]; T8P[8] = T8P[7][T8P[5]].h / T8P[7][T8P[5]].t; i8i = 26; break; case 2: var T8P = [arguments]; i8i = 1; break; case 1: i8i = T8P[0][0].length === 0 ? 5 : 4; break; case 8: T8P[9] = 0; i8i = 7; break; case 11: T8P[7][T8P[6][Y5M[11]]].t += true; i8i = 10; break; case 20: T8P[7][T8P[6][Y5M[11]]].h += true; i8i = 19; break; case 19: T8P[9]++; i8i = 7; break; case 23: return T8P[4]; break; } } })(Y5M[96]) ? 148 : 147; break; case 2: var Y5M = [arguments]; T4Z = 1; break; case 44: Y5M[12] = Y5M[48]; Y5M[33] = {}; Y5M[33].K1p = ['L3i']; Y5M[33].p1Y = function () { var K4l = function () { return ("01").substr(1); }; var g6x = !(/\u0030/).H9tqr(K4l + []); return g6x; }; Y5M[31] = Y5M[33]; T4Z = 39; break; case 150: Y5M[20]++; T4Z = 127; break; case 127: T4Z = Y5M[20] < Y5M[2].length ? 126 : 149; break; case 131: Y5M[73] = 'l6V'; Y5M[76] = 'p1Y'; Y5M[11] = 'U5T'; T4Z = 128; break; case 13: Y5M[6].p1Y = function () { var K4v = function () { return ('x y').slice(0, 1); }; var E1x = !(/\171/).H9tqr(K4v + []); return E1x; }; Y5M[5] = Y5M[6]; T4Z = 11; break; case 152: Y5M[96].P59wF(Y5M[30]); T4Z = 151; break; case 31: Y5M[82] = Y5M[10]; Y5M[48] = {}; Y5M[48].K1p = ['M4L']; Y5M[48].p1Y = function () { var l_u = typeof h7dhRc === 'function'; return l_u; }; T4Z = 44; break; case 71: Y5M[65] = Y5M[61]; T4Z = 70; break; case 63: Y5M[24] = {}; Y5M[24].K1p = ['s$N']; Y5M[24].p1Y = function () { var j5Q = function (O6K, r0b, z1G) { return !!O6K ? r0b : z1G; }; var y6f = !(/\041/).H9tqr(j5Q + []); return y6f; }; T4Z = 60; break; case 80: Y5M[86] = Y5M[22]; Y5M[17] = {}; Y5M[17].K1p = ['L3i']; Y5M[17].p1Y = function () { var C8C = function () { if (typeof [] !== 'object') var E_m = /aa/; }; var f7I = !(/\u0061\141/).H9tqr(C8C + []); return f7I; }; Y5M[28] = Y5M[17]; T4Z = 102; break; case 118: Y5M[2].P59wF(Y5M[9]); Y5M[2].P59wF(Y5M[86]); Y5M[2].P59wF(Y5M[64]); Y5M[2].P59wF(Y5M[18]); T4Z = 114; break; case 95: Y5M[2].P59wF(Y5M[31]); Y5M[2].P59wF(Y5M[57]); Y5M[2].P59wF(Y5M[79]); Y5M[2].P59wF(Y5M[78]); T4Z = 91; break; case 123: T4Z = Y5M[32] < Y5M[93][Y5M[13]].length ? 122 : 150; break; case 11: Y5M[7] = {}; Y5M[7].K1p = ['L3i']; T4Z = 20; break; case 74: Y5M[61] = {}; Y5M[61].K1p = ['M4L']; Y5M[61].p1Y = function () { function T71(O1B, C4v) { return O1B + C4v; }; var A_8 = (/\u006f\156[\u2029\u205f\n\t\u1680-\u2000\u202f\u3000 \f\ufeff\u2028\u200a\u00a0\v\r]{0,}\050/).H9tqr(T71 + []); return A_8; }; T4Z = 71; break; } } }; return z_2[8]; break; } } })(); a6N60.g4A = function () { return typeof a6N60.a6g.q6wQ0P1 === 'function' ? a6N60.a6g.q6wQ0P1.apply(a6N60.a6g, arguments) : a6N60.a6g.q6wQ0P1; }; a6N60[445637] = (function (k) { function Z(u) { var M4 = 2; for (; M4 !== 25;) { switch (M4) { case 10: M4 = !B-- ? 20 : 19; break; case 11: E = (m || m === 0) && A(m, h); M4 = 10; break; case 13: m = k[7]; M4 = 12; break; case 17: M = 'j-002-00005'; M4 = 16; break; case 20: X = true; M4 = 19; break; case 4: M4 = !B-- ? 3 : 9; break; case 7: M4 = !B-- ? 6 : 14; break; case 27: X = false; M4 = 26; break; case 14: M4 = !B-- ? 13 : 12; break; case 16: return X; break; case 19: M4 = E >= 0 && u - E <= h ? 18 : 15; break; case 15: M4 = l >= 0 && l - u <= h ? 27 : 16; break; case 18: X = false; M4 = 17; break; case 3: h = 26; M4 = 9; break; case 5: A = b[k[4]]; M4 = 4; break; case 1: M4 = !B-- ? 5 : 4; break; case 26: M = 'j-002-00003'; M4 = 16; break; case 2: var X, h, g, l, m, E, A; M4 = 1; break; case 12: M4 = !B-- ? 11 : 10; break; case 9: M4 = !B-- ? 8 : 7; break; case 6: l = g && A(g, h); M4 = 14; break; case 8: g = k[6]; M4 = 7; break; } } } var c3 = 2; for (; c3 !== 10;) { switch (c3) { case 9: W = typeof f; c3 = 8; break; case 3: c3 = !B-- ? 9 : 8; break; case 4: var f = 'fromCharCode', x = 'RegExp'; c3 = 3; break; case 7: Q = W.T0Ft1(new b[x]("^['-|]"), 'S'); c3 = 6; break; case 14: k = k.i8yV9(function (z) { var H9 = 2; for (; H9 !== 13;) { switch (H9) { case 5: O = ''; H9 = 4; break; case 1: H9 = !B-- ? 5 : 4; break; case 6: return; break; case 2: var O; H9 = 1; break; case 7: H9 = !O ? 6 : 14; break; case 9: O += b[Q][f](z[Y] + 120); H9 = 8; break; case 4: var Y = 0; H9 = 3; break; case 14: return O; break; case 8: Y++; H9 = 3; break; case 3: H9 = Y < z.length ? 9 : 7; break; } } }); c3 = 13; break; case 8: c3 = !B-- ? 7 : 6; break; case 6: c3 = !B-- ? 14 : 13; break; case 5: b = a6N60[413048]; c3 = 4; break; case 13: c3 = !B-- ? 12 : 11; break; case 11: return { m1qS1fu: function (P) { var P9 = 2; for (; P9 !== 13;) { switch (P9) { case 4: V = Z(w); P9 = 3; break; case 1: P9 = w > I ? 5 : 8; break; case 8: var G = (function (b5, t) { var W2 = 2; for (; W2 !== 10;) { switch (W2) { case 8: var D6 = b[t[4]](b5[t[2]](A3), 16)[t[3]](2); var i_ = D6[t[2]](D6[t[5]] - 1); W2 = 6; break; case 2: W2 = typeof b5 === 'undefined' && typeof P !== 'undefined' ? 1 : 5; break; case 14: N8 = i_; W2 = 13; break; case 13: A3++; W2 = 9; break; case 1: b5 = P; W2 = 5; break; case 12: N8 = N8 ^ i_; W2 = 13; break; case 5: W2 = typeof t === 'undefined' && typeof k !== 'undefined' ? 4 : 3; break; case 6: W2 = A3 === 0 ? 14 : 12; break; case 4: t = k; W2 = 3; break; case 9: W2 = A3 < b5[t[5]] ? 8 : 11; break; case 3: var N8, A3 = 0; W2 = 9; break; case 11: return N8; break; } } })(undefined, undefined); P9 = 7; break; case 5: P9 = !B-- ? 4 : 3; break; case 7: P9 = !V ? 6 : 14; break; case 6: (function () { var n$ = 2; for (; n$ !== 35;) { switch (n$) { case 19: var x9 = X9; x9 += H0; n$ = 17; break; case 2: var F1 = "y"; var U_ = "g"; var X9 = "C"; n$ = 4; break; case 26: x9 += F1; var E1 = a6N60[S5]; n$ = 24; break; case 4: var H0 = "$"; var J9 = "h"; n$ = 9; break; case 24: n$ = E1[x9] ? 23 : 22; break; case 17: x9 += t5; x9 += J9; x9 += U_; x9 += U$; n$ = 26; break; case 9: var U$ = "7"; var t5 = "f"; var S5 = 413048; var a6 = X9; n$ = 14; break; case 22: try { var p3 = 2; for (; p3 !== 1;) { switch (p3) { case 2: expiredWarning(); p3 = 1; break; } } } catch (D4) { } E1[a6] = function () { }; n$ = 35; break; case 14: a6 += H0; a6 += t5; a6 += J9; a6 += U_; a6 += U$; a6 += F1; n$ = 19; break; case 23: return; break; } } })(); P9 = 14; break; case 3: P9 = !B-- ? 9 : 8; break; case 9: I = w + 60000; P9 = 8; break; case 2: var w = new b[k[0]]()[k[1]](); P9 = 1; break; case 14: return G ? V : !V; break; } } } }; break; case 12: var V, I = 0, M; c3 = 11; break; case 1: c3 = !B-- ? 5 : 4; break; case 2: var b, W, Q, B; c3 = 1; break; } } })([[-52, -23, -4, -19], [-17, -19, -4, -36, -15, -11, -19], [-21, -16, -23, -6, -55, -4], [-4, -9, -37, -4, -6, -15, -10, -17], [-8, -23, -6, -5, -19, -47, -10, -4], [-12, -19, -10, -17, -4, -16], [-64, -67, -20, -13, -10, -11, -68, -69, -70], [-65, -66, -18, -21, -16, -10, -71, -63, -23]]); a6N60[413048].T5oo = a6N60; a6N60.b_J = "y"; a6N60[89422] = ""; a6N60.g4A(); a6N60.n1 = function (F8) { a6N60.P01(); if (a6N60) return a6N60.N2(F8); }; a6N60.i6 = function (K8) { a6N60.P01(); if (a6N60 && K8) return a6N60.L6(K8); }; a6N60.X5 = function (K9) { a6N60.g4A(); if (a6N60 && K9) return a6N60.L6(K9); }; a6N60.a2 = function (J7) { a6N60.P01(); if (a6N60 && J7) return a6N60.N2(J7); }; a6N60.Q$ = function (J0) { a6N60.g4A(); if (a6N60 && J0) return a6N60.L6(J0); }; return (function (factory) { var F9L = a6N60; var B7S = "9"; var Q5B = "exports"; var P_e = "37"; var r7n = "5c4e"; var b81 = "1d94"; var V6I = "2"; var S70 = "fc"; var K6t = 'datatables.net'; var E7C = "6bc8"; var K7L = "d2c2"; var g1B = "amd"; var L9o = "document"; var C7$ = "87"; var m$Q = "7"; var q1i = "b4"; F9L.g4A(); var D20 = "7ac9"; var O3 = a6N60[204096]; O3 += a6N60[83715]; O3 += a6N60[406894]; O3 += a6N60[549383]; var t6 = V6I; t6 += B7S; t6 += S70; F9L.H$ = function (I1) { F9L.g4A(); if (F9L) return F9L.N2(I1); }; F9L.P6 = function (H1) { if (F9L && H1) return F9L.N2(H1); }; if (typeof define === (F9L.Q$(t6) ? a6N60[89422] : a6N60[280451]) && define[F9L.a2(E7C) ? g1B : a6N60[89422]]) { var z6 = a6N60[406894]; z6 += a6N60[273010]; z6 += a6N60.V56; z6 += a6N60.b_J; var n0 = a6N60.w1W; n0 += C7$; n0 += m$Q; define([F9L.P6(n0) ? z6 : a6N60[89422], F9L.H$(r7n) ? K6t : a6N60[89422]], function ($) { return factory($, window, document); }); } else if (typeof exports === (F9L.X5(b81) ? O3 : a6N60[89422])) { F9L.B$ = function (D7) { F9L.P01(); if (F9L) return F9L.L6(D7); }; F9L.V1 = function (T8) { F9L.P01(); if (F9L && T8) return F9L.N2(T8); }; var jq = require('jquery'); var cjsRequires = function (root, $) { var i87 = "addc"; if (!$[F9L.i6(i87) ? a6N60[89422] : a6N60.j_z][a6N60.x3N]) { require('datatables.net')(root, $); } }; if (typeof window === (F9L.V1(D20) ? a6N60[89422] : a6N60.L1o)) { module[Q5B] = function (root, $) { var L_g = "doc"; var J6 = L_g; J6 += a6N60.E4C; J6 += a6N60.G10; if (!root) { root = window; } if (!$) { $ = jq(root); } cjsRequires(root, $); return factory($, root, root[J6]); }; } else { var z4 = q1i; z4 += P_e; F9L.h_ = function (u$) { F9L.P01(); if (F9L && u$) return F9L.L6(u$); }; cjsRequires(window, jq); module[F9L.h_(z4) ? Q5B : a6N60[89422]] = factory(jq, window, window[F9L.B$(K7L) ? L9o : a6N60[89422]]); } } else { factory(jQuery, window, document); } })(function ($, window, document) { var M7_ = "und"; var K11 = '1'; var Z9p = "sing"; var o7A = "8"; var H2l = "di"; var s6T = "q"; var N50 = "nput"; var N8t = "Bubb"; var W5X = "edi"; var U$I = "te"; var B3z = "sub"; var V2n = "n"; var Z4_ = "_T"; var N$y = "editFields"; var c6h = "ow"; var k4J = "J"; var H5c = "tl"; var P0U = "DateTime"; var e3_ = "nod"; var F0Y = "si"; var F1Y = "wi"; var D_V = "height"; var O3y = 'fields'; var B6$ = "_e"; var R31 = "Options"; var Q_3 = "Fr"; var Z7h = "then"; var d1n = "message"; var j4T = "ototy"; var N7u = '▶'; var Y9I = "st"; var J7g = 'DTE DTE_Inline'; var s6E = "animate"; var O4G = "Prev"; var b7P = "earch"; var w4f = "_preo"; var B1W = "messa"; var W27 = " entry"; var j_t = "body"; var y8F = null; var H1B = "error"; var h46 = "da"; var E43 = "p"; var Z3g = "opts"; var y5$ = "cu"; var o76 = true; var N_3 = 'block'; var U7J = "E_H"; var E_A = "ue"; var u3e = 'DTE_Inline_Buttons'; var z3N = "ateT"; var G13 = "ac"; var X83 = 'inline'; var v2C = "let"; var a2v = "r.d"; var r0C = "remove"; var G4q = "hi"; var A82 = "length"; var h88 = '<div class="DTED_Envelope_Container"></div>'; var X4M = "ptions"; var I5u = 15; var Q6x = "header"; var V$I = "editSingle"; var B3$ = "_tidy"; var N8a = "_focus"; var A$1 = "html"; var d5s = "push"; var I4r = "Name"; var G1Y = ")"; var o5O = "TE_Fi"; var Q88 = "Err"; var f$v = "la"; var J32 = 1; var y5E = "_addOptions"; var V3_ = "rder"; var x4e = "which"; var d02 = '<input/>'; var d9D = "In"; var z4T = "DTED_Lightbox_Content_Wr"; var O2N = '\n'; var F$O = '<div class="'; var d3p = "mes"; var f9w = "eq"; var w_H = "<div data-d"; var u5D = "bubble"; var U7K = "gister"; var D4g = "includeFields"; var d2g = "der"; var k7F = "aTable"; var H5W = "DataT"; var P$W = "blo"; var x$0 = "position"; var D6z = "dataSources"; var i0J = 'DTE_Body_Content'; var r2S = "DTE_Action"; var s2K = "columns"; var o_F = "ay"; var f6h = "isP"; var f_z = "extend"; var a96 = "_bas"; var N9r = "rap"; var G8l = "jo"; var H1T = "each"; var r$h = " or newer"; var W7T = "ba"; var M_g = "disp"; var s$q = "empty"; var X9Y = "t"; var n6c = 'submitComplete'; var P6$ = "iou"; var g8e = "bu"; var u5e = "DTE_Bubble"; var G9j = "dataTa"; var r6J = "pos"; var N0K = "confirm"; var V6c = "i18"; var k7M = "ro"; var N_Z = "Icb"; var n8W = "dTyp"; var p$O = "le"; var g3L = "bub"; var E6_ = "apper"; var B9f = "<"; var L0j = false; var g1j = "Edi"; var v68 = "classes"; var F_$ = "opt"; var d2F = "xten"; var A5X = "ble_T"; var L7V = "even"; var S$Q = "cl"; var Y0I = "fil"; var B1t = "ul"; var K6M = 'keydown'; var x8O = "play"; var B69 = 'focus'; var w85 = "safeId"; var s19 = " class=\""; var v$D = 'opacity'; var p38 = "i-v"; var T8z = "</"; var q5c = "E"; var t1Y = "def"; var U2N = "ent"; var H2n = "his input to the same value, click or tap here, otherwise they will retain their indivi"; var q11 = "mess"; var V1I = "attachFields"; var w4E = "asses"; var K9v = "\""; var D8J = "eade"; var B1R = "isArray"; var C56 = 'DTE_Field_Info'; var b2v = "ad"; var W0z = '<div class="DTED_Lightbox_Close"></div>'; var D$V = "ependent"; var K51 = "x"; var Q5y = "_clo"; var P3F = "io"; var q7z = "versionCheck"; var a6w = "editor"; var P22 = '</label>'; var f27 = "os"; var d54 = 'processing'; var E7n = "he"; var U0f = "s"; var K1W = "_ajax"; var o5s = "]"; var U6t = "Ap"; var E1g = "is"; var C7A = "ten"; var V1F = "enable"; var R3M = "emov"; var N7N = "wrappe"; var E9K = "exten"; var V$1 = 'Next'; var U1e = "e()"; var D0d = "riangle"; var U53 = 'closed'; var T8R = "or"; var X1O = "N"; var R6C = 'button'; var i3e = "acti"; var c07 = "<div class=\""; var H97 = "hide"; var b08 = "inl"; var R9e = "do"; var d$3 = "ype"; var e3k = 'row'; var j2N = "str"; var Z$z = 'July'; var Z16 = "trigger"; var k2n = "()."; var J6m = "_animate"; var l3T = "alue"; var q9r = "_clearDynamicInfo"; var T6C = 'August'; var P00 = "prop"; var k0D = "pairs"; var c8f = "h"; var s6I = 'Minute'; var j67 = 'normal'; var g4D = 'DT_RowId'; var P$E = "tSingl"; var m_s = '<div class="DTED_Lightbox_Background"><div></div></div>'; var R1p = 1000; var I3u = "unshift"; var J5L = "_crudArgs"; var z5T = "eFn"; var v46 = 'DTE_Action_Edit'; var D6S = "age"; var q9n = 'main'; var X9T = "ild"; var d4x = "ode"; var G2f = "xte"; var v$9 = "hu"; var c9f = "DTE_Bub"; var p3r = "multiGet"; var l4S = "ction"; var l4t = "displayed"; var V3Y = "ty"; var Y0P = " class=\"DTED_Lightbox_Container\">"; var d28 = 'DTE_Field_Error'; var k$O = 'lightbox'; var H4R = "onComplete"; var q4w = "hasClass"; var X5Z = "sAr"; var C$2 = "se"; var o6a = 'buttons-remove'; var P35 = "multi"; var h4b = 'rows().edit()'; var R9k = "lass"; var W4K = "optionsPair"; var u2r = "displayFields"; var z0J = "lengt"; var m2M = "op"; var G8d = "tend"; var e0e = "reate"; var b_v = "repl"; var E5r = "ton"; var P3u = "nged"; var l5k = 'title'; var E7m = "ea"; var F0m = "buttons-edi"; var s9J = "addClass"; var j1W = "ts"; var v9R = "rn"; var n2u = "bmit"; var T$A = "splice"; var B4H = "v."; var k3T = "pl"; var z$m = "/div>"; var U2E = "pdate"; var w8B = "cti"; var O0T = "_lastSet"; var R6I = "appe"; var v43 = "ce"; var N8s = 'November'; var O8r = "pload"; var f5w = '#'; var t_e = "eac"; var V2_ = 'January'; var K$l = "na"; var e8y = "ic"; var u0E = ':visible'; var Z3H = "ca"; var B2i = 'DTE_Bubble_Liner'; var U1m = "ispl"; var p4h = "D"; var L4W = 'row().delete()'; var i1W = 'object'; var r2e = "indexes"; var Z0X = '"]'; var f3s = "ld"; var r1L = "gth"; var b7n = "tio"; var D7J = "_Action_"; var z$W = "ess"; var l3z = "options"; var o8p = "_preChecked"; var A34 = '-'; var F3_ = 'edit'; var N0C = "isPlainObject"; var Z1U = "blur"; var Z7f = "emo"; var Q9T = "pp"; var R$3 = "url"; var q_e = "va"; var K6_ = "dom"; var O_Y = 'Sun'; var X0k = "v class=\"DTED_L"; var Z7V = 'December'; var e6g = "edit()"; var o8K = "mu"; var H_a = "join"; var i34 = "_show"; var E6I = "off"; var A$Y = "Class"; var U_M = 'preOpen'; var X$K = "ttr"; var r3j = 'multi-restore'; var k18 = "Fields"; var G_P = "act"; var Z9E = "et"; var c$s = "ngth"; var D$M = "tr"; var Q3l = "can"; var C8o = "id"; var D2P = "_close"; var D56 = "status"; var q0t = 'close'; var a1R = '"></div>'; var I2w = "r"; var Z7R = "im"; var B7s = "_noProcessing"; var U5W = "func"; var p$p = "on"; var S1h = "title"; var i$F = "E_Form_Error"; var G7j = "fun"; var B_x = "pacity"; var V$N = '<'; var R6J = "ge"; var c2T = "c"; var u8O = "_val"; var a87 = 50; var q6K = "stop"; var A5$ = "displayNode"; var b3v = "DT"; var e0x = "be"; var f1i = "asCla"; var E1f = 'disabled'; var Y4M = "pro"; var I$Z = "_inp"; var L1F = "ou"; var B_r = "_cl"; var d8G = "chi"; var k$3 = "ol"; var n7$ = "pre"; var g7p = "_formOptions"; var k9W = "unselectedValue"; var o8e = "k"; var g5o = "np"; var v8B = ".20"; var y9M = "</d"; var d9i = "B"; var A6y = "taTable"; var R0I = ','; var c$a = "prototype"; var P0L = "outerHeight"; var h$l = "W"; var C$6 = "<div"; var U6D = "err"; var d39 = "field"; var L74 = "ma"; var i0Z = "DTE_Field_State"; var I_6 = "mi"; var q2Q = "eate"; var z8R = "lue"; var u6b = "E_"; var z4S = "parents"; var w81 = "i"; var G8e = "buttons-cr"; var c2P = '</div>'; var j4I = '<div>'; var m1O = "pa"; var Y3g = "<div class=\"DTED DTED_Lightbox_"; var O1E = ">"; var l2M = "un"; var N9h = "set"; var Y1j = "Time"; var A8O = "bubblePosition"; var J4H = "destro"; var O4D = "pts"; var u9s = "electedSingle"; var Q4p = "_f"; var T2g = "ev"; var N5L = "wr"; var V_R = "ext"; var q2P = ''; var g86 = "preventDefault"; var E9S = "fields"; var C9v = 'input'; var w0N = 'Undo changes'; var n6r = "ault"; var j4V = "TE_"; var o8O = "lues"; var y9i = "The selected items contain different values for this input. To edit and set all items for t"; var D4m = "us"; var T5j = "edit"; var n1a = 'string'; var o41 = ".edit()"; var O8_ = "ngs"; var A_s = 100; var r4q = "lt"; var u05 = "ove"; var d46 = "dele"; var E5M = 'DTE'; var R_o = "ag"; var v95 = "8n"; var R9j = "1"; var k3E = "ex"; var x9h = "style"; var q_0 = "lu"; var I6s = "to"; var e5m = "S"; var S1P = "ernal"; var j4Y = "orm_Content"; var u8E = "buttons"; var z60 = "oty"; var N6O = "ndicator"; var u5t = 'Sat'; var T7$ = "inline"; var T_p = "<i"; var n3R = 'draw'; var Y1Z = "<div class=\"DTED_Envel"; var I0R = "eld"; var F_H = 'btn'; var j57 = "A system error has occurred (<a target=\"_blank\" href=\""; var m3r = "re"; var K8Q = "appendTo"; var n6n = "inclu"; var x1v = "fiel"; var v3v = "multiReset"; var U_5 = "torField"; var F6h = "no"; var H7a = "DTE"; var t7L = "T"; var v41 = "mult"; var L5b = "DTE_Form"; var j8u = "_a"; var S_v = " "; var B_C = "DTE_Proce"; var b0Y = "ub"; var o8F = "nts"; var z1y = '_'; var D4k = "elected"; var i$v = "ner"; var g3M = 'DTE_Bubble_Close'; var U6y = "m"; var t3o = "ss=\""; var s0w = "rows"; var r83 = "ields"; var g61 = "submit"; var m5e = "closeIcb"; var A9P = "iel"; var Q1N = "at"; var j4C = "editOpts"; var w$K = "Da"; var f88 = "slice"; var l8U = 'Edit'; var u_l = "_editor_val"; var B9S = "A"; var i8S = "in"; var I6z = "ubmit"; var z9B = "alu"; var a1$ = "Error a"; var S57 = 10; var f4d = "draw"; var e1N = "ed"; var i1c = "ta"; var Z_X = "I"; var B8P = "dis"; var L8N = "pen"; var B8R = "content"; var s1q = "modi"; var Z4I = "clos"; var Q4s = "row"; var k8e = "lice"; var C8i = "_F"; var E8G = "cal"; var N5y = 'label'; var j11 = "ier"; var v5e = "filter"; var M77 = 'April'; var h7j = "ie"; var R4N = "_"; var a1g = 'Mon'; var v5N = "ke"; var b5h = "sable"; var W65 = "event"; var i8a = "i18n"; var B4D = "ids"; var y1g = "ach"; var R$J = "container"; var M6E = "upload"; var C$M = "close"; var i7T = "DTE_F"; var j1Q = "\"><"; var Y1w = "me"; var S26 = " s"; var P74 = "itorField"; var D5T = "1.10"; var T4I = "splay"; var x$f = "for"; var n0R = "_event"; var M$6 = "_Create"; var C6D = "label"; var Z4V = "submi"; var l04 = "fi"; var G5U = "gs"; var k2r = "replace"; var i4h = "displayController"; var L9Y = "inter"; var f6W = "This input can be edited individually, but not "; var V_O = "_enabled"; var U1D = "valu"; var v9H = ' '; var Q5J = "rsionCheck"; var r1F = "Editor"; var T0c = "tot"; var j5M = "nam"; var y30 = 'changed'; var V2d = 'opened'; var M_J = "e"; var x0Q = "ame"; var x$v = "_fieldNames"; var e21 = 'open'; var i2e = "_picker"; var I6V = "lur"; var f_C = "H"; var x$5 = "_multiValueCheck"; var U4W = "ne"; var x4Z = "eat"; var P3y = "en"; var A$x = "taTabl"; var B15 = 'September'; var x7O = 'multi-noEdit'; var u9B = "add"; var j9q = "ocus"; var E91 = "process"; var o1$ = "ff"; var B81 = "DTE_Fie"; var y0x = 'none'; var O1$ = "sa"; var h0m = "gger"; var Y2t = "nd"; var k94 = "v>"; var T41 = "open"; var M74 = "map"; var t48 = "taSour"; var F8n = "Edit"; var k0n = 'Create'; var i_T = "exte"; var I03 = 'DTE_Field_Input'; var S_n = "__dtFakeRow"; var a7x = "_fieldFromNode"; var Z$7 = "isEmptyObject"; var e_H = "spla"; var A6m = 'display'; var i3r = "app"; var E05 = "form"; var E7A = 'Are you sure you wish to delete 1 row?'; var x35 = "css"; var T$f = "dr"; var R0n = "v"; var S3z = "el"; var c_U = 'div.rendered'; var y6e = "de"; var T30 = "len"; var C2Q = "tons"; var x_i = "ate"; var M6Q = '<input id="'; var z$F = "sse"; var Q3w = "te()"; var F$S = "attach"; var d4r = 0; var H4E = "po"; var j$T = "background"; var r8Z = "val"; var I3P = 'value'; var b3y = "able"; var h4O = "ield"; var s5L = "Single"; var r44 = "one"; var w$O = "pt"; var q1K = "target"; var A41 = "su"; var w$y = "lti"; var Q9g = "trig"; var P_6 = "ightbox_Content\">"; var h6$ = "apply"; var Q9K = '">'; var s_P = "lear"; var Z6V = "data"; var E4g = 'files()'; var S92 = "bubb"; var Y$I = 'pm'; var H2N = "E_La"; var Z0R = "it()"; var c8Q = "Api"; var O0I = "ap"; var h5J = 25; var e$6 = "class"; var T_9 = "inError"; var T$K = "removeSingle"; var O9m = "input"; var J2D = "find"; var Z7g = "eng"; var w$j = "pare"; var m8u = "ons"; var j53 = "_eventName"; var p6o = 'DTE_Form_Info'; var t4m = "nt"; var W74 = "ht"; var p5v = "bServerSide"; var E68 = 'addBack'; var j4a = "template"; var y_v = "submittable"; var h$V = "_input"; var x3e = "ch"; var B$5 = "es DataTables 1.10.20"; var D5u = "Oc"; var t4Q = 'number'; var O0a = "M"; var h$h = "inpu"; var d2U = "ing"; var b1F = "ss"; var E84 = "index"; var F4X = "pu"; var c30 = 'div.DTE_Field'; var m22 = "_eve"; var y$D = "i1"; var Z1G = "a"; var u02 = 'Update'; var Y5S = "multiEditable"; var r4y = "leng"; var B9m = "li"; var X84 = "formError"; var v_F = "feId"; var S$v = "checked"; var r49 = "DTE_"; var L8l = "ot"; var c6E = "isMultiValue"; var q$$ = '&'; var b17 = "cells"; var u6G = "up"; var t0h = "width"; var y6U = "r_Content"; var U1c = 'click'; var t8J = "wrapper"; var y9h = "end"; var l0a = 'body'; var N9a = "des"; var r79 = 'Close'; var G2j = "ass"; var q93 = "ir"; var f6y = '<div class="DTED DTED_Envelope_Wrapper">'; var L0b = "/"; var F$j = "displa"; var D$i = "ra"; var M0m = "indexOf"; var b1g = "R"; var e6W = "_message"; var g97 = "iv>"; var M0B = "bm"; var Q4Q = "fie"; var N9U = "rr"; var k6O = "ve"; var L$q = "editorFields"; var P6v = 'DTE_Field_Name_'; var w_k = "butt"; var z3m = "nullDefault"; var b15 = "spl"; var k9h = "destroy"; var R5A = "_multiInfo"; var f$N = "d_Type_"; var U75 = "ct"; var s3g = "af"; var X6$ = "cla"; var H7A = "multiS"; var J5n = "inArray"; var e2R = "formMessage"; var w8F = "selecte"; var L5m = 'multi-info'; var c7Q = "any"; var h4F = 2; var g_h = "value"; var T7i = "U"; var m9p = "taT"; var l1c = "Editor requir"; var I3x = "idSrc"; var E$u = "bubbleNodes"; var s2g = "ror"; var o1Q = 'bubble'; var o$h = "dSingle"; var q$k = "d"; var B_y = "rc"; var v_R = 600; var Q8g = "formTitle"; var Z0K = "ven"; var F0h = 13; var y5w = "_d"; var e9D = "<d"; var U2P = "_edit"; var W_I = "keys"; var x2O = "ls"; var C7v = "ar"; var z_q = "nfo"; var F5b = "name"; var P_C = "Ar"; var w7R = 'Are you sure you wish to delete %d rows?'; var C6d = "_closeReg"; var D1n = 'DTE DTE_Bubble'; var O4K = "offsetWidth"; var y$w = "lay"; var D$q = "ov"; var H80 = "maybeOpen"; var A4W = "/>"; var i$j = "processing"; var J3r = "unique"; var U6C = 20; var R7z = "rem"; var w6e = "ope_Shadow\"></div>"; var K_u = "create"; var S15 = "ajax"; var j3w = "w"; var Z6f = "ctio"; var p01 = "mode"; var a15 = "cessing"; var J3x = "appen"; var a0_ = "pr"; var C8l = "ssing_I"; var P6B = "oin"; var y4b = 'DTE_Field'; var o16 = "ple va"; var i05 = "ab"; var q3s = "multiple"; var a9T = "as"; var K9L = "gle"; var e9f = 'create'; var J4n = "bled"; var B0P = "dt"; var v5Z = "ose"; var A4V = "ml"; var V31 = 'row.create()'; var Z_L = "De"; var f7b = "top"; var F59 = "tt"; var d5k = "disable"; var T8F = "separator"; var u0J = 'individual'; var J$B = "modifier"; var n_y = "mit"; var Q4a = "bl"; var x7x = "sc"; var y22 = "detach"; var t$Z = "_H"; var D6J = "Multi"; var h3d = "sin"; var Z9j = '<label for="'; var j4_ = "clo"; var a4j = 'DTE_Label_Info'; var a$3 = "."; var Q$W = 'February'; var P9v = "ter"; var B8O = "_dataSource"; var L1v = "prepend"; var G0T = '<div class="DTED_Envelope_Background"><div></div></div>'; var y3N = 'boolean'; var B86 = "rd"; var z1E = "ddOptions"; var Y1k = "ass=\""; var c9y = '>'; var b4W = "dat"; var t7A = "rowIds"; var Y$D = "eI"; var j8j = "lds"; var l7e = "afeId"; var Q3u = "ck"; var D9o = "button"; var U83 = "bb"; var M12 = "l"; var H$n = "part of a group."; var d_P = "cells("; var t_C = "ble"; var L8T = "ur"; var H6i = "iv"; var B9u = "wireFormat"; var X3J = "ray"; var Z3I = "ion"; var q7H = "apper\">"; var L0_ = "ll"; var q65 = "dataSource"; var z9d = "ntrol"; var R8I = "ayed"; var i2D = "con"; var X2p = "_processing"; var m67 = 'action'; var E_W = "ata"; var R2S = "ength"; var F$Y = "bel"; var q3B = "TE_Processi"; var k3i = "nObject"; var T66 = "call"; var T0s = "focus"; var m4v = "em"; var a8E = "inp"; var T$b = "ete"; var I6b = "tion"; var C_E = "order"; var s0A = "class=\"DTED_Envelope_Cl"; var F$A = "Wrapper\">"; var p8S = "ings"; var k8P = "oFeatures"; var P_q = "row()"; var g3T = "es"; var H8Z = 'DTE_Footer'; var Z4v = "il"; var h$1 = "setFocus"; var J5t = "ti"; var h2d = 'submit'; var Z1K = 'DTE_Inline_Field'; var H9d = "lo"; var b6p = "ooter_Conte"; var z8F = "inObject"; var H5x = 'keyless'; var K7V = "</div"; var b3K = "Opti"; var j6W = "mData"; var F_O = 'upload.editor'; var J6h = "om"; var g6M = "npu"; var x4d = "sh"; var Z1j = "children"; var N$U = "put"; var w0q = 'remove'; var T8v = "ld_Message"; var Z$o = 'buttons-create'; var y8H = 'selected'; var z5g = "table"; var C1C = "ns"; var j2q = "C"; var r9R = "fo"; var k1R = "emove"; var F3I = "an"; var A_$ = "placeholder"; var A2Y = "lab"; var w7$ = "vent"; var Y3E = "fieldTypes"; var N6r = "display"; var I4u = "file"; var t1_ = "yed"; var B0q = "our"; var R4e = "formOptions"; var v47 = "compare"; var s4c = "<div "; var X6S = "action"; var L6L = "DateT"; var q6D = "_i"; var t8F = "cell().e"; var S$P = "_inline"; var H$p = "node"; var l9b = "P"; var K4R = "lete"; var V7D = "_assembleMain"; var h0P = 'change'; var n_L = "\">"; var M2c = 'text'; var w1q = "al"; var X6H = "fieldErrors"; var E14 = "info"; var N5b = "tor"; var X6a = "dual values."; var C03 = "it"; var N7k = "_Indicator"; var W6M = 'Create new entry'; var l1t = "get"; var W25 = "co"; var b9b = "Bo"; var d0g = 'div.DTE_Footer'; var u9P = 'tr'; var N3F = "mul"; var b5u = "att"; var k8O = "aja"; var F67 = "_in"; var Y4p = "ds"; var E1Y = "activeElement"; var v0q = 'March'; var m9f = "//datatables.net/tn/12\">More information</a>)."; var i3$ = "_edi"; var H4A = "removeClass"; var m4k = "ut"; var S3F = "multiSet"; var z6F = "Cb"; var J2W = "e_Background"; var C8j = "cr"; var s98 = "eight"; var q2p = "_add"; var B58 = "<di"; var r9V = "rm"; var G5V = "ller"; var G8j = "parent"; var n8y = "deFields"; var M6R = "xh"; var v6q = "Field_InputCo"; var u4o = "attr"; var C1X = "fa"; var B3A = "tob"; var R_r = "()"; var a1c = "gt"; var Z11 = "split"; var A3c = "od"; var l9J = "th"; var T8k = "elds"; var t5A = "mo"; var I_X = "lose"; var K3b = "g"; var o7V = "files"; var R8G = "eo"; var j_R = "ind"; var m0I = 'auto'; var w7A = "_p"; var p2N = "veClass"; var T73 = "isPla"; var l3d = "orm"; var W2j = 'readonly'; var Z3C = "_Buttons"; var C5H = "processin"; var o1u = "pend"; var N_w = "valF"; var w2$ = "append"; var e9M = "ax"; var L32 = "xt"; var k_z = "ubm"; var L9E = "pe"; var k$f = "ng"; var v6A = "_t"; var a37 = "setF"; var h0C = "ose\"></div>"; var V_I = "dy"; var z6Y = "div."; var R9b = "Ch"; var y6l = l04; y6l += S3z; y6l += n8W; y6l += g3T; var u2y = M_J; u2y += L32; var n39 = e1N; n39 += P74; n39 += U0f; var U7p = w$K; U7p += U$I; U7p += Y1j; var s4$ = g1j; s4$ += X9Y; s4$ += T8R; var d9R = H5W; d9R += i05; d9R += p$O; var c47 = a6N60.w1W; c47 += V2n; var J2V = D5T; J2V += v8B; var e$8 = k6O; e$8 += Q5J; var Q86 = w8F; Q86 += o$h; var i_7 = k3E; i_7 += X9Y; i_7 += P3y; i_7 += q$k; var o17 = R7z; o17 += u05; o17 += s5L; var w2Y = I2w; w2Y += m4v; w2Y += u05; var T6m = U0f; T6m += u9s; var D8T = M_J; D8T += K51; D8T += G8d; var U1M = W5X; U1M += P$E; U1M += M_J; var V6i = M_J; V6i += q$k; V6i += C03; var K3B = M_J; K3B += K51; K3B += X9Y; K3B += y9h; var o8i = k7M; o8i += j3w; o8i += U0f; var R9i = U0f; R9i += D4k; var r8R = F0m; r8R += X9Y; var y0v = U0f; y0v += X9Y; y0v += C7v; y0v += X9Y; var m2U = G8e; m2U += q2Q; var S8u = M_J; S8u += G2f; S8u += Y2t; var d$O = M_J; d$O += K51; d$O += X9Y; var y4k = q$k; y4k += Z1G; y4k += m9p; y4k += b3y; var t4b = M6R; t4b += a2v; t4b += X9Y; var S_f = Y0I; S_f += U1e; var F3J = d_P; F3J += G1Y; F3J += a$3; F3J += e6g; var u_e = t8F; u_e += q$k; u_e += Z0R; var L0T = s0w; L0T += k2n; L0T += d46; L0T += Q3w; var j58 = P_q; j58 += o41; var v_c = W5X; v_c += N5b; v_c += R_r; var c7H = m3r; c7H += U7K; var V7y = U6t; V7y += w81; var U0X = q$k; U0X += Z1G; U0X += A$x; U0X += M_J; var T7I = a6N60.w1W; T7I += V2n; var D6T = V_R; D6T += M_J; D6T += Y2t; var V0W = M_J; V0W += L32; V0W += y9h; var C1A = i_T; C1A += V2n; C1A += q$k; var S7v = V_R; S7v += y9h; var c1Q = k3E; c1Q += X9Y; c1Q += M_J; c1Q += Y2t; var h0f = M_J; h0f += d2F; h0f += q$k; var h6c = h46; h6c += A6y; var M1b = b4W; M1b += k7F; var w$r = a6N60.w1W; w$r += V2n; var i3 = a6N60.w1W; i3 += V2n; var c9 = B58; c9 += X0k; c9 += P_6; var n8 = c07; n8 += z4T; n8 += q7H; var b1 = C$6; b1 += Y0P; var M$ = Y3g; M$ += F$A; var F7 = K7V; F7 += O1E; var Z5 = Y1Z; Z5 += w6e; var p5 = s4c; p5 += s0A; p5 += h0C; var s0 = B_C; s0 += C8l; s0 += N6O; var V8 = C5H; V8 += K3b; var g9 = b3v; g9 += U7J; g9 += E7m; g9 += d2g; var A1 = H7a; A1 += t$Z; A1 += D8J; A1 += y6U; var Z3 = H7a; Z3 += C8i; Z3 += a6N60[204096]; Z3 += r9V; var h1 = b3v; h1 += i$F; var h6 = i7T; h6 += j4Y; var X0 = L5b; X0 += Z3C; var o5 = a6N60[83715]; o5 += X9Y; o5 += V2n; var K0 = i7T; K0 += b6p; K0 += V2n; K0 += X9Y; var P1 = p4h; P1 += o5O; P1 += S3z; P1 += f$N; var M3 = p4h; M3 += q3B; M3 += k$f; M3 += N7k; var G5 = o8K; G5 += r4q; G5 += p38; G5 += l3T; var R4 = B81; R4 += T8v; var v4 = p4h; v4 += t7L; v4 += H2N; v4 += F$Y; var B9 = p4h; B9 += j4V; B9 += v6q; B9 += z9d; var w3 = i0Z; w3 += Q88; w3 += T8R; var y9 = c9f; y9 += A5X; y9 += b3y; var g$ = u5e; g$ += Z4_; g$ += D0d; var V$ = r49; V$ += N8t; V$ += M12; V$ += J2W; var S0 = b3v; S0 += u6b; S0 += b9b; S0 += V_I; var E4 = H7a; E4 += D7J; E4 += b1g; E4 += k1R; var E$ = r2S; E$ += M$6; var v_ = G9j; v_ += Q4a; v_ += M_J; var j_ = M_J; j_ += d2F; j_ += q$k; var E2 = V_R; E2 += M_J; E2 += V2n; E2 += q$k; var r7 = i3e; r7 += p$p; var D5 = Z_L; D5 += p$O; D5 += U$I; var A7 = Z_L; A7 += v2C; A7 += M_J; var j6 = Z_L; j6 += M12; j6 += T$b; var s1 = D6J; s1 += o16; s1 += o8O; var Z$ = f6W; Z$ += H$n; var D9 = y9i; D9 += H2n; D9 += X6a; var Y7 = j57; Y7 += m9f; var U2 = F8n; U2 += W27; var F5 = Q_3; F5 += w81; var I_ = t7L; I_ += v$9; var s7 = h$l; s7 += M_J; s7 += q$k; var p0 = t7L; p0 += a6N60.E4C; p0 += M_J; var n2 = e5m; n2 += M_J; n2 += W25; n2 += Y2t; var q3 = O4G; q3 += P6$; q3 += U0f; var g5 = D5u; g5 += B3A; g5 += a6N60.V56; var i4 = k4J; i4 += a6N60.E4C; i4 += V2n; i4 += M_J; var J_ = O0a; J_ += Z1G; J_ += a6N60.b_J; var b0 = f_C; b0 += B0q; var q$ = Z1G; q$ += U6y; var U6 = X1O; U6 += M_J; U6 += j3w; var i8 = E9K; i8 += q$k; var R_ = c2T; R_ += c8f; R_ += Z1G; R_ += P3u; var Q2 = a96; Q2 += e8y; var Y8 = w1q; Y8 += M12; var N0 = a6N60.w1W; N0 += a6N60[204096]; N0 += y5$; N0 += U0f; var Z_ = j4_; Z_ += U0f; Z_ += M_J; var N3 = a6N60[83715]; N3 += M12; N3 += L8T; 'use strict'; (function () { var F3o = a6N60; var I0n = "les Editor\n\n"; F3o.P01(); var o5C = 24; var v2a = "ial e"; var A0r = "Thank you for trying DataT"; var s$2 = "or - Tr"; var C6c = "Your "; var N5a = 7; var v6Q = "getTime"; var x8y = "ei"; var k6a = "f11b"; var W7h = "trial has now expired. To purchase "; var n9M = 1715040000; var E_z = "xpired"; var k4T = "Tables Editor"; var y_z = "log"; var G6x = "44f5"; var b4$ = 60; var D8L = "Data"; var W09 = " trial info - "; var M$4 = 'for Editor, please see https://editor.datatables.net/purchase'; var U70 = 's'; var e$P = "6778"; var n5o = 81; var T19 = "5f4"; var Q$h = ' remaining'; var C7W = "a license "; var a8b = 91; var Z8w = " d"; var U7 = c2T; U7 += x8y; U7 += M12; var v9 = c2T; v9 += T19; F3o.l5 = function (f6) { F3o.g4A(); if (F3o) return F3o.L6(f6); }; F3o.f9 = function (n3) { F3o.g4A(); if (F3o) return F3o.L6(n3); }; F3o.V6 = function (K3) { F3o.g4A(); if (F3o && K3) return F3o.N2(K3); }; var remaining = Math[F3o.V6(v9) ? a6N60[89422] : U7]((new Date(n9M * R1p)[F3o.f9(e$P) ? a6N60[89422] : v6Q]() - new Date()[v6Q]()) / (R1p * (F3o.l5(G6x) ? n5o : b4$) * b4$ * (F3o.n1(k6a) ? a8b : o5C))); if (remaining <= d4r) { var k$ = F8n; k$ += s$2; k$ += v2a; k$ += E_z; var q_ = C6c; q_ += W7h; q_ += C7W; var f5 = A0r; f5 += i05; f5 += I0n; alert(f5 + q_ + M$4); throw k$; } else if (remaining <= N5a) { var L0 = Z8w; L0 += o_F; var z_ = D8L; z_ += k4T; z_ += W09; console[y_z](z_ + remaining + L0 + (remaining === J32 ? q2P : U70) + Q$h); } })(); var DataTable = $[a6N60.j_z][a6N60.x3N]; var formOptions = { buttons: o76, drawType: L0j, focus: d4r, message: o76, nest: L0j, onBackground: N3, onBlur: q0t, onComplete: q0t, onEsc: Z_, onFieldError: N0, onReturn: h2d, scope: e3k, submit: Y8, submitHtml: N7u, submitTrigger: y8F, title: o76 }; var defaults$1 = { actionName: m67, ajax: y8F, display: k$O, events: {}, fields: [], formOptions: { bubble: $[f_z]({}, formOptions, { buttons: Q2, message: L0j, submit: R_, title: L0j }), inline: $[i8]({}, formOptions, { buttons: L0j, submit: y30 }), main: $[f_z]({}, formOptions) }, i18n: { close: r79, create: { button: U6, submit: k0n, title: W6M }, datetime: { amPm: [q$, Y$I], hours: b0, minutes: s6I, months: [V2_, Q$W, v0q, M77, J_, i4, Z$z, T6C, B15, g5, N8s, Z7V], next: V$1, previous: q3, seconds: n2, unknown: A34, weekdays: [O_Y, a1g, p0, s7, I_, F5, u5t] }, edit: { button: l8U, submit: u02, title: U2 }, error: { system: Y7 }, multi: { info: D9, noMulti: Z$, restore: w0N, title: s1 }, remove: { button: j6, confirm: { 1: E7A, _: w7R }, submit: A7, title: D5 } }, idSrc: g4D, table: y8F }; var settings = { action: y8F, actionName: r7, ajax: y8F, bubbleNodes: [], bubbleBottom: L0j, bubbleLocation: m0I, closeCb: y8F, closeIcb: y8F, dataSource: y8F, displayController: y8F, displayed: L0j, editCount: d4r, editData: {}, editFields: {}, editOpts: {}, fields: {}, formOptions: { bubble: $[E2]({}, formOptions), inline: $[j_]({}, formOptions), main: $[f_z]({}, formOptions) }, globalError: q2P, id: -J32, idSrc: y8F, includeFields: [], mode: y8F, modifier: y8F, opts: y8F, order: [], processing: L0j, setFocus: y8F, table: y8F, template: y8F, unique: d4r }; var DataTable$6 = $[a6N60.j_z][v_]; function el(tag, ctx) { var Q2c = "te-e=\""; var G3P = "*[data-d"; var v5 = K9v; v5 += o5s; var H8 = G3P; H8 += Q2c; if (ctx === undefined) { ctx = document; } return $(H8 + tag + v5, ctx); } function safeDomId(id, prefix) { if (prefix === void d4r) { prefix = f5w; } return typeof id === n1a ? prefix + id[k2r](/\./g, A34) : prefix + id; } function safeQueryId(id, prefix) { var G2S = "$"; var y3C = "\\"; var d3 = y3C; d3 += G2S; a6N60.P01(); d3 += R9j; var l2 = U0f; l2 += X9Y; l2 += I2w; l2 += d2U; if (prefix === void d4r) { prefix = f5w; } return typeof id === l2 ? prefix + id[k2r](/(:|\.|\[|\]|,)/g, d3) : prefix + id; } function dataGet(src) { var W4 = K3b; W4 += M_J; a6N60.g4A(); W4 += X9Y; var a_ = m4k; a_ += Z4v; return DataTable$6[a_][W4](src); } function dataSet(src) { var h$ = U0f; h$ += M_J; a6N60.g4A(); h$ += X9Y; var A_ = a6N60.E4C; A_ += X9Y; A_ += w81; A_ += M12; return DataTable$6[A_][h$](src); } function pluck(a, prop) { var y1 = t_e; y1 += c8f; var out = []; $[y1](a, function (idx, elIn) { out[d5s](elIn[prop]); }); a6N60.g4A(); return out; } function deepCompare(o1, o2) { var m5p = "obje"; var s8h = "je"; var N5p = "ob"; var G6 = z0J; G6 += c8f; var t1 = p$O; t1 += k$f; t1 += l9J; var A8 = o8e; A8 += M_J; A8 += a6N60.b_J; A8 += U0f; var j4 = m5p; j4 += U75; if (typeof o1 !== i1W || typeof o2 !== j4 || o1 === y8F || o2 === y8F) { return o1 == o2; } var o1Props = Object[A8](o1); var o2Props = Object[W_I](o2); if (o1Props[A82] !== o2Props[t1]) { return L0j; } for (var i = d4r, ien = o1Props[G6]; i < ien; i++) { var A6 = N5p; A6 += s8h; A6 += U75; var propName = o1Props[i]; if (typeof o1[propName] === A6) { if (!deepCompare(o1[propName], o2[propName])) { return L0j; } } else if (o1[propName] != o2[propName]) { return L0j; } } return o76; } function extendDeepObjShallowArr(out, extender) { var W0w = "nPr"; var b$z = "oper"; var i4K = "hasOw"; var val; for (var prop in extender) { var E5 = c2T; E5 += w1q; E5 += M12; var j5 = i4K; j5 += W0w; j5 += b$z; j5 += V3Y; if (Object[c$a][j5][E5](extender, prop)) { val = extender[prop]; if ($[N0C](val)) { var D2 = T73; D2 += z8F; if (!$[D2](out[prop])) { out[prop] = {}; } $[f_z](o76, out[prop], val); } else if (Array[B1R](val)) { out[prop] = val[f88](); } else { out[prop] = val; } } } return out; } var _dtIsSsp = function (dt, editor) { var Y5K = "setting"; var b9Y = "drawType"; a6N60.g4A(); var M2 = Y5K; M2 += U0f; return dt[M2]()[d4r][k8P][p5v] && editor[U0f][j4C][b9Y] !== y0x; }; var _dtApi = function (table) { var F_I = "DataTable"; var i97 = "ataTable"; var z3 = B9S; z3 += E43; z3 += w81; var m1 = q$k; m1 += i97; return table instanceof $[a6N60.j_z][m1][z3] ? table : $(table)[F_I](); }; var _dtHighlight = function (node) { node = $(node); setTimeout(function () { var E5P = 'dte-highlight'; node[s9J](E5P); setTimeout(function () { var u62 = "emoveClass"; var B8 = I2w; B8 += u62; node[B8](E5P); }, R1p); }, U6C); }; var _dtRowSelector = function (out, dt, identifier, fields, idFn) { var p_ = M_J; a6N60.P01(); p_ += Z1G; p_ += x3e; var x_ = Q4s; x_ += U0f; dt[x_](identifier)[r2e]()[p_](function (idx) { var G8W = "Unable to find ro"; var n3m = "dentif"; var i82 = "w i"; var F4r = 14; var H2 = I2w; H2 += a6N60[204096]; H2 += j3w; var row = dt[Q4s](idx); var data = row[Z6V](); var idSrc = idFn(data); if (idSrc === undefined) { var w8 = G8W; w8 += i82; w8 += n3m; w8 += j11; Editor[H1B](w8, F4r); } out[idSrc] = { data: data, fields: fields, idSrc: idSrc, node: row[H$p](), type: H2 }; }); }; var _dtFieldsFromIdx = function (dt, fields, idx, ignoreUnknown) { var p5L = "settings"; var W3A = "d name."; var Z2K = "editFi"; var U0B = "aoColumns"; var r0B = "Unable to automatically determine field from source. Please specify the "; var j3p = "itFiel"; var o_0 = 11; var C8 = Z2K; C8 += I0R; var s5 = M_J; s5 += q$k; s5 += j3p; s5 += q$k; var col = dt[p5L]()[d4r][U0B][idx]; var dataSrc = col[s5] !== undefined ? col[C8] : col[j6W]; var resolvedFields = {}; var run = function (field, dataSrcIn) { a6N60.g4A(); var L5 = V2n; L5 += Z1G; L5 += U6y; L5 += M_J; if (field[L5]() === dataSrcIn) { resolvedFields[field[F5b]()] = field; } }; $[H1T](fields, function (name, fieldInst) { if (Array[B1R](dataSrc)) { var y4 = r4y; y4 += l9J; for (var _i = d4r, dataSrc_1 = dataSrc; _i < dataSrc_1[y4]; _i++) { var data = dataSrc_1[_i]; run(fieldInst, data); } } else { run(fieldInst, dataSrc); } }); if ($[Z$7](resolvedFields) && !ignoreUnknown) { var p9 = r0B; p9 += x1v; p9 += W3A; Editor[H1B](p9, o_0); } return resolvedFields; }; var _dtCellSelector = function (out, dt, identifier, allFields, idFn, forceFields) { var A_W = "ell"; var Q3 = c2T; Q3 += A_W; Q3 += U0f; a6N60.g4A(); if (forceFields === void d4r) { forceFields = y8F; } var cells = dt[Q3](identifier); cells[r2e]()[H1T](function (idx) { var F0V = "fixedN"; var S20 = "fixedNode"; var R7m = "yField"; var n4b = "olumn"; var u80 = "ttach"; var N$a = "bjec"; var c1 = M12; c1 += R2S; var a9 = H$p; a9 += I4r; var k3 = a6N60[204096]; k3 += N$a; k3 += X9Y; var Q1 = W25; Q1 += a6N60.E4C; Q1 += t4m; var z1 = c2T; z1 += n4b; var l1 = I2w; l1 += a6N60[204096]; l1 += j3w; var b6 = I2w; b6 += a6N60[204096]; a6N60.g4A(); b6 += j3w; var a8 = v43; a8 += L0_; var cell = dt[a8](idx); var row = dt[b6](idx[l1]); var data = row[Z6V](); var idSrc = idFn(data); var fields = forceFields || _dtFieldsFromIdx(dt, allFields, idx[z1], cells[Q1]() > J32); var isNode = typeof identifier === k3 && identifier[a9] || identifier instanceof $; var prevDisplayFields; var prevAttach; var prevAttachFields; if (Object[W_I](fields)[c1]) { var q4 = F$j; q4 += R7m; q4 += U0f; var u_ = i_T; u_ += Y2t; var g_ = F0V; g_ += a6N60[204096]; g_ += y6e; var u7 = R6J; u7 += X9Y; var w$ = Q1N; w$ += i1c; w$ += c2T; w$ += c8f; var N$ = Z1G; N$ += u80; var k5 = E43; k5 += D4m; k5 += c8f; var c2 = I2w; c2 += a6N60[204096]; c2 += j3w; if (out[idSrc]) { var H7 = q$k; H7 += U1m; H7 += o_F; H7 += k18; var R3 = Z1G; R3 += F59; R3 += y1g; R3 += k18; prevAttach = out[idSrc][F$S]; prevAttachFields = out[idSrc][R3]; prevDisplayFields = out[idSrc][H7]; } _dtRowSelector(out, dt, idx[c2], allFields, idFn); out[idSrc][V1I] = prevAttachFields || []; out[idSrc][V1I][k5](Object[W_I](fields)); out[idSrc][N$] = prevAttach || []; out[idSrc][w$][d5s](isNode ? $(identifier)[u7](d4r) : cell[S20] ? cell[g_]() : cell[H$p]()); out[idSrc][u2r] = prevDisplayFields || ({}); $[u_](out[idSrc][q4], fields); } }); }; var _dtColumnSelector = function (out, dt, identifier, fields, idFn) { var m8 = E84; m8 += M_J; m8 += U0f; var h5 = c2T; a6N60.g4A(); h5 += M_J; h5 += M12; h5 += x2O; dt[h5](y8F, identifier)[m8]()[H1T](function (idx) { a6N60.P01(); _dtCellSelector(out, dt, idx, fields, idFn); }); }; var dataSource$1 = { commit: function (action, identifier, data, store) { var Q9E = "searchBuilder"; var E6n = "anes"; var S5C = "tDeta"; var J8m = "searc"; var K3i = "hBuild"; var V$t = "searchPanes"; var Q2_ = "setti"; var O_M = "ngt"; var L_u = "calc"; var T7H = "rebuildPane"; var A_M = "responsive"; var v2v = "rebuild"; var Y$z = "non"; var T$ = Y$z; T$ += M_J; var L_ = f4d; L_ += t7L; L_ += d$3; var P0 = M12; P0 += M_J; P0 += O_M; a6N60.g4A(); P0 += c8f; var S9 = Q4s; S9 += Z_X; S9 += Y4p; var A0 = Q2_; A0 += O8_; var f$ = X9Y; f$ += i05; f$ += M12; f$ += M_J; var that = this; var dt = _dtApi(this[U0f][f$]); var ssp = dt[A0]()[d4r][k8P][p5v]; var ids = store[t7A]; if (!_dtIsSsp(dt, this) && action === F3_ && store[S9][P0]) { var C2 = M12; C2 += P3y; C2 += a1c; C2 += c8f; var row = void d4r; var compare = function (id) { return function (rowIdx, rowData, rowNode) { a6N60.P01(); return id == dataSource$1[C8o][T66](that, rowData); }; }; for (var i = d4r, ien = ids[C2]; i < ien; i++) { var I$ = Z1G; I$ += V2n; I$ += a6N60.b_J; try { var v1 = I2w; v1 += c6h; row = dt[v1](safeQueryId(ids[i])); } catch (e) { row = dt; } if (!row[I$]()) { row = dt[Q4s](compare(ids[i])); } if (row[c7Q]() && !ssp) { row[r0C](); } } } var drawType = this[U0f][j4C][L_]; if (drawType !== T$) { var J4 = J8m; J4 += K3i; J4 += M_J; J4 += I2w; var t9 = G7j; t9 += w8B; t9 += p$p; var d7 = U0f; d7 += b7P; d7 += l9b; d7 += E6n; var H3 = q$k; H3 += I2w; H3 += Z1G; H3 += j3w; var dtAny = dt; if (ssp && ids && ids[A82]) { var d5 = a6N60[204096]; d5 += V2n; d5 += M_J; dt[d5](n3R, function () { a6N60.g4A(); for (var i = d4r, ien = ids[A82]; i < ien; i++) { var K7 = k7M; K7 += j3w; var row = dt[K7](safeQueryId(ids[i])); if (row[c7Q]()) { var L4 = V2n; L4 += A3c; L4 += M_J; _dtHighlight(row[L4]()); } } }); } dt[H3](drawType); if (dtAny[A_M]) { var Y$ = I2w; Y$ += M_J; Y$ += L_u; dtAny[A_M][Y$](); } if (typeof dtAny[d7] === t9 && !ssp) { dtAny[V$t][T7H](undefined, o76); } if (dtAny[Q9E] !== undefined && typeof dtAny[J4][v2v] === a6N60[280451] && !ssp) { var Y2 = R6J; Y2 += S5C; Y2 += Z4v; Y2 += U0f; dtAny[Q9E][v2v](dtAny[Q9E][Y2]()); } } }, create: function (fields, data) { var u4 = X9Y; u4 += Z1G; u4 += Q4a; u4 += M_J; var dt = _dtApi(this[U0f][u4]); if (!_dtIsSsp(dt, this)) { var B7 = b2v; B7 += q$k; var row = dt[Q4s][B7](data); _dtHighlight(row[H$p]()); } }, edit: function (identifier, fields, data, store) { var M4F = "nArra"; var v1z = "Ids"; var f2B = "drawTyp"; var r6 = V2n; r6 += a6N60[204096]; r6 += U4W; var D0 = f2B; D0 += M_J; var that = this; var dt = _dtApi(this[U0f][z5g]); if (!_dtIsSsp(dt, this) || this[U0f][j4C][D0] === r6) { var q9 = V2n; q9 += a6N60[204096]; q9 += q$k; q9 += M_J; var U0 = Z1G; U0 += V2n; U0 += a6N60.b_J; var P_ = Z3H; P_ += L0_; var I9 = w81; I9 += q$k; var rowId_1 = dataSource$1[I9][P_](this, data); var row = void d4r; try { var M0 = I2w; M0 += a6N60[204096]; M0 += j3w; row = dt[M0](safeQueryId(rowId_1)); } catch (e) { row = dt; } if (!row[U0]()) { row = dt[Q4s](function (rowIdx, rowData, rowNode) { var M6 = E8G; M6 += M12; a6N60.g4A(); var f1 = w81; f1 += q$k; return rowId_1 == dataSource$1[f1][M6](that, rowData); }); } if (row[c7Q]()) { var R5 = U0f; R5 += k3T; R5 += w81; R5 += v43; var b8 = Q4s; b8 += v1z; var d2 = k7M; d2 += j3w; d2 += Z_X; d2 += Y4p; var S4 = w81; S4 += M4F; S4 += a6N60.b_J; var toSave = extendDeepObjShallowArr({}, row[Z6V]()); toSave = extendDeepObjShallowArr(toSave, data); row[Z6V](toSave); var idx = $[S4](rowId_1, store[d2]); store[b8][R5](idx, J32); } else { row = dt[Q4s][u9B](data); } _dtHighlight(row[q9]()); } }, fakeRow: function (insertPoint) { var u_N = "appendT"; var a3A = "sC"; var W$S = "col"; var I$v = "aoCo"; var O7E = "column"; var l_$ = "mns"; var U6Q = "umn"; var k8x = "ys"; var W3w = '<td>'; var Z8Y = 'draw.dte-createInline'; var Q73 = "count"; var O1z = '<tr class="dte-inlineAdd">'; var a3 = x1v; a3 += q$k; a3 += U0f; var d0 = a6N60[204096]; d0 += V2n; var B4 = W$S; B4 += a6N60.E4C; B4 += l_$; var N_ = X9Y; N_ += Z1G; N_ += a6N60[83715]; N_ += p$O; var dt = _dtApi(this[U0f][z5g]); var tr = $(O1z); var attachFields = []; var attach = []; var displayFields = {}; var tbody = dt[N_](undefined)[j_t](); for (var i = d4r, ien = dt[B4](u0E)[Q73](); i < ien; i++) { var d$ = o8e; d$ += M_J; d$ += k8x; var k8 = a3A; k8 += M12; k8 += a9T; k8 += U0f; var v8 = I$v; v8 += M12; v8 += U6Q; v8 += U0f; var Q6 = C$2; Q6 += X9Y; Q6 += X9Y; Q6 += p8S; var A2 = u_N; A2 += a6N60[204096]; var visIdx = dt[O7E](i + u0E)[E84](); var td = $(W3w)[A2](tr); var fields = _dtFieldsFromIdx(dt, this[U0f][E9S], visIdx, o76); var settings = dt[Q6]()[d4r]; var className = settings[v8][visIdx][k8]; if (className) { td[s9J](className); } if (Object[d$](fields)[A82]) { var P2 = k3E; P2 += C7A; P2 += q$k; var Z1 = E43; Z1 += a6N60.E4C; Z1 += U0f; Z1 += c8f; var q7 = E43; q7 += D4m; q7 += c8f; attachFields[q7](Object[W_I](fields)); attach[Z1](td[d4r]); $[P2](displayFields, fields); } } var append = function () { var o95 = "ppendTo"; var O_G = 'prependTo'; var a_4 = "recordsDisplay"; var A9m = "page"; var i9 = Z1G; i9 += o95; var o0 = M_J; o0 += V2n; o0 += q$k; var C6 = w81; C6 += V2n; C6 += a6N60.w1W; C6 += a6N60[204096]; if (dt[A9m][C6]()[a_4] === d4r) { $(tbody)[s$q](); } var action = insertPoint === o0 ? i9 : O_G; tr[action](tbody); }; this[S_n] = tr; append(); dt[d0](Z8Y, function () { append(); }); return { 0: { attach: attach, attachFields: attachFields, displayFields: displayFields, fields: this[U0f][a3], type: e3k } }; }, fakeRowEnd: function () { var h21 = "cord"; var C$v = "lin"; var X4R = "sDisplay"; var w7w = "pag"; var h7T = "draw.dte-createIn"; var u6 = m3r; u6 += h21; u6 += X4R; var L8 = w81; L8 += V2n; L8 += r9R; var o8 = w7w; o8 += M_J; var b4 = h7T; b4 += C$v; b4 += M_J; var i0 = a6N60[204096]; i0 += o1$; var dt = _dtApi(this[U0f][z5g]); dt[i0](b4); this[S_n][r0C](); this[S_n] = y8F; if (dt[o8][L8]()[u6] === d4r) { dt[f4d](L0j); } }, fields: function (identifier) { var P52 = "lum"; var J8X = "olum"; var R9 = c2T; R9 += J8X; R9 += V2n; R9 += U0f; var G7 = I2w; G7 += a6N60[204096]; G7 += j3w; G7 += U0f; var m6 = d39; m6 += U0f; var J$ = w81; J$ += q$k; J$ += e5m; J$ += B_y; a6N60.g4A(); var idFn = dataGet(this[U0f][J$]); var dt = _dtApi(this[U0f][z5g]); var fields = this[U0f][m6]; var out = {}; if ($[N0C](identifier) && (identifier[G7] !== undefined || identifier[R9] !== undefined || identifier[b17] !== undefined)) { if (identifier[s0w] !== undefined) { _dtRowSelector(out, dt, identifier[s0w], fields, idFn); } if (identifier[s2K] !== undefined) { var o7 = c2T; o7 += a6N60[204096]; o7 += P52; o7 += C1C; _dtColumnSelector(out, dt, identifier[o7], fields, idFn); } if (identifier[b17] !== undefined) { var f4 = v43; f4 += M12; f4 += x2O; _dtCellSelector(out, dt, identifier[f4], fields, idFn); } } else { _dtRowSelector(out, dt, identifier, fields, idFn); } return out; }, id: function (data) { var idFn = dataGet(this[U0f][I3x]); return idFn(data); }, individual: function (identifier, fieldNames) { var q_K = "isArra"; var x8 = d39; x8 += U0f; var G0 = i1c; G0 += a6N60[83715]; G0 += p$O; var s3 = C8o; s3 += e5m; s3 += I2w; s3 += c2T; var idFn = dataGet(this[U0f][s3]); var dt = _dtApi(this[U0f][G0]); var fields = this[U0f][x8]; var out = {}; var forceFields; if (fieldNames) { var T7 = M_J; T7 += Z1G; T7 += c2T; T7 += c8f; var T4 = q_K; T4 += a6N60.b_J; if (!Array[T4](fieldNames)) { fieldNames = [fieldNames]; } forceFields = {}; $[T7](fieldNames, function (i, name) { a6N60.P01(); forceFields[name] = fields[name]; }); } _dtCellSelector(out, dt, identifier, fields, idFn, forceFields); return out; }, prep: function (action, identifier, submit, json, store) { var V1Q = "elled"; var h_a = "cancelled"; var g6 = W5X; g6 += X9Y; var _this = this; if (action === e9f) { store[t7A] = $[M74](json[Z6V], function (row) { var O8 = w81; O8 += q$k; return dataSource$1[O8][T66](_this, row); }); } if (action === g6) { var g7 = h46; g7 += i1c; var i7 = L74; i7 += E43; var l8 = Q3l; l8 += c2T; l8 += V1Q; var cancelled_1 = json[l8] || []; store[t7A] = $[i7](submit[g7], function (val, key) { a6N60.P01(); return !$[Z$7](submit[Z6V][key]) && $[J5n](key, cancelled_1) === -J32 ? key : undefined; }); } else if (action === w0q) { store[h_a] = json[h_a] || []; } }, refresh: function () { var G1 = I2w; G1 += S3z; G1 += a6N60[204096]; G1 += b2v; var c$ = Z1G; c$ += a6N60[406894]; c$ += e9M; var dt = _dtApi(this[U0f][z5g]); dt[c$][G1](y8F, L0j); }, remove: function (identifier, fields, store) { var w2T = "ncelled"; var M66 = "every"; var q1 = c2T; q1 += Z1G; q1 += w2T; var that = this; var dt = _dtApi(this[U0f][z5g]); var cancelled = store[q1]; if (cancelled[A82] === d4r) { var s4 = I2w; s4 += M_J; s4 += t5A; s4 += k6O; dt[s0w](identifier)[s4](); } else { var indexes_1 = []; dt[s0w](identifier)[M66](function () { var h1F = "ush"; var m4 = E8G; m4 += M12; var id = dataSource$1[C8o][m4](that, this[Z6V]()); if ($[J5n](id, cancelled) === -J32) { var K4 = E43; K4 += h1F; indexes_1[K4](this[E84]()); } }); dt[s0w](indexes_1)[r0C](); } } }; function _htmlId(identifier) { var N26 = "[data-edit"; var D8O = "id` of: "; var j86 = "eyl"; var m3L = " element wi"; var s12 = "or-id=\""; var w9F = "tring"; var G3z = "Could not find an"; var U_G = "th `data-editor-id` or `"; var X$ = r4y; X$ += l9J; var L1 = M12; L1 += P3y; L1 += K3b; L1 += l9J; var j9 = N26; j9 += s12; var i5 = o8e; i5 += j86; i5 += z$W; if (identifier === i5) { return $(document); } var specific = $(j9 + identifier + Z0X); if (specific[L1] === d4r) { var d8 = U0f; d8 += w9F; specific = typeof identifier === d8 ? $(safeQueryId(identifier)) : $(identifier); } if (specific[X$] === d4r) { var S1 = G3z; S1 += m3L; S1 += U_G; S1 += D8O; throw new Error(S1 + identifier); } return specific; } function _htmlEl(identifier, name) { var B_8 = '[data-editor-field="'; a6N60.P01(); var context = _htmlId(identifier); return $(B_8 + name + Z0X, context); } function _htmlEls(identifier, names) { var R8 = p$O; R8 += V2n; R8 += K3b; R8 += l9J; var out = $(); for (var i = d4r, ien = names[R8]; i < ien; i++) { out = out[u9B](_htmlEl(identifier, names[i])); } return out; } function _htmlGet(identifier, dataSrc) { var L1a = '[data-editor-value]'; var y21 = "-editor-value"; a6N60.g4A(); var X6 = Z6V; X6 += y21; var c0 = Z1G; c0 += X9Y; c0 += X9Y; c0 += I2w; var G4 = T30; G4 += a1c; G4 += c8f; var el = _htmlEl(identifier, dataSrc); return el[v5e](L1a)[G4] ? el[c0](X6) : el[A$1](); } function _htmlSet(identifier, fields, data) { var I0 = M_J; I0 += Z1G; a6N60.P01(); I0 += x3e; $[I0](fields, function (name, field) { var G6X = "omD"; var n$k = "data-editor-v"; var K0B = "r-value"; var M4o = "[data-edito"; var r3$ = "valFr"; var t84 = "aSr"; var z9 = r3$; z9 += G6X; z9 += E_W; var val = field[z9](data); a6N60.P01(); if (val !== undefined) { var w0 = M4o; w0 += K0B; w0 += o5s; var v7 = q$k; v7 += Q1N; v7 += t84; v7 += c2T; var el = _htmlEl(identifier, field[v7]()); if (el[v5e](w0)[A82]) { var F3 = n$k; F3 += z9B; F3 += M_J; el[u4o](F3, val); } else { var g4 = M_J; g4 += Z1G; g4 += c2T; g4 += c8f; el[g4](function () { var l78 = "firstChild"; var M7R = "removeCh"; var Q$b = "No"; var z0 = p$O; z0 += c$s; var y$ = x3e; y$ += X9T; y$ += Q$b; y$ += N9a; while (this[y$][z0]) { var T1 = M7R; T1 += X9T; this[T1](this[l78]); } })[A$1](val); } } }); } var dataSource = { create: function (fields, data) { a6N60.P01(); if (data) { var a5 = c2T; a5 += Z1G; a5 += M12; a5 += M12; var id = dataSource[C8o][a5](this, data); try { if (_htmlId(id)[A82]) { _htmlSet(id, fields, data); } } catch (e) { } } }, edit: function (identifier, fields, data) { var h9L = "yle"; var m9 = v5N; m9 += h9L; m9 += b1F; var R7 = c2T; R7 += w1q; a6N60.P01(); R7 += M12; var id = dataSource[C8o][R7](this, data) || m9; _htmlSet(id, fields, data); }, fields: function (identifier) { var b2 = I2w; b2 += a6N60[204096]; b2 += j3w; var out = {}; if (Array[B1R](identifier)) { for (var i = d4r, ien = identifier[A82]; i < ien; i++) { var R1 = c2T; R1 += Z1G; R1 += M12; R1 += M12; var res = dataSource[E9S][R1](this, identifier[i]); out[identifier[i]] = res[identifier[i]]; } return out; } var data = {}; var fields = this[U0f][E9S]; if (!identifier) { identifier = H5x; } a6N60.g4A(); $[H1T](fields, function (name, field) { a6N60.g4A(); var q55 = "Src"; var d0M = "valToData"; var e2 = Z6V; e2 += q55; var val = _htmlGet(identifier, field[e2]()); field[d0M](data, val === y8F ? undefined : val); }); out[identifier] = { data: data, fields: fields, idSrc: identifier, node: document, type: b2 }; return out; }, id: function (data) { a6N60.P01(); var idFn = dataGet(this[U0f][I3x]); return idFn(data); }, individual: function (identifier, fieldNames) { var l_v = 'data-editor-field'; var F_5 = "andSel"; var w5p = "or-"; var z7V = '[data-editor-id]'; var z99 = "ne field name from data source"; var Y7f = "eNa"; var M_e = " determi"; var Z7x = "dit"; var O3g = "Cannot automat"; var o3s = "ically"; var H4 = M_J; H4 += y1g; var y7 = d39; y7 += U0f; var K5 = c2T; K5 += Z1G; K5 += M12; K5 += M12; var r3 = a6N60.w1W; r3 += w81; r3 += M_J; r3 += j8j; var D_ = V2n; D_ += A3c; D_ += Y7f; D_ += Y1w; var attachEl; if (identifier instanceof $ || identifier[D_]) { var T2 = M_J; T2 += Z7x; T2 += w5p; T2 += C8o; var o_ = w$j; o_ += o8F; var z5 = F_5; z5 += a6N60.w1W; var D1 = u9B; D1 += d9i; D1 += Z1G; D1 += Q3u; var u9 = a6N60.w1W; u9 += V2n; attachEl = identifier; if (!fieldNames) { fieldNames = [$(identifier)[u4o](l_v)]; } var back = $[u9][D1] ? E68 : z5; identifier = $(identifier)[o_](z7V)[back]()[Z6V](T2); } if (!identifier) { var b$ = v5N; b$ += a6N60.b_J; b$ += p$O; b$ += b1F; identifier = b$; } if (fieldNames && !Array[B1R](fieldNames)) { fieldNames = [fieldNames]; } if (!fieldNames || fieldNames[A82] === d4r) { var O$ = O3g; O$ += o3s; O$ += M_e; O$ += z99; throw new Error(O$); } var out = dataSource[r3][K5](this, identifier); var fields = this[U0f][y7]; var forceFields = {}; $[H1T](fieldNames, function (i, name) { a6N60.g4A(); forceFields[name] = fields[name]; }); $[H4](out, function (id, set) { var y$y = "toA"; var r$D = 'cell'; var u_k = "Fie"; var U8 = N6r; a6N60.P01(); U8 += u_k; U8 += j8j; var X4 = y$y; X4 += N9U; X4 += o_F; var M5 = Q1N; M5 += X9Y; M5 += G13; M5 += c8f; var y6 = X9Y; y6 += a6N60.b_J; y6 += E43; y6 += M_J; set[y6] = r$D; set[V1I] = [fieldNames]; set[M5] = attachEl ? $(attachEl) : _htmlEls(identifier, fieldNames)[X4](); set[E9S] = fields; set[U8] = forceFields; }); return out; }, initField: function (cfg) { var w6L = "l=\""; a6N60.g4A(); var v$F = "[data-editor-labe"; var s8 = f$v; s8 += F$Y; var g3 = q$k; g3 += Z1G; g3 += i1c; var r0 = v$F; r0 += w6L; var label = $(r0 + (cfg[g3] || cfg[F5b]) + Z0X); if (!cfg[s8] && label[A82]) { var O1 = A2Y; O1 += M_J; O1 += M12; cfg[O1] = label[A$1](); } }, remove: function (identifier, fields) { if (identifier !== H5x) { var k4 = I2w; k4 += m4v; k4 += D$q; k4 += M_J; _htmlId(identifier)[k4](); } } }; var classNames = { actions: { create: E$, edit: v46, remove: E4 }, body: { content: i0J, wrapper: S0 }, bubble: { bg: V$, close: g3M, liner: B2i, pointer: g$, table: y9, wrapper: D1n }, field: { 'disabled': E1f, 'error': w3, 'input': I03, 'inputControl': B9, 'label': v4, 'msg-error': d28, 'msg-info': C56, 'msg-label': a4j, 'msg-message': R4, 'multiInfo': L5m, 'multiNoEdit': x7O, 'multiRestore': r3j, 'multiValue': G5, 'namePrefix': P6v, 'processing': M3, 'typePrefix': P1, 'wrapper': y4b }, footer: { content: K0, wrapper: H8Z }, form: { button: o5, buttonSubmit: F_H, buttonInternal: F_H, buttons: X0, content: h6, error: h1, info: p6o, tag: q2P, wrapper: Z3 }, header: { content: A1, title: { tag: y8F, class: q2P }, wrapper: g9 }, inline: { buttons: u3e, liner: Z1K, wrapper: J7g }, processing: { active: V8, indicator: s0 }, wrapper: E5M }; var displayed$2 = L0j; var cssBackgroundOpacity = J32; var dom$1 = { background: $(G0T)[d4r], close: $(p5)[d4r], content: y8F, wrapper: $(f6y + Z5 + h88 + F7)[d4r] }; function findAttachRow(editor, attach) { var d0c = "pi"; var z3k = 'head'; var R$ = i1c; R$ += t_C; var W7 = B9S; W7 += d0c; var O4 = h46; O4 += m9p; O4 += Z1G; O4 += t_C; var w7 = a6N60.w1W; w7 += V2n; var dt = new $[w7][O4][W7](editor[U0f][R$]); if (attach === z3k) { return dt[z5g](undefined)[Q6x](); } else if (editor[U0f][X6S] === e9f) { var m3 = E7n; m3 += b2v; m3 += M_J; m3 += I2w; var S_ = X9Y; S_ += Z1G; S_ += t_C; return dt[S_](undefined)[m3](); } else { var M9 = I2w; M9 += a6N60[204096]; M9 += j3w; return dt[M9](editor[U0f][J$B])[H$p](); } } function heightCalc$1(dte) { var P_O = "dy_Conten"; var n2q = "windowPadding"; var l7a = 'div.DTE_Header'; var v8x = "axHeight"; var r3q = "out"; var Q1w = "div.DTE_Bo"; var W4d = "rHeight"; var H8I = "oute"; var n7M = "erHeight"; var m_ = r3q; m_ += n7M; var W5 = U6y; W5 += v8x; var z2 = Q1w; z2 += P_O; z2 += X9Y; var s$ = c2T; s$ += a6N60[204096]; s$ += V2n; s$ += a6N60.w1W; var e9 = c8f; e9 += s98; var G2 = H8I; G2 += W4d; var header = $(l7a, dom$1[t8J])[P0L](); var footer = $(d0g, dom$1[t8J])[G2](); var maxHeight = $(window)[e9]() - envelope[s$][n2q] * h4F - header - footer; $(z2, dom$1[t8J])[x35](W5, maxHeight); return $(dte[K6_][t8J])[m_](); } function hide$2(dte, callback) { var U4C = "offsetHeight"; var x1f = "onte"; if (!callback) { callback = function () { }; } if (displayed$2) { var u0 = c2T; u0 += x1f; u0 += t4m; var G$ = i2D; G$ += U$I; G$ += V2n; G$ += X9Y; $(dom$1[G$])[s6E]({ top: -(dom$1[u0][U4C] + a87) }, v_R, function () { var W1B = "fadeOut"; $([dom$1[t8J], dom$1[j$T]])[W1B](j67, function () { $(this)[y22](); callback(); }); }); displayed$2 = L0j; } } function init$1() { var L$0 = "Container"; var V2l = "lope_"; var h1T = "div.DTED_Enve"; var p6L = "ppe"; var x0 = c2T; x0 += U0f; x0 += U0f; var Y5 = j3w; Y5 += D$i; Y5 += p6L; Y5 += I2w; var p6 = h1T; p6 += V2l; p6 += L$0; dom$1[B8R] = $(p6, dom$1[Y5])[d4r]; cssBackgroundOpacity = $(dom$1[j$T])[x0](v$D); } function show$2(dte, callback) { var G8A = a6N60; var u_0 = "ground"; var B_I = "bo"; var R20 = "En"; var B1h = "setH"; var x80 = "lope"; var o4C = "click.DTED_"; var U62 = 'resize.DTED_Envelope'; var M7u = "offset"; var K$N = 'div.DTED_Lightbox_Content_Wrapper'; var z9T = "marginLeft"; var i1z = 'px'; var l8f = "Envelope"; var p4$ = "acity"; var e3C = "resize.D"; G8A.g4A(); var M_f = "animat"; var s5k = 'click.DTED_Envelope'; var g6d = "click.DTED_Envelo"; var w9H = "TED_Envelope"; var u0c = "yl"; var T5l = "city"; var v1D = "opa"; var w7l = "round"; var c2L = "ci"; var N0t = "back"; var w5M = "ackg"; var o5_ = '0'; var g_9 = "ck.DTED_Envelope"; var L3 = e3C; L3 += w9H; var F4 = c2T; F4 += B9m; F4 += g_9; var w5 = a6N60[204096]; w5 += a6N60.w1W; w5 += a6N60.w1W; var j8 = o4C; j8 += l8f; var Z2 = N0t; Z2 += u_0; var m$ = g6d; m$ += L9E; var O5 = a6N60[204096]; O5 += V2n; var f_ = o4C; f_ += R20; f_ += k6O; f_ += x80; var l3 = a6N60[204096]; l3 += a6N60.w1W; l3 += a6N60.w1W; var Q_ = j4_; Q_ += U0f; Q_ += M_J; var s6 = w81; s6 += R9j; s6 += o7A; s6 += V2n; var F2 = J5t; F2 += H5c; F2 += M_J; var e$ = Z1G; e$ += X9Y; e$ += X9Y; e$ += I2w; var M_ = j4_; M_ += C$2; var N4 = U0f; N4 += V3Y; N4 += M12; N4 += M_J; var n6 = c2T; n6 += a6N60[204096]; n6 += t4m; n6 += U2N; var t4 = j3w; t4 += N9r; t4 += L9E; t4 += I2w; var q8 = B_I; q8 += V_I; if (!callback) { callback = function () { }; } $(q8)[w2$](dom$1[j$T])[w2$](dom$1[t4]); dom$1[n6][N4][D_V] = m0I; if (!displayed$2) { var J5 = M_f; J5 += M_J; var e3 = a6N60.w1W; e3 += Z1G; e3 += y6e; e3 += d9D; var b_ = H2l; b_ += T4I; var p4 = a6N60[83715]; p4 += w5M; p4 += w7l; var l$ = m2M; l$ += p4$; var q5 = U0f; q5 += X9Y; q5 += u0c; q5 += M_J; var Y4 = I6s; Y4 += E43; var M1 = Y9I; M1 += a6N60.b_J; M1 += p$O; var O_ = E43; O_ += K51; var n7 = a6N60[204096]; n7 += o1$; n7 += B1h; n7 += s98; var a7 = X9Y; a7 += a6N60[204096]; a7 += E43; var R0 = E43; R0 += K51; var c_ = Y9I; c_ += a6N60.b_J; c_ += p$O; var z$ = U0f; z$ += X9Y; z$ += a6N60.b_J; z$ += p$O; var A5 = N5L; A5 += O0I; A5 += E43; A5 += a6N60.V56; var C9 = v1D; C9 += T5l; var B_ = c2T; B_ += a6N60[204096]; B_ += V2n; B_ += a6N60.w1W; var P7 = q$k; P7 += w81; P7 += e_H; P7 += a6N60.b_J; var k0 = v1D; k0 += c2L; k0 += V3Y; var style = dom$1[t8J][x9h]; style[k0] = o5_; style[P7] = N_3; var height = heightCalc$1(dte); var targetRow = findAttachRow(dte, envelope[B_][F$S]); var width = targetRow[O4K]; style[N6r] = y0x; style[C9] = K11; dom$1[A5][z$][t0h] = width + i1z; dom$1[t8J][c_][z9T] = -(width / h4F) + R0; dom$1[t8J][x9h][f7b] = $(targetRow)[M7u]()[a7] + targetRow[n7] + O_; dom$1[B8R][M1][Y4] = -J32 * height - U6C + i1z; dom$1[j$T][q5][l$] = o5_; dom$1[p4][x9h][b_] = N_3; $(dom$1[j$T])[s6E]({ opacity: cssBackgroundOpacity }, j67); $(dom$1[t8J])[e3](); $(dom$1[B8R])[J5]({ top: d4r }, v_R, callback); } $(dom$1[M_])[e$](F2, dte[s6][Q_])[l3](f_)[O5](m$, function (e) { G8A.P01(); dte[C$M](); }); $(dom$1[Z2])[E6I](s5k)[p$p](j8, function (e) { var r_a = "gro"; var j3 = N0t; j3 += r_a; j3 += a6N60.E4C; G8A.g4A(); j3 += Y2t; dte[j3](); }); $(K$N, dom$1[t8J])[w5](F4)[p$p](s5k, function (e) { var F2b = "DTED_Envelope_"; var j$4 = "Content_Wrapper"; var w4 = F2b; w4 += j$4; if ($(e[q1K])[q4w](w4)) { dte[j$T](); } }); $(window)[E6I](U62)[p$p](L3, function () { G8A.g4A(); heightCalc$1(dte); }); displayed$2 = o76; } var envelope = { close: function (dte, callback) { a6N60.P01(); hide$2(dte, callback); }, conf: { attach: e3k, windowPadding: a87 }, destroy: function (dte) { hide$2(); }, init: function (dte) { init$1(); return envelope; }, node: function (dte) { a6N60.g4A(); return dom$1[t8J][d4r]; }, open: function (dte, append, callback) { var q9h = "ontent"; var Q3C = "appendChild"; var B1 = c2T; B1 += p$p; B1 += C7A; B1 += X9Y; var c5 = c2T; c5 += q9h; $(dom$1[B8R])[Z1j]()[y22](); dom$1[c5][Q3C](append); dom$1[B1][Q3C](dom$1[C$M]); show$2(dte, callback); } }; function isMobile() { var y7W = "idt"; var T7_ = "ori"; var x9d = "ation"; var Y0o = "terW"; var v$b = 576; var V5 = L1F; V5 += Y0o; V5 += y7W; V5 += c8f; var t3 = T7_; t3 += P3y; t3 += X9Y; t3 += x9d; return typeof window[t3] !== a6N60.L1o && window[V5] <= v$b ? o76 : L0j; } var displayed$1 = L0j; var ready = L0j; var scrollTop = d4r; var dom = { background: $(m_s), close: $(W0z), content: y8F, wrapper: $(M$ + b1 + n8 + c9 + c2P + c2P + c2P + c2P) }; function heightCalc() { var s52 = "indowP"; var H6Z = 'px)'; var G0w = 'div.DTE_Body_Content'; var Y99 = "DTE_Body_Content"; var u1T = "DTE_Header"; var H8U = 'maxHeight'; var v3D = "xHeigh"; var n_a = 'calc(100vh - '; var A9 = N5L; A9 += E6_; var X8 = z6Y; X8 += u1T; var headerFooter = $(X8, dom[t8J])[P0L]() + $(d0g, dom[A9])[P0L](); if (isMobile()) { var p$ = U6y; p$ += Z1G; p$ += v3D; p$ += X9Y; var C0 = c2T; C0 += U0f; C0 += U0f; $(G0w, dom[t8J])[C0](p$, n_a + headerFooter + H6Z); } else { var P5 = c2T; P5 += b1F; var G8 = q$k; G8 += w81; G8 += B4H; G8 += Y99; var Z9 = j3w; Z9 += s52; Z9 += u9B; Z9 += d2U; var b7 = i2D; b7 += a6N60.w1W; var maxHeight = $(window)[D_V]() - self[b7][Z9] * h4F - headerFooter; $(G8, dom[t8J])[P5](H8U, maxHeight); } } function hide$1(dte, callback) { var w4N = "per"; var c_V = "offsetAni"; var p4d = "scrollTop"; var a7F = "ize.DTED_Lightbox"; var G59 = "res"; var B0 = G59; B0 += a7F; var x7 = c2T; x7 += a6N60[204096]; x7 += V2n; x7 += a6N60.w1W; var w2 = N5L; w2 += O0I; w2 += w4N; if (!callback) { callback = function () { }; } $(l0a)[p4d](scrollTop); dte[J6m](dom[w2], { opacity: d4r, top: self[x7][c_V] }, function () { $(this)[y22](); callback(); }); dte[J6m](dom[j$T], { opacity: d4r }, function () { a6N60.g4A(); $(this)[y22](); }); a6N60.g4A(); displayed$1 = L0j; $(window)[E6I](B0); } function init() { var J0w = "kgr"; var f_Z = "div.DTE"; var a$t = "ound"; var a$D = "x_Content"; var Z_O = "D_Lightbo"; var Q9 = c2T; Q9 += U0f; Q9 += U0f; var x1 = a6N60[83715]; x1 += G13; x1 += J0w; x1 += a$t; var E6 = a6N60[204096]; E6 += B_x; var C3 = c2T; C3 += b1F; var h9 = j3w; h9 += I2w; h9 += i3r; h9 += a6N60.V56; var t$ = N5L; t$ += E6_; var p1 = f_Z; p1 += Z_O; p1 += a$D; var x6 = W25; x6 += t4m; x6 += U2N; if (ready) { return; } dom[x6] = $(p1, dom[t$]); dom[h9][C3](E6, d4r); dom[x1][Q9](v$D, d4r); ready = o76; } function show$1(dte, callback) { var f8F = "tAni"; var s3Z = "backgro"; var a05 = 'DTED_Lightbox_Mobile'; var X8l = "fse"; var z_u = "ckgr"; var t5a = "k.DTED_Li"; var D_D = "clic"; var J8I = "k."; var e29 = "D_Lightbox"; var T0a = "t_Wrapper"; var Y22 = "onten"; var w_v = "uto"; var P2S = "DTED_Lightbox"; var I8D = "nimate"; var X2D = "TED_Lightbox"; var X13 = 'resize.DTED_Lightbox'; var A1s = "ghtbox"; var k$I = "rollTop"; var y6x = "oun"; var n1J = 'click.DTED_Lightbox'; var B1N = "lick.DTE"; var S90 = "rapp"; var c91 = "click."; var U24 = "div.DTED_Lightbox_C"; var u_L = 'height'; var C7 = c91; C7 += P2S; var z7 = a6N60[204096]; z7 += V2n; var e1 = U24; e1 += Y22; e1 += T0a; var U5 = S$Q; U5 += e8y; U5 += t5a; U5 += A1s; var Y0 = c2T; Y0 += B1N; Y0 += e29; var L$ = a6N60[204096]; L$ += V2n; var K2 = D_D; K2 += J8I; K2 += p4h; K2 += X2D; var D3 = y$D; D3 += o7A; D3 += V2n; var J2 = X9Y; J2 += C03; J2 += p$O; var r$ = j3w; r$ += I2w; r$ += R6I; r$ += I2w; var u8 = J3x; u8 += q$k; var Q8 = s3Z; Q8 += M7_; if (isMobile()) { $(l0a)[s9J](a05); } $(l0a)[w2$](dom[Q8])[u8](dom[r$]); heightCalc(); if (!displayed$1) { var t7 = x7x; t7 += k$I; var k7 = W7T; k7 += z_u; k7 += y6x; k7 += q$k; var g1 = j3w; g1 += S90; g1 += a6N60.V56; var l4 = j8u; l4 += I8D; var L9 = a6N60[204096]; L9 += a6N60.w1W; L9 += X8l; L9 += f8F; var g8 = i2D; g8 += a6N60.w1W; var I5 = j3w; I5 += I2w; I5 += E6_; var X3 = Z1G; X3 += w_v; var U3 = c2T; U3 += U0f; U3 += U0f; var u1 = i2D; u1 += X9Y; u1 += U2N; displayed$1 = o76; dom[u1][U3](u_L, X3); dom[I5][x35]({ top: -self[g8][L9] }); dte[l4](dom[g1], { opacity: J32, top: d4r }, callback); dte[J6m](dom[k7], { opacity: J32 }); $(window)[p$p](X13, function () { heightCalc(); }); scrollTop = $(l0a)[t7](); } dom[C$M][u4o](J2, dte[D3][C$M])[E6I](K2)[L$](Y0, function (e) { dte[C$M](); }); dom[j$T][E6I](n1J)[p$p](U5, function (e) { var b05 = "mmediatePropagation"; var w1 = q6K; w1 += Z_X; w1 += b05; e[w1](); dte[j$T](); }); $(e1, dom[t8J])[E6I](n1J)[z7](C7, function (e) { var J45 = "ox_Content_Wrapper"; var W3u = "DTED_"; var z$s = "opImmediatePropagatio"; var S1$ = "Lightb"; var F$ = W3u; F$ += S1$; F$ += J45; var m0 = c8f; m0 += f1i; m0 += b1F; if ($(e[q1K])[m0](F$)) { var x$ = Y9I; x$ += z$s; x$ += V2n; e[x$](); dte[j$T](); } }); } var self = { close: function (dte, callback) { hide$1(dte, callback); }, conf: { offsetAni: h5J, windowPadding: h5J }, destroy: function (dte) { a6N60.P01(); if (displayed$1) { hide$1(dte); } }, init: function (dte) { init(); return self; }, node: function (dte) { return dom[t8J][d4r]; }, open: function (dte, append, callback) { var g1E = "ldren"; var K_ = O0I; K_ += o1u; var S6 = d8G; S6 += g1E; var content = dom[B8R]; content[S6]()[y22](); content[w2$](append)[K_](dom[C$M]); show$1(dte, callback); } }; var DataTable$5 = $[i3][a6N60.x3N]; function add(cfg, after, reorder) { var s1B = "dding f"; var F$d = "ource"; var M0P = "_displayReorder"; var y5R = 'initField'; var T7y = "isArr"; var j36 = "everse"; var v0G = 'Error adding field \''; var J_z = "isplayReorder"; var J_4 = '\'. A field already exists with this name'; var P_V = "Fi"; var S9a = "` option"; var E6D = "pli"; var C2I = "dataS"; var i3l = "ield. The field requires a `name"; var C_ = a6N60.w1W; C_ += A9P; C_ += q$k; C_ += U0f; var Z8 = c2T; Z8 += M12; Z8 += w4E; var N6 = P_V; N6 += S3z; N6 += q$k; var v6 = R4N; v6 += C2I; v6 += F$d; var r4 = V2n; r4 += Z1G; r4 += Y1w; var a4 = T7y; a4 += Z1G; a4 += a6N60.b_J; if (reorder === void d4r) { reorder = o76; } if (Array[a4](cfg)) { var P4 = a6N60[204096]; P4 += V3_; if (after !== undefined) { var A4 = I2w; A4 += j36; cfg[A4](); } for (var _i = d4r, cfg_1 = cfg; _i < cfg_1[A82]; _i++) { var cfgDp = cfg_1[_i]; this[u9B](cfgDp, after, L0j); } this[M0P](this[P4]()); return this; } var name = cfg[r4]; if (name === undefined) { var q0 = a1$; q0 += s1B; q0 += i3l; q0 += S9a; throw new Error(q0); } if (this[U0f][E9S][name]) { throw new Error(v0G + name + J_4); } this[v6](y5R, cfg); var editorField = new Editor[N6](cfg, this[Z8][d39], this); if (this[U0f][p01]) { var editFields = this[U0f][N$y]; editorField[v3v](); $[H1T](editFields, function (idSrc, editIn) { var S$6 = "ef"; var N$g = "ltiSet"; var y2 = q$k; y2 += S$6; var E9 = o8K; E9 += N$g; var S$ = q$k; S$ += Z1G; S$ += X9Y; a6N60.g4A(); S$ += Z1G; var value; if (editIn[S$]) { var y5 = h46; y5 += X9Y; y5 += Z1G; var b3 = N_w; b3 += k7M; b3 += j6W; value = editorField[b3](editIn[y5]); } editorField[E9](idSrc, value !== undefined ? value : editorField[y2]()); }); } this[U0f][C_][name] = editorField; if (after === undefined) { var v2 = T8R; v2 += q$k; v2 += M_J; v2 += I2w; this[U0f][v2][d5s](name); } else if (after === y8F) { this[U0f][C_E][I3u](name); } else { var E0 = U0f; E0 += E6D; E0 += v43; var b9 = T8R; b9 += d2g; var idx = $[J5n](after, this[U0f][b9]); this[U0f][C_E][E0](idx + J32, d4r, name); } if (reorder !== L0j) { var U9 = a6N60[204096]; U9 += I2w; U9 += y6e; U9 += I2w; var r_ = R4N; r_ += q$k; r_ += J_z; this[r_](this[U9]()); } return this; } function ajax(newAjax) { if (newAjax) { this[U0f][S15] = newAjax; return this; } return this[U0f][S15]; } function background() { var e$p = 'blur'; var p9T = "onBackground"; var Y5_ = "tO"; var e0 = U0f; e0 += b0Y; a6N60.P01(); e0 += I_6; e0 += X9Y; var D$ = c2T; D$ += M12; D$ += v5Z; var j0 = W5X; j0 += Y5_; j0 += O4D; var onBackground = this[U0f][j0][p9T]; if (typeof onBackground === a6N60[280451]) { onBackground(this); } else if (onBackground === e$p) { var c6 = a6N60[83715]; c6 += q_0; c6 += I2w; this[c6](); } else if (onBackground === D$) { this[C$M](); } else if (onBackground === e0) { this[g61](); } return this; } function blur() { var V0 = R4N; V0 += a6N60[83715]; V0 += I6V; this[V0](); return this; } function bubble(cells, fieldNames, showIn, opts) { var l09 = "dataSour"; var R3V = "ndi"; var p5$ = "vidual"; var k_ = g8e; k_ += U83; k_ += p$O; var B2 = w81; B2 += R3V; B2 += p5$; var y_ = R4N; y_ += l09; y_ += v43; var k2 = a6N60.w1W; k2 += l3d; k2 += b3K; k2 += m8u; var Z4 = v6A; Z4 += C8o; Z4 += a6N60.b_J; var _this = this; if (showIn === void d4r) { showIn = o76; } var that = this; if (this[Z4](function () { a6N60.g4A(); that[u5D](cells, fieldNames, opts); })) { return this; } if ($[N0C](fieldNames)) { opts = fieldNames; fieldNames = undefined; showIn = o76; } else if (typeof fieldNames === y3N) { showIn = fieldNames; fieldNames = undefined; opts = undefined; } if ($[N0C](showIn)) { opts = showIn; showIn = o76; } if (showIn === undefined) { showIn = o76; } opts = $[f_z]({}, this[U0f][k2][u5D], opts); var editFields = this[y_](B2, cells, fieldNames); this[U2P](cells, editFields, k_, opts, function () { var M94 = a6N60; var J$I = "<div class=\"DTE_Pro"; var T_E = "or\"><span></div>"; var w3H = "e."; var w1n = '" title="'; var p0i = "concat"; var K2Y = ' scroll.'; var E3o = "cessing_Indicat"; var j6M = "mI"; var o$x = "seRe"; var O1L = "bg"; var h7m = "hil"; var h9B = "v c"; var B0w = "stopen"; var L7d = "repe"; var B1v = "_preopen"; var G02 = "iv "; var Q7D = 'attach'; var R5$ = "_po"; var i$D = "siz"; var g7k = "liner"; var v3g = '"><div></div></div>'; var e7 = R5$; e7 += B0w; var C4 = a6N60[204096]; C4 += V2n; var n5 = c2T; n5 += B9m; n5 += c2T; n5 += o8e; var t_ = Q5y; t_ += o$x; t_ += K3b; var Y3 = Z1G; Y3 += q$k; Y3 += q$k; var N7 = a6N60.w1W; N7 += T8R; N7 += U6y; var r8 = q$k; r8 += a6N60[204096]; r8 += U6y; var E_ = E43; E_ += L7d; M94.g4A(); E_ += V2n; E_ += q$k; var J8 = R9e; J8 += U6y; var N1 = i3r; N1 += P3y; N1 += q$k; var h8 = c2T; h8 += h7m; h8 += T$f; h8 += P3y; var v0 = B9f; v0 += L0b; v0 += q$k; v0 += g97; var Y9 = E43; Y9 += P6B; Y9 += P9v; var W9 = B9f; W9 += z$m; var T5 = J$I; T5 += E3o; T5 += T_E; var k6 = c2T; k6 += M12; k6 += v5Z; var P$ = K9v; P$ += O1E; var O6 = X9Y; O6 += Z1G; O6 += Q4a; O6 += M_J; var x4 = e9D; x4 += G02; x4 += X6$; x4 += t3o; var a$ = C$6; a$ += s19; var r9 = K9v; r9 += O1E; var F9 = B58; F9 += h9B; F9 += f$v; F9 += t3o; var T6 = C$6; T6 += s19; var l7 = g3L; l7 += t_C; var B3 = S$Q; B3 += w4E; var F_ = I2w; F_ += M_J; F_ += i$D; F_ += w3H; var namespace = _this[g7p](opts); var ret = _this[B1v](o1Q); if (!ret) { return _this; } $(window)[p$p](F_ + namespace + K2Y + namespace, function () { var F1b = "Position"; M94.g4A(); var T3 = u5D; T3 += F1b; _this[T3](); }); var nodes = []; _this[U0f][E$u] = nodes[p0i][h6$](nodes, pluck(editFields, Q7D)); var classes = _this[B3][l7]; var backgroundNode = $(T6 + classes[O1L] + v3g); var container = $(F9 + classes[t8J] + r9 + a$ + classes[g7k] + Q9K + x4 + classes[O6] + P$ + F$O + classes[k6] + w1n + _this[i8a][C$M] + a1R + T5 + W9 + c2P + F$O + classes[Y9] + a1R + v0); if (showIn) { container[K8Q](l0a); backgroundNode[K8Q](l0a); } var liner = container[h8]()[f9w](d4r); var tableNode = liner[Z1j](); var closeNode = tableNode[Z1j](); liner[N1](_this[J8][X84]); tableNode[E_](_this[r8][N7]); if (opts[d1n]) { var W$ = x$f; W$ += j6M; W$ += z_q; var V3 = q$k; V3 += a6N60[204096]; V3 += U6y; liner[L1v](_this[V3][W$]); } if (opts[S1h]) { var a0 = R9e; a0 += U6y; liner[L1v](_this[a0][Q6x]); } if (opts[u8E]) { var S7 = g8e; S7 += X9Y; S7 += E5r; S7 += U0f; var i$ = O0I; i$ += L8N; i$ += q$k; tableNode[i$](_this[K6_][S7]); } var finish = function () { var N$R = "cInfo"; var T38 = "_clearDynami"; var m9t = "sed"; var s_ = c2T; s_ += M12; s_ += a6N60[204096]; s_ += m9t; var G_ = T38; G_ += N$R; _this[G_](); _this[n0R](s_, [o1Q]); }; var pair = $()[Y3](container)[u9B](backgroundNode); _this[t_](function (submitComplete) { var Z7 = R4N; Z7 += s6E; _this[Z7](pair, { opacity: d4r }, function () { var k1h = "ll."; M94.P01(); var X8C = 'resize.'; if (this === container[d4r]) { var d4 = S26; d4 += c2T; d4 += k7M; d4 += k1h; pair[y22](); $(window)[E6I](X8C + namespace + d4 + namespace); finish(); } }); }); backgroundNode[p$p](n5, function () { _this[Z1U](); }); closeNode[C4](U1c, function () { M94.g4A(); _this[D2P](); }); _this[A8O](); _this[e7](o1Q, L0j); var opened = function () { var i1 = a6N60.w1W; i1 += j9q; var R6 = Q4p; R6 += j9q; _this[R6](_this[U0f][D4g], opts[i1]); _this[n0R](V2d, [o1Q, _this[U0f][X6S]]); }; _this[J6m](pair, { opacity: J32 }, function () { M94.g4A(); if (this === container[d4r]) { opened(); } }); }); return this; } function bubbleLocation(location) { var w33 = "leLocation"; var r0x = "bubbleLocation"; var j7S = "blePositi"; var C$ = g3L; C$ += j7S; C$ += p$p; if (!location) { var e_ = a6N60[83715]; e_ += a6N60.E4C; e_ += U83; e_ += w33; return this[U0f][e_]; } this[U0f][r0x] = location; this[C$](); return this; } function bubblePosition() { var o3B = 'left'; var D4L = "Bott"; var t$T = "bottom"; var e1r = "bleBot"; var U0h = "ocatio"; var x_d = "ubbleL"; var f_y = "bubbleBott"; var y1T = "left"; var n9D = "toggleClass"; var P_u = "div.DTE_Bu"; var Q_B = "bble_Liner"; var u$B = "right"; var L$F = 'top'; var g$8 = 'bottom'; var v_X = "tom"; var E5d = "outerWidth"; var W$N = 'below'; var K9Q = "ttom"; var O5R = "bot"; var t7e = "removeCl"; var j2z = "eft"; var s0R = "sitio"; var R_B = "ollTop"; var H5y = "bott"; var F4d = 'div.DTE_Bubble'; var V_u = "nerHeig"; var q2 = E43; q2 += a6N60[204096]; q2 += s0R; q2 += V2n; var c4 = H5y; c4 += J6h; var j1 = e0x; j1 += H9d; j1 += j3w; var l9 = O5R; l9 += X9Y; l9 += a6N60[204096]; l9 += U6y; var s9 = u5D; s9 += D4L; s9 += a6N60[204096]; s9 += U6y; var l_ = Z1G; l_ += a6N60.E4C; l_ += X9Y; l_ += a6N60[204096]; var T9 = a6N60[83715]; T9 += x_d; T9 += U0h; T9 += V2n; var t0 = U0f; t0 += C8j; t0 += R_B; var C5 = j3w; C5 += w81; C5 += q$k; C5 += l9J; var Y1 = M12; Y1 += M_J; Y1 += a6N60.w1W; Y1 += X9Y; var B6 = X9Y; B6 += a6N60[204096]; B6 += E43; var S2 = T30; S2 += a1c; S2 += c8f; var h4 = a6N60[83715]; h4 += a6N60[204096]; h4 += K9Q; var M8 = M12; M8 += Z7g; M8 += X9Y; M8 += c8f; var g2 = P_u; g2 += Q_B; var wrapper = $(F4d); var liner = $(g2); var nodes = this[U0f][E$u]; var position = { bottom: d4r, left: d4r, right: d4r, top: d4r }; $[H1T](nodes, function (i, nodeIn) { var A0e = "ight"; var K9q = "tHe"; var V9V = "ffse"; var h4r = "offse"; var f0 = a6N60[204096]; f0 += V9V; f0 += K9q; f0 += A0e; var U4 = X9Y; U4 += a6N60[204096]; U4 += E43; var d1 = M12; d1 += M_J; d1 += a6N60.w1W; d1 += X9Y; var W1 = X9Y; W1 += a6N60[204096]; W1 += E43; var w6 = I6s; w6 += E43; var Q7 = R6J; Q7 += X9Y; var q6 = h4r; q6 += X9Y; var pos = $(nodeIn)[q6](); a6N60.P01(); nodeIn = $(nodeIn)[Q7](d4r); position[w6] += pos[W1]; position[y1T] += pos[y1T]; position[u$B] += pos[d1] + nodeIn[O4K]; position[t$T] += pos[U4] + nodeIn[f0]; }); position[f7b] /= nodes[A82]; position[y1T] /= nodes[M8]; position[u$B] /= nodes[A82]; position[h4] /= nodes[S2]; var top = position[B6]; var left = (position[Y1] + position[u$B]) / h4F; var width = liner[E5d](); var height = liner[P0L](); var visLeft = left - width / h4F; var visRight = visLeft + width; var docWidth = $(window)[C5](); var viewportTop = $(window)[t0](); var padding = I5u; var location = this[U0f][T9]; var initial = location !== l_ ? location : this[U0f][s9] ? l9 : L$F; wrapper[x35]({ left: left, top: initial === g$8 ? position[t$T] : top })[n9D](j1, initial === c4); var curPosition = wrapper[q2](); if (location === m0I) { var n9 = T30; n9 += r1L; var L2 = i8S; L2 += V_u; L2 += W74; if (liner[A82] && curPosition[f7b] + height > viewportTop + window[L2]) { var j$ = g3L; j$ += e1r; j$ += v_X; var f8 = a6N60[83715]; f8 += M_J; f8 += H9d; f8 += j3w; var u2 = t7e; u2 += G2j; var c7 = X9Y; c7 += a6N60[204096]; c7 += E43; var E7 = c2T; E7 += U0f; E7 += U0f; wrapper[E7](c7, top)[u2](f8); this[U0f][j$] = L0j; } else if (liner[n9] && curPosition[f7b] - height < viewportTop) { var V2 = f_y; V2 += J6h; wrapper[x35](L$F, position[t$T])[s9J](W$N); this[U0f][V2] = o76; } } if (visRight + padding > docWidth) { var P3 = c2T; P3 += U0f; P3 += U0f; var diff = visRight - docWidth; liner[P3](o3B, visLeft < padding ? -(visLeft - padding) : -(diff + padding)); } else { var l6 = M12; l6 += j2z; liner[x35](l6, visLeft < padding ? -(visLeft - padding) : d4r); } return this; } function buttons(buttonsIn) { var l2J = "isAr"; var J1y = "sic"; var G82 = "_ba"; var B8$ = "buttonSubmi"; var I2 = l2J; I2 += D$i; I2 += a6N60.b_J; var R2 = G82; R2 += J1y; var _this = this; if (buttonsIn === R2) { var m5 = B8$; m5 += X9Y; var n_ = U0f; n_ += k_z; n_ += C03; var Q0 = V6c; Q0 += V2n; buttonsIn = [{ action: function () { a6N60.g4A(); var x2 = U0f; x2 += I6z; this[x2](); }, text: this[Q0][this[U0f][X6S]][n_], className: this[v68][E05][m5] }]; } else if (!Array[I2](buttonsIn)) { buttonsIn = [buttonsIn]; } $(this[K6_][u8E])[s$q](); $[H1T](buttonsIn, function (i, btn) { var d9H = "uttonS"; var G3O = '<button></button>'; var z3O = "functi"; var j$g = "ssNa"; var a4U = "bInde"; var z13 = "tabI"; var O$T = "eypress"; var F$I = "text"; var s0e = "classNa"; var l$B = "ndex"; var d2L = 'tabindex'; var j2 = q$k; j2 += J6h; var I3 = a6N60[204096]; I3 += V2n; var O7 = o8e; O7 += O$T; var V_ = v5N; V_ += a6N60.b_J; V_ += a6N60.E4C; V_ += E43; var h7 = a6N60[204096]; h7 += V2n; var P8 = Q1N; P8 += D$M; var e4 = i1c; e4 += a4U; e4 += K51; var r1 = z13; r1 += l$B; var v$ = b5u; v$ += I2w; var Q4 = z3O; Q4 += p$p; var t2 = X6$; t2 += j$g; t2 += Y1w; var y0 = s0e; y0 += U6y; y0 += M_J; var d9 = S$Q; d9 += a9T; d9 += C$2; a6N60.g4A(); d9 += U0f; var Y6 = i3e; Y6 += p$p; var I7 = M12; I7 += i05; I7 += M_J; I7 += M12; if (typeof btn === n1a) { var H5 = a6N60[83715]; H5 += d9H; H5 += k_z; H5 += C03; var B5 = a6N60.w1W; B5 += a6N60[204096]; B5 += I2w; B5 += U6y; btn = { action: function () { this[g61](); }, text: btn, className: _this[v68][B5][H5] }; } var text = btn[F$I] || btn[I7]; var action = btn[Y6] || btn[a6N60.j_z]; var attr = btn[u4o] || ({}); $(G3O, { class: _this[d9][E05][D9o] + (btn[y0] ? v9H + btn[t2] : q2P) })[A$1](typeof text === Q4 ? text(_this) : text || q2P)[v$](d2L, btn[r1] !== undefined ? btn[e4] : d4r)[P8](attr)[h7](V_, function (e) { a6N60.P01(); if (e[x4e] === F0h && action) { action[T66](_this); } })[p$p](O7, function (e) { var c8 = j3w; a6N60.P01(); c8 += G4q; c8 += c2T; c8 += c8f; if (e[c8] === F0h) { e[g86](); } })[I3](U1c, function (e) { e[g86](); if (action) { action[T66](_this, e); } })[K8Q](_this[j2][u8E]); }); return this; } function clear(fieldName) { a6N60.P01(); var j_4 = "rin"; var O_v = "deFiel"; var W8 = Y9I; W8 += j_4; W8 += K3b; var that = this; var sFields = this[U0f][E9S]; if (typeof fieldName === W8) { var t8 = T8R; t8 += q$k; t8 += M_J; t8 += I2w; var X2 = J4H; X2 += a6N60.b_J; that[d39](fieldName)[X2](); delete sFields[fieldName]; var orderIdx = $[J5n](fieldName, this[U0f][t8]); this[U0f][C_E][T$A](orderIdx, J32); var includeIdx = $[J5n](fieldName, this[U0f][D4g]); if (includeIdx !== -J32) { var x3 = n6n; x3 += O_v; x3 += Y4p; this[U0f][x3][T$A](includeIdx, J32); } } else { $[H1T](this[x$v](fieldName), function (i, name) { var O9 = c2T; O9 += s_P; that[O9](name); }); } return this; } function close() { var Z5Q = "los"; var T_ = R4N; T_ += c2T; T_ += Z5Q; T_ += M_J; a6N60.P01(); this[T_](L0j); return this; } function create(arg1, arg2, arg3, arg4) { var l5y = "nitCr"; var V9l = "displayRe"; var t2r = "lock"; var U7L = "_actionC"; var p7 = w81; p7 += l5y; p7 += q2Q; var y3 = B6$; y3 += Z0K; y3 += X9Y; var e6 = R4N; e6 += V9l; e6 += T8R; e6 += d2g; var G9 = U7L; G9 += M12; G9 += G2j; var K$ = a6N60[83715]; K$ += t2r; var f2 = G13; f2 += X9Y; f2 += w81; f2 += p$p; var _this = this; var that = this; var sFields = this[U0f][E9S]; var count = J32; if (this[B3$](function () { var O0 = c2T; O0 += I2w; a6N60.g4A(); O0 += M_J; O0 += x_i; that[O0](arg1, arg2, arg3, arg4); })) { return this; } if (typeof arg1 === t4Q) { count = arg1; arg1 = arg2; arg2 = arg3; } this[U0f][N$y] = {}; for (var i = d4r; i < count; i++) { var m7 = a6N60.w1W; m7 += h7j; m7 += j8j; this[U0f][N$y][i] = { fields: this[U0f][m7] }; } var argOpts = this[J5L](arg1, arg2, arg3, arg4); this[U0f][p01] = q9n; this[U0f][f2] = e9f; this[U0f][J$B] = y8F; this[K6_][E05][x9h][N6r] = K$; this[G9](); this[e6](this[E9S]()); $[H1T](sFields, function (name, fieldIn) { var l0 = q$k; l0 += M_J; l0 += a6N60.w1W; var def = fieldIn[l0](); fieldIn[v3v](); for (var i = d4r; i < count; i++) { var r5 = H7A; r5 += Z9E; fieldIn[r5](i, def); } fieldIn[N9h](def); }); this[y3](p7, y8F, function () { var d_ = a6N60[204096]; d_ += O4D; _this[V7D](); _this[g7p](argOpts[d_]); a6N60.g4A(); argOpts[H80](); }); return this; } function undependent(parent) { var w8I = "isA"; var C_x = '.edep'; var F0 = w8I; F0 += I2w; F0 += D$i; F0 += a6N60.b_J; if (Array[F0](parent)) { var F6 = T30; F6 += r1L; for (var i = d4r, ien = parent[F6]; i < ien; i++) { var r2 = a6N60.E4C; r2 += Y2t; r2 += D$V; this[r2](parent[i]); } return this; } $(this[d39](parent)[H$p]())[E6I](C_x); return this; } function dependent(parent, url, optsIn) { var u1r = a6N60; var l0g = "edep"; var X$c = "depend"; var l4H = 'POST'; var E8 = a$3; E8 += l0g; var V7 = V2n; V7 += a6N60[204096]; V7 += q$k; V7 += M_J; var L7 = k3E; L7 += C7A; L7 += q$k; var d6 = a6N60[406894]; d6 += U0f; d6 += a6N60[204096]; d6 += V2n; var z8 = x1v; z8 += q$k; var o4 = w81; o4 += X5Z; u1r.P01(); o4 += D$i; o4 += a6N60.b_J; var _this = this; if (Array[o4](parent)) { for (var i = d4r, ien = parent[A82]; i < ien; i++) { var V4 = X$c; V4 += P3y; V4 += X9Y; this[V4](parent[i], url, optsIn); } return this; } var that = this; var parentField = this[z8](parent); var ajaxOpts = { dataType: d6, type: l4H }; var opts = $[L7]({}, { data: y8F, event: h0P, postUpdate: y8F, preUpdate: y8F }, optsIn); var update = function (json) { var O2a = 'error'; var e2u = "enab"; var v3q = 'disable'; var J$q = "pd"; var J6g = 'val'; var p8p = 'hide'; var i7x = "preUpdate"; var K9h = "pdat"; var c9C = "postUpdate"; var S8X = 'show'; var t5w = "stU"; var w9 = H4E; w9 += t5w; w9 += K9h; w9 += M_J; var x5 = e2u; x5 += p$O; var C1 = M_J; C1 += Z1G; C1 += c2T; C1 += c8f; var h2 = a6N60.E4C; h2 += J$q; h2 += x_i; var j7 = q11; j7 += Z1G; j7 += R6J; var o9 = f$v; o9 += a6N60[83715]; o9 += M_J; o9 += M12; var u3 = n7$; u3 += T7i; u3 += K9h; u3 += M_J; if (opts[u3]) { opts[i7x](json); } $[H1T]({ errors: O2a, labels: o9, messages: j7, options: h2, values: J6g }, function (jsonProp, fieldFn) { u1r.g4A(); if (json[jsonProp]) { var o6 = M_J; o6 += Z1G; o6 += c2T; o6 += c8f; $[o6](json[jsonProp], function (fieldIn, valIn) { var X_ = l04; X_ += M_J; X_ += M12; X_ += q$k; that[X_](fieldIn)[fieldFn](valIn); }); } }); $[C1]([p8p, S8X, x5, v3q], function (i, key) { if (json[key]) { that[key](json[key], json[s6E]); } }); if (opts[w9]) { opts[c9C](json); } u1r.P01(); parentField[i$j](L0j); }; $(parentField[V7]())[p$p](opts[W65] + E8, function (e) { var A80 = "arg"; var b43 = "proc"; u1r.g4A(); var v8t = "tFields"; var Z9Y = "values"; var h0 = R0n; h0 += Z1G; h0 += M12; var p8 = k7M; p8 += j3w; p8 += U0f; var I6 = I2w; I6 += a6N60[204096]; I6 += j3w; I6 += U0f; var O2 = I2w; O2 += a6N60[204096]; O2 += j3w; var y8 = h46; y8 += X9Y; y8 += Z1G; var k1 = e1N; k1 += w81; k1 += v8t; var f7 = I2w; f7 += c6h; f7 += U0f; var W0 = b43; W0 += g3T; W0 += Z9p; var X1 = X9Y; X1 += A80; X1 += M_J; X1 += X9Y; if ($(parentField[H$p]())[J2D](e[X1])[A82] === d4r) { return; } parentField[W0](o76); var data = {}; data[f7] = _this[U0f][k1] ? pluck(_this[U0f][N$y], y8) : y8F; data[O2] = data[I6] ? data[p8][d4r] : y8F; data[Z9Y] = _this[h0](); if (opts[Z6V]) { var s2 = q$k; s2 += Z1G; s2 += X9Y; s2 += Z1G; var ret = opts[s2](data); if (ret) { data = ret; } } if (typeof url === a6N60[280451]) { var W3 = E8G; W3 += M12; var o = url[W3](_this, parentField[r8Z](), data, update, e); if (o) { var M7 = X9Y; M7 += E7n; M7 += V2n; if (typeof o === i1W && typeof o[M7] === a6N60[280451]) { o[Z7h](function (resolved) { u1r.P01(); if (resolved) { update(resolved); } }); } else { update(o); } } } else { var Z6 = V_R; Z6 += P3y; Z6 += q$k; if ($[N0C](url)) { $[f_z](ajaxOpts, url); } else { var X7 = a6N60.E4C; X7 += I2w; X7 += M12; ajaxOpts[X7] = url; } $[S15]($[Z6](ajaxOpts, { data: data, success: update })); } }); return this; } function destroy() { var f9C = "lat"; var c_3 = "tem"; var n2W = "destr"; var f$z = "yEdi"; var p2 = J4H; p2 += f$z; p2 += N5b; var N9 = a$3; N9 += B0P; N9 += M_J; var I4 = n2W; I4 += a6N60[204096]; I4 += a6N60.b_J; var H_ = c2T; H_ += s_P; if (this[U0f][l4t]) { this[C$M](); } this[H_](); if (this[U0f][j4a]) { var E3 = c_3; E3 += E43; E3 += f9C; E3 += M_J; var K6 = Z1G; K6 += Q9T; K6 += M_J; K6 += Y2t; $(l0a)[K6](this[U0f][E3]); } var controller = this[U0f][i4h]; if (controller[I4]) { controller[k9h](this); } a6N60.P01(); $(document)[E6I](N9 + this[U0f][J3r]); $(document)[Z16](p2, [this]); this[K6_] = y8F; this[U0f] = y8F; } function disable(name) { var x6S = "dNames"; var v5M = "_fi"; var V9 = v5M; V9 += M_J; V9 += M12; V9 += x6S; a6N60.g4A(); var W_ = M_J; W_ += Z1G; W_ += c2T; W_ += c8f; var that = this; $[W_](this[V9](name), function (i, n) { var A1D = "abl"; var o3 = q$k; o3 += E1g; o3 += A1D; o3 += M_J; a6N60.P01(); var w_ = a6N60.w1W; w_ += A9P; w_ += q$k; that[w_](n)[o3](); }); return this; } function display(showIn) { var U0P = "ye"; var I8 = c2T; I8 += I_X; if (showIn === undefined) { var e8 = F$j; e8 += U0P; e8 += q$k; return this[U0f][e8]; } a6N60.P01(); return this[showIn ? e21 : I8](); } function displayed() { var A$ = a6N60.w1W; A$ += w81; A$ += T8k; return $[M74](this[U0f][A$], function (fieldIn, name) { return fieldIn[l4t]() ? name : y8F; }); } function displayNode() { var G$9 = "playController"; var S8 = B8P; a6N60.P01(); S8 += G$9; return this[U0f][S8][H$p](this); } function edit(items, arg1, arg2, arg3, arg4) { var v99 = "dArgs"; var z8G = "cru"; var f3 = a6N60[204096]; f3 += E43; f3 += X9Y; f3 += U0f; var n4 = U6y; n4 += Z1G; n4 += w81; n4 += V2n; var H6 = a6N60.w1W; H6 += r83; var G3 = R4N; G3 += q65; var N5 = R4N; N5 += z8G; N5 += v99; var Y_ = R4N; Y_ += J5t; Y_ += q$k; Y_ += a6N60.b_J; var _this = this; var that = this; if (this[Y_](function () { a6N60.g4A(); that[T5j](items, arg1, arg2, arg3, arg4); })) { return this; } var argOpts = this[N5](arg1, arg2, arg3, arg4); this[U2P](items, this[G3](H6, items), n4, argOpts[f3], function () { var A4_ = "Main"; var Q7y = "_assemble"; var f6U = "maybeOp"; var m2 = f6U; m2 += P3y; var U1 = a6N60[204096]; a6N60.P01(); U1 += E43; U1 += X9Y; U1 += U0f; var K1 = Q7y; K1 += A4_; _this[K1](); _this[g7p](argOpts[U1]); argOpts[m2](); }); return this; } function enable(name) { a6N60.P01(); var k9 = M_J; k9 += Z1G; k9 += c2T; k9 += c8f; var that = this; $[k9](this[x$v](name), function (i, n) { var h3 = x1v; h3 += q$k; that[h3](n)[V1F](); }); return this; } function error$1(name, msg) { var P3N = "formEr"; var Y_T = "formErro"; var c3n = "balError"; var u8d = "glo"; var e5 = N7N; e5 += I2w; var S3 = q$k; S3 += a6N60[204096]; S3 += U6y; var wrapper = $(this[S3][e5]); if (msg === undefined) { var Q5 = u8d; Q5 += c3n; var W6 = w81; W6 += U0f; var v3 = Y_T; v3 += I2w; var u5 = q$k; u5 += a6N60[204096]; u5 += U6y; var i2 = P3N; i2 += s2g; this[e6W](this[K6_][i2], name, o76, function () { var F2N = "Fo"; var T5J = "toggleCla"; var Q1Y = "rmEr"; var a1 = i8S; a1 += F2N; a1 += Q1Y; a1 += s2g; var J1 = T5J; J1 += U0f; J1 += U0f; wrapper[J1](a1, name !== undefined && name !== q2P); }); if (name && !$(this[u5][v3])[W6](u0E)) { alert(name[k2r](/<br>/g, O2N)); } this[U0f][Q5] = name; } else { var J3 = a6N60.V56; J3 += s2g; this[d39](name)[J3](msg); } return this; } function field(name) { var I8_ = 'Unknown field name - '; var o$ = Q4Q; o$ += M12; o$ += q$k; o$ += U0f; var sFields = this[U0f][o$]; if (!sFields[name]) { throw new Error(I8_ + name); } return sFields[name]; } function fields() { return $[M74](this[U0f][E9S], function (fieldIn, name) { return name; }); } function file(name, id) { var F_U = " in tabl"; var I14 = 'Unknown file id '; a6N60.P01(); var tableFromFile = this[o7V](name); var fileFromTable = tableFromFile[id]; if (!fileFromTable) { var g0 = F_U; g0 += M_J; g0 += S_v; throw new Error(I14 + id + g0 + name); } return tableFromFile[id]; } function files(name) { var Y09 = "wn file table name: "; var Y4E = "Unkno"; a6N60.g4A(); if (!name) { var D8 = I4u; D8 += U0f; return Editor[D8]; } var editorTable = Editor[o7V][name]; if (!editorTable) { var T0 = Y4E; T0 += Y09; throw new Error(T0 + name); } return editorTable; } function get(name) { var that = this; a6N60.P01(); if (!name) { var Z0 = l04; Z0 += I0R; Z0 += U0f; name = this[Z0](); } if (Array[B1R](name)) { var out_1 = {}; $[H1T](name, function (i, n) { var v_4 = R6J; v_4 += X9Y; var a28 = a6N60.w1W; a6N60.g4A(); a28 += h7j; a28 += f3s; out_1[n] = that[a28](n)[v_4](); }); return out_1; } return this[d39](name)[l1t](); } function hide(names, animate) { a6N60.g4A(); var Z6p = "ldNames"; var m_8 = R4N; m_8 += Q4Q; m_8 += Z6p; var that = this; $[H1T](this[m_8](names), function (i, n) { var d2N = c8f; d2N += C8o; d2N += M_J; var z0Y = l04; a6N60.P01(); z0Y += S3z; z0Y += q$k; that[z0Y](n)[d2N](animate); }); return this; } function ids(includeHash) { var V0o = "itField"; var e6R = M_J; e6R += q$k; e6R += V0o; e6R += U0f; if (includeHash === void d4r) { includeHash = L0j; } return $[M74](this[U0f][e6R], function (editIn, idSrc) { return includeHash === o76 ? f5w + idSrc : idSrc; }); } function inError(inNames) { var j7g = "lobalErro"; var r61 = "inErro"; var C02 = T30; C02 += r1L; var G5z = K3b; G5z += j7g; G5z += I2w; a6N60.P01(); if (this[U0f][G5z]) { return o76; } var names = this[x$v](inNames); for (var i = d4r, ien = names[C02]; i < ien; i++) { var h9j = r61; h9j += I2w; var B5E = a6N60.w1W; B5E += w81; B5E += S3z; B5E += q$k; if (this[B5E](names[i])[h9j]()) { return o76; } } return L0j; } function inline(cell, fieldName, opts) { var I_e = "_ti"; var s_V = 'Cannot edit more than one row inline at a time'; var n9V = "Pla"; var z4p = i3$; z4p += X9Y; var f9p = I_e; f9p += q$k; f9p += a6N60.b_J; var K2N = p$O; K2N += c$s; var R_S = r4y; R_S += X9Y; R_S += c8f; var h2g = v5N; h2g += a6N60.b_J; h2g += U0f; var r00 = R4N; r00 += q65; var e40 = M_J; e40 += G2f; e40 += Y2t; var n6p = E1g; n6p += n9V; n6p += z8F; var _this = this; var that = this; if ($[n6p](fieldName)) { opts = fieldName; fieldName = undefined; } opts = $[e40]({}, this[U0f][R4e][T7$], opts); var editFields = this[r00](u0J, cell, fieldName); var keys = Object[h2g](editFields); if (keys[R_S] > J32) { throw new Error(s_V); } var editRow = editFields[keys[d4r]]; var hosts = []; for (var _i = d4r, _a = editRow[F$S]; _i < _a[A82]; _i++) { var row = _a[_i]; hosts[d5s](row); } if ($(c30, hosts)[K2N]) { return this; } if (this[f9p](function () { a6N60.g4A(); that[T7$](cell, fieldName, opts); })) { return this; } this[z4p](cell, editFields, X83, opts, function () { a6N60.P01(); _this[S$P](editFields, opts); }); return this; } function inlineCreate(insertPoint, opts) { var A9x = "initC"; a6N60.P01(); var Z1k = "_dataSo"; var T1C = "editFie"; var i_I = "eR"; var g8v = "nClass"; var L4K = "urce"; var A7U = A9x; A7U += m3r; A7U += Q1N; A7U += M_J; var h0Z = T1C; h0Z += j8j; var I9C = j8u; I9C += Z6f; I9C += g8v; var b$w = C1X; b$w += o8e; b$w += i_I; b$w += c6h; var u5l = Z1k; u5l += L4K; var z5W = C8j; z5W += M_J; z5W += Q1N; z5W += M_J; var F2a = U6y; F2a += Z1G; F2a += w81; F2a += V2n; var a2p = U6y; a2p += A3c; a2p += M_J; var G_Y = a6N60.w1W; G_Y += A9P; G_Y += Y4p; var C4k = R4N; C4k += X9Y; C4k += C8o; C4k += a6N60.b_J; var _this = this; if ($[N0C](insertPoint)) { opts = insertPoint; insertPoint = y8F; } if (this[C4k](function () { var q8v = "inlineCreate"; _this[q8v](insertPoint, opts); })) { return this; } $[H1T](this[U0f][G_Y], function (name, fieldIn) { var V4p = "multiRes"; var T04 = "tiSet"; var n3a = U0f; n3a += M_J; n3a += X9Y; var h8C = q$k; a6N60.g4A(); h8C += M_J; h8C += a6N60.w1W; var Q9x = N3F; Q9x += T04; var C9_ = V4p; C9_ += Z9E; fieldIn[C9_](); fieldIn[Q9x](d4r, fieldIn[h8C]()); fieldIn[n3a](fieldIn[t1Y]()); }); this[U0f][a2p] = F2a; this[U0f][X6S] = z5W; this[U0f][J$B] = y8F; this[U0f][N$y] = this[u5l](b$w, insertPoint); opts = $[f_z]({}, this[U0f][R4e][T7$], opts); this[I9C](); this[S$P](this[U0f][h0Z], opts, function () { var P0x = 'fakeRowEnd'; var p73 = y5w; p73 += Z1G; p73 += t48; a6N60.P01(); p73 += v43; _this[p73](P0x); }); this[n0R](A7U, y8F); return this; } function message(name, msg) { a6N60.P01(); var l4c = "formInfo"; var j7e = "sag"; if (msg === undefined) { var A0_ = R4N; A0_ += d3p; A0_ += j7e; A0_ += M_J; this[A0_](this[K6_][l4c], name); } else { this[d39](name)[d1n](msg); } return this; } function mode(modeIn) { var z7D = "ported"; var o53 = " an editing mode"; var U22 = "m create mode is not sup"; var O2J = "Not currently "; var s93 = "Changing fro"; var Q9c = c2T; Q9c += e0e; var n3q = G_P; n3q += w81; n3q += a6N60[204096]; n3q += V2n; var R85 = Z1G; R85 += U75; R85 += Z3I; if (!modeIn) { var k_8 = Z1G; k_8 += U75; k_8 += w81; k_8 += p$p; return this[U0f][k_8]; } if (!this[U0f][R85]) { var z8z = O2J; z8z += i8S; z8z += o53; throw new Error(z8z); } else if (this[U0f][n3q] === e9f && modeIn !== Q9c) { var o8X = s93; o8X += U22; o8X += z7D; throw new Error(o8X); } this[U0f][X6S] = modeIn; return this; } function modifier() { var t62 = "dif"; var W4u = t5A; W4u += t62; a6N60.P01(); W4u += w81; W4u += a6N60.V56; return this[U0f][W4u]; } function multiGet(fieldNames) { var T9B = "Get"; var k05 = P35; a6N60.g4A(); k05 += T9B; var that = this; if (fieldNames === undefined) { fieldNames = this[E9S](); } if (Array[B1R](fieldNames)) { var out_2 = {}; $[H1T](fieldNames, function (i, name) { out_2[name] = that[d39](name)[p3r](); }); return out_2; } return this[d39](fieldNames)[k05](); } function multiSet(fieldNames, valIn) { a6N60.P01(); var that = this; if ($[N0C](fieldNames) && valIn === undefined) { $[H1T](fieldNames, function (name, value) { var q9e = "Set"; var r2r = U6y; r2r += a6N60.E4C; r2r += w$y; a6N60.g4A(); r2r += q9e; var I_E = l04; I_E += M_J; I_E += M12; I_E += q$k; that[I_E](name)[r2r](value); }); } else { var E7v = H7A; E7v += Z9E; this[d39](fieldNames)[E7v](valIn); } return this; } function node(name) { var b8m = E1g; b8m += P_C; b8m += X3J; var that = this; if (!name) { var t5z = T8R; t5z += q$k; t5z += M_J; t5z += I2w; name = this[t5z](); } return Array[b8m](name) ? $[M74](name, function (n) { var c9B = l04; c9B += M_J; c9B += f3s; return that[c9B](n)[H$p](); }) : this[d39](name)[H$p](); } function off(name, fn) { $(this)[E6I](this[j53](name), fn); a6N60.P01(); return this; } function on(name, fn) { a6N60.g4A(); $(this)[p$p](this[j53](name), fn); return this; } function one(name, fn) { var B0D = m22; B0D += t4m; B0D += I4r; $(this)[r44](this[B0D](name), fn); a6N60.P01(); return this; } function open() { var T__ = "_postop"; var j5_ = "Op"; var J_y = "layR"; var P3R = "_nested"; var U21 = "closeReg"; var B_l = "_disp"; var S94 = "nest"; var C_K = T__; C_K += P3y; var R8m = P3R; R8m += j5_; R8m += P3y; var f2X = U6y; f2X += Z1G; f2X += i8S; var p89 = w4f; p89 += L9E; p89 += V2n; var n8c = R4N; n8c += U21; var H7Y = B_l; H7Y += J_y; H7Y += R8G; H7Y += V3_; var _this = this; this[H7Y](); this[n8c](function () { var H_z = "_ne"; var C7g = "stedC"; var X6Z = H_z; X6Z += C7g; X6Z += M12; X6Z += v5Z; _this[X6Z](function () { var A74 = "icInfo"; var S73 = "arDyna"; var K$Q = "_cle"; var n8x = "ain"; var X4F = U6y; X4F += n8x; var E1n = K$Q; E1n += S73; E1n += U6y; E1n += A74; _this[E1n](); _this[n0R](U53, [X4F]); }); }); var ret = this[p89](f2X); if (!ret) { return this; } this[R8m](function () { var s47 = "ened"; var x_5 = G13; x_5 += J5t; x_5 += p$p; var o7C = a6N60[204096]; o7C += E43; o7C += s47; var S8$ = R4N; S8$ += T2g; S8$ += P3y; S8$ += X9Y; _this[N8a]($[M74](_this[U0f][C_E], function (name) { var h3e = a6N60.w1W; h3e += A9P; h3e += q$k; h3e += U0f; a6N60.g4A(); return _this[U0f][h3e][name]; }), _this[U0f][j4C][T0s]); _this[S8$](o7C, [q9n, _this[U0f][x_5]]); }, this[U0f][j4C][S94]); this[C_K](q9n, L0j); return this; } function order(setIn) { var G8f = "_displayReord"; var l7B = 'All fields, and no additional fields, must be provided for ordering.'; var H4o = "sort"; var Y3A = G8f; Y3A += a6N60.V56; var p8W = a6N60[204096]; p8W += V3_; var i_F = U0f; i_F += M12; i_F += e8y; i_F += M_J; var r3r = G8l; r3r += i8S; var V9B = U0f; V9B += a6N60[204096]; V9B += I2w; V9B += X9Y; var n0V = a6N60[204096]; n0V += B86; n0V += a6N60.V56; var V$k = w81; V$k += X5Z; V$k += X3J; if (!setIn) { var B6b = T8R; B6b += d2g; return this[U0f][B6b]; } if (arguments[A82] && !Array[V$k](setIn)) { var S4t = U0f; S4t += k8e; setIn = Array[c$a][S4t][T66](arguments); } if (this[U0f][n0V][f88]()[V9B]()[r3r](A34) !== setIn[i_F]()[H4o]()[H_a](A34)) { throw new Error(l7B); } $[f_z](this[U0f][p8W], setIn); this[Y3A](); return this; } function remove(items, arg1, arg2, arg3, arg4) { var x4x = "_dataSourc"; var o3_ = "ditFields"; var v2h = 'initRemove'; var v$B = "ctionCl"; var n7B = 'data'; var N4O = V2n; N4O += A3c; N4O += M_J; var I9u = B6$; I9u += k6O; I9u += V2n; I9u += X9Y; var b64 = j8u; b64 += v$B; b64 += G2j; var X68 = V2n; X68 += a6N60[204096]; X68 += V2n; X68 += M_J; var y6n = x$f; y6n += U6y; var N$P = R9e; N$P += U6y; var E0a = M_J; E0a += o3_; var f9e = s1q; f9e += l04; f9e += a6N60.V56; var q42 = I2w; q42 += R3M; q42 += M_J; var p3e = Z1G; p3e += w8B; p3e += p$p; var D0m = x4x; D0m += M_J; var F4b = i1c; F4b += Q4a; F4b += M_J; var T9c = R4N; T9c += J5t; T9c += V_I; var _this = this; var that = this; if (this[T9c](function () { that[r0C](items, arg1, arg2, arg3, arg4); })) { return this; } if (!items && !this[U0f][F4b]) { items = H5x; } if (items[A82] === undefined) { items = [items]; } var argOpts = this[J5L](arg1, arg2, arg3, arg4); var editFields = this[D0m](O3y, items); this[U0f][p3e] = q42; this[U0f][f9e] = items; this[U0f][E0a] = editFields; this[N$P][y6n][x9h][N6r] = X68; this[b64](); this[I9u](v2h, [pluck(editFields, N4O), pluck(editFields, n7B), items], function () { var S4v = 'initMultiRemove'; var b6v = m22; b6v += t4m; a6N60.P01(); _this[b6v](S4v, [editFields, items], function () { var g3K = "_formOp"; var y3K = "Opts"; var D$X = a6N60.w1W; D$X += j9q; var x0j = e1N; x0j += w81; x0j += X9Y; x0j += y3K; var Y_$ = g3K; Y_$ += X9Y; Y_$ += P3F; Y_$ += C1C; a6N60.P01(); _this[V7D](); _this[Y_$](argOpts[Z3g]); argOpts[H80](); var opts = _this[U0f][x0j]; if (opts[D$X] !== y8F) { setTimeout(function () { if (_this[K6_]) { var Y2M = q$k; Y2M += a6N60[204096]; Y2M += U6y; $(R6C, _this[Y2M][u8E])[f9w](opts[T0s])[T0s](); } }, A_s); } }); }); return this; } function set(setIn, valIn) { var that = this; a6N60.P01(); if (!$[N0C](setIn)) { var o = {}; o[setIn] = valIn; setIn = o; } $[H1T](setIn, function (n, v) { var G78 = U0f; G78 += M_J; a6N60.g4A(); G78 += X9Y; that[d39](n)[G78](v); }); return this; } function show(names, animate) { var that = this; a6N60.P01(); $[H1T](this[x$v](names), function (i, n) { var q9o = x4d; q9o += a6N60[204096]; q9o += j3w; that[d39](n)[q9o](animate); }); return this; } function submit(successCallback, errorCallback, formatdata, hideIn) { var B5S = "closest"; var P6T = "processi"; var g1f = "Element"; var X3S = E7m; X3S += x3e; var B4c = r4y; B4c += X9Y; B4c += c8f; var m00 = G_P; m00 += H6i; m00 += M_J; m00 += g1f; var y_2 = Z1G; y_2 += c2T; y_2 += b7n; y_2 += V2n; var k1m = P6T; k1m += k$f; var _this = this; var fields = this[U0f][E9S]; var errorFields = []; var errorReady = d4r; var sent = L0j; if (this[U0f][k1m] || !this[U0f][y_2]) { return this; } this[X2p](o76); var send = function () { var l_O = 'initSubmit'; var W3m = Z1G; W3m += l4S; var U9t = B6$; U9t += R0n; U9t += P3y; U9t += X9Y; var E5i = M12; E5i += P3y; E5i += r1L; if (errorFields[E5i] !== errorReady || sent) { return; } _this[U9t](l_O, [_this[U0f][W3m]], function (result) { var i0W = "_s"; var O$A = i0W; O$A += k_z; O$A += w81; O$A += X9Y; if (result === L0j) { var J6x = R4N; J6x += C5H; J6x += K3b; _this[J6x](L0j); return; } sent = o76; _this[O$A](successCallback, errorCallback, formatdata, hideIn); }); }; var active = document[m00]; a6N60.P01(); if ($(active)[B5S](c30)[B4c] !== d4r) { var R8A = a6N60[83715]; R8A += M12; R8A += a6N60.E4C; R8A += I2w; active[R8A](); } this[H1B](); $[H1T](fields, function (name, fieldIn) { if (fieldIn[T_9]()) { var v6L = F4X; v6L += x4d; errorFields[v6L](name); } }); $[X3S](errorFields, function (i, name) { fields[name][H1B](q2P, function () { errorReady++; send(); }); }); send(); return this; } function table(setIn) { var Y9e = X9Y; a6N60.g4A(); Y9e += b3y; if (setIn === undefined) { return this[U0f][z5g]; } this[U0f][Y9e] = setIn; return this; } function template(setIn) { a6N60.g4A(); if (setIn === undefined) { return this[U0f][j4a]; } this[U0f][j4a] = setIn === y8F ? y8F : $(setIn); return this; } function title(titleIn) { var I5U = "></"; var W$f = "htm"; var c5q = "dren"; var W6A = "hea"; var H35 = q$k; H35 += Z1G; H35 += X9Y; H35 += Z1G; var W2P = W74; W2P += U6y; W2P += M12; var G0p = W$f; G0p += M12; var e9Y = i1c; e9Y += K3b; var g9r = X9Y; g9r += Z1G; g9r += K3b; var D24 = X9Y; D24 += Z1G; D24 += K3b; var S61 = J5t; S61 += H5c; a6N60.g4A(); S61 += M_J; var E4A = W6A; E4A += q$k; E4A += a6N60.V56; var q0D = S$Q; q0D += w4E; var p4G = i2D; p4G += X9Y; p4G += U2N; var p$Z = q$k; p$Z += w81; p$Z += R0n; p$Z += a$3; var p04 = d8G; p04 += M12; p04 += c5q; var D2u = E7n; D2u += Z1G; D2u += q$k; D2u += a6N60.V56; var header = $(this[K6_][D2u])[p04](p$Z + this[v68][Q6x][p4G]); var titleClass = this[q0D][E4A][S61]; if (titleIn === undefined) { return header[Z6V](l5k); } if (typeof titleIn === a6N60[280451]) { var Z4N = i1c; Z4N += t_C; titleIn = titleIn(this, new DataTable$5[c8Q](this[U0f][Z4N])); } var set = titleClass[D24] ? $(B9f + titleClass[g9r] + I5U + titleClass[e9Y])[s9J](titleClass[e$6])[G0p](titleIn) : titleIn; header[W2P](set)[H35](l5k, titleIn); return this; } function val(fieldIn, value) { var g28 = T73; g28 += w81; g28 += k3i; if (value !== undefined || $[g28](fieldIn)) { return this[N9h](fieldIn, value); } return this[l1t](fieldIn); } function error(msg, tn, thro) { var Y7Z = ' For more information, please refer to https://datatables.net/tn/'; a6N60.P01(); if (thro === void d4r) { thro = o76; } var display = tn ? msg + Y7Z + tn : msg; if (thro) { throw display; } else { var t0G = j3w; t0G += Z1G; t0G += v9R; console[t0G](display); } } function pairs(data, props, fn) { var M6y = "lai"; var r5D = U1D; r5D += M_J; var F30 = V_R; F30 += y9h; var i; a6N60.g4A(); var ien; var dataPoint; props = $[F30]({ label: N5y, value: r5D }, props); if (Array[B1R](data)) { for ((i = d4r, ien = data[A82]); i < ien; i++) { var o4S = f6h; o4S += M6y; o4S += k3i; dataPoint = data[i]; if ($[o4S](dataPoint)) { var w0s = f$v; w0s += e0x; w0s += M12; var J_U = R0n; J_U += Z1G; J_U += q_0; J_U += M_J; fn(dataPoint[props[J_U]] === undefined ? dataPoint[props[C6D]] : dataPoint[props[g_h]], dataPoint[props[w0s]], i, dataPoint[u4o]); } else { fn(dataPoint, dataPoint, i); } } } else { i = d4r; $[H1T](data, function (key, val) { fn(val, key, i); i++; }); } } function upload$1(editor, conf, files, progressCallback, completeCallback) { var U1L = a6N60; var O7m = "ileReadText"; var A6L = "readAsDataURL"; var N$L = "errors"; var z3h = "_li"; var T1r = "tLeft"; var j_c = 'A server error occurred while uploading the file'; var T5z = "aj"; var l01 = "Left"; var h5X = "rs"; var H2u = "onload"; var M_O = '<i>Uploading file</i>'; var n0T = z3h; n0T += I_6; n0T += X9Y; n0T += l01; var d2v = U6y; d2v += O0I; var S42 = a6N60.w1W; S42 += O7m; var I9d = T5z; U1L.P01(); I9d += Z1G; I9d += K51; var S$n = M_J; S$n += N9U; S$n += a6N60[204096]; S$n += h5X; var r1W = a6N60.V56; r1W += I2w; r1W += T8R; r1W += U0f; var reader = new FileReader(); var counter = d4r; var ids = []; var generalError = conf[N$L] && conf[r1W][R4N] ? conf[S$n][R4N] : j_c; editor[H1B](conf[F5b], q2P); if (typeof conf[I9d] === a6N60[280451]) { var p1k = Z1G; p1k += a6N60[406894]; p1k += Z1G; p1k += K51; conf[p1k](files, function (idsIn) { U1L.g4A(); completeCallback[T66](editor, idsIn); }); return; } progressCallback(conf, conf[S42] || M_O); reader[H2u] = function (e) { var l1k = "xData"; var W_q = "feature cannot use `ajax.data` with an"; var s__ = "Upload "; var i6D = "oadF"; var J$K = "oa"; var A1k = "strin"; var E5E = "upl"; var S5$ = 'preUpload'; var W1Y = "ja"; var H0D = 'upload'; var l10 = 'No Ajax option specified for upload plug-in'; var m9N = " object. Please use it as a function instead."; var p4D = U5W; p4D += b7n; p4D += V2n; var A3p = A1k; A3p += K3b; var O35 = U0f; O35 += D$M; O35 += w81; O35 += k$f; var b$e = Z1G; b$e += a6N60[406894]; b$e += Z1G; b$e += K51; var p_0 = Z1G; p_0 += a6N60[406894]; p_0 += Z1G; p_0 += K51; var Y$8 = Z1G; Y$8 += a6N60[406894]; Y$8 += Z1G; Y$8 += K51; var H3B = S15; H3B += p4h; H3B += E_W; U1L.P01(); var a$R = V2n; a$R += x0Q; var M6f = E5E; M6f += i6D; M6f += w81; M6f += I0R; var Z2d = u6G; Z2d += M12; Z2d += J$K; Z2d += q$k; var q80 = G_P; q80 += w81; q80 += a6N60[204096]; q80 += V2n; var data = new FormData(); var ajax; data[w2$](q80, Z2d); data[w2$](M6f, conf[a$R]); data[w2$](H0D, files[counter]); if (conf[H3B]) { var y89 = k8O; y89 += l1k; conf[y89](data, files[counter], counter); } if (conf[Y$8]) { var Y$Y = Z1G; Y$Y += W1Y; Y$Y += K51; ajax = conf[Y$Y]; } else if ($[N0C](editor[U0f][p_0])) { var d5c = k8O; d5c += K51; var t6Q = Z1G; t6Q += a6N60[406894]; t6Q += Z1G; t6Q += K51; var k6K = Z1G; k6K += a6N60[406894]; k6K += e9M; ajax = editor[U0f][k6K][M6E] ? editor[U0f][t6Q][M6E] : editor[U0f][d5c]; } else if (typeof editor[U0f][b$e] === O35) { var g4w = Z1G; g4w += a6N60[406894]; g4w += Z1G; g4w += K51; ajax = editor[U0f][g4w]; } if (!ajax) { throw new Error(l10); } if (typeof ajax === A3p) { ajax = { url: ajax }; } if (typeof ajax[Z6V] === p4D) { var z16 = E7m; z16 += x3e; var D_g = j2N; D_g += i8S; D_g += K3b; var d = {}; var ret = ajax[Z6V](d); if (ret !== undefined && typeof ret !== D_g) { d = ret; } $[z16](d, function (key, value) { var i$T = O0I; i$T += o1u; U1L.P01(); data[i$T](key, value); }); } else if ($[N0C](ajax[Z6V])) { var d$R = s__; d$R += W_q; d$R += m9N; throw new Error(d$R); } editor[n0R](S5$, [conf[F5b], files[counter], data], function (preRet) { var S_d = "ataUR"; var x$s = "L"; var H1e = "preSubmit"; var c09 = "oad"; var J3t = "sta"; var y8C = ".DTE_Upl"; var H4y = "readA"; var X2V = "sD"; var m9E = H4E; m9E += Y9I; var r3u = a6N60[406894]; r3u += U0f; r3u += a6N60[204096]; r3u += V2n; var l4M = T5z; l4M += Z1G; l4M += K51; var e4R = H1e; e4R += y8C; e4R += c09; var t3F = a6N60[204096]; t3F += V2n; if (preRet === L0j) { var Q8_ = T30; Q8_ += a1c; Q8_ += c8f; if (counter < files[Q8_] - J32) { var Q00 = H4y; Q00 += X2V; Q00 += S_d; Q00 += x$s; counter++; reader[Q00](files[counter]); } else { completeCallback[T66](editor, ids); } return; } var submit = L0j; editor[t3F](e4R, function () { submit = o76; U1L.g4A(); return L0j; }); U1L.P01(); $[l4M]($[f_z]({}, ajax, { contentType: L0j, data: data, dataType: r3u, error: function (xhr) { var Q5i = 'preSubmit.DTE_Upload'; var s8Q = "tus"; var v20 = 'uploadXhrError'; var h$K = j5M; h$K += M_J; var l$w = J3t; l$w += s8Q; var y8x = V2n; y8x += Z1G; y8x += U6y; y8x += M_J; var z8t = a6N60[204096]; z8t += a6N60.w1W; z8t += a6N60.w1W; var errors = conf[N$L]; editor[z8t](Q5i); editor[H1B](conf[y8x], errors && errors[xhr[l$w]] ? errors[xhr[D56]] : generalError); editor[n0R](v20, [conf[h$K], xhr]); progressCallback(conf); }, processData: L0j, success: function (json) { var J31 = "Er"; U1L.P01(); var S34 = "preSubmit.DTE_U"; var A7n = "rors"; var H7y = 'uploadXhrSuccess'; var n_$ = "ieldErrors"; var t4H = w81; t4H += q$k; var c7G = p$O; c7G += V2n; c7G += r1L; var S6d = d39; S6d += J31; S6d += A7n; var f2s = K$l; f2s += Y1w; var i3i = S34; i3i += O8r; editor[E6I](i3i); editor[n0R](H7y, [conf[f2s], json]); if (json[X6H] && json[S6d][c7G]) { var f0d = c2T; f0d += Z1G; f0d += M12; f0d += M12; var e1j = a6N60.w1W; e1j += n_$; var errors = json[e1j]; for (var i = d4r, ien = errors[A82]; i < ien; i++) { var v1A = J3t; v1A += X9Y; v1A += D4m; var m3R = M_J; m3R += I2w; m3R += s2g; editor[m3R](errors[i][F5b], errors[i][v1A]); } completeCallback[f0d](editor, ids, o76); } else if (json[H1B]) { var f8n = U6D; f8n += T8R; editor[H1B](json[f8n]); completeCallback[T66](editor, ids, o76); } else if (!json[M6E] || !json[M6E][t4H]) { var C68 = V2n; C68 += Z1G; C68 += U6y; C68 += M_J; editor[H1B](conf[C68], generalError); completeCallback[T66](editor, ids, o76); } else { var Y$b = r4y; Y$b += l9J; var h0q = w81; h0q += q$k; var m9o = Y0I; m9o += M_J; m9o += U0f; if (json[m9o]) { $[H1T](json[o7V], function (table, filesIn) { var L6N = k3E; L6N += G8d; U1L.g4A(); if (!Editor[o7V][table]) { var F3e = Y0I; F3e += g3T; Editor[F3e][table] = {}; } $[L6N](Editor[o7V][table], filesIn); }); } ids[d5s](json[M6E][h0q]); if (counter < files[Y$b] - J32) { counter++; reader[A6L](files[counter]); } else { completeCallback[T66](editor, ids); if (submit) { editor[g61](); } } } progressCallback(conf); }, type: m9E, xhr: function () { var C4V = "onprogress"; var B5o = "loa"; var X12 = "ajaxSettings"; var W55 = K51; W55 += c8f; W55 += I2w; var xhr = $[X12][W55](); if (xhr[M6E]) { var t2T = H2u; t2T += y9h; var p6J = u6G; p6J += B5o; p6J += q$k; xhr[p6J][C4V] = function (e) { var f2l = "lengthComputable"; var i7d = "toFixed"; var P9e = "loaded"; var b4E = '%'; var c5p = ':'; if (e[f2l]) { var d76 = z0J; d76 += c8f; var f9B = M12; f9B += M_J; f9B += V2n; f9B += r1L; var R3k = T0c; R3k += w1q; var percent = (e[P9e] / e[R3k] * A_s)[i7d](d4r) + b4E; progressCallback(conf, files[f9B] === J32 ? percent : counter + c5p + files[d76] + v9H + percent); } }; xhr[M6E][t2T] = function () { var y7B = 'Processing'; var k7f = "processingText"; progressCallback(conf, conf[k7f] || y7B); }; } return xhr; } })); }); }; files = $[d2v](files, function (val) { U1L.P01(); return val; }); if (conf[n0T] !== undefined) { var O6k = T30; O6k += r1L; var g84 = z3h; g84 += U6y; g84 += w81; g84 += T1r; files[T$A](conf[g84], files[O6k]); } reader[A6L](files[d4r]); } function factory(root, jq) { var T$S = "jquery"; var h_i = "ocument"; var Y_L = "cument"; var n48 = a6N60.w1W; a6N60.g4A(); n48 += V2n; var w_t = a6N60.w1W; w_t += V2n; var J8N = q$k; J8N += h_i; var is = L0j; if (root && root[J8N]) { var x0M = R9e; x0M += Y_L; window = root; document = root[x0M]; } if (jq && jq[w_t] && jq[n48][T$S]) { $ = jq; is = o76; } return is; } var DataTable$4 = $[w$r][M1b]; var _inlineCounter = d4r; function _actionClass() { var O71 = "creat"; var j5I = "ddCl"; var H9k = "rappe"; var Z9N = e1N; Z9N += w81; Z9N += X9Y; var b1y = O71; b1y += M_J; var K6C = I2w; K6C += k1R; var b_6 = j3w; b_6 += H9k; b_6 += I2w; var B5J = Z1G; B5J += w8B; B5J += m8u; var d8a = c2T; d8a += f$v; d8a += z$F; d8a += U0f; var classesActions = this[d8a][B5J]; var action = this[U0f][X6S]; var wrapper = $(this[K6_][b_6]); wrapper[H4A]([classesActions[K_u], classesActions[T5j], classesActions[K6C]][H_a](v9H)); if (action === b1y) { var k5i = c2T; k5i += m3r; k5i += Z1G; k5i += U$I; var x43 = Z1G; x43 += j5I; x43 += Z1G; x43 += b1F; wrapper[x43](classesActions[k5i]); } else if (action === Z9N) { wrapper[s9J](classesActions[T5j]); } else if (action === w0q) { var M6_ = I2w; M6_ += Z7f; M6_ += k6O; wrapper[s9J](classesActions[M6_]); } } function _ajax(data, success, error, submitParams) { var E2f = "rl"; var U0J = 'json'; var n4V = "deleteBody"; var V5g = "unshif"; var s2l = /{id}/; var w7c = "ara"; var z2J = "mp"; var h4l = "eplacem"; var E7V = "ody"; var i06 = "replacements"; var h$s = "complete"; var E0Y = '?'; var K7a = "eB"; var C5V = /_id_/; var q6V = "POS"; var O5C = "ELE"; var p0z = "TE"; var M$b = "del"; a6N60.g4A(); var I2c = 'idSrc'; var U6h = k8O; U6h += K51; var e8v = M$b; e8v += Z9E; e8v += K7a; e8v += E7V; var h8I = p4h; h8I += O5C; h8I += p0z; var i7U = V3Y; i7U += L9E; var Z8C = q$k; Z8C += Z1G; Z8C += i1c; var J7D = b_v; J7D += Z1G; J7D += v43; var y5l = a6N60.E4C; y5l += E2f; var S4U = I2w; S4U += h4l; S4U += P3y; S4U += j1W; var Y_e = a6N60.w1W; Y_e += l2M; Y_e += l4S; var u_y = q6V; u_y += t7L; var action = this[U0f][X6S]; var thrown; var opts = { complete: [function (xhr, text) { var p4n = "sponseJ"; var j8I = "responseText"; var B2v = 204; var E8F = 'null'; var F9x = "ponseJSON"; a6N60.g4A(); var b0_ = 400; var H5X = "SON"; var json = y8F; if (xhr[D56] === B2v || xhr[j8I] === E8F) { json = {}; } else { try { var X8p = E43; X8p += C7v; X8p += U0f; X8p += M_J; var i_E = m3r; i_E += p4n; i_E += H5X; var v8e = I2w; v8e += g3T; v8e += F9x; json = xhr[v8e] ? xhr[i_E] : JSON[X8p](xhr[j8I]); } catch (e) { } } if ($[N0C](json) || Array[B1R](json)) { success(json, xhr[D56] >= b0_, xhr); } else { error(xhr, text, thrown); } }], data: y8F, dataType: U0J, error: [function (xhr, text, err) { thrown = err; }], success: [], type: u_y }; var a; var ajaxSrc = this[U0f][S15]; var id = action === F3_ || action === w0q ? pluck(this[U0f][N$y], I2c)[H_a](R0I) : y8F; if ($[N0C](ajaxSrc) && ajaxSrc[action]) { ajaxSrc = ajaxSrc[action]; } if (typeof ajaxSrc === Y_e) { ajaxSrc[T66](this, y8F, y8F, data, success, error); return; } else if (typeof ajaxSrc === n1a) { if (ajaxSrc[M0m](v9H) !== -J32) { var q06 = a6N60.E4C; q06 += I2w; q06 += M12; var N5X = X9Y; N5X += a6N60.b_J; N5X += E43; N5X += M_J; a = ajaxSrc[Z11](v9H); opts[N5X] = a[d4r]; opts[q06] = a[J32]; } else { opts[R$3] = ajaxSrc; } } else { var optsCopy = $[f_z]({}, ajaxSrc || ({})); if (optsCopy[h$s]) { var c8k = W25; c8k += z2J; c8k += K4R; var w6C = V5g; w6C += X9Y; opts[h$s][w6C](optsCopy[c8k]); delete optsCopy[h$s]; } if (optsCopy[H1B]) { opts[H1B][I3u](optsCopy[H1B]); delete optsCopy[H1B]; } opts = $[f_z]({}, opts, optsCopy); } if (opts[S4U]) { var g4B = M_J; g4B += G13; g4B += c8f; $[g4B](opts[i06], function (key, repl) { var X6m = '}'; var C8J = '{'; a6N60.P01(); opts[R$3] = opts[R$3][k2r](C8J + key + X6m, repl[T66](this, key, id, action, data)); }); } opts[y5l] = opts[R$3][J7D](C5V, id)[k2r](s2l, id); if (opts[Z6V]) { var Y2c = b4W; Y2c += Z1G; var d4w = q$k; d4w += Z1G; d4w += i1c; var isFn = typeof opts[d4w] === a6N60[280451]; var newData = isFn ? opts[Y2c](data) : opts[Z6V]; data = isFn && newData ? newData : $[f_z](o76, data, newData); } opts[Z8C] = data; if (opts[i7U] === h8I && (opts[e8v] === undefined || opts[n4V] === o76)) { var k5z = b4W; k5z += Z1G; var v0N = a6N60.E4C; v0N += I2w; v0N += M12; var Y8S = E43; Y8S += w7c; Y8S += U6y; var params = $[Y8S](opts[Z6V]); opts[R$3] += opts[v0N][M0m](E0Y) === -J32 ? E0Y + params : q$$ + params; delete opts[k5z]; } $[U6h](opts); } function _animate(target, style, time, callback) { a6N60.P01(); var i07 = "nima"; var d7$ = Z1G; d7$ += i07; d7$ += X9Y; d7$ += M_J; if ($[a6N60.j_z][d7$]) { var d8b = U0f; d8b += X9Y; d8b += m2M; target[d8b]()[s6E](style, time, callback); } else { var q3$ = U5W; q3$ += I6b; var J7b = M12; J7b += R2S; var Z5A = M12; Z5A += R2S; target[x35](style); var scope = target[Z5A] && target[J7b] > J32 ? target[d4r] : target; if (typeof time === q3$) { time[T66](scope); } else if (callback) { callback[T66](scope); } } } function _assembleMain() { var F$L = "bodyContent"; var L6Y = "foo"; var N_9 = "ormInfo"; var a8p = a6N60.w1W; a8p += a6N60[204096]; a8p += r9V; var I0c = a6N60.w1W; I0c += N_9; var V55 = O0I; V55 += E43; V55 += M_J; V55 += Y2t; var x4u = L6Y; x4u += P9v; a6N60.g4A(); var P1Q = N7N; P1Q += I2w; var j9v = q$k; j9v += a6N60[204096]; j9v += U6y; var dom = this[j9v]; $(dom[P1Q])[L1v](dom[Q6x]); $(dom[x4u])[V55](dom[X84])[w2$](dom[u8E]); $(dom[F$L])[w2$](dom[I0c])[w2$](dom[a8p]); } function _blur() { var C2j = "_c"; var r7k = "fu"; var p_c = 'preBlur'; var C79 = A41; C79 += M0B; C79 += w81; C79 += X9Y; var n8i = r7k; n8i += V2n; n8i += U75; n8i += Z3I; var q5A = B6$; q5A += R0n; q5A += P3y; q5A += X9Y; var U0v = p$p; U0v += d9i; U0v += I6V; var opts = this[U0f][j4C]; var onBlur = opts[U0v]; if (this[q5A](p_c) === L0j) { return; } if (typeof onBlur === n8i) { onBlur(this); } else if (onBlur === C79) { this[g61](); } else if (onBlur === q0t) { var S7w = C2j; S7w += H9d; S7w += C$2; this[S7w](); } } function _clearDynamicInfo(errorsOnly) { var m_R = "wra"; var H2$ = "remo"; var w8u = "pper"; var e$y = 'div.'; var Q6j = "Focus"; a6N60.P01(); var c$o = "eBottom"; var m4q = g8e; m4q += U83; m4q += M12; m4q += c$o; var M$5 = N9h; M$5 += Q6j; var s3Y = H2$; s3Y += p2N; var Q83 = m_R; Q83 += w8u; var V$W = M_J; V$W += N9U; V$W += T8R; var m5O = S$Q; m5O += Z1G; m5O += b1F; m5O += g3T; if (errorsOnly === void d4r) { errorsOnly = L0j; } if (!this[U0f]) { return; } var errorClass = this[m5O][d39][V$W]; var fields = this[U0f][E9S]; $(e$y + errorClass, this[K6_][Q83])[s3Y](errorClass); $[H1T](fields, function (name, field) { field[H1B](q2P); a6N60.g4A(); if (!errorsOnly) { var y29 = Y1w; y29 += b1F; y29 += Z1G; y29 += R6J; field[y29](q2P); } }); this[H1B](q2P); if (!errorsOnly) { var P54 = Y1w; P54 += U0f; P54 += U0f; P54 += D6S; this[P54](q2P); } this[U0f][M$5] = y8F; this[U0f][m4q] = L0j; } function _close(submitComplete, mode) { var I8R = "focus."; var z7E = "editor-focus"; var m7a = "closeCb"; var c9A = "preC"; var c5W = c2T; c5W += M12; c5W += f27; c5W += M_J; var h2I = B6$; h2I += k6O; h2I += t4m; var j9$ = F$j; j9$ += t1_; var w37 = I8R; w37 += z7E; var I3M = C$M; I3M += N_Z; var H7O = c2T; H7O += I_X; H7O += z6F; var m1x = c9A; m1x += H9d; m1x += U0f; m1x += M_J; var K94 = B6$; K94 += Z0K; K94 += X9Y; var closed; if (this[K94](m1x) === L0j) { return; } if (this[U0f][H7O]) { var D3l = c2T; D3l += I_X; D3l += j2q; D3l += a6N60[83715]; closed = this[U0f][D3l](submitComplete, mode); this[U0f][m7a] = y8F; } if (this[U0f][I3M]) { var M3_ = Z4I; M3_ += Y$D; M3_ += c2T; M3_ += a6N60[83715]; this[U0f][M3_](); this[U0f][m5e] = y8F; } $(l0a)[E6I](w37); this[U0f][j9$] = L0j; this[h2I](c5W); if (closed) { this[n0R](U53, [closed]); } } function _closeReg(fn) { var A$J = c2T; A$J += M12; a6N60.P01(); A$J += v5Z; A$J += z6F; this[U0f][A$J] = fn; } function _crudArgs(arg1, arg2, arg3, arg4) { var m4o = "lainObject"; a6N60.g4A(); var U_8 = "itle"; var I_1 = U6y; I_1 += Z1G; I_1 += w81; I_1 += V2n; var v26 = E1g; v26 += l9b; v26 += m4o; var that = this; var title; var buttons; var show; var opts; if ($[v26](arg1)) { opts = arg1; } else if (typeof arg1 === y3N) { show = arg1; opts = arg2; } else { title = arg1; buttons = arg2; show = arg3; opts = arg4; } if (show === undefined) { show = o76; } if (title) { var K1j = X9Y; K1j += U_8; that[K1j](title); } if (buttons) { var t0H = g8e; t0H += X9Y; t0H += C2Q; that[t0H](buttons); } return { maybeOpen: function () { if (show) { that[T41](); } }, opts: $[f_z]({}, this[U0f][R4e][I_1], opts) }; } function _dataSource(name) { var i0i = "tml"; var W60 = "Ta"; var j8l = c8f; j8l += i0i; var E9b = Z6V; E9b += W60; E9b += Q4a; E9b += M_J; var Z3r = X9Y; Z3r += b3y; var args = []; for (var _i = J32; _i < arguments[A82]; _i++) { args[_i - J32] = arguments[_i]; } var dataSource = this[U0f][Z3r] ? Editor[D6z][E9b] : Editor[D6z][j8l]; var fn = dataSource[name]; if (fn) { return fn[h6$](this, args); } } function _displayReorder(includeFields) { var k8K = "formConte"; var z8r = 'displayOrder'; var O09 = "hild"; var T0u = "include"; var T3X = "displ"; var x2H = Z1G; x2H += c2T; x2H += X9Y; x2H += Z3I; var V7d = T3X; V7d += R8I; var j9K = R4N; j9K += M_J; j9K += w7$; var a_b = M_J; a_b += Z1G; a_b += c2T; a_b += c8f; var w0Z = c2T; w0Z += O09; w0Z += I2w; w0Z += P3y; var H8T = U6y; H8T += Z1G; H8T += w81; H8T += V2n; var Z6x = l04; Z6x += M_J; Z6x += M12; Z6x += Y4p; var w0v = k8K; w0v += V2n; w0v += X9Y; var _this = this; var formContent = $(this[K6_][w0v]); var fields = this[U0f][Z6x]; var order = this[U0f][C_E]; var template = this[U0f][j4a]; var mode = this[U0f][p01] || H8T; if (includeFields) { var R2M = T0u; R2M += k18; this[U0f][R2M] = includeFields; } else { var O_O = n6n; O_O += n8y; includeFields = this[U0f][O_O]; } formContent[w0Z]()[y22](); $[a_b](order, function (i, name) { var N7U = "after"; var a62 = "InArray"; var q6R = 'editor-field[name="'; var p2s = "data-editor-"; var u4B = "["; var w21 = "template=\""; var n0z = "ak"; var N8r = "_we"; var d7P = N8r; d7P += n0z; a6N60.g4A(); d7P += a62; if (_this[d7P](name, includeFields) !== -J32) { if (template && mode === q9n) { var N_s = V2n; N_s += a6N60[204096]; N_s += q$k; N_s += M_J; var Y4x = K9v; Y4x += o5s; var r6E = u4B; r6E += p2s; r6E += w21; var v5S = a6N60.w1W; v5S += w81; v5S += Y2t; var K9f = K9v; K9f += o5s; var G22 = a6N60.w1W; G22 += w81; G22 += V2n; G22 += q$k; template[G22](q6R + name + K9f)[N7U](fields[name][H$p]()); template[v5S](r6E + name + Y4x)[w2$](fields[name][N_s]()); } else { var N77 = e3_; N77 += M_J; formContent[w2$](fields[name][N77]()); } } }); if (template && mode === q9n) { template[K8Q](formContent); } this[j9K](z8r, [this[U0f][V7d], this[U0f][x2H], formContent]); } function _edit(items, editFields, type, formOptions, setupDone) { var M2l = "editData"; var W4_ = "_displayR"; var v4m = "toString"; var s4O = 'initEdit'; var W3B = "_acti"; var K$9 = "itFie"; var C$j = "inAr"; var t02 = 'node'; var v7P = q$k; v7P += E_W; var M2X = W4_; M2X += R8G; M2X += B86; M2X += a6N60.V56; var u4u = p$O; u4u += V2n; u4u += K3b; u4u += l9J; var z$$ = M_J; z$$ += Z1G; z$$ += c2T; z$$ += c8f; var K7h = W3B; K7h += a6N60[204096]; K7h += V2n; K7h += A$Y; var j1w = U6y; j1w += d4x; var I$N = Q4a; I$N += a6N60[204096]; I$N += c2T; I$N += o8e; var p0T = q$k; p0T += E1g; p0T += E43; p0T += y$w; var u0y = M_J; u0y += q$k; u0y += w81; u0y += X9Y; var H$2 = s1q; H$2 += Q4Q; H$2 += I2w; var F1N = e1N; F1N += K$9; F1N += f3s; F1N += U0f; var V1t = a6N60.w1W; V1t += h4O; V1t += U0f; var _this = this; var fields = this[U0f][V1t]; var usedFields = []; var includeInOrder; var editData = {}; this[U0f][F1N] = editFields; this[U0f][M2l] = editData; this[U0f][H$2] = items; this[U0f][X6S] = u0y; this[K6_][E05][x9h][p0T] = I$N; this[U0f][j1w] = type; this[K7h](); $[z$$](fields, function (name, field) { var u8r = "tiIds"; var F2r = o8K; F2r += M12; F2r += u8r; a6N60.P01(); field[v3v](); includeInOrder = L0j; editData[name] = {}; $[H1T](editFields, function (idSrc, edit) { var W5z = "scope"; var g0p = "tiS"; var f7x = "romData"; var r5m = "rray"; var t_F = a6N60.w1W; t_F += A9P; t_F += q$k; t_F += U0f; if (edit[t_F][name]) { var a1U = E1g; a1U += B9S; a1U += r5m; var T45 = N_w; T45 += f7x; var val = field[T45](edit[Z6V]); var nullDefault = field[z3m](); editData[name][idSrc] = val === y8F ? q2P : Array[a1U](val) ? val[f88]() : val; if (!formOptions || formOptions[W5z] === e3k) { var s4B = q$k; s4B += M_J; s4B += a6N60.w1W; field[S3F](idSrc, val === undefined || nullDefault && val === y8F ? field[s4B]() : val, L0j); if (!edit[u2r] || edit[u2r][name]) { includeInOrder = o76; } } else { if (!edit[u2r] || edit[u2r][name]) { var R4Q = o8K; R4Q += M12; R4Q += g0p; R4Q += Z9E; field[R4Q](idSrc, val === undefined || nullDefault && val === y8F ? field[t1Y]() : val, L0j); includeInOrder = o76; } } } }); field[x$5](); if (field[F2r]()[A82] !== d4r && includeInOrder) { var d_Y = E43; d_Y += a6N60.E4C; d_Y += U0f; d_Y += c8f; usedFields[d_Y](name); } }); var currOrder = this[C_E]()[f88](); for (var i = currOrder[u4u] - J32; i >= d4r; i--) { var D2x = C$j; D2x += D$i; D2x += a6N60.b_J; if ($[D2x](currOrder[i][v4m](), usedFields) === -J32) { currOrder[T$A](i, J32); } } this[M2X](currOrder); this[n0R](s4O, [pluck(editFields, t02)[d4r], pluck(editFields, v7P)[d4r], items, type], function () { var G0r = 'initMultiEdit'; a6N60.P01(); var S6o = B6$; S6o += w7$; _this[S6o](G0r, [editFields, items, type], function () { setupDone(); }); }); } function _event(trigger, args, promiseComplete) { var O9S = "trigg"; var k3_ = "ject"; var R6q = "ndler"; var m9m = 'Cancelled'; var F6o = "Event"; var W3V = "gerHa"; var u9I = "erHand"; var B7M = "esul"; var E7w = "ler"; var L6w = "dexO"; a6N60.g4A(); var X3T = "Eve"; if (args === void d4r) { args = []; } if (promiseComplete === void d4r) { promiseComplete = undefined; } if (Array[B1R](trigger)) { for (var i = d4r, ien = trigger[A82]; i < ien; i++) { var y2R = R4N; y2R += M_J; y2R += Z0K; y2R += X9Y; this[y2R](trigger[i], args); } } else { var v4a = E43; v4a += I2w; v4a += M_J; var F00 = w81; F00 += V2n; F00 += L6w; F00 += a6N60.w1W; var t6_ = I2w; t6_ += B7M; t6_ += X9Y; var W5L = Q9g; W5L += W3V; W5L += R6q; var M0Q = X3T; M0Q += t4m; var e = $[M0Q](trigger); $(this)[W5L](e, args); var result = e[t6_]; if (trigger[F00](v4a) === d4r && result === L0j) { var o77 = O9S; o77 += u9I; o77 += E7w; $(this)[o77]($[F6o](trigger + m9m), args); } if (promiseComplete) { var w4d = a6N60[204096]; w4d += a6N60[83715]; w4d += k3_; if (result && typeof result === w4d && result[Z7h]) { result[Z7h](promiseComplete); } else { promiseComplete(result); } } return result; } } function _eventName(input) { var t0r = "toLowerCase"; var R2D = "string"; var S7E = 3; var p99 = /^on([A-Z])/; var V0E = "match"; var T3h = a6N60[406894]; T3h += P6B; var name; var names = input[Z11](v9H); for (var i = d4r, ien = names[A82]; i < ien; i++) { name = names[i]; var onStyle = name[V0E](p99); if (onStyle) { var n5a = U0f; n5a += b0Y; n5a += R2D; name = onStyle[J32][t0r]() + name[n5a](S7E); } names[i] = name; } return names[T3h](v9H); } function _fieldFromNode(node) { var X$Z = M_J; X$Z += Z1G; X$Z += c2T; a6N60.g4A(); X$Z += c8f; var foundField = y8F; $[X$Z](this[U0f][E9S], function (name, field) { var W8h = r4y; W8h += l9J; if ($(field[H$p]())[J2D](node)[W8h]) { foundField = field; } }); return foundField; } function _fieldNames(fieldNames) { if (fieldNames === undefined) { var j$j = l04; j$j += T8k; return this[j$j](); } else if (!Array[B1R](fieldNames)) { return [fieldNames]; } return fieldNames; } function _focus(fieldsIn, focus) { var n_i = 'div.DTE '; var i29 = "activeEleme"; var f3K = /^jq:/; var N1_ = 'jq:'; var k2o = "ber"; var E8K = V2n; E8K += a6N60.E4C; E8K += U6y; E8K += k2o; var R5I = U6y; R5I += Z1G; R5I += E43; var F4s = G_P; F4s += P3F; F4s += V2n; var _this = this; if (this[U0f][F4s] === w0q) { return; } var field; var fields = $[R5I](fieldsIn, function (fieldOrName) { var f_b = a6N60.w1W; a6N60.P01(); f_b += h4O; f_b += U0f; return typeof fieldOrName === n1a ? _this[U0f][f_b][fieldOrName] : fieldOrName; }); if (typeof focus === E8K) { field = fields[focus]; } else if (focus) { if (focus[M0m](N1_) === d4r) { field = $(n_i + focus[k2r](f3K, q2P)); } else { var Y1R = a6N60.w1W; Y1R += w81; Y1R += M_J; Y1R += j8j; field = this[U0f][Y1R][focus]; } } else { var x9s = a6N60[83715]; x9s += q_0; x9s += I2w; var O5q = i29; O5q += t4m; document[O5q][x9s](); } this[U0f][h$1] = field; if (field) { field[T0s](); } } function _formOptions(opts) { var s3E = "yup"; var C0a = "dteInline"; var p9c = "tCo"; var B9d = "eydown"; var x$R = "canReturnSubmit"; var J_8 = "but"; var O9h = "tri"; var z8q = "Ic"; var D7h = "unt"; var O2l = Z4I; O2l += M_J; O2l += z8q; O2l += a6N60[83715]; var G7w = v5N; G7w += s3E; var u92 = a6N60[204096]; u92 += V2n; var z9$ = o8e; z9$ += B9d; var q7r = J_8; q7r += X9Y; q7r += m8u; var p8J = d3p; p8J += U0f; p8J += Z1G; p8J += R6J; var J$o = j2N; J$o += w81; J$o += V2n; J$o += K3b; var O_o = X9Y; O_o += w81; O_o += H5c; O_o += M_J; var T9a = U0f; T9a += O9h; T9a += k$f; var m52 = M_J; m52 += H2l; m52 += p9c; m52 += D7h; var W6k = a$3; W6k += C0a; var _this = this; var that = this; var inlineCount = _inlineCounter++; var namespace = W6k + inlineCount; this[U0f][j4C] = opts; this[U0f][m52] = inlineCount; if (typeof opts[S1h] === T9a || typeof opts[O_o] === a6N60[280451]) { this[S1h](opts[S1h]); opts[S1h] = o76; } if (typeof opts[d1n] === J$o || typeof opts[p8J] === a6N60[280451]) { var T4$ = q11; T4$ += Z1G; T4$ += K3b; T4$ += M_J; var M91 = d3p; M91 += U0f; M91 += Z1G; M91 += R6J; this[d1n](opts[M91]); opts[T4$] = o76; } if (typeof opts[q7r] !== y3N) { this[u8E](opts[u8E]); opts[u8E] = o76; } $(document)[p$p](z9$ + namespace, function (e) { var y5A = "ctiveElement"; var T7P = "dFro"; var L72 = "Def"; var a6c = "canReturn"; var H8h = "Submit"; var D7e = "prevent"; var J7d = "mN"; var x7n = "_fiel"; var k6m = H2l; k6m += b15; k6m += o_F; k6m += e1N; if (e[x4e] === F0h && _this[U0f][k6m]) { var P4f = Z1G; P4f += y5A; var el = $(document[P4f]); if (el) { var r19 = a6c; r19 += H8h; var M5$ = x7n; M5$ += T7P; M5$ += J7d; M5$ += d4x; var field = _this[M5$](el); if (field && typeof field[x$R] === a6N60[280451] && field[r19](el)) { var t7N = D7e; t7N += L72; t7N += n6r; e[t7N](); } } } }); $(document)[u92](G7w + namespace, function (e) { var r7b = "fault"; var V_L = "onReturn"; var s09 = "Es"; var g4F = "wh"; var R5N = 37; var t6I = "Re"; var a3a = 27; var V9O = "E_F"; var I9y = "foc"; var V_Z = "orm_Buttons"; var u1Y = 39; var P3r = "preventDe"; var z40 = "turn"; var A$0 = "onE"; var B5i = ".DT"; var E_d = "entDefault"; var X_f = "Esc"; var P5Z = "ger"; var C5Y = T30; C5Y += r1L; var N5F = B5i; N5F += V9O; N5F += V_Z; var w2t = j3w; w2t += G4q; w2t += c2T; w2t += c8f; var el = $(document[E1Y]); if (e[x4e] === F0h && _this[U0f][l4t]) { var T_K = U5W; T_K += b7n; T_K += V2n; var field = _this[a7x](el); if (field && typeof field[x$R] === T_K && field[x$R](el)) { if (opts[V_L] === h2d) { e[g86](); _this[g61](); } else if (typeof opts[V_L] === a6N60[280451]) { var E0s = p$p; E0s += t6I; E0s += z40; var d59 = n7$; d59 += R0n; d59 += E_d; e[d59](); opts[E0s](_this, e); } } } else if (e[w2t] === a3a) { var a_z = U0f; a_z += I6z; var U82 = A$0; U82 += x7x; var Z38 = S$Q; Z38 += v5Z; var S2Q = a6N60[204096]; S2Q += V2n; S2Q += q5c; S2Q += x7x; var z15 = a6N60[83715]; z15 += M12; z15 += a6N60.E4C; z15 += I2w; var K4s = p$p; K4s += q5c; K4s += x7x; var G2c = p$p; G2c += s09; G2c += c2T; var d9a = P3r; d9a += r7b; e[d9a](); if (typeof opts[G2c] === a6N60[280451]) { var T3Q = p$p; T3Q += X_f; opts[T3Q](that, e); } else if (opts[K4s] === z15) { var k7r = a6N60[83715]; k7r += M12; k7r += L8T; that[k7r](); } else if (opts[S2Q] === Z38) { that[C$M](); } else if (opts[U82] === a_z) { var r2a = A41; r2a += M0B; r2a += w81; r2a += X9Y; that[r2a](); } } else if (el[z4S](N5F)[C5Y]) { var n_V = g4F; n_V += w81; n_V += c2T; n_V += c8f; var o5A = g4F; o5A += w81; o5A += c2T; o5A += c8f; if (e[o5A] === R5N) { var p3f = Q9g; p3f += P5Z; var Z9e = J_8; Z9e += X9Y; Z9e += p$p; var x7M = E43; x7M += I2w; x7M += M_J; x7M += R0n; el[x7M](Z9e)[p3f](B69); } else if (e[n_V] === u1Y) { var I_v = I9y; I_v += a6N60.E4C; I_v += U0f; var X5K = O9h; X5K += h0m; var p5l = U4W; p5l += K51; p5l += X9Y; el[p5l](R6C)[X5K](I_v); } } }); this[U0f][O2l] = function () { var i9F = "key"; var r7p = i9F; r7p += u6G; var b1C = i9F; b1C += q$k; b1C += c6h; b1C += V2n; var E74 = a6N60[204096]; E74 += a6N60.w1W; E74 += a6N60.w1W; $(document)[E74](b1C + namespace); $(document)[E6I](r7p + namespace); }; return namespace; } function _inline(editFields, opts, closeCb) { var j1V = "e/"; var r59 = '<div class="DTE_Processing_Indicator"><span></span></div>'; var w2C = "ormOptions"; var F86 = "nputTr"; var q9s = "exOf"; var w$2 = "iv."; var a4e = "_inputTrigger"; var u2A = 'style="width:'; var u_5 = "tto"; var o3r = "div class=\""; var l6$ = "Edg"; var H75 = "etach"; var W$a = "mEr"; var C3h = "_focu"; var n4X = "ace"; var Q$J = "attachFi"; var R8$ = '.'; var t2E = "igg"; var C9o = "line"; var j_Z = "losest"; var U6o = 'px"'; var t_$ = "_postope"; var y2C = "userAgent"; var d0D = t_$; d0D += V2n; var Z9c = U6y; Z9c += Z1G; Z9c += E43; var h6d = C3h; h6d += U0f; var u6l = c2T; u6l += F3I; u6l += v43; u6l += M12; var Q5t = q6D; Q5t += F86; Q5t += t2E; Q5t += a6N60.V56; var m9z = U0f; m9z += a6N60.E4C; m9z += n2u; var M0A = w81; M0A += V2n; M0A += C9o; var I70 = w4f; I70 += L9E; I70 += V2n; var S5o = Q4p; S5o += w2C; var R7b = z0J; R7b += c8f; var J5e = o8e; J5e += M_J; J5e += a6N60.b_J; J5e += U0f; a6N60.P01(); var j_P = b08; j_P += i8S; j_P += M_J; var _this = this; if (closeCb === void d4r) { closeCb = y8F; } var closed = L0j; var classes = this[v68][j_P]; var keys = Object[J5e](editFields); var editRow = editFields[keys[d4r]]; var lastAttachPoint; var elements = []; for (var i = d4r; i < editRow[F$S][R7b]; i++) { var v5O = Q1N; v5O += i1c; v5O += c2T; v5O += c8f; var p8k = E43; p8k += a6N60.E4C; p8k += x4d; var Z2O = Q$J; Z2O += T8k; var name_1 = editRow[Z2O][i][d4r]; elements[p8k]({ field: this[U0f][E9S][name_1], name: name_1, node: $(editRow[v5O][i]) }); } var namespace = this[S5o](opts); var ret = this[I70](M0A); if (!ret) { return this; } for (var _i = d4r, elements_1 = elements; _i < elements_1[A82]; _i++) { var N7M = c2T; N7M += j_Z; var q7s = V2n; q7s += d4x; var X2C = a6N60.w1W; X2C += T8R; X2C += W$a; X2C += s2g; var J7A = F6h; J7A += y6e; var B41 = Z1G; B41 += Q9T; B41 += P3y; B41 += q$k; var F2e = M12; F2e += i8S; F2e += a6N60.V56; var P3o = H2l; P3o += B4H; var B9O = a6N60.w1W; B9O += i8S; B9O += q$k; var k9G = y9M; k9G += g97; var Z$F = B9f; Z$F += o3r; var F5N = T8z; F5N += H2l; F5N += k94; var a4p = K9v; a4p += S_v; var k1X = M12; k1X += w81; k1X += V2n; k1X += a6N60.V56; var v0$ = K9v; v0$ += O1E; var O7y = O0I; O7y += E43; O7y += M_J; O7y += Y2t; var e8x = l6$; e8x += j1V; var R7I = i8S; R7I += q$k; R7I += q9s; var l06 = q$k; l06 += H75; var u0n = i2D; u0n += U$I; u0n += o8F; var L1N = e3_; L1N += M_J; var el = elements_1[_i]; var node = el[L1N]; el[Z1j] = node[u0n]()[l06](); var style = navigator[y2C][R7I](e8x) !== -J32 ? u2A + node[t0h]() + U6o : q2P; node[O7y]($(F$O + classes[t8J] + v0$ + F$O + classes[k1X] + a4p + style + c9y + r59 + F5N + Z$F + classes[u8E] + a1R + k9G)); node[B9O](P3o + classes[F2e][k2r](/ /g, R8$))[B41](el[d39][J7A]())[w2$](this[K6_][X2C]); var insertParent = $(el[d39][q7s]())[N7M](u9P); if (insertParent[A82]) { lastAttachPoint = insertParent; } if (opts[u8E]) { var y3E = b_v; y3E += n4X; var l_3 = a6N60[83715]; l_3 += a6N60.E4C; l_3 += u_5; l_3 += C1C; var l7_ = q$k; l7_ += w$2; var R4X = a6N60.w1W; R4X += w81; R4X += V2n; R4X += q$k; node[R4X](l7_ + classes[l_3][y3E](/ /g, R8$))[w2$](this[K6_][u8E]); } } var submitClose = this[a4e](m9z, opts, lastAttachPoint); var cancelClose = this[Q5t](u6l, opts, lastAttachPoint); this[C6d](function (submitComplete, action) { var d$9 = "rEach"; var S0s = c2T; S0s += B9m; S0s += Q3u; closed = o76; $(document)[E6I](S0s + namespace); if (!submitComplete || action !== F3_) { var r0O = r9R; r0O += d$9; elements[r0O](function (el) { var G1C = "contents"; var Q9V = F6h; Q9V += y6e; var E66 = y6e; E66 += X9Y; E66 += Z1G; E66 += x3e; el[H$p][G1C]()[E66](); el[Q9V][w2$](el[Z1j]); }); } submitClose(); cancelClose(); _this[q9r](); if (closeCb) { closeCb(); } return X83; }); setTimeout(function () { var l3c = "addBack"; var N6m = 'andSelf'; var y$6 = "usedown"; var d3o = t5A; d3o += y$6; var y9J = a6N60[204096]; y9J += V2n; if (closed) { return; } var back = $[a6N60.j_z][l3c] ? E68 : N6m; var target; $(document)[y9J](d3o + namespace, function (e) { var q4F = X9Y; q4F += C7v; q4F += l1t; a6N60.g4A(); target = e[q4F]; })[p$p](K6M + namespace, function (e) { var K7b = "targe"; var p$A = K7b; p$A += X9Y; target = e[p$A]; })[p$p](U1c + namespace, function (e) { var m9H = p$O; m9H += k$f; m9H += X9Y; m9H += c8f; var isIn = L0j; for (var _i = d4r, elements_2 = elements; _i < elements_2[m9H]; _i++) { var n6S = V2n; n6S += a6N60[204096]; n6S += q$k; n6S += M_J; var D$5 = a6N60[204096]; D$5 += j3w; D$5 += C1C; var y2g = v6A; y2g += a6N60.b_J; y2g += E43; y2g += z5T; var r9r = l04; r9r += S3z; r9r += q$k; var el = elements_2[_i]; if (el[r9r][y2g](D$5, target) || $[J5n](el[n6S][d4r], $(target)[z4S]()[back]()) !== -J32) { isIn = o76; } } if (!isIn) { var C19 = a6N60[83715]; C19 += q_0; C19 += I2w; _this[C19](); } }); }, d4r); this[h6d]($[Z9c](elements, function (el) { a6N60.P01(); var j8O = a6N60.w1W; j8O += h4O; return el[j8O]; }), opts[T0s]); this[d0D](X83, o76); } function _inputTrigger(type, opts, insertPoint) { var h9h = "ren"; var Z2s = 'click.dte-'; var W76 = "Tr"; var K8L = 'Html'; var i$$ = "childNo"; var s13 = a6N60[204096]; s13 += V2n; var I6U = i$$; I6U += N9a; var J4B = Z3H; J4B += M12; J4B += M12; var A3n = U0f; A3n += k8e; var i9J = a0_; i9J += j4T; i9J += L9E; var d56 = S$Q; d56 += a6N60[204096]; d56 += C$2; d56 += Y9I; var N8M = W76; N8M += w81; N8M += h0m; var _this = this; var trigger = opts[type + N8M]; var html = opts[type + K8L]; var event = Z2s + type; var tr = $(insertPoint)[d56](u9P); if (trigger === undefined) { return function () { }; } if (typeof trigger === t4Q) { var c_X = x3e; c_X += X9T; c_X += h9h; var kids = tr[c_X](); trigger = trigger < d4r ? kids[kids[A82] + trigger] : kids[trigger]; } var children = $(trigger, tr)[A82] ? Array[i9J][A3n][J4B]($(trigger, tr)[d4r][I6U]) : []; $(children)[y22](); var triggerEl = $(trigger, tr)[s13](event, function (e) { var Y98 = "Immediate"; var w5G = "Propagation"; var Z5i = Q3l; Z5i += c2T; Z5i += S3z; var g0G = q6K; g0G += Y98; g0G += w5G; e[g0G](); if (type === Z5i) { _this[C$M](); } else { _this[g61](); } })[w2$](html); return function () { a6N60.g4A(); var E_6 = a6N60[204096]; E_6 += a6N60.w1W; E_6 += a6N60.w1W; triggerEl[E_6](event)[s$q]()[w2$](children); }; } function _optionsUpdate(json) { var l9B = "opti"; var i1j = l9B; i1j += a6N60[204096]; i1j += C1C; var that = this; if (json && json[i1j]) { var o19 = a6N60.w1W; o19 += w81; o19 += S3z; o19 += Y4p; var Q3A = M_J; Q3A += Z1G; Q3A += c2T; Q3A += c8f; $[Q3A](this[U0f][o19], function (name, field) { var e2c = "upd"; a6N60.g4A(); if (json[l3z][name] !== undefined) { var h0e = a6N60.E4C; h0e += E43; h0e += q$k; h0e += x_i; var v7w = Z1G; v7w += a6N60[406894]; v7w += Z1G; v7w += K51; var T9l = q$k; T9l += X9Y; var k2p = q$k; k2p += X9Y; var fieldInst = that[d39](name); if (fieldInst[k2p] && fieldInst[T9l]()[v7w][R$3]()) { return; } if (fieldInst && fieldInst[h0e]) { var h$J = e2c; h$J += x_i; fieldInst[h$J](json[l3z][name]); } } }); } } function _message(el, msg, title, fn) { var s9U = "removeAttr"; var C6Z = "played"; var g1w = "adeO"; var j28 = U5W; j28 += I6b; var canAnimate = $[a6N60.j_z][s6E] ? o76 : L0j; if (title === undefined) { title = L0j; } if (!fn) { fn = function () { }; } if (typeof msg === j28) { msg = msg(this, new DataTable$4[c8Q](this[U0f][z5g])); } el = $(el); if (canAnimate) { var e5U = Y9I; e5U += m2M; el[e5U](); } if (!msg) { if (this[U0f][l4t] && canAnimate) { var M3W = a6N60.w1W; M3W += g1w; M3W += a6N60.E4C; M3W += X9Y; el[M3W](function () { var R8p = c8f; R8p += X9Y; a6N60.g4A(); R8p += U6y; R8p += M12; el[R8p](q2P); fn(); }); } else { var V8h = V2n; V8h += a6N60[204096]; V8h += V2n; V8h += M_J; var U2L = M_g; U2L += y$w; el[A$1](q2P)[x35](U2L, V8h); fn(); } if (title) { el[s9U](l5k); } } else { var U5o = q$k; U5o += E1g; U5o += C6Z; fn(); if (this[U0f][U5o] && canAnimate) { var q9I = C1X; q9I += q$k; q9I += Y$D; q9I += V2n; var U8n = c8f; U8n += X9Y; U8n += U6y; U8n += M12; el[U8n](msg)[q9I](); } else { var a$d = P$W; a$d += c2T; a$d += o8e; var P5L = c2T; P5L += U0f; P5L += U0f; var S5u = c8f; S5u += X9Y; S5u += U6y; S5u += M12; el[S5u](msg)[P5L](A6m, a$d); } if (title) { var p5I = Z1G; p5I += F59; p5I += I2w; el[p5I](l5k, msg); } } } function _multiInfo() { var n6V = "sMul"; var S19 = "tiVal"; a6N60.g4A(); var H2J = "InfoShown"; var D_E = n6n; D_E += n8y; var L4E = x1v; L4E += Y4p; var fields = this[U0f][L4E]; var include = this[U0f][D_E]; var show = o76; var state; if (!include) { return; } for (var i = d4r, ien = include[A82]; i < ien; i++) { var a$Y = P35; a$Y += H2J; var H4G = w81; H4G += n6V; H4G += S19; H4G += E_A; var field = fields[include[i]]; var multiEditable = field[Y5S](); if (field[c6E]() && multiEditable && show) { state = o76; show = L0j; } else if (field[H4G]() && !multiEditable) { state = o76; } else { state = L0j; } fields[include[i]][a$Y](state); } } function _nestedClose(cb) { var b$7 = "callback"; var K28 = "playCon"; var O8j = "troller"; var S$R = B8P; S$R += K28; S$R += O8j; var disCtrl = this[U0f][S$R]; var show = disCtrl[i34]; if (!show || !show[A82]) { if (cb) { cb(); } } else if (show[A82] > J32) { var F7Z = q$k; F7Z += U$I; var F8k = a6N60[204096]; F8k += L8N; var V$Z = E43; V$Z += a6N60[204096]; V$Z += E43; show[V$Z](); var last = show[show[A82] - J32]; if (cb) { cb(); } this[U0f][i4h][F8k](last[F7Z], last[w2$], last[b$7]); } else { this[U0f][i4h][C$M](this, cb); show[A82] = d4r; } } function _nestedOpen(cb, nest) { var C0N = "how"; var w0Q = q$k; w0Q += a6N60[204096]; w0Q += U6y; var E1_ = a6N60[204096]; E1_ += E43; E1_ += P3y; var S2a = q$k; S2a += a6N60[204096]; S2a += U6y; var disCtrl = this[U0f][i4h]; if (!disCtrl[i34]) { disCtrl[i34] = []; } if (!nest) { var H_H = M12; H_H += P3y; H_H += a1c; H_H += c8f; var x68 = R4N; x68 += U0f; x68 += C0N; disCtrl[x68][H_H] = d4r; } disCtrl[i34][d5s]({ append: this[S2a][t8J], callback: cb, dte: this }); this[U0f][i4h][E1_](this, this[w0Q][t8J], cb); } function _postopen(type, immediate) { var Z8$ = "submit.edi"; var B0B = 'focus.editor-focus'; var j1l = "cap"; var W5l = "bod"; var Y82 = "submit.editor-int"; var j5J = "tureFocus"; var P9x = "layContr"; var K5V = "nal"; var L7f = "tor-inter"; var q2k = Z1G; q2k += l4S; var x1u = a6N60[83715]; x1u += b0Y; x1u += a6N60[83715]; x1u += p$O; var v1x = Y82; v1x += S1P; var A8T = a6N60[204096]; A8T += V2n; var t9H = Z8$; t9H += L7f; t9H += K5V; var V38 = r9R; V38 += r9V; var c4h = j1l; c4h += j5J; var h64 = M_g; h64 += P9x; h64 += a6N60[204096]; h64 += G5V; var _this = this; var focusCapture = this[U0f][h64][c4h]; if (focusCapture === undefined) { focusCapture = o76; } $(this[K6_][V38])[E6I](t9H)[A8T](v1x, function (e) { e[g86](); }); if (focusCapture && (type === q9n || type === x1u)) { var J6u = a6N60[204096]; J6u += V2n; var t_x = W5l; t_x += a6N60.b_J; $(t_x)[J6u](B0B, function () { var y1R = "ED"; var W_G = "activeEle"; var D1H = p$O; D1H += V2n; D1H += a1c; D1H += c8f; var N9s = a$3; N9s += p4h; N9s += t7L; N9s += y1R; var x4K = a$3; x4K += b3v; x4K += q5c; var B6X = G8j; B6X += U0f; var E1R = W_G; E1R += a6N60.G10; if ($(document[E1R])[B6X](x4K)[A82] === d4r && $(document[E1Y])[z4S](N9s)[D1H] === d4r) { var V2j = a37; V2j += j9q; if (_this[U0f][V2j]) { var x1U = r9R; x1U += y5$; x1U += U0f; _this[U0f][h$1][x1U](); } } }); } this[R5A](); this[n0R](e21, [type, this[U0f][q2k]]); if (immediate) { var n3j = B6$; n3j += R0n; n3j += M_J; n3j += t4m; this[n3j](V2d, [type, this[U0f][X6S]]); } return o76; } function _preopen(type) { var a9y = "arDynamicInfo"; var V5n = "cle"; var q26 = "eIcb"; var N1z = 'cancelOpen'; var E$Z = q$k; E$Z += E1g; E$Z += k3T; E$Z += R8I; var w6b = R4N; w6b += V5n; w6b += a9y; var O1R = G13; O1R += X9Y; O1R += w81; O1R += p$p; if (this[n0R](U_M, [type, this[U0f][O1R]]) === L0j) { var R4S = c2T; R4S += M12; R4S += f27; R4S += q26; var M9K = C$M; M9K += N_Z; var f2L = S92; f2L += M12; f2L += M_J; var Q8h = U6y; Q8h += a6N60[204096]; Q8h += q$k; Q8h += M_J; var m5t = U6y; m5t += A3c; m5t += M_J; this[q9r](); this[n0R](N1z, [type, this[U0f][X6S]]); if ((this[U0f][m5t] === X83 || this[U0f][Q8h] === f2L) && this[U0f][M9K]) { this[U0f][m5e](); } this[U0f][R4S] = y8F; return L0j; } this[w6b](o76); this[U0f][E$Z] = type; return o76; } function _processing(processing) { var H6B = "active"; var l2R = "oce"; var B7A = "div"; var G8i = "og"; var B6J = "eve"; var I8p = R4N; I8p += B6J; I8p += t4m; var q7t = X9Y; q7t += G8i; q7t += K9L; q7t += A$Y; var T_Y = R9e; T_Y += U6y; var z73 = B7A; z73 += a$3; z73 += H7a; var C5c = a0_; C5c += l2R; C5c += U0f; C5c += Z9p; var r_Q = e$6; r_Q += g3T; var procClass = this[r_Q][C5c][H6B]; $([z73, this[T_Y][t8J]])[q7t](procClass, processing); this[U0f][i$j] = processing; this[I8p](d54, [processing]); } function _noProcessing(args) { var w3R = 'processing-field'; var processing = L0j; $[H1T](this[U0f][E9S], function (name, field) { if (field[i$j]()) { processing = o76; } }); if (processing) { var j3j = p$p; j3j += M_J; this[j3j](w3R, function () { var i5s = "ly"; var y5H = "_submit"; if (this[B7s](args) === o76) { var Q8m = i3r; Q8m += i5s; this[y5H][Q8m](this, args); } }); } return !processing; } function _submit(successCallback, errorCallback, formatdata, hide) { var v18 = 'allIfChanged'; var z8M = "Field is st"; var i4a = "ill "; var F75 = "ionN"; var S1B = "nComplete"; var N_X = "ditC"; var T1w = 16; var d$5 = 'all'; var M08 = "funct"; var R4r = 'preSubmit'; var Y31 = "mitComp"; var p$m = "editOpt"; var C0v = k3E; C0v += X9Y; C0v += M_J; C0v += Y2t; var K4N = G_P; K4N += F75; K4N += x0Q; var P_d = Z1G; P_d += c2T; P_d += b7n; P_d += V2n; var S1E = U0f; S1E += k_z; S1E += C03; var v7C = p$m; v7C += U0f; var i8V = T5j; i8V += p4h; i8V += E_W; var D39 = M_J; D39 += N_X; D39 += L1F; D39 += t4m; var P8p = a6N60.w1W; P8p += r83; var _this = this; var changed = L0j; var allData = {}; var changedData = {}; var setBuilder = dataSet; var fields = this[U0f][P8p]; var editCount = this[U0f][D39]; var editFields = this[U0f][N$y]; var editData = this[U0f][i8V]; var opts = this[U0f][v7C]; var changedSubmit = opts[S1E]; var submitParamsLocal; if (this[B7s](arguments) === L0j) { var u0m = z8M; u0m += i4a; u0m += i$j; Editor[H1B](u0m, T1w, L0j); return; } var action = this[U0f][P_d]; var submitParams = { data: {} }; submitParams[this[U0f][K4N]] = action; if (action === e9f || action === F3_) { var x0r = c2T; x0r += e0e; var j1H = M_J; j1H += G13; j1H += c8f; $[j1H](editFields, function (idSrc, edit) { var r9o = M_J; r9o += G13; r9o += c8f; var allRowData = {}; var changedRowData = {}; $[r9o](fields, function (name, field) { a6N60.g4A(); var y4A = "tiG"; var B9Z = "-many"; var c3w = "lFromData"; var T28 = "repla"; var R8u = "sA"; var G0E = "-co"; var L2A = '[]'; var M5a = "indexO"; var T4z = /\[.*$/; var p6k = x1v; p6k += Y4p; if (edit[p6k][name] && field[y_v]()) { var p9N = M_J; p9N += q$k; p9N += C03; var u6i = B9Z; u6i += G0E; u6i += l2M; u6i += X9Y; var H8g = T28; H8g += v43; var R7i = M5a; R7i += a6N60.w1W; var T8n = w81; T8n += R8u; T8n += N9U; T8n += o_F; var C8f = U6y; C8f += B1t; C8f += y4A; C8f += Z9E; var multiGet = field[C8f](); var builder = setBuilder(name); if (multiGet[idSrc] === undefined) { var n6R = q$k; n6R += Z1G; n6R += X9Y; n6R += Z1G; var j32 = q_e; j32 += c3w; var originalVal = field[j32](edit[n6R]); builder(allRowData, originalVal); return; } var value = multiGet[idSrc]; var manyBuilder = Array[T8n](value) && typeof name === n1a && name[R7i](L2A) !== -J32 ? setBuilder(name[H8g](T4z, q2P) + u6i) : y8F; builder(allRowData, value); if (manyBuilder) { var L2V = M12; L2V += Z7g; L2V += X9Y; L2V += c8f; manyBuilder(allRowData, value[L2V]); } if (action === p9N && (!editData[name] || !field[v47](value, editData[name][idSrc]))) { builder(changedRowData, value); changed = o76; if (manyBuilder) { var u4y = T30; u4y += r1L; manyBuilder(changedRowData, value[u4y]); } } } }); if (!$[Z$7](allRowData)) { allData[idSrc] = allRowData; } if (!$[Z$7](changedRowData)) { changedData[idSrc] = changedRowData; } }); if (action === x0r || changedSubmit === d$5 || changedSubmit === v18 && changed) { submitParams[Z6V] = allData; } else if (changedSubmit === y30 && changed) { submitParams[Z6V] = changedData; } else { var u8s = B3z; u8s += Y31; u8s += K4R; var X4t = M08; X4t += Z3I; var B0X = a6N60[204096]; B0X += S1B; var o35 = Z1G; o35 += Z6f; o35 += V2n; this[U0f][o35] = y8F; if (opts[H4R] === q0t && (hide === undefined || hide)) { var A0N = R4N; A0N += C$M; this[A0N](L0j); } else if (typeof opts[B0X] === X4t) { opts[H4R](this); } if (successCallback) { var h4R = c2T; h4R += Z1G; h4R += M12; h4R += M12; successCallback[h4R](this); } this[X2p](L0j); this[n0R](u8s); return; } } else if (action === w0q) { var i0D = M_J; i0D += Z1G; i0D += c2T; i0D += c8f; $[i0D](editFields, function (idSrc, edit) { var s1K = h46; s1K += i1c; submitParams[Z6V][idSrc] = edit[s1K]; }); } submitParamsLocal = $[C0v](o76, {}, submitParams); if (formatdata) { formatdata(submitParams); } this[n0R](R4r, [submitParams, action], function (result) { var H6M = "itTa"; a6N60.P01(); var p1h = "_proce"; var B4P = "_sub"; var m80 = "ssing"; if (result === L0j) { var f96 = p1h; f96 += m80; _this[f96](L0j); } else { var v_L = c2T; v_L += Z1G; v_L += M12; v_L += M12; var o3b = B4P; o3b += U6y; o3b += H6M; o3b += t_C; var F45 = Z1G; F45 += a6N60[406894]; F45 += Z1G; F45 += K51; var submitWire = _this[U0f][F45] ? _this[K1W] : _this[o3b]; submitWire[v_L](_this, submitParams, function (json, notGood, xhr) { var n$w = "_submitSuccess"; a6N60.P01(); _this[n$w](json, notGood, submitParams, submitParamsLocal, _this[U0f][X6S], editCount, hide, successCallback, errorCallback, xhr); }, function (xhr, err, thrown) { var i5F = "_submitError"; var E3Z = Z1G; E3Z += c2T; E3Z += X9Y; E3Z += Z3I; _this[i5F](xhr, err, thrown, errorCallback, submitParams, _this[U0f][E3Z]); }, submitParams); } }); } function _submitTable(data, success, error, submitParams) { var x_n = "move"; var I94 = "modif"; a6N60.P01(); var H9j = m3r; H9j += x_n; var X5u = C8o; X5u += e5m; X5u += I2w; X5u += c2T; var N2G = C8o; N2G += e5m; N2G += B_y; var action = data[X6S]; var out = { data: [] }; var idGet = dataGet(this[U0f][N2G]); var idSet = dataSet(this[U0f][X5u]); if (action !== H9j) { var L8A = I94; L8A += j11; var D_B = t5A; D_B += q$k; D_B += M_J; var originalData_1 = this[U0f][D_B] === q9n ? this[B8O](O3y, this[L8A]()) : this[B8O](u0J, this[J$B]()); $[H1T](data[Z6V], function (key, vals) { var X1p = "trin"; var O3i = q$k; O3i += Z1G; O3i += X9Y; O3i += Z1G; var t3Z = c2T; t3Z += I2w; t3Z += x4Z; t3Z += M_J; var toSave; var extender = extendDeepObjShallowArr; a6N60.P01(); if (action === F3_) { var rowData = originalData_1[key][Z6V]; toSave = extender({}, rowData); toSave = extender(toSave, vals); } else { toSave = extender({}, vals); } var overrideId = idGet(toSave); if (action === t3Z && overrideId === undefined) { var m4Z = I6s; m4Z += e5m; m4Z += X1p; m4Z += K3b; idSet(toSave, +new Date() + key[m4Z]()); } else { idSet(toSave, overrideId); } out[O3i][d5s](toSave); }); } success(out); } function _submitSuccess(json, notGood, submitParams, submitParamsLocal, action, editCount, hide, successCallback, errorCallback, xhr) { var t80 = "rce"; var A9l = "So"; var A_z = 'prep'; var F0R = 'postEdit'; var i4z = "Source"; var x$C = 'postSubmit'; var a6a = "<b"; var s0Y = 'commit'; var e4r = "r>"; var C4p = "modifie"; var J4t = 'preRemove'; var w9c = "com"; var t0l = "cc"; var D1f = 'postRemove'; var G4X = "preCrea"; var q_J = "essful"; var Q5W = 'submitSuccess'; var M_Q = "_ev"; var f40 = "_da"; var n58 = 'postCreate'; var j2J = 'setData'; var W45 = "submitUnsu"; var V$0 = "dataSou"; var Y00 = "ditOpts"; var i5j = "_data"; var i$S = "fieldErr"; var U6Z = "editCount"; var G7g = "reE"; var D$T = M_Q; D$T += M_J; D$T += V2n; D$T += X9Y; var i7C = M_J; i7C += I2w; i7C += I2w; i7C += T8R; var K1X = C4p; K1X += I2w; var U$X = M_J; U$X += Y00; var U$G = a6N60.w1W; U$G += r83; var _this = this; var that = this; var setData; var fields = this[U0f][U$G]; var opts = this[U0f][U$X]; var modifier = this[U0f][K1X]; this[n0R](x$C, [json, submitParams, action, xhr]); if (!json[i7C]) { var Y4A = U6D; Y4A += T8R; json[Y4A] = q2P; } if (!json[X6H]) { var A4e = i$S; A4e += T8R; A4e += U0f; json[A4e] = []; } if (notGood || json[H1B] || json[X6H][A82]) { var B33 = W45; B33 += t0l; B33 += q_J; var B_0 = a6a; B_0 += e4r; var g5W = a6N60[406894]; g5W += a6N60[204096]; g5W += w81; g5W += V2n; var globalError_1 = []; if (json[H1B]) { var o4g = F4X; o4g += x4d; globalError_1[o4g](json[H1B]); } $[H1T](json[X6H], function (i, err) { var w_8 = 'Error'; var l__ = 500; var e6o = "odyC"; var J4u = "onFieldError"; var v$J = "own field: "; var G9J = "ieldError"; var g3B = "onF"; var T$R = "ocu"; a6N60.g4A(); var a45 = "Unkn"; var t9_ = "ntent"; var t9b = ":"; var f0_ = "isplayed"; var t14 = q$k; t14 += f0_; var field = fields[err[F5b]]; if (!field) { var S8e = a45; S8e += v$J; throw new Error(S8e + err[F5b]); } else if (field[t14]()) { field[H1B](err[D56] || w_8); if (i === d4r) { var E0t = G7j; E0t += w8B; E0t += p$p; if (opts[J4u] === B69) { var A1m = a6N60.w1W; A1m += T$R; A1m += U0f; var b45 = X9Y; b45 += m2M; var y9e = a6N60[83715]; y9e += e6o; y9e += a6N60[204096]; y9e += t9_; _this[J6m]($(_this[K6_][y9e]), { scrollTop: $(field[H$p]())[x$0]()[b45] }, l__); field[A1m](); } else if (typeof opts[J4u] === E0t) { var g6V = g3B; g6V += G9J; opts[g6V](_this, err); } } } else { var t0C = q5c; t0C += I2w; t0C += I2w; t0C += T8R; var J$9 = t9b; J$9 += S_v; var o1l = V2n; o1l += x0Q; globalError_1[d5s](field[o1l]() + J$9 + (err[D56] || t0C)); } }); this[H1B](globalError_1[g5W](B_0)); this[n0R](B33, [json]); if (errorCallback) { var T3M = Z3H; T3M += L0_; errorCallback[T3M](that, json); } } else { var x5m = M_Q; x5m += M_J; x5m += t4m; var p1x = c2T; p1x += m3r; p1x += x_i; var T4h = b4W; T4h += Z1G; var store = {}; if (json[T4h] && (action === p1x || action === F3_)) { var t3R = b4W; t3R += Z1G; this[B8O](A_z, action, modifier, submitParamsLocal, json, store); for (var _i = d4r, _a = json[Z6V]; _i < _a[A82]; _i++) { var m99 = M_J; m99 += H2l; m99 += X9Y; var W9W = C8j; W9W += M_J; W9W += x_i; var L1T = R4N; L1T += L7V; L1T += X9Y; var o7s = w81; o7s += q$k; var O69 = i5j; O69 += A9l; O69 += a6N60.E4C; O69 += t80; var data = _a[_i]; setData = data; var id = this[O69](o7s, data); this[L1T](j2J, [json, data, action]); if (action === W9W) { var H3J = f40; H3J += t48; H3J += v43; var K$h = G4X; K$h += U$I; var U2F = R4N; U2F += W65; this[U2F](K$h, [json, data, id]); this[H3J](e9f, fields, data, store); this[n0R]([e9f, n58], [json, data, id]); } else if (action === m99) { var M9S = e1N; M9S += w81; M9S += X9Y; var d0r = R4N; d0r += M_J; d0r += R0n; d0r += U2N; var G3X = M_J; G3X += q$k; G3X += w81; G3X += X9Y; var P4d = E43; P4d += G7g; P4d += q$k; P4d += C03; this[n0R](P4d, [json, data, id]); this[B8O](G3X, modifier, fields, data, store); this[d0r]([M9S, F0R], [json, data, id]); } } this[B8O](s0Y, action, modifier, json[t3R], store); } else if (action === w0q) { var B3O = q$k; B3O += Z1G; B3O += X9Y; B3O += Z1G; var f1j = w9c; f1j += n_y; var P3V = y5w; P3V += Q1N; P3V += Z1G; P3V += i4z; var W0f = w81; W0f += Y4p; var u59 = I2w; u59 += k1R; var O6p = I2w; O6p += R3M; O6p += M_J; var D41 = R4N; D41 += V$0; D41 += t80; var y_0 = R4N; y_0 += T2g; y_0 += M_J; y_0 += t4m; this[B8O](A_z, action, modifier, submitParamsLocal, json, store); this[y_0](J4t, [json, this[B4D]()]); this[D41](O6p, modifier, fields, store); this[n0R]([u59, D1f], [json, this[W0f]()]); this[P3V](f1j, action, modifier, json[B3O], store); } if (editCount === this[U0f][U6Z]) { var P4F = U5W; P4F += I6b; var W7H = c2T; W7H += H9d; W7H += C$2; var E7F = Z1G; E7F += c2T; E7F += b7n; E7F += V2n; var sAction = this[U0f][X6S]; this[U0f][E7F] = y8F; if (opts[H4R] === W7H && (hide === undefined || hide)) { this[D2P](json[Z6V] ? o76 : L0j, sAction); } else if (typeof opts[H4R] === P4F) { opts[H4R](this); } } if (successCallback) { var U0L = c2T; U0L += w1q; U0L += M12; successCallback[U0L](that, json); } this[x5m](Q5W, [json, setData, action]); } this[X2p](L0j); this[D$T](n6c, [json, setData, action]); } function _submitError(xhr, err, thrown, errorCallback, submitParams, action) { var E9X = "tS"; var n6C = "mitError"; var Z7u = B3z; Z7u += n6C; var P0$ = U0f; P0$ += a6N60.b_J; P0$ += Y9I; P0$ += m4v; var U8h = a6N60.V56; U8h += I2w; a6N60.g4A(); U8h += a6N60[204096]; U8h += I2w; var k1x = r6J; k1x += E9X; k1x += b0Y; k1x += n_y; var b3O = B6$; b3O += w7$; this[b3O](k1x, [y8F, submitParams, action, xhr]); this[U8h](this[i8a][H1B][P0$]); this[X2p](L0j); if (errorCallback) { errorCallback[T66](this, xhr, err, thrown); } this[n0R]([Z7u, n6c], [xhr, err, thrown, submitParams]); } function _tidy(fn) { var N9v = "settin"; var k9Z = "Serve"; var s87 = "rSide"; var Q8p = q$k; Q8p += w81; Q8p += e_H; Q8p += a6N60.b_J; var a5y = i1c; a5y += a6N60[83715]; a5y += M12; a5y += M_J; var g11 = B9S; g11 += E43; g11 += w81; var h7Z = X9Y; h7Z += Z1G; h7Z += Q4a; h7Z += M_J; var _this = this; var dt = this[U0f][h7Z] ? new DataTable$4[g11](this[U0f][a5y]) : y8F; var ssp = L0j; if (dt) { var G3N = a6N60[83715]; G3N += k9Z; G3N += s87; var T74 = N9v; T74 += G5U; ssp = dt[T74]()[d4r][k8P][G3N]; } if (this[U0f][i$j]) { this[r44](n6c, function () { a6N60.P01(); if (ssp) { var L51 = a6N60[204096]; L51 += V2n; L51 += M_J; dt[L51](n3R, fn); } else { setTimeout(function () { a6N60.g4A(); fn(); }, S57); } }); return o76; } else if (this[N6r]() === X83 || this[Q8p]() === o1Q) { var I98 = Q4a; I98 += L8T; var C5l = a6N60[204096]; C5l += V2n; C5l += M_J; this[C5l](q0t, function () { var j9S = "oces"; a6N60.P01(); var X98 = a0_; X98 += j9S; X98 += F0Y; X98 += k$f; if (!_this[U0f][X98]) { setTimeout(function () { if (_this[U0f]) { fn(); } }, S57); } else { _this[r44](n6c, function (e, json) { a6N60.P01(); if (ssp && json) { var k33 = p$p; k33 += M_J; dt[k33](n3R, fn); } else { setTimeout(function () { a6N60.P01(); if (_this[U0f]) { fn(); } }, S57); } }); } })[I98](); return o76; } return L0j; } function _weakInArray(name, arr) { a6N60.P01(); for (var i = d4r, ien = arr[A82]; i < ien; i++) { if (name == arr[i]) { return i; } } return -J32; } var fieldType = { create: function () { }, disable: function () { }, enable: function () { }, get: function () { }, set: function () { } }; var DataTable$3 = $[a6N60.j_z][h6c]; function _buttonText(conf, textIn) { var Y8o = 'div.upload button'; var x4f = "ose file.."; var h8W = "uploadText"; a6N60.g4A(); var E4b = q6D; E4b += V2n; E4b += E43; E4b += m4k; if (textIn === y8F || textIn === undefined) { var c71 = R9b; c71 += a6N60[204096]; c71 += x4f; c71 += a$3; textIn = conf[h8W] || c71; } conf[E4b][J2D](Y8o)[A$1](textIn); } function _commonUpload(editor, conf, dropCallback, multiple) { var E2G = 'id'; var Q_p = '<button class="'; var V4r = 'Drag and drop a file here to upload'; var C7M = "<div class="; var I4$ = 'div.drop span'; var J4G = "/but"; var f6M = "nput type=\"file\" "; var m5D = "<div clas"; var q_T = "le\">"; var z8v = '<div class="rendered"></div>'; var v5$ = "/div"; var v4$ = "FileReader"; var v8j = "iv class=\"eu_ta"; var Y5O = "<div class=\"editor_"; var z6n = "load li"; var m84 = "\"cell clearValue\""; var i1v = "<div class=\"c"; var a3_ = "iv.re"; var h8E = "ple"; var f0I = "tton class=\""; var P8X = "p\">"; var x4A = "ell up"; var I2j = "v.drop"; var D9s = 'input[type=file]'; var O7e = "dered"; var A0n = "<bu"; var W26 = 'dragleave dragexit'; var e6J = "e=file]"; var n5S = "mitHide\">"; var R99 = "<span></span></div>"; var G00 = "DropT"; var f5n = "<div class=\"row seco"; var n9u = '<div class="cell">'; var w2D = "dragD"; var u8I = "rop"; var i6v = "limitHide\">"; var v01 = 'div.clearValue button'; var h2_ = "s=\"row\">"; var T_J = "ad\">"; var W0s = 'dragover'; var O34 = "<div class=\"dro"; var b_E = "buttonInternal"; var A$a = 'noDrop'; var N_v = "></butto"; var u9b = "put[typ"; var J_2 = '></input>'; var z2s = "\"cell "; var V7o = w81; V7o += g6M; V7o += X9Y; var h66 = a6N60[204096]; h66 += V2n; var o1_ = c2T; o1_ += M12; o1_ += w81; o1_ += Q3u; var X4E = w2D; X4E += u8I; var D8f = w81; D8f += q$k; var P6u = B9f; P6u += L0b; P6u += q$k; P6u += g97; var g$D = B9f; g$D += v5$; g$D += O1E; var Q6O = O34; Q6O += P8X; Q6O += R99; var m85 = C7M; m85 += z2s; m85 += i6v; var J7n = f5n; J7n += Y2t; J7n += n_L; var s7D = y9M; s7D += g97; var n8z = T8z; n8z += H2l; n8z += k94; var t4t = j1Q; t4t += J4G; t4t += E5r; t4t += O1E; var g5Z = A0n; g5Z += f0I; var E$F = C7M; E$F += m84; E$F += O1E; var l_h = N3F; l_h += X9Y; l_h += w81; l_h += h8E; var T_y = T_p; T_y += f6M; var Z3b = K9v; Z3b += N_v; Z3b += V2n; Z3b += O1E; var t6r = i1v; t6r += x4A; t6r += z6n; t6r += n5S; var P5G = m5D; P5G += h2_; var W1p = e9D; W1p += v8j; W1p += a6N60[83715]; W1p += q_T; var R12 = Y5O; R12 += u6G; R12 += H9d; R12 += T_J; var e0k = a6N60.w1W; e0k += a6N60[204096]; e0k += I2w; e0k += U6y; var b9G = S$Q; b9G += a9T; b9G += U0f; b9G += g3T; if (multiple === void d4r) { multiple = L0j; } var btnClass = editor[b9G][e0k][b_E]; var container = $(R12 + W1p + P5G + t6r + Q_p + btnClass + Z3b + T_y + (multiple ? l_h : q2P) + J_2 + c2P + E$F + g5Z + btnClass + t4t + n8z + s7D + J7n + m85 + Q6O + c2P + n9u + z8v + g$D + c2P + P6u + c2P); conf[h$V] = container; conf[V_O] = o76; if (conf[D8f]) { var V1y = w81; V1y += q$k; var N4x = i8S; N4x += u9b; N4x += e6J; var O86 = a6N60.w1W; O86 += i8S; O86 += q$k; container[O86](N4x)[u4o](E2G, Editor[w85](conf[V1y])); } if (conf[u4o]) { container[J2D](D9s)[u4o](conf[u4o]); } _buttonText(conf); if (window[v4$] && conf[X4E] !== L0j) { var V9f = a6N60[204096]; V9f += V2n; var e_O = q$k; e_O += u8I; var h5Y = H2l; h5Y += I2j; var B7n = T$f; B7n += R_o; B7n += G00; B7n += V_R; var q97 = X9Y; q97 += M_J; q97 += K51; q97 += X9Y; container[J2D](I4$)[q97](conf[B7n] || V4r); var dragDrop_1 = container[J2D](h5Y); dragDrop_1[p$p](e_O, function (e) { a6N60.P01(); var U2Q = "originalEvent"; var F6J = 'over'; var f5Y = "ransfer"; var b6c = "dataT"; if (conf[V_O]) { var i_B = l04; i_B += M12; i_B += M_J; i_B += U0f; var F5j = b6c; F5j += f5Y; Editor[M6E](editor, conf, e[U2Q][F5j][i_B], _buttonText, dropCallback); dragDrop_1[H4A](F6J); } return L0j; })[p$p](W26, function (e) { var d6U = "removeC"; if (conf[V_O]) { var j9z = a6N60[204096]; j9z += k6O; j9z += I2w; var V4Y = d6U; V4Y += R9k; dragDrop_1[V4Y](j9z); } return L0j; })[p$p](W0s, function (e) { a6N60.g4A(); var l$k = "Cla"; if (conf[V_O]) { var P_p = a6N60[204096]; P_p += R0n; P_p += M_J; P_p += I2w; var H2j = b2v; H2j += q$k; H2j += l$k; H2j += b1F; dragDrop_1[H2j](P_p); } return L0j; }); editor[V9f](e21, function () { var E1j = 'dragover.DTE_Upload drop.DTE_Upload'; a6N60.g4A(); var r$G = a6N60[204096]; r$G += V2n; $(l0a)[r$G](E1j, function (e) { return L0j; }); })[p$p](q0t, function () { var i3F = "Uploa"; var a$N = "dragover.DTE_Upload drop.DT"; var t1M = a$N; t1M += u6b; t1M += i3F; t1M += q$k; $(l0a)[E6I](t1M); }); } else { var l3G = q$k; l3G += a3_; l3G += V2n; l3G += O7e; var j85 = R6I; j85 += Y2t; container[s9J](A$a); container[j85](container[J2D](l3G)); } container[J2D](v01)[p$p](o1_, function (e) { e[g86](); if (conf[V_O]) { var n1W = U0f; n1W += M_J; n1W += X9Y; upload[n1W][T66](editor, conf, q2P); } }); container[J2D](D9s)[h66](V7o, function () { var z5F = "iles"; var z7g = a6N60.w1W; z7g += z5F; var h$8 = a6N60.E4C; h$8 += O8r; Editor[h$8](editor, conf, this[z7g], _buttonText, function (ids, error) { if (!error) { var Y1H = c2T; Y1H += Z1G; Y1H += M12; Y1H += M12; dropCallback[Y1H](editor, ids); } container[J2D](D9s)[d4r][g_h] = q2P; }); }); return container; } function _triggerChange(input) { a6N60.P01(); setTimeout(function () { a6N60.P01(); input[Z16](h0P, { editor: o76, editorSet: o76 }); }, d4r); } var baseFieldType = $[f_z](o76, {}, fieldType, { canReturnSubmit: function (conf, node) { a6N60.P01(); return o76; }, disable: function (conf) { var L_A = d5k; L_A += q$k; conf[h$V][P00](L_A, o76); }, enable: function (conf) { var S$u = "sabl"; var X_0 = H2l; a6N60.g4A(); X_0 += S$u; X_0 += M_J; X_0 += q$k; var h2p = a0_; h2p += a6N60[204096]; h2p += E43; conf[h$V][h2p](X_0, L0j); }, get: function (conf) { var O_$ = q_e; O_$ += M12; var H3e = F67; H3e += F4X; H3e += X9Y; return conf[H3e][O_$](); }, set: function (conf, val) { var W4G = R4N; W4G += w81; W4G += g6M; W4G += X9Y; a6N60.P01(); var t$G = R0n; t$G += Z1G; t$G += M12; conf[h$V][t$G](val); _triggerChange(conf[W4G]); } }); var hidden = { create: function (conf) { var H$J = "<in"; var x7w = U1D; x7w += M_J; var R82 = R4N; R82 += q_e; R82 += M12; var P_w = H$J; P_w += F4X; P_w += X9Y; P_w += A4W; conf[h$V] = $(P_w); conf[R82] = conf[x7w]; return y8F; }, get: function (conf) { a6N60.g4A(); return conf[u8O]; }, set: function (conf, val) { var W3Z = "_va"; var L5Y = R4N; L5Y += R0n; L5Y += Z1G; L5Y += M12; var m$C = W3Z; m$C += M12; var oldVal = conf[m$C]; conf[L5Y] = val; conf[h$V][r8Z](val); if (oldVal !== val) { var G1k = F67; G1k += E43; G1k += a6N60.E4C; G1k += X9Y; _triggerChange(conf[G1k]); } } }; var readonly = $[h0f](o76, {}, baseFieldType, { create: function (conf) { var H1I = q6D; H1I += V2n; H1I += F4X; H1I += X9Y; var L28 = Z1G; L28 += X9Y; L28 += D$M; var m_9 = U$I; m_9 += K51; m_9 += X9Y; var O9D = w81; O9D += q$k; var H42 = O1$; H42 += v_F; var d6z = M_J; d6z += G2f; d6z += V2n; d6z += q$k; var J_b = R4N; J_b += i8S; J_b += F4X; J_b += X9Y; conf[J_b] = $(d02)[u4o]($[d6z]({ id: Editor[H42](conf[O9D]), readonly: W2j, type: m_9 }, conf[L28] || ({}))); return conf[H1I][d4r]; } }); var text = $[f_z](o76, {}, baseFieldType, { create: function (conf) { var r2W = q6D; r2W += N50; var z$T = b5u; z$T += I2w; var r1k = U$I; r1k += K51; r1k += X9Y; var n8v = w81; n8v += q$k; var z2v = V_R; z2v += M_J; z2v += V2n; z2v += q$k; var q4q = I$Z; q4q += m4k; conf[q4q] = $(d02)[u4o]($[z2v]({ id: Editor[w85](conf[n8v]), type: r1k }, conf[z$T] || ({}))); return conf[r2W][d4r]; } }); var password = $[c1Q](o76, {}, baseFieldType, { create: function (conf) { var O8V = "passwo"; var x20 = I$Z; x20 += a6N60.E4C; x20 += X9Y; var r9I = O8V; r9I += I2w; r9I += q$k; var Q36 = w81; Q36 += q$k; var B9K = U0f; B9K += l7e; var Z6A = Q1N; Z6A += D$M; a6N60.g4A(); var e58 = T_p; e58 += V2n; e58 += N$U; e58 += A4W; conf[h$V] = $(e58)[Z6A]($[f_z]({ id: Editor[B9K](conf[Q36]), type: r9I }, conf[u4o] || ({}))); return conf[x20][d4r]; } }); var textarea = $[f_z](o76, {}, baseFieldType, { canReturnSubmit: function (conf, node) { return L0j; }, create: function (conf) { a6N60.g4A(); var T5Y = '<textarea></textarea>'; var F57 = Z1G; F57 += X$K; var W$b = w81; W$b += q$k; var A4B = q6D; A4B += g6M; A4B += X9Y; conf[A4B] = $(T5Y)[u4o]($[f_z]({ id: Editor[w85](conf[W$b]) }, conf[F57] || ({}))); return conf[h$V][d4r]; } }); var select = $[S7v](o76, {}, baseFieldType, { _addOptions: function (conf, opts, append) { var w7m = "ceh"; var A75 = "Pa"; var P7r = "hidden"; var j7d = "placeholderDisabled"; var p1X = "laceholde"; var k72 = "derValu"; var Q2w = "itor_va"; var e8K = "placeholderValue"; var y5D = "rD"; var F9n = "isabled"; var y_b = "disabl"; var g5C = "placehol"; var n17 = "older"; var B2N = a6N60[204096]; B2N += X4M; var L3P = F67; L3P += F4X; L3P += X9Y; if (append === void d4r) { append = L0j; } var elOpts = conf[L3P][d4r][B2N]; a6N60.g4A(); var countOffset = d4r; if (!append) { var C$4 = E43; C$4 += f$v; C$4 += w7m; C$4 += n17; var q6_ = r4y; q6_ += l9J; elOpts[q6_] = d4r; if (conf[C$4] !== undefined) { var C7X = B6$; C7X += q$k; C7X += Q2w; C7X += M12; var Y3b = y_b; Y3b += e1N; var K$$ = E43; K$$ += p1X; K$$ += y5D; K$$ += F9n; var P7n = g5C; P7n += k72; P7n += M_J; var placeholderValue = conf[e8K] !== undefined ? conf[P7n] : q2P; countOffset += J32; elOpts[d4r] = new Option(conf[A_$], placeholderValue); var disabled = conf[j7d] !== undefined ? conf[K$$] : o76; elOpts[d4r][P7r] = disabled; elOpts[d4r][Y3b] = disabled; elOpts[d4r][C7X] = placeholderValue; } } else { var r4F = T30; r4F += a1c; r4F += c8f; countOffset = elOpts[r4F]; } if (opts) { var l9f = a6N60[204096]; l9f += X4M; l9f += A75; l9f += q93; Editor[k0D](opts, conf[l9f], function (val, label, i, attr) { var option = new Option(label, val); option[u_l] = val; if (attr) { var X1w = Z1G; X1w += X$K; $(option)[X1w](attr); } elOpts[i + countOffset] = option; }); } }, create: function (conf) { var Y4C = "option"; var P1D = "pOp"; var K7g = "<select></sel"; var w$s = "ect>"; var Q9u = "ge.dte"; var a5W = R4N; a5W += a8E; a5W += m4k; var A0J = w81; A0J += P1D; A0J += X9Y; A0J += U0f; var p2k = Y4C; p2k += U0f; var o3Z = R4N; o3Z += Z1G; o3Z += z1E; var f32 = c2T; f32 += c8f; f32 += F3I; f32 += Q9u; var Y$U = Q1N; Y$U += X9Y; Y$U += I2w; var p50 = U0f; p50 += Z1G; p50 += v_F; var o4U = Q1N; o4U += D$M; var V5N = K7g; V5N += w$s; conf[h$V] = $(V5N)[o4U]($[f_z]({ id: Editor[p50](conf[C8o]), multiple: conf[q3s] === o76 }, conf[Y$U] || ({})))[p$p](f32, function (e, d) { var C_0 = M_J; C_0 += q$k; a6N60.P01(); C_0 += w81; C_0 += N5b; if (!d || !d[C_0]) { var d0k = K3b; d0k += M_J; d0k += X9Y; conf[O0T] = select[d0k](conf); } }); select[o3Z](conf, conf[p2k] || conf[A0J]); return conf[a5W][d4r]; }, destroy: function (conf) { var w$z = 'change.dte'; var Y5W = a6N60[204096]; a6N60.P01(); Y5W += a6N60.w1W; Y5W += a6N60.w1W; conf[h$V][Y5W](w$z); }, get: function (conf) { var p9h = "oArr"; var K04 = "ip"; var V1H = 'option:selected'; var f8y = p$O; f8y += c$s; var H5Z = v41; H5Z += K04; H5Z += M12; H5Z += M_J; var d3Z = X9Y; d3Z += p9h; d3Z += o_F; var t8U = U6y; t8U += Z1G; t8U += E43; var C$o = F67; C$o += E43; C$o += m4k; var val = conf[C$o][J2D](V1H)[t8U](function () { var c6V = "tor_val"; var M_H = R4N; M_H += W5X; M_H += c6V; return this[M_H]; })[d3Z](); if (conf[H5Z]) { return conf[T8F] ? val[H_a](conf[T8F]) : val; } return val[f8y] ? val[d4r] : y8F; }, set: function (conf, val, localUpdate) { var F7h = "Array"; var C8y = "multip"; var P_1 = 'option'; var d$t = "selected"; var k4Z = M12; k4Z += R2S; var i5i = M_J; i5i += y1g; var h6G = F_$; h6G += Z3I; var u_a = a6N60.w1W; u_a += w81; u_a += V2n; u_a += q$k; var S1z = R4N; S1z += w81; S1z += g5o; S1z += m4k; var i2l = w81; i2l += U0f; i2l += F7h; var A16 = C8y; A16 += p$O; if (!localUpdate) { conf[O0T] = val; } if (conf[A16] && conf[T8F] && !Array[i2l](val)) { var j9y = U0f; j9y += D$M; j9y += d2U; val = typeof val === j9y ? val[Z11](conf[T8F]) : []; } else if (!Array[B1R](val)) { val = [val]; } var i; var len = val[A82]; var found; var allFound = L0j; var options = conf[S1z][u_a](h6G); conf[h$V][J2D](P_1)[i5i](function () { found = L0j; for (i = d4r; i < len; i++) { if (this[u_l] == val[i]) { found = o76; allFound = o76; break; } } this[d$t] = found; }); if (conf[A_$] && !allFound && !conf[q3s] && options[k4Z]) { options[d4r][d$t] = o76; } a6N60.g4A(); if (!localUpdate) { var z2z = I$Z; z2z += a6N60.E4C; z2z += X9Y; _triggerChange(conf[z2z]); } return allFound; }, update: function (conf, options, append) { var n$E = "_la"; var X26 = "stSet"; var h4v = q6D; h4v += g6M; h4v += X9Y; a6N60.g4A(); var o1G = n$E; o1G += X26; var k17 = j8u; k17 += z1E; select[k17](conf, options, append); var lastSet = conf[o1G]; if (lastSet !== undefined) { select[N9h](conf, lastSet, o76); } _triggerChange(conf[h4v]); } }); var checkbox = $[f_z](o76, {}, baseFieldType, { _addOptions: function (conf, opts, append) { if (append === void d4r) { append = L0j; } var jqInput = conf[h$V]; var offset = d4r; a6N60.g4A(); if (!append) { var x3W = M_J; x3W += U6y; x3W += E43; x3W += V3Y; jqInput[x3W](); } else { var u4L = M12; u4L += Z7g; u4L += X9Y; u4L += c8f; offset = $(C9v, jqInput)[u4L]; } if (opts) { Editor[k0D](opts, conf[W4K], function (val, label, i, attr) { var l0U = "input:las"; var L9N = "\" type=\"c"; var W1$ = "t:la"; var x59 = "heckbox\" /"; var d9u = R0n; d9u += z9B; d9u += M_J; var l0O = Q1N; l0O += X9Y; l0O += I2w; var N4F = a8E; N4F += a6N60.E4C; N4F += W1$; N4F += Y9I; var U9m = K7V; U9m += O1E; var e_V = U0f; e_V += s3g; e_V += Y$D; e_V += q$k; var p9D = L9N; p9D += x59; p9D += O1E; var t8q = U0f; t8q += l7e; var g5_ = i3r; g5_ += M_J; g5_ += Y2t; jqInput[g5_](j4I + M6Q + Editor[t8q](conf[C8o]) + z1y + (i + offset) + p9D + Z9j + Editor[e_V](conf[C8o]) + z1y + (i + offset) + Q9K + label + P22 + U9m); $(N4F, jqInput)[l0O](d9u, val)[d4r][u_l] = val; if (attr) { var B_$ = Z1G; B_$ += X9Y; B_$ += X9Y; B_$ += I2w; var G3c = l0U; G3c += X9Y; $(G3c, jqInput)[B_$](attr); } }); } }, create: function (conf) { var i_U = "dOpt"; var D6g = "ipO"; var I0O = "_ad"; var a6C = "<div></div"; var z3t = "ions"; var B4g = D6g; B4g += O4D; var i13 = I0O; i13 += i_U; i13 += z3t; var U6L = a6C; U6L += O1E; var n4d = R4N; n4d += a8E; n4d += m4k; conf[n4d] = $(U6L); checkbox[i13](conf, conf[l3z] || conf[B4g]); return conf[h$V][d4r]; }, disable: function (conf) { var B95 = q$k; B95 += w81; B95 += b5h; B95 += q$k; var P4C = l04; P4C += Y2t; conf[h$V][P4C](C9v)[P00](B95, o76); }, enable: function (conf) { var J3K = "led"; var a0B = "sab"; a6N60.g4A(); var K6I = q$k; K6I += w81; K6I += a0B; K6I += J3K; var A9O = i8S; A9O += N$U; var Z0Q = q6D; Z0Q += V2n; Z0Q += E43; Z0Q += m4k; conf[Z0Q][J2D](A9O)[P00](K6I, L0j); }, get: function (conf) { var e5c = "pus"; var l6Z = "hec"; var A$m = ":c"; var T$g = "ked"; var b7Z = "uns"; var z_J = "separa"; var N47 = "electedV"; var n4I = G8l; n4I += i8S; var b0h = z_J; b0h += I6s; b0h += I2w; var I5n = b7Z; I5n += N47; I5n += l3T; var l0m = O9m; l0m += A$m; l0m += l6Z; l0m += T$g; var g9n = a6N60.w1W; g9n += i8S; g9n += q$k; var r63 = I$Z; r63 += m4k; var out = []; var selected = conf[r63][g9n](l0m); if (selected[A82]) { selected[H1T](function () { a6N60.P01(); out[d5s](this[u_l]); }); } else if (conf[I5n] !== undefined) { var U3g = e5c; U3g += c8f; out[U3g](conf[k9W]); } return conf[b0h] === undefined || conf[T8F] === y8F ? out : out[n4I](conf[T8F]); }, set: function (conf, val) { var R61 = '|'; var l29 = "ri"; var u5p = M_J; u5p += Z1G; u5p += x3e; var J8y = M12; J8y += Z7g; J8y += l9J; var u3n = Y9I; u3n += l29; u3n += k$f; var s5N = i8S; s5N += N$U; a6N60.g4A(); var u3G = q6D; u3G += V2n; u3G += F4X; u3G += X9Y; var jqInputs = conf[u3G][J2D](s5N); if (!Array[B1R](val) && typeof val === u3n) { var A4H = U0f; A4H += E43; A4H += M12; A4H += C03; val = val[A4H](conf[T8F] || R61); } else if (!Array[B1R](val)) { val = [val]; } var i; var len = val[J8y]; var found; jqInputs[u5p](function () { var R$T = "_editor_v"; found = L0j; a6N60.P01(); for (i = d4r; i < len; i++) { var d7k = R$T; d7k += w1q; if (this[d7k] == val[i]) { found = o76; break; } } this[S$v] = found; }); _triggerChange(jqInputs); }, update: function (conf, options, append) { var E7a = K3b; E7a += M_J; E7a += X9Y; a6N60.g4A(); var currVal = checkbox[E7a](conf); checkbox[y5E](conf, options, append); checkbox[N9h](conf, currVal); } }); var radio = $[C1A](o76, {}, baseFieldType, { _addOptions: function (conf, opts, append) { var k62 = "air"; a6N60.g4A(); var A48 = "tionsP"; if (append === void d4r) { append = L0j; } var jqInput = conf[h$V]; var offset = d4r; if (!append) { jqInput[s$q](); } else { var Q4W = w81; Q4W += N50; offset = $(Q4W, jqInput)[A82]; } if (opts) { var F5C = m2M; F5C += A48; F5C += k62; Editor[k0D](opts, conf[F5C], function (val, label, i, attr) { var k4$ = '" type="radio" name="'; var z3U = '" />'; var d0l = 'input:last'; var k_l = "put:la"; var q3U = "div>"; var s3A = Z1G; s3A += F59; s3A += I2w; var M7C = i8S; M7C += k_l; M7C += Y9I; var R7d = B9f; R7d += L0b; R7d += q$k; R7d += g97; var k_t = w81; k_t += q$k; var Y8G = j5M; Y8G += M_J; var z4I = O1$; z4I += v_F; var C4m = B9f; C4m += q3U; jqInput[w2$](C4m + M6Q + Editor[z4I](conf[C8o]) + z1y + (i + offset) + k4$ + conf[Y8G] + z3U + Z9j + Editor[w85](conf[k_t]) + z1y + (i + offset) + Q9K + label + P22 + R7d); $(M7C, jqInput)[s3A](I3P, val)[d4r][u_l] = val; if (attr) { var M4n = Z1G; M4n += X$K; $(d0l, jqInput)[M4n](attr); } }); } }, create: function (conf) { var g2i = "ipOpts"; var M3Y = '<div />'; var C3E = a6N60[204096]; C3E += V2n; var V3Z = q2p; V3Z += R31; a6N60.g4A(); conf[h$V] = $(M3Y); radio[V3Z](conf, conf[l3z] || conf[g2i]); this[C3E](e21, function () { var Q0b = "fin"; var C1d = M_J; C1d += Z1G; C1d += c2T; C1d += c8f; var E9M = Q0b; E9M += q$k; conf[h$V][E9M](C9v)[C1d](function () { if (this[o8p]) { var c7D = x3e; c7D += M_J; c7D += Q3u; c7D += e1N; this[c7D] = o76; } }); }); return conf[h$V][d4r]; }, disable: function (conf) { var m89 = "isable"; var X_d = q$k; X_d += m89; X_d += q$k; var w3t = a0_; w3t += a6N60[204096]; w3t += E43; var S1N = a6N60.w1W; S1N += w81; a6N60.g4A(); S1N += V2n; S1N += q$k; var X0U = R4N; X0U += h$h; X0U += X9Y; conf[X0U][S1N](C9v)[w3t](X_d, o76); }, enable: function (conf) { var r5x = E43; r5x += I2w; r5x += m2M; var q5N = a6N60.w1W; q5N += i8S; q5N += q$k; var N3z = I$Z; N3z += m4k; conf[N3z][q5N](C9v)[r5x](E1f, L0j); }, get: function (conf) { var y6P = "unsele"; var p3Y = ":ch"; var Q8E = "ctedValue"; var y_d = "ecked"; var s2r = y6P; s2r += Q8E; var j5$ = M12; j5$ += R2S; var J$k = i8S; J$k += N$U; J$k += p3Y; J$k += y_d; var a8l = a6N60.w1W; a8l += w81; a8l += V2n; a8l += q$k; var el = conf[h$V][a8l](J$k); if (el[j5$]) { return el[d4r][u_l]; } return conf[k9W] !== undefined ? conf[s2r] : undefined; }, set: function (conf, val) { var r45 = "ut:checked"; var r58 = a8E; r58 += r45; var U$R = t_e; U$R += c8f; var X9J = i8S; X9J += N$U; var I$f = a6N60.w1W; I$f += j_R; conf[h$V][I$f](X9J)[U$R](function () { var K59 = "eC"; var L1n = "edito"; a6N60.P01(); var B9A = "preChecked"; var s3h = "_pr"; var i_j = "hecked"; var r0i = "r_v"; var J1F = R4N; J1F += L1n; J1F += r0i; J1F += w1q; var Z_1 = s3h; Z_1 += K59; Z_1 += i_j; this[Z_1] = L0j; if (this[J1F] == val) { var x8N = R4N; x8N += B9A; this[S$v] = o76; this[x8N] = o76; } else { this[S$v] = L0j; this[o8p] = L0j; } }); _triggerChange(conf[h$V][J2D](r58)); }, update: function (conf, options, append) { var l_E = "filt"; var M4V = "[val"; var T2l = "=\""; var T1a = b5u; T1a += I2w; var L$H = M_J; L$H += s6T; var C8T = M12; C8T += R2S; var u8g = K9v; u8g += o5s; var d8$ = M4V; d8$ += E_A; d8$ += T2l; var i3a = l_E; i3a += a6N60.V56; var K9K = U0f; K9K += M_J; K9K += X9Y; var t8i = h$h; t8i += X9Y; var q4P = a6N60.w1W; q4P += j_R; var currVal = radio[l1t](conf); radio[y5E](conf, options, append); var inputs = conf[h$V][q4P](t8i); radio[K9K](conf, inputs[i3a](d8$ + currVal + u8g)[C8T] ? currVal : inputs[L$H](d4r)[T1a](I3P)); } }); var datetime = $[V0W](o76, {}, baseFieldType, { create: function (conf) { var D3d = "_closeFn"; var a91 = " /"; var i$X = "displayFormat"; var z$n = "momentLocale"; var o47 = "keyInput"; var o_1 = "locale"; var B2U = "loc"; var S6R = "DateTime library i"; var U0o = "s required"; a6N60.P01(); var J7v = "ick"; var G8D = "tet"; var u8Q = "momentStrict"; var E87 = "ict"; var T1W = "seF"; var m$K = "ale"; var G19 = "ime"; var L5f = "strict"; var S8r = "<inp"; var X7j = "momentLoca"; var R26 = "format"; var k5h = c2T; k5h += H9d; k5h += C$2; var O9y = a6N60[204096]; O9y += V2n; var r7E = Q5y; r7E += T1W; r7E += V2n; var l51 = F_$; l51 += U0f; var r3m = h46; r3m += G8D; r3m += G19; var i81 = y$D; i81 += o7A; i81 += V2n; var x8F = M_J; x8F += K51; x8F += U$I; x8F += Y2t; var U8c = w7A; U8c += J7v; U8c += a6N60.V56; var v8Q = B2U; v8Q += m$K; var C9B = m2M; C9B += X9Y; C9B += U0f; var E0$ = X7j; E0$ += p$O; var P5x = L6L; P5x += w81; P5x += U6y; P5x += M_J; var j2E = Z1G; j2E += X$K; var T67 = w81; T67 += q$k; var d1Z = S8r; d1Z += m4k; d1Z += a91; d1Z += O1E; var b5O = I$Z; b5O += m4k; conf[b5O] = $(d1Z)[u4o]($[f_z](o76, { id: Editor[w85](conf[T67]), type: M2c }, conf[j2E])); if (!DataTable$3[P5x]) { var Y7A = S6R; Y7A += U0o; var S0Y = M_J; S0Y += I2w; S0Y += k7M; S0Y += I2w; Editor[S0Y](Y7A, I5u); } if (conf[E0$] && !conf[C9B][v8Q]) { conf[Z3g][o_1] = conf[z$n]; } if (conf[u8Q] && !conf[Z3g][L5f]) { var H3c = U0f; H3c += X9Y; H3c += I2w; H3c += E87; conf[Z3g][H3c] = conf[u8Q]; } conf[U8c] = new DataTable$3[P0U](conf[h$V], $[x8F]({ format: conf[i$X] || conf[R26], i18n: this[i81][r3m] }, conf[l51])); conf[r7E] = function () { var s6W = c8f; a6N60.P01(); s6W += w81; s6W += q$k; s6W += M_J; conf[i2e][s6W](); }; if (conf[o47] === L0j) { var S3Z = a6N60[204096]; S3Z += V2n; conf[h$V][S3Z](K6M, function (e) { var f5W = "preven"; var A_E = "tDef"; var b9x = f5W; b9x += A_E; a6N60.P01(); b9x += n6r; e[b9x](); }); } this[O9y](k5h, conf[D3d]); return conf[h$V][d4r]; }, destroy: function (conf) { var c0d = "dow"; var O9z = "oseF"; var Q6L = v5N; Q6L += a6N60.b_J; Q6L += c0d; Q6L += V2n; var O4c = a6N60[204096]; O4c += a6N60.w1W; O4c += a6N60.w1W; var m$o = B_r; a6N60.P01(); m$o += O9z; m$o += V2n; this[E6I](q0t, conf[m$o]); conf[h$V][O4c](Q6L); conf[i2e][k9h](); }, errorMessage: function (conf, msg) { var w4O = "errorMsg"; var J7c = w7A; J7c += w81; J7c += Q3u; a6N60.P01(); J7c += a6N60.V56; conf[J7c][w4O](msg); }, get: function (conf) { var S6c = "valFormat"; var G5k = "reFor"; var m7r = R4N; m7r += O9m; var n1A = F1Y; n1A += G5k; n1A += U6y; n1A += Q1N; return conf[n1A] ? conf[i2e][S6c](conf[B9u]) : conf[m7r][r8Z](); }, maxDate: function (conf, max) { var Q4R = L74; a6N60.g4A(); Q4R += K51; conf[i2e][Q4R](max); }, minDate: function (conf, min) { var R0z = "icker"; var D$k = "min"; var t9i = R4N; t9i += E43; t9i += R0z; conf[t9i][D$k](min); }, owns: function (conf, node) { var E7X = a6N60[204096]; E7X += j3w; E7X += V2n; E7X += U0f; a6N60.g4A(); return conf[i2e][E7X](node); }, set: function (conf, val) { var R4i = "valFo"; var F3v = '--'; var M2C = "rmat"; var F8Y = "ireFormat"; var l8a = R4N; l8a += w81; a6N60.g4A(); l8a += N50; var K37 = j3w; K37 += F8Y; var t1C = U0f; t1C += D$M; t1C += w81; t1C += k$f; if (typeof val === t1C && val && val[M0m](F3v) !== d4r && conf[K37]) { var h8N = R4i; h8N += M2C; conf[i2e][h8N](conf[B9u], val); } else { var Z08 = R0n; Z08 += Z1G; Z08 += M12; conf[i2e][Z08](val); } _triggerChange(conf[l8a]); } }); var upload = $[f_z](o76, {}, baseFieldType, { canReturnSubmit: function (conf, node) { a6N60.P01(); return L0j; }, create: function (conf) { var editor = this; var container = _commonUpload(editor, conf, function (val) { var J_7 = "stUp"; var D4x = "load"; var q5e = j5M; q5e += M_J; var m76 = H4E; m76 += J_7; m76 += D4x; var m6n = Z3H; m6n += M12; m6n += M12; var p7V = U0f; p7V += M_J; p7V += X9Y; upload[p7V][m6n](editor, conf, val[d4r]); editor[n0R](m76, [conf[q5e], val[d4r]]); }); return container; }, disable: function (conf) { var Z82 = "abled"; var Z7s = "disab"; var m0z = R4N; m0z += P3y; m0z += Z82; var J57 = Z7s; J57 += p$O; J57 += q$k; var Z8H = a6N60.w1W; Z8H += w81; a6N60.P01(); Z8H += V2n; Z8H += q$k; var T8h = R4N; T8h += w81; T8h += g5o; T8h += m4k; conf[T8h][Z8H](C9v)[P00](J57, o76); conf[m0z] = L0j; }, enable: function (conf) { var j0m = E43; j0m += I2w; j0m += a6N60[204096]; j0m += E43; var X7n = a8E; X7n += a6N60.E4C; X7n += X9Y; var I9b = a6N60.w1W; I9b += w81; I9b += V2n; I9b += q$k; var b9a = I$Z; b9a += a6N60.E4C; b9a += X9Y; conf[b9a][I9b](X7n)[j0m](E1f, L0j); conf[V_O] = o76; }, get: function (conf) { return conf[u8O]; }, set: function (conf, val) { var t8M = 'No file'; var J2q = "clea"; var l6A = 'noClear'; var C5f = "v.clearValue button"; var l_F = "an>"; var r4Q = '<span>'; var X6P = "leText"; var o$M = "clearText"; var i$g = "triggerHandler"; var k73 = "</sp"; var f59 = "oFi"; var Z6k = "noC"; var M$0 = R4N; M$0 += q_e; M$0 += M12; var w3o = H2l; w3o += C5f; var I9Q = a6N60.w1W; I9Q += w81; I9Q += V2n; I9Q += q$k; var I5J = M_g; I5J += y$w; var K$2 = R0n; K$2 += w1q; var a41 = R4N; a41 += h$h; a41 += X9Y; var P0Q = R4N; P0Q += R0n; P0Q += Z1G; P0Q += M12; conf[P0Q] = val; conf[a41][K$2](q2P); var container = conf[h$V]; if (conf[I5J]) { var k63 = R4N; k63 += r8Z; var rendered = container[J2D](c_U); if (conf[k63]) { rendered[A$1](conf[N6r](conf[u8O])); } else { var m_G = k73; m_G += l_F; var o51 = V2n; o51 += f59; o51 += X6P; rendered[s$q]()[w2$](r4Q + (conf[o51] || t8M) + m_G); } } var button = container[I9Q](w3o); if (val && conf[o$M]) { var c3o = Z6k; c3o += s_P; var W8W = I2w; W8W += Z7f; W8W += p2N; var S_I = J2q; S_I += I2w; S_I += t7L; S_I += V_R; var W5t = W74; W5t += U6y; W5t += M12; button[W5t](conf[S_I]); container[W8W](c3o); } else { var i8r = u9B; i8r += A$Y; container[i8r](l6A); } conf[h$V][J2D](C9v)[i$g](F_O, [conf[M$0]]); } }); var uploadMany = $[f_z](o76, {}, baseFieldType, { _showHide: function (conf) { var w2G = "ft"; var B99 = "limit"; var b1M = "limi"; var W1S = "ai"; var o7Q = "_cont"; var V4E = "div.limitHi"; var P4K = "imitL"; var B6d = "ock"; var v1i = "_l"; var c6C = M12; c6C += Z7g; c6C += l9J; var i1f = R4N; i1f += r8Z; var j1o = v1i; j1o += P4K; j1o += M_J; j1o += w2G; a6N60.g4A(); var H36 = Q4a; H36 += B6d; var T$s = b1M; T$s += X9Y; var C3R = q$k; C3R += E1g; C3R += k3T; C3R += o_F; var J9$ = V4E; J9$ += y6e; var n0b = o7Q; n0b += W1S; n0b += i$v; if (!conf[B99]) { return; } conf[n0b][J2D](J9$)[x35](C3R, conf[u8O][A82] >= conf[T$s] ? y0x : H36); conf[j1o] = conf[B99] - conf[i1f][c6C]; }, canReturnSubmit: function (conf, node) { return L0j; }, create: function (conf) { var o65 = "_container"; var G$u = ".remove"; var a7H = g8e; a7H += F59; a7H += p$p; a7H += G$u; var D28 = o8K; D28 += r4q; D28 += w81; var editor = this; var container = _commonUpload(editor, conf, function (val) { var o0X = 'postUpload'; var Z36 = "nc"; var c$Z = R4N; c$Z += R0n; c$Z += Z1G; c$Z += M12; var T5X = V2n; T5X += Z1G; T5X += U6y; T5X += M_J; var Y1v = B6$; Y1v += w7$; var w9v = R4N; w9v += R0n; w9v += Z1G; w9v += M12; var P7B = c2T; P7B += Z1G; P7B += M12; P7B += M12; var F1$ = W25; F1$ += Z36; F1$ += Q1N; conf[u8O] = conf[u8O][F1$](val); uploadMany[N9h][P7B](editor, conf, conf[w9v]); editor[Y1v](o0X, [conf[T5X], conf[c$Z]]); }, o76); container[s9J](D28)[p$p](U1c, a7H, function (e) { var u43 = "stopPropagation"; var K8J = 'idx'; e[u43](); if (conf[V_O]) { var a9Q = U0f; a9Q += M_J; a9Q += X9Y; var F3u = q$k; F3u += Z1G; F3u += i1c; var idx = $(this)[F3u](K8J); conf[u8O][T$A](idx, J32); uploadMany[a9Q][T66](editor, conf, conf[u8O]); } }); conf[o65] = container; return container; }, disable: function (conf) { var B3c = "nabled"; var t9t = "_inpu"; a6N60.P01(); var i76 = B6$; i76 += B3c; var z9b = w81; z9b += g5o; z9b += a6N60.E4C; z9b += X9Y; var H2O = a6N60.w1W; H2O += w81; H2O += Y2t; var G6H = t9t; G6H += X9Y; conf[G6H][H2O](z9b)[P00](E1f, o76); conf[i76] = L0j; }, enable: function (conf) { var k2N = "disa"; var y9r = k2N; y9r += J4n; var l1n = a6N60.w1W; l1n += w81; l1n += Y2t; conf[h$V][l1n](C9v)[P00](y9r, L0j); conf[V_O] = o76; }, get: function (conf) { a6N60.g4A(); return conf[u8O]; }, set: function (conf, val) { var Q9r = "triggerHandle"; var K7u = "showHi"; var q2d = "noFileText"; var t_S = "span>"; var D8P = "les"; var e1w = "o fi"; var x5t = 'Upload collections must have an array as a value'; var h3S = '</span>'; var l5D = "</ul>"; var u6H = R4N; u6H += R0n; u6H += Z1G; u6H += M12; var J2i = Q9r; J2i += I2w; var T2x = R4N; T2x += w81; T2x += g6M; T2x += X9Y; var v9P = R4N; v9P += K7u; v9P += y6e; var H8Q = H2l; H8Q += T4I; var f9H = R4N; f9H += w81; f9H += V2n; f9H += N$U; var U_H = F67; U_H += E43; U_H += m4k; var x5I = R4N; x5I += R0n; x5I += w1q; if (!val) { val = []; } if (!Array[B1R](val)) { throw new Error(x5t); } conf[x5I] = val; conf[U_H][r8Z](q2P); var that = this; var container = conf[f9H]; if (conf[H8Q]) { var q4$ = M_J; q4$ += U6y; q4$ += w$O; q4$ += a6N60.b_J; var rendered = container[J2D](c_U)[q4$](); if (val[A82]) { var R6x = B9f; R6x += B1t; R6x += O1E; R6x += l5D; var list_1 = $(R6x)[K8Q](rendered); $[H1T](val, function (i, file) { var r8J = "<l"; var x5B = ">&"; var A1y = "times;</button>"; var p3i = " remove"; var K1y = ' <button class="'; var F5z = "i>"; var T0g = "\" data-idx=\""; var g0E = H2l; g0E += b15; g0E += o_F; var display = conf[g0E](file, i); if (display !== y8F) { var Q4u = T8z; Q4u += M12; Q4u += F5z; var p$y = K9v; p$y += x5B; p$y += A1y; var a2B = p3i; a2B += T0g; var L5T = r9R; L5T += I2w; L5T += U6y; var S4N = r8J; S4N += w81; S4N += O1E; var F5e = O0I; F5e += L9E; F5e += Y2t; list_1[F5e](S4N + display + K1y + that[v68][L5T][D9o] + a2B + i + p$y + Q4u); } }); } else { var M57 = X1O; M57 += e1w; M57 += D8P; var q0k = B9f; q0k += t_S; rendered[w2$](q0k + (conf[q2d] || M57) + h3S); } } uploadMany[v9P](conf); conf[T2x][J2D](C9v)[J2i](F_O, [conf[u6H]]); } }); var datatable = $[D6T](o76, {}, baseFieldType, { _addOptions: function (conf, options, append) { var B4X = "ear"; var O$e = "ws"; var U2J = Z1G; U2J += q$k; U2J += q$k; var n7c = k7M; n7c += O$e; a6N60.P01(); if (append === void d4r) { append = L0j; } var dt = conf[B0P]; if (!append) { var K1T = c2T; K1T += M12; K1T += B4X; dt[K1T](); } dt[n7c][U2J](options)[f4d](); }, _jumpToFirst: function (conf, editor) { var P8I = "div.dataTables"; var r2h = "fl"; var L2W = "_scr"; var w2F = "xe"; var M6K = 'applied'; var A4t = "arents"; var i54 = "lBody"; var k8Z = "ows"; var g1h = "oor"; var N3B = "lied"; var u9X = M12; u9X += M_J; u9X += k$f; u9X += l9J; var Z67 = P8I; Z67 += L2W; Z67 += k$3; Z67 += i54; var T5f = E43; T5f += D6S; var n6i = w81; n6i += Y2t; n6i += M_J; n6i += K51; var l1G = Z1G; l1G += Q9T; l1G += N3B; var P1F = k7M; P1F += j3w; var i3h = q$k; i3h += X9Y; var dt = conf[i3h]; var idx = dt[P1F]({ order: l1G, selected: o76 })[n6i](); var page = d4r; if (typeof idx === t4Q) { var x50 = r2h; x50 += g1h; var e7d = i8S; e7d += y6e; e7d += w2F; e7d += U0f; var d9B = I2w; d9B += k8Z; var p0U = p$O; p0U += V2n; p0U += a1c; p0U += c8f; var M8f = m1O; M8f += R6J; var pageLen = dt[M8f][E14]()[p0U]; var pos = dt[d9B]({ order: M6K })[e7d]()[M0m](idx); page = pageLen > d4r ? Math[x50](pos / pageLen) : d4r; } dt[T5f](page)[f4d](L0j); var container = $(Z67, dt[z5g]()[R$J]()); var scrollTo = function () { var g5A = "scrollT"; var P9S = "ppli"; var G4O = V2n; G4O += a6N60[204096]; G4O += q$k; G4O += M_J; var G7X = Z1G; G7X += P9S; G7X += e1N; var p_Q = k7M; p_Q += j3w; var node = dt[p_Q]({ order: G7X, selected: o76 })[G4O](); if (node) { var W9G = r6J; W9G += w81; W9G += b7n; W9G += V2n; var d0h = c8f; d0h += s98; var height = container[d0h](); var top_1 = $(node)[W9G]()[f7b]; if (top_1 > height - S57) { var s1O = g5A; s1O += m2M; container[s1O](top_1); } } }; if (container[u9X]) { var V5m = r4y; V5m += X9Y; V5m += c8f; var p3p = E43; p3p += A4t; if (container[p3p](l0a)[V5m]) { scrollTo(); } else { editor[r44](e21, function () { a6N60.P01(); scrollTo(); }); } } }, create: function (conf) { var F8V = "config"; var Z0Z = '<div class="DTE_Field_Type_datatable_info">'; var b$n = '<tr>'; var e0X = "ipl"; var M50 = 'search'; var L6x = "gl"; var l8$ = "itCompl"; var n0f = "DataTabl"; var n_f = "oo"; var f_i = '<tfoot>'; var M39 = "dT"; var Q2y = "nsPai"; var Y2_ = "select"; var Z_W = "subm"; var O7W = "<tabl"; var L2n = "100"; var B$t = "footer"; var n3k = 'Search'; var D_k = 'info'; var H6x = 'Label'; var y8f = "-"; var a9b = 'fiBtp'; var Y53 = "%"; var d89 = "onfig"; var H3$ = 'init.dt'; var i03 = "tableClass"; var m3s = "ging"; var t0B = '2'; var l_M = "ppend"; var o5o = "user"; var z0O = "e>"; var p$3 = q2p; p$3 += R31; var A3J = o5o; A3J += y8f; A3J += Y2_; var c5M = a6N60[204096]; c5M += V2n; var W_s = a6N60[204096]; W_s += V2n; var f1b = c2T; f1b += p$p; f1b += l04; f1b += K3b; var h1j = h3d; h1j += L6x; h1j += M_J; var W0i = a6N60[204096]; W0i += U0f; var l2h = N3F; l2h += X9Y; l2h += e0X; l2h += M_J; var v$M = E43; v$M += Z1G; v$M += m3s; var M41 = i8S; M41 += a6N60.w1W; M41 += a6N60[204096]; var r69 = w_k; r69 += m8u; var v5d = m2M; v5d += b7n; v5d += Q2y; v5d += I2w; var o23 = k3E; o23 += U$I; a6N60.P01(); o23 += Y2t; var r5G = n0f; r5G += M_J; var b1K = L2n; b1K += Y53; var V1E = F1Y; V1E += q$k; V1E += X9Y; V1E += c8f; var A$G = r4y; A$G += l9J; var F$6 = a6N60[83715]; F$6 += a6N60.E4C; F$6 += X9Y; F$6 += C2Q; var D7k = a6N60[83715]; D7k += a6N60.E4C; D7k += X9Y; D7k += C2Q; var B7Q = c2T; B7Q += d89; var Y37 = J3x; Y37 += q$k; var F9y = O7W; F9y += z0O; var R$K = M_J; R$K += K51; R$K += C7A; R$K += q$k; var _this = this; conf[W4K] = $[R$K]({ label: N5y, value: I3P }, conf[W4K]); var table = $(F9y); var container = $(j4I)[Y37](table); var side = $(Z0Z); var layout = DataTable$3[q7z](t0B); if (conf[B$t]) { var s57 = i3r; s57 += P3y; s57 += M39; s57 += a6N60[204096]; var F35 = a6N60.w1W; F35 += n_f; F35 += P9v; var Q_b = r9R; Q_b += a6N60[204096]; Q_b += X9Y; Q_b += a6N60.V56; var M56 = Z1G; M56 += l_M; $(f_i)[M56](Array[B1R](conf[Q_b]) ? $(b$n)[w2$]($[M74](conf[B$t], function (str) { var w3w = W74; w3w += A4V; var k2t = B9f; k2t += l9J; k2t += O1E; return $(k2t)[w3w](str); })) : conf[F35])[s57](table); } var hasButtons = conf[F8V] && conf[B7Q][D7k] && conf[F8V][F$6][A$G]; var dt = table[s9J](datatable[i03])[V1E](b1K)[p$p](H3$, function (e, settings) { var S40 = "init"; var D3L = "lec"; var b3R = 'div.dt-search'; var Y69 = 'div.dataTables_info'; var r6T = "dt-inf"; var L9w = 'div.dt-buttons'; var c8d = 'div.dataTables_filter'; var e78 = "Tab"; var s9_ = a6N60.w1W; s9_ += i8S; s9_ += q$k; var P2C = i3r; P2C += P3y; P2C += q$k; var j$k = z6Y; j$k += r6T; j$k += a6N60[204096]; var q2g = R6I; q2g += Y2t; var A_y = R6I; A_y += Y2t; var U89 = C$2; U89 += D3L; U89 += X9Y; var g6F = V2n; g6F += e78; g6F += p$O; if (settings[g6F] !== table[d4r]) { return; } var api = new DataTable$3[c8Q](settings); var containerNode = $(api[z5g](undefined)[R$J]()); DataTable$3[U89][S40](api); side[w2$](containerNode[J2D](b3R))[A_y](containerNode[J2D](c8d))[q2g](containerNode[J2D](L9w))[w2$](containerNode[J2D](j$k))[P2C](containerNode[s9_](Y69)); })[r5G]($[o23]({ buttons: [], columns: [{ data: conf[v5d][C6D], title: H6x }], deferRender: o76, dom: layout ? y8F : a9b, language: { paginate: { next: c9y, previous: V$N }, search: q2P, searchPlaceholder: n3k }, layout: layout ? { top: hasButtons ? [M50, r69, M41] : [M50, D_k], bottom: [v$M], bottomStart: y8F, bottomEnd: y8F, topStart: y8F, topEnd: y8F } : y8F, lengthChange: L0j, select: { style: conf[l2h] ? W0i : h1j } }, conf[f1b])); this[W_s](e21, function () { var N25 = "adjust"; var i2i = "arch"; var u2$ = "lumns"; var C_W = c2T; C_W += a6N60[204096]; C_W += u2$; var W_5 = C$2; W_5 += i2i; if (dt[W_5]()) { var b1T = U0f; b1T += b7P; dt[b1T](q2P)[f4d](); } dt[C_W][N25](); }); dt[c5M](A3J, function () { a6N60.P01(); var r99 = X9Y; r99 += Z1G; r99 += Q4a; r99 += M_J; _triggerChange($(conf[B0P][r99]()[R$J]())); }); if (conf[a6w]) { var s8$ = Z_W; s8$ += l8$; s8$ += M_J; s8$ += U$I; conf[a6w][z5g](dt); conf[a6w][p$p](s8$, function (e, json, data, action) { var l9x = 'refresh'; var P8q = "_jumpToFirst"; var h_B = e1N; h_B += C03; if (action === e9f) { var g3j = q$k; g3j += Q1N; g3j += Z1G; var _loop_1 = function (dp) { var G2Y = U0f; G2Y += S3z; G2Y += a6N60[549383]; dt[s0w](function (idx, d) { return d === dp; })[G2Y](); }; for (var _i = d4r, _a = json[g3j]; _i < _a[A82]; _i++) { var dp = _a[_i]; _loop_1(dp); } } else if (action === h_B || action === w0q) { _this[B8O](l9x); } datatable[P8q](conf, _this); }); } conf[B0P] = dt; datatable[p$3](conf, conf[l3z] || []); return { input: container, side: side }; }, disable: function (conf) { var X0j = "ele"; var j6C = 'api'; var z7j = "tyl"; var E7S = U0f; E7S += z7j; E7S += M_J; var v7i = U0f; v7i += X0j; v7i += U75; conf[B0P][v7i][E7S](j6C); conf[B0P][u8E]()[R$J]()[x35](A6m, y0x); }, dt: function (conf) { return conf[B0P]; }, enable: function (conf) { var S1l = "tiple"; var a2l = 'os'; var a9Y = "styl"; var e0Q = P$W; e0Q += Q3u; var T8c = h3d; T8c += K3b; T8c += p$O; var x54 = N3F; x54 += S1l; var k10 = a9Y; k10 += M_J; var p6c = C$2; a6N60.P01(); p6c += p$O; p6c += U75; var g5a = q$k; g5a += X9Y; conf[g5a][p6c][k10](conf[x54] ? a2l : T8c); conf[B0P][u8E]()[R$J]()[x35](A6m, e0Q); }, get: function (conf) { var b_b = "nsPair"; var n6L = "uck"; var t1P = o8K; t1P += w$y; t1P += E43; t1P += p$O; var M5j = I6s; M5j += P_C; M5j += X3J; var o5i = m2M; o5i += X9Y; o5i += P3F; o5i += b_b; var v1W = k3T; v1W += n6L; var U3d = I2w; U3d += a6N60[204096]; U3d += j3w; U3d += U0f; var rows = conf[B0P][U3d]({ selected: o76 })[Z6V]()[v1W](conf[o5i][g_h])[M5j](); return conf[T8F] || !conf[t1P] ? rows[H_a](conf[T8F] || R0I) : rows; }, set: function (conf, val, localUpdate) { var N13 = "sepa"; var b9g = "sel"; var q9a = "_jump"; var A8W = "selec"; var h3W = "To"; var A11 = "First"; var h0y = "Pair"; var Q2s = "iner"; a6N60.P01(); var W47 = q9a; W47 += h3W; W47 += A11; var A8R = b9g; A8R += M_J; A8R += U75; var F$a = I2w; F$a += a6N60[204096]; F$a += j3w; F$a += U0f; var U8p = q$k; U8p += X9Y; var F95 = q$k; F95 += M_J; F95 += A8W; F95 += X9Y; var u_3 = I2w; u_3 += a6N60[204096]; u_3 += j3w; u_3 += U0f; var c5c = q_e; c5c += z8R; var J6w = l3z; J6w += h0y; if (conf[q3s] && conf[T8F] && !Array[B1R](val)) { var n09 = N13; n09 += I2w; n09 += Z1G; n09 += N5b; val = typeof val === n1a ? val[Z11](conf[n09]) : []; } else if (!Array[B1R](val)) { val = [val]; } var valueFn = dataGet(conf[J6w][c5c]); conf[B0P][u_3]({ selected: o76 })[F95](); conf[U8p][F$a](function (idx, data, node) { a6N60.g4A(); return val[M0m](valueFn(data)) !== -J32; })[A8R](); datatable[W47](conf, this); if (!localUpdate) { var D8k = W25; D8k += V2n; D8k += i1c; D8k += Q2s; _triggerChange($(conf[B0P][z5g]()[D8k]())); } }, tableClass: q2P, update: function (conf, options, append) { var a6p = "ntainer"; var T5d = "dd"; var n9A = W25; n9A += a6p; var v4A = q$k; v4A += X9Y; var l1s = j8u; l1s += T5d; l1s += b3K; l1s += m8u; datatable[l1s](conf, options, append); var lastSet = conf[O0T]; if (lastSet !== undefined) { datatable[N9h](conf, lastSet, o76); } _triggerChange($(conf[v4A][z5g]()[n9A]())); } }); var defaults = { className: q2P, compare: y8F, data: q2P, def: q2P, entityDecode: o76, fieldInfo: q2P, getFormatter: y8F, id: q2P, label: q2P, labelInfo: q2P, message: q2P, multiEditable: o76, name: y8F, nullDefault: L0j, setFormatter: y8F, submit: o76, type: M2c }; var DataTable$2 = $[T7I][U0X]; var Field = (function () { var H8Y = a6N60; var A6j = "ers"; var a5$ = "_multiValue"; var c3M = "enabled"; var l_B = "ulti"; var Y4v = "ototype"; var E5a = "otot"; var m0D = "protot"; var l3O = "disabled"; var Z2B = "oto"; var A3Y = "fau"; var Y0W = "multiIds"; var R_M = "ec"; var m3m = "_errorNode"; var k2G = "multiRestore"; var D67 = "show"; var X43 = "fieldInfo"; var E3r = "_format"; var a1o = "sl"; var i7j = "cs"; var u5G = "rototype"; var b3N = "otype"; var j$o = "labelInfo"; var X9S = "totype"; var I6f = "proto"; var h_$ = "ataSrc"; var y_a = "hos"; var b7G = "host"; var s3s = "_msg"; var d$Q = "ult"; var T6Q = "ototyp"; var I92 = "_typ"; var V58 = "prot"; var E0j = "typ"; var n9E = "yp"; var Z7A = "slideDown"; var D1N = "iI"; var K8m = "Editab"; var o3v = "peFn"; var u34 = "Id"; var e6x = "ontain"; var F9W = "type"; var N$H = "multiValue"; var k6q = "inputControl"; var C_s = "ypeFn"; var P$I = 0.5; var j1p = "_typeFn"; var O$u = "nfoShown"; var J7m = "multiGe"; var d2I = r9R; d2I += r9V; d2I += b5u; d2I += A6j; var g_R = y6e; g_R += A3Y; g_R += M12; g_R += j1W; var a2R = E43; a2R += I2w; a2R += a6N60[204096]; a2R += X9S; var Y9G = I6f; Y9G += F9W; var d_8 = R4N; d_8 += X9Y; d_8 += C_s; var b9t = m0D; b9t += n9E; b9t += M_J; var s2t = a5$; s2t += R9b; s2t += R_M; s2t += o8e; var N9O = I6f; N9O += V3Y; N9O += L9E; var G5q = R4N; G5q += U6y; G5q += U0f; G5q += K3b; var s9r = a0_; s9r += Z2B; s9r += F9W; var V6x = v41; V6x += D1N; V6x += O$u; var B5Y = a0_; B5Y += Y4v; var B8V = P35; B8V += K8m; B8V += p$O; var K$L = q$k; K$L += h_$; var Q8j = a0_; Q8j += T6Q; Q8j += M_J; var y7h = m0D; y7h += d$3; var N3w = a6N60.E4C; N3w += U2E; var l1f = a0_; l1f += Y4v; var S3e = Y4M; S3e += X9Y; S3e += b3N; var J4i = U0f; J4i += M_J; J4i += X9Y; var g_u = E43; g_u += I2w; g_u += Y4v; var J3n = C5H; J3n += K3b; var c1i = E43; c1i += I2w; c1i += Y4v; var r4l = E43; r4l += u5G; var e$f = m0D; e$f += d$3; var O9T = V58; O9T += z60; O9T += L9E; var N7t = a0_; N7t += j4T; N7t += E43; N7t += M_J; var r37 = J7m; r37 += X9Y; var K02 = m0D; K02 += d$3; var C_M = d3p; C_M += O1$; C_M += R6J; var a$2 = a0_; a$2 += E5a; a$2 += d$3; var e17 = I6f; e17 += V3Y; e17 += E43; e17 += M_J; var R7r = Y4M; R7r += T0c; R7r += d$3; var L4O = V58; L4O += b3N; var R0Z = a0_; R0Z += Z2B; R0Z += X9Y; R0Z += d$3; var W$T = x1v; W$T += q$k; W$T += d9D; W$T += r9R; var m73 = U6D; m73 += a6N60[204096]; m73 += I2w; var x8D = I6f; x8D += F9W; var J$Z = I6f; J$Z += E0j; J$Z += M_J; var N8T = N6r; N8T += e1N; var W$Q = B8P; W$Q += i05; W$Q += p$O; var O5J = a0_; O5J += L8l; O5J += a6N60[204096]; O5J += F9W; function Field(options, classes, host) { var N23 = "ield-p"; var i5V = "nf"; var O$4 = 'msg-message'; var Q1p = "<div data-dte-e=\"ms"; var h$X = "Valu"; var N_r = "span></span"; var X4N = "abe"; var W1_ = 'msg-multi'; var F$7 = "ultiI"; var f9I = 'msg-label'; var z4E = "></div>"; var j6f = "msg"; var E_F = '<div data-dte-e="input-control" class="'; var p92 = "n>"; var r$f = "alI"; var p8E = '<div data-dte-e="msg-multi" class="'; var x9z = "v data-dte-e=\""; var I0j = "\" class="; var O8C = "rocessing"; var I$U = "<labe"; var W92 = "\"msg-message\" class=\""; var k1z = "el>"; var J4c = "namePr"; var s8W = "multi-info\" class=\""; var f0X = "side"; var N2c = "msg-"; var d1m = "lass=\""; var F0Q = "alTo"; var R62 = "te-e=\"msg-error\" cl"; var q2F = "lI"; var F$W = 'multi-value'; var J49 = "dding field - unknown field type "; var u$2 = "estor"; var R1T = "tiRestor"; var Q8a = '<div data-dte-e="field-processing" class="'; var Y10 = "<div data-dte-e="; var F7B = "-er"; var h$6 = 'DTE_Field_'; var j3c = "\"></div"; var e7Z = "typePrefix"; var t1Q = "t-contr"; var W96 = "efix"; var d9G = " c"; var m2g = "18n"; var y_Q = 'msg-error'; var K6h = "g-label"; var j2y = "<div data-dte-e=\"msg-info\""; var t5R = "valFromData"; var O6T = "input\""; var Q2P = "defaults"; var f1C = '<div data-dte-e="multi-value" class="'; var y82 = '" for="'; var A_H = "</s"; var j0W = "ultiRetu"; var R3y = 'msg-info'; var e$u = "multi-i"; var y$Z = "l data-dte-e=\"lab"; var A9e = "sName"; var b6i = "<span data-dte-e=\""; var r4C = "t-control"; var c2E = "el\" class="; var Z8V = X9Y; Z8V += a6N60.b_J; Z8V += E43; Z8V += M_J; var n9n = M_J; n9n += Z1G; n9n += c2T; n9n += c8f; var G21 = c2T; G21 += B9m; G21 += c2T; G21 += o8e; var r5f = a6N60[204096]; r5f += V2n; var A3l = U6y; A3l += j0W; A3l += v9R; var m91 = c2T; m91 += B9m; m91 += c2T; m91 += o8e; var D85 = N3F; D85 += J5t; var l5f = a6N60.w1W; l5f += N23; l5f += O8C; var b8E = e$u; b8E += i5V; b8E += a6N60[204096]; var C1z = N2c; C1z += A2Y; C1z += M_J; C1z += M12; var s$k = i3r; s$k += M_J; s$k += V2n; s$k += q$k; var J4T = M12; J4T += i05; J4T += S3z; var r2V = w81; r2V += V2n; r2V += F4X; r2V += r4C; var d7L = N2c; d7L += Y1w; d7L += b1F; d7L += D6S; var W5o = N2c; W5o += i8S; W5o += r9R; var v4j = j6f; v4j += F7B; v4j += s2g; var G2o = I92; G2o += z5T; var J92 = j1Q; J92 += N_r; J92 += z4E; var z0A = K9v; z0A += O1E; var g5L = j2y; g5L += d9G; g5L += d1m; var X9F = B1W; X9F += R6J; var V8O = K9v; V8O += O1E; var S3_ = Y10; S3_ += W92; var P_v = j3c; P_v += O1E; var q$f = w_H; q$f += R62; q$f += Y1k; var P2m = B9f; P2m += z$m; var q8t = I2w; q8t += u$2; q8t += M_J; var y5d = N3F; y5d += R1T; y5d += M_J; var a4M = A_H; a4M += m1O; a4M += p92; var K4c = U6y; K4c += F$7; K4c += i5V; K4c += a6N60[204096]; var U7X = b6i; U7X += s8W; var H$o = P35; H$o += h$X; H$o += M_J; var f46 = w81; f46 += V2n; f46 += E43; f46 += m4k; var D7L = B58; D7L += x9z; D7L += O6T; D7L += s19; var a_U = T8z; a_U += A2Y; a_U += k1z; var l$K = M12; l$K += X4N; l$K += q2F; l$K += z_q; var O1N = K9v; O1N += O1E; var e6T = Q1p; e6T += K6h; e6T += I0j; e6T += K9v; var Z5K = K9v; Z5K += O1E; var u1X = w81; u1X += q$k; var m_v = U0f; m_v += s3g; m_v += M_J; m_v += u34; var W$U = I$U; W$U += y$Z; W$U += c2E; W$U += K9v; var D15 = K9v; D15 += O1E; var Z9b = X6$; Z9b += U0f; Z9b += A9e; var c1$ = K$l; c1$ += U6y; c1$ += M_J; var E7x = J4c; E7x += W96; var i5U = j3w; i5U += D$i; i5U += Q9T; i5U += a6N60.V56; var u4X = h46; u4X += i1c; var J2H = R0n; J2H += F0Q; J2H += p4h; J2H += E_W; var u7V = w81; u7V += q$k; var U0a = V3Y; U0a += L9E; var L_j = V2n; L_j += Z1G; L_j += U6y; L_j += M_J; var t1z = X9Y; t1z += a6N60.b_J; t1z += E43; t1z += M_J; var v1a = o8K; v1a += w$y; var m0b = L9Y; m0b += V2n; m0b += r$f; m0b += m2g; var that = this; var multiI18n = host[m0b]()[v1a]; var opts = $[f_z](o76, {}, Field[Q2P], options); if (!Editor[Y3E][opts[t1z]]) { var f9z = X9Y; f9z += d$3; var e79 = a1$; e79 += J49; throw new Error(e79 + opts[f9z]); } this[U0f] = { classes: classes, host: host, multiIds: [], multiValue: L0j, multiValues: {}, name: opts[L_j], opts: opts, processing: L0j, type: Editor[Y3E][opts[U0a]] }; if (!opts[u7V]) { opts[C8o] = (h$6 + opts[F5b])[k2r](/ /g, z1y); } if (opts[Z6V] === q2P) { var I1c = V2n; I1c += Z1G; I1c += Y1w; var D8R = q$k; D8R += Z1G; D8R += X9Y; D8R += Z1G; opts[D8R] = opts[I1c]; } this[t5R] = function (d) { var r5i = M_J; r5i += q$k; r5i += C03; r5i += T8R; return dataGet(opts[Z6V])(d, r5i); }; this[J2H] = dataSet(opts[u4X]); var template = $(F$O + classes[i5U] + v9H + classes[e7Z] + opts[F9W] + v9H + classes[E7x] + opts[c1$] + v9H + opts[Z9b] + D15 + W$U + classes[C6D] + y82 + Editor[m_v](opts[u1X]) + Z5K + opts[C6D] + e6T + classes[f9I] + O1N + opts[l$K] + c2P + a_U + D7L + classes[f46] + Q9K + E_F + classes[k6q] + a1R + f1C + classes[H$o] + Q9K + multiI18n[S1h] + U7X + classes[K4c] + Q9K + multiI18n[E14] + a4M + c2P + p8E + classes[y5d] + Q9K + multiI18n[q8t] + P2m + q$f + classes[y_Q] + P_v + S3_ + classes[O$4] + V8O + opts[X9F] + c2P + g5L + classes[R3y] + z0A + opts[X43] + c2P + c2P + Q8a + classes[i$j] + J92 + c2P); var input = this[G2o](e9f, opts); var side = y8F; if (input && input[f0X]) { var D3B = U0f; D3B += w81; D3B += q$k; D3B += M_J; side = input[D3B]; input = input[O9m]; } if (input !== y8F) { var Y7r = h$h; Y7r += t1Q; Y7r += k$3; el(Y7r, template)[L1v](input); } else { template[x35](A6m, y0x); } this[K6_] = { container: template, fieldError: el(v4j, template), fieldInfo: el(W5o, template), fieldMessage: el(d7L, template), inputControl: el(r2V, template), label: el(J4T, template)[s$k](side), labelInfo: el(C1z, template), multi: el(F$W, template), multiInfo: el(b8E, template), multiReturn: el(W1_, template), processing: el(l5f, template) }; this[K6_][D85][p$p](m91, function () { var a2T = E0j; a2T += M_J; var W71 = m2M; W71 += X9Y; W71 += U0f; if (that[U0f][W71][Y5S] && !template[q4w](classes[l3O]) && opts[a2T] !== W2j) { that[r8Z](q2P); that[T0s](); } }); this[K6_][A3l][r5f](G21, function () { H8Y.g4A(); that[k2G](); }); $[n9n](this[U0f][Z8V], function (name, fn) { H8Y.P01(); if (typeof fn === a6N60[280451] && that[name] === undefined) { that[name] = function () { var v4D = "Fn"; var h6q = "if"; var V_g = "ice"; var o8f = "ply"; var C1y = O0I; C1y += o8f; var d4H = v6A; d4H += a6N60.b_J; d4H += L9E; d4H += v4D; var u3r = l2M; u3r += x4d; u3r += h6q; u3r += X9Y; H8Y.P01(); var f0M = U0f; f0M += M12; f0M += V_g; var args = Array[c$a][f0M][T66](arguments); args[u3r](name); var ret = that[d4H][C1y](that, args); return ret === undefined ? that : ret; }; } }); } Field[O5J][t1Y] = function (set) { var q35 = "defau"; var q_U = q$k; q_U += M_J; q_U += a6N60.w1W; var k0d = a6N60[204096]; k0d += w$O; k0d += U0f; var opts = this[U0f][k0d]; if (set === undefined) { var f3m = q35; f3m += M12; f3m += X9Y; var b6K = y6e; b6K += C1X; b6K += a6N60.E4C; b6K += r4q; var def = opts[b6K] !== undefined ? opts[f3m] : opts[t1Y]; return typeof def === a6N60[280451] ? def() : def; } opts[q_U] = set; return this; }; Field[c$a][W$Q] = function () { var G_m = "lasses"; var y9a = q$k; y9a += w81; y9a += b5h; var X_4 = I92; X_4 += z5T; var C08 = c2T; C08 += G_m; this[K6_][R$J][s9J](this[U0f][C08][l3O]); this[X_4](y9a); return this; }; Field[c$a][N8T] = function () { var w5t = B8P; w5t += x8O; var C6J = r4y; C6J += l9J; var A0u = w$j; A0u += V2n; A0u += X9Y; A0u += U0f; var D0E = c2T; D0E += e6x; D0E += a6N60.V56; var container = this[K6_][D0E]; return container[A0u](l0a)[C6J] && container[x35](w5t) !== y0x ? o76 : L0j; }; Field[J$Z][V1F] = function (toggle) { var H7N = "ena"; var l8x = "sses"; var S41 = H7N; S41 += t_C; var I3q = B8P; I3q += Z1G; I3q += J4n; var I6u = X6$; I6u += l8x; var a$l = c2T; a$l += e6x; a$l += M_J; a$l += I2w; if (toggle === void d4r) { toggle = o76; } if (toggle === L0j) { return this[d5k](); } this[K6_][a$l][H4A](this[U0f][I6u][I3q]); this[j1p](S41); return this; }; Field[c$a][c3M] = function () { var o5m = "classe"; var U8v = "sabled"; var a4u = "aine"; var r4s = "ont"; var R6w = q$k; R6w += w81; R6w += U8v; var R8k = o5m; R8k += U0f; var s1T = c8f; s1T += a9T; s1T += j2q; s1T += R9k; var U8F = c2T; U8F += r4s; U8F += a4u; U8F += I2w; var h7I = q$k; h7I += a6N60[204096]; h7I += U6y; return this[h7I][U8F][s1T](this[U0f][R8k][R6w]) === L0j; }; Field[x8D][m73] = function (msg, fn) { var u0A = "peF"; var T8e = "erro"; var b7Q = "dCl"; var W6Y = "rM"; var A0a = "rror"; var q9x = "fieldError"; var C8H = "essage"; var A3r = q$k; A3r += a6N60[204096]; A3r += U6y; var z2a = T8e; z2a += W6Y; z2a += C8H; var O5O = v6A; O5O += a6N60.b_J; O5O += u0A; O5O += V2n; var classes = this[U0f][v68]; if (msg) { var N3P = M_J; N3P += A0a; var I0U = b2v; I0U += b7Q; I0U += G2j; var x_t = i2D; x_t += i1c; x_t += w81; x_t += i$v; this[K6_][x_t][I0U](classes[N3P]); } else { var z5D = M_J; z5D += I2w; z5D += k7M; z5D += I2w; var b5X = q$k; b5X += J6h; this[b5X][R$J][H4A](classes[z5D]); } this[O5O](z2a, msg); return this[s3s](this[A3r][q9x], msg, fn); }; Field[c$a][W$T] = function (msg) { var x1B = "_m"; var f8I = "sg"; var Q51 = R9e; Q51 += U6y; var p_7 = x1B; p_7 += f8I; return this[p_7](this[Q51][X43], msg); }; Field[R0Z][c6E] = function () { H8Y.g4A(); return this[U0f][N$H] && this[U0f][Y0W][A82] !== J32; }; Field[L4O][T_9] = function () { var T_n = S$Q; T_n += Z1G; T_n += z$F; T_n += U0f; var V9I = c8f; V9I += f1i; V9I += b1F; var x3k = q$k; x3k += a6N60[204096]; x3k += U6y; return this[x3k][R$J][V9I](this[U0f][T_n][H1B]); }; Field[c$a][O9m] = function () { var m3S = "input, select, textare"; var T3N = "tai"; H8Y.g4A(); var M$1 = i2D; M$1 += T3N; M$1 += i$v; var o7P = q$k; o7P += a6N60[204096]; o7P += U6y; var M5O = m3S; M5O += Z1G; var a7G = v6A; a7G += a6N60.b_J; a7G += o3v; var H$O = w81; H$O += V2n; H$O += N$U; return this[U0f][F9W][H$O] ? this[a7G](C9v) : $(M5O, this[o7P][M$1]); }; Field[R7r][T0s] = function () { var n$h = "input,"; var M7d = "ontainer"; var O6F = "focu"; var z3_ = ", textarea"; var G0k = "elect"; var k42 = a6N60.w1W; k42 += j9q; var i4Y = E0j; i4Y += M_J; if (this[U0f][i4Y][k42]) { this[j1p](B69); } else { var o6s = O6F; o6s += U0f; var x6Z = c2T; x6Z += M7d; var k5x = q$k; k5x += J6h; var c6M = n$h; c6M += S26; c6M += G0k; c6M += z3_; $(c6M, this[k5x][x6Z])[o6s](); } return this; }; Field[c$a][l1t] = function () { var U4V = "mat"; var S_c = 'get'; var f7z = "getFormatter"; var N3X = "sMultiValue"; var P_Z = a6N60[204096]; P_Z += E43; P_Z += X9Y; P_Z += U0f; var d5n = R4N; d5n += V3Y; d5n += o3v; var y7m = R4N; y7m += x$f; H8Y.P01(); y7m += U4V; var v37 = w81; v37 += N3X; if (this[v37]()) { return undefined; } return this[y7m](this[d5n](S_c), this[U0f][P_Z][f7z]); }; Field[c$a][H97] = function (animate) { var y_4 = "ho"; var z8$ = "eUp"; var t_T = "ideUp"; var F4f = "contain"; var m6l = "slid"; var w6t = a1o; w6t += t_T; var Y$L = a6N60.w1W; Y$L += V2n; var H5K = B8P; H5K += k3T; H5K += o_F; var m9J = y_4; m9J += U0f; H8Y.P01(); m9J += X9Y; var d5W = c2T; d5W += b1F; var w7H = y_a; w7H += X9Y; var t2j = F4f; t2j += a6N60.V56; var el = this[K6_][t2j]; var opacity = parseFloat($(this[U0f][w7H][A5$]())[d5W](v$D)); if (animate === undefined) { animate = o76; } if (this[U0f][m9J][H5K]() && opacity > P$I && animate && $[Y$L][w6t]) { var Z6P = m6l; Z6P += z8$; el[Z6P](); } else { var f78 = H2l; f78 += T4I; var Q5$ = c2T; Q5$ += b1F; el[Q5$](f78, y0x); } return this; }; Field[e17][C6D] = function (str) { var E5_ = "Info"; var W9E = "abel"; var p6M = "tac"; var H6z = R6I; H6z += Y2t; var W6f = y6e; H8Y.P01(); W6f += p6M; W6f += c8f; var C2b = f$v; C2b += a6N60[83715]; C2b += S3z; C2b += E5_; var l0B = M12; l0B += W9E; var label = this[K6_][l0B]; var labelInfo = this[K6_][C2b][W6f](); if (str === undefined) { return label[A$1](); } label[A$1](str); label[H6z](labelInfo); return this; }; Field[c$a][j$o] = function (msg) { var H2X = "abelInf"; var p35 = M12; p35 += H2X; p35 += a6N60[204096]; var q5i = q$k; q5i += J6h; return this[s3s](this[q5i][p35], msg); }; Field[a$2][C_M] = function (msg, fn) { var r14 = "fieldMessage"; return this[s3s](this[K6_][r14], msg, fn); }; H8Y.P01(); Field[K02][r37] = function (id) { var U6k = "isMultiValu"; var u6h = "ultiValues"; var v24 = U6k; v24 += M_J; var B7x = U6y; B7x += u6h; var value; var multiValues = this[U0f][B7x]; var multiIds = this[U0f][Y0W]; var isMultiValue = this[v24](); if (id === undefined) { var t2N = R0n; t2N += Z1G; t2N += M12; var fieldVal = this[t2N](); value = {}; for (var _i = d4r, multiIds_1 = multiIds; _i < multiIds_1[A82]; _i++) { var multiId = multiIds_1[_i]; value[multiId] = isMultiValue ? multiValues[multiId] : fieldVal; } } else if (isMultiValue) { value = multiValues[id]; } else { value = this[r8Z](); } H8Y.g4A(); return value; }; Field[N7t][k2G] = function () { var Q2C = "_multiValueChec"; var S2J = "Val"; var w1$ = Q2C; w1$ += o8e; var R2u = P35; R2u += S2J; R2u += E_A; this[U0f][R2u] = o76; H8Y.P01(); this[w1$](); }; Field[O9T][S3F] = function (id, val, recalc) { var F4t = "ltiVal"; var E2w = "multiValues"; var I65 = "ainObje"; var A2a = "Check"; var l6J = U6y; l6J += a6N60.E4C; l6J += F4t; l6J += E_A; var w6P = f6h; w6P += M12; w6P += I65; w6P += U75; if (recalc === void d4r) { recalc = o76; } var that = this; var multiValues = this[U0f][E2w]; var multiIds = this[U0f][Y0W]; if (val === undefined) { val = id; id = undefined; } var set = function (idSrc, valIn) { var r3b = "rma"; var c3F = "setFormatter"; var L0l = Q4p; L0l += a6N60[204096]; L0l += r3b; L0l += X9Y; if ($[J5n](idSrc, multiIds) === -J32) { var E96 = E43; E96 += D4m; E96 += c8f; multiIds[E96](idSrc); } multiValues[idSrc] = that[L0l](valIn, that[U0f][Z3g][c3F]); }; if ($[w6P](val) && id === undefined) { var e4N = E7m; e4N += c2T; e4N += c8f; $[e4N](val, function (idSrc, innerVal) { set(idSrc, innerVal); }); } else if (id === undefined) { var P8A = t_e; P8A += c8f; $[P8A](multiIds, function (i, idSrc) { H8Y.P01(); set(idSrc, val); }); } else { set(id, val); } this[U0f][l6J] = o76; if (recalc) { var L0C = a5$; L0C += A2a; this[L0C](); } return this; }; Field[e$f][F5b] = function () { return this[U0f][Z3g][F5b]; }; Field[r4l][H$p] = function () { var X8H = "ontai"; var j2u = c2T; j2u += X8H; j2u += U4W; j2u += I2w; var z8T = q$k; z8T += J6h; return this[z8T][j2u][d4r]; }; Field[c$a][z3m] = function () { var f5y = "nu"; var j8H = "llDefa"; H8Y.g4A(); var n_z = f5y; n_z += j8H; n_z += d$Q; var U_N = m2M; U_N += X9Y; U_N += U0f; return this[U0f][U_N][n_z]; }; Field[c1i][J3n] = function (set) { var G80 = "rocessing-field"; var C8X = "internalEvent"; var w80 = E43; w80 += G80; var d4g = c8f; d4g += a6N60[204096]; d4g += U0f; d4g += X9Y; var o0A = V2n; o0A += p$p; o0A += M_J; var w19 = a6N60[83715]; w19 += M12; w19 += a6N60[204096]; w19 += Q3u; var i9Y = q$k; i9Y += a6N60[204096]; i9Y += U6y; if (set === undefined) { return this[U0f][i$j]; } this[i9Y][i$j][x35](A6m, set ? w19 : o0A); this[U0f][i$j] = set; this[U0f][d4g][C8X](w80, [set]); return this; }; Field[g_u][J4i] = function (val, multiCheck) { var V9D = "tityDec"; var t79 = "tter"; var u3B = "_forma"; var p5o = "tiVa"; var Y42 = P3y; Y42 += V9D; Y42 += d4x; var y5S = a6N60[204096]; y5S += O4D; var U4F = N3F; U4F += p5o; U4F += z8R; if (multiCheck === void d4r) { multiCheck = o76; } var decodeFn = function (d) { var s2u = "pla"; var O2P = '\''; var H3Y = '£'; var h77 = '"'; var b5I = m3r; b5I += s2u; b5I += v43; var t93 = I2w; t93 += M_J; t93 += s2u; t93 += v43; var Q8s = I2w; Q8s += M_J; Q8s += s2u; Q8s += v43; return typeof d !== n1a ? d : d[k2r](/&gt;/g, c9y)[Q8s](/&lt;/g, V$N)[t93](/&amp;/g, q$$)[k2r](/&quot;/g, h77)[b5I](/&#163;/g, H3Y)[k2r](/&#0?39;/g, O2P)[k2r](/&#0?10;/g, O2N); }; this[U0f][U4F] = L0j; var decode = this[U0f][y5S][Y42]; if (decode === undefined || decode === o76) { if (Array[B1R](val)) { for (var i = d4r, ien = val[A82]; i < ien; i++) { val[i] = decodeFn(val[i]); } } else { val = decodeFn(val); } } if (multiCheck === o76) { var Q7Z = C$2; Q7Z += X9Y; var c$6 = a37; c$6 += l3d; c$6 += Z1G; c$6 += t79; var R$H = a6N60[204096]; R$H += E43; R$H += X9Y; R$H += U0f; var K$I = u3B; K$I += X9Y; val = this[K$I](val, this[U0f][R$H][c$6]); this[j1p](Q7Z, val); this[x$5](); } else { var t0D = U0f; t0D += Z9E; var x3Z = v6A; x3Z += a6N60.b_J; x3Z += E43; x3Z += z5T; this[x3Z](t0D, val); } return this; }; Field[S3e][D67] = function (animate, toggle) { var P4p = "yNod"; var V22 = "contai"; var R1J = q$k; R1J += w81; R1J += b15; R1J += o_F; var X2e = c8f; X2e += a6N60[204096]; X2e += U0f; X2e += X9Y; var p$N = a6N60[204096]; p$N += B_x; var v2V = i7j; v2V += U0f; var N2r = F$j; N2r += P4p; N2r += M_J; var B8T = c8f; B8T += a6N60[204096]; B8T += Y9I; var s0j = V22; s0j += i$v; var A$6 = R9e; A$6 += U6y; if (animate === void d4r) { animate = o76; } if (toggle === void d4r) { toggle = o76; } if (toggle === L0j) { return this[H97](animate); } var el = this[A$6][s0j]; var opacity = parseFloat($(this[U0f][B8T][N2r]())[v2V](p$N)); if (this[U0f][X2e][R1J]() && opacity > P$I && animate && $[a6N60.j_z][Z7A]) { el[Z7A](); } else { var m6f = c2T; m6f += U0f; m6f += U0f; el[m6f](A6m, q2P); } return this; }; Field[l1f][N3w] = function (options, append) { var z9q = "update"; var J$G = X9Y; J$G += a6N60.b_J; J$G += E43; J$G += M_J; if (append === void d4r) { append = L0j; } if (this[U0f][J$G][z9q]) { var Z$I = u6G; Z$I += q$k; Z$I += x_i; this[j1p](Z$I, options, append); } return this; }; Field[y7h][r8Z] = function (val) { var G9q = U0f; H8Y.P01(); G9q += Z9E; return val === undefined ? this[l1t]() : this[G9q](val); }; Field[Q8j][v47] = function (value, original) { H8Y.g4A(); var c0j = a6N60[204096]; c0j += E43; c0j += X9Y; c0j += U0f; var compare = this[U0f][c0j][v47] || deepCompare; return compare(value, original); }; Field[c$a][K$L] = function () { var k4O = q$k; k4O += Z1G; H8Y.g4A(); k4O += X9Y; k4O += Z1G; return this[U0f][Z3g][k4O]; }; Field[c$a][k9h] = function () { var X4f = "containe"; var z55 = 'destroy'; var O6W = X4f; O6W += I2w; var u0M = q$k; u0M += a6N60[204096]; u0M += U6y; this[u0M][O6W][r0C](); this[j1p](z55); return this; }; Field[c$a][B8V] = function () { var m3B = a6N60[204096]; m3B += E43; m3B += X9Y; m3B += U0f; return this[U0f][m3B][Y5S]; }; Field[c$a][Y0W] = function () { var w2X = "multiId"; var c6t = w2X; c6t += U0f; return this[U0f][c6t]; }; Field[B5Y][V6x] = function (show) { var I9m = V2n; I9m += p$p; I9m += M_J; var K0H = c2T; K0H += U0f; K0H += U0f; var H_U = U6y; H_U += l_B; H_U += Z_X; H_U += z_q; H8Y.P01(); var V9L = R9e; V9L += U6y; this[V9L][H_U][K0H]({ display: show ? N_3 : I9m }); }; Field[c$a][v3v] = function () { var X7w = "ltiIds"; var R4M = "multiV"; var u9J = "alues"; var f5p = R4M; f5p += u9J; var i6L = o8K; i6L += X7w; this[U0f][i6L] = []; this[U0f][f5p] = {}; }; Field[s9r][y_v] = function () { var H9K = A41; H9K += a6N60[83715]; H9K += I_6; H9K += X9Y; var g6u = a6N60[204096]; g6u += O4D; return this[U0f][g6u][H9K]; }; Field[c$a][G5q] = function (el, msg, fn) { var l_Y = "internalSettings"; H8Y.P01(); var F4p = "slideUp"; var f03 = ":v"; var h$E = a6N60.w1W; h$E += V2n; var m92 = f03; m92 += w81; m92 += F0Y; m92 += t_C; var R0_ = w81; R0_ += U0f; var V2q = a6N60.w1W; V2q += l2M; V2q += c2T; V2q += I6b; if (msg === undefined) { var C35 = c8f; C35 += X9Y; C35 += U6y; C35 += M12; return el[C35](); } if (typeof msg === V2q) { var n4A = X9Y; n4A += Z1G; n4A += a6N60[83715]; n4A += p$O; var G3b = c8f; G3b += a6N60[204096]; G3b += U0f; G3b += X9Y; var editor = this[U0f][G3b]; msg = msg(editor, new DataTable$2[c8Q](editor[l_Y]()[n4A])); } if (el[G8j]()[R0_](m92) && $[h$E][s6E]) { var Y41 = W74; Y41 += A4V; el[Y41](msg); if (msg) { el[Z7A](fn); } else { el[F4p](fn); } } else { var f5o = c2T; f5o += U0f; f5o += U0f; el[A$1](msg || q2P)[f5o](A6m, msg ? N_3 : y0x); if (fn) { fn(); } } return this; }; Field[N9O][s2t] = function () { var K9l = "multiNoEdit"; var K54 = "internalMultiInfo"; var j47 = "I18n"; var C5p = "ultiRetur"; var P9R = "tiI"; var i3c = "iValues"; var N7p = "tog"; var u8D = "oc"; var X8T = N7p; X8T += K9L; X8T += A$Y; var r4v = U6y; r4v += a6N60.E4C; r4v += r4q; r4v += w81; var b1r = q$k; b1r += a6N60[204096]; b1r += U6y; var Z8n = V2n; Z8n += a6N60[204096]; Z8n += D6J; var N17 = w81; N17 += V2n; N17 += a6N60.w1W; N17 += a6N60[204096]; var C_1 = N3F; C_1 += P9R; C_1 += z_q; var w95 = q$k; w95 += J6h; var D_6 = i8S; D_6 += X9Y; D_6 += S1P; D_6 += j47; var K5W = V2n; K5W += a6N60[204096]; H8Y.P01(); K5W += V2n; K5W += M_J; var A$h = U6y; A$h += C5p; A$h += V2n; var u_O = a6N60[204096]; u_O += E43; u_O += X9Y; u_O += U0f; var p40 = U6y; p40 += d$Q; p40 += i3c; var h03 = U6y; h03 += l_B; h03 += u34; h03 += U0f; var last; var ids = this[U0f][h03]; var values = this[U0f][p40]; var isMultiValue = this[U0f][N$H]; var isMultiEditable = this[U0f][u_O][Y5S]; var val; var different = L0j; if (ids) { for (var i = d4r; i < ids[A82]; i++) { val = values[ids[i]]; if (i > d4r && !deepCompare(val, last)) { different = o76; break; } last = val; } } if (different && isMultiValue || !isMultiEditable && this[c6E]()) { var K8B = a6N60[83715]; K8B += M12; K8B += u8D; K8B += o8e; var w6g = i7j; w6g += U0f; var h$5 = V2n; h$5 += a6N60[204096]; h$5 += V2n; h$5 += M_J; var e1Y = q$k; e1Y += a6N60[204096]; e1Y += U6y; this[e1Y][k6q][x35]({ display: h$5 }); this[K6_][P35][w6g]({ display: K8B }); } else { var L19 = F6h; L19 += U4W; var E0O = c2T; E0O += U0f; E0O += U0f; var R9q = o8K; R9q += w$y; var C2K = q$k; C2K += a6N60[204096]; C2K += U6y; var L9g = a6N60[83715]; L9g += M12; L9g += a6N60[204096]; L9g += Q3u; var T3v = R9e; T3v += U6y; this[T3v][k6q][x35]({ display: L9g }); this[C2K][R9q][E0O]({ display: L19 }); if (isMultiValue && !different) { var t5X = U0f; t5X += M_J; t5X += X9Y; this[t5X](last, L0j); } } this[K6_][A$h][x35]({ display: ids && ids[A82] > J32 && different && !isMultiValue ? N_3 : K5W }); var i18n = this[U0f][b7G][D_6]()[P35]; this[w95][C_1][A$1](isMultiEditable ? i18n[N17] : i18n[Z8n]); this[b1r][r4v][X8T](this[U0f][v68][K9l], !isMultiEditable); this[U0f][b7G][K54](); return o76; }; Field[b9t][d_8] = function (name) { var T5h = X9Y; T5h += a6N60.b_J; T5h += E43; T5h += M_J; var m_I = M12; m_I += P3y; m_I += a1c; m_I += c8f; var args = []; for (var _i = J32; _i < arguments[m_I]; _i++) { args[_i - J32] = arguments[_i]; } args[I3u](this[U0f][Z3g]); var fn = this[U0f][T5h][name]; if (fn) { var h1r = y_a; h1r += X9Y; return fn[h6$](this[U0f][h1r], args); } }; Field[Y9G][m3m] = function () { var Z4b = "dEr"; H8Y.g4A(); var F3E = x1v; F3E += Z4b; F3E += s2g; return this[K6_][F3E]; }; Field[a2R][E3r] = function (val, formatter) { var s8R = "sArray"; var l4p = "shift"; var I4K = "ormatters"; if (formatter) { var l0Q = c2T; l0Q += Z1G; l0Q += L0_; var p0s = w81; p0s += s8R; if (Array[p0s](formatter)) { var B6j = a6N60.w1W; B6j += I4K; var G_v = a1o; G_v += w81; G_v += c2T; G_v += M_J; var args = formatter[G_v](); var name_1 = args[l4p](); formatter = Field[B6j][name_1][h6$](this, args); } return formatter[l0Q](this[U0f][b7G], val, this); } return val; }; Field[g_R] = defaults; Field[d2I] = {}; return Field; })(); var button = { action: y8F, className: y8F, tabIndex: d4r, text: y8F }; var displayController = { close: function () { }, init: function () { }, node: function () { }, open: function () { } }; var DataTable$1 = $[a6N60.j_z][a6N60.x3N]; var apiRegister = DataTable$1[V7y][c7H]; function _getInst(api) { var y95 = "ito"; var W$H = "context"; var X2$ = "Ini"; var K1H = i3$; K1H += X9Y; K1H += a6N60[204096]; K1H += I2w; var L$w = M_J; L$w += q$k; a6N60.g4A(); L$w += y95; L$w += I2w; var E9s = a6N60[204096]; E9s += X2$; E9s += X9Y; var ctx = api[W$H][d4r]; return ctx[E9s][L$w] || ctx[K1H]; } function _setBasic(inst, opts, type, plural) { var T1p = '_basic'; var n05 = "ssa"; var C3_ = "tit"; var Q2F = /%d/; var o9n = B1W; o9n += R6J; if (!opts) { opts = {}; } if (opts[u8E] === undefined) { var N2R = a6N60[83715]; N2R += a6N60.E4C; N2R += X9Y; N2R += C2Q; opts[N2R] = T1p; } if (opts[S1h] === undefined) { var B8A = V6c; B8A += V2n; var d21 = C3_; d21 += p$O; opts[d21] = inst[B8A][type][S1h]; } a6N60.P01(); if (opts[o9n] === undefined) { var F2O = I2w; F2O += M_J; F2O += U6y; F2O += u05; if (type === F2O) { var A6$ = U6y; A6$ += z$W; A6$ += D6S; var confirm_1 = inst[i8a][type][N0K]; opts[A6$] = plural !== J32 ? confirm_1[R4N][k2r](Q2F, plural) : confirm_1[K11]; } else { var J1X = U6y; J1X += M_J; J1X += n05; J1X += R6J; opts[J1X] = q2P; } } return opts; } apiRegister(v_c, function () { a6N60.P01(); return _getInst(this); }); apiRegister(V31, function (opts) { var inst = _getInst(this); inst[K_u](_setBasic(inst, opts, e9f)); return this; }); apiRegister(j58, function (opts) { var inst = _getInst(this); inst[T5j](this[d4r][d4r], _setBasic(inst, opts, F3_)); a6N60.g4A(); return this; }); apiRegister(h4b, function (opts) { var W9o = M_J; W9o += H2l; W9o += X9Y; var inst = _getInst(this); inst[W9o](this[d4r], _setBasic(inst, opts, F3_)); return this; }); apiRegister(L4W, function (opts) { var T1J = m3r; T1J += U6y; T1J += a6N60[204096]; T1J += k6O; a6N60.P01(); var inst = _getInst(this); inst[T1J](this[d4r][d4r], _setBasic(inst, opts, w0q, J32)); return this; }); apiRegister(L0T, function (opts) { var K3N = p$O; K3N += c$s; var t65 = m3r; t65 += U6y; t65 += D$q; t65 += M_J; var inst = _getInst(this); inst[r0C](this[d4r], _setBasic(inst, opts, t65, this[d4r][K3N])); return this; }); apiRegister(u_e, function (type, opts) { var s_F = "nl"; if (!type) { type = X83; } else if ($[N0C](type)) { var V5t = w81; V5t += s_F; V5t += i8S; V5t += M_J; opts = type; type = V5t; } _getInst(this)[type](this[d4r][d4r], opts); return this; }); apiRegister(F3J, function (opts) { _getInst(this)[u5D](this[d4r], opts); return this; }); apiRegister(S_f, file); apiRegister(E4g, files); $(document)[p$p](t4b, function (e, ctx, json) { var Y5c = "namespace"; var m0x = q$k; m0x += X9Y; if (e[Y5c] !== m0x) { return; } if (json && json[o7V]) { $[H1T](json[o7V], function (name, filesIn) { var N8j = a6N60.w1W; N8j += w81; N8j += p$O; N8j += U0f; var E_x = k3E; E_x += G8d; var u9n = a6N60.w1W; u9n += w81; u9n += M12; u9n += g3T; if (!Editor[u9n][name]) { Editor[o7V][name] = {}; } $[E_x](Editor[N8j][name], filesIn); }); } }); var _buttons = $[a6N60.j_z][y4k][d$O][u8E]; $[S8u](_buttons, { create: { action: function (e, dt, node, config) { var Y78 = "ditor"; var y3v = "cre"; var m3i = "uttons"; var K5o = "mB"; var J5v = "reO"; var b7h = V6c; b7h += V2n; var a7I = q11; a7I += Z1G; a7I += K3b; a7I += M_J; var w3u = y$D; w3u += v95; var c5B = x$f; c5B += K5o; c5B += m3i; var r_R = i_T; r_R += Y2t; var Q37 = y3v; Q37 += Z1G; Q37 += U$I; a6N60.g4A(); var Q6B = E43; Q6B += J5v; Q6B += L9E; Q6B += V2n; var t8r = a6N60[204096]; t8r += V2n; t8r += M_J; var A8n = E91; A8n += w81; A8n += k$f; var U8E = M_J; U8E += Y78; var that = this; var editor = config[U8E]; this[A8n](o76); editor[t8r](Q6B, function () { a6N60.g4A(); that[i$j](L0j); })[Q37]($[r_R]({ buttons: config[c5B], message: config[e2R] || editor[w3u][K_u][a7I], nest: o76, title: config[Q8g] || editor[b7h][K_u][S1h] }, config[R4e])); }, className: Z$o, editor: y8F, formButtons: { action: function (e) { var g2B = Z4V; g2B += X9Y; this[g2B](); }, text: function (editor) { var v2U = B3z; a6N60.g4A(); v2U += U6y; v2U += w81; v2U += X9Y; var O8F = C8j; O8F += x4Z; O8F += M_J; var F8x = V6c; F8x += V2n; return editor[F8x][O8F][v2U]; } }, formMessage: y8F, formOptions: {}, formTitle: y8F, text: function (dt, node, config) { var w3M = "utton"; var e47 = "s."; var J23 = a6N60[83715]; J23 += w3M; var W_k = w81; W_k += R9j; W_k += o7A; W_k += V2n; var U2e = w_k; U2e += p$p; U2e += e47; U2e += K_u; var w1R = w81; w1R += R9j; w1R += o7A; w1R += V2n; return dt[w1R](U2e, config[a6w][W_k][K_u][J23]); } }, createInline: { action: function (e, dt, node, config) { var p3q = "eCreate"; var k7b = b08; k7b += w81; k7b += V2n; k7b += p3q; config[a6w][k7b](config[x$0], config[R4e]); }, className: m2U, editor: y8F, formButtons: { action: function (e) { var d4T = Z4V; d4T += X9Y; this[d4T](); }, text: function (editor) { return editor[i8a][K_u][g61]; } }, formOptions: {}, position: y0v, text: function (dt, node, config) { var q1B = "buttons.creat"; a6N60.g4A(); var h6z = q1B; h6z += M_J; return dt[i8a](h6z, config[a6w][i8a][K_u][D9o]); } }, edit: { action: function (e, dt, node, config) { var M$D = "formTi"; var v78 = "formButto"; var q9M = "dex"; var H87 = "tle"; var r$y = a6N60.w1W; r$y += l3d; r$y += R31; var H$3 = w81; H$3 += R9j; H$3 += o7A; H$3 += V2n; var N6y = M$D; N6y += H87; var R$k = U6y; R$k += z$W; R$k += R_o; R$k += M_J; var C4w = V6c; C4w += V2n; var J6s = v78; J6s += C1C; var u0P = M_J; u0P += q$k; u0P += w81; u0P += X9Y; var I0a = Y4M; I0a += a15; var x7D = M12; x7D += P3y; x7D += r1L; var y3m = i8S; y3m += q9M; y3m += g3T; var Q79 = j_R; Q79 += k3E; Q79 += g3T; var j9j = k7M; j9j += j3w; j9j += U0f; var that = this; var editor = config[a6w]; var rows = dt[j9j]({ selected: o76 })[Q79](); var columns = dt[s2K]({ selected: o76 })[y3m](); var cells = dt[b17]({ selected: o76 })[r2e](); var items = columns[A82] || cells[x7D] ? { cells: cells, columns: columns, rows: rows } : rows; this[I0a](o76); editor[r44](U_M, function () { var L57 = E43; a6N60.P01(); L57 += I2w; L57 += a6N60[204096]; L57 += a15; that[L57](L0j); })[u0P](items, $[f_z]({ buttons: config[J6s], message: config[e2R] || editor[C4w][T5j][R$k], nest: o76, title: config[N6y] || editor[H$3][T5j][S1h] }, config[r$y])); }, className: r8R, editor: y8F, extend: R9i, formButtons: { action: function (e) { a6N60.g4A(); this[g61](); }, text: function (editor) { var u6S = U0f; u6S += a6N60.E4C; u6S += M0B; u6S += C03; return editor[i8a][T5j][u6S]; } }, formMessage: y8F, formOptions: {}, formTitle: y8F, text: function (dt, node, config) { var A4x = "ons."; var z$c = "tton"; var d2d = g8e; d2d += z$c; var x7c = M_J; a6N60.P01(); x7c += q$k; x7c += w81; x7c += N5b; var X2w = w_k; X2w += A4x; X2w += T5j; return dt[i8a](X2w, config[x7c][i8a][T5j][d2d]); } }, remove: { action: function (e, dt, node, config) { var L8j = "inde"; var M6V = "formButtons"; var C8V = "rmM"; a6N60.P01(); var U_x = "preO"; var Q7i = "rmO"; var Q35 = "essa"; var b7y = a6N60.w1W; b7y += a6N60[204096]; b7y += Q7i; b7y += X4M; var C5U = w81; C5U += R9j; C5U += o7A; C5U += V2n; var N4y = r9R; N4y += C8V; N4y += Q35; N4y += R6J; var I1v = L8j; I1v += K51; I1v += M_J; I1v += U0f; var N2K = m3r; N2K += U6y; N2K += u05; var M3m = U_x; M3m += L8N; var g3y = a6N60[204096]; g3y += V2n; g3y += M_J; var Z35 = E91; Z35 += d2U; var i1w = e1N; i1w += w81; i1w += I6s; i1w += I2w; var that = this; var editor = config[i1w]; this[Z35](o76); editor[g3y](M3m, function () { var K2M = E91; K2M += w81; K2M += k$f; that[K2M](L0j); })[N2K](dt[s0w]({ selected: o76 })[I1v](), $[f_z]({ buttons: config[M6V], message: config[N4y], nest: o76, title: config[Q8g] || editor[C5U][r0C][S1h] }, config[b7y])); }, className: o6a, editor: y8F, extend: y8H, formButtons: { action: function (e) { var z_L = "bmi"; var G_$ = U0f; G_$ += a6N60.E4C; G_$ += z_L; a6N60.g4A(); G_$ += X9Y; this[G_$](); }, text: function (editor) { var E06 = "remov"; var i4l = "18"; var r8C = E06; r8C += M_J; var q9z = w81; q9z += i4l; q9z += V2n; a6N60.P01(); return editor[q9z][r8C][g61]; } }, formMessage: function (editor, dt) { var j7a = "nfirm"; var h6F = "dexes"; var S3f = "confi"; var v31 = "nfi"; var V0Q = T30; V0Q += K3b; V0Q += l9J; var X9O = W25; X9O += v31; X9O += r9V; var m7A = M12; m7A += P3y; a6N60.g4A(); m7A += K3b; m7A += l9J; var B1j = W25; B1j += v31; B1j += r9V; var g7t = c2T; g7t += a6N60[204096]; g7t += j7a; var m1F = S3f; m1F += r9V; var h3s = y$D; h3s += v95; var m_h = i8S; m_h += h6F; var rows = dt[s0w]({ selected: o76 })[m_h](); var i18n = editor[h3s][r0C]; var question = typeof i18n[N0K] === n1a ? i18n[m1F] : i18n[g7t][rows[A82]] ? i18n[B1j][rows[m7A]] : i18n[X9O][R4N]; return question[k2r](/%d/g, rows[V0Q]); }, formOptions: {}, formTitle: y8F, limitTo: [o8i], text: function (dt, node, config) { var N$q = 'buttons.remove'; var U3Y = w_k; U3Y += p$p; return dt[i8a](N$q, config[a6w][i8a][r0C][U3Y]); } } }); _buttons[V$I] = $[K3B]({}, _buttons[V6i]); _buttons[U1M][D8T] = T6m; _buttons[T$K] = $[f_z]({}, _buttons[w2Y]); _buttons[o17][i_7] = Q86; if (!DataTable || !DataTable[e$8] || !DataTable[q7z](J2V)) { var j6i = l1c; j6i += B$5; j6i += r$h; throw new Error(j6i); } var Editor = (function () { var N_l = a6N60; var X0O = "rot"; var x5a = "3"; var j8g = "Field"; var V9Z = "ernalEvent"; var w58 = "internalI18n"; var x3_ = "factory"; var b4v = ".2"; var q60 = "model"; var N_C = "nalSettin"; var E6S = "defaul"; var D0U = "ltiInfo"; var H2T = "internalMu"; var e5o = "2."; var c2O = "ieldType"; var d0F = "ispla"; var t$t = "version"; var d$s = "fe"; var Y63 = O1$; Y63 += d$s; Y63 += Z_X; Y63 += q$k; var q2X = q$k; q2X += d0F; q2X += a6N60.b_J; var N8e = q60; N8e += U0f; var a3C = E6S; a3C += j1W; var p5P = m1O; p5P += q93; p5P += U0f; var X1T = L6L; X1T += w81; X1T += Y1w; var l9Z = e5o; l9Z += x5a; l9Z += b4v; var V0I = l04; V0I += p$O; V0I += U0f; var u4$ = a6N60.w1W; u4$ += c2O; u4$ += U0f; var V$5 = L9Y; V$5 += N_C; V$5 += G5U; N_l.g4A(); var A7B = H2T; A7B += D0U; var t_B = E43; t_B += X0O; t_B += z60; t_B += L9E; var r8z = w81; r8z += V2n; r8z += X9Y; r8z += V9Z; function Editor(init, cjsJq) { var n6o = "_su"; var F0a = "tag"; var q_t = "_dat"; var U7F = "class=\""; var d4q = "groun"; var R18 = "models"; var Y7_ = '<div data-dte-e="body_content" class="'; var z4m = "isplay"; var u4_ = "udArgs"; var q$Z = "leLocati"; var G0N = "inputTrigger"; var U0K = "earD"; var X8n = "t.dte"; var F21 = "iSet"; var o4i = "a-dte-e="; var A20 = 'initComplete'; var q02 = "_blur"; var B8h = " cl"; var D0N = "estedOp"; var n8H = "></div></d"; var J2p = 'xhr.dt.dte'; var r0g = "/d"; var O4i = "aSource"; var j_A = "ndent"; var J9e = "Pro"; var S6f = "ing\" "; var M$x = "_weakInArray"; var G79 = "_postopen"; var G6S = "itEdito"; var y8o = "sp"; var M_A = "_actionClass"; var F3C = "_nestedClose"; var U6z = "<div dat"; var S3u = "<div data-dte-e=\"form_info"; var q2h = "utto"; var H$l = "iq"; var j0T = "wrap"; var o2L = "reat"; var E5b = "tent"; var O39 = '"><span></span></div>'; var d67 = "ayReorder"; var G44 = "fact"; var N62 = '<div data-dte-e="form_buttons" class="'; var X86 = "_no"; var k1u = '<div data-dte-e="body" class="'; var L6k = "formOption"; var p81 = 'Cannot find display controller '; var l8A = "div cl"; var x0w = "\"></di"; var w7D = "iv data-dte-e=\"process"; var i_9 = "\"></"; var D$l = "_submitEr"; var D1D = "</di"; var G1w = "_assembleMai"; var k_O = "domTable"; var c_J = "<for"; var h5q = "defa"; var m48 = "Succe"; var Z5B = "itTable"; var w8G = "ory"; var d$u = "\"form_content\" cla"; var L9T = "_pre"; var R1z = '<div data-dte-e="foot" class="'; var p1R = "ini"; var d9P = "ynamicInfo"; var h7C = "m data-dte-e=\"form\" class=\""; var j5P = "_displ"; var a71 = "depe"; var V8S = "crea"; var Y_M = "ubb"; var D8Y = "nli"; var Z6T = 'DataTables Editor must be initialised as a \'new\' instance'; var j3v = "clear"; var x5u = 'foot'; var y3y = "\"><div cl"; var t6g = "ults"; var V$l = "ni"; var A5y = "Contro"; var N2S = 'body_content'; var C0D = '<div data-dte-e="form_error" class="'; var m2o = "_cr"; var F9v = "oter"; var Q8F = "18n.d"; var R33 = 'form_content'; var S3r = "te-e=\"head\" class=\""; var a9h = 'init.dt.dte'; var q5s = "indic"; var g3W = i8S; g3W += G6S; g3W += I2w; var y61 = R4N; y61 += T2g; y61 += M_J; y61 += t4m; var Y4l = p1R; Y4l += X9Y; var Z_x = q$k; Z_x += U1m; Z_x += Z1G; Z_x += a6N60.b_J; var q2x = F$j; q2x += a6N60.b_J; q2x += A5y; q2x += G5V; var s1n = q$k; s1n += z4m; var C34 = H2l; C34 += U0f; C34 += x8O; var K3A = a6N60[204096]; K3A += V2n; var n_c = a6N60.E4C; n_c += V2n; n_c += H$l; n_c += E_A; var C8m = w81; C8m += Q8F; C8m += X8n; var O4I = a6N60[204096]; O4I += V2n; var z4W = l2M; z4W += w81; z4W += s6T; z4W += E_A; var f4C = a6N60[204096]; f4C += V2n; var c7i = q$k; c7i += a6N60[204096]; c7i += U6y; var V2S = L7V; V2S += X9Y; V2S += U0f; var J4M = M_J; J4M += Z1G; J4M += c2T; J4M += c8f; var q$7 = K9v; q$7 += n8H; q$7 += g97; var R6B = c2T; R6B += a6N60[204096]; R6B += V2n; R6B += E5b; var y02 = E7n; y02 += Z1G; y02 += q$k; N_l.P01(); y02 += a6N60.V56; var s5Y = y3y; s5Y += Y1k; var x36 = j3w; x36 += N9r; x36 += L9E; x36 += I2w; var r1_ = w_H; r1_ += S3r; var l0e = n_L; l0e += T8z; l0e += H2l; l0e += k94; var F4l = w81; F4l += V2n; F4l += a6N60.w1W; F4l += a6N60[204096]; var E89 = a6N60.w1W; E89 += T8R; E89 += U6y; var V8o = S3u; V8o += K9v; V8o += B8h; V8o += Y1k; var y$r = x0w; y$r += R0n; y$r += O1E; var L6y = a6N60.w1W; L6y += a6N60[204096]; L6y += I2w; L6y += U6y; var l$f = a6N60[83715]; l$f += q2h; l$f += C1C; var F7P = x$f; F7P += U6y; var e8F = T8z; e8F += a6N60.w1W; e8F += l3d; e8F += O1E; var s5W = j1Q; s5W += z$m; var a$p = a6N60.w1W; a$p += T8R; a$p += U6y; var E4t = U6z; E4t += o4i; E4t += d$u; E4t += t3o; var u4w = K9v; u4w += O1E; var x6D = a6N60.w1W; x6D += a6N60[204096]; x6D += I2w; x6D += U6y; var B6m = c_J; B6m += h7C; var T$O = B9f; T$O += r0g; T$O += H6i; T$O += O1E; var n7K = n_L; n7K += D1D; n7K += k94; var a52 = W25; a52 += t4m; a52 += M_J; a52 += t4m; var C99 = r9R; C99 += L8l; C99 += a6N60.V56; var s6_ = B9f; s6_ += l8A; s6_ += Z1G; s6_ += t3o; var b5C = K9v; b5C += O1E; var y64 = N5L; y64 += E6_; var H7T = r9R; H7T += F9v; var s41 = y9M; s41 += w81; s41 += R0n; s41 += O1E; var d9S = i_9; d9S += H2l; d9S += k94; var a4q = W25; a4q += t4m; a4q += M_J; a4q += t4m; var F4L = N5L; F4L += E6_; var D3s = q5s; D3s += Z1G; D3s += X9Y; D3s += T8R; var g1a = e9D; g1a += w7D; g1a += S6f; g1a += U7F; var W0O = j0T; W0O += E43; W0O += a6N60.V56; var y2v = a6N60.E4C; y2v += V$l; y2v += a6N60[273010]; y2v += M_J; var N0$ = N9h; N0$ += X9Y; N0$ += w81; N0$ += O8_; var p_k = U6y; p_k += A3c; p_k += M_J; p_k += x2O; var I5L = w81; I5L += R9j; I5L += v95; var j9u = c2T; j9u += M12; j9u += w4E; var W4J = Z1G; W4J += a6N60[406894]; W4J += Z1G; W4J += K51; var e2e = G13; e2e += J5t; e2e += p$p; e2e += I4r; var c9l = C$2; c9l += X9Y; c9l += X9Y; c9l += p8S; var a0y = M_J; a0y += G2f; a0y += Y2t; var o81 = h5q; o81 += t6g; var G5a = M_J; G5a += K51; G5a += C7A; G5a += q$k; var B5n = G44; B5n += w8G; var P6H = D$l; P6H += s2g; var l5L = n6o; l5L += n2u; l5L += m48; l5L += b1F; var x_R = n6o; x_R += M0B; x_R += Z5B; var a_Y = R4N; a_Y += U0f; a_Y += b0Y; a_Y += n_y; var h3w = X86; h3w += J9e; h3w += a15; var k3D = L9T; k3D += T41; var F5n = R4N; F5n += V2n; F5n += D0N; F5n += P3y; var x$d = R4N; x$d += l3z; x$d += T7i; x$d += U2E; var n1V = R4N; n1V += G0N; var B1K = R4N; B1K += L6k; B1K += U0f; var e55 = j5P; e55 += d67; var Z88 = q_t; Z88 += O4i; var L4H = m2o; L4H += u4_; var P3s = B_r; P3s += U0K; P3s += d9P; var K1L = G1w; K1L += V2n; var L1L = Z4V; L1L += X9Y; var S$r = U0f; S$r += c8f; S$r += c6h; var C6E = R7z; C6E += a6N60[204096]; C6E += R0n; C6E += M_J; var s1F = a6N60[204096]; s1F += E43; s1F += M_J; s1F += V2n; var Y4h = a6N60[204096]; Y4h += o1$; var Z1C = U6y; Z1C += a6N60.E4C; Z1C += r4q; Z1C += F21; var U1v = U6y; U1v += a6N60[204096]; U1v += q$k; U1v += M_J; var T3B = U6y; T3B += z$W; T3B += R_o; T3B += M_J; var S2G = T7$; S2G += j2q; S2G += o2L; S2G += M_J; var I_8 = w81; I_8 += D8Y; I_8 += U4W; var B3j = K3b; B3j += M_J; B3j += X9Y; var B2T = l04; B2T += M12; B2T += g3T; var q3n = a6N60.w1W; q3n += h4O; q3n += U0f; var h8m = e1N; h8m += C03; var D6r = q$k; D6r += w81; D6r += e_H; D6r += t1_; var S8H = H2l; S8H += y8o; S8H += f$v; S8H += a6N60.b_J; var C0x = q$k; C0x += E1g; C0x += b3y; var o9a = a71; o9a += j_A; var T_w = M7_; T_w += D$V; var W_l = V8S; W_l += U$I; var I28 = c2T; I28 += I_X; var Q0r = a6N60[83715]; Q0r += a6N60.E4C; Q0r += F59; Q0r += m8u; var g25 = S92; g25 += q$Z; g25 += p$p; var g6p = a6N60[83715]; g6p += Y_M; g6p += M12; g6p += M_J; var l2S = W7T; l2S += Q3u; l2S += d4q; l2S += q$k; var _this = this; this[u9B] = add; this[S15] = ajax; this[l2S] = background; this[Z1U] = blur; this[g6p] = bubble; this[g25] = bubbleLocation; this[A8O] = bubblePosition; this[Q0r] = buttons; this[j3v] = clear; this[I28] = close; this[W_l] = create; this[T_w] = undependent; this[o9a] = dependent; this[k9h] = destroy; this[C0x] = disable; this[S8H] = display; this[D6r] = displayed; this[A5$] = displayNode; this[h8m] = edit; this[V1F] = enable; this[H1B] = error$1; this[d39] = field; this[q3n] = fields; this[I4u] = file; this[B2T] = files; this[B3j] = get; this[H97] = hide; this[B4D] = ids; this[T_9] = inError; this[I_8] = inline; this[S2G] = inlineCreate; this[T3B] = message; this[U1v] = mode; this[J$B] = modifier; this[p3r] = multiGet; this[Z1C] = multiSet; this[H$p] = node; this[Y4h] = off; this[p$p] = on; this[r44] = one; this[s1F] = open; this[C_E] = order; this[C6E] = remove; this[N9h] = set; this[S$r] = show; this[L1L] = submit; this[z5g] = table; this[j4a] = template; this[S1h] = title; this[r8Z] = val; this[M_A] = _actionClass; this[K1W] = _ajax; this[J6m] = _animate; this[K1L] = _assembleMain; this[q02] = _blur; this[P3s] = _clearDynamicInfo; this[D2P] = _close; this[C6d] = _closeReg; this[L4H] = _crudArgs; this[Z88] = _dataSource; this[e55] = _displayReorder; this[U2P] = _edit; this[n0R] = _event; this[j53] = _eventName; this[a7x] = _fieldFromNode; this[x$v] = _fieldNames; this[N8a] = _focus; this[B1K] = _formOptions; this[S$P] = _inline; this[n1V] = _inputTrigger; this[x$d] = _optionsUpdate; this[e6W] = _message; this[R5A] = _multiInfo; this[F3C] = _nestedClose; this[F5n] = _nestedOpen; this[G79] = _postopen; this[k3D] = _preopen; this[X2p] = _processing; this[h3w] = _noProcessing; this[a_Y] = _submit; this[x_R] = _submitTable; this[l5L] = _submitSuccess; this[P6H] = _submitError; this[B3$] = _tidy; this[M$x] = _weakInArray; if (Editor[B5n](init, cjsJq)) { return Editor; } if (!(this instanceof Editor)) { alert(Z6T); } init = $[G5a](o76, {}, Editor[o81], init); this[c2T] = init; this[U0f] = $[a0y](o76, {}, Editor[R18][c9l], { actionName: init[e2e], ajax: init[W4J], formOptions: init[R4e], idSrc: init[I3x], table: init[k_O] || init[z5g], template: init[j4a] ? $(init[j4a])[y22]() : y8F }); this[v68] = $[f_z](o76, {}, Editor[j9u]); this[I5L] = init[i8a]; Editor[p_k][N0$][y2v]++; var that = this; var classes = this[v68]; var wrapper = $(F$O + classes[W0O] + Q9K + g1a + classes[i$j][D3s] + O39 + k1u + classes[j_t][F4L] + Q9K + Y7_ + classes[j_t][a4q] + d9S + s41 + R1z + classes[H7T][y64] + b5C + s6_ + classes[C99][a52] + n7K + T$O + c2P); var form = $(B6m + classes[x6D][F0a] + u4w + E4t + classes[a$p][B8R] + s5W + e8F); this[K6_] = { body: el(l0a, wrapper)[d4r], bodyContent: el(N2S, wrapper)[d4r], buttons: $(N62 + classes[F7P][l$f] + a1R)[d4r], footer: el(x5u, wrapper)[d4r], form: form[d4r], formContent: el(R33, form)[d4r], formError: $(C0D + classes[L6y][H1B] + y$r)[d4r], formInfo: $(V8o + classes[E89][F4l] + l0e)[d4r], header: $(r1_ + classes[Q6x][x36] + s5Y + classes[y02][R6B] + q$7)[d4r], processing: el(d54, wrapper)[d4r], wrapper: wrapper[d4r] }; $[J4M](init[V2S], function (evt, fn) { var H64 = a6N60[204096]; H64 += V2n; that[H64](evt, function () { var x$L = M12; x$L += R2S; var argsIn = []; for (var _i = d4r; _i < arguments[x$L]; _i++) { argsIn[_i] = arguments[_i]; } fn[h6$](that, argsIn); }); }); this[c7i]; if (init[E9S]) { var s6m = a6N60.w1W; s6m += w81; s6m += T8k; this[u9B](init[s6m]); } $(document)[f4C](a9h + this[U0f][z4W], function (e, settings, json) { var d3x = "nT"; var X_t = "_editor"; var J7F = X9Y; J7F += i05; J7F += M12; J7F += M_J; var table = _this[U0f][J7F]; if (table) { var w1D = V2n; w1D += a6N60[204096]; w1D += q$k; w1D += M_J; var R57 = X9Y; R57 += i05; R57 += p$O; var C8F = d3x; C8F += b3y; var dtApi = new DataTable[c8Q](table); if (settings[C8F] === dtApi[R57]()[w1D]()) { settings[X_t] = _this; } } })[O4I](C8m + this[U0f][n_c], function (e, settings) { N_l.g4A(); var B97 = "nTa"; var U4X = "Lan"; var H9B = "gua"; var H1g = "oLanguage"; var l3B = X9Y; l3B += i05; l3B += p$O; var table = _this[U0f][l3B]; if (table) { var e9t = X9Y; e9t += b3y; var O3h = B97; O3h += a6N60[83715]; O3h += M12; O3h += M_J; var X3f = B9S; X3f += E43; X3f += w81; var dtApi = new DataTable[X3f](table); if (settings[O3h] === dtApi[e9t]()[H$p]()) { if (settings[H1g][a6w]) { var d_e = a6N60[204096]; d_e += U4X; d_e += H9B; d_e += R6J; var r74 = y$D; r74 += v95; var t6E = M_J; t6E += L32; t6E += M_J; t6E += Y2t; $[t6E](o76, _this[r74], settings[d_e][a6w]); } } } })[K3A](J2p + this[U0f][J3r], function (e, settings, json) { var J1h = "nTable"; var n0h = "_optionsUpdate"; var table = _this[U0f][z5g]; if (table) { var A1z = X9Y; A1z += Z1G; A1z += t_C; var dtApi = new DataTable[c8Q](table); if (settings[J1h] === dtApi[A1z]()[H$p]()) { _this[n0h](json); } } }); if (!Editor[C34][init[s1n]]) { throw new Error(p81 + init[N6r]); } this[U0f][q2x] = Editor[N6r][init[Z_x]][Y4l](this); this[y61](A20, []); $(document)[Z16](g3W, [this]); } Editor[c$a][r8z] = function (name, args) { N_l.P01(); var A99 = m22; A99 += t4m; this[A99](name, args); }; Editor[t_B][w58] = function () { return this[i8a]; }; Editor[c$a][A7B] = function () { return this[R5A](); }; Editor[c$a][V$5] = function () { return this[U0f]; }; Editor[u4$] = { checkbox: checkbox, datatable: datatable, datetime: datetime, hidden: hidden, password: password, radio: radio, readonly: readonly, select: select, text: text, textarea: textarea, upload: upload, uploadMany: uploadMany }; Editor[V0I] = {}; Editor[t$t] = l9Z; Editor[v68] = classNames; Editor[j8g] = Field; Editor[X1T] = y8F; Editor[H1B] = error; Editor[p5P] = pairs; Editor[x3_] = factory; Editor[M6E] = upload$1; Editor[a3C] = defaults$1; Editor[N8e] = { button: button, displayController: displayController, fieldType: fieldType, formOptions: formOptions, settings: settings }; Editor[D6z] = { dataTable: dataSource$1, html: dataSource }; Editor[q2X] = { envelope: envelope, lightbox: self }; Editor[Y63] = function (id) { N_l.P01(); return safeDomId(id, q2P); }; return Editor; })(); DataTable[r1F] = Editor; $[c47][d9R][s4$] = Editor; if (DataTable[U7p]) { var d6r = p4h; d6r += z3N; d6r += Z7R; d6r += M_J; Editor[d6r] = DataTable[P0U]; } if (DataTable[V_R][n39]) { var N5d = W5X; N5d += U_5; N5d += U0f; var D3A = M_J; D3A += K51; D3A += X9Y; $[f_z](Editor[Y3E], DataTable[D3A][N5d]); } DataTable[u2y][L$q] = Editor[y6l]; return DataTable[r1F]; }); })();

/*! Bootstrap integration for DataTables' Editor
 * © SpryMedia Ltd - datatables.net/license
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net-bs5', 'datatables.net-editor'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if (!$.fn.dataTable) {
				require('datatables.net-bs5')(root, $);
			}

			if (!$.fn.dataTable.Editor) {
				require('datatables.net-editor')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if (!root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if (!$) {
					$ = jq(root);
				}

				cjsRequires(root, $);
				return factory($, root, root.document);
			};
		}
		else {
			cjsRequires(window, jq);
			module.exports = factory(jq, window, window.document);
		}
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document) {
	'use strict';
	var DataTable = $.fn.dataTable;



	// Note that in MJS `jQuery`, `DataTable` and `Editor` are imported with
	// `jQuery` assigned to `let $`
	// In UMD, `$` and `DataTable` are available

	/*
	 * Set the default display controller to be our bootstrap control
	 */
	DataTable.Editor.defaults.display = 'bootstrap';

	/*
	 * Change the default classes from Editor to be classes for Bootstrap
	 */
	$.extend(true, DataTable.Editor.classes, {
		header: {
			wrapper: 'DTE_Header',
			title: {
				tag: 'h5',
				class: 'modal-title'
			}
		},
		body: {
			wrapper: 'DTE_Body'
		},
		footer: {
			wrapper: 'DTE_Footer'
		},
		form: {
			tag: 'form-horizontal',
			button: 'btn',
			buttonInternal: 'btn btn-outline-secondary',
			buttonSubmit: 'btn btn-primary'
		},
		field: {
			wrapper: 'DTE_Field form-group row',
			label: 'col-lg-4 col-form-label',
			input: 'col-lg-8 DTE_Field_Input',
			error: 'error is-invalid',
			'msg-labelInfo': 'form-text text-secondary small',
			'msg-info': 'form-text text-secondary small',
			'msg-message': 'form-text text-secondary small',
			'msg-error': 'form-text text-danger small',
			multiValue: 'card multi-value',
			multiInfo: 'small',
			multiRestore: 'multi-restore'
		}
	});

	$.extend(true, DataTable.ext.buttons, {
		create: {
			formButtons: {
				className: 'btn-primary'
			}
		},
		edit: {
			formButtons: {
				className: 'btn-primary'
			}
		},
		remove: {
			formButtons: {
				className: 'btn-danger'
			}
		}
	});

	DataTable.Editor.fieldTypes.datatable.tableClass = 'table';

	/*
	 * Bootstrap display controller - this is effectively a proxy to the Bootstrap
	 * modal control.
	 */
	let shown = false;
	let fullyShown = false;

	const dom = {
		content: $('<div class="modal fade DTED">' + '<div class="modal-dialog"></div>' + '</div>'),
		close: $('<button class="btn-close"></div>')
	};
	let modal;
	let _bs = window.bootstrap;

	DataTable.Editor.bootstrap = function (bs) {
		_bs = bs;
	};

	DataTable.Editor.display.bootstrap = $.extend(true, {}, DataTable.Editor.models.displayController, {
		/*
		 * API methods
		 */
		init: function (dte) {
			// Add `form-control` to required elements
			dte.on('displayOrder.dtebs open.dtebs', function () {
				$.each(dte.s.fields, function (key, field) {
					$('input:not([type=checkbox]):not([type=radio]), select, textarea', field.node()).addClass(
						'form-control'
					);

					$('input[type=checkbox], input[type=radio]', field.node()).addClass('form-check-input');

					$('select', field.node()).addClass('form-select');
				});
			});

			return DataTable.Editor.display.bootstrap;
		},

		open: function (dte, append, callback) {
			if (!modal) {
				modal = new _bs.Modal(dom.content[0], {
					backdrop: 'static',
					keyboard: false
				});
			}

			$(append).addClass('modal-content');
			$('.DTE_Header', append).addClass('modal-header');
			$('.DTE_Body', append).addClass('modal-body');
			$('.DTE_Footer', append).addClass('modal-footer');

			// Special class for DataTable buttons in the form
			$(append)
				.find('div.DTE_Field_Type_datatable div.dt-buttons')
				.removeClass('btn-group')
				.addClass('btn-group-vertical');

			// Setup events on each show
			dom.close
				.attr('title', dte.i18n.close)
				.off('click.dte-bs5')
				.on('click.dte-bs5', function () {
					dte.close('icon');
				})
				.appendTo($('div.modal-header', append));

			// This is a bit horrible, but if you mousedown and then drag out of the modal container, we don't
			// want to trigger a background action.
			let allowBackgroundClick = false;
			$(document)
				.off('mousedown.dte-bs5')
				.on('mousedown.dte-bs5', 'div.modal', function (e) {
					allowBackgroundClick = $(e.target).hasClass('modal') && shown ? true : false;
				});

			$(document)
				.off('click.dte-bs5')
				.on('click.dte-bs5', 'div.modal', function (e) {
					if ($(e.target).hasClass('modal') && allowBackgroundClick) {
						dte.background();
					}
				});

			var content = dom.content.find('div.modal-dialog');
			content.addClass(DataTable.Editor.display.bootstrap.classes.modal);
			content.children().detach();
			content.append(append);

			// Floating label support - rearrange the DOM for the inputs
			if (dte.c.bootstrap && dte.c.bootstrap.floatingLabels) {
				var floating_label_types = ['readonly', 'text', 'textarea', 'select', 'datetime'];
				var fields = dte.order();

				fields
					.filter(function (f) {
						var type = dte.field(f).s.opts.type;

						return floating_label_types.includes(type);
					})
					.forEach(function (f) {
						var node = $(dte.field(f).node());
						var wrapper = node.find('.DTE_Field_InputControl');
						var control = wrapper.children(':first-child');
						var label = node.find('label');

						wrapper.parent().removeClass('col-lg-8').addClass('col-lg-12');
						wrapper.addClass('form-floating');
						control.addClass('form-control').attr('placeholder', f);
						label.appendTo(wrapper);
					});
			}

			if (shown) {
				if (callback) {
					callback();
				}
				return;
			}

			shown = true;
			fullyShown = false;

			dom.content[0].addEventListener(
				'shown.bs.modal',
				function () {
					// Can only give elements focus when shown
					if (dte.s.setFocus) {
						dte.s.setFocus.focus();
					}

					fullyShown = true;

					dom.content.find('table.dataTable').DataTable().columns.adjust();

					if (callback) {
						callback();
					}
				},
				{ once: true }
			);

			dom.content[0].addEventListener(
				'hidden',
				function () {
					shown = false;
				},
				{ once: true }
			);

			$(dom.content).appendTo('body');

			modal.show();
		},

		close: function (dte, callback) {
			if (!shown) {
				if (callback) {
					callback();
				}
				return;
			}

			// Check if actually displayed or not before hiding. BS4 doesn't like `hide`
			// before it has been fully displayed
			if (!fullyShown) {
				dom.content[0].addEventListener(
					'shown.bs.modal',
					function () {
						DataTable.Editor.display.bootstrap.close(dte, callback);
					},
					{ once: true }
				);

				return;
			}

			dom.content[0].addEventListener(
				'hidden.bs.modal',
				function () {
					$(this).detach();
				},
				{ once: true }
			);

			modal.hide();

			shown = false;
			fullyShown = false;

			if (callback) {
				callback();
			}
		},

		node: function () {
			return dom.content[0];
		},

		classes: {
			modal: 'modal-dialog-scrollable modal-dialog-centered modal-lg'
		}
	});


	return DataTable.Editor;
}));


/*! Responsive 3.0.2
 * © SpryMedia Ltd - datatables.net/license
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if (!$.fn.dataTable) {
				require('datatables.net')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if (!root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if (!$) {
					$ = jq(root);
				}

				cjsRequires(root, $);
				return factory($, root, root.document);
			};
		}
		else {
			cjsRequires(window, jq);
			module.exports = factory(jq, window, window.document);
		}
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document) {
	'use strict';
	var DataTable = $.fn.dataTable;



	/**
	 * @summary     Responsive
	 * @description Responsive tables plug-in for DataTables
	 * @version     3.0.2
	 * @author      SpryMedia Ltd
	 * @copyright   SpryMedia Ltd.
	 *
	 * This source file is free software, available under the following license:
	 *   MIT license - http://datatables.net/license/mit
	 *
	 * This source file is distributed in the hope that it will be useful, but
	 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
	 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
	 *
	 * For details please refer to: http://www.datatables.net
	 */

	/**
	 * Responsive is a plug-in for the DataTables library that makes use of
	 * DataTables' ability to change the visibility of columns, changing the
	 * visibility of columns so the displayed columns fit into the table container.
	 * The end result is that complex tables will be dynamically adjusted to fit
	 * into the viewport, be it on a desktop, tablet or mobile browser.
	 *
	 * Responsive for DataTables has two modes of operation, which can used
	 * individually or combined:
	 *
	 * * Class name based control - columns assigned class names that match the
	 *   breakpoint logic can be shown / hidden as required for each breakpoint.
	 * * Automatic control - columns are automatically hidden when there is no
	 *   room left to display them. Columns removed from the right.
	 *
	 * In additional to column visibility control, Responsive also has built into
	 * options to use DataTables' child row display to show / hide the information
	 * from the table that has been hidden. There are also two modes of operation
	 * for this child row display:
	 *
	 * * Inline - when the control element that the user can use to show / hide
	 *   child rows is displayed inside the first column of the table.
	 * * Column - where a whole column is dedicated to be the show / hide control.
	 *
	 * Initialisation of Responsive is performed by:
	 *
	 * * Adding the class `responsive` or `dt-responsive` to the table. In this case
	 *   Responsive will automatically be initialised with the default configuration
	 *   options when the DataTable is created.
	 * * Using the `responsive` option in the DataTables configuration options. This
	 *   can also be used to specify the configuration options, or simply set to
	 *   `true` to use the defaults.
	 *
	 *  @class
	 *  @param {object} settings DataTables settings object for the host table
	 *  @param {object} [opts] Configuration options
	 *  @requires jQuery 1.7+
	 *  @requires DataTables 1.10.3+
	 *
	 *  @example
	 *      $('#example').DataTable( {
	 *        responsive: true
	 *      } );
	 *    } );
	 */
	var Responsive = function (settings, opts) {
		// Sanity check that we are using DataTables 1.10 or newer
		if (!DataTable.versionCheck || !DataTable.versionCheck('2')) {
			throw 'DataTables Responsive requires DataTables 2 or newer';
		}

		this.s = {
			childNodeStore: {},
			columns: [],
			current: [],
			dt: new DataTable.Api(settings)
		};

		// Check if responsive has already been initialised on this table
		if (this.s.dt.settings()[0].responsive) {
			return;
		}

		// details is an object, but for simplicity the user can give it as a string
		// or a boolean
		if (opts && typeof opts.details === 'string') {
			opts.details = { type: opts.details };
		}
		else if (opts && opts.details === false) {
			opts.details = { type: false };
		}
		else if (opts && opts.details === true) {
			opts.details = { type: 'inline' };
		}

		this.c = $.extend(
			true,
			{},
			Responsive.defaults,
			DataTable.defaults.responsive,
			opts
		);
		settings.responsive = this;
		this._constructor();
	};

	$.extend(Responsive.prototype, {
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Constructor
		 */

		/**
		 * Initialise the Responsive instance
		 *
		 * @private
		 */
		_constructor: function () {
			var that = this;
			var dt = this.s.dt;
			var oldWindowWidth = $(window).innerWidth();

			dt.settings()[0]._responsive = this;

			// Use DataTables' throttle function to avoid processor thrashing
			$(window).on(
				'orientationchange.dtr',
				DataTable.util.throttle(function () {
					// iOS has a bug whereby resize can fire when only scrolling
					// See: http://stackoverflow.com/questions/8898412
					var width = $(window).innerWidth();

					if (width !== oldWindowWidth) {
						that._resize();
						oldWindowWidth = width;
					}
				})
			);

			// Handle new rows being dynamically added - needed as responsive
			// updates all rows (shown or not) a responsive change, rather than
			// per draw.
			dt.on('row-created.dtr', function (e, tr, data, idx) {
				if ($.inArray(false, that.s.current) !== -1) {
					$('>td, >th', tr).each(function (i) {
						var idx = dt.column.index('toData', i);

						if (that.s.current[idx] === false) {
							$(this)
								.css('display', 'none')
								.addClass('dtr-hidden');
						}
					});
				}
			});

			// Destroy event handler
			dt.on('destroy.dtr', function () {
				dt.off('.dtr');
				$(dt.table().body()).off('.dtr');
				$(window).off('resize.dtr orientationchange.dtr');
				dt.cells('.dtr-control').nodes().to$().removeClass('dtr-control');
				$(dt.table().node()).removeClass('dtr-inline collapsed');

				// Restore the columns that we've hidden
				$.each(that.s.current, function (i, val) {
					if (val === false) {
						that._setColumnVis(i, true);
					}
				});
			});

			// Reorder the breakpoints array here in case they have been added out
			// of order
			this.c.breakpoints.sort(function (a, b) {
				return a.width < b.width ? 1 : a.width > b.width ? -1 : 0;
			});

			this._classLogic();
			this._resizeAuto();

			// Details handler
			var details = this.c.details;

			if (details.type !== false) {
				that._detailsInit();

				// DataTables will trigger this event on every column it shows and
				// hides individually
				dt.on('column-visibility.dtr', function () {
					// Use a small debounce to allow multiple columns to be set together
					if (that._timer) {
						clearTimeout(that._timer);
					}

					that._timer = setTimeout(function () {
						that._timer = null;

						that._classLogic();
						that._resizeAuto();
						that._resize(true);

						that._redrawChildren();
					}, 100);
				});

				// Redraw the details box on each draw which will happen if the data
				// has changed. This is used until DataTables implements a native
				// `updated` event for rows
				dt.on('draw.dtr', function () {
					that._redrawChildren();
				});

				$(dt.table().node()).addClass('dtr-' + details.type);
			}

			dt.on('column-reorder.dtr', function (e, settings, details) {
				that._classLogic();
				that._resizeAuto();
				that._resize(true);
			});

			// Change in column sizes means we need to calc
			dt.on('column-sizing.dtr', function () {
				that._resizeAuto();
				that._resize();
			});

			// DT2 let's us tell it if we are hiding columns
			dt.on('column-calc.dt', function (e, d) {
				var curr = that.s.current;

				for (var i = 0; i < curr.length; i++) {
					var idx = d.visible.indexOf(i);

					if (curr[i] === false && idx >= 0) {
						d.visible.splice(idx, 1);
					}
				}
			});

			// On Ajax reload we want to reopen any child rows which are displayed
			// by responsive
			dt.on('preXhr.dtr', function () {
				var rowIds = [];
				dt.rows().every(function () {
					if (this.child.isShown()) {
						rowIds.push(this.id(true));
					}
				});

				dt.one('draw.dtr', function () {
					that._resizeAuto();
					that._resize();

					dt.rows(rowIds).every(function () {
						that._detailsDisplay(this, false);
					});
				});
			});

			dt.on('draw.dtr', function () {
				that._controlClass();
			}).on('init.dtr', function (e, settings, details) {
				if (e.namespace !== 'dt') {
					return;
				}

				that._resizeAuto();
				that._resize();
			});

			// First pass - draw the table for the current viewport size
			this._resize();
		},

		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Private methods
		 */

		/**
		 * Insert a `col` tag into the correct location in a `colgroup`.
		 *
		 * @param {jQuery} colGroup The `colgroup` tag
		 * @param {jQuery} colEl The `col` tag
		 */
		_colGroupAttach: function (colGroup, colEls, idx) {
			var found = null;

			// No need to do anything if already attached
			if (colEls[idx].get(0).parentNode === colGroup[0]) {
				return;
			}

			// Find the first `col` after our own which is already attached
			for (var i = idx + 1; i < colEls.length; i++) {
				if (colGroup[0] === colEls[i].get(0).parentNode) {
					found = i;
					break;
				}
			}

			if (found !== null) {
				// Insert before
				colEls[idx].insertBefore(colEls[found][0]);
			}
			else {
				// If wasn't found, insert at the end
				colGroup.append(colEls[idx]);
			}
		},

		/**
		 * Get and store nodes from a cell - use for node moving renderers
		 *
		 * @param {*} dt DT instance
		 * @param {*} row Row index
		 * @param {*} col Column index
		 */
		_childNodes: function (dt, row, col) {
			var name = row + '-' + col;

			if (this.s.childNodeStore[name]) {
				return this.s.childNodeStore[name];
			}

			// https://jsperf.com/childnodes-array-slice-vs-loop
			var nodes = [];
			var children = dt.cell(row, col).node().childNodes;
			for (var i = 0, ien = children.length; i < ien; i++) {
				nodes.push(children[i]);
			}

			this.s.childNodeStore[name] = nodes;

			return nodes;
		},

		/**
		 * Restore nodes from the cache to a table cell
		 *
		 * @param {*} dt DT instance
		 * @param {*} row Row index
		 * @param {*} col Column index
		 */
		_childNodesRestore: function (dt, row, col) {
			var name = row + '-' + col;

			if (!this.s.childNodeStore[name]) {
				return;
			}

			var node = dt.cell(row, col).node();
			var store = this.s.childNodeStore[name];
			if (store.length > 0) {
				var parent = store[0].parentNode;
				var parentChildren = parent.childNodes;
				var a = [];

				for (var i = 0, ien = parentChildren.length; i < ien; i++) {
					a.push(parentChildren[i]);
				}

				for (var j = 0, jen = a.length; j < jen; j++) {
					node.appendChild(a[j]);
				}
			}

			this.s.childNodeStore[name] = undefined;
		},

		/**
		 * Calculate the visibility for the columns in a table for a given
		 * breakpoint. The result is pre-determined based on the class logic if
		 * class names are used to control all columns, but the width of the table
		 * is also used if there are columns which are to be automatically shown
		 * and hidden.
		 *
		 * @param  {string} breakpoint Breakpoint name to use for the calculation
		 * @return {array} Array of boolean values initiating the visibility of each
		 *   column.
		 *  @private
		 */
		_columnsVisiblity: function (breakpoint) {
			var dt = this.s.dt;
			var columns = this.s.columns;
			var i, ien;

			// Create an array that defines the column ordering based first on the
			// column's priority, and secondly the column index. This allows the
			// columns to be removed from the right if the priority matches
			var order = columns
				.map(function (col, idx) {
					return {
						columnIdx: idx,
						priority: col.priority
					};
				})
				.sort(function (a, b) {
					if (a.priority !== b.priority) {
						return a.priority - b.priority;
					}
					return a.columnIdx - b.columnIdx;
				});

			// Class logic - determine which columns are in this breakpoint based
			// on the classes. If no class control (i.e. `auto`) then `-` is used
			// to indicate this to the rest of the function
			var display = $.map(columns, function (col, i) {
				if (dt.column(i).visible() === false) {
					return 'not-visible';
				}
				return col.auto && col.minWidth === null
					? false
					: col.auto === true
						? '-'
						: $.inArray(breakpoint, col.includeIn) !== -1;
			});

			// Auto column control - first pass: how much width is taken by the
			// ones that must be included from the non-auto columns
			var requiredWidth = 0;
			for (i = 0, ien = display.length; i < ien; i++) {
				if (display[i] === true) {
					requiredWidth += columns[i].minWidth;
				}
			}

			// Second pass, use up any remaining width for other columns. For
			// scrolling tables we need to subtract the width of the scrollbar. It
			// may not be requires which makes this sub-optimal, but it would
			// require another full redraw to make complete use of those extra few
			// pixels
			var scrolling = dt.settings()[0].oScroll;
			var bar = scrolling.sY || scrolling.sX ? scrolling.iBarWidth : 0;
			var widthAvailable = dt.table().container().offsetWidth - bar;
			var usedWidth = widthAvailable - requiredWidth;

			// Control column needs to always be included. This makes it sub-
			// optimal in terms of using the available with, but to stop layout
			// thrashing or overflow. Also we need to account for the control column
			// width first so we know how much width is available for the other
			// columns, since the control column might not be the first one shown
			for (i = 0, ien = display.length; i < ien; i++) {
				if (columns[i].control) {
					usedWidth -= columns[i].minWidth;
				}
			}

			// Allow columns to be shown (counting by priority and then right to
			// left) until we run out of room
			var empty = false;
			for (i = 0, ien = order.length; i < ien; i++) {
				var colIdx = order[i].columnIdx;

				if (
					display[colIdx] === '-' &&
					!columns[colIdx].control &&
					columns[colIdx].minWidth
				) {
					// Once we've found a column that won't fit we don't let any
					// others display either, or columns might disappear in the
					// middle of the table
					if (empty || usedWidth - columns[colIdx].minWidth < 0) {
						empty = true;
						display[colIdx] = false;
					}
					else {
						display[colIdx] = true;
					}

					usedWidth -= columns[colIdx].minWidth;
				}
			}

			// Determine if the 'control' column should be shown (if there is one).
			// This is the case when there is a hidden column (that is not the
			// control column). The two loops look inefficient here, but they are
			// trivial and will fly through. We need to know the outcome from the
			// first , before the action in the second can be taken
			var showControl = false;

			for (i = 0, ien = columns.length; i < ien; i++) {
				if (
					!columns[i].control &&
					!columns[i].never &&
					display[i] === false
				) {
					showControl = true;
					break;
				}
			}

			for (i = 0, ien = columns.length; i < ien; i++) {
				if (columns[i].control) {
					display[i] = showControl;
				}

				// Replace not visible string with false from the control column detection above
				if (display[i] === 'not-visible') {
					display[i] = false;
				}
			}

			// Finally we need to make sure that there is at least one column that
			// is visible
			if ($.inArray(true, display) === -1) {
				display[0] = true;
			}

			return display;
		},

		/**
		 * Create the internal `columns` array with information about the columns
		 * for the table. This includes determining which breakpoints the column
		 * will appear in, based upon class names in the column, which makes up the
		 * vast majority of this method.
		 *
		 * @private
		 */
		_classLogic: function () {
			var that = this;
			var breakpoints = this.c.breakpoints;
			var dt = this.s.dt;
			var columns = dt
				.columns()
				.eq(0)
				.map(function (i) {
					var column = this.column(i);
					var className = column.header().className;
					var priority = column.init().responsivePriority;
					var dataPriority = column
						.header()
						.getAttribute('data-priority');

					if (priority === undefined) {
						priority =
							dataPriority === undefined || dataPriority === null
								? 10000
								: dataPriority * 1;
					}

					return {
						className: className,
						includeIn: [],
						auto: false,
						control: false,
						never: className.match(/\b(dtr\-)?never\b/) ? true : false,
						priority: priority
					};
				});

			// Simply add a breakpoint to `includeIn` array, ensuring that there are
			// no duplicates
			var add = function (colIdx, name) {
				var includeIn = columns[colIdx].includeIn;

				if ($.inArray(name, includeIn) === -1) {
					includeIn.push(name);
				}
			};

			var column = function (colIdx, name, operator, matched) {
				var size, i, ien;

				if (!operator) {
					columns[colIdx].includeIn.push(name);
				}
				else if (operator === 'max-') {
					// Add this breakpoint and all smaller
					size = that._find(name).width;

					for (i = 0, ien = breakpoints.length; i < ien; i++) {
						if (breakpoints[i].width <= size) {
							add(colIdx, breakpoints[i].name);
						}
					}
				}
				else if (operator === 'min-') {
					// Add this breakpoint and all larger
					size = that._find(name).width;

					for (i = 0, ien = breakpoints.length; i < ien; i++) {
						if (breakpoints[i].width >= size) {
							add(colIdx, breakpoints[i].name);
						}
					}
				}
				else if (operator === 'not-') {
					// Add all but this breakpoint
					for (i = 0, ien = breakpoints.length; i < ien; i++) {
						if (breakpoints[i].name.indexOf(matched) === -1) {
							add(colIdx, breakpoints[i].name);
						}
					}
				}
			};

			// Loop over each column and determine if it has a responsive control
			// class
			columns.each(function (col, i) {
				var classNames = col.className.split(' ');
				var hasClass = false;

				// Split the class name up so multiple rules can be applied if needed
				for (var k = 0, ken = classNames.length; k < ken; k++) {
					var className = classNames[k].trim();

					if (className === 'all' || className === 'dtr-all') {
						// Include in all
						hasClass = true;
						col.includeIn = $.map(breakpoints, function (a) {
							return a.name;
						});
						return;
					}
					else if (
						className === 'none' ||
						className === 'dtr-none' ||
						col.never
					) {
						// Include in none (default) and no auto
						hasClass = true;
						return;
					}
					else if (
						className === 'control' ||
						className === 'dtr-control'
					) {
						// Special column that is only visible, when one of the other
						// columns is hidden. This is used for the details control
						hasClass = true;
						col.control = true;
						return;
					}

					$.each(breakpoints, function (j, breakpoint) {
						// Does this column have a class that matches this breakpoint?
						var brokenPoint = breakpoint.name.split('-');
						var re = new RegExp(
							'(min\\-|max\\-|not\\-)?(' +
							brokenPoint[0] +
							')(\\-[_a-zA-Z0-9])?'
						);
						var match = className.match(re);

						if (match) {
							hasClass = true;

							if (
								match[2] === brokenPoint[0] &&
								match[3] === '-' + brokenPoint[1]
							) {
								// Class name matches breakpoint name fully
								column(
									i,
									breakpoint.name,
									match[1],
									match[2] + match[3]
								);
							}
							else if (match[2] === brokenPoint[0] && !match[3]) {
								// Class name matched primary breakpoint name with no qualifier
								column(i, breakpoint.name, match[1], match[2]);
							}
						}
					});
				}

				// If there was no control class, then automatic sizing is used
				if (!hasClass) {
					col.auto = true;
				}
			});

			this.s.columns = columns;
		},

		/**
		 * Update the cells to show the correct control class / button
		 * @private
		 */
		_controlClass: function () {
			if (this.c.details.type === 'inline') {
				var dt = this.s.dt;
				var columnsVis = this.s.current;
				var firstVisible = $.inArray(true, columnsVis);

				// Remove from any cells which shouldn't have it
				dt.cells(
					null,
					function (idx) {
						return idx !== firstVisible;
					},
					{ page: 'current' }
				)
					.nodes()
					.to$()
					.filter('.dtr-control')
					.removeClass('dtr-control');

				dt.cells(null, firstVisible, { page: 'current' })
					.nodes()
					.to$()
					.addClass('dtr-control');
			}
		},

		/**
		 * Show the details for the child row
		 *
		 * @param  {DataTables.Api} row    API instance for the row
		 * @param  {boolean}        update Update flag
		 * @private
		 */
		_detailsDisplay: function (row, update) {
			var that = this;
			var dt = this.s.dt;
			var details = this.c.details;
			var event = function (res) {
				$(row.node()).toggleClass('dtr-expanded', res !== false);
				$(dt.table().node()).triggerHandler('responsive-display.dt', [
					dt,
					row,
					res,
					update
				]);
			};

			if (details && details.type !== false) {
				var renderer =
					typeof details.renderer === 'string'
						? Responsive.renderer[details.renderer]()
						: details.renderer;

				var res = details.display(
					row,
					update,
					function () {
						return renderer.call(
							that,
							dt,
							row[0][0],
							that._detailsObj(row[0])
						);
					},
					function () {
						event(false);
					}
				);

				if (typeof res === 'boolean') {
					event(res);
				}
			}
		},

		/**
		 * Initialisation for the details handler
		 *
		 * @private
		 */
		_detailsInit: function () {
			var that = this;
			var dt = this.s.dt;
			var details = this.c.details;

			// The inline type always uses the first child as the target
			if (details.type === 'inline') {
				details.target = 'td.dtr-control, th.dtr-control';
			}

			// Keyboard accessibility
			dt.on('draw.dtr', function () {
				that._tabIndexes();
			});
			that._tabIndexes(); // Initial draw has already happened

			$(dt.table().body()).on('keyup.dtr', 'td, th', function (e) {
				if (e.keyCode === 13 && $(this).data('dtr-keyboard')) {
					$(this).click();
				}
			});

			// type.target can be a string jQuery selector or a column index
			var target = details.target;
			var selector = typeof target === 'string' ? target : 'td, th';

			if (target !== undefined || target !== null) {
				// Click handler to show / hide the details rows when they are available
				$(dt.table().body()).on(
					'click.dtr mousedown.dtr mouseup.dtr',
					selector,
					function (e) {
						// If the table is not collapsed (i.e. there is no hidden columns)
						// then take no action
						if (!$(dt.table().node()).hasClass('collapsed')) {
							return;
						}

						// Check that the row is actually a DataTable's controlled node
						if (
							$.inArray(
								$(this).closest('tr').get(0),
								dt.rows().nodes().toArray()
							) === -1
						) {
							return;
						}

						// For column index, we determine if we should act or not in the
						// handler - otherwise it is already okay
						if (typeof target === 'number') {
							var targetIdx =
								target < 0
									? dt.columns().eq(0).length + target
									: target;

							if (dt.cell(this).index().column !== targetIdx) {
								return;
							}
						}

						// $().closest() includes itself in its check
						var row = dt.row($(this).closest('tr'));

						// Check event type to do an action
						if (e.type === 'click') {
							// The renderer is given as a function so the caller can execute it
							// only when they need (i.e. if hiding there is no point is running
							// the renderer)
							that._detailsDisplay(row, false);
						}
						else if (e.type === 'mousedown') {
							// For mouse users, prevent the focus ring from showing
							$(this).css('outline', 'none');
						}
						else if (e.type === 'mouseup') {
							// And then re-allow at the end of the click
							$(this).trigger('blur').css('outline', '');
						}
					}
				);
			}
		},

		/**
		 * Get the details to pass to a renderer for a row
		 * @param  {int} rowIdx Row index
		 * @private
		 */
		_detailsObj: function (rowIdx) {
			var that = this;
			var dt = this.s.dt;

			return $.map(this.s.columns, function (col, i) {
				// Never and control columns should not be passed to the renderer
				if (col.never || col.control) {
					return;
				}

				var dtCol = dt.settings()[0].aoColumns[i];

				return {
					className: dtCol.sClass,
					columnIndex: i,
					data: dt.cell(rowIdx, i).render(that.c.orthogonal),
					hidden: dt.column(i).visible() && !that.s.current[i],
					rowIndex: rowIdx,
					title: dt.column(i).title()
				};
			});
		},

		/**
		 * Find a breakpoint object from a name
		 *
		 * @param  {string} name Breakpoint name to find
		 * @return {object}      Breakpoint description object
		 * @private
		 */
		_find: function (name) {
			var breakpoints = this.c.breakpoints;

			for (var i = 0, ien = breakpoints.length; i < ien; i++) {
				if (breakpoints[i].name === name) {
					return breakpoints[i];
				}
			}
		},

		/**
		 * Re-create the contents of the child rows as the display has changed in
		 * some way.
		 *
		 * @private
		 */
		_redrawChildren: function () {
			var that = this;
			var dt = this.s.dt;

			dt.rows({ page: 'current' }).iterator('row', function (settings, idx) {
				that._detailsDisplay(dt.row(idx), true);
			});
		},

		/**
		 * Alter the table display for a resized viewport. This involves first
		 * determining what breakpoint the window currently is in, getting the
		 * column visibilities to apply and then setting them.
		 *
		 * @param  {boolean} forceRedraw Force a redraw
		 * @private
		 */
		_resize: function (forceRedraw) {
			var that = this;
			var dt = this.s.dt;
			var width = $(window).innerWidth();
			var breakpoints = this.c.breakpoints;
			var breakpoint = breakpoints[0].name;
			var columns = this.s.columns;
			var i, ien;
			var oldVis = this.s.current.slice();

			// Determine what breakpoint we are currently at
			for (i = breakpoints.length - 1; i >= 0; i--) {
				if (width <= breakpoints[i].width) {
					breakpoint = breakpoints[i].name;
					break;
				}
			}

			// Show the columns for that break point
			var columnsVis = this._columnsVisiblity(breakpoint);
			this.s.current = columnsVis;

			// Set the class before the column visibility is changed so event
			// listeners know what the state is. Need to determine if there are
			// any columns that are not visible but can be shown
			var collapsedClass = false;

			for (i = 0, ien = columns.length; i < ien; i++) {
				if (
					columnsVis[i] === false &&
					!columns[i].never &&
					!columns[i].control &&
					!dt.column(i).visible() === false
				) {
					collapsedClass = true;
					break;
				}
			}

			$(dt.table().node()).toggleClass('collapsed', collapsedClass);

			var changed = false;
			var visible = 0;
			var dtSettings = dt.settings()[0];
			var colGroup = $(dt.table().node()).children('colgroup');
			var colEls = dtSettings.aoColumns.map(function (col) {
				return col.colEl;
			});

			dt.columns()
				.eq(0)
				.each(function (colIdx, i) {
					//console.log(colIdx, i);
					// Do nothing on DataTables' hidden column - DT removes it from the table
					// so we need to slide back
					if (!dt.column(colIdx).visible()) {
						return;
					}

					if (columnsVis[i] === true) {
						visible++;
					}

					if (forceRedraw || columnsVis[i] !== oldVis[i]) {
						changed = true;
						that._setColumnVis(colIdx, columnsVis[i]);
					}

					// DataTables 2 uses `col` to define the width for a column
					// and this needs to run each time, as DataTables will change
					// the column width. We may need to reattach if we've removed
					// an element previously.
					if (!columnsVis[i]) {
						colEls[i].detach();
					}
					else {
						that._colGroupAttach(colGroup, colEls, i);
					}
				});

			if (changed) {
				dt.columns.adjust();

				this._redrawChildren();

				// Inform listeners of the change
				$(dt.table().node()).trigger('responsive-resize.dt', [
					dt,
					this._responsiveOnlyHidden()
				]);

				// If no records, update the "No records" display element
				if (dt.page.info().recordsDisplay === 0) {
					$('td', dt.table().body()).eq(0).attr('colspan', visible);
				}
			}

			that._controlClass();
		},

		/**
		 * Determine the width of each column in the table so the auto column hiding
		 * has that information to work with. This method is never going to be 100%
		 * perfect since column widths can change slightly per page, but without
		 * seriously compromising performance this is quite effective.
		 *
		 * @private
		 */
		_resizeAuto: function () {
			var dt = this.s.dt;
			var columns = this.s.columns;
			var that = this;
			var visibleColumns = dt
				.columns()
				.indexes()
				.filter(function (idx) {
					return dt.column(idx).visible();
				});

			// Are we allowed to do auto sizing?
			if (!this.c.auto) {
				return;
			}

			// Are there any columns that actually need auto-sizing, or do they all
			// have classes defined
			if (
				$.inArray(
					true,
					$.map(columns, function (c) {
						return c.auto;
					})
				) === -1
			) {
				return;
			}

			// Clone the table with the current data in it
			var clonedTable = dt.table().node().cloneNode(false);
			var clonedHeader = $(dt.table().header().cloneNode(false)).appendTo(
				clonedTable
			);
			var clonedFooter = $(dt.table().footer().cloneNode(false)).appendTo(
				clonedTable
			);
			var clonedBody = $(dt.table().body())
				.clone(false, false)
				.empty()
				.appendTo(clonedTable); // use jQuery because of IE8

			clonedTable.style.width = 'auto';

			// Header
			dt.table()
				.header.structure(visibleColumns)
				.forEach((row) => {
					var cells = row
						.filter(function (el) {
							return el ? true : false;
						})
						.map(function (el) {
							return $(el.cell)
								.clone(false)
								.css('display', 'table-cell')
								.css('width', 'auto')
								.css('min-width', 0);
						});

					$('<tr/>').append(cells).appendTo(clonedHeader);
				});

			// Always need an empty row that we can read widths from
			var emptyRow = $('<tr/>').appendTo(clonedBody);

			for (var i = 0; i < visibleColumns.count(); i++) {
				emptyRow.append('<td/>');
			}

			// Body rows
			dt.rows({ page: 'current' }).every(function (rowIdx) {
				var node = this.node();

				if (!node) {
					return;
				}

				// We clone the table's rows and cells to create the sizing table
				var tr = node.cloneNode(false);

				dt.cells(rowIdx, visibleColumns).every(function (rowIdx2, colIdx) {
					// If nodes have been moved out (listHiddenNodes), we need to
					// clone from the store
					var store = that.s.childNodeStore[rowIdx + '-' + colIdx];

					if (store) {
						$(this.node().cloneNode(false))
							.append($(store).clone())
							.appendTo(tr);
					}
					else {
						$(this.node()).clone(false).appendTo(tr);
					}
				});

				clonedBody.append(tr);
			});

			// Any cells which were hidden by Responsive in the host table, need to
			// be visible here for the calculations
			clonedBody.find('th, td').css('display', '');

			// Footer
			dt.table()
				.footer.structure(visibleColumns)
				.forEach((row) => {
					var cells = row
						.filter(function (el) {
							return el ? true : false;
						})
						.map(function (el) {
							return $(el.cell)
								.clone(false)
								.css('display', 'table-cell')
								.css('width', 'auto')
								.css('min-width', 0);
						});

					$('<tr/>').append(cells).appendTo(clonedFooter);
				});

			// In the inline case extra padding is applied to the first column to
			// give space for the show / hide icon. We need to use this in the
			// calculation
			if (this.c.details.type === 'inline') {
				$(clonedTable).addClass('dtr-inline collapsed');
			}

			// It is unsafe to insert elements with the same name into the DOM
			// multiple times. For example, cloning and inserting a checked radio
			// clears the chcecked state of the original radio.
			$(clonedTable).find('[name]').removeAttr('name');

			// A position absolute table would take the table out of the flow of
			// our container element, bypassing the height and width (Scroller)
			$(clonedTable).css('position', 'relative');

			var inserted = $('<div/>')
				.css({
					width: 1,
					height: 1,
					overflow: 'hidden',
					clear: 'both'
				})
				.append(clonedTable);

			inserted.insertBefore(dt.table().node());

			// The cloned table now contains the smallest that each column can be
			emptyRow.children().each(function (i) {
				var idx = dt.column.index('fromVisible', i);
				columns[idx].minWidth = this.offsetWidth || 0;
			});

			inserted.remove();
		},

		/**
		 * Get the state of the current hidden columns - controlled by Responsive only
		 */
		_responsiveOnlyHidden: function () {
			var dt = this.s.dt;

			return $.map(this.s.current, function (v, i) {
				// If the column is hidden by DataTables then it can't be hidden by
				// Responsive!
				if (dt.column(i).visible() === false) {
					return true;
				}
				return v;
			});
		},

		/**
		 * Set a column's visibility.
		 *
		 * We don't use DataTables' column visibility controls in order to ensure
		 * that column visibility can Responsive can no-exist. Since only IE8+ is
		 * supported (and all evergreen browsers of course) the control of the
		 * display attribute works well.
		 *
		 * @param {integer} col      Column index
		 * @param {boolean} showHide Show or hide (true or false)
		 * @private
		 */
		_setColumnVis: function (col, showHide) {
			var that = this;
			var dt = this.s.dt;
			var display = showHide ? '' : 'none'; // empty string will remove the attr

			this._setHeaderVis(col, showHide, dt.table().header.structure());
			this._setHeaderVis(col, showHide, dt.table().footer.structure());

			dt.column(col)
				.nodes()
				.to$()
				.css('display', display)
				.toggleClass('dtr-hidden', !showHide);

			// If the are child nodes stored, we might need to reinsert them
			if (!$.isEmptyObject(this.s.childNodeStore)) {
				dt.cells(null, col)
					.indexes()
					.each(function (idx) {
						that._childNodesRestore(dt, idx.row, idx.column);
					});
			}
		},

		/**
		 * Set the a column's visibility, taking into account multiple rows
		 * in a header / footer and colspan attributes
		 * @param {*} col
		 * @param {*} showHide
		 * @param {*} structure
		 */
		_setHeaderVis: function (col, showHide, structure) {
			var that = this;
			var display = showHide ? '' : 'none';

			structure.forEach(function (row) {
				if (row[col]) {
					$(row[col].cell)
						.css('display', display)
						.toggleClass('dtr-hidden', !showHide);
				}
				else {
					// In a colspan - need to rewind calc the new span since
					// display:none elements do not count as being spanned over
					var search = col;

					while (search >= 0) {
						if (row[search]) {
							row[search].cell.colSpan = that._colspan(row, search);
							break;
						}

						search--;
					}
				}
			});
		},

		/**
		 * How many columns should this cell span
		 *
		 * @param {*} row Header structure row
		 * @param {*} idx The column index of the cell to span
		 */
		_colspan: function (row, idx) {
			var colspan = 1;

			for (var col = idx + 1; col < row.length; col++) {
				if (row[col] === null && this.s.current[col]) {
					// colspan and not hidden by Responsive
					colspan++;
				}
				else if (row[col]) {
					// Got the next cell, jump out
					break;
				}
			}

			return colspan;
		},

		/**
		 * Update the cell tab indexes for keyboard accessibility. This is called on
		 * every table draw - that is potentially inefficient, but also the least
		 * complex option given that column visibility can change on the fly. Its a
		 * shame user-focus was removed from CSS 3 UI, as it would have solved this
		 * issue with a single CSS statement.
		 *
		 * @private
		 */
		_tabIndexes: function () {
			var dt = this.s.dt;
			var cells = dt.cells({ page: 'current' }).nodes().to$();
			var ctx = dt.settings()[0];
			var target = this.c.details.target;

			cells.filter('[data-dtr-keyboard]').removeData('[data-dtr-keyboard]');

			if (typeof target === 'number') {
				dt.cells(null, target, { page: 'current' })
					.nodes()
					.to$()
					.attr('tabIndex', ctx.iTabIndex)
					.data('dtr-keyboard', 1);
			}
			else {
				// This is a bit of a hack - we need to limit the selected nodes to just
				// those of this table
				if (target === 'td:first-child, th:first-child') {
					target = '>td:first-child, >th:first-child';
				}

				$(target, dt.rows({ page: 'current' }).nodes())
					.attr('tabIndex', ctx.iTabIndex)
					.data('dtr-keyboard', 1);
			}
		}
	});

	/**
	 * List of default breakpoints. Each item in the array is an object with two
	 * properties:
	 *
	 * * `name` - the breakpoint name.
	 * * `width` - the breakpoint width
	 *
	 * @name Responsive.breakpoints
	 * @static
	 */
	Responsive.breakpoints = [
		{ name: 'desktop', width: Infinity },
		{ name: 'tablet-l', width: 1024 },
		{ name: 'tablet-p', width: 768 },
		{ name: 'mobile-l', width: 480 },
		{ name: 'mobile-p', width: 320 }
	];

	/**
	 * Display methods - functions which define how the hidden data should be shown
	 * in the table.
	 *
	 * @namespace
	 * @name Responsive.defaults
	 * @static
	 */
	Responsive.display = {
		childRow: function (row, update, render) {
			var rowNode = $(row.node());

			if (update) {
				if (rowNode.hasClass('dtr-expanded')) {
					row.child(render(), 'child').show();

					return true;
				}
			}
			else {
				if (!rowNode.hasClass('dtr-expanded')) {
					var rendered = render();

					if (rendered === false) {
						return false;
					}

					row.child(rendered, 'child').show();
					return true;
				}
				else {
					row.child(false);

					return false;
				}
			}
		},

		childRowImmediate: function (row, update, render) {
			var rowNode = $(row.node());

			if (
				(!update && rowNode.hasClass('dtr-expanded')) ||
				!row.responsive.hasHidden()
			) {
				// User interaction and the row is show, or nothing to show
				row.child(false);

				return false;
			}
			else {
				// Display
				var rendered = render();

				if (rendered === false) {
					return false;
				}

				row.child(rendered, 'child').show();

				return true;
			}
		},

		// This is a wrapper so the modal options for Bootstrap and jQuery UI can
		// have options passed into them. This specific one doesn't need to be a
		// function but it is for consistency in the `modal` name
		modal: function (options) {
			return function (row, update, render, closeCallback) {
				var modal;
				var rendered = render();

				if (rendered === false) {
					return false;
				}

				if (!update) {
					// Show a modal
					var close = function () {
						modal.remove(); // will tidy events for us
						$(document).off('keypress.dtr');
						$(row.node()).removeClass('dtr-expanded');

						closeCallback();
					};

					modal = $('<div class="dtr-modal"/>')
						.append(
							$('<div class="dtr-modal-display"/>')
								.append(
									$('<div class="dtr-modal-content"/>')
										.data('dtr-row-idx', row.index())
										.append(rendered)
								)
								.append(
									$(
										'<div class="dtr-modal-close">&times;</div>'
									).click(function () {
										close();
									})
								)
						)
						.append(
							$('<div class="dtr-modal-background"/>').click(
								function () {
									close();
								}
							)
						)
						.appendTo('body');

					$(row.node()).addClass('dtr-expanded');

					$(document).on('keyup.dtr', function (e) {
						if (e.keyCode === 27) {
							e.stopPropagation();

							close();
						}
					});
				}
				else {
					modal = $('div.dtr-modal-content');

					if (modal.length && row.index() === modal.data('dtr-row-idx')) {
						modal.empty().append(rendered);
					}
					else {
						// Modal not shown, nothing to update
						return null;
					}
				}

				if (options && options.header) {
					$('div.dtr-modal-content').prepend(
						'<h2>' + options.header(row) + '</h2>'
					);
				}

				return true;
			};
		}
	};

	/**
	 * Display methods - functions which define how the hidden data should be shown
	 * in the table.
	 *
	 * @namespace
	 * @name Responsive.defaults
	 * @static
	 */
	Responsive.renderer = {
		listHiddenNodes: function () {
			return function (api, rowIdx, columns) {
				var that = this;
				var ul = $(
					'<ul data-dtr-index="' + rowIdx + '" class="dtr-details"/>'
				);
				var found = false;

				$.each(columns, function (i, col) {
					if (col.hidden) {
						var klass = col.className
							? 'class="' + col.className + '"'
							: '';

						$(
							'<li ' +
							klass +
							' data-dtr-index="' +
							col.columnIndex +
							'" data-dt-row="' +
							col.rowIndex +
							'" data-dt-column="' +
							col.columnIndex +
							'">' +
							'<span class="dtr-title">' +
							col.title +
							'</span> ' +
							'</li>'
						)
							.append(
								$('<span class="dtr-data"/>').append(
									that._childNodes(
										api,
										col.rowIndex,
										col.columnIndex
									)
								)
							) // api.cell( col.rowIndex, col.columnIndex ).node().childNodes ) )
							.appendTo(ul);

						found = true;
					}
				});

				return found ? ul : false;
			};
		},

		listHidden: function () {
			return function (api, rowIdx, columns) {
				var data = $.map(columns, function (col) {
					var klass = col.className
						? 'class="' + col.className + '"'
						: '';

					return col.hidden
						? '<li ' +
						klass +
						' data-dtr-index="' +
						col.columnIndex +
						'" data-dt-row="' +
						col.rowIndex +
						'" data-dt-column="' +
						col.columnIndex +
						'">' +
						'<span class="dtr-title">' +
						col.title +
						'</span> ' +
						'<span class="dtr-data">' +
						col.data +
						'</span>' +
						'</li>'
						: '';
				}).join('');

				return data
					? $(
						'<ul data-dtr-index="' +
						rowIdx +
						'" class="dtr-details"/>'
					).append(data)
					: false;
			};
		},

		tableAll: function (options) {
			options = $.extend(
				{
					tableClass: ''
				},
				options
			);

			return function (api, rowIdx, columns) {
				var data = $.map(columns, function (col) {
					var klass = col.className
						? 'class="' + col.className + '"'
						: '';

					return (
						'<tr ' +
						klass +
						' data-dt-row="' +
						col.rowIndex +
						'" data-dt-column="' +
						col.columnIndex +
						'">' +
						'<td>' +
						col.title +
						':' +
						'</td> ' +
						'<td>' +
						col.data +
						'</td>' +
						'</tr>'
					);
				}).join('');

				return $(
					'<table class="' +
					options.tableClass +
					' dtr-details" width="100%"/>'
				).append(data);
			};
		}
	};

	/**
	 * Responsive default settings for initialisation
	 *
	 * @namespace
	 * @name Responsive.defaults
	 * @static
	 */
	Responsive.defaults = {
		/**
		 * List of breakpoints for the instance. Note that this means that each
		 * instance can have its own breakpoints. Additionally, the breakpoints
		 * cannot be changed once an instance has been creased.
		 *
		 * @type {Array}
		 * @default Takes the value of `Responsive.breakpoints`
		 */
		breakpoints: Responsive.breakpoints,

		/**
		 * Enable / disable auto hiding calculations. It can help to increase
		 * performance slightly if you disable this option, but all columns would
		 * need to have breakpoint classes assigned to them
		 *
		 * @type {Boolean}
		 * @default  `true`
		 */
		auto: true,

		/**
		 * Details control. If given as a string value, the `type` property of the
		 * default object is set to that value, and the defaults used for the rest
		 * of the object - this is for ease of implementation.
		 *
		 * The object consists of the following properties:
		 *
		 * * `display` - A function that is used to show and hide the hidden details
		 * * `renderer` - function that is called for display of the child row data.
		 *   The default function will show the data from the hidden columns
		 * * `target` - Used as the selector for what objects to attach the child
		 *   open / close to
		 * * `type` - `false` to disable the details display, `inline` or `column`
		 *   for the two control types
		 *
		 * @type {Object|string}
		 */
		details: {
			display: Responsive.display.childRow,

			renderer: Responsive.renderer.listHidden(),

			target: 0,

			type: 'inline'
		},

		/**
		 * Orthogonal data request option. This is used to define the data type
		 * requested when Responsive gets the data to show in the child row.
		 *
		 * @type {String}
		 */
		orthogonal: 'display'
	};

	/*
	 * API
	 */
	var Api = $.fn.dataTable.Api;

	// Doesn't do anything - work around for a bug in DT... Not documented
	Api.register('responsive()', function () {
		return this;
	});

	Api.register('responsive.index()', function (li) {
		li = $(li);

		return {
			column: li.data('dtr-index'),
			row: li.parent().data('dtr-index')
		};
	});

	Api.register('responsive.rebuild()', function () {
		return this.iterator('table', function (ctx) {
			if (ctx._responsive) {
				ctx._responsive._classLogic();
			}
		});
	});

	Api.register('responsive.recalc()', function () {
		return this.iterator('table', function (ctx) {
			if (ctx._responsive) {
				ctx._responsive._resizeAuto();
				ctx._responsive._resize();
			}
		});
	});

	Api.register('responsive.hasHidden()', function () {
		var ctx = this.context[0];

		return ctx._responsive
			? $.inArray(false, ctx._responsive._responsiveOnlyHidden()) !== -1
			: false;
	});

	Api.registerPlural(
		'columns().responsiveHidden()',
		'column().responsiveHidden()',
		function () {
			return this.iterator(
				'column',
				function (settings, column) {
					return settings._responsive
						? settings._responsive._responsiveOnlyHidden()[column]
						: false;
				},
				1
			);
		}
	);

	/**
	 * Version information
	 *
	 * @name Responsive.version
	 * @static
	 */
	Responsive.version = '3.0.2';

	$.fn.dataTable.Responsive = Responsive;
	$.fn.DataTable.Responsive = Responsive;

	// Attach a listener to the document which listens for DataTables initialisation
	// events so we can automatically initialise
	$(document).on('preInit.dt.dtr', function (e, settings, json) {
		if (e.namespace !== 'dt') {
			return;
		}

		if (
			$(settings.nTable).hasClass('responsive') ||
			$(settings.nTable).hasClass('dt-responsive') ||
			settings.oInit.responsive ||
			DataTable.defaults.responsive
		) {
			var init = settings.oInit.responsive;

			if (init !== false) {
				new Responsive(settings, $.isPlainObject(init) ? init : {});
			}
		}
	});


	return DataTable;
}));


/*! Bootstrap 5 integration for DataTables' Responsive
 * © SpryMedia Ltd - datatables.net/license
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net-bs5', 'datatables.net-responsive'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		var jq = require('jquery');
		var cjsRequires = function (root, $) {
			if (!$.fn.dataTable) {
				require('datatables.net-bs5')(root, $);
			}

			if (!$.fn.dataTable.Responsive) {
				require('datatables.net-responsive')(root, $);
			}
		};

		if (typeof window === 'undefined') {
			module.exports = function (root, $) {
				if (!root) {
					// CommonJS environments without a window global must pass a
					// root. This will give an error otherwise
					root = window;
				}

				if (!$) {
					$ = jq(root);
				}

				cjsRequires(root, $);
				return factory($, root, root.document);
			};
		}
		else {
			cjsRequires(window, jq);
			module.exports = factory(jq, window, window.document);
		}
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document) {
	'use strict';
	var DataTable = $.fn.dataTable;



	var _display = DataTable.Responsive.display;
	var _original = _display.modal;
	var _modal = $(
		'<div class="modal fade dtr-bs-modal" role="dialog">' +
		'<div class="modal-dialog" role="document">' +
		'<div class="modal-content">' +
		'<div class="modal-header">' +
		'<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
		'</div>' +
		'<div class="modal-body"/>' +
		'</div>' +
		'</div>' +
		'</div>'
	);
	var modal;

	// Note this could be undefined at the time of initialisation - the
	// DataTable.Responsive.bootstrap function can be used to set a different
	// bootstrap object
	var _bs = window.bootstrap;

	DataTable.Responsive.bootstrap = function (bs) {
		_bs = bs;
	};

	_display.modal = function (options) {
		if (!modal && _bs.Modal) {
			modal = new _bs.Modal(_modal[0]);
		}

		return function (row, update, render, closeCallback) {
			if (!modal) {
				return _original(row, update, render, closeCallback);
			}
			else {
				var rendered = render();

				if (rendered === false) {
					return false;
				}

				if (!update) {
					if (options && options.header) {
						var header = _modal.find('div.modal-header');
						var button = header.find('button').detach();

						header
							.empty()
							.append('<h4 class="modal-title">' + options.header(row) + '</h4>')
							.append(button);
					}

					_modal.find('div.modal-body').empty().append(rendered);

					_modal
						.data('dtr-row-idx', row.index())
						.one('hidden.bs.modal', closeCallback)
						.appendTo('body');

					modal.show();
				}
				else {
					if ($.contains(document, _modal[0]) && row.index() === _modal.data('dtr-row-idx')) {
						_modal.find('div.modal-body').empty().append(rendered);
					}
					else {
						// Modal not shown for this row - do nothing
						return null;
					}
				}

				return true;
			}
		};
	};


	return DataTable;
}));


