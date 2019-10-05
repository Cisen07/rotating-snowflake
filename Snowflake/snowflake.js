"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 0; //原来值是5,Num修改为num ???
var points = []; //存放所生成的所有顶点的位置

var program;
var bufferId;
var colorbufferId;

var vertices = [
    // vec2( -0.6, -0.6 ),
    // vec2(  0,  0.6 ),
    // vec2(  0.6, -0.6)
    vec2( -1.732 * 0.3, -1 * 0.3),
    vec2(  0 * 0.3,  2 * 0.3),
    vec2(  1.732 * 0.3, -1 * 0.3)
];

var velocities = [
    0.03,
    0.06,
    0.1
]
var velocity = velocities[0];

var colorsOfVertexs=[]; //存放所生成的所有顶点的颜色
var c1,c2,c3;
var c_white = vec4( 1.0, 1.0, 1.0, 1.0 );
var c_black = vec4( 0.0, 0.0, 0.0, 1.0 );
var c_babyBlue = vec4( 0.6, 1.0, 1.0, 1.0 );
c1 = c_white;
c2 = c_white;

var theta = 0.0;
var thetaLoc;
var centerX=0.0;
var centerXLoc;
var centerY=0.0;
var centerYLoc;

var animflag = false;
var sliderchangeflag = false;
var centerchageflag = false;
var orientationFlag = false;
var colorChangeFlag = false;

//====add=============
window.onload = function init() 
{
    canvas = document.getElementById( "gl-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	// 从setupWebGL()的返回值是一个JavaScript对象，它包含WebGL支持的所有OpenGL函数方法。
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //
    //  Configure WebGL
    //
	gl.viewport( 0, 0, canvas.width, canvas.height );
	// 来设置视口，即指定从标准设备到窗口坐标的x、y仿射变换
	// 如果你重新改变了canvas的大小，你需要使用该语句告诉WebGL上下文设定新的视口
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	// 设置清空颜色缓冲时的颜色值。这指定调用 clear() 方法时使用的颜色值。这些值在0到1的范围间。
    
    //====================================================
    //  Initialize our data for the Snowflake
    //====================================================
    
    firstTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
    
    // Load shaders and initialize attribute buffers
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	// operations like attaching and linking are done in the initShaders.js
	gl.useProgram( program );
	
    
    // Load the data into the GPU
	bufferId = gl.createBuffer();
	// creates and initializes a WebGLBuffer storing data such as vertices or colors
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	// the location of an attribute variable in a given WebGLProgram
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	// 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据
    gl.enableVertexAttribArray( vPosition );
	
	//*****************deliver colors attribue********************************
	colorbufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferId );	
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
	thetaLoc = gl.getUniformLocation( program, "theta" );
	centerXLoc = gl.getUniformLocation( program, "centerX" );
	centerYLoc = gl.getUniformLocation( program, "centerY" );
	
	render();
    
    //*******增加滑动条的监听程序,重新生成顶点，重新绘制
	document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
		points = [];
		colorsOfVertexs=[];
        firstTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
		sliderchangeflag=true;			
    };	

    //*******增加颜色选择框的监听程序,重新生成顶点，重新绘制
    document.getElementById("color1").onchange = function(event) {
        var newValue = parseInt(event.target.value);
        points = [];
        colorsOfVertexs = [];
        switch (newValue) {
            case 1:
                c1 = c_white;
                break;
            case 2:
                c1 = c_black;
                break;
            case 3:
                c1 = c_babyBlue;
        }
        firstTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
		sliderchangeflag = true;			
    }
    document.getElementById("color2").onchange = function(event) {
        var newValue = parseInt(event.target.value);
        points = [];
        colorsOfVertexs = [];
        switch (newValue) {
            case 1:
                c2 = c_white;
                break;
            case 2:
                c2 = c_black;
                break;
            case 3:
                c2 = c_babyBlue;
        }
        firstTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
		sliderchangeflag = true;			
    }

    //*******增加颜色选择框的监听程序,重新生成顶点，重新绘制
    this.document.getElementById("sliderForVelocity").onchange = function(event) {
        var newValue = parseInt(event.target.value);
        points = [];
        colorsOfVertexs = [];
        switch (newValue) {
            case 1:
                velocity = velocities[0];
                break;
            case 2:
                velocity = velocities[1];
                break;
            case 3:
                velocity = velocities[2];
        }
        firstTriangle(vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
		sliderchangeflag = true;	
    }


	// //*********增加鼠标点击事件,移动坐标中心
	// //canvas.addEventListener("click", function(event) {
	// canvas.addEventListener("mousedown", function(event){
        // 	centerX= -1 + (2*event.clientX/canvas.width);
        //     centerY= -1 + 2*(canvas.height-event.clientY)/canvas.height;
	// 	centerchageflag=true;	  
    
	// 	 /*为画布添加点击事件，从画布坐标到裁剪坐标计算同课本。
	// 		注：canvas内坐标计算为
	// 		X=(event.clientX - bbox.left) * (canvas.width/bbox.width)
	// 		Y=(event.clientY - bbox.top) * (canvas.height/bbox.height)
	// 		这里是将裁剪坐标下（0，0）点平移到点击位置，故在计算偏移量时是减去0。
	// 		*/
	//     /* var bbox = canvas.getBoundingClientRect();
	// 	 centerX=2*(event.clientX - bbox.left) * (canvas.width/bbox.width)/canvas.width-1;
	// 	 centerY=2*(canvas.height- (event.clientY - bbox.top) * (canvas.height/bbox.height))/canvas.height-1;
  	// 	 centerchageflag=true;	 */
	// });
    
	//*******动画启动/停止监听器 Initialize event handlers
    document.getElementById("Animation").onclick = function () {
        animflag = !animflag;
    };
	//*******改变旋转方向监听器 Initialize event handlers
    document.getElementById("Orientation").onclick = function () {
        orientationFlag = !orientationFlag;
    };

};

function line(a, b) {
    points.push(a, b);
    // colorsOfVertexs.push(c1);
    // colorsOfVertexs.push(c1);
}

function divideLine(a, b, depth) {
    if (depth == 0) {
        vertices.push(a);
        vertices.push(b);
        points.push(a, b);
        colorsOfVertexs.push(c1);
        colorsOfVertexs.push(c2);
    } else {
        var p1 = mix(a, b, 1.0/3.0);
        var p3 = mix(a, b, 2.0/3.0);
        var c = Math.cos(radians(60));
        var s = Math.sin(radians(60));
        var v = subtract(p3, p1);
        v = vec2(v[0]*c - v[1]*s, v[0]*s + v[1]*c);
        var p2 = add(p1, v);
        divideLine(a, p1, depth - 1);
        divideLine(p1, p2, depth - 1);
        divideLine(p2, p3, depth - 1);
        divideLine(p3, b, depth - 1);
    }
}

function firstTriangle(a, b, c, depth) {
    vertices.push(a);
    vertices.push(b);
    vertices.push(c);
    divideLine(a, b, depth);
    divideLine(b, c, depth);
    divideLine(c, a, depth);
}

function triangle( a, b, c )
{

    points.push( a, b, c );	
	colorsOfVertexs.push(c1);
	colorsOfVertexs.push(c2);
	colorsOfVertexs.push(c3);
}

function divideTriangle( a, b, c, count )
{
	// count is the times triangles need to subdivide

    // check for end of recursion
    if ( count == 0 ) {
        triangle( a, b, c );
    }
    else {
        // bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        count=count-1;        //count--;	
         		
        // three new triangles，递归调用
        divideTriangle( a, ab, ac, count );
		divideTriangle( ab,b, bc, count );
		divideTriangle( ac, bc, c, count );
        // divideTriangle( b, bc, ab, count );
		// divideTriangle( c, ac, bc, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );		

	if(animflag)//如果旋转控制按钮由切换，需要发送旋转角度给shader
	{
        if(orientationFlag) {   // 如果旋转方向控制钮被触发，需要改变旋转方向
            theta -= velocity;
        } else {
            theta += velocity;
        }
		gl.uniform1f(thetaLoc, theta);		
    }; 	
        
	if(sliderchangeflag)//如果slider值有变化需要发送Gasket2D 新初始顶点属性数据给shader
	{	
		gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
		gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );		
		gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferId );	
		gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsOfVertexs), gl.STATIC_DRAW );		
    }	
	
	if(centerchageflag)//如果鼠标重新点击了中心，需要把新中心传递给shader
	{
		gl.uniform1f(centerXLoc, centerX);
		gl.uniform1f(centerYLoc, centerY);
    }
	
    // gl.drawArrays( gl.TRIANGLES, 0, points.length );	
    // gl.drawArrays(gl.LINE_STRIP, 0, points.length);
    gl.drawArrays(gl.LINE_LOOP, 0, points.length);
	sliderchangeflag=false;
	centerchageflag=false;

    requestAnimFrame(render);    
	// tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
}