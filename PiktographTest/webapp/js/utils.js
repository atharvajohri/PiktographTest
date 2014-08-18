var GlobalElements = {
	overlay: document.getElementById("popup-overlay"),
	newChartPopup: document.getElementById("new-chart-popup"),
	blankChartPopupHTML: document.getElementById("new-chart-popup").innerHTML
};

var dataBindingAttributeName = "data-binding";

var Utils = {};
var BindingUtils = {};

Utils.addClass = function(element, className){
	element.setAttribute("class", element.getAttribute("class") + " " + className);
};

Utils.removeClass = function(element, className){
	element.setAttribute("class", element.getAttribute("class").replace(className, "").trim());
};

Utils.showOverlay = function(){
	Utils.removeClass(GlobalElements.overlay, "hide");
};

Utils.hideOverlay = function(){
	Utils.addClass(GlobalElements.overlay, "hide");
};

Utils.openCreatePictogramPopup = function(popupTitle){
	document.getElementById("pictogram-data-container-type").innerText = popupTitle || "Create New Pictogram";
	Utils.showOverlay();
	Utils.removeClass(GlobalElements.newChartPopup, "hide");
};

Utils.closeCreatePictogramPopup = function(){
	Utils.hideOverlay();
	Utils.addClass(GlobalElements.newChartPopup, "hide");
};

Utils.getAllElementsInsideContainer = function (container){
	var possibleElements = [];
	if (container.childElementCount > 0){
		for (var i =0; i<container.childElementCount;i++){
			possibleElements = possibleElements.concat(Utils.getAllElementsInsideContainer(container.children[i]));
		}
	}else{
		possibleElements = [container];
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

Utils.getTriggerAndPropertyFromDataBindingAttribute = function(dataBindingAttribute){
	return {
		dataBindingTrigger : dataBindingAttribute.split(",")[0].trim(),
		dataBindingProperty : dataBindingAttribute.split(",")[1].trim()		
	};
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