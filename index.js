var i2c = require('i2c-bus');
var i2c1 = i2c.openSync(1);

// DEVICE MAP
DEFAULT_ADDR = 0x28

// Supported devices
PID_CAP1208 = 0b01101011
PID_CAP1188 = 0b01010000
PID_CAP1166 = 0b01010001

// REGISTER MAP

R_MAIN_CONTROL      = 0x00
R_GENERAL_STATUS    = 0x02
R_INPUT_STATUS      = 0x03
R_LED_STATUS        = 0x04
R_NOISE_FLAG_STATUS = 0x0A


var CapacitiveToggles = function(interval){
	this.inputByte = 0x00;
	this.stateByte = 0x00;
	this.interval = interval;
	
	this.buttonValues = {1:0x10,2:0x20,3:0x40,4:0x80,
		5:0x1,6:0x2,7:0x4,8:0x8};
	
	this.logicValues = {"A":0x10,"B":0x20,"C":0x40,"D":0x80,
		"E":0x1,"F":0x2,"G":0x4,"H":0x8};
	
	
	var self = this; 
	/*for(num in self.logicValues){
		Object.defineProperty(self, num, {
			get: function(i){ 
				return (this.stateByte &  this.logicValues[i]) > 0;
			}.bind(self, num)
		});
	} */
	
	this.update = function(){
		self.inputByte = i2c1.readByteSync(DEFAULT_ADDR, R_INPUT_STATUS);
		self.stateByte =  self.stateByte ^ self.inputByte;
		i2c1.writeByteSync(DEFAULT_ADDR, R_MAIN_CONTROL, 0x00);
		
		for(name in self.logicValues){
			self[name] = (self.stateByte &  self.logicValues[name]) > 0;
		};
		
		// TODO : use setter to write back to stateByte
		
		console.log(self.stateByte, self.A,self.B,self.C,self.D);
		
	}
	this.update();
	
	//setInterval(this.update.bind(this), this.interval);
}

var Cap = new CapacitiveToggles(2000);
//var viewModel = new LogicModel(Cap);

var viewModel = ko.mapping.fromJS(Cap);
ko.applyBindings(viewModel);

setInterval(function(){
	Cap.update.call(Cap);
	ko.mapping.fromJS(Cap, viewModel);
	console.log(Cap);
}, Cap.interval);
