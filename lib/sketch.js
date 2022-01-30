"use strict";

// Initialize variables.

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var finishLine = void 0;
var obstacles = void 0;
var population = void 0;
var windowDiagonal = void 0;

// Initialize constants.
var fuel = 1;
var populationSize = 150;
var mutationRate = 0.02;
var carWidth = 0.05;
var carHeight = 0.025;
var maxAcceleration = 1;
var maxBrake = -1;
var steeringAngle = 0.01;

var FinishLine = function () {
  function FinishLine() {
    _classCallCheck(this, FinishLine);

    this.startX = windowWidth * 0.9;
    this.startY = 0;
    this.width = windowWidth * 0.1;
    this.height = windowHeight * 0.1;
    this.center = createVector(windowWidth, 0);
  }

  _createClass(FinishLine, [{
    key: 'checkIfFinished',
    value: function checkIfFinished(car) {
      if (car.location.x > this.startX && car.location.y < this.height) {
        car.finished();
      }
    }
  }, {
    key: 'render',
    value: function render() {
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
  }]);

  return FinishLine;
}();

var Wall = function () {
  function Wall(startX, startY, endX, endY) {
    _classCallCheck(this, Wall);

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }

  _createClass(Wall, [{
    key: 'render',
    value: function render() {
      line(this.startX, this.startY, this.endX, this.endY);
    }
  }]);

  return Wall;
}();

var Obstacles = function () {
  function Obstacles() {
    _classCallCheck(this, Obstacles);

    this.walls = [];
  }

  _createClass(Obstacles, [{
    key: 'addWall',
    value: function addWall(wall) {
      this.walls.push(wall);
    }
  }, {
    key: 'checkCollissions',
    value: function checkCollissions(car) {
      for (var i = 0; i < this.walls.length; i++) {
        if (car.location.x >= this.walls[i].startX - 5 && car.location.x <= this.walls[i].endX + 5 && car.location.y >= this.walls[i].startY - 5 && car.location.y <= this.walls[i].endY + 5) {
          car.collided();
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      for (var i = 0; i < this.walls.length; i++) {
        this.walls[i].render();
      }
    }
  }]);

  return Obstacles;
}();

var DNA = function DNA() {
  _classCallCheck(this, DNA);

  this.pedalDNA = [];
  this.wheelDNA = [];
  for (var i = 0; i < fuel; i++) {
    this.pedalDNA[i] = round(random(maxBrake, maxAcceleration));
    this.wheelDNA[i] = random(-steeringAngle, steeringAngle);
  }
  this.wheelDNA[0] = random(2 * PI);
};

var Car = function () {
  function Car() {
    _classCallCheck(this, Car);

    this.location = createVector(windowWidth * 0.05, windowHeight * 0.9 - 1);
    this.velocity = createVector(0, 0);
    this.DNA = new DNA();
    this.fuelUsed = 0;
    this.hasCollided = false;
    this.hasFinished = false;
    this.fitness = 0;
  }

  _createClass(Car, [{
    key: 'collided',
    value: function collided() {
      if (!this.hasFinished) {
        this.hasCollided = true;
        population.collission();
      }
    }
  }, {
    key: 'finished',
    value: function finished() {
      if (!this.hasCollided) {
        this.hasFinished = true;
        population.finished();
      }
    }
  }, {
    key: 'calculateFitness',
    value: function calculateFitness() {
      var distance = p5.Vector.dist(this.location, finishLine.center);
      this.fitness = (windowDiagonal - distance) * (windowDiagonal - distance) / (windowDiagonal * windowDiagonal);
      if (this.hasFinished) {
        this.fitness = 1;
      }
    }
  }, {
    key: 'crossover',
    value: function crossover(otherCar) {
      var child = new Car();
      for (var i = 0; i < fuel; i++) {
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
  }, {
    key: 'mutate',
    value: function mutate() {
      for (var i = 0; i < fuel; i++) {
        if (random() < mutationRate) {
          this.DNA.pedalDNA[i] = round(random(maxBrake, maxAcceleration));
        }
        if (random() < mutationRate) {
          this.DNA.wheelDNA[i] = random(-steeringAngle, steeringAngle);
        }
      }
    }
  }, {
    key: 'race',
    value: function race() {
      if (!this.hasCollided && !this.hasFinished) {
        var acceleration = this.velocity.copy().normalize();
        if (acceleration.x === 0 && acceleration.y === 0) {
          acceleration.set(1, 0);
        }
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
  }]);

  return Car;
}();

var Population = function () {
  function Population() {
    _classCallCheck(this, Population);

    this.cars = [];
    this.children = [];
    for (var i = 0; i < populationSize; i++) {
      this.cars[i] = new Car();
    }
    this.fuelUsed = 0;
    this.carsCrashed = 0;
    this.carsFinished = 0;
    this.generationCount = 0;
    this.averageFitness = 0;
  }

  _createClass(Population, [{
    key: 'collission',
    value: function collission() {
      this.carsCrashed++;
    }
  }, {
    key: 'finished',
    value: function finished() {
      this.carsFinished++;
    }
  }, {
    key: 'evaluateFitness',
    value: function evaluateFitness() {
      var sumFitness = 0;
      for (var i = 0; i < populationSize; i++) {
        this.cars[i].calculateFitness();
        sumFitness += this.cars[i].fitness * 100;
      }
      this.averageFitness = ceil(sumFitness / populationSize);
    }
  }, {
    key: 'reproduce',
    value: function reproduce() {
      this.children = [];
      var cloneCount = 0;
      for (var i = 0; i < populationSize; i++) {
        var parent1 = false;
        var parent2 = false;
        var randomIndex1 = 0;
        var randomIndex2 = 0;
        while (!parent1) {
          randomIndex1 = floor(random(populationSize));
          if (random() < this.cars[randomIndex1].fitness) {
            parent1 = this.cars[randomIndex1];
          }
        }
        while (!parent2) {
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
  }, {
    key: 'live',
    value: function live() {
      fill('#2a4747');
      for (var i = 0; i < populationSize; i++) {
        this.cars[i].race();
      }
      this.fuelUsed++;
      fill('#F3F2F2');
      text('Fuel Used: ' + this.fuelUsed + '/' + fuel, 10, 20);
      text('Generation: ' + this.generationCount, 10, 35);
      text('Population Size: ' + populationSize, 10, 50);
      text('Cars Crashed: ' + this.carsCrashed, 10, 65);
      text('Cars Finished: ' + this.carsFinished, 10, 80);
      text('Mutation Rate: ' + mutationRate * 100 + '%', 10, 95);
      text('Average Fitness: ' + this.averageFitness + '%', 10, 110);
      if (this.fuelUsed >= fuel || this.carsCrashed + this.carsFinished >= populationSize) {
        text("Cloning", windowWidth / 2 - 50, windowHeight / 2 - 10);
        this.evaluateFitness();
        this.reproduce();
      }
    }
  }]);

  return Population;
}();

function setup() {
  console.log(windowWidth);
  console.log(windowHeight);
  createCanvas(windowWidth, windowHeight);
  stroke('#F3F2F2');
  fill('#F3F2F2');
  background('#2a4747');
  finishLine = new FinishLine();
  var diagonalVector = createVector(0, windowHeight);
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