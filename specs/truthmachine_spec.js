
describe("Our version of Truthmachine", function() {

	var fs = require("fs");
	var load = fs.readFileSync("./node_modules/truthmachine/js/sentential-logic.js").toString();
	var load2 = fs.readFileSync("./node_modules/truthmachine/js/truthmachine.js").toString();
	eval(load + load2);

	var logicValues = {"T":true, "F":false};
	
	it("should calc expression 'T' to be true", function() {
    var TruthMachineP = new TruthMachine("T");
	var output = TruthMachineP.compute(logicValues);
	expect(output).toBe(true);
  });
  
  it("should NOT F", function() {
    var TruthMachineP = new TruthMachine("NOT F");
	var output = TruthMachineP.compute(logicValues);
	expect(output).toBe(true);
  });
  
  it("should OR T F", function() {
    var TruthMachineP = new TruthMachine("T OR F");
	var output = TruthMachineP.compute(logicValues);
	expect(output).toBe(true);
  });
  
  it("should cope with complex ones", function() {
    var TruthMachineP = new TruthMachine("(T XOR ( T XOR F)) NOR F");
	var output = TruthMachineP.compute(logicValues);
	expect(output).toBe(true);
  });
});

