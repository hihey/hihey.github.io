document.addEventListener('DOMContentLoaded',initData);
$(document).ready(function(){
	
	$("#json-config-p").bind("click",function(){reInitData('prd')});
	$("#json-config-s").bind("click",function(){reInitData('stage')});
	$("#json-config-5").bind("click",function(){reInitData('test05')});
	$("#json-config-d").bind("click",function(){reInitData('dev')});
});

//切换环境
function reInitData(v){
	localStorage.setItem("json-evn", v);
	initData();
}

//初始化加载
function initData(){
	var _json = json;
	var evn = localStorage.getItem("json-evn");
	if(evn=='test05'){
		_json = json_test05;
		$("#top-title").text("T5环境");
	}else if(evn=='stage'){
		_json = json_stage;
		$("#top-title").text("STG环境");
	}else if(evn=='prd'){
		_json = json;
		$("#top-title").text("PRD环境");
	}else if(evn=='dev'){
		_json = json_dev;
		$("#top-title").text("DEV环境");
	}
	
	var html = "";
	$.each(_json, function(idx, obj) {
		var href = "";
		if(obj.href!=null && $.trim(obj.href)!="")href = obj.href;
		var title = "";
		if(obj.title!=null && $.trim(obj.title)!="")title = obj.title;
		html+='<div id="'+ obj.name +'-P">';
	  html+='<lable class="aInfo-lable" data-url="'+ href +'" title="'+ title +'"><span class="SUC_COUNT" data-count="'+ obj.ip.length +'" data-suc="0">●</span> '+ obj.name +'（'+ obj.ip.length +'台）</lable>';
	  html+='<div id="'+ obj.name +'"></div>';
	  html+='</div>';
	});
	$("#aInfo-Panel").html(html);
	$(".aInfo-lable").bind("click",function(){
		var url = $(this).attr("data-url");
		if(url!=null && $.trim(url)!=""){
			open(url);
		}
	});
	
	aInfoLoad(_json);
}

//加载信息
function aInfoLoad(_json){
	$(".SUC_COUNT").attr("data-suc",0);
	$.each(_json, function(idx, obj) {
		$("#" + obj.name).html("");
		$.each(obj.ip, function(_idx, o) {
			getInfo(obj.name,"http://" + o);
		});
	});
}

function getTagId(u){
	var jiqiPort = u.replace("//","").split(":");
	return [jiqiPort[1],jiqiPort[2]];
}

//获取版本信息（连接情况）
function getInfo(tag,u){
	var url = u + "/actuator/info";
	$.ajax({
      type:"GET",
      url:url,
      dataType:"json",
      success:function(data){
      	var old = $("#" + tag).html();
      	var jiqi = getTagId(u);
      	$("#" + tag).html(old + "<li><font class='mmm' title='点击复制' data-clipboard-text='" + data.git.branch + "' data-branch='" + data.git.branch + "'>" + data.git.branch + "</font><front style='color:#c5a398'> ["+ data.git.commit.id +"]</front><front class='mmm' title='点击复制' data-clipboard-text='" + jiqi[0] + "'>（" + jiqi[0] + "）</front><span id='"+ jiqi[0] + jiqi[1] +"'></span>" + "<br></li>");
      	
      	//统计成功访问数量
      	var count = $("#" + tag).parent().find("span").attr("data-count");
      	var old = $("#" + tag).parent().find("span").attr("data-suc");
      	var curr = Number(old) + 1;
      	if(Number(count)==curr){
      		$("#" + tag).parent().find("span").first().css("color","#09f909");
      	}
      	$("#" + tag).parent().find("span").first().attr("data-suc",curr);
      	
      	//存在不一致版本
      	var currBranch = data.git.branch;
      	var branchs = $("#" + tag).find("font");
      	$.each(branchs, function(_idx, o) {
      		var thisBranch = $(o).attr("data-branch");
					if(currBranch!=thisBranch){
						$("#" + tag).parent().find("span").first().css("color","#ffffff");
					}
				});
				
				//复制
				$(".mmm").unbind().bind("click",function(tag){
						myPop(tag);
						var clipboard = new ClipboardJS(".mmm");
						clipboard.on('success', function(e) {
					    e.clearSelection();
						});
						clipboard.on('error', function(e) {
						});
				});
				
				//持续运行时长
      	getPrometheus(tag,u);
      },error:function(jqXHR){
      	$("#" + tag).parent().find("span").first().css("color","red");
        console.log("Error: "+jqXHR.status);
      }
  });
}

//复制弹出提示
function myPop(e){
	var $i=$('<font></font>').text("已复制");
  var x=e.pageX,y=e.pageY;
  $i.css({
    "top": y - 20,
    "left": x,
    "position": "absolute",
    "color": 'white',
    "font-size": 12,
  });
  $(".aInfo-bg").append($i);
  $i.animate({
    "top": y - 20,
    "opacity": 0
  }, 800, function() {
    $i.remove();
  });
}

//获取时长
function getPrometheus(tag,u){
	var url = u + "/actuator/prometheus";
	$.ajax({
      type:"GET",
      url:url,
      dataType:"text",
      success:function(data){
      	var sIndex = data.lastIndexOf("process_uptime_seconds");
      	
      	var ti = data.substring(sIndex+23,sIndex+23+20);
      	if(ti.indexOf("#")>-1){
      		ti = ti.substring(0,ti.indexOf(" ")-2);
      	}else{
      		ti = $.trim(ti);
      	}
      	
      	var jiqi = getTagId(u);
      	if(document.getElementById(jiqi[0] + jiqi[1])){
      		document.getElementById(jiqi[0] + jiqi[1]).innerHTML = getDiff(ti);
      	}
      },error:function(jqXHR){
        console.log("Error: "+jqXHR.status);
      }
  });
}

function open(u){
	chrome.tabs.create({url: u});
}

function getDiff(date3){
	var days=Math.floor(date3/(24*3600));
	var leave1=date3%(24*3600);//计算天数后剩余的毫秒数
	var hours=Math.floor(leave1/(3600));
	var leave2=leave1%(3600);//计算小时数后剩余的毫秒数
	var minutes=Math.floor(leave2/(60));
	var leave3=leave2%(60);//计算分钟数后剩余的毫秒数
	var seconds=Math.round(leave3);
	var result = "";
	if(days>0){
		result += days + "天 "
	}
	result += hours+"小时 "+minutes+" 分钟"+seconds+" 秒";
	return result;
}