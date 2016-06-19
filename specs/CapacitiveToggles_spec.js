//Currently not running
xdescribe("CapacitiveToggles", function() {
	var CapacitiveToggles = require("../CapacitiveToggles.js");

	var Cap = new CapacitiveToggles({
		explorerhat:false
	});
	
	it("should start up ok in no pi mode", function() {
		expect(Cap.stateByte).toEqual(0x00);
	});
  
});

