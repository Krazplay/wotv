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
*   ====================          TABLE            ====================
*	==================== Playable characters stats with passives applied ====================
*/
function get_datatable_Characters_stats_passives() {
	result = [];
	let line_type = ["total"];
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
		
		// Get unit stats
		let stats = get_unit_stats(iname);
		// Get passive skills
		let passives = get_passives_skills(iname, 25);
		console.log(iname);
		console.log(passives);
		
		
	}
}

/*
*   ====================          TABLE            ====================
*	====================   Espers (NetherBeasts)   ====================
*/
function get_datatable_NetherBeast() {
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
			// Getting all the possible stats, status[1] is the object with max stats
			stats_list.forEach((stat) => {
				line[stat] = esper.status[1][stat] ? esper.status[1][stat] : "";
			});
			// Element(s) of esper
			line["elem"] = ""
			esper.elem.forEach((elemt) => {
				line["elem"] += typetxt[41+elemt] + ", ";
			});
			line["elem"] = line["elem"].slice(0,-2); // remove last ", "		
			// Get all the buffs of the esper at this awakening
			let buff_list = get_esper_buffs(iname, awk_nb);
			// Merge similar buffs, this is now an array of buff objects
			buff_list = sum_of_buffs_id(buff_list);
			// Sort array to show most useful buffs first
			buff_list.sort((a, b) => a.sort_priority - b.sort_priority);
			// To improve readability I've added columns for specific buffs type
			line["atk_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 1));
			line["elmt_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 2));
			line["stat_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 3));
			line["atk_res_buffs"] = bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] == 19));
			
			data = ["hit", "avd", "crt", "crta", "crtd"];
			type = [  155,   156,   158,    159,    157];
			
			for (let i = 0; i < data.length; i++) {
				let buff = buff_list.find(buff_obj => buff_obj["type1"] == type[i]);
				if (buff) line[data[i]] = buff["val1"]
				else line[data[i]] = "";
			}
			
			//console.log( buff_list.filter(buff_obj => buff_obj["sort_priority"] == 7) );
			// Translate into a readable text
			line["skills_txt"] =  bufflist_to_txt(buff_list.filter(buff_obj => buff_obj["sort_priority"] > 13 && buff_obj["sort_priority"] != 19));
			
			line["line_id"] = line_id++;
			result.push(line);
		}
	}
	return result;
}

/*
*   ====================            TABLE            ====================
*	====================          Espers V2          ====================
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
			stats_list.forEach((stat) => {
				line[stat] = esper.status[1][stat] ? esper.status[1][stat] : "";
			});
			// Element(s) of esper
			line["elem"] = ""
			esper.elem.forEach((elemt) => {
				line["elem"] += typetxt[41+elemt] + ", ";
			});
			line["elem"] = line["elem"].slice(0,-2); // remove last ", "		
			// Get all the buffs of the esper at this awakening
			let buff_list = get_esper_buffs(iname, awk_nb);
			
			let sum_stats = {};
			for (let buff_id of buff_list) {
				let bonus_stats = buff_id_to_stat_v2(buff_id, false);
				sum_stats = sum_of_stats(sum_stats, bonus_stats);
			}
			// Delete the key after using it, it's easier to check if some buffs are not handled
			let columns = ["hp%","mp%","ap%","atk%","mag%","luk%","asl_res","api_res","abl_res","ash_res","ama_res"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? sum_stats[stat]+"%" : "";
				delete sum_stats[stat];
			});
			columns = ["hit","avd","crt","crta", "crtd", "asl","api","abl","ash","ama","iniap"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? "+"+sum_stats[stat] : "";
				delete sum_stats[stat];
			});
			columns = ["def","mnd","evoc","activ_time"];
			columns.forEach((stat) => {
				line[stat] = (sum_stats[stat]) ? sum_stats[stat] : "";
				delete sum_stats[stat];
			});
			
			line["atk_buffs"] = "";
			columns = ["ewi","eth","efi","eic","esh","eea","eda","ewa","eater_fire","eater_ice","eater_wind","eater_earth","eater_lightning","eater_Water","eater_light","eater_dark"];
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
		let stats = get_unit_stats_v2(iname);
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
*   ====================          TABLE            ====================
*	==================== Artifacts base stats only ====================
*	Not useful for players, but a fast way to check the raw data
*/
function get_datatable_Artifact_base() {
	result = [];
	let line_id = 1;
	
	let typeName = ["Weapon","Armor","Accessory", "-1"];
	// todo replace catName with file data
	let catName = ["0","Dagger","Sword","Greatsword","Katana","Staff","Ninja Blade","Bow","Axe", "HammerNotUsed",
					"Spear","InstrumentNotUsed","WhipNotUsed","ProjectileNotUsed","Gun","Mace","Fists","Shield","Armor","Hat",
					"Helm","Clothing","Accessory","Gloves","CAT24","CAT25","CAT26"];
	// Loop on all equipment
	for (let [iname, equip] of artifact) {
		let line = {};
		//let grow_id = lot_rtype["grow"+i];
		line["iname"] = equip.iname;
		line["name"] = artifactName[equip.iname] ? artifactName[equip.iname] : equip.iname;
		line["type"] = typeName[equip.type] ? typeName[equip.type] : equip.type;
		line["cat"] = ""
		equip.cat.forEach((cat) => {
			line["cat"] += catName[cat]+", "
		});
		line["cat"] = line["cat"].slice(0,-2);
		line["rare"] = rareName[equip.rare];
		line["trust"] = equip.trust ? equip.trust : "";
		line["collaboType"] = equip.collaboType ? equip.collaboType : "";
		line["cap"] = equip.cap ? equip.cap : "";
		line["equip"] = equip.equip ? equip.equip : "";
		//line["rtype"] = equip.rtype;
		//let lot_rtype = artifactRandLot.get(equip.rtype)["lot"][0]
		line["rtype"] = "";
		if (equip.rtype) {
			let lot_rtype = artifactRandLot.get(equip.rtype)["lot"][0];
			for (let i=1; lot_rtype["grow"+i]; i++) {
				if (i>1) line["rtype"] += "<br/>";
				let type_name = artifactGrow[lot_rtype["grow"+i]];
				if (type_name) line["rtype"] += type_name;
				else if (lot_rtype["grow"+i] == "ARTIFACT_TRUST") line["rtype"] += "Trust";
				else line["rtype"] += lot_rtype["grow"+i];
			}
		}
		
		//line["grow"] = grow_id;
		line["bestv"] = 0;
		let plus_one = equip.iname.charCodeAt(equip.iname.length-1) + 1;
		let test = equip.iname.slice(0, equip.iname.length-2)+"_"+String.fromCharCode(plus_one);
		if (!artifact.get(equip.iname+"_1") && !artifact.get(test)) line["bestv"] = 1;
		// Getting all the possible stats, status[1] is the object with max stats
		equip_stat_list.forEach((stat) => {
			if (equip.status[1]) line["max_"+stat] = equip.status[1][stat] != null ? equip.status[1][stat] : "";
			else line["max_"+stat] = "";
			
			if (equip.randa) line["amt_"+stat] = equip.randa[0][stat] != null ? equip.randa[0][stat] : "";
			else line["amt_"+stat] = "";
			
			if (equip.randr) line["rate_"+stat] = equip.randr[0][stat] != null ? equip.randr[0][stat] : "";
			else line["rate_"+stat] = "";
		});
		// skl6 exist but seems a mistake (Ras Algethi only)
		["skl1","skl2","skl3","skl4","skl5"].forEach((skparam) => {
			line[skparam] = "";
			if (equip[skparam]) {
				equip[skparam].forEach((skill_id) => {
					line[skparam] += skillid_to_txt(skill_id)+", ";
				});
				line[skparam] = line[skparam].slice(0,-2); // remove last ", "
			}
		});
		line["line_id"] = line_id++;
		result.push(line);
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
	localStorage.setItem(getPageName()+"_columns", list_col);
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
		array_hidecol = hidecol.split(',').map(x=>+x); // convert to array of integers
	}
	else if ( localStorage.getItem(getPageName()+"_columns") != null ) {
		//console.log("Using localstorage "+getPageName());
		array_hidecol = localStorage.getItem(getPageName()+"_columns").split(',').map(x=>+x);
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
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
	} );
	
	// Event fired when the user finish moving a column
	table.on( 'column-reorder', function ( e, settings, details ) {
		load_checkboxes_state(); // needed to keep checkboxes state after the reorder
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

// Used to prefix local storage variable names
function getPageName() {
	var url = window.location.pathname;
    var index = url.lastIndexOf("/") + 1;
    var filenameWithExtension = url.substr(index);
    var filename = filenameWithExtension.split(".")[0];
    return filename;
}