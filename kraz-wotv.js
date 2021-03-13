

/*
	Parse a json file from folder 'en', the key parameter value become the key in the result
	ex unitName["UN_LW_P_MONT"] => {"key"=>"UN_LW_P_MONT", "value"=>"Mont Leonis"}
*/
function parse_AnyName(data) {
	let mapName = {};
	data.infos.forEach((info) => {
	  if (info.value) mapName[info.key] = info.value;
	});
	return mapName;
}
/*
	The iname is not always enough to have a unique identifier, a second parameter may be needed to create a unique key
	example: adventureAreaDropDeck, you have one object per iname per campaign, iname is not unique
*/
function parse_AnyData(data, iname, iname2 = null) {
	let mapData = new Map();
	data.items.forEach((item) => {
		mapData.set(iname2 ? item[iname]+item[iname2] : item[iname], item);
	});
	return mapData;
}


/*
	Require adventureAreaDropDeck, adventureDropDeckEntity, adventureAreaName, itemName
	Return an array of objects
*/
function get_datatable_ArenaBonusUnit() {
	result = [];
	for (let [key, value] of adventureAreaDropDeck) {
		value.drop.forEach((table_params) => {
			let table_loot = adventureDropDeckEntity.get(table_params.drop_id);
			table_loot.rewards.forEach((reward) => {
				let line = {};
				line["area_iname"] = value["area_iname"];
				line["area_name"] = adventureAreaName[value["area_iname"]] ? adventureAreaName[value["area_iname"]] : value["area_iname"];
				line["campaign_string"] = value["campaign_string"];
				line["drop_id"] = table_params.drop_id;
				line["is_rare"] = table_params.is_rare ? table_params.is_rare : "0";
				line["rate"] = table_params.rate;
				line["fever_rate"] = table_params.fever_rate;
				line["fix_rate"] = table_params.fix_rate;
				line["reward_name"] = itemName[reward.iname] ? itemName[reward.iname] : reward.iname;
				//todo Use the bonus value from AdventureUnitBonusSetting, they may change in the future
				//Bonus S=>1 M=>3 L=>5 XL=>10
				line["reward_rate"] = ((table_params.rate + 0*table_params.fix_rate) * reward.rate / table_params.rate) / 1000;
				line["reward_rate_s"] = round( ((table_params.rate + 1*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_m"] = round( ((table_params.rate + 3*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_l"] = round( ((table_params.rate + 5*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_xl"] = round( ((table_params.rate + 10*table_params.fix_rate) * reward.rate / table_params.rate) / 1000, 3);
				line["reward_rate_fever"] = round( ((table_params.fever_rate) * reward.rate / table_params.rate) / 1000, 3);
				result.push(line);
			});
		});
	}
	return result;
}

// Because javascript
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
