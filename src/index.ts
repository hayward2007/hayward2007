interface Plane {
    x: number;
    y: number;
}

class Point implements Plane {
    x: number;
    y: number;

    move(vector: Vector2D) {
        return new Point(this.x + vector.x, this.y + vector.y);
    }

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class Vector2D implements Plane {
    x: number;
    y: number;

    add(vector: Vector2D) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector: Vector2D) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar: number) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class Body {
    element: HTMLElement;
    mass: number;
    position: Point;
    velocity = new Vector2D();
    acceleration = new Vector2D();

    moveBody(vector: Vector2D) {
        this.position = this.position.move(vector);
        this.element.style.left = `${this.position.x}px`;
        this.element.style.top = `${this.position.y}px`;
    }

    applyForce(force: Vector2D) {
        this.acceleration = this.acceleration.add(force.multiply(1 / this.mass));
    }

    update(timeStep: number) {
        this.velocity = this.velocity.add(this.acceleration.multiply(timeStep));
        this.position = this.position.move(this.velocity.multiply(timeStep));
        this.acceleration = new Vector2D();
    }

    constructor(element: HTMLElement) {
        this.element = element;
        this.mass = element.offsetWidth * element.offsetHeight;
        this.position = new Point(element.offsetLeft, element.offsetTop);
    }
}

class Engine {
    bodies: Body[];
    timeStep: number;
    logging: boolean;

    logger(logging: boolean) {
        if (logging) {
            this.bodies.forEach(body => {
                console.log(`Body: ${body.element.className}`);
                console.log(`Position: (${body.position.x}, ${body.position.y})`);
                console.log(`Velocity: (${body.velocity.x}, ${body.velocity.y})`);
                console.log(`Acceleration: (${body.acceleration.x}, ${body.acceleration.y})`);
            });
        }
    }

    applyGravity(gravityConstant: number) {
        this.bodies.forEach(body => {
            if (body.position.y + body.element.offsetHeight < root.offsetHeight - 24) {
                body.applyForce(new Vector2D(0, gravityConstant * body.mass));
            }
        });
    }

    async update() {
        this.bodies.forEach(body => {
            if (body.position.y + body.element.offsetHeight < root.offsetHeight - 24) {
                body.update(this.timeStep);
                body.element.style.left = `${body.position.x}px`;
                body.element.style.top = `${body.position.y}px`;
            }
        });
        this.logger(this.logging);
        await new Promise(handler => setTimeout(handler, this.timeStep));
    }

    constructor(bodies: Body[], timeStep: number, logging = false) {
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
const engine = new Engine(Array.prototype.map.call(elements, (element) => new Body(element)) as Body[], timeStep, logging);


document.addEventListener('DOMContentLoaded', async (event) => {
    async function simulate() {
        engine.applyGravity(gravityConstant);
        await engine.update();
        requestAnimationFrame(simulate);
    }

    await simulate();
});