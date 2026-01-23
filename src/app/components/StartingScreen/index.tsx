import React, { ChangeEvent, useState } from "react";
import styles from "./index.module.scss";

type StartingScreenProps = {
  connectToChannel: (channel: string) => void;
  playOffline: () => void;
};

const StartingScreen: React.FC<StartingScreenProps> = ({
  connectToChannel,
  playOffline,
}) => {
  const [getChannel, setChannel] = useState(""); // Current connected channel

  /**
   * Update the state when the input field changes
   *
   * @param event
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChannel(event.target.value);
  };

  /**
   * When a key is pressed, check if it's enter, and process it as a button click if it is
   *
   * @param event
   */
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleButtonClick();
    }
  };

  /**
   * When the connect button is clicked, call the function to connect to the channel that's entered
   */
  const handleButtonClick = () => {
    connectToChannel(getChannel.toLowerCase());
  };

  /**
   * When the play offline button is clicked, call the function to set up offline play
   */
  const handleOfflineButtonClick = () => {
    playOffline();
  };

  return (
    <>
      <h1 className={styles.title}>Wordle on Twitch 🟩</h1>
      <div className={styles.channelInput}>
        <span className={styles.text}>Insert Twitch Channel: </span>
        <input
          type="text"
          id="userInput"
          name="userInput"
          className={styles.input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          value={getChannel}
        ></input>
        <button className={styles.button} onClick={handleButtonClick}>
          Connect
        </button>
      </div>
      <button className={styles.button} onClick={handleOfflineButtonClick}>
        Play Without Connecting
      </button>
    </>
  );
};

export default StartingScreen;
