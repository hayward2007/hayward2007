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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Physics = void 0;
var Physics;
(function (Physics) {
    class Point {
        move(vector) {
            return new Point(this.x + vector.x, this.y + vector.y);
        }
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    }
    Physics.Point = Point;
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
    Physics.Vector2D = Vector2D;
    class Body {
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
    Physics.Body = Body;
    class Engine {
        applyGravity(gravityConstant) {
            this.bodies.forEach(body => {
                body.applyForce(new Vector2D(0, gravityConstant * body.mass * -1));
            });
        }
        update() {
            return __awaiter(this, void 0, void 0, function* () {
                this.bodies.forEach(body => {
                    body.update(this.timeStep);
                    // body.element.style.left = `${body.position.x}px`;
                    // body.element.style.top = `${body.position.y}px`;
                });
                yield new Promise(handler => setTimeout(handler, this.timeStep));
            });
        }
        constructor(bodies, timeStep) {
            this.bodies = bodies;
            this.timeStep = timeStep;
        }
    }
    Physics.Engine = Engine;
})(Physics || (exports.Physics = Physics = {}));
