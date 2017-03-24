//某数字是否在array中
function inArray(val,arr){
	for(var i=0;i<arr.length;i++){
		if(arr[i] == val) {
			return true;
			break;
		}
	}
	return false;
}
//得到设置密码还是验证密码
var getPWType = function(){
	for(var k=0;k<document.getElementsByClassName('PWTypeSelect').length;k++){
		if(document.getElementsByClassName('PWTypeSelect')[k].checked){
			return document.getElementsByClassName('PWTypeSelect')[k].value;
		}
	};
};
//当touch / move时,返回相对canvas的X，Y坐标
function touchAndMove(){
	var touchElTop = document.getElementById('touchEl').offsetTop;
	var touchElLeft = document.getElementById('touchEl').offsetLeft;

	document.getElementById('touchEl_Area').addEventListener('touchstart', function(e){
		var offX = e.targetTouches[0].pageY - touchElTop;
		var offY = e.targetTouches[0].pageX - touchElLeft;
	}, false);
	document.getElementById('touchEl_Area').addEventListener('touchmove', function(e){
		if(e.targetTouches.length>1){
			//输入密码时有第二个手指，中断
			//初始化canvas，dotData = []
			can.init();
		}
		else{
			touchElTop = document.getElementById('touchEl').offsetTop;
			touchElLeft = document.getElementById('touchEl').offsetLeft;
			var offY = e.targetTouches[0].pageY - touchElTop;
			var offX = e.targetTouches[0].pageX - touchElLeft,belongToN;
			//console.log([offX,offY]);
			//阻止页面在输密码时滚动
			e.preventDefault();
			//若offX,offY属于9个点坐标之一
				//push dotData
			var belongToN = can.belongToArea(offX,offY)
			if(typeof belongToN != "boolean"){
				//若不存在dotData中，push
				if(!inArray(belongToN,can.dotData)) {
					var tempArray = can.dotData;
					tempArray.push(belongToN)
					can.dotData = tempArray;
				}
				//lastDotToRandom
			}
			can.initDrawMap();
			can.lastDotToRandom(offX,offY);
		}
	}, false);
	document.getElementById('touchEl_Area').addEventListener('touchend', function(e){
		//通过dotData重新画
		can.initDrawMap();
		//判断是否正常的密码,testPW()
		can.testPW();
		//2s后dotData = [];
		setTimeout(function(){
			this.dotData = [];
		}.bind(can), 2000);
	}, false);
}

//canvas操作集合
var can = new function(){
	this.el = document.getElementById('touchEl_Area');
	//自动设置canvas长宽
	this.el.width = document.getElementsByClassName('touchEl_Area')[0].clientWidth;
	this.el.height = document.getElementsByClassName('touchEl_Area')[0].clientHeight;

	this.ctx = this.el.getContext("2d");
	this.minLen = 4;
	this.PWType = "setPW";
	//localStorage => PW
	//localStorage.myPassWord
		//存入localStorage,不支持localStorage返回false
		this.setStorage = function(key,val){
			if (typeof(Storage) !== "undefined") {
			    // Store
			    localStorage.setItem(key, val);
			    return true;
			    // Retrieve
			    //console.log(localStorage.getItem("lastname"));
			} else {
			    alert("抱歉！您的浏览器不支持 Web Storage ...");
			    return false;
			}
		}
		//读取localStorage,不支持localStorage返回false
		this.getStorage = function(key){
			if (typeof(Storage) !== "undefined") {
			    return localStorage.getItem(key)?localStorage.getItem(key):false;
			} else {
			    alert("抱歉！您的浏览器不支持 Web Storage ...");
			    return false;
			}
		}
	this.PW = ''
	var tempPW = '';
	//dotData使用defineProperty,set时自动initDrawMap
	//0 1 2
	//3 4 5
	//6 7 8
	this.dotData = [];
	//9个圆的圆心[circle1,circle2,……,circle9],radius
	this.areaXY = (function(){
		var w = this.el.clientWidth,h = this.el.clientHeight;
		var wX = [w*0.15,w*0.5,w*0.85],hY = [h*0.15,h*0.5,h*0.85],ans = [];
		for(var i=0;i<hY.length;i++){
			for(var j=0;j<wX.length;j++){
				ans.push([Math.round(hY[i]),Math.round(wX[j])]);
			}
		}
		return ans;
	}).call(this);
	//touch时是否在9个点上
	//在，返回是第n个点
	this.belongToArea = function(x,y){
		for(var i=0;i<this.areaXY.length;i++){
			var areaX = this.areaXY[i][1],areaY = this.areaXY[i][0];
			if( (x>areaX-this.radius) && (x<areaX+this.radius) && (y>areaY-this.radius) && (y<areaY+this.radius) ){
				return i;
			}
		}
		return false;
	}
	this.radius = Math.round(this.el.clientWidth*0.1);
	//通过dotData画点，划线
	//for循环画9个圆
		//若第i个在this.dotData中，画蓝色圆并fill
		//若不在，画黑色圆stroke
	//通过dotData在各个点之间连线
	this.initDrawMap = function(){
		this.ctx.clearRect(0,0, this.el.clientWidth, this.el.clientHeight);
		//for循环画9个圆
		for(var i=0;i<this.areaXY.length;i++){
			this.ctx.beginPath();
			//若第i个在this.dotData中，画蓝色圆并fill
			if(inArray(i,this.dotData)){
				var x = this.areaXY[i][1],y = this.areaXY[i][0];
				this.ctx.fillStyle = "#5CACEE";
				this.ctx.arc(x,y,this.radius/2,0,2*Math.PI,true);
				this.ctx.fill();

				this.ctx.beginPath();
				this.ctx.lineWidth = 4;
				this.ctx.strokeStyle = "#4F4F4F";
				this.ctx.arc(x,y,this.radius,0,2*Math.PI,true);
				this.ctx.stroke();
			}
			//若不在，画黑色圆stroke
			else{
				this.ctx.lineWidth = 2;
				this.ctx.strokeStyle = "#919191";
				var x = this.areaXY[i][1],y = this.areaXY[i][0];
				this.ctx.arc(x,y,this.radius,0,2*Math.PI,true);
				this.ctx.stroke();
			}
		}
		//通过dotData连线
		var tempDot;
		for(i=0;i<this.dotData.length;i++){
			if(typeof tempDot=="number"){
				this.dotToDot(tempDot,this.dotData[i]);
				tempDot = this.dotData[i];
			}
			else {tempDot = this.dotData[i];}
		}
	};
	
	//从各个点之间连线
	this.dotToDot = function(prev,next){
		var prevX = this.areaXY[prev][1],prevY = this.areaXY[prev][0],
			nextX = this.areaXY[next][1],nextY = this.areaXY[next][0];
		this.ctx.beginPath();
		this.ctx.lineWidth = this.radius/2;
		this.ctx.strokeStyle ="#5CACEE";
		this.ctx.moveTo(prevX,prevY);
	    this.ctx.lineTo(nextX,nextY);
	    this.ctx.stroke();
	}
	//从最后一个点到手指的点连线
	this.lastDotToRandom = function(x,y){
		//nthDot为此前最后一个划到的点,nthDot = dotData[-1]
		if(this.dotData.length == 0) var nthDot = null;
		//若nthDot不存在，不划线
		//else存在
		else{
			//nthDot = dotData[-1]
			var nthDot = this.dotData[this.dotData.length-1],
				prevX = this.areaXY[nthDot][1],prevY = this.areaXY[nthDot][0];
			//从第n个点化线去当前的X Y坐标
			this.ctx.beginPath();
			this.ctx.lineWidth = this.radius/2;
			this.ctx.strokeStyle ="#5CACEE";
			this.ctx.moveTo(prevX,prevY);
		    this.ctx.lineTo(x,y);
		    this.ctx.stroke();
		}
	};
	var testNum = 0;
	//this.PWType == "setPW"
		//testNum == 0
				//若dotData.length<minLen
					//设置intro，密码太短，至少5个，2s还原
				//else
					//设置intro，请再次输入，2s还原
					//tempPW = dotData.join(''),testNum++
					//dotData = []
			//testNum == 1
				//dotData等同于tempPW
					//密码设置成功，2s还原
					//tempPW => localstorage
				//不同
					//密码不一致，2s还原
					//tempPW = '',testNum = 0
		//this.PWType == "checkPW"
			//PW不存在，this.PW == ''
				//密码不存在，return 0
			//PW存在
				//dotData 等同于PW
					//密码正确，2s还原
				//不同
					//密码不正确，2s还原
	this.testPW = function(){
		var currentType = getPWType();
		//this.PWType == "setPW"
		if(currentType == 'setPW'){
			//testNum == 0
			if(testNum == 0){
				//若dotData.length<minLen
				if(this.dotData.length<this.minLen){
					//设置intro，密码太短，至少4个，2s还原
					setIntro('密码太短，至少'+this.minLen+'个',false,2000);
				}
				//else
				else{
					//设置intro，请再次输入
					document.querySelector('.touchEl_intro').innerHTML = '<p class="success">请再次输入</p>';
					//tempPW = dotData.join(''),testNum++
					tempPW = this.dotData.join('');
					testNum++;
					//dotData = []
					setTimeout(function(){
						this.dotData = [];
					}.bind(this), 2000);
				}
			}
			//testNum == 1
			else if(testNum == 1){
				//dotData等同于tempPW
				if(this.dotData.join('') == tempPW){
					//密码设置成功，2s还原
					setIntro('密码设置成功',true,2000);
					//tempPW => localstorage
					this.setStorage('myPassWord',tempPW);
				}
				else{
				//不同
					//密码不一致，2s还原
					setIntro('密码不一致',false,2000);					
				}
				//tempPW = '',testNum = 0		
				tempPW = '';
				testNum = 0;	
			}
		}
		//this.PWType == "checkPW"
		else if(currentType == "checkPW"){
			console.log('check mode!');
			//PW不存在，this.PW == ''
			if(typeof this.PW == 'boolean'){
				//密码不存在，return 0
				setIntro('当前尚未设置过密码',false,2000);
			}
			//PW存在
			else{
				//dotData 等同于PW
				if(this.dotData.join('') == this.PW){
					//密码正确，2s还原
					setIntro('密码正确！',true,2000);
				}
				//不同
				else{
					//密码不正确，2s还原
					setIntro('输入的密码不正确！',false,2000);
				}							
			}
			//tempPW = '',testNum = 0		
			tempPW = '';
			testNum = 0;
		}
	};
	function setIntro(val,sOrE,time){
		document.querySelector('.touchEl_intro').innerHTML = '<p class="'+(sOrE?'success':'error')+'">'+val+'</p>';
		setTimeout(function(){
			document.querySelector('.touchEl_intro').innerHTML = '<p>请输入手势密码</p>';
		}.bind(this), time);
	}
	this.init = function(){
		//初始化dotData,tempPW,testNum
		this.dotData = [];
		tempPW = '';
		testNum == 0;
		//画9个空圈
		this.initDrawMap();
		//defineProperties PW,dotData
		//数据变化时自动变化
		Object.defineProperties(this,{
			PW:{
				set:function(newValue){
					console.log('set PW to localStorage!!!');
					this.setStorage('myPassWord',newValue)
				},
				get:function(){
					//console.log('get pw from localStorage!!!');
					return this.getStorage('myPassWord');
				},
				enumerable : true,
				configurable : true
			},
			dotData:{
				set:function(newValue){
					this._dotData = newValue;
					this.initDrawMap();
				},
				get:function(){
					//console.log('got DotData!!!!');
					return this._dotData?this._dotData:[];
				}
			},
		});
	};
	this.init();
}

touchAndMove();