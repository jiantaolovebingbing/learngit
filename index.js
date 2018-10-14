// 单体单例模式
var _2048 = (function(window, document){
	/*
		逻辑与操作分离
		一个函数只做一件事
	*/
	/*
		第一步：
			需要的函数
			getWindowSize
			setItemSize
			initGUI
	// */
	// 获取窗口的宽高innerHTML
	function getWindowSize(){
		return {
			w: document.documentElement.clientWidth,
			h: document.documentElement.clientHeight
		}
	}
	// 设置每一个 li 的宽高
	function setItemSize(winW, size, item){
		var itemSize = 0;
		if ( winW > 640 ) {return}
		itemSize = (winW - 5 - size*5) / size + "px";
		item.style.width = itemSize;
		item.style.height = itemSize;
		item.style.lineHeight = itemSize;
	}
	// 生成 2048 游戏的初始界面(返回一个包含list,root的对象)
	function initGUI( matrix ){
		// 一个跟标签
		var root = document.createElement("div"),
			ul = null,
			len = matrix.length,
			// 最后生成的矩阵
			list = [],
			item = null;
			winW = getWindowSize().w;

		for (var i = 0; i < len; i++) {
			list[i] = [];
			ul = document.createElement("ul");
			for (var j = 0; j < len; j++) {
				item = document.createElement("li");
				item.appendChild(document.createElement("div"));
				setItemSize(winW, len, item);
				list[i][j] = item;
				ul.appendChild(item);
			}

			root.appendChild(ul)
		}
		root.style.position = "relative";
		return {
			//list :一个二维数组，root:一个root根元素
			list: list,
			root: root
		}
	}

	/*
		第二步：
			生成随机数 random2_4
			填充生成的随机数 fillNumbers
			找到所有可以填充数字的位置 findEmptyItemCoordnate
			找到数字后 添加都对应的这个li的div里面 drawGUI
			生成颜色 通过每一个 div 元素的innerHTML决定 createColorByNumber
	*/
	// 生成随机数
	function random2_4(){
		return Math.random() > 0.5?4 : 2;
	}
	// 填充生成的随机数 随机取出一个空坐标填充数组
	function fillNumbers( matrix, isInit){
		var list = [],
			x,
			y,
			item,
			len = matrix.length,
			times = isInit ? 1 : len - 2;
			// console.log(matrix)
		for (var i = 0; i < times; i++) {
			item = findEmptyItemCoordnate(matrix);
			// console.log(item)
			if ( item && item.length == 2 ) {
				x = item[0];
				y = item[1];
				matrix[x][y] = random2_4()
			}
		}
	}

	// 找到所有可以填充数字的位置, 随机的返回一个位置，(一个二维数组)
	function findEmptyItemCoordnate( matrix ){
		var emptyLen = 0, flag = 0, emptyArr = [], len = matrix.length;
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len; j++) {
				if ( matrix[i][j] === 0 ) {
					emptyArr.push([i, j])
				}
			}
		}
		emptyLen = emptyArr.length;
		if ( emptyLen === 0 ) {
			return []
		}
		flag = Math.floor(Math.random() * emptyLen);
		// console.log(emptyArr);
		return emptyArr[flag]
	}
	// 找到数字后 添加到对应的这个li的div里面
	/*
		matrix: 数值的矩阵
		list: li 矩阵列表
	*/
	function drawGUI( matrix, list){
		// console.log(list)
		var len = matrix.length,
			item = null,
			color;
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len; j++) {
				color = createColorByNumber(matrix[i][j]);
				// console.log(color),一个json对象
				item = list[i][j].children[0];
				// console.log(item)
				// 对每一个div元素的innerHTML 进行赋值
				item.innerHTML = matrix[i][j] === 0? "" : matrix[i][j];
				item.style.background = color.bgColor;
				item.style.color = color.color;
				item.style.fontSize = "16px"
			}
		}
	}
	// 生成颜色 通过每一个 div 元素的innerHTML决定
	/*
		0 2 4 8 16 32 64 128 256 512 1024 2048

	*/
	function createColorByNumber(number){
		var flag = 0;
		var color = {
						'0':  {bgColor: '#cbc2b2', color: '#333'},
            '1':  {bgColor: '#ebe4d9', color: '#333'},
            '2':  {bgColor: '#eedec7', color: '#333'},
            '3':  {bgColor: '#f39763', color: '#fff'},
            '4':  {bgColor: '#f29c5c', color: '#fff'},
            '5':  {bgColor: '#ef8161', color: '#fff'},
            '6':  {bgColor: '#f16432', color: '#fff'},
            '7':  {bgColor: '#eed170', color: '#fff'},
            '8':  {bgColor: '#edce5d', color: '#fff'},
            '9':  {bgColor: '#edc850', color: '#fff'},
            '10': {bgColor: '#edc53f', color: '#fff'},
            '11': {bgColor: '#edc22e', color: '#fff'},
            '12': {bgColor: '#b884ac', color: '#fff'},
            '13': {bgColor: '#b06ca9', color: '#fff'},
            '14': {bgColor: '#7f3d7a', color: '#fff'},
            '15': {bgColor: '#6158b1', color: '#fff'},
            '16': {bgColor: '#3a337b', color: '#fff'},
            '17': {bgColor: '#0f4965', color: '#fff'},
            '18': {bgColor: '#666', color: '#fff'},
            '19': {bgColor: '#333', color: '#fff'},
            '20': {bgColor: '#000', color: '#fff'}
		}
		if( number ){
			flag = Math.log2(number)
		}
		return color[String(flag)]
	}

	/*singleStepScore
		第三步：
			添加事件 registerEvent
			判断是否可以移动
				以左移为例
				1、移动方向的左侧区块的内容为0
				2、移动区域的两个相邻的元素的内容一样（因为可以合并）
					左移 canGoLeft
					右移 canGoRight
					上移 canGoUp
					下移 canGoDown
			编写移动函数 move
	*/
	function registerEvent(callback){
		function keyEventHadlar(e){
			e = e || window.event;
			var code = e.keyCode;
			console.log(this);
			callback.call(this, code);
		}
		window.addEventListener("keydown", keyEventHadlar)
		return keyEventHadlar;
	}
//
	// 左移 canGoLeft
	function canGoLeft( matrix ){
		var len = matrix.length;
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len - 1; j++) {
				if ( matrix[i][j] === 0 && matrix[i][j + 1] > 0 ) {
					return true
				}
				if ( matrix[i][j] > 0 && matrix[i][j] === matrix[i][j + 1]  ) {
					return true
				}
			}
		}
		return false
	}
	// 右移 canGoRight"0"
	function canGoRight( matrix ){
		var len = matrix.length;
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len - 1; j++) {
				if ( matrix[i][j + 1] === 0 && matrix[i][j] > 0 ) {
					return true
				}
				if ( matrix[i][j + 1] > 0 && matrix[i][j] === matrix[i][j + 1]  ) {
					return true
				}
			}
		}
		return false
	}
//merge
	// 上移 canGoUp
	function canGoUp( matrix ){
		var len = matrix.length;
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len - 1; j++) {
				if ( matrix[j + 1][i] > 0 && matrix[j][i] === 0 ) {
					return true
				}
				if ( matrix[j + 1][i] > 0 &&  matrix[j + 1][i] ===  matrix[j][i] ) {
					return true
				}
			}
		}
		return false
	}
	// 下移 canGoDown
	function canGoDown( matrix ){
		var len = matrix.length;
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len - 1; j++) {
				if ( matrix[j][i] > 0 && matrix[j + 1][i] === 0 ) {
					return true
				}
				if ( matrix[j][i] > 0 &&  matrix[j + 1][i] ===  matrix[j][i] ) {
					return true
				}
			}
		}
		return false
	}
	// 取出非零的元素 即填充了数字元素
	function getFilledItem(matrix){
		var len = matrix.length, filled = [];
		for (var i = 0; i < len; i++) {
			for (var j = 0; j < len; j++) {
				if ( matrix[i][j] > 0 ) {
					filled.push({
						flag: [i, j],
						value: matrix[i][j]
					})
				}
			}
		}
		return filled;
	}
	// 移动函数  keyWord 上下左右的关键词
	function move(matrix,keyWord){
		var filled = getFilledItem(matrix);
		// console.log(filled)
		var len = matrix.length, line = [], lineLength = 0;
		switch (keyWord) {
			case "left":
				for (var i = 0; i < len; i++) {
					line = filled.filter(function(item){
						return item.flag[0] === i;
					})
					lineLength = line.length;
					for (var j = 0; j < lineLength; j++) {
						matrix[line[j].flag[0]][line[j].flag[1]] = 0;
						matrix[i][j] = line[j].value;
					}
					// console.log(matrix)
				}
				break;
			case "right":
				for (var i = 0; i < len; i++) {
					line = filled.filter(function(item){
						return item.flag[0] === i;
					})
					// console.log(line)
					lineLength = line.length;
					for (var j = 0; j < lineLength; j++) {
						/*
							倒数：
							j = 0  lineLength = 2
							lineLength -j -1 = 1;
							len -j -1 = 3
							matrix[line[len - j - 1].flag[0]][line[len - j - 1].flag[1]] = 0;
							matrix[i][lastItemIndex] = line[lastItemIndex].value
						*/
						var lastLineItemIndex = lineLength -j -1;
						var lastItemIndex = len -j -1;
						matrix[line[lastLineItemIndex].flag[0]][line[lastLineItemIndex].flag[1]] = 0;
						matrix[i][lastItemIndex] = line[lastLineItemIndex].value;
					}
					// console.log(matrix，handler)
				}
				break;
				case "up":
					for (var j = 0; j < len; j++) {
						line = filled.filter(function(item){
							return item.flag[1] === j;
						})
						// console.log(line)
						lineLength = line.length;
						for (var i = 0; i < lineLength; i++) {
							matrix[line[i].flag[0]][line[i].flag[1]] = 0;
							matrix[i][j] = line[i].value;
						}
						// console.log(matrix)
					}
					break;
				case "down":
					for (var j = 0; j < len; j++) {
						line = filled.filter(function(item){
							return item.flag[1] === j;
						})
						// console.log(line)
						lineLength = line.length;
						for (var i = 0; i < lineLength; i++) {
							var lastLineItemIndex = lineLength -i -1;
							var lastItemIndex = len - i -1;
							matrix[line[lastLineItemIndex].flag[0]][line[lastLineItemIndex].flag[1]] = 0;
							matrix[lastItemIndex][j] = line[lastLineItemIndex].value;
						}
						// console.log(matrix)
					}
					break;
		}
	}

	/*
		合并函数

	*/
 function merge(matrix, keyWord, callback) {
 		var len = matrix.length,singleStepScore = 0;
		switch (keyWord) {
			case "left":
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len-1; j++) {
						if (matrix[i][j] > 0 && matrix[i][j] === matrix[i][j+1]) {
							matrix[i][j] *= 2;
							singleStepScore += matrix[i][j];
							matrix[i][j+1] = 0;
						}
					}
				}
			break;
			case "right":
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len-1; j++) {
						if (matrix[i][j+1] > 0 && matrix[i][j] === matrix[i][j+1]) {
							matrix[i][j+1] *= 2;
							singleStepScore += matrix[i][j+1];
							matrix[i][j] = 0;
						}
					}
				}
			break;
			case "up":
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len-1; j++) {
						if (matrix[j][i] > 0 && matrix[j][i] === matrix[j+1][i]) {
							matrix[j][i] *= 2;
							singleStepScore += matrix[j][i];
							matrix[j+1][i] = 0;
						}
					}
				}
			break;
			case "down":
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len-1; j++) {
						if (matrix[j+1][i] > 0 && matrix[j][i] === matrix[j+1][i]) {
							matrix[j+1][i] *= 2;
							singleStepScore += matrix[j+1][i];
							matrix[j][i] = 0;
						}
					}
				}
				break;
			default:

		}
		callback && callback.call(this,singleStepScore);
 }
 //本地保存分数
 function saveMaxScore(size, score, maxScore) {
 	if (score > maxScore) {
 		window.localStorage.setItem("maxScore---" + size, score)
 	}
 }
 //获取本地的分数
 function getMaxScoreFromLocalStorage(size) {
 	return window.localStorage.getItem("maxScore---" + size);
 }
 //显示最高分
 function showMaxScore(ele, score, maxScore) {
 	return ele.innerHTML = score > maxScore ? score : maxScore;
 }
//游戏胜利与游戏结束
//游戏结束
function gameOver(rootEle, scoreElement, callback) {
	var wrapper = document.createElement("div"),
	h3 = document.createElement("h3"),
	restartBtn = document.createElement("button");
	wrapper.className = "gameover-wrapper";
	h3.className = "gameover-title";
	restartBtn.className = "gameover-btn";
	h3.innerHTML = "游戏结束";
	restartBtn.innerHTML = "重新开始";
	wrapper.appendChild(h3);
	wrapper.appendChild(restartBtn);
	rootEle.appendChild(wrapper);
	// var self = this;
	// self.scoreElement = scoreElement;
	restartBtn.addEventListener("click",function () {
		console.log(this,self,rootEle);
		callback && callback.call(this,wrapper);
		// self.scoreElement.innerHTML = 0;回调函数callback中加上了
	})
}
//游戏胜利
function gameWin(rootEle, scoreElement, restartCallback, continueCallback) {
	var wrapper = document.createElement("div"),
		h3 = document.createElement("h3"),
		restartBtn = document.createElement("button");
		continueBtn = document.createElement("button");
	wrapper.className = "gamewin-wrapper";
	h3.className = "gamewin-title";
	restartBtn.className = "gamewin-btn";
	continueBtn.className = "gamewin-con";
	h3.innerHTML = "游戏胜利";
	restartBtn.innerHTML = "重新开始";
	continueBtn.innerHTML = "继续游戏";
	wrapper.appendChild(h3);
	wrapper.appendChild(continueBtn);
	wrapper.appendChild(restartBtn);
	rootEle.appendChild(wrapper);
	restartBtn.addEventListener("click",function () {
		console.log(this);
		// console.log(Game,self.Game,self.scoreElement,rootEle);
		restartCallback && restartCallback.call(this, wrapper);
	});

	continueBtn.addEventListener("click",function () {
		rootEle.removeChild(wrapper);
		continueCallback && continueCallback.call(this);
	});
}
//重置次数
function resetTimes(self) {
	// console.log(self.init);
	self.remainTimes.innerHTML = 200;
}
// //新游戏按钮函数
// doNewGame(self, self.content, self.scoreElement, function () {
// 	console.log(self,self.root);
// 	self.root.parentNode.removeChild(self.root);
// 	// ele.parentNode.removeChild(ele);
// 	newGameEve(self);
// })
function newGameEve(self) {
	self.isInit = false;
	// self.scoreElement.innerHTML = 0;
	self.score = 0;
	self.init(self.config).start();
}
var Game = {
		// 左键
		ARROW_LEFT: 37,
		// 上键
		ARROW_UP: 38,
		// 右键
		ARROW_RIGHT: 39,
		// 下键
		ARROW_DOWN: 40,
		// 初始的分数
		score: 0,
		// 初始的盒子大小（尺寸）
		size: 4,
		//是否初始化
		isInit: false,
		// 矩阵数据 就是 matrix
		data: [],
		// 最高分
		maxScore: 0,
		// 初始化游戏的函数
		// config 是在使用这个 _2048 的时候需要的一些配置信息
		init: function(config){
			// 存放布局信息
			var gui = {};
			//保存配置信息
			this.config = config;
			// 2048 游戏总容器
			this.wrapper = config.wrapper;
			// 2048 游戏内容容器
			this.content = config.parent;
			// 2048 游戏得分容器
			this.scoreElement = config.score;
			// 2048 游戏最高分容器
			this.maxScoreElement = config.maxScore;
			//新游戏按钮
			this.newGameBtn = config.newGameB;
			//剩余步数
			this.remainTimes = config.remainT;
			// 2048 游戏盒子大小，有默认值，默认是 4 表示 4 * 4 的结构
			this.size = config.size || this.size;
			// console.log(this,this.scoreElement);
			// 生成 默认 二维矩阵
			for (var i = 0; i < this.size; i++) {
				this.data[i] = [];
				for (var j = 0; j < this.size; j++) {
					this.data[i][j] = 0
				}
			}
			gui = initGUI(this.data);
			this.root = gui.root;
			this.elements = gui.list;
			// console.log(gui)
			//初始化游戏的时候获取最高分  showMaxScore
			this.maxScore = getMaxScoreFromLocalStorage(this.size);

			try {
				if ( getWindowSize().w > 640 ){
					this.wrapper.style.width = 40 + this.size *5 + 60*this.size + "px"
				}
				// 把创建的元素放在 content 中
				this.maxScoreElement.innerHTML = this.maxScore;
				this.scoreElement.innerHTML = this.score;
				this.content.appendChild(this.root)
				return this
			} catch(e) {
				throw new Error(e)
			}

		},
		// 游戏开始callback
		start: function(){
			let self = this;
			let startTime = new Date();
			/* 第二步需要的代码 */
			fillNumbers(this.data, this.isInit);
			// console.log(this.isInit);
			this.isInit = true;
			// console.log(this.isInit);
			drawGUI(this.data, this.elements);

			//新游戏按钮事件,onclick 和 addEventListener的区别
			this.newGameBtn.onclick = function () {
				let timeDiff = new Date() - startTime;
				if ( timeDiff > 300 ) {
					window.removeEventListener("keydown",handler);
					self.root.parentNode.removeChild(self.root);
					newGameEve(self);
					resetTimes(self);
				}
			}

			/* 第三步的代码 */
			var handler = registerEvent(function(code){
				// console.log(this)
				var remainCount = self.remainTimes.innerHTML ;
				if (self.isGameOver() || remainCount  < 1) {
					window.removeEventListener("keydown",handler);
					gameOver(self.content, self.scoreElement, function (ele) {
						console.log(self.root,ele);
						/// ele是gameoverWrapper
						self.root.parentNode.removeChild(self.root);
						ele.parentNode.removeChild(ele);
						newGameEve(self);
						resetTimes(self);
					});
				}
				switch ( code ) {
					// 左键
					case self.ARROW_LEFT:
						// console.log("ARROW_LEFT")
						self.go("left");
						break;
					case self.ARROW_UP:
						// console.log("ARROW_UP")
						self.go("up");
						break;
					case self.ARROW_RIGHT:
						// console.log("ARROW_RIGHT")
						self.go("right");
						break;
					case self.ARROW_DOWN:
						// console.log("ARROW_DOWN")
						self.go("down");
						break;
				}
				// fillNumbers(this.data);
				drawGUI(self.data, self.elements);
				//设置分数
				self.scoreElement.innerHTML = self.score;
				//
				saveMaxScore(self.size, self.score, self.maxScore);
				// getMaxScoreFromLocalStorage(self.size);
				showMaxScore(self.maxScoreElement,self.score,self.maxScore)


				//判断游戏是否胜利init:
				if (self.isWin()) {
					window.removeEventListener("keydown",handler);
					self.remainTimes.innerHTML = 10000;
					gameWin(self.content, self.scoreElement, function (ele) {
						console.log(ele);
						self.root.parentNode.removeChild(self.root);
						ele.parentNode.removeChild(ele);
						newGameEve(self);
						resetTimes(self);
					}, function () {
						self.isWin = function(){
							return false;
						};
						self.start();
					})
				}
			})

		},
		// 移动
		go: function(keyWord){
			var matrix = this.data, self = this;
			if ( keyWord ) {
				if ( this.canGo(keyWord) ) {
					// console.log(1)
					self.remainTimes.innerHTML--;
					move(matrix, keyWord);
					// hebing
					merge(matrix,keyWord,function(singleStepScore) {
						self.score += singleStepScore;
					});
					move(matrix, keyWord);
					fillNumbers(this.data, this.isInit);
					//生成数字
					// fillNumbers()
				}
			}
		},
		// 判读是否能移动的一个综合的函数
		canGo: function(keyWord){
			var matrix = this.data;
			switch (keyWord) {
				case "left":
					return canGoLeft(matrix)
					break;
				case "up":
					return canGoUp(matrix)
					break;
				case "right":
					return canGoRight(matrix)
					break;
				case "down":
					return canGoDown(matrix)
					break;
			}
		},
		isGameOver:function () {
			return !(this.canGo("up") || this.canGo("right") || this.canGo("down") || this.canGo("left") );
		},

		//获取每一个元素的内容
		getMax : function () {
			var max = 0;
			for (var i = 0; i < this.size; i++) {
				for (var j = 0; j < this.size; j++) {
					if ( max < this.data[i][j] ) {
						max = this.data[i][j];
					}
				}
			}
			// console.log(max);
			return max;
		},
		//游戏胜利 有一个元素的内容达到2048
		isWin : function () {
			return this.getMax() === 1024;
		},
	};

return {
	Game: Game
}
})(window, document);
