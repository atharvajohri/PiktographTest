var PictogramModel = function(){
	var self = this;
	
	self.pictogramId = Utils.getRandomId();
	self.pictogramName = "";
	self.pictogramLineHeight = 0;
	self.pictogramDataRows = [];
	self.iconRatio = 0;
};

var PictogramDataRow = function(name, value, iconType, iconColor, iconURL, elementData){
	var self = this;
	
	self.pictogramDataName = name || "";
	self.pictogramDataValue = value || 0;
	self.pictogramIconType = iconType || "circle";
	self.pictogramIconColor = iconColor || "555555";
	self.pictogramIconURL = iconURL || GlobalElements.defaultPictogramIconUrl;
	self.elementData = elementData || null;
	self.iconCount = self.pictogramDataValue;
	self.pictogramIconImageLoaded = false;
	
	
	self.pictogramImageObject = new Image();
	self.pictogramImageObject.onload = function(){
		self.pictogramIconImageLoaded = true;
	};
	self.pictogramImageObject.src = self.pictogramIconURL;
	
};