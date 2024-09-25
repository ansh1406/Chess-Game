# Chess-Game

# Overview
> This is a simple web based chess game which also comes with a auto bot . It is developed in plain JavaScript with the help of DOM (Document Object Model) , HTML and CSS . In it's development no APIs or Libraries are used.

## Features
> Five different Game Modes

> Minimalist User Interface

> Highlights valid moves

> Check warning

> Automatic Checkmate and Stalemate detection

> Undo and Redo feature

> A clever bot to play against with

> Automatically adjusts according to screen size 

## Gamemodes 
> Player vs Player

> Player vs Computer
>
> >Very Easy
>
> >Easy
>
> >Medium

> Computer vs Computer

## Documentation

>### Classes

> > #### Board
> > Contaions all the information about current game including gamemode , no of moves , history of moves , cell data and current side along with functions for undo , redo , reset , check detection , checkmate detection , stalemate detection and performing a pawn promotion .

> > #### Cell
> > Contaions the information about currently stored piece and correrpoding DOM element along with functions for DOM click event , checking if a certain piece can reach that cell and what to do if the cell is selected.

> > #### Piece
> > Contaions all the informotion about a piece including it's side(color) , type , current location , points and if the piece is moved in past or not along with functions for checking valid moves for that piece and moving that piece to another cell.

> > #### Move
> > Contains information about cells the move has taken place between and captured piece(if any) in that move along with function for checking possibility of casteling , pawn promotion , undo that move and update the cells affected by that move.

> ### Functions

> > #### Opposite of side
> > Returns opposite of the passed side . white for black and black in case of white.

> > #### Auto Bot
> > Performs a valid moves based on mechanism that works on the base of point system . It can choose the best moves by reading upto 3 future moves.

> ### Constants

> > URLs of images , string for piece side and type.
