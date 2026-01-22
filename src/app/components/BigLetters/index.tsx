import React, { RefObject, useEffect, useRef } from "react";
import styles from "./index.module.scss";
import BigLetter from "../BigLetterItem";
import { gsap } from "gsap";

type BigLettersProps = {
  answer: string;
  letterFoundArray: boolean[];
  isWordFound: boolean;
  playCardSounds: (number) => void;
};

const LETTER_MARGIN_RIGHT = "min(20px, 1.25vw)";

const BigLetters: React.FC<BigLettersProps> = ({
  answer,
  letterFoundArray,
  isWordFound,
  playCardSounds,
}) => {
  const answerLettersArray = answer.split("");
  const contRef: RefObject<HTMLDivElement | null> = useRef(null);

  /**
   * Animate the letters leaving the board
   */
  const bringLettersOut = () => {
    const letterContainer = contRef.current;
    if (letterContainer && letterContainer.children.length) {
      const letters = letterContainer.children;
      const tl = gsap.timeline();
      tl.fromTo(letters, { y: 0 }, { y: 0, ease: "power2", duration: 3.5 });
      tl.fromTo(
        letters,
        { y: 0 },
        {
          y: -200,
          ease: "sine.in",
          duration: 0.5,
          stagger: 0.1,
          onStart: playCardSounds,
        }
      );
    }
  };

  /**
   * Animate the letters entering the board
   */
  const bringLettersIn = () => {
    const letterContainer = contRef.current;
    if (letterContainer && letterContainer.children.length) {
      const letters = letterContainer.children;
      const tl = gsap.timeline();
      tl.fromTo(
        letters,
        { y: 200 },
        {
          y: 0,
          ease: "power2",
          duration: 0.75,
          stagger: 0.1,
          onStart: playCardSounds,
        }
      );
    }
  };

  /**
   * Bring the letters in or out when the value of isWordFound changes and on the initial mounting of the component
   */
  useEffect(() => {
    if (isWordFound === false) {
      bringLettersIn();
    } else {
      bringLettersOut();
    }
  }, [isWordFound, contRef?.current?.children]);

  return (
    <div className={styles.bigLetters} ref={contRef}>
      {answerLettersArray.map((letter, index) => (
        <BigLetter
          key={index}
          letter={letter}
          isLetterFound={letterFoundArray[index]}
          width={`calc((100% - (${LETTER_MARGIN_RIGHT}*${answer.length - 1}))/${
            answer.length
          })`}
        />
      ))}
    </div>
  );
};

export default BigLetters;
