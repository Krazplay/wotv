/*
	WotV-tables v2
	Contain the common code used by all the html datatable pages and the functions to
	produce the array which will feed the datatables
	get_datatables_xxx => Create an array of objects to be used as data for datatables
*/

/*
*   ====================            TABLE            ====================
*	====================            Espers           ====================
*/
function get_datatable_Esper() {
	let line_id = 1;
	result = [];
	// If ID is in Esper Ability Board, then in unit file it's an equipable esper
	for (let [iname, item] of netherBeastAbilityBoard) {
		let base_esper = unit.get(iname)
		let max_awk = 1+base_esper.nb_awake_id.length;
		// One line per awakening + one for base
		for (let awk_nb = 0; awk_nb < max_awk; awk_nb++) {
			// Pick the right esper unit depending of the awakening
			let esper = awk_nb == 0 ? base_esper : unit.get(base_esper.nb_awake_id[awk_nb-1])
			let line = {};
			line["iname"] = esper.iname;
			line["name"] = unitName[esper.iname] ? unitName[esper.iname] : esper.iname;
			line["awk"] = awk_nb;
			// Is this the highest awakening level ?
			line["bestv"] = (awk_nb == max_awk-1) ? 1 : 0;
			// Checkbox Owned
			line["owned"] = "<input type=\"checkbox\" id='"+esper.iname+"'></input>"
			// Memo input
			line["memo"] = "<input type=\"text\" class=\"memo\" id='"+esper.iname+"_memo'></input>"
			// Getting all the possible stats, status[1] is the object with max stats
			const stats = Object.keys(esper.status[1]);
			stats.forEach((stat, value) => {
				line[stat] = esper.status[1][stat];
			});
			// Alternative text format to show element and condition resistances (alternative to icons)
			let columns = ["asl","api","abl","ash","ama","ewi","eth","efi","eic","esh","eea","eda","ewa","cpo","cbl","csl","cmu","cpa","ccf","cpe","cfr","cch","csw","cst","cdm","cda","cbe","cdo"];
			line["stat_type_elmt_text"] = "";
			columns.forEach((stat) => {
				if (esper.status[1][stat]) {
					line["stat_type_elmt_text"] += stattxt[stat]
					if (esper.status[1][stat]>=0) line["stat_type_elmt_text"] += "+";
					line["stat_type_elmt_text"] +=esper.status[1][stat]+", ";
				}
			});
			line["stat_type_elmt_text"] = line["stat_type_elmt_text"].slice(0,-2); // remove last ", "
			// Element(s) of esper
			line["elem"] = elem_to_text(esper.elem)	
			
			// Get all the buffs of the esper at this awakening
			let buff_list = get_esper_buffs(iname, awk_nb);
			let sum_stats = {};
			for (let buff_id of buff_list) {
				let bonus_stats = buff_id_to_stat(buff_id, false);
				sum_stats = sum_of_stats(sum_stats, bonus_stats);
			}
			// Delete the key after using it, it's easier to check if some buffs are not handled
			columns = ["hp%","mp%","ap%","atk%","mag%","luk%","asl","api","abl","ash","ama"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? sum_stats[stat]+"%" : "";
				delete sum_stats[stat];
			});
			// Type atk buffs text format (alternative to icons)
			line["type_atk_buffs_text"] = "";
			columns = ["atk_asl","atk_api","atk_abl","atk_ash","atk_ama"];
			columns.forEach((stat) => {
				if (sum_stats[stat]) { line["type_atk_buffs_text"] += stattxt[stat]+"+"+sum_stats[stat]+", "; }
			});
			line["type_atk_buffs_text"] = line["type_atk_buffs_text"].slice(0,-2); // remove last ", "
			
			columns = ["hit","avd","crt","crta", "crtd", "atk_asl","atk_api","atk_abl","atk_ash","atk_ama","iniap"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? "+"+sum_stats[stat] : "";
				delete sum_stats[stat];
			});
			columns = ["def","mnd","evoc","activ_time"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? sum_stats[stat] : "";
				delete sum_stats[stat];
			});
			// Atk buffs text format
			line["atk_buffs"] = "";
			columns = ["atk_ewi","atk_eth","atk_efi","atk_eic","atk_esh","atk_eea","atk_eda","atk_ewa","eater_fire","eater_ice","eater_wind","eater_earth","eater_lightning","eater_Water","eater_light","eater_dark"];
			columns.forEach((stat) => {
				if (stattxt[stat]) {
					if (sum_stats[stat]) {
						line["atk_buffs"] += stattxt[stat]+"+"+sum_stats[stat]+", ";
						delete sum_stats[stat];
					}
				}
				else console.log("Not handled in stattxt: "+stat);
			});
			line["atk_buffs"] = line["atk_buffs"].slice(0,-2); // remove last ", "
			// Everything remaining in hash go to Res buff column
			line["res_buffs"] = "";
			for (const [stat, value] of Object.entries(sum_stats)) {
				if (stattxt[stat]) {
					line["res_buffs"] += stattxt[stat]+"+"+value+", ";
				}
				else console.log("Not handled in stattxt: "+stat);
			}
			line["res_buffs"] = line["res_buffs"].slice(0,-2); // remove last ", "
			
			line["line_id"] = line_id++;
			result.push(line);
		}
	}
	return result;
}


/*
*   ====================            TABLE            ====================
*	====================        Characters V2        ====================
*/
function get_datatable_Character() {
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
		// Checkbox and memo only for max level+total stats line
		base_line["owned"] = ""
		base_line["memo"] = ""
		
		// Status => [{Lv1}, {Lv99}, {Lv120}] Loop only on 99+
		let stats = get_unit_stats(iname);
		for (let i=1; unit_obj.status[i]; i++) {
			base_line["lvl"] = ["1","99","120"][i];
			// Loop on line_type
			for (const typstat of line_type) {
				// Line to push, starting from cloning base_line
				let line = Object.assign({}, base_line);
				line["stat_origin"] = typstat;
				// Max level ? if next status exist then no
				line["bestv"] = unit_obj.status[i+1] ? 0 : 1;
				// Checkbox and memo only for max level+total stats line
				if ((line["bestv"] == 1) && (typstat == "total")) {
					line["owned"] = "<input type=\"checkbox\" id='"+unit_obj.iname+"'></input>";
					line["memo"] = "<input type=\"text\" class=\"memo\" id='"+unit_obj.iname+"_memo'></input>";
				}
				
				// Loop on all existing stats
				stats_list_table.forEach((stat) => {
					if (stats[i][typstat][stat]) {
						line[stat] = stats[i][typstat][stat];
						delete stats[i][typstat][stat];
					}
					else { line[stat] = ""; }
				});
				
				if (stats[i][typstat]["hit_stat"] != null) {
					line["hit_stat"] = stats[i][typstat]["hit_stat"];
					delete stats[i][typstat]["hit_stat"];
				}
				else { line["hit_stat"] = ""; }
				
				if (stats[i][typstat]["avd_stat"] != null) {
					line["avd_stat"] = stats[i][typstat]["avd_stat"];
					delete stats[i][typstat]["avd_stat"];
				}
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
						delete stats[i][typstat][type_atk];
					}
				});
				
				// Element attacks loop
				element_atk_list.forEach((elmt_atk) => {
					if (stats[i][typstat][elmt_atk]) {
						line["element_atk"] += abbr[elmt_atk.slice(3)] + " Atk "
						if (stats[i][typstat][elmt_atk] >= 0) line["element_atk"] += "+"
						line["element_atk"] += stats[i][typstat][elmt_atk] + "<br/>";
						delete stats[i][typstat][elmt_atk];
					}
				});
				
				// Status attacks loop
				status_atk_list.forEach((sta_atk) => {
					if (stats[i][typstat][sta_atk]) {
						line["status_atk"] += abbr[sta_atk.slice(3)] + " "
						if (stats[i][typstat][sta_atk] >= 0) line["status_atk"] += "+"
						line["status_atk"] += stats[i][typstat][sta_atk] + "<br/>";
						delete stats[i][typstat][sta_atk];
					}
				});
				
				// Element resistances loop
				element_res_list.forEach((elmt_res) => {
					if (stats[i][typstat][elmt_res]) {
						line[elmt_res] = stats[i][typstat][elmt_res];
						delete stats[i][typstat][elmt_res];
					}
				});
				
				// Status resistances loop
				status_res_list.forEach((sta_res) => {
					if (stats[i][typstat][sta_res]) {
						line[sta_res] = stats[i][typstat][sta_res];
						delete stats[i][typstat][sta_res];
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
*   ====================            TABLE            ====================
*	====================         VC Sub Buff         ====================
*/
function get_datatable_VC_Sub_Buff() {
	let line_id = 1;
	result = [];
	for (let [id, item] of visioncardsubbuff) {
		let line = {};
		line["itemid"] = id;
		line["buff"] = item.buff;
		line["buff_text"] = typetxt[item.buff];
		line["ratio1"] = item.card_ratios[0]/10;
		line["ratio2"] = item.card_ratios[1]/10;
		line["ratio3"] = item.card_ratios[2]/10;
		line["ratio4"] = item.card_ratios[3]/10;
		line["ratio5"] = item.card_ratios[4]/10;
		// Push the line created
		line["line_id"] = line_id++;
		result.push(line);
	}
	return result;
}

/*
*   ====================   Common functions used   ====================
*	====================  in all datatables pages  ====================
*/

// Array will be used by datatable columnDefs to set their visibility to false
function get_columns_to_hide() {
	// Get url parameters
	const queryString = window.location.search;
	urlParams = new URLSearchParams(queryString);
	const hidecol = urlParams.get('hidecol');
	// If hidecol param in url, use that
	if (hidecol != null) {
		console.log("Columns visibility loaded from URL");
		return hidecol.split(',').map(x=>+x); // convert to array of integers
	}
	// Nothing in url, check localstorage
	else if ( localStorage.getItem(getPageName()+"_columns") != null ) {
		console.log("Columns visibility loaded from localstorage");
		return localStorage.getItem(getPageName()+"_columns").split(',').map(x=>+x);
	}
}

// Return what language to use
function get_language() {
	let lang = localStorage.getItem("language");
	if ( lang == null ) { lang = "en" }
	console.log("Language="+lang);
	return lang;
}

// Return the game version data to use
function get_version() {
	let version = localStorage.getItem("version");
	if ( version == null ) { version = "gl" }
	console.log("Game version="+version);
	return version;
}

// Used to prefix some local storage variable names with the page name
function getPageName() {
	var url = window.location.pathname;
    var index = url.lastIndexOf("/") + 1;
    var filenameWithExtension = url.substr(index);
    var filename = filenameWithExtension.split(".")[0];
    return filename;
}

// For all checkbox inputs, check the local storage for a saved state
function load_checkboxes_state() {
	$("input[type=checkbox]").each(function() {
		var id = $(this).attr('id');
		$(this).prop('checked', localStorage.getItem(id) == "true"); // getItem return a string
	});
	
	$("input[type=text].memo").each(function() {
		var id = $(this).attr('id');
		$(this).val( localStorage.getItem(id) );
	});
}

// Add an event on all checboxes, saving any state change in local storage
function add_event_save_checkbox() {
	$("input[type=checkbox]").change(function() {
		var id = $(this).attr('id');
		localStorage.setItem(id, $(this).prop('checked'));
	});
	
	$("input[type=text].memo").on( 'keyup change', function() {
		var id = $(this).attr('id');
		//console.log($(this).val());
		localStorage.setItem(id, $(this).val());
	});
}

// Proced by onkeyup event or memo size input
function memoSizeChange(e) {
	let val = parseInt(document.getElementById(e.target.id).value);
	if (!isNaN(val)) {
		localStorage.setItem(e.target.id, val);
		$( ".thmemo" ).css({"min-width": val+"px"});
		$( ".thmemo" ).css({"max-width": val+"px"});
	}
}

// Delay to avoid filtering while the user is still typing
function delay(fn, ms) {
	let timer = 0
	return function(...args) {
		clearTimeout(timer);
		timer = setTimeout(fn.bind(this, ...args), ms || 0);
	}
}

// If there are filters in the url as param, write them down in the input filter fields
// urlParams defined in get_columns_to_hide()
function prefill_filters_via_url() {
	// Filter prefilled via url
	let nb_columns = table.columns().count();
	let need_redraw = false;
	for (let i=0; i < nb_columns; i++) {
		let search_col = urlParams.get('filter'+i);
		if (search_col != null) {
			search_col = decodeURIComponent(search_col);
			if( $('input[name=regex_search]').is(':checked') ) {
				table.column(i).search( search_col, true, false );  // value, regex?, smart search?
			}
			else {
				table.column(i).search( search_col );
			}
			need_redraw = true;
			// write the url filter in the input field
			$( "table thead tr:eq(1) th[data-column-index='"+i+"'] input" ).val( search_col );
		}
	}
	if (need_redraw) table.draw(); // refresh only if an url filter was found
}

function attach_functions_on_events() {
	// Event fired when a column visibility change
	table.on( 'column-visibility.dt', function ( e, settings, column, state ) {
		save_col_vis_to_localstorage();
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
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
	
	// Event fired when the user finish moving a column
	table.on( 'column-reorder', function ( e, settings, details ) {
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
}

function set_default_val_dropdown() {
	$("#language").val(language);
	$("#version").val(version);
}

function languageChange(value) {
	console.log("Switch to "+value);
	localStorage.setItem("language", value);
	location.reload();
}

function versionChange(value) {
	console.log("Switch to "+value);
	localStorage.setItem("version", value);
	location.reload();
}

// Check columns visibility and input and write the equivalent url in #table_url
function refresh_url_span() {
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
	// Write the url in the document now
	var url_table = window.location.protocol + '//' + window.location.hostname + window.location.pathname;
	$('#table_url').html(url_table+url_param);
};

// Save current columns visibility into localstorage
function save_col_vis_to_localstorage() {
	var resultset = table.columns().visible();
	var list_col = "";
	for (var i = 1; i < resultset.length; i++) {
		if (resultset[i] == false) {
			if (list_col != "") list_col += ",";
			list_col += i.toString()
		};
	}
	localStorage.setItem(getPageName()+"_columns", list_col);
}