// yaklaşım her bir rdp çifti arasında bir çizgi oluşturarak elini kaldırmadan çizim yapmak
// not : burada el ile yaılan bir çizim için düz olarak bulunacaktır
// geliştirilmesi gereiilen alternatif : alternatif olarak kişinin vereceği rastgele bir resim ile yaılacaktır
//                                        bunun yapılabilmesi için canny kenar algritması ile rdp birleştirilir
//                                        sonrasında bizim uğraştığım genetik algortma işin içine girer.
let backgroundColor = [255, 204, 100]
let currentStroke;
let x, y;
let nextPen = 'down';
let seedPath = [];
let seedPoints = [];
let personDrawing = false;

// canvas büyüklüğü bu resimin büyüklüğü test için 
let canvasHeight = 50;
let canvasWeight = 50;
let canvasSize = 50

// kalem nerede
let startX = 0
let startY = 0
let startingPoint ;// aklem nereden çizmeye başlayacak seup içinde vector

let move = [[0,0],[0,1],[-1,-1],[-1,0],[0,-1],[1,-1],[1,0],[1,1]]

ac_t = Array.from({length:8},(v,k)=>k+2)
ac=ac_t.map((x) =>  (x-2)*45)
ac.unshift(0) // 0 0 45 90 135 180 225 270 315

// kuş uçuşu uzaklığın kaç katı olacağı kuş uçumu uzaklıktan uzun olması şarttır
// çok uzun olursa algoitma kendi üzerinde dönerek değeri bulabilir 
// ama uzun süre alabilir.
let startPathDeviationLine = 7

let drawings ;
let drawingByAlgorithm;
let frame = 0
let drawGroundTruthImageBackground ; // bu setuda true
// function preload() {
//     // ny pre load is here



//     //sketchRNN = ml5.sketchRNN('catpig');
// }

// function startDrawing() {
//   personDrawing = true;
//   x = mouseX;
//   y = mouseY;

// }

// function sketchGeneticStart() {
//   personDrawing = false;

//   // Perform RDP Line Simplication
//   const rdpPoints = [];
//   const total = seedPoints.length;
//   const start = seedPoints[0];
//   const end = seedPoints[total - 1];
//   rdpPoints.push(start);
//   rdp(0, total - 1, seedPoints, rdpPoints);
//   rdpPoints.push(end);
  
//   // Drawing simplified path
// //   background(255);
//   stroke(0);
//   strokeWeight(1);
//   beginShape();
//   noFill();
//   for (let v of rdpPoints) {
//     vertex(v.x, v.y); 
//   }
//   endShape();
  
//   x = rdpPoints[rdpPoints.length-1].x;
//   y = rdpPoints[rdpPoints.length-1].y;
  
  
//   seedPath = [];
//   // Converting to SketchRNN states
//   for (let i = 1; i < rdpPoints.length; i++) {
//     let strokePath = {
//       dx: rdpPoints[i].x - rdpPoints[i-1].x,
//       dy: rdpPoints[i].y - rdpPoints[i-1].y,
//       pen: 'down'
//     }
//     // line(x, y, x + strokePath.dx, y + strokePath.dy);
//     // x += strokePath.dx;
//     // y += strokePath.dy;
//     seedPath.push(strokePath);
//   }
  
  
  
  
//   //sketchRNN.generate(seedPath, gotStrokePath);
// }

function createTwoDimensionalArray(row, column) {
  let arr = []
  for (let index = 0; index < row; index++) {
    arr[index] = Array.from({length:column},(v,k) => 0)
  }
  return arr
}

function createRandomArray(populationSize, uSize, integerLimit) {
  let arr= []
  for (let index = 0; index < populationSize; index++) {
    arr[index] = Array.from({length:uSize},(v,k) => 0)
  }
  for (let i = 0; i < populationSize; i++) {
    for (let j = 0; j < uSize; j++) {
      arr[i][j] = Math.round(Math.random() * integerLimit)
    }
      
  }

  return arr
}



function findStartingPath() {
  
  drawings = [] // bu çizdirilen pathleri tutar 

  endPoint = seedPoints[0] 
  beginShape()
  stroke(0,255,0)
  //line(startingPoint.x, startingPoint.y, endPoint.x, endPoint.y)
  endShape()
  M = createTwoDimensionalArray(canvasHeight, canvasWeight) // ortam 
  // boş ortamı bilgi ile kullanılabilecek bilgi ile doldur.
  // kesişme durumlarında fitness güncellenevbilir.
  for (const point of seedPoints) {
    M[point.x][point.y] = 1
  }

  console.log(M)

  let distPath = {
    dx: startingPoint.x - endPoint.x,
    dy: endPoint.y - endPoint.y,
    pen: 'down'
  }
  
  P = 300 // populasyon büyüklüğü
  u = startPathDeviationLine*birdEyeDist(distPath)// bu değeri en kısa uzaklıktan fazla almak önemli boş dönerek mesafeyi öğrenme yetkisine sahip
  mu = 0.005 // mutasyon oranı
  G = 100 // nesil sayısı
  
  cross = 1 // crosover1 : tek noktadan 2: çift noktadan
  BK=P-P/4 // sonraki nesle kopyalanan en iyi birey sayısı
  B=createTwoDimensionalArray(P,u) // tüm bireyler debug amaçlı gittikleri yollar ile birlikte
  start = [startX, startY]
  end = [endPoint.x, endPoint.y]

  max_f1 = u + 1 // en çok alan gezmesi
  max_f2 = birdEyeDist(distPath) // vardığı yerin hedefe yakınlığı
  max_f3 = 180*(u-1) // yön değiştirme miktarı

  bb = Array.from({length:G},(v,k) => 0)

  ob = Array.from({length:G},(v,k) => 0)
  
  B=createRandomArray(P,u,7) // 0 ve 8 arasındaki sayılarla doldurur

  for (let i = 0; i < G; i++) {
    // bireylerin fitnesslarını hesapla
    f1 = Array.from({length:P},(v,k)=>0); 
    f2 = Array.from({length:P},(v,k)=>0);
    f3 = Array.from({length:P},(v,k)=>0);
    for (let j = 1; j < P; j++) {
      // bireyi çizdirmek için canvas
      M = createTwoDimensionalArray(canvasHeight,canvasWeight)
      unit=B[j]
      // bireyin hareketini oluştur

      kxy=start;
      M[kxy[0]][kxy[1]]=1 // başlangıçta
      // console.log(u)

      // for drawing path
      let draw = new Drawing();
      
    let areaWeCover = 0

      for (let k = 0; k < u; k++) {
        // console.log("iteration")
        // console.log(k)
        // console.log(unit)
        // console.log(unit[k])
        // console.log(move)
        // console.log(move[unit[k]])
        let p_kxy = []
        p_kxy[0]=kxy[0] + move[unit[k]][0]
        p_kxy[1]=kxy[1] + move[unit[k]][1]
        // console.log( kxy)
        if (p_kxy[0]<0 || p_kxy[1]<0 || p_kxy[0]>canvasHeight  || p_kxy[1]>canvasWeight) 
          continue
        kxy = p_kxy
        if (kxy[0] == 0 || kxy[1] == 0) {
          dd = 4
        }
        // console.log(M)
        if(M[kxy[0]][kxy[1]] == 0)
          areaWeCover++;
        M[kxy[0]][kxy[1]] = k + 1
        let pixel = new Pixel(kxy[0],kxy[1])
        // pixel.display()
        draw.addParticle(pixel)
      }

      drawings.push(draw)
      // // path oluşturuldu
      // // çizdirme işlemi animasyon
      // // draw.display()
      
      // // draw.clearDisplay()
      // draw.clearDisplay()

      // fitness fonksiyonlarını güncelleme
      // j populasyondaki kaçıncı birey olduğu
      // fitness 1 gezdiği alan maksimum olmalı
      f1[j] = u  - areaWeCover + 1 // maksimum gezdiğihücre sayısı
      // yakınlığı mimimum olmalı
      f2[j] = Math.sqrt(Math.abs(end[0] - kxy[0])*Math.abs(end[0] - kxy[0]) + Math.abs(end[1] - kxy[1]) * Math.abs(end[1] - kxy[1])) 
      
      // f3 yön değiştirme miktarı
      unit2 = unit.slice(1,unit.length)
      unit1 = unit.slice(0,unit.length-1)

      diff = unit.map((val,index,unit)=>val - unit[index+1] )
      diff.splice(diff.length-1,1)


 
      diff2 = diff.map(function(val) {
        let absVal = Math.abs(val * 45)
        if( absVal > 180 ) {
          return 360 - absVal
        }
        return absVal
      })

      sum = diff2.reduce((total, val) => total+val)
      
      f3[j] = sum
    

    }

    // fitness a göre seçim yap
    // f1 buyuk, f2 çok büyük, f3 yine büyk ama 1 e göre daha fazla
    // console.log(max_f1)
    // console.log(max_f2)
    // console.log(max_f3)


    // console.log("f1",f1)
    // console.log("f2",f2)
    // console.log("f3",f3)

    n_f1 = f1.map((val) => val/max_f1);
    n_f2 = f2.map((val) => val/max_f2);
    n_f3 = f3.map((val) => val/max_f3);

    // console.log("f1",n_f1)
    // console.log("f2",n_f2)
    // console.log("f3",n_f3)

    let w = [], sum_w=0;
    for (let i = 0; i < n_f1.length; i++) {
      // f1 gezdiği alan, f2 yakınlığı, f3 yön değiştrme miktarı
      w[i]=n_f1[i]+n_f2[i]+n_f3[i]
      // console.log(w[i])
      sum_w += w[i]
    }
    
    // console.log(w)

    n_w=w.map((val)=>1-val/sum_w)
    // console.log(w)

    sum_n_w = n_w.reduce((total, val) => total+val)
    n_w = n_w.map((val)=>val/sum_n_w)

    // console.log(n_w)
    // rulet tekeri seçimi
    
    var inds = Array.from(Array(P).keys())
                  .sort((a, b) => n_w[a] < n_w[b] ? -1 : (n_w[b] < n_w[a]) | 0)
    // console.log(inds)
    
    let rn_w = [] ; let sum_rn_w=0;
    for (let i = 0; i < P; i++) {
      rn_w[inds[i]] = i
      sum_rn_w += i
    }
    
    rn_w = rn_w.map((val)=>val/sum_rn_w) 
    // console.log(rn_w)
  
    assert(1 == round(rn_w.reduce((total, val)=> total+val)))
    let maxVal = Math.max(...rn_w)
    let bestInd = rn_w.indexOf(maxVal)

    bb[i] = w[bestInd]
    ob[i]= w.reduce((a, b) => a + b) / w.length;

    //sample creation function
    weight = function(arr) {
      return [].concat(...arr.map((obj) => Array(Math.ceil(obj * 100)).fill(obj)));
    }

    pickIdx = function(arr) {
      let weighted= weight(arr)
      return Math.floor(Math.random() * weighted.length)
    }
    // ick random with weight
    chosenUnits = []
    for (let i = 0; i < P; i++) {
      chosenUnits.push(pickIdx(rn_w))
    }

    // console.log(chosenUnits)
    YB = createTwoDimensionalArray(P,u) // yeni popülasyon
    // crossover
    for (let i = 0; i < P/2; i++) {
      b1=B[chosenUnits[i]]
      // console.log("b1",b1)
      b2 = B[chosenUnits[i]]
      if (cross=1) {
        cut=round((u-3)*random(1))+2; // 2 - (u - 1) arasi bir sayi
        // console.log("cut",cut)
        YB[i] =  b1.slice(0,cut).concat(b2.slice(cut,b2.length))
        YB[i+P/2] =  b1.slice(0,cut).concat(b2.slice(cut,b2.length))

        // console.log(YB)
        
      }
      
    }
    if (BK > 0) // B deki en iyi BK değeri YB ye kopyala
    {
      for (let i = BK+1; i < P ; i++) {
        YB[inds[i]] = B[inds[i]];
      }
    }

    // mutasyon uygula
    for (let i = 0; i < P; i++) {
      for(let j = 0 ; j < u ; j++) {

        if(random() < mu) {
          YB[i][j] = Math.round(7*random())
        }

      }

    }

  }
  return drawings
}


function assert(condition, message) {
  if (!condition) {
      throw message || "Assertion failed";
  }
}

// bu klas içinde efekt verisi tutulacak burada bireyin hareketi çizdirilecek 
// saniyesi ayarlanabilir olacak
// kodu içeride bloklayacak
// silerken de aynı noktaları beyaza boyayarak silme işlemini gerçekleştirecek
// bir tane de path değerleirni temizleyecek fonksiyon olacak
class Drawing{
  constructor() {
    this.particles = []
    this.hue = random(100)
  }

  addParticle(pixel) {
    this.particles.push(pixel)
  }


  clearDisplay() {
    for(let i = this.particles.length - 1 ; i >= 0 ; i-- ) {

        this.particles[i].clearDisplay()

    }
  }

  display() {
    for(let i = this.particles.length - 1 ; i >= 0 ; i-- ) {
      // console.log("draw dislay")
        this.particles[i].display()
    }
  }

}

class Pixel {
  constructor(positionX, positionY, hue) {
    this.positionX = positionX
    this.positionY = positionY
    this.hue = hue
  }



  clearDisplay() {
    set(this.positionX,this.positionY , color(backgroundColor))
    updatePixels()
  }

  display(other) {
    // console.log("dispaly ")
    set(this.positionX,this.positionY , 0)
    updatePixels()
  }
}




function birdEyeDist(path) {
  return Math.abs(path.dx) + Math.abs(path.dy); // manhatten dist 
}



function startGeneticAlgorithm(){
  console.log("starting genetic algorithm")
  console.log("seed path  ", seedPath)
  console.log("seed Points  ", seedPoints)

  drawings = findStartingPath()
 
  beginShape()
  stroke(255,0,0)
  strokeWeight(2)
  line(seedPoints[0].x,seedPoints[0].y,seedPath[0].dx+seedPoints[0].x,seedPath[0].dy+seedPoints[0].y)
  endShape()
  
  drawingByAlgorithm = true
}

function preload(){
  img = loadImage('assets/rect.png')
  
}

function setup() {
  startingPoint = createVector(startX,startY)
  // img = loadImage('')
  img.loadPixels()

  let index=0

  for (let i = 0; i < img.pixels.length; i+=4) {
    console.log(Math.round(index/width), index % width)
    console.log(img.pixels[i], img.pixels[i+1],img.pixels[i+2], img.pixels[i+3])
    let c = color(img.pixels[i], img.pixels[i+1],img.pixels[i+2], img.pixels[i+3])
    set( Math.round(index/width), index % width, c)
    
    index++
  }

  halfImage = 4 * img.width * img.height / 2;
  drawGroundTruthImageBackground = true 
  console.log(img)

  // for (let i = 0; i < height; i++) {
  //   for (let j = 0; j < width; j++) {
  //     console.log(img.pixels[i*width+j])
  //     set(i, j, img.pixels[i*width+j])
  //   }
    
  // }
  
  // for (let i = 0; i < halfImage; i++) {
  //   img.pixels[i + halfImage] = img.pixels[i];
  // }

  // img.updatePixels();

  // for (let i = 0; i < 50; i++) {
  //   for (let j = 0; j < 50; j++) {
  //     // let c = get(i, j);
  //     console.log(img.pixels[i*50+j])
  //     // console.log(c)     
  //   }
  //   console.log('\n')
  // }

  let canvas = createCanvas(50, 50);
  // img.resize(canvasSize,canvasSize)
  // image(img, 0 , 0)


  // canvas.mousePressed(startDrawing);
  // canvas.mouseReleased(sketchGeneticStart);
  // hillClimbingbutton = createButton('Tepe Tırmanma');
  // hillClimbingbutton.mousePressed(startHillClimbing);

  geneticAlgorithmButton = createButton('Genetik Algoritma');
  geneticAlgorithmButton.mousePressed(startGeneticAlgorithm);

  // background(img);

  

  // x = width / 2;
  // y = height / 2;

  //sketchRNN.generate(gotStrokePath);
  console.log('model loaded');
}


function gotStrokePath(error, strokePath) {
  //console.error(error);
  //console.log(strokePath);
  currentStroke = strokePath;
}

function draw() {

  if(drawGroundTruthImageBackground) {
    
    updatePixels();
    
  }
  

  // image(img, 0, 0);


  // if (personDrawing) {
  //   // let strokePath = {
  //   //   dx: mouseX - pmouseX,
  //   //   dy: mouseY - pmouseY,
  //   //   pen: 'down'
  //   // }
  //   // line(x, y, x + strokePath.dx, y + strokePath.dy);
  //   // x += strokePath.dx;
  //   // y += strokePath.dy;
  //   // seedPath.push(strokePath);

  //   line(mouseX, mouseY, pmouseX, pmouseY);
  //   seedPoints.push(createVector(mouseX, mouseY));
  // }
  if(drawingByAlgorithm)
  {
    
    drawings[drawings.length-1].display()
    noLoop()

    drawingByAlgorithm=false; // clear phase
  }
  else if(drawingByAlgorithm == false){
    drawings[frame].clearDisplay()
    frame++;
    if(frame == drawings.length)
      drawingByAlgorithm = undefined
    else
      drawingByAlgorithm = true
  }
  else {
    console.log("ne oluyor burada")
  }
  
}