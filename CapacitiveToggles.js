module.exports = CapacitiveToggles;
//
//http://ww1.microchip.com/downloads/en/DeviceDoc/00001570B.pdf 
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
const R_CONFIGURATION2    = 0x44;

const R_INPUT_1_DELTA   = 0x10;
const R_INPUT_2_DELTA   = 0x11;
const R_INPUT_3_DELTA   = 0x12;
const R_INPUT_4_DELTA   = 0x13;
const R_INPUT_5_DELTA   = 0x14;
const R_INPUT_6_DELTA   = 0x15;
const R_INPUT_7_DELTA   = 0x16;
const R_INPUT_8_DELTA   = 0x17;

const R_INPUT_1_THRESH  = 0x30;
const R_INPUT_2_THRESH  = 0x31;
const R_INPUT_3_THRESH  = 0x32;
const R_INPUT_4_THRESH  = 0x33;
const R_INPUT_5_THRESH  = 0x34;
const R_INPUT_6_THRESH  = 0x35;
const R_INPUT_7_THRESH  = 0x36;
const R_INPUT_8_THRESH  = 0x37;
		
function CapacitiveToggles(options){
	
	if(typeof options === "undefined") {
		options = {};
	}
	
	this.explorerhat = (typeof options.explorerhat !== "undefined")?options.explorerhat:true;
	this.cap_toggle  = (typeof options.cap_toggle !== "undefined")?options.cap_toggle:true;
	this.interval = options.interval || null;
	this.onchange = options.onchange || null;
	
	console.log("options", options, "settings", this);
	this.data = {};
	
	this.LED_Pins = { 
		 "P":4,
		 "Q":17,
		 "R":27, 
		 "S":5
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
		
		this.Threshholds = new Buffer(8);
		this.Deltas = new Buffer(8);
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
		//console.log("update");
		var currState = self.stateByte;	
		if(self.explorerhat) {	
			if(self.cap_toggle) {
				self.inputByte = self.i2c1.readByteSync(DEFAULT_ADDR, R_INPUT_STATUS);
				self.stateByte =  self.stateByte ^ self.inputByte;
				self.i2c1.writeByteSync(DEFAULT_ADDR, R_MAIN_CONTROL, 0x00);
			} else {
				self.i2c1.readI2cBlockSync(DEFAULT_ADDR, R_INPUT_1_THRESH, 8, self.Threshholds);
				self.i2c1.readI2cBlockSync(DEFAULT_ADDR, R_INPUT_1_DELTA , 8, self.Deltas);
				var newByte = 0x00;
				for(var i=0; i<8; i++){
					//console.log("i",i,"delta",self.Deltas[i],"threshold",self.Threshholds[i]);
					if(self.Deltas[i]<= 127 && self.Deltas[i]>= self.Threshholds[i]) {
						//console.log("threshold");
						newByte = newByte | Math.pow(2,i);
					}
				}
				//console.log("newByte", newByte);
				self.stateByte = newByte;
			}
		}
		
		for(var name in self.logicValues) {
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
