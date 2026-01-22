import React, { useState, useEffect, useRef, RefObject } from "react";
import styles from "./index.module.scss";
import WordLetter from "../WordLetter";
import CooldownTimer from "../CooldownTimer";
import { gsap } from "gsap";
import { LetterStatus } from "@/app/types/enums";
import { Chat, LetterStatusObject, RGBColor } from "@/app/types/types";

const BACKGROUND_COLOR = "#18181b";
const MINIMUM_CONTRAST_RATIO = 4.5;
const USERNAME_TRIM_CUTOFF = 10; // Don't trim the username if there's this many characters or less
const MAXIMUM_USERNAME_CHARACTERS = 7; // If the username is trimmed, only display this many characters

/**
 * Convert a color from hexCode to an RGB array
 * @param {string} hexCode - hex code
 * @returns {RGBColor} - Array of rgb values
 */
const hexToRGB = (hexCode: string): RGBColor => {
  hexCode = hexCode.replace("#", "");
  const r = parseInt(hexCode.substring(0, 2), 16);
  const g = parseInt(hexCode.substring(2, 4), 16);
  const b = parseInt(hexCode.substring(4, 6), 16);
  return [r, g, b];
};

/**
 * Calculate the luminance of an RGB color object
 *
 * @param {RGBColor} rgb - The color whose luinance to calculate
 * @returns {number} - The luminance of the color
 */
const rgbToLuminance = (rgb: RGBColor): number => {
  const [r, g, b] = rgb.map((val) => val / 255);
  const rLinear = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate the contrast ratio between two colors
 *
 * @param {RGBColor} color1
 * @param {RGBColor} color2
 * @returns {number} - The contrast ratio
 */
const contrastRatio = (color1: RGBColor, color2: RGBColor): number => {
  const luminance1 = rgbToLuminance(color1);
  const luminance2 = rgbToLuminance(color2);
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (brighter + 0.05) / (darker + 0.05);
};

/**
 * Adjust the input color until it has adequate contrast compared to the background color
 *
 * @param {string} hexCode - hex code of the inputted color
 * @returns {string} - hex code of the adjust contrast color
 */
const adjustConstrast = (hexCode: string): string => {
  const background = hexToRGB(BACKGROUND_COLOR);
  const color = hexToRGB(hexCode);

  const currentContrast = contrastRatio(color, background);
  if (currentContrast >= MINIMUM_CONTRAST_RATIO) {
    return hexCode; // Color already has adequate contrast
  }

  // Increase brightness of the color until contrast is met
  const adjustedColor: RGBColor = [...color];
  while (contrastRatio(adjustedColor, background) < MINIMUM_CONTRAST_RATIO) {
    for (let i = 0; i < 3; i++) {
      adjustedColor[i] = Math.min(255, adjustedColor[i] + 10);
    }
  }

  return `#${adjustedColor
    .map((val) => val.toString(16).padStart(2, "0"))
    .join("")}`;
};

type WordBlockProps = {
  chat: Chat;
  timeoutLength: number;
  answer: string;
  updateLetterStatus;
  updateLetterFoundArray;
  playWinSound: () => void;
  playWhooshSound: () => void;
};

const WordBlock: React.FC<WordBlockProps> = ({
  chat,
  timeoutLength,
  answer,
  updateLetterStatus,
  updateLetterFoundArray,
  playWinSound,
  playWhooshSound,
}) => {
  const { word, color, user } = chat;
  const [getStatusArray, setStatusArray] = useState<LetterStatus[]>(
    Array(word.length).fill(LetterStatus.Unset)
  ); // the status for each letter in the guess

  const answerLetterArray = answer.split(""); // Array of each letter in the answer string
  const wordLetterArray = word.split(""); // Array of each letter in the guess string
  const solveBonus = word.length; // Bonus points for solving the word
  const isCorrectAnswer = word === answer;
  const wordContainerRef: RefObject<HTMLDivElement | null> = useRef(null);
  const wordElementRef: RefObject<HTMLDivElement | null> = useRef(null);
  const solveBonusRef: RefObject<HTMLDivElement | null> = useRef(null);

  /**
   * Compare the guessed word with the answer and adjust the statusArray based on whether each letter is in the answer and in the right place
   */
  const initializeStatusArray = (): void => {
    const letterStatusArrayForWord: LetterStatus[] = Array(word.length).fill(
      LetterStatus.LetterNotInWord
    ); // Assume all letters are incorrect by default
    const answerCheckArray = [...answerLetterArray];

    //Loop through the letters and check if correct letter is in correct space
    for (let i = 0; i < wordLetterArray.length; i++) {
      if (wordLetterArray[i] === answerCheckArray[i]) {
        letterStatusArrayForWord[i] = LetterStatus.LetterInCorrectPlace;
        answerCheckArray[i] = "-"; //Prevent further checks from counting this found letter
      }
    }
    //Loop through the letters and check if the letter exists in other spaces
    for (let i = 0; i < answerCheckArray.length; i++) {
      let letterFound = false;
      //Check other letters in answer
      for (let j = 0; j < wordLetterArray.length && !letterFound; j++) {
        if (
          wordLetterArray[i] === answerCheckArray[j] &&
          letterStatusArrayForWord[i] !== LetterStatus.LetterInCorrectPlace
        ) {
          letterStatusArrayForWord[i] = LetterStatus.LetterInWrongPlace;
          answerCheckArray[j] = "-";
          letterFound = true;
        }
      }
    }

    setStatusArray([...letterStatusArrayForWord]);

    //send letter data to game component to update keyboard
    const letterStatusUpdate: LetterStatusObject = {};
    for (let i = 0; i < wordLetterArray.length; i++) {
      if (
        !letterStatusUpdate[wordLetterArray[i]] ||
        letterStatusUpdate[wordLetterArray[i]] < letterStatusArrayForWord[i] // If the same letter is found multiple times, get points for the higher value status
      ) {
        letterStatusUpdate[wordLetterArray[i]] = letterStatusArrayForWord[i];
      }
    }
    updateLetterStatus(letterStatusUpdate, user);
    updateLetterFoundArray(letterStatusArrayForWord);
  };

  /**
   * Play the animation of the bonus points for solving the word
   */
  const animatesolveBonus = (): void => {
    const solveBonus = solveBonusRef.current;
    if (solveBonus) {
      const tl = gsap.timeline();
      tl.fromTo(solveBonus, { opacity: 0 }, { opacity: 0, duration: 1.5 });
      tl.fromTo(
        solveBonus,
        { opacity: 1, y: 0 },
        { opacity: 0, y: -30, ease: "linear", duration: 1.5 }
      );
    }
  };

  /**
   * Animate the word guess sliding in
   */
  const animateWordEntry = (): void => {
    const wordContainer = wordContainerRef.current;
    if (wordContainer) {
      gsap.fromTo(
        wordContainer,
        { maxHeight: 0 },
        {
          maxHeight: 80,
          ease: "linear",
          duration: 0.5,
          onStart: playWhooshSound,
        }
      );
    }
  };

  /**
   * Animate the letter wave on a correct guess
   */
  const animateLettersOnWin = (): void => {
    const wordElement = wordElementRef.current;
    const wordContainer = wordContainerRef.current;
    if (wordElement && wordElement.children && wordContainer) {
      const letters = wordElement.children;
      const tl = gsap.timeline();
      tl.fromTo(letters, { y: 0 }, { y: 0, duration: 1.5 });
      tl.fromTo(
        letters,
        { y: 0 },
        {
          y: -15,
          ease: "power2",
          duration: 0.45,
          stagger: 0.15,
          onStart: playWinSound,
        }
      );
      tl.fromTo(
        letters,
        { y: -15 },
        { y: 0, ease: "power2", duration: 0.25, stagger: 0.15, delay: -0.8 }
      );
    }
  };

  /**
   * Update the status array and play the animations when the component is generated
   */
  useEffect(() => {
    initializeStatusArray();
    animateWordEntry();
    if (isCorrectAnswer) {
      animateLettersOnWin();
      animatesolveBonus();
    }
  }, []);

  return (
    <div className={styles.blockCont} ref={wordContainerRef}>
      <div className={styles.block}>
        {isCorrectAnswer ? (
          <div ref={solveBonusRef} className={styles.solveBonus}>
            +{solveBonus}
          </div>
        ) : (
          <CooldownTimer timeoutLength={timeoutLength} />
        )}
        <span className={styles.user} style={{ color: adjustConstrast(color) }}>
          {user.length <= USERNAME_TRIM_CUTOFF
            ? user
            : user.slice(0, MAXIMUM_USERNAME_CHARACTERS) + "..."}
        </span>
        <div className={styles.word} ref={wordElementRef}>
          {wordLetterArray.map((letter, index) => (
            <WordLetter
              key={index}
              letter={letter}
              status={getStatusArray[index]}
              length={word.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordBlock;
