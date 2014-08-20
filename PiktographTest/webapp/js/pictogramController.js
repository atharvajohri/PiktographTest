//document.getElementById("myBtn").addEventListener("click", displayDate);


var g_pictogramList = [];
var MAX_ICON_COUNT = 10;

var setupPictogram = function(){
	setupPictogramEvents();
};

//not using binding anymore to capture pictogram data
/*var setupPictogramBindings = function(){
	var g_PictogramModel = new PictogramModel();
	BindingUtils.setupDataBindings(document.getElementById("popup-data-container"), g_PictogramModel);
};*/

var setupPictogramEvents = function(){
	document.getElementById("add-pictogram-btn").addEventListener("click", function(){
		openCreatePictogramPopup("Create New Pictogram");
	});
	
	document.getElementById("cors-okay-btn").addEventListener("click", function(){
		Utils.hideOverlay();
		Utils.addClass(GlobalElements.corsSecurityPopup, "hide");
		refreshPictogramViews();
	});
	
	//Uploading image to FB / Twitter or Pinterest requires app to be hosted.
	/*document.getElementById("share-pictogram-btn").addEventListener("click", function(){
		
		// Additional init code here
	    FB.login(function(response) {
			   // handle the response
	    	
		 }, {scope: 'publish_stream'});
	});*/
};

var openCreatePictogramPopup = function(popupTitle, pictogramIndexToEdit){
	document.getElementById("pictogram-data-container-type").innerText = popupTitle || "Create New Pictogram";
	Utils.repositionContainer(GlobalElements.newChartPopup, false);
	Utils.showOverlay();
	Utils.removeClass(GlobalElements.newChartPopup, "hide");
	refreshPictogramPopup();
	if (typeof pictogramIndexToEdit === "number"){
		populateCreatePictogramPopupWithPictogramData(pictogramIndexToEdit);
	}
};

var populateCreatePictogramPopupWithPictogramData = function(pictogramIndexToEdit){
	var pictogramToPopulate = g_pictogramList[pictogramIndexToEdit];
	
	document.getElementById("pictogram-name-input").value = pictogramToPopulate.pictogramName;
	for (var i = 0; i< pictogramToPopulate.pictogramDataRows.length; i++){
		addBlankPictogramDataRow(pictogramToPopulate.pictogramDataRows[i]);
	}
	var pictogramToEditIdContainer = document.createElement("div");
	pictogramToEditIdContainer.className = "hide pictogram-to-edit-id";
	pictogramToEditIdContainer.innerHTML = pictogramIndexToEdit;
	GlobalElements.newChartPopup.appendChild(pictogramToEditIdContainer);
};

var closeCreatePictogramPopup = function(){
	Utils.hideOverlay();
	Utils.addClass(GlobalElements.newChartPopup, "hide");
};

var setupPictogramDataEvents = function(){
	document.getElementById("add-pictogram-data-btn").addEventListener("click", function(){
		addBlankPictogramDataRow();
	});
	
	document.getElementById("ncd-close").addEventListener("click", function(){
		closeCreatePictogramPopup();
	});
	
	document.getElementById("ncd-complete").addEventListener("click", function(){
		var currentPictogramModel = getPictogramDataFromEditor();
		if (validatePictogramModel(currentPictogramModel)){
			currentPictogramModel = recalculateDataValuesForPictogram(currentPictogramModel);
			
			var existingPictogramIndex = findPictogramIndexById(currentPictogramModel.pictogramId);
			if (typeof existingPictogramIndex === "number"){
				g_pictogramList[existingPictogramIndex] = currentPictogramModel;
			}else{
				g_pictogramList.push(currentPictogramModel);			
			}
			
//			refreshPictogramViews();
			closeCreatePictogramPopup();
			openResizeAndScalePictogramPopup(currentPictogramModel);
		}
	});
};

var doesPictogramContainImages = function(pictogramModel){
	var containsImages = false;
	for (var i = 0; i < pictogramModel.pictogramDataRows.length; i++){
		if (pictogramModel.pictogramDataRows[i].pictogramIconType === "icon"){
			containsImages = true;
			break;
		}
	}
	
	return containsImages;
};

var openResizeAndScalePictogramPopup = function(pictogramModel){
	
	if (doesPictogramContainImages(pictogramModel)){
		Utils.repositionContainer(GlobalElements.corsSecurityPopup, false);
		Utils.showOverlay();
		Utils.removeClass(GlobalElements.corsSecurityPopup, "hide");
	}else{
		waitForImagesToLoad(function(){
			
			GlobalElements.chartDimensionsPopup.innerHTML = GlobalElements.chartDimensionPopupHTML;
			GlobalElements.tempPictogramContainer = document.getElementById("temp-pictogram-canvas");
			
			Utils.repositionContainer(GlobalElements.chartDimensionsPopup, false);
			Utils.showOverlay();
			Utils.removeClass(GlobalElements.chartDimensionsPopup, "hide");
			
			updateCanvasDimensions(GlobalElements.tempPictogramContainer, [pictogramModel]);
			setupPictogramViewOnCanvas(pictogramModel, GlobalElements.tempPictogramContainer, true);
			
			//convert pictogram drawn on canvas to image which can be resized & repositioned 
			var dataURL = GlobalElements.tempPictogramContainer.toDataURL();
			var pictogramImage = new Image();
			pictogramImage.onload = function(){
				var context = GlobalElements.tempPictogramContainer.getContext("2d");
				context.clearRect(0, 0, GlobalElements.tempPictogramContainer.width, GlobalElements.tempPictogramContainer.height);
				context.drawImage(pictogramImage, 0, 0); // Or at whatever offset you like
			};
			pictogramImage.src = dataURL;
		});		
	}
};

var getPictogramDataFromEditor = function(){
	var pictogramModel = new PictogramModel(); //model to store pictogram data
	
	var pictogramToEditIdContainer = GlobalElements.newChartPopup.querySelectorAll(".pictogram-to-edit-id");
	if (pictogramToEditIdContainer.length > 0){
		pictogramModel = g_pictogramList[Number(pictogramToEditIdContainer[0].innerHTML)];
	}
	
	//get name from input

	pictogramModel.pictogramName = document.getElementById("pictogram-name-input") ? document.getElementById("pictogram-name-input").value : "";
	var pictogramInputDataRows = document.getElementsByClassName("pictogram-data-input-row");
	
	pictogramModel.pictogramDataRows = [];
	for (var i=0; i< pictogramInputDataRows.length; i++){
		var currentDataRow = pictogramInputDataRows[i];
		
		//get pictogram data name
		var inputDataNameElement = currentDataRow.querySelector(".pictogram-data-name");
		var inputDataName = inputDataNameElement ? inputDataNameElement.value : "";
		
		//get pictogram data value
		var inputDataValueElement = currentDataRow.querySelector(".pictogram-data-value");
		var inputDataValue = inputDataValueElement ? inputDataValueElement.value : "";

		//get pictogram data icon type
		var inputDataIconTypeElement = currentDataRow.querySelector(".pictogram-data-icon-select");
		var inputDataIconType = inputDataIconTypeElement ? inputDataIconTypeElement.value : "";
		
		//get pictogram data icon color
		var inputDataIconColorElement = currentDataRow.querySelector(".pictogram-data-icon-color");
		var inputDataIconColor = inputDataIconColorElement ? inputDataIconColorElement.value : "";
		
		//get pictogram data icon URL
		var inputDataIconURLElement = currentDataRow.querySelector(".pictogram-data-icon-url");
		var inputDataIconURL = inputDataIconURLElement ? inputDataIconURLElement.value : "";
		
		pictogramModel.pictogramDataRows.push(new PictogramDataRow(inputDataName, inputDataValue, inputDataIconType, inputDataIconColor, inputDataIconURL, {
			pictogramDataNameElement: inputDataNameElement,
			pictogramDataValueElement: inputDataValueElement,
			pictogramDataIconTypeElement: inputDataIconTypeElement,
			pictogramDataIconColorElement: inputDataIconColorElement,
			pictogramDataIconURLElement: inputDataIconURLElement
		}));
	}
	
	return pictogramModel;
};

/*10 20 30 40 50 20 30 34
50 - 10 pieces
1 - 10/50 pieces*/



var recalculateDataValuesForPictogram = function(pictogramModel){
	//first find max value for pictogram data
	var maxValue = 0;
	
	for (var i =0;i<pictogramModel.pictogramDataRows.length;i++){
		if (pictogramModel.pictogramDataRows[i].pictogramDataValue > maxValue){
			maxValue = Number(pictogramModel.pictogramDataRows[i].pictogramDataValue);
		}
	}
	
	var iconRatio = maxValue/MAX_ICON_COUNT;
	pictogramModel.iconRatio = Number(iconRatio).toFixed(3);
	//for each data row, calculate icon count
	for (var i =0;i<pictogramModel.pictogramDataRows.length;i++){
		pictogramModel.pictogramDataRows[i].iconCount = Math.floor(pictogramModel.pictogramDataRows[i].pictogramDataValue * (MAX_ICON_COUNT/maxValue));
	}
	
	return pictogramModel;
};

var g_currentLineHeight = 26;

var updateCanvasDimensions = function(pictogramContainer, pictogramList){
	if (!pictogramContainer){
		pictogramContainer = GlobalElements.pictogramsContainer;
	}
	if (!pictogramList){
		pictogramList = g_pictogramList;
	}
	var totalHeight = 0;
	g_currentLineHeight = 26;
	for (var i = 0; i < pictogramList.length; i++){
		totalHeight += (80 + pictogramList[i].pictogramDataRows.length * 45);
	}
	
	pictogramContainer.setAttribute("height", totalHeight);
};

var refreshPictogramViews = function(){
	GlobalElements.pictogramsContainer.innerHTML = "";
	var optionContainers = document.getElementById("pictogram-canvas-container").querySelectorAll(".cc-pictogram-options-container");
	for (var i = 0; i < optionContainers.length; i++){
		optionContainers[i].parentNode.removeChild(optionContainers[i]);
	}
	updateCanvasDimensions();
	
	if (g_pictogramList.length > 0){
		Utils.removeClass(GlobalElements.sharePictogramsButton, "hide");
		waitForImagesToLoad(function(){
			for (var i = 0; i < g_pictogramList.length; i++){
//				setupPictogramViewNonCanvas(g_pictogramList[i]);
				setupPictogramViewOnCanvas(i);			
			}
		});		
	} else{
		Utils.addClass(GlobalElements.sharePictogramsButton, "hide");
	}
};

var waitForImagesToLoad = function(loadedCallback){
	var allImagesLoaded = true;
	for (var i = 0; i<g_pictogramList.length; i++){
		var pictogramImagesLoaded = true;
		for (var k = 0; k<g_pictogramList[i].pictogramDataRows.length; k++){
			if (g_pictogramList[i].pictogramDataRows[k].pictogramIconImageLoaded === false){
				pictogramImagesLoaded = false;
				break;
			}
		}
		
		if (!pictogramImagesLoaded){
			allImagesLoaded = false;
			break;
		}
	}
	
	if (!allImagesLoaded){
		setTimeout(function(){
			waitForImagesToLoad(loadedCallback);
		}, 200);
	}else{
		if (loadedCallback){
			loadedCallback();			
		}
	}
};

var setupPictogramViewOnCanvas = function(c_pictogram, canvasContainer, noEvents){
	if (!canvasContainer){
		canvasContainer = document.getElementById("charts-container");
	}
	var context = canvasContainer.getContext("2d");
	
	g_currentLineHeight += 20;
	context.font = 'bold 14pt Calibri';
	context.fillStyle = "black";
	context.fillText(c_pictogram.pictogramName, 10, g_currentLineHeight);
	c_pictogram.pictogramLineHeight = g_currentLineHeight;

	var pictogramOptionsContainer = getPictogramOptionButtons(c_pictogram);
	pictogramOptionsContainer.className = "cc-pictogram-options-container";
	pictogramOptionsContainer.style.top = (Number(g_currentLineHeight) - 20) + "px";
	document.getElementById("pictogram-canvas-container").appendChild(pictogramOptionsContainer);
	
	g_currentLineHeight += 40;
	
	for (var k = 0; k < c_pictogram.pictogramDataRows.length; k++){
		var c_dataRow = c_pictogram.pictogramDataRows[k];
		context.font = '12pt Calibri';
		context.fillStyle = "black";
		context.fillText(c_dataRow.pictogramDataName, 30, g_currentLineHeight);
		
		var iconsXPosition = 250;
		
		for (var j = 0; j < c_dataRow.iconCount; j++){
			//insert icons
			context.beginPath();
			if (c_dataRow.pictogramIconType === "circle"){
				context.arc((iconsXPosition+40*j), (g_currentLineHeight-5), 10, 0, 2 * Math.PI, false);
				context.fillStyle = '#'+c_dataRow.pictogramIconColor;
				context.fill();	
			}else if (c_dataRow.pictogramIconType === "square"){
				context.rect((iconsXPosition+40*j-10), (g_currentLineHeight-15), 20, 20);
				context.fillStyle = '#'+c_dataRow.pictogramIconColor;
				context.fill();	
			}else{
				context.drawImage(c_dataRow.pictogramImageObject, (iconsXPosition+40*j-10), (g_currentLineHeight-15), 20, 20);
			}
		}
		
		g_currentLineHeight += 30;
	}
	
	context.font = '12pt Calibri';
	context.fillStyle = "black";
	context.fillText("Unit Value: " + c_pictogram.iconRatio, 20, g_currentLineHeight);
	
	g_currentLineHeight += 30;
	
	if (!noEvents){
		setEventsForPictogramView(pictogramOptionsContainer);		
	}
};

var getPictogramOptionButtons = function(c_pictogram){
	
	var pictogramOptionsContainer = document.createElement("div"); 
	
	var pictogramEditElement = document.createElement("div");
	pictogramEditElement.className = "cc-pictogram-edit menu-button cc-pictogram-options";
	pictogramEditElement.setAttribute("data-rel", c_pictogram.pictogramName);
	pictogramEditElement.setAttribute("data-id", c_pictogram.pictogramId);
	pictogramEditElement.innerHTML = "Edit";
	
	var pictogramDeleteElement = document.createElement("div");
	pictogramDeleteElement.className = "cc-pictogram-delete menu-button red-btn cc-pictogram-options";
	pictogramDeleteElement.setAttribute("data-rel", c_pictogram.pictogramName);
	pictogramDeleteElement.setAttribute("data-id", c_pictogram.pictogramId);
	pictogramDeleteElement.innerHTML = "Delete";
	
	pictogramOptionsContainer.appendChild(pictogramEditElement);
	pictogramOptionsContainer.appendChild(pictogramDeleteElement);
	
	return pictogramOptionsContainer;
};


var setupPictogramViewNonCanvas = function(c_pictogram){
	var existingPictogramElement = document.getElementById("pictogram-"+c_pictogram.pictogramName);
	
	//remove existing pictogram
	if (existingPictogramElement){
		existingPictogramElement.parentNode.removeChild(existingPictogramElement);	
	}
	
	//setup new pictogram
	existingPictogramElement = document.createElement("div");
	existingPictogramElement.className = "cc-pictogram-container";
	existingPictogramElement.setAttribute("id", "pictogram-" + c_pictogram.pictogramName);
	
	//populate pictogram with data
	var pictogramNameElement = document.createElement("div");
	pictogramNameElement.className = "cc-pictogram-name";
	pictogramNameElement.innerHTML = c_pictogram.pictogramName;
	
	var pictogramEditElement = document.createElement("div");
	pictogramEditElement.className = "cc-pictogram-edit menu-button cc-pictogram-options";
	pictogramEditElement.setAttribute("data-rel", c_pictogram.pictogramName);
	pictogramEditElement.setAttribute("data-id", c_pictogram.pictogramId);
	pictogramEditElement.innerHTML = "Edit";
	
	var pictogramDeleteElement = document.createElement("div");
	pictogramDeleteElement.className = "cc-pictogram-delete menu-button red-btn cc-pictogram-options";
	pictogramDeleteElement.setAttribute("data-rel", c_pictogram.pictogramName);
	pictogramDeleteElement.setAttribute("data-id", c_pictogram.pictogramId);
	pictogramDeleteElement.innerHTML = "Delete";
	
	var pictogramShareElement = document.createElement("div");
	pictogramShareElement.className = "cc-pictogram-share menu-button blue-btn cc-pictogram-options";
	pictogramShareElement.setAttribute("data-rel", c_pictogram.pictogramName);
	pictogramShareElement.setAttribute("data-id", c_pictogram.pictogramId);
	pictogramShareElement.innerHTML = "Share";
	
	existingPictogramElement.appendChild(pictogramNameElement);
	existingPictogramElement.appendChild(pictogramEditElement);
	existingPictogramElement.appendChild(pictogramDeleteElement);
	existingPictogramElement.appendChild(pictogramShareElement);
	
	//populate pictogram data rows
	var pictogramDataTable = document.createElement("table");
	pictogramDataTable.className = "cc-pictogram-data-table";
	pictogramDataTable.setAttribute("border", "1");
	for (var i=0;i<c_pictogram.pictogramDataRows.length;i++){
		var c_dataRow = c_pictogram.pictogramDataRows[i];
		var currentDataRow = document.createElement("tr");
		
		var dataRowCellForName = document.createElement("td");
		dataRowCellForName.innerHTML = c_dataRow.pictogramDataName;
		currentDataRow.appendChild(dataRowCellForName);
		
		var dataRowCellForValue = document.createElement("td");
		
		for (var k = 0; k < c_dataRow.iconCount; k++){
			dataRowCellForValue.appendChild(Utils.getDataIcon(c_dataRow));
		}
		currentDataRow.appendChild(dataRowCellForValue);
		
		pictogramDataTable.appendChild(currentDataRow);
	}
	
	existingPictogramElement.appendChild(pictogramDataTable);
	
	var keyElement = document.createElement("table");
	keyElement.className = "cc-key-container";
	
	var keyElementRow = document.createElement("tr");
	
	var keyElementRowIconCell = document.createElement("td");
//	keyElementRowIconCell.appendChild(Utils.getDataIcon(c_dataRow));
	keyElementRowIconCell.innerHTML = "Each Unit Value: ";
	keyElementRow.appendChild(keyElementRowIconCell);
	
	var keyElementRowValueCell = document.createElement("td");
	keyElementRowValueCell.innerHTML = c_pictogram.iconRatio;
	
	keyElementRow.appendChild(keyElementRowValueCell);
	
	keyElement.appendChild(keyElementRow);
	
	existingPictogramElement.appendChild(keyElement);
	
	GlobalElements.pictogramsContainer.appendChild(existingPictogramElement);
	
	setEventsForPictogramView(existingPictogramElement);
};

var setEventsForPictogramView = function(pictogramViewElement){
	var deleteButton = pictogramViewElement.querySelectorAll(".cc-pictogram-delete")[0];
	var editButton = pictogramViewElement.querySelectorAll(".cc-pictogram-edit")[0];
	var shareButton = pictogramViewElement.querySelectorAll(".cc-pictogram-share")[0];
	
	deleteButton.addEventListener("click", function(){
		var pictogramIndexToDelete = findPictogramIndexById(this.getAttribute("data-id"));
		g_pictogramList.splice(pictogramIndexToDelete, 1);
		refreshPictogramViews();
	});
	
	editButton.addEventListener("click", function(){
		var pictogramIndexToEdit = findPictogramIndexById(this.getAttribute("data-id"));
		openCreatePictogramPopup("Create New Pictogram", pictogramIndexToEdit);
	});
};

var findPictogramIndexById = function(pictogramId){
	var foundPictogramIndex = null;
	for (var i = 0; i< g_pictogramList.length; i++){
		if (g_pictogramList[i].pictogramId.toString() === pictogramId.toString()){
			foundPictogramIndex = i;
			break;
		}
	}
	
	return foundPictogramIndex;
};

var validatePictogramModel = function(pictogramModel){
	var isValid = true;
	var alertText = "";
	
	if (!pictogramModel.pictogramName){
		Utils.errorHighlightTextBox(document.getElementById("pictogram-name-input"));
		alertText = "Please give a valid name for the Pictogram.\n\n";
		isValid = false;
	}
	
	if (pictogramModel.pictogramDataRows.length === 0){
		alertText += "Please provide at least one data row for the Pictogram!\n\n";
		isValid = false;
	}
	var invalidPictogramValues = false, invalidPictogramNames = false, invalidHex = false;
	for (var i=0; i< pictogramModel.pictogramDataRows.length; i++){
		if (pictogramModel.pictogramDataRows[i].pictogramDataValue && isNaN(pictogramModel.pictogramDataRows[i].pictogramDataValue)){
			Utils.errorHighlightTextBox(pictogramModel.pictogramDataRows[i].elementData.pictogramDataValueElement);
			invalidPictogramValues = true;
			isValid = false;
		}
		
		if (!pictogramModel.pictogramDataRows[i].pictogramDataName){
			Utils.errorHighlightTextBox(pictogramModel.pictogramDataRows[i].elementData.pictogramDataNameElement);
			invalidPictogramNames = true;
			isValid = false;
		}
		
		if (pictogramModel.pictogramDataRows[i].pictogramIconType !== "icon" && !Utils.isHexColor(pictogramModel.pictogramDataRows[i].pictogramIconColor)){
			Utils.errorHighlightTextBox(pictogramModel.pictogramDataRows[i].elementData.pictogramDataIconColorElement);
			invalidHex = true;
			isValid = false;
		}
	}
	
	if (invalidPictogramValues){
		alertText += "Pictogram data values can only be numeric!\n\n";
	}
	if (invalidPictogramNames){
		alertText += "Pictogram data names cannot be empty!\n\n";	
	}
	if (invalidHex){
		alertText += "Pictogram data color is not a valid hex!";
	}

	if (!isValid){
		alert(alertText);
	}
	return isValid;
};

var refreshPictogramPopup = function(){
	GlobalElements.newChartPopup.innerHTML = GlobalElements.blankChartPopupHTML;
	setupPictogramDataEvents();
};

var addBlankPictogramDataRow = function(pictogramRowDataToPopulate){
	var dataRowId = Utils.getRandomId();
	
	var tableRowElement = document.createElement("tr");
	tableRowElement.className = 'pictogram-data-input-row';
	tableRowElement.setAttribute("data-row-id", dataRowId);
	
	var newPictogramDataRowHTML = "<td>Data Name: <input type='text' maxlength='20' class='common-text-input pictogram-data-name'></input></td>";
	newPictogramDataRowHTML += "<td>Data Value: <input type='text' class='common-text-input width20 pictogram-data-value' maxlength='2'></input></td>";
	newPictogramDataRowHTML += "<td>Data Icon: <select class='pictogram-data-icon-select'><option value='circle'>Circle</option><option value='square'>Square</option><option value='icon'>Custom Icon</option></select></td>";
	newPictogramDataRowHTML += "<td class='hide pictogram-data-icon-url-cell'>Icon URL: <input type='text' maxlength='1000' value='"+GlobalElements.defaultPictogramIconUrl+"' class='common-text-input pictogram-data-icon-url'></input></td>";
	newPictogramDataRowHTML += "<td class='pictogram-data-icon-color-cell'>Color: #<input type='text' maxlength='6' class='common-text-input pictogram-data-icon-color'></input></td>";
	newPictogramDataRowHTML += "<td class='pictogram-data-delete-cell'><div class='menu-button pictogram-data-delete red-btn'>Delete</td>";
	
	tableRowElement.innerHTML = newPictogramDataRowHTML;
	
	document.getElementById("new-chart-data").appendChild(tableRowElement);
	
	setDataRowEvents(tableRowElement);
	
	if (pictogramRowDataToPopulate){
		tableRowElement.querySelectorAll(".pictogram-data-name")[0].value = pictogramRowDataToPopulate.pictogramDataName;
		tableRowElement.querySelectorAll(".pictogram-data-value")[0].value = pictogramRowDataToPopulate.pictogramDataValue;
		
		tableRowElement.querySelectorAll(".pictogram-data-icon-select")[0].value = pictogramRowDataToPopulate.pictogramIconType;
		tableRowElement.querySelector(".pictogram-data-icon-select").dispatchEvent(new Event('change'));
		
		tableRowElement.querySelectorAll(".pictogram-data-icon-url")[0].value = pictogramRowDataToPopulate.pictogramIconURL;
		tableRowElement.querySelectorAll(".pictogram-data-icon-color")[0].value = pictogramRowDataToPopulate.pictogramIconColor;
	}
	
	GlobalElements.newChartPopup.scrollTop = 999999;
};

var setDataRowEvents = function(tableRowElement){
	var dataIconSelectElement = tableRowElement.querySelector(".pictogram-data-icon-select");
	var dataDeleteButtonElement = tableRowElement.querySelector(".pictogram-data-delete");
	
	dataIconSelectElement.addEventListener("change", function(){
		var value = this.value;
		var tableRow = this.parentNode.parentNode;
		
		var dataIconURLCell = tableRow.querySelectorAll('.pictogram-data-icon-url-cell')[0];
		var dataIconColorCell = tableRow.querySelectorAll('.pictogram-data-icon-color-cell')[0];
		
		if (value === "circle" || value === "square"){
			Utils.addClass(dataIconURLCell, "hide");
			Utils.removeClass(dataIconColorCell, "hide");
		}else{
			Utils.removeClass(dataIconURLCell, "hide");
			Utils.addClass(dataIconColorCell, "hide");
		}
		
	});
	
	dataDeleteButtonElement.addEventListener("click", function(){
		var tableRow = this.parentNode.parentNode;
		tableRow.parentNode.removeChild(tableRow);
	});
	
	
};

setupPictogram();