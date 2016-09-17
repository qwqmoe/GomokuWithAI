var canvas;
var context;
var curUser;//设置当前玩家（1为cross，2为circle) 默认cross为先
var isWell = false;//设置该局是否获胜
var chessData;//定义一个二维数组用来保存棋盘的信息
var chessType;//定义棋子类型

//初始化棋盘信息
function initChessData() {
    chessData = new Array(15);

    for (var x = 0; x < 15; x++) {
        chessData[x] = new Array(15);
        for (var y = 0; y < 15; y++) {
            chessData[x][y] = 0;//初始化0为没有走过的，1为cross走的，2为circle走的
        }
    }
}

//绘制棋盘
function drawChessBoard() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.lineWidth = 2;
    context.strokeStyle = "#577A9E";//线条颜色
    var lineOffset = 1;//线条偏移量

    for (var i = 0; i <= 420; i += 28) {//绘制棋盘的线
        context.beginPath();
        context.moveTo(1, i + lineOffset);
        context.lineTo(421, i + lineOffset);
        context.closePath();
        context.stroke();

        context.beginPath();
        context.moveTo(i + lineOffset, 1);
        context.lineTo(i + lineOffset, 421);
        context.closePath();
        context.stroke();
    }
}

//绘制circle棋子
function drawChessCircle(x, y) {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.lineWidth = 3;
    context.strokeStyle = "#e74c3c";

    var offset = 1;

    context.beginPath();
    context.arc(x + offset, y + offset, 9, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
}

//绘制cross棋子
function drawChessCross(x, y) {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    context.lineWidth = 3;
    context.strokeStyle = "#2ecc71";

    var crossRadius = 8;
    var offset = 1;

    context.beginPath();
    context.moveTo(x + offset - crossRadius, y + offset - crossRadius);
    context.lineTo(x + offset + crossRadius, y + offset + crossRadius);
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.moveTo(x + offset + crossRadius, y + offset - crossRadius);
    context.lineTo(x + offset - crossRadius, y + offset + crossRadius);
    context.lineCap = "round";
    context.stroke();
}

//绘制棋子
function drawChess(x, y, chessType) {
    if (chessType == 1) {//1为cross（先手），2为circle
        drawChessCross(14 + x * 28, 14 + y * 28);
        chessData[x][y] = chessType;//将指定位置的棋盘类型设置为chessType
    }
    else {
        drawChessCircle(14 + x * 28, 14 + y * 28);
        chessData[x][y] = chessType;
    }
}

//判断胜负
//TODO 循环算法还能优化
function checkWin(x, y, chessType) {
    //设置每个方向的连子计数
    var countLeftRight = 0;
    var countUpDown = 0;
    var countUpperLeftToLowerRight = 0;//左上到右下
    var countUpperRightToLowerLeft = 0;//右上到左下

    //左右判断
    for (var i = x; i >= 0; i--) {
        if (chessData[i][y] != chessType) {
            break;
        }
        countLeftRight++;
    }
    for (var i = x + 1; i < 15; i++) {
        if (chessData[i][y] != chessType) {
            break;
        }
        countLeftRight++;
    }
    //上下判断
    for (var i = y; i >= 0; i--) {
        if (chessData[x][i] != chessType) {
            break;
        }
        countUpDown++;
    }
    for (var i = y + 1; i < 15; i++) {
        if (chessData[x][i] != chessType) {
            break;
        }
        countUpDown++;
    }
    //左上右下判断
    var t = y;
    var w = y + 1;
    for (var i = x; i >= 0; i--) {

        if (chessData[i][t] != chessType) {
            break;
        }
        if (t >= 0) {
            t = t - 1;
        }
        countUpperLeftToLowerRight++;
    }
    for (var i = x + 1; i < 15; i++) {
        if (chessData[i][w] != chessType) {
            break;
        }
        if (w < 15) {
            w = w + 1;
        }
        countUpperLeftToLowerRight++;
    }
    //右上左下判断
    var h = y;
    var z = y + 1;
    for (var i = x; i < 15; i++) {
        if (chessData[i][h] != chessType) {
            break;
        }
        if (h >= 0) {
            h--;
        }
        countUpperRightToLowerLeft++;
    }
    for (var i = x - 1; i >= 0; i--) {
        if (chessData[i][z] != chessType) {
            break;
        }
        if (z <= 15) {
            z++;
        }
        countUpperRightToLowerLeft++;
    }

    if (countLeftRight >= 5 || countUpDown >= 5 || countUpperLeftToLowerRight >= 5 || countUpperRightToLowerLeft >= 5) {
        isWell = true;//设置该局已经获胜，不可以再走了
    }
}

//鼠标点击事件
//TODO 可以处理下点击到棋盘线的情况 直接return
function play(e) {
    //判断该局是否结束
    if (isWell) {
        alert("本局已结束，重玩请刷新");
        return;
    }

    var bbox = canvas.getBoundingClientRect();

    //计算鼠标点击的区域
    var x = parseInt((e.clientX - bbox.left) / 28);
    var y = parseInt((e.clientY - bbox.top) / 28);

    curUser = 1;//设置当前玩家为cross

    if (curUser == 1) {
        chessType = 1;//设置当前棋子类型为cross
    } else {
        chessType = 2;
    }

    //判断该位置是否有棋子
    if (chessData[x][y] != 0) {
        return;
    }

    generateManChess(x, y);

    if (isWell) {
        alert("你赢了");
        return;
    }

    generateAIChess();
}

//生成人类棋子
function generateManChess(x, y) {
    drawChess(x, y, chessType);//绘制cross棋子
    checkWin(x, y, chessType);
}

//生成AI棋子
function generateAIChess() {
    var x;
    var y;

    curUser = 2;//设置当前玩家为circle

    if (curUser == 1) {
        chessType = 1;
    } else {
        chessType = 2;//设置当前棋子类型为circle
    }

    while (1) {
        x = Math.floor(Math.random()*10) + Math.floor(Math.random()*6);
        y = Math.floor(Math.random()*10) + Math.floor(Math.random()*6);

        if (chessData[x][y] == 0) {
            break;
        }
    }

    drawChess(x, y, chessType);
    checkWin(x, y, chessType);
    if (isWell) {
        alert("你输了");
        return;
    }
}

//页面加载完成后开始运行
$(document).ready(function() {
    //绘制棋盘
    drawChessBoard();
    //初始化棋盘信息
    initChessData();
    //给canvas画布绑定点击事件
    $("#canvas").click(play);
});














