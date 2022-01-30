"use strict"

// Initialize variables.
let finishLine;
let obstacles;
let population;
let windowDiagonal;

// Initialize constants.
let fuel = 1;
const populationSize = 150;
const mutationRate = 0.02;
let carWidth = 0.05;
let carHeight = 0.025;
const maxAcceleration = 1;
const maxBrake = -1;
const steeringAngle = 0.01;

class FinishLine {
  constructor() {
    this.startX = windowWidth * 0.9;
    this.startY = 0;
    this.width = windowWidth * 0.1;
    this.height = windowHeight * 0.1;
    this.center = createVector(windowWidth, 0);
  }
  
  checkIfFinished(car) {
    if (car.location.x > this.startX && car.location.y < this.height) {
      car.finished();
    }
  }
  
  render() {
    rect(this.startX, this.startY, this.width, this.height);
    fill('#2a4747');
    rect(this.startX, this.startY, this.width / 4, this.height / 4);
    rect(this.startX + this.width / 4 * 2, this.startY, this.width / 4, this.height / 4);
    rect(this.startX + this.width / 4, this.startY + this.height / 4, this.width / 4, this.height / 4);
    rect(this.startX + this.width / 4 * 3, this.startY + this.height / 4, this.width / 4, this.height / 4);
    rect(this.startX, this.startY + this.height / 4 * 2, this.width / 4, this.height / 4);
    rect(this.startX + this.width / 4 * 2, this.startY + this.height / 4 * 2, this.width / 4, this.height / 4);
    rect(this.startX + this.width / 4, this.startY + this.height / 4 * 3, this.width / 4, this.height / 4);
    rect(this.startX + this.width / 4 * 3, this.startY + this.height / 4 * 3, this.width / 4, this.height / 4);
  }
}

class Wall {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }
  
  render() {
    line(this.startX, this.startY, this.endX, this.endY);
  }
}

class Obstacles {
  constructor() {
    this.walls = [];
  }
  
  addWall(wall) {
    this.walls.push(wall);
  }
  
  checkCollissions(car) {
    for (let i = 0; i < this.walls.length; i++) {
      if ((car.location.x >= this.walls[i].startX - 5 && car.location.x <= this.walls[i].endX + 5) &&
        (car.location.y >= this.walls[i].startY - 5 && car.location.y <= this.walls[i].endY + 5)) {
        car.collided();
      }
    }
  }
  
  render() {
    for (let i = 0; i < this.walls.length; i++) {
      this.walls[i].render();
    }
  }
}

class DNA {
  constructor() {
    this.pedalDNA = [];
    this.wheelDNA = [];
    for (let i = 0; i < fuel; i++) {
      this.pedalDNA[i] = round(random(maxBrake, maxAcceleration));
      this.wheelDNA[i] = random(-steeringAngle, steeringAngle);
    }
    this.wheelDNA[0] = random(2 * PI);
  }
}

class Car {
  constructor() {
    this.location = createVector(windowWidth * 0.05, windowHeight * 0.9 - 1);
    this.velocity = createVector(0, 0);
    this.DNA = new DNA();
    this.fuelUsed = 0;
    this.hasCollided = false;
    this.hasFinished = false;
    this.fitness = 0;
  }
  
  collided() {
    if (!this.hasFinished) {
      this.hasCollided = true;
      population.collission();
    }
  }
  
  finished() {
    if (!this.hasCollided) {
      this.hasFinished = true;
      population.finished();
    }
  }
  
  calculateFitness() {
    const distance = p5.Vector.dist(this.location, finishLine.center);
    this.fitness = ((windowDiagonal -  distance) * (windowDiagonal -  distance)) / (windowDiagonal * windowDiagonal);
    if (this.hasFinished) {
      this.fitness = 1;
    }
  }
  
  crossover(otherCar) {
    const child = new Car();
    for (let i = 0; i < fuel; i++) {
      if (random() < 0.5) {
        child.DNA.pedalDNA[i] = this.DNA.pedalDNA[i];
      } else {
        child.DNA.pedalDNA[i] = otherCar.DNA.pedalDNA[i];
      }
      if (random() < 0.5) {
        child.DNA.wheelDNA[i] = this.DNA.wheelDNA[i];
      } else {
        child.DNA.wheelDNA[i] = otherCar.DNA.wheelDNA[i];
      }
    }
    return child;
  }
  
  mutate() {
    for (let i = 0; i < fuel; i++) {
      if (random() < mutationRate) {
        this.DNA.pedalDNA[i] = round(random(maxBrake, maxAcceleration));
      }
      if (random() < mutationRate) {
        this.DNA.wheelDNA[i] = random(-steeringAngle, steeringAngle);
      }
    }
  }
  
  race() {
    if (!this.hasCollided && !this.hasFinished) {
      const acceleration = this.velocity.copy().normalize();
      if (acceleration.x === 0 && acceleration.y === 0) { acceleration.set(1, 0) }
      acceleration.mult(this.DNA.pedalDNA[this.fuelUsed]);
      acceleration.rotate(this.DNA.wheelDNA[this.fuelUsed]);
      this.velocity.add(acceleration);
      this.velocity.limit(9);
      this.location.add(this.velocity);
      this.fuelUsed++;
      obstacles.checkCollissions(this);
      finishLine.checkIfFinished(this);
    }
    push();
    translate(this.location.x, this.location.y);
    rotate(this.velocity.heading());
    rect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);
    pop();
  }
}

class Population {
  constructor() {
    this.cars = [];
    this.children = [];
    for (let i = 0; i < populationSize; i++) {
      this.cars[i] = new Car();
    }
    this.fuelUsed = 0;
    this.carsCrashed = 0;
    this.carsFinished = 0;
    this.generationCount = 0;
    this.averageFitness = 0;
  }
  
  collission() {
    this.carsCrashed++;
  }
  
  finished() {
    this.carsFinished++;
  }
  
  evaluateFitness() {
    let sumFitness = 0;
    for (let i = 0; i < populationSize; i++) {
      this.cars[i].calculateFitness();
      sumFitness += this.cars[i].fitness * 100;
    }
    this.averageFitness = ceil(sumFitness / populationSize);
  }
  
  reproduce() {
    this.children = [];
    let cloneCount = 0;
    for (let i = 0; i < populationSize; i++) {
      let parent1 = false;
      let parent2 = false;
      let randomIndex1 = 0;
      let randomIndex2 = 0;
      while(!parent1) {
        randomIndex1 = floor(random(populationSize));
        if (random() < this.cars[randomIndex1].fitness) {
          parent1 = this.cars[randomIndex1];
        }
      }
      while(!parent2) {
        randomIndex2 = floor(random(populationSize));
        if (random() < this.cars[randomIndex2].fitness && randomIndex1 !== randomIndex2) {
          parent2 = this.cars[randomIndex2];
        }
      }
      this.children[i] = parent1.crossover(parent2);
      this.children[i].mutate;
    }
    this.cars = this.children;
    this.fuelUsed = 0;
    this.carsCrashed = 0;
    this.carsFinished = 0;
    this.generationCount++;
  }
  
  live() {
    fill('#2a4747');
    for (let i = 0; i < populationSize; i++) {
      this.cars[i].race();
    }
    this.fuelUsed++;
    fill('#F3F2F2');
    text('Fuel Used: ' + this.fuelUsed + '/' + fuel, 10, 20);
    text('Generation: ' + this.generationCount, 10, 35);
    text('Population Size: ' + populationSize, 10, 50);
    text('Cars Crashed: ' + this.carsCrashed, 10, 65);
    text('Cars Finished: ' + this.carsFinished, 10, 80);
    text('Mutation Rate: ' + (mutationRate * 100) + '%', 10, 95);
    text('Average Fitness: ' + this.averageFitness + '%', 10, 110);
    if (this.fuelUsed >= fuel || (this.carsCrashed + this.carsFinished) >=  populationSize) {
      text("Cloning", (windowWidth / 2) - 50, (windowHeight / 2) - 10);
      this.evaluateFitness();
      this.reproduce();
    }
  }
}

function setup() {
  console.log(windowWidth);
  console.log(windowHeight);
  createCanvas(windowWidth, windowHeight);
  stroke('#F3F2F2');
  fill('#F3F2F2');
  background('#2a4747');
  finishLine = new FinishLine();
  const diagonalVector = createVector(0, windowHeight);
  windowDiagonal = p5.Vector.dist(diagonalVector, finishLine.center);
  fuel = fuel * floor(windowDiagonal);
  carWidth = carWidth * windowWidth;
  carHeight = carHeight * windowWidth;
  obstacles = new Obstacles();
  // obstacles.addWall(new Wall(0, windowHeight * 0.8, windowWidth * 0.5, windowHeight * 0.8));
  obstacles.addWall(new Wall(0, 0, 0, windowHeight));
  obstacles.addWall(new Wall(0, windowHeight - 1, windowWidth, windowHeight - 1));
  obstacles.addWall(new Wall(windowWidth - 1, 0, windowWidth - 1, windowHeight));
  obstacles.addWall(new Wall(0, 0, windowWidth, 0));
  population = new Population();
}

function draw() {
  background('#2a4747');
  obstacles.render();
  finishLine.render();
  population.live();
}
