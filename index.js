var CapacitiveToggles = require("./CapacitiveToggles.js");


var Cap = new CapacitiveToggles({
	interval:500
	});

	var viewModel = ko.mapping.fromJS(Cap);
	ko.applyBindings(viewModel);

	//Write the buttons back to the stateByte
	// TODO :try this with a loop
	{
		viewModel.A.subscribe(function(val) {
			Cap.updateBit("A", val);
		});

		viewModel.B.subscribe(function(val) {
			Cap.updateBit("B", val);
		});

		viewModel.C.subscribe(function(val) {
			Cap.updateBit("C", val);
		});

		viewModel.D.subscribe(function(val) {
			Cap.updateBit("D", val);
		});
		
		viewModel.E.subscribe(function(val) {
			Cap.updateBit("E", val);
		});

		viewModel.F.subscribe(function(val) {
			Cap.updateBit("F", val);
		});

		viewModel.G.subscribe(function(val) {
			Cap.updateBit("G", val);
		});

		viewModel.H.subscribe(function(val) {
			Cap.updateBit("H", val);
		});
	}
		
	//Add the mapping update into onchange?
	Cap.onchange = function(){
			ko.mapping.fromJS(this, viewModel); // Writes back to screen
			expr_p();
		}.bind(Cap);

// TODO : make something similar for each PQRS by loop?
function expr_p(){
	var sentence = document.getElementById("expr_p").value.toUpperCase();
	var TruthMachineP = new TruthMachine(sentence);
	Cap.P = TruthMachineP.compute(Cap);
	document.getElementById("output_p").innerHTML = Cap.P;
	
	//console.log("expr_p sentence",sentence, "Cap", Cap ,"output",output);
}

expr_p();

//var viewModel = new LogicModel(Cap);

