var pipeline_load = function(seq_name){

  // var step = ['quality control of reads','read mapping', 'quality control after mapping','differential binding', 'peak calling','peak annotation','motif analysis',  'gene ontology analysis']

  $.getJSON("./data/" + seq_name + ".json")
    .done(function( data ) {


      $("#svgContainer svg path").remove();
      var Blocks = {};  
       
       for(let i= 0; i < data.length; i++){
          let name = data[i].step;
          let key = name.replace(/\s/g,'');

          

          //already has the step 
          if(Blocks.hasOwnProperty(key)){
            Blocks[key].push_data(data[i], data[i].software);
            let parent = Blocks[key].parent;
            if(parent !== ""){
              Blocks[parent].push_data(data[i], data[i].software);
            }
          }

          else{

            //set a block key as step name
            Blocks[key] = new Block(name, data[i].order, data[i].parent, data[i].nextStep, data[i].nextStepCount, seq_name);

            let parent = Blocks[key].parent;
            //subSteps 
            if(parent !== ""){
                Blocks[parent].push_data(data[i], data[i].software);

                //count direct next sub steps 
                if(Blocks[key].order.includes(".1")){
                  Blocks[parent].subStepCount++; 
                }


            }

            //get software info fields 
            Blocks[key].set_fields(Object.keys(data[i]), 5);

            //push software data relate to step
            Blocks[key].push_data(data[i], data[i].software);
          }




       }

       
       for(let key in Blocks){
       
          Blocks[key].render();
          Blocks[key].makeTable();


          //bind button event 
           (function(id, target){
            
          $("#" + id).click(function(){



            $(".table-row").show();
            var table;

            //destroy table
            if($('#table thead').length !== 0){
               table =  $('#table').DataTable();
               table.destroy();

            }
             

             //build table 
              $("#table").empty().append(target.table);

                $('#table tfoot th').each( function () {
                    var title = $(this).text();
                    $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
                } );

              table = $("#table").DataTable({
                 "destroy": true,
                 "paging": false,
                 "info": false,
                 "scrollX": true
               });
              
            
            
              table.columns().every( function () {
                 var that = this;
         
            $( 'input', that.footer() ).on( 'keyup change', function () {
                if ( that.search() !== this.value ) {
                    that
                    .search( this.value )
                    .draw();
                          }
                  } );
              } );
            


              //button css
               if(target.parent !== ""){
               $(".block-button").removeClass("block-button-selected");
                $(".block-button").removeClass("sub-button-selected");

                 $("#" + id).addClass("sub-button-selected");
              }
              else{

               $(".block-button").removeClass("block-button-selected");
                $(".block-button").removeClass("sub-button-selected");
             
               $("#" + id).addClass("block-button-selected");
                
              }       
             
            
            //Sub button shwoing event 
            if(target.subStepCount !== 0){

              
                  if($("div[id^=\'" + seq_name + "-" + target.orderNumber + "." + "\']").css('display') ==='none'){
                     $("#svgContainer svg path").remove();
                    target.nextStep = target.orderNumber + "." + 1;
                     target.nextStepCount =  target.subStepCount;

                     if( target.nextStepCount > 2){
                           $("div[id^=\'" + seq_name + "-" + target.orderNumber + "."  + "\']").css('margin-right', '150px');
                     }


                     //redraw flow chart
                    $("div[id^=\'" + seq_name + "-" + target.orderNumber + "."  + "\']").slideDown('slow', function(){
                             $("#" + id).addClass("hassub-button-selected");
                           
                            resetSVGsize();
                            connectAll(seq_name, Blocks);
                    });
                   
                  }

                  else{
                         $("#svgContainer svg path").remove();
                    //get last substeps 
                     let lastSubId = $("div#chart div[id^=\'" + seq_name + "-" + target.orderNumber + "." + "\']:last .block button").attr('id');
                    target.nextStep = Blocks[lastSubId].nextStep;
                     target.nextStepCount = Blocks[lastSubId].nextStepCount;
                    
                     //redraw flow  chart 
                    $("div[id^=\'" + seq_name + "-" + target.orderNumber + "." + "\']").slideUp('slow', function(){
                                 $(".block-button").removeClass("block-button-selected");
                               $("#" + id).removeClass("hassub-button-selected");
                               
                             $(".table-row").hide();
                              resetSVGsize();
                              connectAll(seq_name, Blocks);
                    });
                    
                   
                  }


            }
          
        

        });
        })(key, Blocks[key]);
        
       }



             //window resize event
             $(window).off();
                $(window).resize(function(){
                     $("#svgContainer svg path").remove();

                    resetSVGsize();
                    connectAll(seq_name, Blocks);
                });

         $("#chart-button").off();
          $("#chart-button").click(function(e){
              e.stopPropagation();
        

              $(".block-button").removeClass("block-button-selected");
            
            //show chart
            $("#chart").toggle('slow',function(){

              if($("#chart").css('display') !== 'none'){
                $("#chart-button").text("hide chart");
                $("#chart-button").removeClass("btn-outline-success");
                $("#chart-button").addClass("btn-success");
                
              }
              else{
                $("#chart-button").text("show chart");
                $("#chart-button").removeClass("btn-success");
                $("#chart-button").addClass("btn-outline-success");
                  $(".block-button").removeClass("btn-primary");
                    $(".block-button").addClass("btn-outline-primary");
                 $(".table-row").hide();
               
              }

            });


            //draw paths
             $("#svgContainer").toggle('slow', function(){

                  resetSVGsize();
                  connectAll(seq_name, Blocks);

            });

           
            
          });
          
     
    });

};

  
function connectAll(seq_name, Blocks){
 

    let i = 1;
    for(let key in Blocks){

      

      if(Blocks[key].nextStep !== "" && $("div[id=\'" + Blocks[key].order + "\']").css('display') !== 'none'){
     
        let nextBlock = $("div[id=\'" + seq_name + "-" + Blocks[key].nextStep.toString() + "\'] .block:first");
     
        for(let j = 0; j < Blocks[key].nextStepCount; j++){
          $("#svgContainer svg").append("<path id=\'path" + i + "\'/>");
          $("#svgContainer").html($("#svgContainer").html());
          connectElements($("#svg-pipe"), $("#path" + i), $("#" +key), nextBlock.find(".arrowTarget") );
          nextBlock = nextBlock.next();
          i++;
        }
        
      }
            
  }



}


$(document).ready(function() {
    
	 $("#chart").hide();
   $("#svgContainer").hide();
  $("#tree-button").click(function(){

       $("#main").slideUp('slow');
      $("#chart").hide();
       $("#svgContainer").hide();
     $(".table-row").hide();
       $("#chart-button").text("show chart");
       $("#chart-button").removeClass("btn-success");
       $("#chart-button").addClass("btn-outline-success");
      $(".tree-field").delay('850').slideDown('slow');
     
 });


    
} );