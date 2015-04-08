var https = require('https');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

iconv.extendNodeEncodings();
module.exports = {
	fetchHotBoard : function(callback){
		try{	
			var options = { 
			    hostname : 'www.ptt.cc',
			    port : 443,
			    path : '/hotboard.html',
			    method : 'GET'
			};
			var rawHTML;
			var httpReq = https.request(options, function(outsideRes) {
				outsideRes.setEncoding('big5');
			  	outsideRes.on('data', function (chunk) {
			  		rawHTML += chunk;
			  	});
			  	outsideRes.on('end', function(){
			  		var result = [];
			  		var doms = cheerio.load(rawHTML);
			  		doms("#prodlist > dl > dd").each(function(idx, elm){
			  			var resultObj = {};
			  			doms(elm).children().children().children().each(function(i, e){
			  				if(i == 0){
			  					resultObj.hotness = parseInt(doms(e).text().match('-*[0-9]+')[0]);
			  				}else if(i == 1){
			  					resultObj.boardName = doms(e).text();
			  					resultObj.link = doms(e).children('a').attr('href');
			  				}else if(i == 2){
								resultObj.boardCap = doms(e).text();
			  				}
			  			});
			  			result.push(resultObj);
			  		});
			  		callback(JSON.stringify(result));
			  	})
			});
			httpReq.end();	
		}catch(e){
			console.log(e.message);
			callback(e.message);
		}
	},
	rawHtmlToData : function(rawHTML){
		var result = [];
		var doms = cheerio.load(rawHTML);
		doms(".r-list-container > .r-ent").each(function(idx, e){
			var tmpObj = {};
			tmpObj.link = doms(e).children('.title').children().attr('href');
			tmpObj.title = doms(e).children('.title').text().trim();
			tmpObj.nrec = doms(e).children('.nrec').text();
			tmpObj.date = doms(e).children('.meta').children('.date').text().trim();
			tmpObj.author = doms(e).children('.meta').children('.author').text().trim();
			result.push(tmpObj);
		});
		return result.reverse();
	},
	fetchArticleList : function(url, page, callback){
		console.log(">>> in fetching : url= " + url + ", page = " + page);
		try{
			var options = { 
			    hostname : 'www.ptt.cc',
			    headers : {Cookie : 'over18=1'},
			    port : 443,
			    path : url,
			    method : 'GET'
			};
			var rawHTML;
			var me = this;
			var httpReq = https.request(options, function(outsideRes) {
			  	outsideRes.on('data', function (chunk) {
			  		rawHTML += chunk;
			  	});
			  	outsideRes.on('end', function(){
			  		if(page > 1){
			  			var doms = cheerio.load(rawHTML);
			  			var link = 'default';
			  			doms('#action-bar-container a').each(function(idx, e){
			  				if(doms(this).text() == '‹ 上頁'){
			  					link = doms(this).attr('href');
			  				}
			  			});
			  			console.log(">>>> : " + link);
			  			console.log("number : " + link.match(/\d+/)[0]);
			  			var pttPageCount = link.match(/index\d+/)[0].match(/\d+/)[0];
			  			var neededPageCount = pttPageCount - (page - 2);
			  			console.log("need number : " + neededPageCount);
			  			var neededLink = link.replace(pttPageCount, neededPageCount);
			  			options.path = neededLink;
			  			var innerRawHTML = "";
			  			var shttpReq = https.request(options, function(res){
			  				res.on('data', function(chunk){
			  					innerRawHTML += chunk;
			  				});
			  				res.on('end', function(){
			  					callback(JSON.stringify(me.rawHtmlToData(innerRawHTML)), url, page);
			  				})
			  			});
			  			shttpReq.end();
			  		}else{
			  			var result = me.rawHtmlToData(rawHTML);
			  			if(page == 1){// strip board rule
			  				var idxOfRule = 0;
			  				for(var i in result){
			  					if(result[i].title.indexOf('版規') != -1){
			  						idxOfRule = i;
			  					}
			  				}
			  				callback(JSON.stringify(result.slice(parseInt(idxOfRule) +1)), url, page);
			  			}else{
			  				callback(JSON.stringify(result), url, page);
			  			}
			  		}
			  	})
			});
			httpReq.end();	
		}catch(e){
			console.log(e.message);
			callback(e.message);
		}
	},
	
	fetchArticle : function(url, callback){
		try{
			var options = { 
			    hostname : 'www.ptt.cc',
			    headers : {Cookie : 'over18=1'},
			    port : 443,
			    path : url,
			    method : 'GET'
			};
			var oorawHTML;
			var httpReq = https.request(options, function(outsideRes) {
			  	outsideRes.on('data', function (chunk) {
			  		oorawHTML += chunk;
			  	});
			  	outsideRes.on('end', function(){
			  		var result = [];
			  		var doms = cheerio.load(oorawHTML);
			  		var warp = {"rawData" : doms("#main-container").text()};
			  		callback(JSON.stringify(warp));
			  	})
			});
			httpReq.end();	
		}catch(e){
			console.log(e.message);
			callback(e.message);
		}
	}
}
