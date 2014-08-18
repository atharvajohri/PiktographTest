//document.getElementById("myBtn").addEventListener("click", displayDate);


var g_pictogramList;

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
		refreshPictogramPopup();
		Utils.openCreatePictogramPopup("Create New Pictogram");
	});
};

var setupPictogramDataEvents = function(){
	document.getElementById("add-pictogram-data-btn").addEventListener("click", function(){
		addBlankPictogramDataRow();
	});
	
	document.getElementById("ncd-close").addEventListener("click", function(){
		Utils.closeCreatePictogramPopup();
	});
	
	document.getElementById("ncd-complete").addEventListener("click", function(){
		getPictogramDataFromEditor();
	});
};

var getPictogramDataFromEditor = function(){
	var pictogramModel = new PictogramModel(); //model to store pictogram data
	
	//get name from input

	pictogramModel.pictogramName = document.getElementById("pictogram-name-input") ? document.getElementById("pictogram-name-input").value : "";
	
	var pictogramInputDataRows = document.getElementsByClassName("pictogram-data-input-row");
	for (var i=0; i< pictogramInputDataRows.length; i++){
		var currentDataRow = pictogramInputDataRows[i];
		
		var inputDataNameElement = Utils.getAllElementsInsideContainer(currentDataRow, function(element){
			return Utils.hasClass(element, "pictogram-data-name");
		})[0];
		var inputDataName = inputDataNameElement ? inputDataNameElement.value : "";
		
		var inputDataValueElement = Utils.getAllElementsInsideContainer(currentDataRow, function(element){
			return Utils.hasClass(element, "pictogram-data-value");
		})[0];
		var inputDataValue = inputDataValueElement ? inputDataValueElement.value : "";
		
		pictogramModel.pictogramDataRows.push(new PictogramDataRow(inputDataName, inputDataValue, {
			pictogramDataNameElement: inputDataNameElement,
			pictogramDataValueElement: inputDataValueElement
		}));
	}
	
	if (validatePictogramModel(pictogramModel)){
		g_pictogramList.push(pictogramModel);
	}
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
	var invalidPictogramValues = false, invalidPictogramNames = false;
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
	}
	
	if (invalidPictogramValues){
		alertText += "Pictogram data values can only be numeric!\n\n";
	}
	if (invalidPictogramNames){
		alertText += "Pictogram data names cannot be empty!";	
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

var addBlankPictogramDataRow = function(){
	var dataRowId = Utils.getRandomId();
	
	var tableRowElement = document.createElement("tr");
	tableRowElement.className = 'pictogram-data-input-row';
	tableRowElement.setAttribute("data-row-id", dataRowId);
	
	var newPictogramDataRowHTML = "<td>Data Name: <input type='text' class='common-text-input pictogram-data-name'></input></td>";
	newPictogramDataRowHTML += "<td>Data Value: <input type='text' class='common-text-input width20 pictogram-data-value' maxlength='2'></input></td>";
	
	tableRowElement.innerHTML = newPictogramDataRowHTML;
	
	document.getElementById("new-chart-data").appendChild(tableRowElement);
	
	GlobalElements.newChartPopup.scrollTop = 999999;
};

setupPictogram();