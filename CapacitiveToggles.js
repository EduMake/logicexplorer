module.exports = CapacitiveToggles;

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
		
function CapacitiveToggles(options){
	
	if(typeof options === "undefined") {
		options = {};
	}
	
	this.explorerhat = options.explorerhat || true;
	this.cap_toggle = options.cap_toggle || true;
	this.interval = options.interval || null;
	this.onchange = options.onchange || null;
	
	this.data = {};
	
	this.LED_Pins = { 
		 "P":4,
		 "Q":17,
		 "R":27, 
		 "S":25
		 };
	
	for(var name in this.LED_Pins){
		this.data[name] = false;
	}
	
	this.inputByte = 0x00;
	this.stateByte = 0x00;
	
	this.logicValues = {
		"A":0x10,"B":0x20,"C":0x40,"D":0x80,
		"E":0x1,"F":0x2,"G":0x4,"H":0x8
		};
	
	//Set the varibles to false
	for(var name in this.logicValues){
		this.data[name] = false;
	}
}
	
CapacitiveToggles.prototype.init = function(){
	if(this.explorerhat) {	
		this.i2c = require('i2c-bus');
		this.i2c1 = this.i2c.openSync(1);
		
		this.rpio = require('rpio');
		this.rpio.init({mapping: 'gpio'});
		for(sLED in this.LED_Pins){
			this.rpio.open(this.LED_Pins[sLED], this.rpio.OUTPUT, this.rpio.LOW);
		}
	}
	
	var self = this; 
	this.setBit = function(name, val) {
		var Curr = self.data[name];
		self.data[name] = val;
		if(self.logicValues.hasOwnProperty(name)){
			if(self.data[name]){
				//To set a bit:
				self.stateByte |= self.logicValues[name];
			} else {
				//To clear a bit:
				self.stateByte &= ~self.logicValues[name];
			}
		}
		
		if(self.onchange !== null && Curr !== val){
			self.onchange.call(self);
			self.updateLEDs();
		}
	};
	
	this.updateLEDs =function(){
		if(self.explorerhat) {	
			//console.log("updateLEDs");
			for(sLED in this.LED_Pins){
				var bVal = self.data[sLED];
				var iVal = bVal?self.rpio.HIGH: self.rpio.LOW;
				//console.log("sLED", sLED, "Pin", self.LED_Pins[sLED], "bVal", bVal, "iVal", iVal);
				self.rpio.write(self.LED_Pins[sLED], iVal );
			}
		}
	}
	
	this.update = function(){
		var currState = self.stateByte;	
		if(self.explorerhat) {	
			self.inputByte = self.i2c1.readByteSync(DEFAULT_ADDR, R_INPUT_STATUS);
			self.stateByte =  self.stateByte ^ self.inputByte;
			self.i2c1.writeByteSync(DEFAULT_ADDR, R_MAIN_CONTROL, 0x00);
		}
		
		for(var name in self.logicValues){
			self.data[name] = (self.stateByte &  self.logicValues[name]) > 0;
		}
		
		if(currState !== self.stateByte) {
			//console.log(currState, self.stateByte, self.A,self.B,self.C,self.D, self.E,self.F,self.G,self.H);
			//console.log("new State", self.data.A,self.data.B,self.data.C,self.data.D, self.data.E,self.data.F,self.data.G,self.data.H, self.data.P,self.data.Q,self.data.R,self.data.S);
			if(self.onchange !== null){
				self.onchange.call(self);
				self.updateLEDs();
			}
		}
	};
	
	this.update();
	if(this.interval !== null){
		setInterval(this.update.bind(this), this.interval);
	}
};
