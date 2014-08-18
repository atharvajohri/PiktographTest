var PictogramModel = function(){
	var self = this;
	
	self.pictogramId = Utils.getRandomId();
	self.pictogramName = "";
	self.pictogramDataRows = [];
};

var PictogramDataRow = function(name, value, elementData){
	var self = this;
	
	self.pictogramDataName = name || "";
	self.pictogramDataValue = value || 0;
	self.elementData = elementData || null;
};