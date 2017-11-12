### WORKING On

* Increase physics sampling
  * Need to update the friction every time we sample
  * When applying force or velocity, need to adjust
* Adjust the force applied when you cross the middle line
* Seems like it needs to be doubled since we only apply the force once every two steps

* Should I implement the old way?
  * Where we have a separate "updatePhysics" method that gets called every frame
  * And then a separate call to


TODO
* Figure out how to handle the speed thing when a ball hits the side..

### BUGS

*

### TO-DO


* Change game to have player 1, 2, 3, 4 and Team 1, 2
* Make board width & height variables that can be set in game.js


### Ball options to implement

* Max speed
* Slow ball down after certain condition met?
  * Duration of time spent above certain speed limit
  * Number of endzone hits?


### Reactions

* Better reaction for winning around
* Multiple reactions at once for one player
  * Bunch of sad faces at once etc.
* Ability to 'hold' a reaction longer
*


### Nice-to-have

* Add 'flawless win' indicator
* Once we have this, add a reaction too
* System for tracking actions and displaying kudos, ex
  * Show "nice stall" when you slow down a ball from a high speed to a low speed
  * Can do this by putting actions into an array and parsing them out
* Track stats
  * Average shot speed
  * Fastest shot
  * Total rotations
  * Own goals






### To think about

* Powerups
  * Should we change when / how they go away?
  * Right now there's an issue where you can get a powerup but it expires before you get a chance to use it...
  * Is it really an issue?

* Right now we have a weird thing where sometimes there are more than one in play
  * Why is this happening?
  * Since it's unintentional, but fun, what are the rules?


