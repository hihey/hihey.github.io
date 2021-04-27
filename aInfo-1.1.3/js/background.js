chrome.contextMenus.create({
	type: 'normal', // 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
	contexts: ['page'],//上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
	title: '东福官网',
	onclick: function(){
		chrome.tabs.create({url: 'http://www.dongfangfuli.com/mall?city=145'});
	}
});

//设置图标文本
//chrome.browserAction.setBadgeText({text: "ALL"});
chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});



//只要是触发就会弹出提示（可作为消息通知）
//chrome.notifications.create({
//	type: 'basic',
//	iconUrl: 'img/icon.png',
//	title: '初始化成功',
//	message: '初始化成功！！！'
//});