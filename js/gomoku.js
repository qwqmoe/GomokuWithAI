var canvas;
var context;
var curUser;//设置当前玩家（1为cross，2为circle) 默认cross为先
var isWell = false;//设置该局是否获胜
var chessData;//定义一个二维数组用来保存棋盘的信息
var chessType;//定义棋子类型

//棋型种类计数
var countHumanWinFive = 0;//连5
var countHumanLiveFour = 0;//活四
var countHumanRushFour = 0;//冲四
var countHumanLiveThree = 0;//活三
var countHumanSleepThree = 0;//眠三
var countHumanLiveTwo = 0;//活二
var countHumanSleepTwo = 0;//眠二
var countHumanDieFour = 0;//死四
var countHumanDieThree = 0;//死三
var countHumanDieTwo = 0;//死二

var countAIWinFive = 0;//连5
var countAILiveFour = 0;//活四
var countAIRushFour = 0;//冲四
var countAILiveThree = 0;//活三
var countAISleepThree = 0;//眠三
var countAILiveTwo = 0;//活二
var countAISleepTwo = 0;//眠二
var countAIDieFour = 0;//死四
var countAIDieThree = 0;//死三
var countAIDieTwo = 0;//死二

var scoreHuman;//人类分数
var scoreAI;//电脑分数
var scoreChessVoid;//棋盘当前空位分数
var scoreChess;//局面评估分数

var INFINITY = 999999999;

var legalMoves;//当前合法着法

var legalBestMovesMaxPositionX;
var legalBestMovesMaxPositionY;

var evaluatePositionX;
var evaluatePositionY;

var scoreChessVoidTemp;

function initScore() {
    scoreHuman = new Array(15);
    scoreAI = new Array(15);
    scoreChessVoid = new Array(15);
    scoreChess = new Array(15);

    for (var x = 0; x < 15; x++) {
        scoreHuman[x] = new Array(15);
        scoreAI[x] = new Array(15);
        scoreChessVoid[x] = new Array(15);
        scoreChess[x] = new Array(15);

        for (var y = 0; y < 15; y++) {
            scoreHuman[x][y] = 0;
            scoreAI[x][y] = 0;
            scoreChessVoid[x][y] = 0;
            scoreChess[x][y] = 0;
        }
    }
}

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
function drawChess(x, y) {
    if (chessType == 1) {//1为cross（先手），2为circle
        drawChessCross(14 + x * 28, 14 + y * 28);
        chessData[x][y] = chessType;//将指定位置的棋盘类型设置为chessType
    }
    else {
        drawChessCircle(14 + x * 28, 14 + y * 28);
        chessData[x][y] = chessType;
    }
}

//评估棋型并打分
function evaluteChess(i,j) {

    //人类棋型分数
    if (countHumanWinFive >= 1) {
        scoreHuman[i][j] += 100000;//连五
    }
    if (countHumanLiveFour >= 1 || countHumanRushFour >= 2 || (countHumanRushFour >=1 && countHumanLiveThree >= 1)) {
        scoreHuman[i][j] += 10000;//活四、双冲四、冲四活三
    }
    if (countHumanLiveThree >= 2) {
        scoreHuman[i][j] += 5000;//双活三
    }
    if (countHumanLiveThree >= 1 && countHumanSleepThree >= 1) {
        scoreHuman[i][j] += 1000;//活三眠三
    }
    if (countHumanRushFour >= 1) {
        scoreHuman[i][j] += 500;//冲四
    }
    if (countHumanLiveThree >= 1) {
        scoreHuman[i][j] += 200;//活三
    }
    if (countHumanLiveTwo >= 2) {
        scoreHuman[i][j] += 100;//双活二
    }
    if (countHumanSleepThree >= 1) {
        scoreHuman[i][j] += 50;//眠三
    }
    if (countHumanLiveTwo >= 1 && countHumanSleepTwo >= 1) {
        scoreHuman[i][j] += 10;//活二眠二
    }
    if (countHumanLiveTwo >= 1) {
        scoreHuman[i][j] += 5;//活二
    }
    if (countHumanSleepTwo >= 1) {
        scoreHuman[i][j] += 3;//眠二
    }
    if (countHumanDieFour >= 1 || countHumanDieThree >= 1 || countHumanDieTwo) {
        scoreHuman[i][j] -= 5;//死四、死三、死二
    }

    //AI棋型分数
    if (countAIWinFive >= 1) {
        scoreAI[i][j] += 100000;//连五
    }
    if (countAILiveFour >= 1 || countAIRushFour >= 2 || (countAIRushFour >=1 && countAILiveThree >= 1)) {
        scoreAI[i][j] += 10000;//活四、双冲四、冲四活三
    }
    if (countAILiveThree >= 2) {
        scoreAI[i][j] += 5000;//双活三
    }
    if (countAILiveThree >= 1 && countAISleepThree >= 1) {
        scoreAI[i][j] += 1000;//活三眠三
    }
    if (countAIRushFour >= 1) {
        scoreAI[i][j] += 500;//冲四
    }
    if (countAILiveThree >= 1) {
        scoreAI[i][j] += 200;//活三
    }
    if (countAILiveTwo >= 2) {//TODO
        scoreAI[i][j] += 100;//双活二
    }
    if (countAISleepThree >= 1) {
        scoreAI[i][j] += 50;//眠三
    }
    if (countAILiveTwo >= 1 && countAISleepTwo >= 1) {
        scoreAI[i][j] += 10;//活二眠二
    }
    if (countAILiveTwo >= 1) {//TODO
        scoreAI[i][j] += 5;//活二
    }
    if (countAISleepTwo >= 1) {
        scoreAI[i][j] += 3;//眠二
    }
    if (countAIDieFour >= 1 || countAIDieThree >= 1 || countAIDieTwo) {
        scoreAI[i][j] -= 5;//死四、死三、死二
    }
}

//重置棋盘分数
function resetScore() {
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            scoreHuman[i][j] = 0;
            scoreAI[i][j] = 0;
            scoreChessVoid[i][j] = 0;
            scoreChess[i][j] = 0;
        }
    }
}

//重置棋型种类计数
function resetCountChess() {
    countHumanWinFive = 0;//连5
    countHumanLiveFour = 0;//活四
    countHumanRushFour = 0;//冲四
    countHumanLiveThree = 0;//活三
    countHumanSleepThree = 0;//眠三
    countHumanLiveTwo = 0;//活二
    countHumanSleepTwo = 0;//眠二
    countHumanDieFour = 0;//死四
    countHumanDieThree = 0;//死三
    countHumanDieTwo = 0;//死二

    countAIWinFive = 0;//连5
    countAILiveFour = 0;//活四
    countAIRushFour = 0;//冲四
    countAILiveThree = 0;//活三
    countAISleepThree = 0;//眠三
    countAILiveTwo = 0;//活二
    countAISleepTwo = 0;//眠二
    countAIDieFour = 0;//死四
    countAIDieThree = 0;//死三
    countAIDieTwo = 0;//死二
}

//判断棋型
function checkChess(x,y) {
    //设置每个方向的连子计数
    var countLeftRight = 0;
    var countUpDown = 0;
    var countUpperLeftToLowerRight = 0;//左上到右下
    var countUpperRightToLowerLeft = 0;//右上到左下

    //左右棋子类型数据
    var chessDataTypeLeftOne = -1;
    var chessDataTypeRightOne = -1;
    var chessDataTypeLeftTwo = -1;
    var chessDataTypeRightTwo = -1;
    var chessDataTypeLeftThree = -1;
    var chessDataTypeRightThree = -1;
    var chessDataTypeLeftFour = -1;
    var chessDataTypeRightFour = -1;

    //上下棋子类型数据
    var chessDataTypeUpOne = -1;
    var chessDataTypeDownOne = -1;
    var chessDataTypeUpTwo = -1;
    var chessDataTypeDownTwo = -1;
    var chessDataTypeUpThree = -1;
    var chessDataTypeDownThree = -1;
    var chessDataTypeUpFour = -1;
    var chessDataTypeDownFour = -1;

    //左上右下棋子类型数据
    var chessDataTypeUpperLeftOne = -1;
    var chessDataTypeLowerRightOne = -1;
    var chessDataTypeUpperLeftTwo = -1;
    var chessDataTypeLowerRightTwo = -1;
    var chessDataTypeUpperLeftThree = -1;
    var chessDataTypeLowerRightThree = -1;
    var chessDataTypeUpperLeftFour = -1;
    var chessDataTypeLowerRightFour = -1;

    //右上左下棋子类型数据
    var chessDataTypeUpperRightOne = -1;
    var chessDataTypeLowerLeftOne = -1;
    var chessDataTypeUpperRightTwo = -1;
    var chessDataTypeLowerLeftTwo = -1;
    var chessDataTypeUpperRightThree = -1;
    var chessDataTypeLowerLeftThree = -1;
    var chessDataTypeUpperRightFour = -1;
    var chessDataTypeLowerLeftFour = -1;

    //左右判断
    for (var i = x; i >= 0; i--) {
        if (chessData[i][y] != chessType) {
            chessDataTypeLeftOne = chessData[i][y];
            if (i - 1 >= 0) {
                chessDataTypeLeftTwo = chessData[i-1][y];
            }
            if (i - 2 >= 0) {
                chessDataTypeLeftThree = chessData[i-2][y];
            }
            if (i - 3 >= 0) {
                chessDataTypeLeftFour = chessData[i-3][y];
            }
            break;
        }
        countLeftRight++;
    }
    for (var i = x + 1; i < 15; i++) {
        if (chessData[i][y] != chessType) {
            chessDataTypeRightOne = chessData[i][y];
            if (i + 1 < 15) {
                chessDataTypeRightTwo = chessData[i+1][y];
            }
            if (i + 2 < 15) {
                chessDataTypeRightThree = chessData[i+2][y];
            }
            if (i + 3 < 15) {
                chessDataTypeRightFour = chessData[i+3][y];
            }
            break;
        }
        countLeftRight++;
    }

    //上下判断
    for (var i = y; i >= 0; i--) {
        if (chessData[x][i] != chessType) {
            chessDataTypeUpOne = chessData[x][i];
            if (i - 1 >= 0) {
                chessDataTypeUpTwo = chessData[x][i-1];
            }
            if (i - 2 >= 0) {
                chessDataTypeUpThree = chessData[x][i-2];
            }
            if (i - 3 >= 0) {
                chessDataTypeUpFour = chessData[x][i-3];
            }
            break;
        }
        countUpDown++;
    }
    for (var i = y + 1; i < 15; i++) {
        if (chessData[x][i] != chessType) {
            chessDataTypeDownOne = chessData[x][i];
            if (i + 1 < 15) {
                chessDataTypeDownTwo = chessData[x][i+1];
            }
            if (i + 2 < 15) {
                chessDataTypeDownThree = chessData[x][i+2];
            }
            if (i + 3 < 15) {
                chessDataTypeDownFour = chessData[x][i+3];
            }
            break;
        }
        countUpDown++;
    }

    //左上右下判断
    var t = y;
    var w = y + 1;
    for (var i = x; i >= 0; i--) {
        if (t == -1) {
            break;
        }
        if (chessData[i][t] != chessType) {
            chessDataTypeUpperLeftOne = chessData[i][t];
            if (i - 1 >= 0 && t - 1 >= 0) {
                chessDataTypeUpperLeftTwo = chessData[i-1][t-1];
            }
            if (i - 2 >= 0 && t - 2 >= 0) {
                chessDataTypeUpperLeftThree = chessData[i-2][t-2];
            }
            if (i - 3 >= 0 && t - 3 >= 0) {
                chessDataTypeUpperLeftFour = chessData[i-3][t-3];
            }
            break;
        }
        if (t >= 0) {
            t = t - 1;
        }
        countUpperLeftToLowerRight++;
    }
    for (var i = x + 1; i < 15; i++) {
        if (w == 15) {
            break;
        }
        if (chessData[i][w] != chessType) {
            chessDataTypeLowerRightOne = chessData[i][w];
            if (i + 1 < 15 && w + 1 < 15) {
                chessDataTypeLowerRightTwo = chessData[i+1][w+1];
            }
            if (i + 2 < 15 && w + 2 < 15) {
                chessDataTypeLowerRightThree = chessData[i+2][w+2];
            }
            if (i + 3 < 15 && w + 3 < 15) {
                chessDataTypeLowerRightFour = chessData[i+3][w+3];
            }
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
        if (h == -1) {
            break;
        }
        if (chessData[i][h] != chessType) {
            chessDataTypeUpperRightOne = chessData[i][h];
            if (i + 1 < 15 && h - 1 >= 0) {
                chessDataTypeUpperRightTwo = chessData[i+1][h-1];
            }
            if (i + 2 < 15 && h - 2 >= 0) {
                chessDataTypeUpperRightThree = chessData[i+2][h-2];
            }
            if (i + 3 < 15 && h - 3 >= 0) {
                chessDataTypeUpperRightFour = chessData[i+3][h-3];
            }
            break;
        }
        if (h >= 0) {
            h--;
        }
        countUpperRightToLowerLeft++;
    }
    for (var i = x - 1; i >= 0; i--) {
        if (z == 15) {
            break;
        }
        if (chessData[i][z] != chessType) {
            chessDataTypeLowerLeftOne = chessData[i][z];
            if (i - 1 >= 0 && z + 1 < 15) {
                chessDataTypeLowerLeftTwo = chessData[i-1][z+1];
            }
            if (i - 2 >= 0 && z + 2 < 15) {
                chessDataTypeLowerLeftThree = chessData[i-2][z+2];
            }
            if (i - 3 >= 0 && z + 3 < 15) {
                chessDataTypeLowerLeftFour = chessData[i-3][z+3];
            }
            break;
        }
        if (z < 15) {
            z++;
        }
        countUpperRightToLowerLeft++;
    }

    checkLeftRightChess(countLeftRight,chessDataTypeLeftOne,
        chessDataTypeRightOne,chessDataTypeLeftTwo,
        chessDataTypeRightTwo,chessDataTypeLeftThree,
        chessDataTypeRightThree,chessDataTypeLeftFour,chessDataTypeRightFour);

    checkUpDownChess(countUpDown,chessDataTypeUpOne,
        chessDataTypeDownOne,chessDataTypeUpTwo,
        chessDataTypeDownTwo,chessDataTypeUpThree,
        chessDataTypeDownThree,chessDataTypeUpFour,chessDataTypeDownFour);

    checkUpperLeftToLowerRightChess(countUpperLeftToLowerRight,chessDataTypeUpperLeftOne,
        chessDataTypeLowerRightOne,chessDataTypeUpperLeftTwo,
        chessDataTypeLowerRightTwo,chessDataTypeUpperLeftThree,
        chessDataTypeLowerRightThree,chessDataTypeUpperLeftFour,chessDataTypeLowerRightFour);

    checkUpperRightToLowerLeftChess(countUpperRightToLowerLeft,chessDataTypeUpperRightOne,
        chessDataTypeLowerLeftOne,chessDataTypeUpperRightTwo,
        chessDataTypeLowerLeftTwo,chessDataTypeUpperRightThree,
        chessDataTypeLowerLeftThree,chessDataTypeUpperRightFour,chessDataTypeLowerLeftFour);
}

//判断右上左下棋型
function checkUpperRightToLowerLeftChess(countUpperRightToLowerLeft,chessDataTypeUpperRightOne,
                                         chessDataTypeLowerLeftOne,chessDataTypeUpperRightTwo,
                                         chessDataTypeLowerLeftTwo,chessDataTypeUpperRightThree,
                                         chessDataTypeLowerLeftThree,chessDataTypeUpperRightFour,chessDataTypeLowerLeftFour) {
    //----------------五连的情况-------------------------
    if (countUpperRightToLowerLeft >= 5) {
        if (curUser == 1) {
            countHumanWinFive++;
        } else {
            countAIWinFive++;
        }
        isWell = true;//设置该局已经获胜，不可以再走了
    }

    //----------------四连的情况-------------------------
    if (countUpperRightToLowerLeft == 4) {
        //活四 011110
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeLowerLeftOne == 0) {
            //alert("活四");
            if (curUser == 1) {
                countHumanLiveFour++;
            } else {
                countAILiveFour++;
            }
        }

        //冲四 011112
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeLowerLeftOne != 0 || chessDataTypeUpperRightOne != 0 && chessDataTypeLowerLeftOne == 0) {
            //alert("冲四");
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        //死四 211112
        if (chessDataTypeUpperRightOne != 0 && chessDataTypeLowerLeftOne != 0) {
            if (curUser == 1) {
                countHumanDieFour++;
            } else {
                countAIDieFour++;
            }
        }
    }

    //----------------三连的情况-------------------------
    if (countUpperRightToLowerLeft == 3) {
        //死三 21112
        if (chessDataTypeUpperRightOne != 0 && chessDataTypeLowerLeftOne != 0) {
            //alert("死三");
            if (curUser == 1) {
                countHumanDieThree++;
            } else {
                countAIDieThree++;
            }
        }
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeLowerLeftOne == 0) {
            //眠三 2011102
            if ((chessDataTypeUpperRightTwo == 3 - chessType || chessDataTypeUpperRightTwo == -1)
                && (chessDataTypeLowerLeftTwo == 3 - chessType || chessDataTypeLowerLeftTwo == -1)) {
                //alert("眠三");
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活三 01110
            if (chessDataTypeUpperRightTwo == 0 || chessDataTypeLowerLeftTwo == 0) {
                //alert("活三");
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //冲四 0101110
            if (chessDataTypeUpperRightTwo == chessType || chessDataTypeLowerLeftTwo == chessType) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
        }
        if (chessDataTypeUpperRightOne == 0 || chessDataTypeLowerLeftOne == 0) {
            //眠三 001112
            if(chessDataTypeUpperRightOne == 3 - chessType || chessDataTypeUpperRightOne == -1) {
                if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if(chessDataTypeLowerLeftOne == 3 - chessType || chessDataTypeLowerLeftOne == -1) {
                if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //----------------二连的情况-------------------------
    if (countUpperRightToLowerLeft == 2) {
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeLowerLeftOne == 0) {
            //眠三 10011
            if ((chessDataTypeLowerLeftTwo == 0 && chessDataTypeLowerLeftThree == chessType) ||
                (chessDataTypeUpperRightTwo == 0 && chessDataTypeUpperRightThree == chessType)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活二 001100
            if (chessDataTypeUpperRightTwo == 0 && chessDataTypeLowerLeftTwo == 0) {
                //alert("活二");
                if (curUser == 1) {
                    countHumanLiveTwo++;
                } else {
                    countAILiveTwo++;
                }
            }
            //眠三 011012
            if ((chessDataTypeLowerLeftTwo == chessType &&
                (chessDataTypeLowerLeftThree == 3 - chessType || chessDataTypeLowerLeftThree == -1))
                || (chessDataTypeUpperRightTwo == chessType && (chessDataTypeUpperRightThree == 3 - chessType || chessDataTypeUpperRightThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //冲四 0110110
            if ((chessDataTypeLowerLeftTwo == chessType && chessDataTypeLowerLeftThree == chessType) ||
                (chessDataTypeUpperRightTwo == chessType && chessDataTypeUpperRightThree == chessType)) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
            //活三 010110
            if ((chessDataTypeLowerLeftTwo == chessType && chessDataTypeLowerLeftThree == 0) ||
                (chessDataTypeUpperRightTwo == chessType && chessDataTypeUpperRightThree == 0)) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //2011002
            if (((chessDataTypeUpperRightTwo == 3 - chessType || chessDataTypeUpperRightTwo == -1)
                && chessDataTypeLowerLeftTwo == 0 &&
                (chessDataTypeLowerLeftThree == 3 - chessType || chessDataTypeLowerLeftThree == -1)) ||
                ((chessDataTypeLowerLeftTwo == 3 - chessType || chessDataTypeLowerLeftTwo == -1)
                && chessDataTypeUpperRightTwo == 0 &&
                (chessDataTypeUpperRightThree == 3 - chessType || chessDataTypeUpperRightThree == -1))) {
                //alert("眠二");
                if (curUser == 1) {
                    countHumanSleepTwo++;
                } else {
                    countAISleepTwo++;
                }
            }
        }
        //死二 2112
        if (chessDataTypeUpperRightOne != 0 && chessDataTypeLowerLeftOne != 0) {
            if (curUser == 1) {
                countHumanDieTwo++;
            } else {
                countAIDieTwo++;
            }
        }
        if (chessDataTypeUpperRightOne == 0 || chessDataTypeLowerLeftOne == 0) {
            if (chessDataTypeUpperRightOne == 3 - chessType || chessDataTypeUpperRightOne == -1) {
                if ((chessDataTypeLowerLeftTwo == 3 - chessType || chessDataTypeLowerLeftTwo == -1) ||
                    (chessDataTypeLowerLeftThree == 3 - chessType || chessDataTypeLowerLeftThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeLowerLeftTwo == 0 && chessDataTypeLowerLeftThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeLowerLeftTwo == chessType && chessDataTypeLowerLeftThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeLowerLeftTwo == chessType || chessDataTypeLowerLeftThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if (chessDataTypeLowerLeftOne == 3 - chessType || chessDataTypeLowerLeftOne == -1) {
                if ((chessDataTypeUpperRightTwo == 3 - chessType || chessDataTypeUpperRightTwo == -1) ||
                    (chessDataTypeUpperRightThree == 3 - chessType || chessDataTypeUpperRightThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeUpperRightTwo == 0 && chessDataTypeUpperRightThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeUpperRightTwo == chessType && chessDataTypeUpperRightThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeUpperRightTwo == chessType || chessDataTypeUpperRightThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //---------------- 一连的情况 -------------------------
    if (countUpperRightToLowerLeft == 1) {
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == chessType && chessDataTypeUpperRightFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == chessType && chessDataTypeLowerLeftFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == chessType && chessDataTypeUpperRightFour == 0 && chessDataTypeLowerLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == chessType && chessDataTypeLowerLeftFour == 0 && chessDataTypeUpperRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }

        //010112
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == chessType && (chessDataTypeUpperRightFour == 3 - chessType || chessDataTypeUpperRightFour == -1)
            && chessDataTypeLowerLeftOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == chessType && (chessDataTypeLowerLeftFour == 3 - chessType || chessDataTypeLowerLeftFour == -1)
            && chessDataTypeUpperRightOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10011
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == 0
            && chessDataTypeUpperRightThree == chessType && chessDataTypeUpperRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == 0
            && chessDataTypeLowerLeftThree == chessType && chessDataTypeLowerLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 两边
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == 0 && chessDataTypeUpperRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == 0 && chessDataTypeLowerLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 中间
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeLowerLeftOne == 0 &&
            chessDataTypeUpperRightTwo == chessType && chessDataTypeLowerLeftTwo == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //011012
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == chessType && chessDataTypeUpperRightFour == 0 && chessDataTypeLowerLeftOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == chessType && chessDataTypeLowerLeftFour == 0 && chessDataTypeUpperRightOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == 0 && chessDataTypeUpperRightFour == 0 && chessDataTypeLowerLeftOne == 0) {
            //alert("活二");
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == 0 && chessDataTypeLowerLeftFour == 0 && chessDataTypeUpperRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == 0
            && chessDataTypeUpperRightThree == chessType && chessDataTypeUpperRightFour == 0 && chessDataTypeLowerLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == 0
            && chessDataTypeLowerLeftThree == chessType && chessDataTypeLowerLeftFour == 0 && chessDataTypeUpperRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        //001012 第一种
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == 0
            && chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && (chessDataTypeLowerLeftThree == 3 - chessType ||  chessDataTypeLowerLeftThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == 0
            && chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType &&
            (chessDataTypeUpperRightThree == 3 - chessType || chessDataTypeUpperRightThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //001012 第二种
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType
            && chessDataTypeUpperRightThree == 0 && chessDataTypeUpperRightFour == 0
            && (chessDataTypeLowerLeftThree == 3 - chessType ||  chessDataTypeLowerLeftThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType
            && chessDataTypeLowerLeftThree == 0 && chessDataTypeLowerLeftFour == 0
            && (chessDataTypeUpperRightThree == 3 - chessType || chessDataTypeUpperRightThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第一种
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeLowerLeftOne == 0
            && chessDataTypeLowerLeftTwo == 0 && chessDataTypeLowerLeftThree == chessType &&
            (chessDataTypeLowerLeftFour == 3 - chessType || chessDataTypeLowerLeftFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeUpperRightOne == 0
            && chessDataTypeUpperRightTwo == 0 && chessDataTypeUpperRightThree == chessType &&
            (chessDataTypeUpperRightFour == 3 - chessType || chessDataTypeUpperRightFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第二种
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == 0
            && chessDataTypeUpperRightThree == chessType && chessDataTypeUpperRightFour == 0 && chessDataTypeLowerLeftOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == 0
            && chessDataTypeLowerLeftThree == chessType && chessDataTypeLowerLeftFour == 0 && chessDataTypeUpperRightOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //10001
        if (chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == 0
            && chessDataTypeUpperRightThree == 0 && chessDataTypeUpperRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == 0
            && chessDataTypeLowerLeftThree == 0 && chessDataTypeLowerLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //2010102
        if (chessDataTypeUpperRightOne == 0 && (chessDataTypeUpperRightTwo == 3 - chessType || chessDataTypeUpperRightTwo == -1)
            && chessDataTypeLowerLeftOne == 0 && chessDataTypeLowerLeftTwo == chessType && chessDataTypeLowerLeftThree == 0 &&
            (chessDataTypeLowerLeftFour == 3 - chessType || chessDataTypeLowerLeftFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerLeftOne == 0 && (chessDataTypeLowerLeftTwo == 3 - chessType || chessDataTypeLowerLeftTwo == -1)
            && chessDataTypeUpperRightOne == 0 && chessDataTypeUpperRightTwo == chessType && chessDataTypeUpperRightThree == 0 &&
            (chessDataTypeUpperRightFour == 3 - chessType || chessDataTypeUpperRightFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
    }
}

//判断左上右下棋型
function checkUpperLeftToLowerRightChess(countUpperLeftToLowerRight,chessDataTypeUpperLeftOne,
                                         chessDataTypeLowerRightOne,chessDataTypeUpperLeftTwo,
                                         chessDataTypeLowerRightTwo,chessDataTypeUpperLeftThree,
                                         chessDataTypeLowerRightThree,chessDataTypeUpperLeftFour,chessDataTypeLowerRightFour) {
    //----------------五连的情况-------------------------
    if (countUpperLeftToLowerRight >= 5) {
        if (curUser == 1) {
            countHumanWinFive++;
        } else {
            countAIWinFive++;
        }
        isWell = true;//设置该局已经获胜，不可以再走了
    }

    //----------------四连的情况-------------------------
    if (countUpperLeftToLowerRight == 4) {
        //活四 011110
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeLowerRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveFour++;
            } else {
                countAILiveFour++;
            }
        }

        //冲四 011112
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeLowerRightOne != 0 || chessDataTypeUpperLeftOne != 0 && chessDataTypeLowerRightOne == 0) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        //死四 211112
        if (chessDataTypeUpperLeftOne != 0 && chessDataTypeLowerRightOne != 0) {
            if (curUser == 1) {
                countHumanDieFour++;
            } else {
                countAIDieFour++;
            }
        }
    }

    //----------------三连的情况-------------------------
    if (countUpperLeftToLowerRight == 3) {
        //死三 21112
        if (chessDataTypeUpperLeftOne != 0 && chessDataTypeLowerRightOne != 0) {
            if (curUser == 1) {
                countHumanDieThree++;
            } else {
                countAIDieThree++;
            }
        }
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeLowerRightOne == 0) {
            //眠三 2011102
            if ((chessDataTypeUpperLeftTwo == 3 - chessType || chessDataTypeUpperLeftTwo == -1)
                && (chessDataTypeLowerRightTwo == 3 - chessType || chessDataTypeLowerRightTwo == -1)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活三 01110
            if (chessDataTypeUpperLeftTwo == 0 || chessDataTypeLowerRightTwo == 0) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //冲四 0101110
            if (chessDataTypeUpperLeftTwo == chessType || chessDataTypeLowerRightTwo == chessType) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
        }
        if (chessDataTypeUpperLeftOne == 0 || chessDataTypeLowerRightOne == 0) {
            //眠三 001112
            if(chessDataTypeUpperLeftOne == 3 - chessType || chessDataTypeUpperLeftOne == -1) {
                if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if(chessDataTypeLowerRightOne == 3 - chessType || chessDataTypeLowerRightOne == -1) {
                if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //----------------二连的情况-------------------------
    if (countUpperLeftToLowerRight == 2) {
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeLowerRightOne == 0) {
            //眠三 10011
            if ((chessDataTypeLowerRightTwo == 0 && chessDataTypeLowerRightThree == chessType) ||
                (chessDataTypeUpperLeftTwo == 0 && chessDataTypeUpperLeftThree == chessType)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活二 001100
            if (chessDataTypeUpperLeftTwo == 0 && chessDataTypeLowerRightTwo == 0) {
                if (curUser == 1) {
                    countHumanLiveTwo++;
                } else {
                    countAILiveTwo++;
                }
            }
            //眠三 011012
            if ((chessDataTypeLowerRightTwo == chessType &&
                (chessDataTypeLowerRightThree == 3 - chessType || chessDataTypeLowerRightThree == -1))
                || (chessDataTypeUpperLeftTwo == chessType && (chessDataTypeUpperLeftThree == 3 - chessType || chessDataTypeUpperLeftThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //冲四 0110110
            if ((chessDataTypeLowerRightTwo == chessType && chessDataTypeLowerRightThree == chessType) ||
                (chessDataTypeUpperLeftTwo == chessType && chessDataTypeUpperLeftThree == chessType)) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
            //活三 010110
            if ((chessDataTypeLowerRightTwo == chessType && chessDataTypeLowerRightThree == 0) ||
                (chessDataTypeUpperLeftTwo == chessType && chessDataTypeUpperLeftThree == 0)) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //2011002
            if (((chessDataTypeUpperLeftTwo == 3 - chessType || chessDataTypeUpperLeftTwo == -1)
                && chessDataTypeLowerRightTwo == 0 &&
                (chessDataTypeLowerRightThree == 3 - chessType || chessDataTypeLowerRightThree == -1)) ||
                ((chessDataTypeLowerRightTwo == 3 - chessType || chessDataTypeLowerRightTwo == -1)
                && chessDataTypeUpperLeftTwo == 0 &&
                (chessDataTypeUpperLeftThree == 3 - chessType || chessDataTypeUpperLeftThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepTwo++;
                } else {
                    countAISleepTwo++;
                }
            }
        }
        //死二 2112
        if (chessDataTypeUpperLeftOne != 0 && chessDataTypeLowerRightOne != 0) {
            if (curUser == 1) {
                countHumanDieTwo++;
            } else {
                countAIDieTwo++;
            }
        }
        if (chessDataTypeUpperLeftOne == 0 || chessDataTypeLowerRightOne == 0) {
            if (chessDataTypeUpperLeftOne == 3 - chessType || chessDataTypeUpperLeftOne == -1) {
                if ((chessDataTypeLowerRightTwo == 3 - chessType || chessDataTypeLowerRightTwo == -1) ||
                    (chessDataTypeLowerRightThree == 3 - chessType || chessDataTypeLowerRightThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeLowerRightTwo == 0 && chessDataTypeLowerRightThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeLowerRightTwo == chessType && chessDataTypeLowerRightThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeLowerRightTwo == chessType || chessDataTypeLowerRightThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if (chessDataTypeLowerRightOne == 3 - chessType || chessDataTypeLowerRightOne == -1) {
                if ((chessDataTypeUpperLeftTwo == 3 - chessType || chessDataTypeUpperLeftTwo == -1) ||
                    (chessDataTypeUpperLeftThree == 3 - chessType || chessDataTypeUpperLeftThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeUpperLeftTwo == 0 && chessDataTypeUpperLeftThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeUpperLeftTwo == chessType && chessDataTypeUpperLeftThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeUpperLeftTwo == chessType || chessDataTypeUpperLeftThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //---------------- 一连的情况 -------------------------
    if (countUpperLeftToLowerRight == 1) {
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == chessType && chessDataTypeUpperLeftFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == chessType && chessDataTypeLowerRightFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == chessType && chessDataTypeUpperLeftFour == 0 && chessDataTypeLowerRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == chessType && chessDataTypeLowerRightFour == 0 && chessDataTypeUpperLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }

        //010112
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == chessType && (chessDataTypeUpperLeftFour == 3 - chessType || chessDataTypeUpperLeftFour == -1)
            && chessDataTypeLowerRightOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == chessType && (chessDataTypeLowerRightFour == 3 - chessType || chessDataTypeLowerRightFour == -1)
            && chessDataTypeUpperLeftOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10011
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == 0
            && chessDataTypeUpperLeftThree == chessType && chessDataTypeUpperLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == 0
            && chessDataTypeLowerRightThree == chessType && chessDataTypeLowerRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 两边
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == 0 && chessDataTypeUpperLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == 0 && chessDataTypeLowerRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 中间
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeLowerRightOne == 0 &&
            chessDataTypeUpperLeftTwo == chessType && chessDataTypeLowerRightTwo == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //011012
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == chessType && chessDataTypeUpperLeftFour == 0 && chessDataTypeLowerRightOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == chessType && chessDataTypeLowerRightFour == 0 && chessDataTypeUpperLeftOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == 0 && chessDataTypeUpperLeftFour == 0 && chessDataTypeLowerRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == 0 && chessDataTypeLowerRightFour == 0 && chessDataTypeUpperLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == 0
            && chessDataTypeUpperLeftThree == chessType && chessDataTypeUpperLeftFour == 0 && chessDataTypeLowerRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == 0
            && chessDataTypeLowerRightThree == chessType && chessDataTypeLowerRightFour == 0 && chessDataTypeUpperLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        //001012 第一种
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == 0
            && chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && (chessDataTypeLowerRightThree == 3 - chessType ||  chessDataTypeLowerRightThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == 0
            && chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType &&
            (chessDataTypeUpperLeftThree == 3 - chessType || chessDataTypeUpperLeftThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //001012 第二种
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType
            && chessDataTypeUpperLeftThree == 0 && chessDataTypeUpperLeftFour == 0
            && (chessDataTypeLowerRightThree == 3 - chessType ||  chessDataTypeLowerRightThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType
            && chessDataTypeLowerRightThree == 0 && chessDataTypeLowerRightFour == 0
            && (chessDataTypeUpperLeftThree == 3 - chessType || chessDataTypeUpperLeftThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第一种
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeLowerRightOne == 0
            && chessDataTypeLowerRightTwo == 0 && chessDataTypeLowerRightThree == chessType &&
            (chessDataTypeLowerRightFour == 3 - chessType || chessDataTypeLowerRightFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeUpperLeftOne == 0
            && chessDataTypeUpperLeftTwo == 0 && chessDataTypeUpperLeftThree == chessType &&
            (chessDataTypeUpperLeftFour == 3 - chessType || chessDataTypeUpperLeftFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第二种
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == 0
            && chessDataTypeUpperLeftThree == chessType && chessDataTypeUpperLeftFour == 0 && chessDataTypeLowerRightOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == 0
            && chessDataTypeLowerRightThree == chessType && chessDataTypeLowerRightFour == 0 && chessDataTypeUpperLeftOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //10001
        if (chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == 0
            && chessDataTypeUpperLeftThree == 0 && chessDataTypeUpperLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == 0
            && chessDataTypeLowerRightThree == 0 && chessDataTypeLowerRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //2010102
        if (chessDataTypeUpperLeftOne == 0 && (chessDataTypeUpperLeftTwo == 3 - chessType || chessDataTypeUpperLeftTwo == -1)
            && chessDataTypeLowerRightOne == 0 && chessDataTypeLowerRightTwo == chessType && chessDataTypeLowerRightThree == 0 &&
            (chessDataTypeLowerRightFour == 3 - chessType || chessDataTypeLowerRightFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeLowerRightOne == 0 && (chessDataTypeLowerRightTwo == 3 - chessType || chessDataTypeLowerRightTwo == -1)
            && chessDataTypeUpperLeftOne == 0 && chessDataTypeUpperLeftTwo == chessType && chessDataTypeUpperLeftThree == 0 &&
            (chessDataTypeUpperLeftFour == 3 - chessType || chessDataTypeUpperLeftFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
    }
}

//判断上下棋型
function checkUpDownChess(countUpDown,chessDataTypeUpOne,
                          chessDataTypeDownOne,chessDataTypeUpTwo,
                          chessDataTypeDownTwo,chessDataTypeUpThree,
                          chessDataTypeDownThree,chessDataTypeUpFour,chessDataTypeDownFour) {
    //----------------五连的情况-------------------------
    if (countUpDown >= 5) {
        if (curUser == 1) {
            countHumanWinFive++;
        } else {
            countAIWinFive++;
        }
        isWell = true;//设置该局已经获胜，不可以再走了
    }

    //----------------四连的情况-------------------------
    if (countUpDown == 4) {
        //活四 011110
        if (chessDataTypeUpOne == 0 && chessDataTypeDownOne == 0) {
            if (curUser == 1) {
                countHumanLiveFour++;
            } else {
                countAILiveFour++;
            }
        }

        //冲四 011112
        if (chessDataTypeUpOne == 0 && chessDataTypeDownOne != 0 || chessDataTypeUpOne != 0 && chessDataTypeDownOne == 0) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        //死四 211112
        if (chessDataTypeUpOne != 0 && chessDataTypeDownOne != 0) {
            if (curUser == 1) {
                countHumanDieFour++;
            } else {
                countAIDieFour++;
            }
        }
    }

    //----------------三连的情况-------------------------
    if (countUpDown == 3) {
        //死三 21112
        if (chessDataTypeUpOne != 0 && chessDataTypeDownOne != 0) {
            if (curUser == 1) {
                countHumanDieThree++;
            } else {
                countAIDieThree++;
            }
        }
        if (chessDataTypeUpOne == 0 && chessDataTypeDownOne == 0) {
            //眠三 2011102
            if ((chessDataTypeUpTwo == 3 - chessType || chessDataTypeUpTwo == -1)
                && (chessDataTypeDownTwo == 3 - chessType || chessDataTypeDownTwo == -1)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活三 01110
            if (chessDataTypeUpTwo == 0 || chessDataTypeDownTwo == 0) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //冲四 0101110
            if (chessDataTypeUpTwo == chessType || chessDataTypeDownTwo == chessType) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
        }
        if (chessDataTypeUpOne == 0 || chessDataTypeDownOne == 0) {
            //眠三 001112
            if(chessDataTypeUpOne == 3 - chessType || chessDataTypeUpOne == -1) {
                if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if(chessDataTypeDownOne == 3 - chessType || chessDataTypeDownOne == -1) {
                if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //----------------二连的情况-------------------------
    if (countUpDown == 2) {
        if (chessDataTypeUpOne == 0 && chessDataTypeDownOne == 0) {
            //眠三 10011
            if ((chessDataTypeDownTwo == 0 && chessDataTypeDownThree == chessType) ||
                (chessDataTypeUpTwo == 0 && chessDataTypeUpThree == chessType)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活二 001100
            if (chessDataTypeUpTwo == 0 && chessDataTypeDownTwo == 0) {
                if (curUser == 1) {
                    countHumanLiveTwo++;
                } else {
                    countAILiveTwo++;
                }
            }
            //眠三 011012
            if ((chessDataTypeDownTwo == chessType &&
                (chessDataTypeDownThree == 3 - chessType || chessDataTypeDownThree == -1))
                || (chessDataTypeUpTwo == chessType && (chessDataTypeUpThree == 3 - chessType || chessDataTypeUpThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //冲四 0110110
            if ((chessDataTypeDownTwo == chessType && chessDataTypeDownThree == chessType) ||
                (chessDataTypeUpTwo == chessType && chessDataTypeUpThree == chessType)) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
            //活三 010110
            if ((chessDataTypeDownTwo == chessType && chessDataTypeDownThree == 0) ||
                (chessDataTypeUpTwo == chessType && chessDataTypeUpThree == 0)) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //2011002
            if (((chessDataTypeUpTwo == 3 - chessType || chessDataTypeUpTwo == -1)
                && chessDataTypeDownTwo == 0 &&
                (chessDataTypeDownThree == 3 - chessType || chessDataTypeDownThree == -1)) ||
                ((chessDataTypeDownTwo == 3 - chessType || chessDataTypeDownTwo == -1)
                && chessDataTypeUpTwo == 0 &&
                (chessDataTypeUpThree == 3 - chessType || chessDataTypeUpThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepTwo++;
                } else {
                    countAISleepTwo++;
                }
            }
        }
        //死二 2112
        if (chessDataTypeUpOne != 0 && chessDataTypeDownOne != 0) {
            if (curUser == 1) {
                countHumanDieTwo++;
            } else {
                countAIDieTwo++;
            }
        }
        if (chessDataTypeUpOne == 0 || chessDataTypeDownOne == 0) {
            if (chessDataTypeUpOne == 3 - chessType || chessDataTypeUpOne == -1) {
                if ((chessDataTypeDownTwo == 3 - chessType || chessDataTypeDownTwo == -1) ||
                    (chessDataTypeDownThree == 3 - chessType || chessDataTypeDownThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeDownTwo == 0 && chessDataTypeDownThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeDownTwo == chessType && chessDataTypeDownThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeDownTwo == chessType || chessDataTypeDownThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if (chessDataTypeDownOne == 3 - chessType || chessDataTypeDownOne == -1) {
                if ((chessDataTypeUpTwo == 3 - chessType || chessDataTypeUpTwo == -1) ||
                    (chessDataTypeUpThree == 3 - chessType || chessDataTypeUpThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeUpTwo == 0 && chessDataTypeUpThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeUpTwo == chessType && chessDataTypeUpThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeUpTwo == chessType || chessDataTypeUpThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //---------------- 一连的情况 -------------------------
    if (countUpDown == 1) {
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == chessType && chessDataTypeUpFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == chessType && chessDataTypeDownFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == chessType && chessDataTypeUpFour == 0 && chessDataTypeDownOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == chessType && chessDataTypeDownFour == 0 && chessDataTypeUpOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }

        //010112
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == chessType && (chessDataTypeUpFour == 3 - chessType || chessDataTypeUpFour == -1)
            && chessDataTypeDownOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == chessType && (chessDataTypeDownFour == 3 - chessType || chessDataTypeDownFour == -1)
            && chessDataTypeUpOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10011
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == 0
            && chessDataTypeUpThree == chessType && chessDataTypeUpFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == 0
            && chessDataTypeDownThree == chessType && chessDataTypeDownFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 两边
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == 0 && chessDataTypeUpFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == 0 && chessDataTypeDownFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 中间
        if (chessDataTypeUpOne == 0 && chessDataTypeDownOne == 0 &&
            chessDataTypeUpTwo == chessType && chessDataTypeDownTwo == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //011012
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == chessType && chessDataTypeUpFour == 0 && chessDataTypeDownOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == chessType && chessDataTypeDownFour == 0 && chessDataTypeUpOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == 0 && chessDataTypeUpFour == 0 && chessDataTypeDownOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == 0 && chessDataTypeDownFour == 0 && chessDataTypeUpOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == 0
            && chessDataTypeUpThree == chessType && chessDataTypeUpFour == 0 && chessDataTypeDownOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == 0
            && chessDataTypeDownThree == chessType && chessDataTypeDownFour == 0 && chessDataTypeUpOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        //001012 第一种
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == 0
            && chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && (chessDataTypeDownThree == 3 - chessType ||  chessDataTypeDownThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == 0
            && chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType &&
            (chessDataTypeUpThree == 3 - chessType || chessDataTypeUpThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //001012 第二种
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType
            && chessDataTypeUpThree == 0 && chessDataTypeUpFour == 0
            && (chessDataTypeDownThree == 3 - chessType ||  chessDataTypeDownThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType
            && chessDataTypeDownThree == 0 && chessDataTypeDownFour == 0
            && (chessDataTypeUpThree == 3 - chessType || chessDataTypeUpThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第一种
        if (chessDataTypeUpOne == 0 && chessDataTypeDownOne == 0
            && chessDataTypeDownTwo == 0 && chessDataTypeDownThree == chessType &&
            (chessDataTypeDownFour == 3 - chessType || chessDataTypeDownFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeUpOne == 0
            && chessDataTypeUpTwo == 0 && chessDataTypeUpThree == chessType &&
            (chessDataTypeUpFour == 3 - chessType || chessDataTypeUpFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第二种
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == 0
            && chessDataTypeUpThree == chessType && chessDataTypeUpFour == 0 && chessDataTypeDownOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == 0
            && chessDataTypeDownThree == chessType && chessDataTypeDownFour == 0 && chessDataTypeUpOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //10001
        if (chessDataTypeUpOne == 0 && chessDataTypeUpTwo == 0
            && chessDataTypeUpThree == 0 && chessDataTypeUpFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && chessDataTypeDownTwo == 0
            && chessDataTypeDownThree == 0 && chessDataTypeDownFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //2010102
        if (chessDataTypeUpOne == 0 && (chessDataTypeUpTwo == 3 - chessType || chessDataTypeUpTwo == -1)
            && chessDataTypeDownOne == 0 && chessDataTypeDownTwo == chessType && chessDataTypeDownThree == 0 &&
            (chessDataTypeDownFour == 3 - chessType || chessDataTypeDownFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeDownOne == 0 && (chessDataTypeDownTwo == 3 - chessType || chessDataTypeDownTwo == -1)
            && chessDataTypeUpOne == 0 && chessDataTypeUpTwo == chessType && chessDataTypeUpThree == 0 &&
            (chessDataTypeUpFour == 3 - chessType || chessDataTypeUpFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
    }
}

//判断左右棋型
function checkLeftRightChess(countLeftRight,chessDataTypeLeftOne,
                             chessDataTypeRightOne,chessDataTypeLeftTwo,
                             chessDataTypeRightTwo,chessDataTypeLeftThree,
                             chessDataTypeRightThree,chessDataTypeLeftFour,chessDataTypeRightFour) {
    //----------------五连的情况-------------------------
    if (countLeftRight >= 5) {
        if (curUser == 1) {
            countHumanWinFive++;
        } else {
            countAIWinFive++;
        }
        isWell = true;//设置该局已经获胜，不可以再走了
    }

    //----------------四连的情况-------------------------
    if (countLeftRight == 4) {
        //活四 011110
        if (chessDataTypeLeftOne == 0 && chessDataTypeRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveFour++;
            } else {
                countAILiveFour++;
            }
        }

        //冲四 011112
        if (chessDataTypeLeftOne == 0 && chessDataTypeRightOne != 0 || chessDataTypeLeftOne != 0 && chessDataTypeRightOne == 0) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        //死四 211112
        if (chessDataTypeLeftOne != 0 && chessDataTypeRightOne != 0) {
            if (curUser == 1) {
                countHumanDieFour++;
            } else {
                countAIDieFour++;
            }
        }
    }

    //----------------三连的情况-------------------------
    if (countLeftRight == 3) {
        //死三 21112
        if (chessDataTypeLeftOne != 0 && chessDataTypeRightOne != 0) {
            if (curUser == 1) {
                countHumanDieThree++;
            } else {
                countAIDieThree++;
            }
        }
        if (chessDataTypeLeftOne == 0 && chessDataTypeRightOne == 0) {
            //眠三 2011102
            if ((chessDataTypeLeftTwo == 3 - chessType || chessDataTypeLeftTwo == -1)
                && (chessDataTypeRightTwo == 3 - chessType || chessDataTypeRightTwo == -1)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活三 01110
            if (chessDataTypeLeftTwo == 0 || chessDataTypeRightTwo == 0) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //冲四 0101110
            if (chessDataTypeLeftTwo == chessType || chessDataTypeRightTwo == chessType) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
        }
        if (chessDataTypeLeftOne == 0 || chessDataTypeRightOne == 0) {
            //眠三 001112
            if(chessDataTypeLeftOne == 3 - chessType || chessDataTypeLeftOne == -1) {
                if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if(chessDataTypeRightOne == 3 - chessType || chessDataTypeRightOne == -1) {
                if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == 0) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }
    //----------------二连的情况-------------------------
    if (countLeftRight == 2) {
        if (chessDataTypeLeftOne == 0 && chessDataTypeRightOne == 0) {
            //眠三 10011
            if ((chessDataTypeRightTwo == 0 && chessDataTypeRightThree == chessType) ||
                (chessDataTypeLeftTwo == 0 && chessDataTypeLeftThree == chessType)) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //活二 001100
            if (chessDataTypeLeftTwo == 0 && chessDataTypeRightTwo == 0) {
                if (curUser == 1) {
                    countHumanLiveTwo++;
                } else {
                    countAILiveTwo++;
                }
            }
            //眠三 011012
            if ((chessDataTypeRightTwo == chessType &&
                (chessDataTypeRightThree == 3 - chessType || chessDataTypeRightThree == -1))
                || (chessDataTypeLeftTwo == chessType && (chessDataTypeLeftThree == 3 - chessType || chessDataTypeLeftThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepThree++;
                } else {
                    countAISleepThree++;
                }
            }
            //冲四 0110110
            if ((chessDataTypeRightTwo == chessType && chessDataTypeRightThree == chessType) ||
                (chessDataTypeLeftTwo == chessType && chessDataTypeLeftThree == chessType)) {
                if (curUser == 1) {
                    countHumanRushFour++;
                } else {
                    countAIRushFour++;
                }
            }
            //活三 010110
            if ((chessDataTypeRightTwo == chessType && chessDataTypeRightThree == 0) ||
                (chessDataTypeLeftTwo == chessType && chessDataTypeLeftThree == 0)) {
                if (curUser == 1) {
                    countHumanLiveThree++;
                } else {
                    countAILiveThree++;
                }
            }
            //2011002
            if (((chessDataTypeLeftTwo == 3 - chessType || chessDataTypeLeftTwo == -1)
                && chessDataTypeRightTwo == 0 &&
                (chessDataTypeRightThree == 3 - chessType || chessDataTypeRightThree == -1)) ||
                ((chessDataTypeRightTwo == 3 - chessType || chessDataTypeRightTwo == -1)
                && chessDataTypeLeftTwo == 0 &&
                (chessDataTypeLeftThree == 3 - chessType || chessDataTypeLeftThree == -1))) {
                if (curUser == 1) {
                    countHumanSleepTwo++;
                } else {
                    countAISleepTwo++;
                }
            }
        }
        //死二 2112
        if (chessDataTypeLeftOne != 0 && chessDataTypeRightOne != 0) {
            if (curUser == 1) {
                countHumanDieTwo++;
            } else {
                countAIDieTwo++;
            }
        }
        if (chessDataTypeLeftOne == 0 || chessDataTypeRightOne == 0) {
            if (chessDataTypeLeftOne == 3 - chessType || chessDataTypeLeftOne == -1) {
                if ((chessDataTypeRightTwo == 3 - chessType || chessDataTypeRightTwo == -1) ||
                    (chessDataTypeRightThree == 3 - chessType || chessDataTypeRightThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeRightTwo == 0 && chessDataTypeRightThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeRightTwo == chessType && chessDataTypeRightThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeRightTwo == chessType || chessDataTypeRightThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
            if (chessDataTypeRightOne == 3 - chessType || chessDataTypeRightOne == -1) {
                if ((chessDataTypeLeftTwo == 3 - chessType || chessDataTypeLeftTwo == -1) ||
                    (chessDataTypeLeftThree == 3 - chessType || chessDataTypeLeftThree == -1)) {
                    return;
                }
                //眠二 000112
                if (chessDataTypeLeftTwo == 0 && chessDataTypeLeftThree == 0) {
                    if (curUser == 1) {
                        countHumanSleepTwo++;
                    } else {
                        countAISleepTwo++;
                    }
                }
                //冲四 110112
                if (chessDataTypeLeftTwo == chessType && chessDataTypeLeftThree == chessType) {
                    if (curUser == 1) {
                        countHumanRushFour++;
                    } else {
                        countAIRushFour++;
                    }
                }
                //眠三
                if (chessDataTypeLeftTwo == chessType || chessDataTypeLeftThree == chessType) {
                    if (curUser == 1) {
                        countHumanSleepThree++;
                    } else {
                        countAISleepThree++;
                    }
                }
            }
        }
    }

    //---------------- 一连的情况 -------------------------
    if (countLeftRight == 1) {
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == chessType && chessDataTypeLeftFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == chessType && chessDataTypeRightFour == chessType) {
            if (curUser == 1) {
                countHumanRushFour++;
            } else {
                countAIRushFour++;
            }
        }

        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == chessType && chessDataTypeLeftFour == 0 && chessDataTypeRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == chessType && chessDataTypeRightFour == 0 && chessDataTypeLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveThree++;
            } else {
                countAILiveThree++;
            }
        }

        //010112
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == chessType && (chessDataTypeLeftFour == 3 - chessType || chessDataTypeLeftFour == -1)
            && chessDataTypeRightOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == chessType && (chessDataTypeRightFour == 3 - chessType || chessDataTypeRightFour == -1)
            && chessDataTypeLeftOne == 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10011
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == 0
            && chessDataTypeLeftThree == chessType && chessDataTypeLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == 0
            && chessDataTypeRightThree == chessType && chessDataTypeRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 两边
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == 0 && chessDataTypeLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == 0 && chessDataTypeRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //10101 中间
        if (chessDataTypeLeftOne == 0 && chessDataTypeRightOne == 0 &&
            chessDataTypeLeftTwo == chessType && chessDataTypeRightTwo == chessType) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        //011012
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == chessType && chessDataTypeLeftFour == 0 && chessDataTypeRightOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == chessType && chessDataTypeRightFour == 0 && chessDataTypeLeftOne != 0) {
            if (curUser == 1) {
                countHumanSleepThree++;
            } else {
                countAISleepThree++;
            }
        }

        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == 0 && chessDataTypeLeftFour == 0 && chessDataTypeRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == 0 && chessDataTypeRightFour == 0 && chessDataTypeLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == 0
            && chessDataTypeLeftThree == chessType && chessDataTypeLeftFour == 0 && chessDataTypeRightOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == 0
            && chessDataTypeRightThree == chessType && chessDataTypeRightFour == 0 && chessDataTypeLeftOne == 0) {
            if (curUser == 1) {
                countHumanLiveTwo++;
            } else {
                countAILiveTwo++;
            }
        }

        //001012 第一种
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == 0
            && chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && (chessDataTypeRightThree == 3 - chessType ||  chessDataTypeRightThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == 0
            && chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType &&
            (chessDataTypeLeftThree == 3 - chessType || chessDataTypeLeftThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //001012 第二种
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType
            && chessDataTypeLeftThree == 0 && chessDataTypeLeftFour == 0
            && (chessDataTypeRightThree == 3 - chessType ||  chessDataTypeRightThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType
            && chessDataTypeRightThree == 0 && chessDataTypeRightFour == 0
            && (chessDataTypeLeftThree == 3 - chessType || chessDataTypeLeftThree == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第一种
        if (chessDataTypeLeftOne == 0 && chessDataTypeRightOne == 0
            && chessDataTypeRightTwo == 0 && chessDataTypeRightThree == chessType &&
            (chessDataTypeRightFour == 3 - chessType || chessDataTypeRightFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeLeftOne == 0
            && chessDataTypeLeftTwo == 0 && chessDataTypeLeftThree == chessType &&
            (chessDataTypeLeftFour == 3 - chessType || chessDataTypeLeftFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //010012 第二种
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == 0
            && chessDataTypeLeftThree == chessType && chessDataTypeLeftFour == 0 && chessDataTypeRightOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == 0
            && chessDataTypeRightThree == chessType && chessDataTypeRightFour == 0 && chessDataTypeLeftOne != 0) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //10001
        if (chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == 0
            && chessDataTypeLeftThree == 0 && chessDataTypeLeftFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && chessDataTypeRightTwo == 0
            && chessDataTypeRightThree == 0 && chessDataTypeRightFour == chessType) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }

        //2010102
        if (chessDataTypeLeftOne == 0 && (chessDataTypeLeftTwo == 3 - chessType || chessDataTypeLeftTwo == -1)
            && chessDataTypeRightOne == 0 && chessDataTypeRightTwo == chessType && chessDataTypeRightThree == 0 &&
            (chessDataTypeRightFour == 3 - chessType || chessDataTypeRightFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
        if (chessDataTypeRightOne == 0 && (chessDataTypeRightTwo == 3 - chessType || chessDataTypeRightTwo == -1)
            && chessDataTypeLeftOne == 0 && chessDataTypeLeftTwo == chessType && chessDataTypeLeftThree == 0 &&
            (chessDataTypeLeftFour == 3 - chessType || chessDataTypeLeftFour == -1)) {
            if (curUser == 1) {
                countHumanSleepTwo++;
            } else {
                countAISleepTwo++;
            }
        }
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

    generateHumanChess(x, y);

    if(isWell) {
        return;
    } else {
        generateAIChess();
    }
}

function checkIsWell() {
    if (isWell) {
        if (curUser == 1) {
            alert("你赢了");
            return;
        } else {
            alert("你输了");
            return;
        }
    }
}

//生成人类棋子
function generateHumanChess(x, y) {
    drawChess(x, y);//绘制cross棋子
    checkChess(x, y);
    resetCountChess();
    checkIsWell();
}

//棋盘空位打分
function pointChessVoid() {

    scoreChessVoidTemp = Array();

    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (chessData[i][j] != 0) {
                continue;
            }

            chessData[i][j] = chessType;
            checkChess(i,j);
            evaluteChess(i,j);
            resetCountChess();
            curUser = 1;
            chessData[i][j] = 3 - chessType;
            chessType = 1;
            checkChess(i,j);
            evaluteChess(i,j);
            resetCountChess();
            scoreChessVoid[i][j] = scoreAI[i][j] + scoreHuman[i][j];//当前棋盘空位的分数等于该空位两种棋子形成棋型分数之和
            chessData[i][j] = 0;
            curUser = 2;
            chessType = 2;
            isWell = false;//TODO


            scoreChessVoidTemp.push({x:i,y:j,z:scoreChessVoid[i][j]});
        }
    }
}

//局面评估函数
function evaluateChess() {
    /*for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (chessData[i][j] != 0) {
                continue;
            }

            chessData[i][j] = chessType;
            checkChess(i,j);
            evaluteChess(i,j);
            resetCountChess();
            curUser = 1;
            chessData[i][j] = 3 - chessType;
            chessType = 1;
            checkChess(i,j);
            evaluteChess(i,j);
            resetCountChess();

            scoreChess[i][j] = scoreAI[i][j] - scoreHuman[i][j];//当前局面的分数等于该空位电脑棋型分数减去人类棋型分数
            chessData[i][j] = 0;
            curUser = 2;
            chessType = 2;
            isWell = false;//TODO
        }
    }*/

    if (curUser == 1) {
        checkChess(evaluatePositionX,evaluatePositionY);
        evaluteChess(evaluatePositionX,evaluatePositionY);
        resetCountChess();
        curUser = 2;
        chessType = 2;
        chessData[evaluatePositionX][evaluatePositionY] = chessType;
        checkChess(evaluatePositionX,evaluatePositionY);
        evaluteChess(evaluatePositionX,evaluatePositionY);
        resetCountChess();
        scoreChess[evaluatePositionX][evaluatePositionY] = scoreAI[evaluatePositionX][evaluatePositionY]
            - scoreHuman[evaluatePositionX][evaluatePositionY];
        isWell = false;
    } else {
        checkChess(evaluatePositionX,evaluatePositionY);
        evaluteChess(evaluatePositionX,evaluatePositionY);
        resetCountChess();
        curUser = 1;
        chessType = 1;
        chessData[evaluatePositionX][evaluatePositionY] = chessType;
        checkChess(evaluatePositionX,evaluatePositionY);
        evaluteChess(evaluatePositionX,evaluatePositionY);
        resetCountChess();
        scoreChess[evaluatePositionX][evaluatePositionY] = scoreAI[evaluatePositionX][evaluatePositionY]
         - scoreHuman[evaluatePositionX][evaluatePositionY];
        isWell = false;
        /*curUser = 2;
        chessType = 2;*/ //TODO 搜1层时chesstype未定义
    }

    //TODO 这里是正常的    因为1列1列的扫描  （第一次找出所有极小点里极大值的点后  后面的点就不记录了 所以应该先打分选点）
    /*if (scoreChess[evaluatePositionX][evaluatePositionY] == -105) {
        alert(scoreAI[evaluatePositionX][evaluatePositionY]);
        alert(scoreHuman[evaluatePositionX][evaluatePositionY]);
        //alert(evaluatePositionX);
        //alert(evaluatePositionY);
    }*/

    return scoreChess[evaluatePositionX][evaluatePositionY];
}

function MinMax(depth) {
    if (curUser == 2) {　// 白方是“最大”者
        return Max(depth);
    } else {　　　　　　　　　　　// 黑方是“最小”者
        return Min(depth);
    }
}

function Max(depth) {
    var best = -INFINITY;//TODO

    if (depth <= 0) {
        return evaluateChess();
    }

    generateMaxLegalMoves();

    var val = new Array(legalMoves.length);

    for (var i = 0; i < legalMoves.length; i++) {
        curUser = 2;
        chessType = 2;
        //实施着法
        chessData[legalMoves[i].x][legalMoves[i].y] = 2;
        //反过来搜索，站在最小者一方
        val[i] = Min(depth - 1);
        //撤销着法
        chessData[legalMoves[i].x][legalMoves[i].y] = 0;
        resetScore();
        if (val[i] > best) {
            best = val[i];
            //保存位置
            legalBestMovesMaxPositionX = legalMoves[i].x;
            legalBestMovesMaxPositionY = legalMoves[i].y;
        }
    }

    return best;
}

function Min(depth) {
    var best = INFINITY;　// 注意这里不同于“最大”算法

    if (depth <= 0) {
        return evaluteChess();
    }
    //generateLegalMoves();

    var legalMovesMin = Array();
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (chessData[i][j] != 0) {
                continue;
            }
            legalMovesMin.push({x:i,y:j});
        }
    }

    var val = new Array(legalMovesMin.length);

    for (var i = 0; i < legalMovesMin.length; i++) {
        curUser = 1;
        chessType = 1;
        //实施着法
        chessData[legalMovesMin[i].x][legalMovesMin[i].y] = 1;

        evaluatePositionX = legalMovesMin[i].x;
        evaluatePositionY = legalMovesMin[i].y;

        val[i] = Max(depth - 1);

        //撤销着法
        chessData[legalMovesMin[i].x][legalMovesMin[i].y] = 0;
        resetScore();
        if (val[i] < best) {
            best = val[i];
            //TODO 保存位置坐标
        }
    }

    return best;
}

//生成合法着法
function generateMaxLegalMoves() {
    pointChessVoid();

    /*var scoreTemp = new Array(225);
    var n = 0;

    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            scoreTemp[n] = scoreChessVoid[i][j];
            n++;
        }
    }

    for (var i = 0; i < scoreTemp.length - 1; i++) {
        for (var j = 0; j < scoreTemp.length - 1 - i; j++) {
            if (scoreTemp[j] > scoreTemp[j + 1]) {
                var tmp = scoreTemp[j];
                scoreTemp[j] = scoreTemp[j + 1];
                scoreTemp[j + 1] = tmp;
            }
        }
    }

    //选出scoreTemp里后50个点
    //TODO 可以先排除两格内没有棋子的点
    legalMoves = Array();
    var m = 224;
    var flag = 1;
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (m == 174) {
                flag = 0;
                break;
            }
            if (scoreChessVoid[i][j] == scoreTemp[m]) {
                legalMoves.push({x:i,y:j});
                m--;
            }
        }
        if (flag == 0) {
            break;
        }
    }*/

    /*----------------------------------------------------------------------*/

    /*var scoreTemp = new Array(scoreChessVoidTemp.length);
    var n = 0;

    for (var i = 0; i < scoreChessVoidTemp.length; i++) {
        scoreTemp[n] = scoreChessVoidTemp[i].z;
        n++;
    }

    for (var i = 0; i < scoreTemp.length - 1; i++) {
        for (var j = 0; j < scoreTemp.length - 1 - i; j++) {
            if (scoreTemp[j] > scoreTemp[j + 1]) {
                var tmp = scoreTemp[j];
                scoreTemp[j] = scoreTemp[j + 1];
                scoreTemp[j + 1] = tmp;
            }
        }
    }

    legalMoves = Array();
    var m = scoreChessVoidTemp.length - 1;
    var flag = 1;

    //大于50个点 只找倒数50个
    if (scoreChessVoidTemp.length > 50) {
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (scoreChessVoidTemp.length - 1 - m == 50) {
                    flag = 0;
                    break;
                }
                if (scoreChessVoid[i][j] == scoreTemp[m]) {//TODO 必须先把50个点在原数组中的位置保存下来
                    for (var k = 0; k < scoreChessVoidTemp.length; k++) {
                        if (scoreChessVoidTemp[k].x == i && scoreChessVoidTemp[k].y == j && scoreChessVoidTemp[k].z == scoreTemp[m]) {
                            legalMoves.push({x:i,y:j});
                            m--;
                            break;//TODO
                        }
                    }
                }
            }
            if (flag == 0) {
                break;
            }
        }
    } else {//小于等于就全找
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (m < 0) {
                    flag = 0;
                    break;
                }
                if (scoreChessVoid[i][j] == scoreTemp[m]) {
                    for (var k = 0; k < scoreChessVoidTemp.length; k++) {
                        if (scoreChessVoidTemp[k].x == i && scoreChessVoidTemp[k].y == j && scoreChessVoidTemp[k].z == scoreTemp[m]) {
                            legalMoves.push({x:i,y:j});
                            m--;
                            break;
                        }
                    }
                }
            }
            if (flag == 0) {
                break;
            }
        }
    }*/

    //TODO 不打分选所有点  就会先下第一个分最高的（打分后会选最好的点）
    /*legalMoves = Array();
    for (var k = 0; k < scoreChessVoidTemp.length; k++) {
        legalMoves.push({x:scoreChessVoidTemp[k].x,y:scoreChessVoidTemp[k].y});
    }*/

    var sorting_array = Array();
    for (var i = 0; i < scoreChessVoidTemp.length; i++) {
        sorting_array.push({m:scoreChessVoidTemp[i].x,n:scoreChessVoidTemp[i].y});
    }

    for (var i = 0; i < sorting_array.length; i++) {
        for (var j = i + 1; j < sorting_array.length; j++) {
            var ux = sorting_array[i].m;
            var uy = sorting_array[i].n;
            var vx = sorting_array[j].m;
            var vy = sorting_array[j].n;
            if (scoreChessVoid[ux][uy] > scoreChessVoid[vx][vy]) {
                var temp = sorting_array[i];
                sorting_array[i] = sorting_array[j];
                sorting_array[j] = temp;
            }
        }
    }

    legalMoves = Array();
    for (var i = sorting_array.length - 1; i > sorting_array.length - 51; i--) {
        legalMoves.push({x:sorting_array[i].m,y:sorting_array[i].n});
    }

    resetScore();
}

//生成AI棋子
function generateAIChess() {

    curUser = 2;//设置当前玩家为circle

    if (curUser == 1) {
        chessType = 1;
    } else {
        chessType = 2;//设置当前棋子类型为circle
    }

    MinMax(2);

    drawChess(legalBestMovesMaxPositionX, legalBestMovesMaxPositionY);
    checkChess(legalBestMovesMaxPositionX, legalBestMovesMaxPositionY);


    /*//随机在几个分数最大值里面取一个点
    var scoreMax = scoreTemp[224];

    var t = Array();
    for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
            if (scoreChessVoid[i][j] == scoreMax) {
                t.push({x:i,y:j});
            }
        }
    }
    var s = Math.floor(Math.random()*t.length);
    drawChess(t[s].x, t[s].y);
    checkChess(t[s].x, t[s].y);*/

    resetCountChess();
    checkIsWell();

    resetScore();
}

//页面加载完成后开始运行
$(document).ready(function() {
    //绘制棋盘
    drawChessBoard();
    //初始化棋盘信息
    initChessData();
    //初始化分数
    initScore();
    //给canvas画布绑定点击事件
    $("#canvas").click(play);
});














