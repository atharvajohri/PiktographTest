//document.getElementById("myBtn").addEventListener("click", displayDate);


var g_pictogramList;

var setupPictogram = function(){
//	setupPictogramBindings();
	setupPictogramEvents();
};

var setupPictogramBindings = function(){
	var g_PictogramModel = new PictogramModel();
	BindingUtils.setupDataBindings(document.getElementById("popup-data-container"), g_PictogramModel);
};

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
};

var refreshPictogramPopup = function(){
	GlobalElements.newChartPopup.innerHTML = GlobalElements.blankChartPopupHTML;
	setupPictogramDataEvents();
};

var addBlankPictogramDataRow = function(){
	var dataRowId = Math.floor(Math.random()*999999);
	var newPictogramDataRowHTML = "<tr data-row-id='" + dataRowId + "'><td>Data Name: <input type='text' class='common-text-input pictogram-data-name'></input></td>";
	newPictogramDataRowHTML += "<td>Data Value: <input type='text' class='common-text-input width20 pictogram-data-value'></input></td></tr>";
	document.getElementById("new-chart-data").innerHTML = newPictogramDataRowHTML + document.getElementById("new-chart-data").innerHTML;
	
//	GlobalElements.newChartPopup.scrollTop = 999999;
};

setupPictogram();