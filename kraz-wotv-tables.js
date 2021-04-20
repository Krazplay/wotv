/*
	WotV-tables javascript
	Contain the common code used by all the html datatable pages and the functions to
	produce the array which will feed the datatables
	get_datatables_xxx => Create an array of objects to be used as data for datatables
*/


/*
*   ====================          TABLE            ====================
*	==================== Playable characters stats ====================
*/
function get_datatable_Characters_stats() {
	result = [];
	let line_type = ["base","board","master","total"];
	let line_id = 1;
	
	// Loop only on playable characters
	for (const [iname] of unitAbilityBoard) {
		unit_obj = unit.get(iname);

		let base_line = {};
		base_line["iname"] = unit_obj.iname;
		base_line["name"] = unitName[unit_obj.iname] ? unitName[unit_obj.iname] : unit_obj.iname;
		base_line["sex"] = unit_obj.sex == 1 ? "M" : unit_obj.sex == 2 ? "F" : "?";
		base_line["rare"] = unit_obj.rare ? rareName[unit_obj.rare] : "";
		base_line["cost"] = unit_obj.cost;
		base_line["elem"] = elem_to_text(unit_obj.elem);
		base_line["birth"] = birthTitle[unit_obj.birth];
		base_line["species"] = species_to_text(unit_obj.species);
		base_line["jobs"] = "";
		for (const job_id of unit_obj.jobsets) {
			base_line["jobs"] += (jobName[job_id] ? jobName[job_id] : job_id) + "<br/>";
		}
		// Filled up in the loop:
		base_line["lvl"] = "";
		base_line["type_atk"] = "";
		base_line["element_atk"] = "";
		base_line["status_atk"] = "";
		base_line["element_res"] = "";
		base_line["status_res"] = "";
		base_line["kill"] = "";
		base_line["party_buffs"] = "";
		
		// Status => [{Lv1}, {Lv99}, {Lv120}] Loop only on 99+
		let stats = get_unit_stats(iname);
		for (let i=1; unit_obj.status[i]; i++) {
			base_line["lvl"] = ["1","99","120"][i];
			// Loop on line_type
			for (const typstat of line_type) {
				// Line to push, starting from cloning base_line
				let line = Object.assign({}, base_line);
				line["stat_origin"] = typstat;
				// Loop on all existing stats
				stats_list_table.forEach((stat) => {
					if (stats[i][typstat][stat]) { line[stat] = stats[i][typstat][stat] }
					else { line[stat] = ""; }
				});
				
				if (stats[i][typstat]["hit_stat"] != null) { line["hit_stat"] = stats[i][typstat]["hit_stat"] }
				else { line["hit_stat"] = ""; }
				if (stats[i][typstat]["avd_stat"] != null) { line["avd_stat"] = stats[i][typstat]["avd_stat"] }
				else { line["avd_stat"] = ""; }
				
				// Party bonus
				let partybonus = stats[i][typstat]["party"];
				if (partybonus) {
					for (sign in partybonus) {
						for (stat in partybonus[sign]) {
							for (conds in partybonus[sign][stat]) {
								for (continues in partybonus[sign][stat][conds]) {
									line["party_buffs"] += condsTxt(conds)+ " allies: "
									line["party_buffs"] += abbrTxt(stat)+" "
									if (partybonus[sign][stat][conds][continues] >= 0) line["party_buffs"] += "+"
									line["party_buffs"] += partybonus[sign][stat][conds][continues];
									if (sign=="%") line["party_buffs"] += "%";
									line["party_buffs"] += "<br/>";
								}
							}
						}
					}
				}
				
				// Type attacks loop
				type_atk_list.forEach((type_atk) => {
					if (stats[i][typstat][type_atk]) {
						line["type_atk"] += abbr[type_atk.slice(3)] + " Atk "
						if (stats[i][typstat][type_atk] >= 0) line["type_atk"] += "+"
						line["type_atk"] += stats[i][typstat][type_atk] + "<br/>";
					}
				});
				
				// Element attacks loop
				element_atk_list.forEach((elmt_atk) => {
					if (stats[i][typstat][elmt_atk]) {
						line["element_atk"] += abbr[elmt_atk.slice(3)] + " Atk "
						if (stats[i][typstat][elmt_atk] >= 0) line["element_atk"] += "+"
						line["element_atk"] += stats[i][typstat][elmt_atk] + "<br/>";
					}
				});
				
				// Status attacks loop
				status_atk_list.forEach((sta_atk) => {
					if (stats[i][typstat][sta_atk]) {
						line["status_atk"] += abbr[sta_atk.slice(3)] + " "
						if (stats[i][typstat][sta_atk] >= 0) line["status_atk"] += "+"
						line["status_atk"] += stats[i][typstat][sta_atk] + "<br/>";
					}
				});
				
				// Element resistances loop
				element_res_list.forEach((elmt_res) => {
					if (stats[i][typstat][elmt_res]) {
						line["element_res"] += abbr[elmt_res] + " Res "
						if (stats[i][typstat][elmt_res] >= 0) line["element_res"] += "+"
						line["element_res"] += stats[i][typstat][elmt_res] + "<br/>";
					}
				});
				
				// Status resistances loop
				status_res_list.forEach((sta_res) => {
					if (stats[i][typstat][sta_res]) {
						line["status_res"] += abbr[sta_res] + " Res "
						if (stats[i][typstat][sta_res] >= 0) line["status_res"] += "+"
						line["status_res"] += stats[i][typstat][sta_res] + "<br/>";
					}
				});
				
				// Element eater, type killer, etc...
				// If there is at least one killer bonus
				if (stats[i][typstat]["kill"]) {
					// Loop on the table keeping all the tag_id present
					for (const tag_id of stats[i][typstat]["kill"]) {
						// Do we have a name for this tag ?
						let tag_name = tagtxt[tag_id];
						if (tag_name) {	line["kill"] += tag_name+" "+stats[i][typstat]["kill"+tag_id]+"<br/>"; }
						else {
							console.log("Lack definition of tag "+tag_id);
							line["kill"] += "Something "+stats[i][typstat]["kill"+tag_id]+"<br/>";
						}
					}
				}
				// Push the line created
				line["line_id"] = line_id++;
				result.push(line);
			}
		}
	}
	return result;
}


/*
*   ====================   Common functions used   ====================
*	====================  in all datatables pages  ====================
*/

// Delay to avoid filtering while the user is still typing
function delay(fn, ms) {
	let timer = 0
	return function(...args) {
		clearTimeout(timer);
		timer = setTimeout(fn.bind(this, ...args), ms || 0);
	}
}


// Check columns visibility and input and write the equivalent url in #table_url
function refresh_url() {
	var table = $('#myTable').DataTable();
	let url_param = "";
	
	if (urlParams.get('file')) url_param += "?file="+urlParams.get('file');
	
	// Loop as much as there are columns
	let nb_columns = table.columns().count();
	for (let i=1; i < nb_columns; i++) {
		// Try to get the input val
		let input_val = $( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val();
		if (input_val != "" && input_val != null) {
			url_param += (url_param == "") ? "?" : "&";
			url_param += "filter"+i+"="+encodeURIComponent(input_val);
		}
	}
	
	// Check all the columns not visible and build an url parameter with them
	var resultset = table.columns().visible();
	var list_col = "";
	for (var i = 1; i < resultset.length; i++) {
		if (resultset[i] == false) {
			if (list_col != "") list_col += ",";
			list_col += i.toString()
		};
	}
	if (list_col != "") {
		url_param += (url_param == "") ? "?" : "&";
		url_param += "hidecol="+list_col;
	}
	// Write the url in the document now
	var url_table = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
	$('#table_url').html(url_table+url_param);
};

// Handle hidecol url parameter
function handle_url_params() {
	// Check url
	const queryString = window.location.search;
	urlParams = new URLSearchParams(queryString);
	// if file=jp, use jp file and not global
	datadir = '/data/'
	if (urlParams.get('file') == "jp") { datadir = "/jpdata/" }
	// hide columns via url
	const hidecol = urlParams.get('hidecol')
	array_hidecol = [];
	if (hidecol != null) {
		array_hidecol = hidecol.split(',').map(x=>+x) // convert to array of integers
	}
}

function attach_functions_on_events() {
	// Event fired when a column visibility change
	table.on( 'column-visibility.dt', function ( e, settings, column, state ) {
		refresh_url();
	});
	
	// Event fired when the user start moving a row
	nb_lines = table.rows().count();
	table.on( 'pre-row-reorder.dt', function ( e, node, index ) {
		for (let i=0; i < nb_lines; i++) {
			let r = table.row( ':eq('+i+')' )
			r.data().line_id = i+1;
			r.invalidate();
		}
	} );
	
	// Event fired when the user finish moving a row
	table.on( 'row-reordered.dt', function ( e, diff, edit ) {
		table.order( [ 0, 'asc' ] ).draw();
	} );
}

function prefill_filters_via_url() {
	// Filter prefilled via url
	let nb_columns = table.columns().count();
	let need_redraw = false;
	for (let i=0; i < nb_columns; i++) {
		let search_col = urlParams.get('filter'+i);
		if (search_col != null) {
			search_col = decodeURIComponent(search_col);
			table.column(i).search( search_col );
			need_redraw = true;
			// write the url filter in the input field
			$( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val( search_col );
		}
	}
	if (need_redraw) table.draw(); // refresh only if an url filter was found
}