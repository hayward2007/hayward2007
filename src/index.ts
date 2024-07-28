// import { Physics } from "./physics";
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
                console.log(`Body: ${body.element.id}`);
                console.log(`Position: (${body.position.x}, ${body.position.y})`);
                console.log(`Velocity: (${body.velocity.x}, ${body.velocity.y})`);
                console.log(`Acceleration: (${body.acceleration.x}, ${body.acceleration.y})`);
            });
        }
    }

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
        this.logger(this.logging);
        await new Promise(handler => setTimeout(handler, this.timeStep));
    }

    constructor(bodies: Body[], timeStep: number, logging = false) {
        this.bodies = bodies;
        this.timeStep = timeStep;
        this.logging = logging;
    }
}

const gravityConstant = 9.8;
const timeStep = 0.1;
const logging = true;

const elements = document.getElementsByTagName('div');
const engine = new Engine(Array.prototype.map.call(elements, (element) => new Body(element)) as Body[], timeStep, logging);


document.addEventListener('DOMContentLoaded', async (event) => {
    async function simulate() {
        engine.applyGravity(gravityConstant);
        await engine.update();
        // requestAnimationFrame(simulate);
    }

    await simulate();
    

    // Array.prototype.forEach.call(elements,(element) => {
    //     let isDragging = false;
    //     let offsetX: number, offsetY: number;

    //     element.addEventListener('mousedown', (e: any) => {
    //         isDragging = true;
    //         offsetX = e.clientX - element.getBoundingClientRect().left;
    //         offsetY = e.clientY - element.getBoundingClientRect().top;
    //         document.body.style.userSelect = 'none';
    //     });

    //     document.addEventListener('mousemove', (e: any) => {
    //         if (isDragging) {
    //             const left = e.clientX - offsetX;
    //             const top = e.clientY - offsetY;
                
    //             if (left >= 0 && left + element.offsetWidth <= document.body.clientWidth) {
    //                 element.style.left = `${left}px`;
    //             }
    //             if (top >= 0 && top + element.offsetHeight <= document.body.clientHeight) {
    //                 element.style.top = `${top}px`;
    //             }
    //         }
    //     });

    //     document.addEventListener('mouseup', () => {
    //         isDragging = false;
    //         document.body.style.userSelect = 'auto';
    //     });

    //     function animate() {
    //         if(!isDragging) {

    //         }

    //         requestAnimationFrame(animate);
    //     }

    //     animate();
    // });
});


            // const draggable = document.getElementsByTagName('div')[0];

            // let isDragging = false;
            // let offsetX, offsetY;

            // draggable.addEventListener('mousedown', (e) => {
            //     isDragging = true;
            //     offsetX = e.clientX - draggable.getBoundingClientRect().left;
            //     offsetY = e.clientY - draggable.getBoundingClientRect().top;
            //     document.body.style.userSelect = 'none'; // Prevent text selection
            // });

            // document.addEventListener('mousemove', (e) => {
            //     if (isDragging) {
            //         draggable.style.left = `${e.clientX - offsetX}px`;
            //         draggable.style.top = `${e.clientY - offsetY}px`;
            //     }
            // });

            // document.addEventListener('mouseup', () => {
            //     isDragging = false;
            //     document.body.style.userSelect = 'auto'; // Restore text selection
            // });


        //     const numDivs = 5;
        //     const divs = [];
        //     const bodyHeight = document.body.clientHeight;
        //     const bodyWidth = document.body.clientWidth;
        //     const gravity = 0.5;
        //     const friction = 0.95;

        //     function detectCollision(div1, div2) {
        //         return (
        //             div1.x < div2.x + 50 &&
        //             div1.x + 50 > div2.x &&
        //             div1.y < div2.y + 50 &&
        //             div1.y + 50 > div2.y
        //         );
        //     }

        //     function resolveCollision(div1, div2) {
        //         // 간단한 충돌 해결: 위치를 조정하여 겹치지 않도록 함
        //         const overlapX = (div1.x + 50 - div2.x) / 2;
        //         const overlapY = (div1.y + 50 - div2.y) / 2;

        //         if (overlapX > overlapY) {
        //             if (div1.y < div2.y) {
        //                 div1.y -= overlapY;
        //                 div2.y += overlapY;
        //             } else {
        //                 div1.y += overlapY;
        //                 div2.y -= overlapY;
        //             }
        //         } else {
        //             if (div1.x < div2.x) {
        //                 div1.x -= overlapX;
        //                 div2.x += overlapX;
        //             } else {
        //                 div1.x += overlapX;
        //                 div2.x -= overlapX;
        //             }
        //         }

        //         // 속도 교환
        //         const tempVy = div1.vy;
        //         const tempVx = div1.vx;
        //         div1.vy = div2.vy;
        //         div1.vx = div2.vx;
        //         div2.vy = tempVy;
        //         div2.vx = tempVx;
        //     }

        //     function animate() {
        //         divs.forEach(div => {
        //             div.vy += gravity;
        //             div.y += div.vy;
        //             div.x += div.vx;

        //             if (div.y + 50 > bodyHeight) {
        //                 div.y = bodyHeight - 50;
        //                 div.vy = 0; // 속도를 0으로 설정
        //                 div.vx *= friction; // 마찰력 적용
        //             }

        //             if (div.x + 50 > bodyWidth || div.x < 0) {
        //                 div.vx *= -1;
        //             }

        //             divs.forEach(otherDiv => {
        //                 if (div !== otherDiv && detectCollision(div, otherDiv)) {
        //                     resolveCollision(div, otherDiv);
        //                 }
        //             });

        //             div.element.style.top = `${div.y}px`;
        //             div.element.style.left = `${div.x}px`;
        //         });

        //         requestAnimationFrame(animate);
        //     }

        //     animate();
        // })