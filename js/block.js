function Block(name, order, parent, nextStep,nextStepCount, seq_name){
	
	//step name
	this.name = name;

	this.id = this.name.replace(/\s/g,''); 

	//software datas
	this.data = {};

	//software info table 
	this.table = "";


	//block frame
	this.frame = "";


	//software data fields 
	this.fields = [];



	//order of step
	this.orderNumber = order;

	this.order = seq_name + "-" + order.toString();

	//parent step 
	this.parent = parent.replace(/\s/g,'');

	this.seq_name = seq_name;

	this.nextStep = nextStep;

	this.nextStepCount = nextStepCount;

	this.subStepCount = 0;



}


Block.prototype.set_fields = function(fields, index){
	this.fields = fields.slice(index,fields.length);
};

Block.prototype.push_data = function(data, key) {
		this.data[key] = data;

};


Block.prototype.render = function(){

	let isSub = this.parent!==""?true:false;
	let order = "div[id=\'" + this.order + "\']";
	
	let containerID = this.id + "-container";

	if(!$(order).length){
		
		let orderFrame = "<div class=\'row justify-content-center order-frame\' id=\'" + this.order +  "\'></div>";
		$("#chart").append(orderFrame);

		if(this.nextStep === ""){
			$(order).addClass('lastFrame');
		}
	}

	else{
		$(order).removeClass("justify-content-center");
		$(order).addClass('justify-content-between');
	}

	this.frame = "<div class=\'col-md-4 block\'>"
					+"<div id=\'"+containerID+"\' class=\'container-fluid\'>"
						+"<div class=\'row justify-content-center \'>"
							+"<Button type=\'button\' class=\'block-button btn btn-outline-primary\' id=\'"+this.id+"\'>" + this.name + "</Button>"
						+"</div>"
					+"</div>"
				+"</div>";


	
	$(order).append(this.frame);
	

	
	$("#" + containerID + " .row .block-button").append("<span class=\'arrowTarget\'></span>")

	


	
	
	if(isSub){
		$(order).hide();
		$("#" + containerID + " .row .block-button").removeClass('btn-outline-primary').addClass('btn-outline-info');

	}
	



};

Block.prototype.makeTable = function(...args){

	var head_fields = [];
	var col = [];

	if(args.lenght!==0){
		for(let i = 0; i < args.length;i++){
			head_fields.push(args[i]);
		}
	}
	var head = "<tr>";


	head_fields = head_fields.concat(this.fields);

	for(let i = 0; i < head_fields.length;i++){
		head = head + "<th>" + head_fields[i] + "</th>";
	}

	head = head + "</tr>";


	var body = "";

	for(let key in this.data){
		var tr = "<tr>";

		for(var i= 0; i < head_fields.length;i++){
			if(this.data[key][head_fields[i]] ===""){
				tr = tr + "<td>-</td>";
			}
			else{
				tr = tr + "<td>" + this.data[key][head_fields[i]] + "</td>";
			}
			
		}

		tr = tr + "</tr>";

		body = body + tr;		

	}

	var table_head = "<thead>" + head + "</thead>";
	var table_body = "<tbody>" + body + "</tbody>";
	var table_foot = "<tfoot>" + head + "</tfoot>";
	this.table = table_head + table_body + table_foot;

};


Block.prototype.renderArrow = function(position, name){
	var id = name.replace(/\s/g,''); 
	$("#" + id+ position).append("<span>\&"+position+";</span>");



}





