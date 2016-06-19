var CapacitiveToggles = require("./CapacitiveToggles.js");

var Cap = new CapacitiveToggles({
	interval:1000
});

var viewModel = ko.mapping.fromJS(Cap.data);
//console.log("built model");
ko.applyBindings(viewModel);
//console.log("applied model");

//Write the buttons back to the stateByte
// TODO :try this with a loop
{
	viewModel.A.subscribe(function(val) {
		Cap.setBit("A", val);
	});

	viewModel.B.subscribe(function(val) {
		Cap.setBit("B", val);
	});

	viewModel.C.subscribe(function(val) {
		Cap.setBit("C", val);
	});

	viewModel.D.subscribe(function(val) {
		Cap.setBit("D", val);
	});
	
	viewModel.E.subscribe(function(val) {
		Cap.setBit("E", val);
	});

	viewModel.F.subscribe(function(val) {
		Cap.setBit("F", val);
	});

	viewModel.G.subscribe(function(val) {
		Cap.setBit("G", val);
	});

	viewModel.H.subscribe(function(val) {
		Cap.setBit("H", val);
	});
}

//console.log("subscriptions added");

Cap.init();

//Add the mapping update into onchange?
Cap.onchange = function(){
	//console.log("onchange");
	//console.log(this);
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
