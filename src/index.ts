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
    isDragging = false;

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
        let offsetX: number, offsetY: number;
        element.addEventListener('mousedown', (e: any) => {
            this.isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            document.body.style.userSelect = 'none';
        });
        
        document.addEventListener('mousemove', (e: any) => {
            if (this.isDragging) {
                const left = e.clientX - offsetX;
                const top = e.clientY - offsetY;
                if (left >= 0 && left + element.offsetWidth <= document.body.clientWidth) {
                    element.style.left = `${left}px`;
                }
                if (top >= 0 && top + element.offsetHeight <= document.body.clientHeight) {
                    element.style.top = `${top}px`;
                }
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            document.body.style.userSelect = 'auto';
        });

        this.element = element;
        this.mass = element.offsetWidth * element.offsetHeight;
        this.position = new Point(element.offsetLeft, element.offsetTop);
    }
}

class CollisionDetector {
    root = document.getElementsByTagName('body')[0];
    padding = 12;

    detectFloor(body: Body) {
        return body.element.offsetTop + body.element.offsetHeight > this.root.offsetHeight - this.padding;
    }
}

class Engine {
    bodies: Body[];
    logging = true;
    
    // constants
    timeStep = 0.1;
    gravityConstant = 20;

    collider = new CollisionDetector();

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
            if (!this.collider.detectFloor(body) && !body.isDragging) {
                body.applyForce(new Vector2D(0, this.gravityConstant * body.mass));
            }
        });
    }

    async update() {
        this.bodies.forEach(body => {
            if (!this.collider.detectFloor(body) && !body.isDragging) {
                body.update(this.timeStep);
                body.element.style.left = `${body.position.x}px`;
                body.element.style.top = `${body.position.y}px`;
            }
        });

        if (this.logging) this.logger();

        await new Promise(handler => setTimeout(handler, this.timeStep));
    }

    constructor(bodies: Body[]) {
        this.bodies = bodies;
    }
}

const elements = document.getElementsByTagName('div');
const engine = new Engine(Array.prototype.map.call(elements, (element) => new Body(element)) as Body[]);

document.addEventListener('DOMContentLoaded', async (event) => {
    async function simulate() {
        engine.applyGravity();
        await engine.update();
        requestAnimationFrame(simulate);
    }

    await simulate();
});