# Wordle on Twitch

A wordle-like game that reads Twitch chat for guesses and gives points.

Add https://wordle-on-twitch.vercel.app/?channel=[Your Twitch Username] as a browser source in your streaming application. Recommended size is 1920x1080 and downsize to fit your layout.

Note that the game is not synchronized across instances, so the only meaningful way to play is for the streamer to use a browser source or share their screen to play. Giving the URL to people in chat will not show them the same game as the streamer.

## Scoring

- 1 point for guessing a new letter that is not in the word.
- 2 points for finding a new letter that is in the word but in the wrong place. (Yellow)
- 3 points for guessing a new letter in the right place. (Green)
- 1 point for finding the right place for a yellow letter (Yellow → Green)
- Otherwise, no points for letters that were already guessed by someone.
- 5 bonus points for solving the word.

## Credits

Words List: https://github.com/Kinkelin/WordleCompetition/tree/main

Sound Effects:

[Whoosh](https://freesound.org/people/DJT4NN3R/sounds/449992/)

[Point change](https://freesound.org/people/plasterbrain/sounds/608431/)

[Card Move In/Out](https://freesound.org/people/filmfan87/sounds/108395/)

[Win Sound Effect](https://freesound.org/people/grunz/sounds/109663/)
