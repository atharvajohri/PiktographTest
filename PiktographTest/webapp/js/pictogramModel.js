var PictogramModel = function(){
	var self = this;
	
	self.pictogramName = "";
	self.pictogramDataRows = [];
};

var PictogramDataRow = function(name, value){
	var self = this;
	
	self.pictogramDataName = name || "";
	self.pictogramDataValue = value || 0;
};