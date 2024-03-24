'use client'

import { useState } from "react";
import styles from "./style.module.css";

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicked, setIsClicked] = useState("HAYWARD KIM");

  const mouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top; 
    var rotateY = -1/100 * x + 5;
    var rotateX = 1/10 * y - 15;
    e.target.style = `transform : perspective(350px) rotateX(${rotateX}deg) rotateY(${rotateY}deg); scale : 125%;`;
  }

  const mouseLeave = (e: any) => {
    setIsHovering(false);
    e.target.style = `transform : perspective(350px) rotateX(0deg) rotateY(0deg); transition : 0.5s;`;
  } 


  return (
    <main className={styles.main}>
        {/* <div className={styles.edgeTopLeft}></div> */}
        <div className={styles.name} onMouseEnter={() => setIsHovering(true)} onMouseMove={mouseMove} onMouseLeave={mouseLeave} onMouseUp={() => setIsClicked(isClicked == "HAYWARD KIM" ? "Kim Hyoung Seok" : "HAYWARD KIM")}>
          {isClicked}
        </div>
        {/* <div className={styles.name} onMouseEnter={() => setIsHovering(true)} onMouseMove={mouseMove} onMouseLeave={mouseLeave} onMouseUp={() => setIsClicked(isClicked == "HAYWARD KIM" ? "Kim Hyoung Seok" : "HAYWARD KIM")}>
          {isClicked}
        </div>
        <div className={styles.name} onMouseEnter={() => setIsHovering(true)} onMouseMove={mouseMove} onMouseLeave={mouseLeave} onMouseUp={() => setIsClicked(isClicked == "HAYWARD KIM" ? "Kim Hyoung Seok" : "HAYWARD KIM")}>
          {isClicked}
        </div> */}
  </main>
  );
}
