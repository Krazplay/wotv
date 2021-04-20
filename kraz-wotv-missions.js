/*
	*wotv-parser-missions*
	Contain fonctions for mission maps json
*/

// Rough display of the content an object
function object_to_html(quest_obj, indent=0) {
	let result = "";
	let str_ind = "";
	for (let i=0; i < indent; i++) { str_ind += "&nbsp"; }
	for (let key in quest_obj) {
		result += str_ind;
		if (typeof quest_obj[key] === 'object') {
			result += key+":<br/>";
			result += object_to_html(quest_obj[key], indent+6);
		}
		else result += key+": "+quest_obj[key]+"<br/>";
	}
	return result;
}

function extract_mapset_enemies_to_html(map_set_json) {
	let result = "";
	let list = get_mapset_enemies(map_set_json);
	let count = {};
	//console.log(list);
	
	list.forEach((enemy) => {
		result += enemy.name + " Lv" +enemy.lv + "<br/>";
		let elem_str = typetxt[41+enemy.elem];
		result += elem_str + ", drop: " + enemy.drop + ", enemy id:"+enemy.iname+"<br/>";
		if (!count[enemy.drop]) count[enemy.drop] = 0;
		count[enemy.drop] += 1;
		if (!count[enemy.crystal]) count[enemy.crystal] = 0;
		count[enemy.crystal] += 1;
	});
	
	result += "<br/><br/><br/>"
	// test drop display
	map_set_json["drop_table_list"].forEach((drop_table) => {
		let number_drop = count[drop_table["iname"]] ? count[drop_table["iname"]] : 0;
		result += drop_table["iname"] + " (" + number_drop + ")<br/>";
		// Calculate sum of weight instead of assuming 10000
		drop_table["drop_list"].forEach((drop) => {
			if (!drop_table["total_weight"]) drop_table["total_weight"] = 0;
			drop_table["total_weight"] += drop["weight"];
		});
		
		result += "<table style='margin-left: 30px;'>";
		result += "<thead><tr><th>Name</th><th>Amount</th><th>Weight</th><th>Drop rate</th><th>Average per mission</th></tr></thead>";
		result += "<tbody>";
		drop_table["drop_list"].forEach((drop) => {
			result += "<tr>"; // new row
			let item_name = itemName[drop["drop_data"]["iname"]] ? itemName[drop["drop_data"]["iname"]] : drop["drop_data"]["iname"];
			result += "<td>"+item_name+"</td>"; // 1st cell item name
			result += "<td>x"+drop["drop_data"]["num"]+"</td>"; // 2nd cell amount of drop
			result += "<td>"+drop["weight"]+"</td>"; // 3rd cell weight
			result += "<td>"+round(100*drop["weight"]/drop_table["total_weight"], 3)+"%</td>"; // 4th cell calculated drop rate
			result += "<td>"+round(number_drop*drop["drop_data"]["num"]*drop["weight"]/drop_table["total_weight"], 4)+"</td>"; // 5th cell average drop per mission
			result += "</tr>"; // end row
		});
		result += "</tbody></table>";
		result += "&emsp;&emsp;- Total weight= " + drop_table["total_weight"] + "<br/><br/>";
	});
	
	return result;
}

function get_mapset_enemies(map_set_json) {
	let result = [];
	map_set_json["enemy"].forEach((enemy) => {
		if (!enemy.name) enemy.name = unitName[enemy.iname] ? unitName[enemy.iname] : enemy.iname;
		result.push(enemy);
	});
	//console.log(result);
	return result;
}