/*This file holds the models for the pictogram.
If a pictogram model is properly populated, then it can be drawn on the canvas by calling setupPictogramViewOnCanvas() function*/

//this is the base pictogram model
var PictogramModel = function(){
	var self = this;
	
	self.pictogramId = Utils.getRandomId(); //a pictogram numeric identifier
	self.pictogramName = ""; //name for pictogram
	self.pictogramLineHeight = 0; //line height - used during positioning the pictogram & its data on the canvas
	self.pictogramDataRows = []; //each pictogram holds some data stored as an array of PictogramDataRow models (see the next model)
	self.iconRatio = 0; //this holds each unit value of the icon in the pictogram
	
	self.pictogramImageData; //this stores the pictogram image data  such as the data url, positions and dimensions for the pictogram rendered via the temporary canvas
};

//each data row stored in PictogramModel.pictogramDataRows
var PictogramDataRow = function(name, value, iconType, iconColor, iconURL, elementData){
	var self = this;
	
	self.pictogramDataName = name || ""; //data name
	self.pictogramDataValue = value || 0; //value of the data represented by number of icons on the pictogram
	self.pictogramIconType = iconType || "circle"; //can be a circle, square or an icon
	self.pictogramIconColor = iconColor || "555555"; //hex value of the color of the icon - only used if the icon type is square or circle
	self.pictogramIconURL = iconURL || GlobalElements.defaultPictogramIconUrl; //icon url - if the icon type is an icon (ie, an external image)
	self.elementData = elementData || null; //each pictogram row's data is identified by DOM elements. this is used to highlight the correct element during validation failure
	self.iconCount = self.pictogramDataValue; //number of icons for this data row to be shown on the pictogram
	self.pictogramIconImageLoaded = false; //has image for the pictogram been loaded (used if iconType == icon)
	
	
	self.pictogramImageObject = new Image(); //the image object of the data row's icon which holds the external image 
	self.pictogramImageObject.onload = function(){ //loaded callback for the data row's external icon url
		self.pictogramIconImageLoaded = true;
	};
	self.pictogramImageObject.src = self.pictogramIconURL;
	
};

var PictogramImageData = function(imageDataURL, imageWidth, imageHeight, imageX, imageY){
	var self = this;
	
	self.pictogramImageLoaded = false;
	self.pictogramImage = new Image(); //the image object of the data row's icon which holds the external image 
	self.pictogramImage.onload = function(){ //loaded callback for the data row's external icon url
		self.pictogramImageLoaded = true;
	};
	self.pictogramImage.src = imageDataURL;
	
	self.imageWidth = imageWidth;
	self.imageHeight = imageHeight;
	
	self.imageX = imageX;
	self.imageY = imageY;
};