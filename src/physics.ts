export namespace Physics {
    interface Plane {
        x: number;
        y: number;
    }

    export class Point implements Plane {
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

    export class Vector2D implements Plane {
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

    export class Body {
        element: HTMLElement;
        mass: number;
        position: Point;
        velocity = new Vector2D();
        acceleration = new Vector2D();

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

    export class Engine {
        bodies: Body[];
        timeStep: number;

        applyGravity(gravityConstant: number) {
            this.bodies.forEach(body => {
                body.applyForce(new Vector2D(0, gravityConstant * body.mass * -1));
            });
        }

        async update() {
            this.bodies.forEach(body => {
                body.update(this.timeStep);
                // body.element.style.left = `${body.position.x}px`;
                // body.element.style.top = `${body.position.y}px`;
            });
            await new Promise(handler => setTimeout(handler, this.timeStep));
        }

        constructor(bodies: Body[], timeStep: number) {
            this.bodies = bodies;
            this.timeStep = timeStep;
        }
    }
}