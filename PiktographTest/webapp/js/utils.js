var GlobalElements = {
	overlay : document.getElementById("popup-overlay"),
	newChartPopup : document.getElementById("new-chart-popup"),
	pictogramsContainer : document.getElementById("charts-container"),
	blankChartPopupHTML : document.getElementById("new-chart-popup").innerHTML,
	defaultPictogramIconUrl : "http://icons.iconarchive.com/icons/yellowicon/game-stars/256/Mario-icon.png",
	sharePictogramsButton : document.getElementById("share-pictogram-btn") 
};

var dataBindingAttributeName = "data-binding";

var Utils = {};
var BindingUtils = {};
var ElementUtils = {};

Utils.addClass = function(element, className){
	if (!Utils.hasClass(element, className)){
		element.setAttribute("class", element.getAttribute("class") + " " + className);	
	}
};

Utils.removeClass = function(element, className){
	element.setAttribute("class", element.getAttribute("class").replace(className, "").trim());
};

Utils.hasClass = function(element, className){
	var assignedClasses = element.getAttribute("class");
	var hasClass = false;
	if (assignedClasses && assignedClasses.indexOf(className) > -1){
		hasClass = true;
	}
	
	return hasClass;
};

Utils.showOverlay = function(){
	Utils.removeClass(GlobalElements.overlay, "hide");
};

Utils.hideOverlay = function(){
	Utils.addClass(GlobalElements.overlay, "hide");
};

Utils.errorHighlightTextBox = function(element){
	Utils.addClass(element, "error-input");
	element.addEventListener("click", function(){
		Utils.removeClass(element, "error-input");
	});
};

Utils.repositionContainer = function(container, heightAlso){
	var w_w = window.innerWidth;
	var w_h = window.innerHeight;
	
	var c_w = Number(window.getComputedStyle(container).width.toString().replace("px", "")) + 60; //40 to account for padding
	var c_h = Number(window.getComputedStyle(container).height.toString().replace("px", "")) + 60;
	
	container.style.left = ((w_w - c_w)/2) + "px";
	if (heightAlso){
		container.style.top = ((w_h - c_h)/2) + "px";		
	}
};

Utils.getAllElementsInsideContainer = function (container, matcherForPossibleElements){
	var possibleElements = [];
	if (container.childElementCount > 0 && container.tagName !== "SELECT"){
		for (var i =0; i<container.childElementCount;i++){
			possibleElements = possibleElements.concat(Utils.getAllElementsInsideContainer(container.children[i], matcherForPossibleElements));
		}
	}else{
		var elementMatched = true;
		if (matcherForPossibleElements){
			elementMatched = matcherForPossibleElements(container);
		}
		
		if (elementMatched){
			possibleElements = [container];	
		}
	}
	
	return possibleElements;
};

Utils.getAllElementsWithAttribute = function(attribute, container){
	var matchingElements = [];
	var possibleElements = Utils.getAllElementsInsideContainer(container || document);
	
		
	for (var i = 0, n = possibleElements.length; i < n; i++){
		if (possibleElements[i].getAttribute(attribute)){
			// 	Element exists with attribute. Add to array.
			matchingElements.push(possibleElements[i]);
		}
	}
	return matchingElements;
};

ElementUtils.elementMatcherForId = function(element, idToMatch){
	var matched = false;
	if (element.getAttribute("id") === idToMatch){
		matched = true;
	}
	return matched;
};

Utils.getTriggerAndPropertyFromDataBindingAttribute = function(dataBindingAttribute){
	return {
		dataBindingTrigger : dataBindingAttribute.split(",")[0].trim(),
		dataBindingProperty : dataBindingAttribute.split(",")[1].trim()		
	};
};

Utils.getRandomId = function(customScale){
	return Math.floor(Math.random()* (customScale || 99999));
};

Utils.isHexColor = function (inputString){
	return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test('#'+inputString);
};

Utils.getDataIcon = function (dataRow){
	var dataIcon = document.createElement("div");
	
	if (dataRow.pictogramIconType === "circle"){
		dataIcon.className = "cc-data-icon cc-data-icon-circle";
		dataIcon.style.background = "#" + dataRow.pictogramIconColor;
	}else if (dataRow.pictogramIconType === "square"){
		dataIcon.className = "cc-data-icon";
		dataIcon.style.background = "#" + dataRow.pictogramIconColor;
	}else{
		dataIcon.className = "cc-data-icon";
		dataIcon.style.background = "url('" + dataRow.pictogramIconURL + "')";
		dataIcon.style["background-size"] = "contain";
	}
	
	return dataIcon;
};

Utils.getAjaxRequestObject = function(){
	var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"]; //activeX versions to check for in IE
	if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
		for (var i=0; i<activexmodes.length; i++){
			return new ActiveXObject(activexmodes[i]);
	  	}
	}else if (window.XMLHttpRequest){ // if Mozilla, Safari etc
		return new XMLHttpRequest();
	}
	
	alert("Sorry! Your browser does not support ajax.");
};

BindingUtils.setupDataBindings = function(bindingsContainer, bindingsModel){
	var boundElements = Utils.getAllElementsWithAttribute(dataBindingAttributeName, bindingsContainer);
	for (var i in boundElements){
		var currentElementToBind = boundElements[i];
		var dataBindingAttribute = currentElementToBind.getAttribute(dataBindingAttributeName);

		var dataBindingData = Utils.getTriggerAndPropertyFromDataBindingAttribute(dataBindingAttribute);
		
		//update the model from the element
		if (dataBindingData.dataBindingTrigger === "value"){
			currentElementToBind.dataBindingAttributeString = dataBindingAttribute;
			currentElementToBind.addEventListener("change", function(event){
				bindingsModel[dataBindingData.dataBindingProperty] = this.value;
//				BindingUtils.fireBoundBindings(bindingsContainer, bindingsModel, this.dataBindingAttributeString);
			});	
		}
	}
};

BindingUtils.fireBoundBindings = function(bindingsContainer, bindingsModel, dataBindingAttribute){
	var boundElements = Utils.getAllElementsWithAttribute(dataBindingAttributeName, bindingsContainer);
	var dataBindingData = Utils.getTriggerAndPropertyFromDataBindingAttribute(dataBindingAttribute);
	for (var i in boundElements){
		if (boundElements[i].getAttribute(dataBindingAttributeName).indexOf(dataBindingData.dataBindingProperty) > -1){
			//update the element from the model
			if (boundElements[i].tagName !== "INPUT"){
				boundElements[i].innerHTML = bindingsModel[dataBindingData.dataBindingProperty];
			}else{
				boundElements[i].value = bindingsModel[dataBindingData.dataBindingProperty];
			}
		}
	}
};