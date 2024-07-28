"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Point {
    move(vector) {
        return new Point(this.x + vector.x, this.y + vector.y);
    }
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
class Vector2D {
    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }
    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}
class Body {
    moveBody(vector) {
        this.position = this.position.move(vector);
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }
    applyForce(force) {
        this.acceleration = this.acceleration.add(force.multiply(1 / this.mass));
    }
    update(timeStep) {
        this.velocity = this.velocity.add(this.acceleration.multiply(timeStep));
        this.position = this.position.move(this.velocity.multiply(timeStep));
        this.acceleration = new Vector2D();
    }
    constructor(element) {
        this.velocity = new Vector2D();
        this.acceleration = new Vector2D();
        this.element = element;
        this.mass = element.offsetWidth * element.offsetHeight;
        this.position = new Point(element.offsetLeft, element.offsetTop);
    }
}
class Engine {
    logger(logging) {
        if (logging) {
            this.bodies.forEach(body => {
                console.log(`Body: ${body.element.className}`);
                console.log(`Position: (${body.position.x}, ${body.position.y})`);
                console.log(`Velocity: (${body.velocity.x}, ${body.velocity.y})`);
                console.log(`Acceleration: (${body.acceleration.x}, ${body.acceleration.y})`);
            });
        }
    }
    applyGravity(gravityConstant) {
        this.bodies.forEach(body => {
            if (body.position.y + body.element.offsetHeight < root.offsetHeight - 24) {
                body.applyForce(new Vector2D(0, gravityConstant * body.mass));
            }
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bodies.forEach(body => {
                if (body.position.y + body.element.offsetHeight < root.offsetHeight - 24) {
                    body.update(this.timeStep);
                    body.element.style.left = `${body.position.x}px`;
                    body.element.style.top = `${body.position.y}px`;
                }
            });
            this.logger(this.logging);
            yield new Promise(handler => setTimeout(handler, this.timeStep));
        });
    }
    constructor(bodies, timeStep, logging = false) {
        this.bodies = bodies;
        this.timeStep = timeStep;
        this.logging = logging;
    }
}
const gravityConstant = 20;
const timeStep = 0.1;
const logging = true;
const root = document.getElementsByTagName('body')[0];
const elements = document.getElementsByTagName('div');
const engine = new Engine(Array.prototype.map.call(elements, (element) => new Body(element)), timeStep, logging);
document.addEventListener('DOMContentLoaded', (event) => __awaiter(void 0, void 0, void 0, function* () {
    function simulate() {
        return __awaiter(this, void 0, void 0, function* () {
            engine.applyGravity(gravityConstant);
            yield engine.update();
            requestAnimationFrame(simulate);
        });
    }
    yield simulate();
}));
