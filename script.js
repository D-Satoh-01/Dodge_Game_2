//バグの防止
"use strict";

const SCREEN_WIDTH = 720;
const SCREEN_HEIGHT = 540;
const MESH = 24;
const PLAYER_SPEED = 3;
const TIMER_INTERVAL = 15; //15で大体FPS=60になる

var player_style = "#ffffff"
var player_x = SCREEN_WIDTH/2;
var player_y = SCREEN_HEIGHT - MESH*3;
var score = 0;
var life = 3;
var time = 0;
var five_seconds_timer = 0
var player_move_flag_right = false;
var player_move_flag_left = false;
var player_move_flag_up = false;
var player_move_flag_down = false;
var frame_timer
//以下の[]にボールのインスタンスを入れる
var balls_instance = [];
var ball_color = ["#ff0000"];


//ボールのクラス
class Ball {
    constructor(bc){
        this.ball_x = SCREEN_WIDTH / 2;
        this.ball_y = MESH*2;
        let angle = Math.random() * 2.5 + (Math.PI - 2.5) / 2;
        this.ball_speed_x = Math.cos(angle);
        this.ball_speed_y = Math.sin(angle);
        this.ball_style = ball_color[bc];
    }

    draw(g){
        g.fillStyle = this.ball_style;
        g.fillRect(this.ball_x - 6, this.ball_y - 6, 6*2, 6*2);
    }

    move_ball(){
        //残機ゼロのときにボールの動作を止める
        if(life <= 0){
            return;
        }

        time = Math.round(performance.now() / 1000);

        //ボールの移動
        this.ball_x += this.ball_speed_x*1;
        this.ball_y += this.ball_speed_y*1;

        //ボールとプレイヤーの当たり判定
        if (IsInRect(this.ball_x, this.ball_y, player_x, player_y, MESH, MESH)){
            life -= 1;
            return(true);
        }

        //ボールの壁際反射(x軸)
        if (this.ball_x < MESH || this.ball_x > SCREEN_WIDTH - MESH){
            this.ball_speed_x = -this.ball_speed_x;
            //this.ball_x += this.ball_speed_x;
            score++;
        }
        //ボールの壁際反射(y軸)
        if (this.ball_y < MESH || this.ball_y > SCREEN_HEIGHT - MESH){
            this.ball_speed_y = -this.ball_speed_y;
            //this.ball_y += this.ball_speed_y;
            score++;
        }

        return(false);
    }
}


//ブラウザが読み込まれたときに呼び出す関数
window.onload = function(){
    //スタート時に実行される関数
    start();
    //フレーム数を機種依存のフレーム数に制限する
    requestAnimationFrame(mainLoop);
}

function start(){
    for (let i = 0; i < 8; i++ ) {
        balls_instance.push(new Ball(0));
    }
}

function mainLoop(){

    if (!frame_timer) {
        frame_timer = performance.now();
    }
    //インターバルを挟んで実行させる（フレームレート制限）
    if (frame_timer + TIMER_INTERVAL < performance.now()) {
        frame_timer += TIMER_INTERVAL;

        draw();
        player_move_input();
        player_move();
        move_ball();
        timer();
    }

    //ループさせる
    requestAnimationFrame(mainLoop);
}

//当たり判定の関数
function IsInRect(x, y, rect_x, rect_y, rect_w, rect_h){
    return(rect_x < x && x < rect_x + rect_w && rect_y < y && y < rect_y + rect_h);
}

function draw(){
    let screen = document.getElementById("main").getContext("2d");

    //画面の塗りつぶし
    screen.fillStyle = "#cccccc";
    screen.fillRect(0,0,SCREEN_WIDTH,SCREEN_HEIGHT);
    screen.fillStyle = "#111111"
    screen.fillRect(MESH, MESH, SCREEN_WIDTH-MESH*2, SCREEN_HEIGHT-MESH*2);

    //プレイヤーの四角の描画
    screen.fillStyle = player_style;
    screen.fillRect(player_x, player_y, MESH, MESH);

    for (let b of balls_instance){
        b.draw(screen)
    }

    screen.font = "36px monospace";
    screen.fillStyle = "#ffffff"
    screen.fillText("SCORE " + score, MESH*2, MESH*2.5);
    screen.fillText("TIME " + time, SCREEN_WIDTH / 2 - MESH * 3, MESH*2.5);
    screen.fillText("LIFE " + life, MESH*23, MESH*2.5);
    if (life <= 0){
        screen.fillText("Game Over", SCREEN_WIDTH / 2 - MESH * 3, SCREEN_HEIGHT / 2);
    }
}

function player_move_input(){
    window.onkeydown = function(inputtedValue){
        //右入力
        if (inputtedValue.keyCode == 39){
            player_move_flag_right = true
        }
        //左入力
        if (inputtedValue.keyCode == 37){
            player_move_flag_left = true
        }
        //上入力
        if (inputtedValue.keyCode == 38){
            player_move_flag_up = true
        }
        //下入力
        if (inputtedValue.keyCode == 40){
            player_move_flag_down = true
        }
    }
    
    window.onkeyup = function(inputtedValue){
        //右入力停止
        if (inputtedValue.keyCode == 39){
            player_move_flag_right = false
        }
        //左入力停止
        if (inputtedValue.keyCode == 37){
            player_move_flag_left = false
        }
        //上入力停止
        if (inputtedValue.keyCode == 38){
            player_move_flag_up = false
        }
        //下入力停止
        if (inputtedValue.keyCode == 40){
            player_move_flag_down = false
        }
    }
}

function player_move(){
    if (player_move_flag_right == true && player_x < SCREEN_WIDTH - MESH*2){
        player_x += PLAYER_SPEED
    }
    if (player_move_flag_left == true && player_x > MESH){
        player_x -= PLAYER_SPEED
    }
    if (player_move_flag_down == true && player_y < SCREEN_HEIGHT - MESH*2){
        player_y += PLAYER_SPEED
    }
    if (player_move_flag_up == true && player_y > MESH){
        player_y -= PLAYER_SPEED
    }
}

function move_ball(){
    for(let j = 0; j < 4; j++){
        for (let i = balls_instance.length - 1; i >= 0; i--){
            if (balls_instance[i].move_ball()){
                balls_instance.splice(i,1);
            } 
        }
    }
}

function add_ball(){
    for (let i = 0; i < 2; i++ ) {
        balls_instance.push(new Ball(0));
    }
}

function timer(){
    console.log(five_seconds_timer);
    five_seconds_timer += 1
    if(five_seconds_timer == 300){
        five_seconds_timer = 0;
        add_ball();
    }
}
