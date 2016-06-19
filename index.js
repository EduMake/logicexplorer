var CapacitiveToggles = require("./CapacitiveToggles.js");

var Cap = new CapacitiveToggles({
	interval:1000
});

var viewModel = ko.mapping.fromJS(Cap.data);
//console.log("built model");
ko.applyBindings(viewModel);
//console.log("applied model");

//Write the buttons back to the stateByte and Cap.data
for(var name in Cap.logicValues){
	viewModel[name].subscribe(function(name, val) {
		Cap.setBit(name, val);
	}.bind(Cap, name));
}

//Split this out trying to sort out data binding issues, not sure its a good idea
Cap.init();

//Add the mapping update into onchange?
Cap.onchange = function(){
	ko.mapping.fromJS(this.data, viewModel); // Writes back to screen
	recalcLogic();
}.bind(Cap);

// TODO : make something similar for each PQRS by loop?
function recalcLogic(){
	for(var name in Cap.LED_Pins){
		var sentence = document.getElementById("expr_"+name).value.toUpperCase().trim(" ");
		if(sentence.length > 0) {
			var TruthMachineP = new TruthMachine(sentence);
			Cap.setBit(name, TruthMachineP.compute(Cap.data));	
		} else {
			Cap.setBit(name, false);
		}
		
	}
}

Cap.onchange();
