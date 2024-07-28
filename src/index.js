"use strict";
const elements = document.getElementsByTagName('div');
const gravityConstant = 9.8;
// class Vector2D {
//     x = 0;
//     y = 0;
//     add(this, other) {
//         return Vector2D(this.x + other.x, this.y + other.y);
//     }
// }
document.addEventListener('DOMContentLoaded', (event) => {
    Array.prototype.forEach.call(elements, (element) => {
        let isDragging = false;
        let offsetX, offsetY;
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
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
            isDragging = false;
            document.body.style.userSelect = 'auto'; // Restore text selection
        });
        function animate() {
            if (!isDragging) {
            }
            requestAnimationFrame(animate);
        }
        animate();
    });
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
