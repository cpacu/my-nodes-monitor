function resizeGraphs() {
	if (!$(".graph-container").is(':visible'))
		return;
	$("#chart1").empty();

	if ($(".graph-selector-node").val() == "" || $(".graph-selector-topic").val() == "")
		return;
	
	$(".graph-container .mdl-spinner").show();
	
//	$('<img/>').bind('load', function () {
//		$(".graph-container").append($(this));
//	}).attr("src",
//			"/graph.php?w=" + $(".graphs").width()
//					+ "&node=" + $(".graph-selector-node").val() + "&topic="
//					+ $(".graph-selector-topic").val());

//  // Our data renderer function, returns an array of the form:
//  // [[[x1, sin(x1)], [x2, sin(x2)], ...]]
//  var sineRenderer = function() {
//    var data = [[]];
//    for (var i=0; i<13; i+=0.5) {
//      data[0].push([i, Math.sin(i)]);
//    }
//    return data;
//  };

//  var ajaxDataRenderer = function(url, plot, options) {
//    var ret = null;
//    $.ajax({
//      // have to use synchronous here, else the function 
//      // will return before the data is fetched
//      async: false,
//      url: url,
//      dataType:"json",
//      success: function(data) {
//        ret = data;
//      }
//    });
//    return ret;
//  };
// 
  // The url for our json data
  var jsonurl = "/jsondata?node=" + $(".graph-selector-node").val() + "&topic=" + $(".graph-selector-topic").val() +
  	"&interval=" + $(".graph-selector-interval").val();
 
  // we have an empty data array here, but use the "dataRenderer"
  // option to tell the plot to get data from our renderer.
//  var plot1 = $.jqplot('chart1',jsonurl,{
//	  title: $(".graph-selector-node option:selected").text() + " - " + $(".graph-selector-topic option:selected").text(),
//	  axes:{
//	        xaxis:{
//	            renderer:$.jqplot.DateAxisRenderer
//	        }
//	  },
//      dataRenderer: ajaxDataRenderer,
//      dataRendererOptions: {
//        unusedOptionalUrl: jsonurl
//      },
//      series:[{lineWidth:1, markerOptions:{show:false}}]
//  });

  $.ajax({
      // have to use synchronous here, else the function 
      // will return before the data is fetched
      url: jsonurl,
      dataType:"json",
      success: function(data) {
    	  $(".graph-container .mdl-spinner").hide();
    	  var plot1 = $.jqplot('chart1',[data],{
    		  title: $(".graph-selector-node option:selected").text() + " - " + $(".graph-selector-topic option:selected").text(),
    		  axes:{
    		        xaxis:{
    		            renderer:$.jqplot.DateAxisRenderer
    		        }
    		  },
    	      series:[{lineWidth:1, markerOptions:{show:false}}]
    	  });
      },
      error: function() {$(".graph-container .mdl-spinner").hide(); $("#chart1").text("No data...")}
    });
  
//  var line1=[['2008-08-12 4:00PM',4], ['2008-09-12 4:00PM',6.5], ['2008-10-12 4:00PM',5.7], ['2008-11-12 4:00PM',9], ['2008-12-12 4:00PM',8.2]];
//  var line1=[[1506861659000,23.73],[1506861717000,24.22]];
//  
//  var plot1 = $.jqplot('chart1', [line1], {
//    title:'Default Date Axis',
//    axes:{
//        xaxis:{
//            renderer:$.jqplot.DateAxisRenderer
//        }
//    },
//    series:[{lineWidth:1, markerOptions:{show:false}}]
//  });
}

$(function() {
	call_getnodes({}, function(obj) {
		for ( var i = 0; i < obj.result.length; i++) {
			var r = obj.result[i];
			nodes[r.id_node] = r.node_name;
		}

		//After we got the nodes list...
		$(".graph-selector-node option").remove();
		$(".graph-selector-node").append(
				$('<option/>').text("Please select").attr("value", ""));
		$.each(nodes, function(idx, val) {
			if (val != null && val != "")
				$(".graph-selector-node").append(
						$('<option/>').text(val).attr("value", idx));
		});
		$(".graph-selector-node").change(function() {
			resizeGraphs();
		});
	});

	call_gettopics({}, function(obj) {
		for ( var i = 0; i < obj.result.length; i++) {
			var r = obj.result[i];
			topics[r.id_topic] = r.topic_name;
		}

		//After we got the topics list...
		$(".graph-selector-topic option").remove();
		$.each(topics, function(idx, val) {
			if (val != null && val != "")
				$(".graph-selector-topic").append(
						$('<option/>').text(val).attr("value", idx));
		});
		$(".graph-selector-topic").change(function() {
			resizeGraphs();
		});
	});
	
	$(window).on('resize', function() {
		resizeGraphs();
	});
	$(".graph-selector-interval").change(function() {
		resizeGraphs();
	});
});