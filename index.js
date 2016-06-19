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
	expr_p();
}.bind(Cap);

// TODO : make something similar for each PQRS by loop?
function expr_p(){
	//console.log("expr_p");
	var sentence = document.getElementById("expr_p").value.toUpperCase();
	var TruthMachineP = new TruthMachine(sentence);
	var P = TruthMachineP.compute(Cap.data);
	Cap.setBit("P", P);
	document.getElementById("output_p").innerHTML = P;
	//console.log("expr_p sentence",sentence, "Cap", Cap ,"output",output);
}

expr_p();
