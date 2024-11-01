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
class Coordinate2D {
    add(vector) {
        return new Coordinate2D(this.x + vector.x, this.y + vector.y);
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
    applyForce(force) {
        this.acceleration = this.acceleration.add(force.multiply(1 / this.mass));
    }
    // move the div
    update(timeStep) {
        if (this.collider.isFloor(this)) {
            this.velocity = new Vector2D(this.velocity.x, 0);
        }
        else {
            this.velocity = this.velocity.add(this.acceleration.multiply(timeStep));
            this.position = this.position.add(this.velocity.multiply(timeStep));
            // if body's position goes beyond the floor, set it to the floor
            if (this.position.y + this.element.offsetHeight >= this.collider.root.offsetHeight - this.collider.padding) {
                // this.velocity = this.velocity.add(this.acceleration.multiply(timeStep));
                this.position = this.position.add(this.velocity.multiply(timeStep * -1));
                this.position = this.position.add(this.velocity.multiply(timeStep * -1));
                // this.position = new Coordinate2D(this.position.x, this.collider.root.offsetHeight - this.element.offsetHeight - this.collider.padding);
            }
            this.element.style.left = `${this.position.x}px`;
            this.element.style.top = `${this.position.y}px`;
            this.acceleration = new Vector2D();
        }
    }
    constructor(element) {
        this.isDragging = false;
        this.velocity = new Vector2D();
        this.acceleration = new Vector2D();
        this.position = new Coordinate2D();
        this.collider = new CollisionDetector();
        let offsetX, offsetY;
        // element.addEventListener('mousedown', (e: any) => {
        //     this.isDragging = true;
        //     offsetX = e.clientX - element.getBoundingClientRect().left;
        //     offsetY = e.clientY - element.getBoundingClientRect().top;
        //     document.body.style.userSelect = 'none';
        // });
        // element.addEventListener('mousemove', (e: any) => {
        //     if (this.isDragging) {
        //         const left = e.clientX - offsetX;
        //         const top = e.clientY - offsetY;
        //         if (!this.collider.isWall(this) && left >= 0 && left + element.offsetWidth <= document.body.clientWidth) {
        //             element.style.left = `${left}px`;
        //             this.position.x = left;
        //         }
        //         if (top >= 0 && top + element.offsetHeight <= document.body.clientHeight) {
        //             element.style.top = `${top}px`;
        //             this.position.y = top;
        //         }
        //     }
        // });
        // element.addEventListener('mouseup', () => {
        //     this.isDragging = false;
        //     document.body.style.userSelect = 'auto';
        // });
        this.element = element;
        this.position = new Coordinate2D(element.offsetLeft, element.offsetTop);
        this.mass = element.offsetWidth * element.offsetHeight;
    }
}
class CollisionDetector {
    constructor() {
        this.root = document.getElementsByTagName('body')[0];
        this.padding = 12;
    }
    isFloor(body) {
        return body.element.offsetTop + body.element.offsetHeight >= this.root.offsetHeight - this.padding;
    }
    isWall(body) {
        return body.element.offsetLeft <= 0 || body.element.offsetLeft + body.element.offsetWidth >= this.root.offsetWidth;
    }
}
class Engine {
    logger() {
        this.bodies.forEach(body => {
            console.log(`Body: ${body.element.className}`);
            console.log(`Position: (${body.position.x}, ${body.position.y})`);
            console.log(`Velocity: (${body.velocity.x}, ${body.velocity.y})`);
            console.log(`Acceleration: (${body.acceleration.x}, ${body.acceleration.y})`);
        });
    }
    applyGravity() {
        this.bodies.forEach(body => {
            if (!this.collider.isFloor(body) && !body.isDragging) {
                body.applyForce(new Vector2D(0, this.gravityConstant * body.mass));
            }
            else {
                body.velocity = new Vector2D();
            }
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bodies.forEach(body => {
                if (!this.collider.isFloor(body) && !body.isDragging) {
                    body.update(this.timeStep);
                }
                else {
                    body.velocity = new Vector2D();
                }
            });
            if (this.logging)
                this.logger();
            yield new Promise(handler => setTimeout(handler, this.timeStep));
        });
    }
    constructor(bodies) {
        this.logging = true;
        // constants
        this.timeStep = 0.1;
        this.gravityConstant = 20;
        this.collider = new CollisionDetector();
        this.bodies = bodies;
    }
}
const elements = document.getElementsByTagName('div');
const engine = new Engine(Array.prototype.map.call(elements, (element) => new Body(element)));
document.addEventListener('DOMContentLoaded', (event) => __awaiter(void 0, void 0, void 0, function* () {
    function simulate() {
        return __awaiter(this, void 0, void 0, function* () {
            engine.applyGravity();
            yield engine.update();
            requestAnimationFrame(simulate);
        });
    }
    yield simulate();
}));