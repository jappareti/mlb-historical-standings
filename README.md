# MLB Historical Standings Data Viz

![MLB Historical Standings Screenshot Gif](screenshot.gif?raw=true)

Data Visualization that shows each team's record above/below .500,
per division per season from 1994-2018. The center
line on the charts represent the .500 percentage of wins/loses for any given
point within the season (e.g. 40 wins and 40 losses would be .500 because 40
divided by 80 = .500).

## Motivation

My primary motivation for creating this was to learn d3. While I was flipping
through Edward Tufte's Beutiful Evidence book, I came across this sparkline data
visualization of MLB division standings for the 2004 season on pages 54-55. All
credit to the visualization goes to him, I simply wanted to take it a step
further and make it data-driven and interactive.

I thought this would be a great first project for my d3 journey because I would have to learn
how to create multiple charts, toggle between years, and practice object constancy. So here it is!

## Installation

Install the dependencies:

```sh
yarn install
```

> Note: I used `yarn` but you can just as easily switch out the `yarn` statements with
> `npm`.

## Running locally

Start up the development server with hot reloading:

```sh
yarn run dev
```

## Deploying

To generate the optimized build, simply run:

```sh
yarn run prod
```
