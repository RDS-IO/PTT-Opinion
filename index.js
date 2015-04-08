var lala = require('./fetch.js');
var fs = require('fs');

var curr = new Date();
var today = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
console.log(today.getTime());

var allArticleList = [];

function artileListHandler(result, currUrl, currPage){
	var rsObj = JSON.parse(result);
    var lastArticleDate = curr.getFullYear() + "/" + rsObj[rsObj.length -1].date;
    
    if(Date.parse(lastArticleDate) >= today.getTime()){ // keep fetching
    	currPage++;
		lala.fetchArticleList(currUrl, currPage, artileListHandler);	
	}else{
		interval = setInterval(getArticle, 50);
	}
	allArticleList = allArticleList.concat(rsObj);
}

lala.fetchArticleList("/bbs/Gossiping/index.html", 1, artileListHandler);

function getArticle(){
	if(allArticleList.length > 0){
		var al = allArticleList.shift();
		console.log("get article : " + al);
		lala.fetchArticle(al.link, function(r){
			var obj = JSON.parse(r);
			if(obj.rawData != null){
				var fileName = (new Date()).getTime();
				var text = obj.rawData.trim();
				var line = al.link + "\n" + al.title + "\n" 
						+ al.author + "\n " + al.date +", " + text + "\n";
				fs.appendFile('output/' + fileName + ".txt", line, 'utf8', function(err){
					if(err) throw err;
				});
			}
		});
	}else{
		clearInterval(interval);
		console.log('done fetch');
	}
}

function proccessEnd(idx){
	lala.fetchArticle(allArticleList[idx].link, function(r){
		var obj = JSON.parse(r);
		if(obj.rawData != null){
			var text = obj.rawData.trim();
			var line = allArticleList[idx].link + "\n" +allArticleList[idx].title + "\n" 
					+ allArticleList[idx].author + "\n " + allArticleList[idx].date +", " + text + "\n";
			fs.appendFile('output/' + idx, line, 'utf8', function(err){
				if(err) throw err;
			});
		}
	});
}

