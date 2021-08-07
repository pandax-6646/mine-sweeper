// ES6面向对象方式

// 定义创建雷盘的对象
class Mine {
  constructor(tr, td, mineNum) {

    // 行
    this.tr = tr;

    // 列
    this.td = td;

    // 地图里雷的总数
    this.mineNum = mineNum;

    // 按行与列的顺序保存所有方块信息对象的数组
    this.squares = [];

    // 存储所有格子的DOM元素对象
    this.allDom = [];

    // 剩余雷的数量
    this.surplusMine = mineNum;

    // 当最后一面小红旗标记后，每面旗下面是否都是雷
    this.allIn = false;

    // 获取雷盘元素
    this.parent = document.getElementsByClassName('gameBox')[0];

    // 剩余雷数的元素
    this.mineNumDom = document.getElementsByClassName('mineNum')[0];
  }



  // 初始化
  init() {

    this.saveSquaresInfo();

    this.updataNum();

    this.creatDom();

    // 取消鼠标右键的点击事件
    this.parent.oncontextmenu = () => false;

    // 在页面显示雷的数量
    this.mineNumDom.innerHTML = this.mineNum;
  }


  // 创建表格
  creatDom() {

    // 创建table标签
    let table = document.createElement('table');
    for (let i = 0; i < this.tr; i++) {

      // 创建tr标签
      let trDom = document.createElement('tr');

      // 创建保存每列里所有格子DOM对象的数组
      this.allDom[i] = [];

      for (let j = 0; j < this.td; j++) {

        // 创建td标签
        let tdDom = document.createElement('td');

        // 给每个td标签绑定鼠标左右键的点击事件
        tdDom.onmousedown = (e) => {
          this.play(e);
        }

        // 把每个格子的行与列坐标保存到格子身上
        tdDom.pos = [i, j];


        // 保存格子的DOM对象
        this.allDom[i][j] = tdDom;

        // 每创建一个td标签，就插入到tr中
        trDom.appendChild(tdDom);
      }

      // 每创建一个tr标签，就插入到table中
      table.appendChild(trDom);
    }

    // 选择其他难度等级前要清空上一个雷盘
    this.parent.innerHTML = '';

    // 将table标签插入到页面中
    this.parent.appendChild(table);
  }



  // 生成n个随机不重复的数字
  randomNum() {

    // 生成一个空的数组，长度为格子的总数
    let arr = new Array(this.tr * this.td);

    for (let i = arr.length; i > 0; i--) {

      arr[i] = i
    }

    // 将数组里的数据乱序并取出前n个作为雷
    return arr.sort(() => 0.5 - Math.random()).slice(0, this.mineNum);
  }



  // 将所有方块信息的对象保存到数组中
  saveSquaresInfo() {

    // 保存随机数的数组
    let randomArr = this.randomNum();

    let n = 0;

    for (let i = 0; i < this.tr; i++) {
      this.squares[i] = [];

      for (let j = 0; j < this.td; j++) {

        // 为了能以行与列的形式遍历所有格子
        n++;

        if (randomArr.indexOf(n) == -1) {

          // 找到的是数字(行和列的x,y与像素坐标的x,y的值刚好是相反的)
          this.squares[i][j] = { type: 'number', x: j, y: i, value: 0 }
        } else {

          // 找到的是雷
          this.squares[i][j] = { type: 'mine', x: j, y: i }
        }
      }
    }
  }



  // 通过某个格子的像素坐标找到周围的八个格子
  getAround(square) {
    let x = square.x;
    let y = square.y;

    // 用于保存找到的坐标
    let result = [];

    //找格子的规律
    // x-1, y-1       x, y-1        x+1, y-1

    // x-1, y         x, y          x+1, y    

    // x-1, y+1       x, y+1        x+1, y+1

    // 通过像素坐标进行循环
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {

        // 剔除周围非数字的格子、越界的情况、传入的格子本身
        if (
          i < 0 ||                              //左
          j < 0 ||                              //右
          i > this.td - 1 ||                    //下
          j > this.tr - 1 ||                    //上
          (i == x && j == y) ||                 //本身

          // 行与列的格式坐标与像素格式坐标相反
          this.squares[j][i].type == 'mine'     //雷
        ) {
          continue;
        }

        // 以行与列的格式返回出去，后面要用这种格式的坐标去取squares里的数据
        result.push([j, i]);
      }
    }
    return result;
  }



  // 更新雷周围格子的数字
  updataNum() {
    for (let i = 0; i < this.tr; i++) {
      for (let j = 0; j < this.td; j++) {

        if (this.squares[i][j].type == 'number') {
          continue;
        }

        // 保存找到的雷周围格子的坐标
        let num = this.getAround(this.squares[i][j]);

        // 把找到的坐标相对应的格子里的数字加一
        for (let k = 0; k < num.length; k++) {
          this.squares[num[k][0]][num[k][1]].value += 1;
        }
      }
    }
  }



  // 扩散算法
  diffusion(square, clArr) {
    // 1.显示自己的·数字
    //    2.展示四周（四周有不为0的格子，那就不用以这个不为0的格子为中心往它的四周找了）
    //        1.显示自己的·数字
    //            2.展示四周（四周有不为0的格子，那就不用以这个不为0的格子为中心往它的四周找了）
    //                    ......类推


    // 找到周围的八个格子
    let around = this.getAround(square);
    for (let i = 0; i < around.length; i++) {

      let x = around[i][0];
      let y = around[i][1];

      // 显示自己（0的）
      this.allDom[x][y].className = clArr[this.squares[x][y].value];


      // 找到的某个格子为中心往四周找到vlaue的值为0
      if (this.squares[x][y].value == 0) {

        // 找过的格子要被记录，只有没被找过的格子才需要接着调用（递归）
        if (!this.allDom[x][y].check) {
          this.allDom[x][y].check = true;
          this.diffusion(this.squares[x][y], clArr);
        }

        // 显示自身的数字value不为0时， 
      } else {
        this.allDom[x][y].innerHTML = this.squares[x][y].value;
      }
    }
  }

  

  // 开始游戏的方法
  play(event) {

    // 事件源对象
    let currDom = event.target;

    // 只有每游标红旗的格子才能被鼠标左键点击
    if (event.button == 0 && currDom.className != 'flag') {

      // 获取当前点击到的格子里的信息
      let currSquare = this.squares[currDom.pos[0]][currDom.pos[1]];

      // 保存数字颜色的类名
      let colorArr = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']

      // 点击到的是数字
      if (currSquare.type == 'number') {

        // 给每个格子里的非0数字添加到页面的元素中并给一个颜色的class类名
        currDom.innerHTML = currSquare.value;
        currDom.className = colorArr[currSquare.value];
        if (currSquare.value == 0) {
          currDom.innerHTML = '';

          this.diffusion(currSquare, colorArr);
        }

      } else if (currSquare.type == 'mine') {

        // 结束游戏
        this.over(currDom);
      }

      // 鼠标右键点击
    } else if (event.button == 2) {

      // 多次点击时小红旗的切换及其剩余雷数的变化
      // 没有被左键点击时右键触发
      if (!currDom.className) {
        currDom.className = 'flag';
        this.mineNumDom.innerHTML = --this.surplusMine;

        // 已被右键点击过的右键触发
      } else if (currDom.className == 'flag') {
        currDom.className = '';
        this.mineNumDom.innerHTML = ++this.surplusMine;
      }


      // 每次右键点击到的都是是雷
      if (this.squares[currDom.pos[0]][currDom.pos[1]].type == 'mine') {
        this.allIn = true;

        // 有一次右键点击到的不是雷
      } else {
        this.allIn = false;
      }

      // 用户标完小红旗
      if (this.surplusMine == 0) {
        if (this.allIn) {

          alert('恭喜你，游戏过关！' + '所用时间为：' + this.getGameTime());
        } else {

          this.over();
        }
      }
    }
  }



  // 结束游戏
  over(dom) {

    // 显示所有的雷
    for (let i = 0; i < this.tr; i++) {
      for (let j = 0; j < this.td; j++) {
        if (this.squares[i][j].type == 'mine') {
          this.allDom[i][j].className = 'mine';
        }

        // 取消所有格子的点击事件
        this.allDom[i][j].onmousedown = null;
      }
    }

    // 点中的雷标黄
    if (dom) {
      dom.style.backgroundColor = '#ff0';
    }
    alert( '游戏结束！' + '所用时间为：' + this.getGameTime());
  }



  // 获取游戏时长（将毫秒数的时间转为00:00:00的格式）
  getGameTime() {
    lastTime = new Date().getTime();

    let time = (lastTime - newTime) / 1000;
    let str, hours, minute, second;

    if (time > 3600) {
      let num = parseInt(parseInt(time / 3600));
      hours = num >= 10 ? num + ':' : '0' + num + ':';
      minute = (time - num * 3600) / 60 >= 10 ? parseInt((time - num * 3600) / 60) + ':' : '0' + parseInt((time - num * 3600) / 60) + ':';
    } else {
      hours = parseInt(time / 3600) > 0 ? (parseInt(time / 3600) >= 10 ? (parseInt(time / 3600) + ':') : ('0' + parseInt(time / 3600) + ':')) : '';
      minute = parseInt(time / 60) >= 10 ? (parseInt(time % 3600) >= 59 ? (parseInt(parseInt(time % 3600) / 60) + ':') : (parseInt(time / 60) + ':')) : ('0' + parseInt(time / 60) + ':');
    }

    second = parseInt(time % 60) >= 10 ? parseInt(time % 60) : '0' + parseInt(time % 60);

    // 更新上次保留的时间
    newTime = lastTime;
    return str = hours + minute + second;
  }
}



// 游戏难度按钮
let oBtnArr = [...document.getElementsByTagName('button')];
let arr = [[15, 15, 15], [20, 25, 50], [25, 35, 175]];
let lastActiveIndex = 0;
let mine;

// 游戏用时相关
let newTime;
let lastTime;

oBtnArr.forEach(function (oBtn, index) {
  oBtn.onclick = function () {

    // 重新开始游戏
    if (index == 3) {

      // // 创建一个新的同等难度等级的雷盘
      mine = new Mine(...arr[lastActiveIndex]);
      mine.init();

    // 选择游戏难度 
    } else {
      // button按钮的选中和切换
      oBtnArr[lastActiveIndex].className = '';
      oBtnArr[index].className = 'active';

      // 创建一个新的难度等级的雷盘
      mine = new Mine(...arr[index]);
      mine.init();
      lastActiveIndex = index;
    }
  }
})



// 游戏初始化
oBtnArr[0].onclick();
newTime = new Date().getTime();
