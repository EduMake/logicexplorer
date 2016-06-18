
var CapacitiveToggles = function(options){
	
	if(typeof options === "undefined") {
		options = {};
	}
	
	this.explorerhat = options.explorerhat || true;
	this.cap_toggle = options.cap_toggle || true;
	this.interval = options.interval || null;
	this.onchange = options.onchange || null;
	
	//console.log("options",options, "this",this);
	
	this.i2c = require('i2c-bus');
	this.i2c1 = this.i2c.openSync(1);

	// DEVICE MAP
	const DEFAULT_ADDR = 0x28;

	// Supported devices
	const PID_CAP1208 = 0b01101011;
	const PID_CAP1188 = 0b01010000;
	const PID_CAP1166 = 0b01010001;

	// REGISTER MAP

	const R_MAIN_CONTROL      = 0x00;
	const R_GENERAL_STATUS    = 0x02;
	const R_INPUT_STATUS      = 0x03;
	const R_LED_STATUS        = 0x04;
	const R_NOISE_FLAG_STATUS = 0x0A;
	
	this.inputByte = 0x00;
	this.stateByte = 0x00;
	
	this.buttonValues = {1:0x10,2:0x20,3:0x40,4:0x80,
		5:0x1,6:0x2,7:0x4,8:0x8};
	
	this.logicValues = {
		"A":0x10,"B":0x20,"C":0x40,"D":0x80,
		"E":0x1,"F":0x2,"G":0x4,"H":0x8
		};
	
	
	this.P = false;
	this.Q = false;
	this.R = false;
	this.S = false;
	
	var self = this; 
	
	for(var name in self.logicValues){
		self[name] = (self.stateByte &  self.logicValues[name]) > 0;
	}
	
	this.updateBit = function(name, val) {
		self[name] = val;
		if(self[name]){
			//To set a bit:
			self.stateByte |= self.logicValues[name];
		} else {
			//To clear a bit:
			self.stateByte &= ~self.logicValues[name];
		}
		
		if(self.onchange !== null){
			self.onchange.call(self);
		}
	};
	
	this.update = function(){
		var currState = self.stateByte;	
		if(this.explorerhat) {	
			self.inputByte = self.i2c1.readByteSync(DEFAULT_ADDR, R_INPUT_STATUS);
			self.stateByte =  self.stateByte ^ self.inputByte;
			self.i2c1.writeByteSync(DEFAULT_ADDR, R_MAIN_CONTROL, 0x00);
		}
		
		for(var name in self.logicValues){
			self[name] = (self.stateByte &  self.logicValues[name]) > 0;
		}
		
		if(currState !== self.stateByte) {
			//console.log(currState, self.stateByte, self.A,self.B,self.C,self.D, self.E,self.F,self.G,self.H);
			console.log("new State", self.A,self.B,self.C,self.D, self.E,self.F,self.G,self.H, self.P,self.Q,self.R,self.S);
			if(self.onchange !== null){
				self.onchange.call(self);
			}
		}
		// TODO : use setter to write back to stateByte
	};
	
	this.update();
	if(this.interval !== null){
		setInterval(this.update.bind(this), this.interval);
	}
};


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
		
	//Add the mapping update into onchange
	Cap.onchange = function(){
			ko.mapping.fromJS(this, viewModel); // Writes back to screen
			expr_p();
		}.bind(Cap);

function expr_p(){
	var sentence = document.getElementById("expr_p").value.toUpperCase();
	var TruthMachineP = new TruthMachine(sentence);
	Cap.P = TruthMachineP.compute(Cap);
	document.getElementById("output_p").innerHTML = Cap.P;
	
	//console.log("expr_p sentence",sentence, "Cap", Cap ,"output",output);
}

expr_p();

//var viewModel = new LogicModel(Cap);

