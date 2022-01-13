//defining 3 cube colors to choose from
let red = { name: "red", color: [255, 42, 0] };
const green = { name: "green", color: [85, 255, 0] };
const blue = { name: "blue", color: [128, 234, 255] };
const cubeColors = [red, green, blue];
//creating an empty variable to be made into a 3D matrix later on
let cubeGrid;
let faces;
let rightAnswer = "";
let currentAnswer
let blinkCountDown
let score = 0
let inARow = 0
let mistakes = 0

let errorColors = {
    "topright":200,
    "topleft": 200,
    "bottomleft": 200,
    "bottomright": 200
}

let myFont

function preload() {
  myFont = loadFont("BeVietnamPro-Regular.ttf")
}

function setup() {
  createCanvas(900, 900, WEBGL);
    ortho(-width / 2, width / 2, -height / 2, height / 2, -1000, 1000);
    frameRate(30)
  textFont(myFont)
  cubeSetup();
  facesSetup();
  interfaceSetup();
}

function cubeSetup() {
  build3dCubeMatrix();
  fillStaticColumns();
  addMiddleBar();
  colorCubes();
}

function facesSetup() {
    determineFaces();
    makeAnswers()
    shuffleFaces()
}

function interfaceSetup() {
  findAnswerPos();
}

function resetShape() {
    cubeSetup()
    facesSetup()
    interfaceSetup()
}

function mousePressed() {
  if (checkAnswer(75, 225, 125, 275, "topleft")) return;
  if (checkAnswer(675, 825, 125, 275, "topright")) return;
  if (checkAnswer(75, 225, 625, 775, "bottomleft")) return;
  if (checkAnswer(675, 825, 625, 775, "bottomright")) return;
    function checkAnswer(a, b, c, d, answerArea) {
        if (mouseX >= a && mouseX <= b && mouseY >= c && mouseY <= d) {
            if (answerArea === rightAnswer) {
                score++
                inARow++
                resetShape()
            } else {
                errorColors = {
                      "topright":200,
                      "topleft": 200,
                      "bottomleft": 200,
                      "bottomright": 200
                  }
                currentAnswer = answerArea
                errorColors[answerArea] = [255, 88, 88]
                blinkCountDown = frameCount + 15
                inARow = 0
                mistakes++
            }
      }
    }
    
}

function handleBlink() {
    if (blinkCountDown < frameCount) {
        errorColors[currentAnswer]= 200
    }

} 

/*this function makes a 3D matrix full of objects
the values of which will be used to determine whether
to render a cube, what color to fill it with and fills in positional data*/
function build3dCubeMatrix() {
  cubeGrid = Array(3)
    .fill([])
    .map((e) =>
      Array(3)
        .fill([])
        .map((e) => Array(3).fill(null))
    );
  let count = 0;
  let startingPosition = -100;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        cubeGrid[x][y][z] = {
          coordX: startingPosition + 100 * x,
          coordY: startingPosition + 100 * y,
          coordZ: startingPosition + 100 * z,
          xValue: x,
          yValue: y,
          zValue: z,
          color: 200,
          isCube: false,
        };
      }
    }
  }
}

/*the shape always contains 2 vertical pillars at opposing
 corners of the "base cube", this function determines
 whether to render the 1st and the 4th diagonnal column or the
  2nd and the 3rd and subsequently makes the
  relevant object values true in the 3D matrix*/
function fillStaticColumns() {
  let whichToBuild = random([0, 1]) < 1 ? "1-4" : "2-3";
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        let cube = cubeGrid[x][y][z];
        if (whichToBuild === "1-4") {
          if ((x === 0 && z === 0) || (x === 2 && z === 2)) {
            cubeGrid[x][y][z].isCube = true;
          }
        } else if (whichToBuild === "2-3") {
          if ((x === 2 && z === 0) || (x === 0 && z === 2)) {
            cubeGrid[x][y][z].isCube = true;
          }
        }
      }
    }
  }
}

/*this function adds the middle bar which
 can face forwards or backwards and can
 be at any of the 3 levels*/
function addMiddleBar() {
  let height = random([0, 1, 2]);
  let number = random([0, 1]);
  let orientation = number < 1 ? "forwards" : "backwards";
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        if (orientation === "forwards") {
          cubeGrid[1][height][z].isCube = true;
        } else if (orientation === "backwards") {
          cubeGrid[x][height][1].isCube = true;
        }
      }
    }
  }
}

/*this function assigns a color to
each cube in the shape so that no two
adjacent cubes share the same color*/
function colorCubes() {
  let colorArray = [];
  //put every cube that needs to be colored into an array
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (cubeGrid[i][j][k].isCube) {
          colorArray.push(cubeGrid[i][j][k]);
        }
      }
    }
  }
  for (let cube of colorArray) {
    /*populate the adjacentColors array
    with the color of every adjacent cube*/
    let i = cube.xValue;
    let j = cube.yValue;
    let k = cube.zValue;
    let adjacentColors = [];
    if (i - 1 > -1) {
      adjacentColors.push(cubeGrid[i - 1][j][k].color);
    }
    if (i + 1 < 3) {
      adjacentColors.push(cubeGrid[i + 1][j][k].color);
    }
    if (j - 1 > -1) {
      adjacentColors.push(cubeGrid[i][j - 1][k].color);
    }
    if (j + 1 < 3) {
      adjacentColors.push(cubeGrid[i][j + 1][k].color);
    }
    if (k - 1 > -1) {
      adjacentColors.push(cubeGrid[i][j][k - 1].color);
    }
    if (k + 1 < 3) {
      adjacentColors.push(cubeGrid[i][j][k + 1].color);
    }
    /*assign a color to the cube which
        isn't in the adjacentColors array*/
    let color = random(cubeColors);
    while (adjacentColors.includes(color.color)) {
      color = random(cubeColors);
    }
    cubeGrid[i][j][k].color = color.color;
    cubeGrid[i][j][k].colorName = color.name;
  }
}

/* this function returns 2 arrays, one with
hard sides and one with easy sides*/
function determineFaces() {
  faces = [];
  /* this function makes a 2D array
  that will later be filled with data
  to build the faces from*/
  function emptyFace() {
    return Array(3)
      .fill([])
      .map((e) =>
        Array(3)
          .fill(null)
          .flatMap((_) => [{ isSquare: false }])
      );
  }

  const face1 = emptyFace();
  const face2 = emptyFace();
  const face3 = emptyFace();
  const face4 = emptyFace();
  /* i need to change which directions
  i iterate through the array from for
  different faces*/
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      // front left (easy)
      for (let z = 0; z < 3; z++) {
        if (cubeGrid[x][y][z].isCube) {
          const c = cubeGrid[x][y][z];
          const f = face1[y][x];
          f.isSquare = true;
          f.color = c.color;
          f.colorName = c.colorName;
          break;
        }
      }
      // front right (easy)
      for (let z = 2; z > -1; z--) {
        if (cubeGrid[z][y][x].isCube) {
          const c = cubeGrid[z][y][x];
          const f = face2[y][x];
          f.isSquare = true;
          f.color = c.color;
          f.colorName = c.colorName;
          break;
        }
      }
    }
  }
  for (let x = 2; x > -1; x--) {
    let xFace = 1;
    if (x === 0) {
      xFace = 2;
    }
    if (x === 2) {
      xFace = 0;
    }
    for (let y = 0; y < 3; y++) {
      //back right (hard)
      for (let z = 2; z > -1; z--) {
        if (cubeGrid[x][y][z].isCube) {
          const c = cubeGrid[x][y][z];
          const f = face3[y][xFace];
          f.isSquare = true;
          f.color = c.color;
          f.colorName = c.colorName;
          break;
        }
      }
      // back left (hard)
      for (let z = 0; z < 3; z++) {
        if (cubeGrid[z][y][x].isCube) {
          const c = cubeGrid[z][y][x];
          const f = face4[y][xFace];
          f.isSquare = true;
          f.color = c.color;
          f.colorName = c.colorName;
          break;
        }
      }
    }
  }
  faces.push({ face: face1, isAnswer: false });
  faces.push({ face: face2, isAnswer: false });
  faces.push({ face: face3, isAnswer: false });
  faces.push({ face: face4, isAnswer: false });
}

/* this function chooses a face to make the
correct answer and then changes one square
in every other one to make them false answers*/
function makeAnswers() {
  /*choose which face to make the answer,
    30 percent chance of being an easy one*/
  const easyFacesInd = [0, 1];
  const hardFacesInd = [2, 3];
  let ind = random(1, 11) < 7 ? random(hardFacesInd) : random(easyFacesInd);
  faces[ind].isAnswer = true;

  /*an array in which to stroke strings
    made of the faces to compare against
    as to avoid having duplicate answers*/
  const uniqueStrings = [];
  uniqueStrings.push(faces[ind]);
  for (let i = 0; i < faces.length; i++) {
    if (!faces[i].isAnswer) {
      function changeRandomSquare(i) {
        //choose a random square
        let xInd = random([0, 1, 2]);
        let yInd = random([0, 1, 2]);
        while (!faces[i].face[xInd][yInd].isSquare) {
          yInd = random([0, 1, 2]);
        }
        const randomSquare = faces[i].face[xInd][yInd];
        /*store the current color to compare
        against to make sure it doesn't end
        up assigning it the same color it already had*/
        const currColor = JSON.stringify(randomSquare.color);
        //assign the new color
        let newColor = random(cubeColors).color;
        while (JSON.stringify(newColor) === currColor) {
          newColor = random(cubeColors).color;
        }
        randomSquare.color = newColor;
      }
      /* check if the face is unique,
      if not change to a new random face*/
      changeRandomSquare(i);
      while (uniqueStrings.includes(JSON.stringify(faces[i].face))) {
        changeRandomSquare(i);
      }
      /* add the face to the faces
      to check for uniqueness against*/
      uniqueStrings.push(JSON.stringify(faces[i]));
    }
  }
}

/* this function shuffles the faces,
changing their place and their orientation*/
function shuffleFaces() {
  //shuffle the faces
  faces = shuffle(faces);
  function rotatePos90(arr) {
    let rotatedArr = Array(3)
      .fill([])
      .map((e) => Array(3).fill([]));
    for (let x = 0; x < 3; x++) {
      let nx = 1;
      if (x === 2) {
        nx = 0;
      }
      if (x === 0) {
        nx = 2;
      }
      for (let y = 0; y < 3; y++) {
        let ny = 1;
        if (y === 2) {
          ny = 0;
        }
        if (y === 0) {
          ny = 2;
        }
        rotatedArr[x][y] = arr[ny][x];
      }
    }
    return rotatedArr;
  }
  function rotateNeg90(arr) {
    let rotatedArr = Array(3)
      .fill([])
      .map((e) => Array(3).fill([]));
    for (let x = 0; x < 3; x++) {
      let nx = 1;
      if (x === 2) {
        nx = 0;
      }
      if (x === 0) {
        nx = 2;
      }
      for (let y = 0; y < 3; y++) {
        let ny = 1;
        if (y === 2) {
          ny = 0;
        }
        if (y === 0) {
          ny = 2;
        }
        rotatedArr[x][y] = arr[y][nx];
      }
    }
    return rotatedArr;
  }
  function rotate180(arr) {
    let rotatedArr = Array(3)
      .fill([])
      .map((e) => Array(3).fill([]));
    for (let x = 0; x < 3; x++) {
      let nx = 1;
      if (x === 2) {
        nx = 0;
      }
      if (x === 0) {
        nx = 2;
      }
      for (let y = 0; y < 3; y++) {
        let ny = 1;
        if (y === 2) {
          ny = 0;
        }
        if (y === 0) {
          ny = 2;
        }
        rotatedArr[x][y] = arr[nx][ny];
      }
    }
    return rotatedArr;
  }
  function doNothing(arr) {
    return arr;
  }
  /* put the different rotations into
   an array to chose from randomly*/
  const easyFaceFuncs = [rotate180, rotateNeg90, rotatePos90];
  const hardFaceFuncs = [rotate180, rotateNeg90, rotatePos90, doNothing];
  for (let i = 0; i < faces.length; i++) {
    /*if it's an easy face, not
      rotating it at all isn't an option*/
    if (i <= 1) {
      faces[i].face = random(easyFaceFuncs)(faces[i].face);
      // if it's a hard one it is
    } else if (i >= 2) {
      faces[i].face = random(hardFaceFuncs)(faces[i].face);
    }
  }
}

function buildSquares() {
  function buildSquare(face, xShift, yShift) {
    const coordX = -50;
    const coordY = 50;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const f = face[y][x];
        if (f.isSquare) {
          push();
          translate(coordX + 50 * x + xShift, coordY - 50 * y + yShift, 0);
          fill(f.color);
          stroke(0);
          strokeWeight(1);
          box(50);
          pop();
        }
      }
    }
  }
  buildSquare(faces[0].face, -300, -250);
  buildSquare(faces[1].face, 300, -250);
  buildSquare(faces[2].face, -300, 250);
  buildSquare(faces[3].face, 300, 250);
}

/*this function draws the cubes making up
the shape according to their position and color*/
function buildShape() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (cubeGrid[i][j][k].isCube) {
          let cube = cubeGrid[i][j][k];
          push();
          fill(cube.color);
          translate(cube.coordX, cube.coordY, cube.coordZ);
          stroke(0);
          box(100);
          pop();
        }
      }
    }
  }
}

function buildErrors() {
    function buildError(x, y, z, color) {
        push()
        fill(color)
        translate(x, y, z)
        noStroke()
        box(175)
        pop()
    }
    buildError(-300, -250, -100, errorColors.topleft)
    buildError(300, -250, -100, errorColors.topright)
    buildError(-300, 250, -100, errorColors.bottomleft)
    buildError(300, 250, -100, errorColors.bottomright)
}

function findAnswerPos() {
    for (let i = 0; i < 4; i++) {
    if (faces[i].isAnswer) {
      if (i === 0) {
        rightAnswer = "topleft";
      } else if (i === 1) {
        rightAnswer = "topright";
      } else if (i === 2) {
        rightAnswer = "bottomleft";
      } else if (i === 3) {
        rightAnswer = "bottomright";
      }
    }
  }
}

function draw() {
  background(200);
  normalMaterial();
  push();
  directionalLight(200, 200, 200, -0.25, -0.5, -1);
  ambientLight(100);
        rotateX(radians(-40))
  rotateY(radians(-43.5))
    rotateZ(radians(180))
  buildShape();
  pop();
    buildSquares();
    buildErrors()
    push();
  textSize(45);
    text("Which view is correct?", -245, -372);
    text("A", -316, -125)
    text("B", 284, -125)
    text("C", -317, 375)
    text("D", 284, 375)
    text(`Score: ${score}`, -85, 310)
    text(`In a row: ${inARow}`, -100, 353)
    text(`Mistakes: ${mistakes}`, -110, 400)
    pop();
    push()
    textSize(90)
    text(Math.floor(millis()/1000), 280, -357)
    handleBlink()
}
