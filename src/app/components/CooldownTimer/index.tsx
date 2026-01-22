import React, { RefObject, useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./index.module.scss";

type CooldownTimerProps = {
  timeoutLength: number;
};

const CooldownTimer: React.FC<CooldownTimerProps> = ({ timeoutLength }) => {
  const timerCircleRef: RefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    function startCooldownTimer() {
      const timerCircle = timerCircleRef.current;

      const tl = gsap.timeline();

      // Animate the timer circle counterclockwise over three seconds
      tl.to(timerCircle, {
        "--p": "100",
        duration: timeoutLength / 1000,
        ease: "linear",
      });
      tl.to(timerCircle, {
        "--c": "#88ff88",
        duration: 0,
        ease: "linear",
      });
      tl.to(timerCircle, {
        opacity: 0,
        duration: 0.3,
        ease: "linear",
      });
    }

    startCooldownTimer();
  }, []);

  return <div ref={timerCircleRef} className={styles.cooldownTimer}></div>;
};

export default CooldownTimer;
