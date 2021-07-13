ccg.js
======

![cards](Cards.png)

A framework for display and deck building on the command-line.

I used to play Magic when it was new along with Rage and some other CCGs and even was the subject for a card in the Arcadia card game. Now that I'm a parent, I taught my daughter Magic and plan to use this as a gateway to programming.

Someday I may even integrate matchmaking and basic game mechanics.

Installation
------------

`npm install ccg-cli`

Magic
-----

Display an image of the `Vesuvan Doppelganger`

```bash
ccg -g mtg lookup "Vesuvan Doppelganger"
```

List the cards from `Arabian Nights` and `Unlimited` which are still legal to play (filters are [Mongo Query Documents](https://docs.mongodb.com/manual/tutorial/query-documents/)).

```bash
ccg -g mtg list "set:arabian nights+set:unlimited edition" -f '{"legalities.standard":{"$eq":"legal"}}'
```
